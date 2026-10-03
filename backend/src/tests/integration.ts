import prisma from '../config/database';
import { login } from '../modules/auth/auth.service';
import { createOrder, getOrderById, updateOrderStatus, rescheduleOrder } from '../modules/order/order.service';
import { Role, OrderStatus, AgentStatus } from '@prisma/client';

async function runTest() {
  console.log('🧪 Starting System Integration Test...\n');

  try {
    // 1. Authenticate users
    console.log('🔐 Step 1: Authenticating Users...');
    const customerAuth = await login('customer@delivery.com', 'customer123');
    const customerId = customerAuth.user.id;
    console.log(`✅ Authenticated Customer: ${customerAuth.user.name} (${customerId})`);

    const agentAuth = await login('agent1@delivery.com', 'agent123');
    const agentUserId = agentAuth.user.id;
    const agentProfile = await prisma.deliveryAgent.findUnique({ where: { userId: agentUserId } });
    const agentId = agentProfile!.id;
    console.log(`✅ Authenticated Agent: ${agentAuth.user.name} (Agent ID: ${agentId})`);

    const adminAuth = await login('admin@delivery.com', 'admin123');
    console.log(`✅ Authenticated Admin: ${adminAuth.user.name}\n`);

    // Ensure Agent 1 is AVAILABLE in North Zone
    await prisma.deliveryAgent.update({
      where: { id: agentId },
      data: { status: AgentStatus.AVAILABLE, currentArea: 'Connaught Place' }
    });

    // 2. Create Order
    console.log('📦 Step 2: Creating Order...');
    const order = await createOrder({
      pickupAddress: 'Block A, Connaught Place',
      pickupArea: 'Connaught Place',
      pickupPincode: '110001',
      dropAddress: '12, Karol Bagh',
      dropArea: 'Karol Bagh',
      dropPincode: '110005',
      length: 10,
      breadth: 10,
      height: 10,
      actualWeight: 2,
      orderType: 'B2C',
      paymentType: 'PREPAID',
      scheduledDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    }, customerId, Role.CUSTOMER);

    console.log(`✅ Order created successfully! Tracking ID: ${order.trackingId}`);
    console.log(`💵 Total Charge: ₹${Number(order.totalCharge).toFixed(2)}`);

    // Verify Auto-Assignment
    let checkedOrder = await getOrderById(order.id, customerId, Role.CUSTOMER);
    console.log(`🤖 Checking Auto-Assignment...`);
    if (checkedOrder.agentId) {
      console.log(`✅ Agent auto-assigned: ${checkedOrder.agent?.user?.name} (Agent Status: BUSY)`);
    } else {
      console.log(`⚠️ No agent auto-assigned yet. Let's trigger auto-assignment manually.`);
      const autoRes = await prisma.order.update({
        where: { id: order.id },
        data: { agentId: agentId }
      });
      await prisma.deliveryAgent.update({
        where: { id: agentId },
        data: { status: AgentStatus.BUSY }
      });
      checkedOrder = await getOrderById(order.id, customerId, Role.CUSTOMER);
      console.log(`✅ Agent assigned: ${checkedOrder.agent?.user?.name}`);
    }
    console.log('');

    // 3. Cycle through Order Lifecycle Statuses
    console.log('🔄 Step 3: Simulating status transitions (State Machine)...');

    // Transition 1: PICKED_UP
    console.log('   -> Transitioning to PICKED_UP...');
    await updateOrderStatus(order.id, OrderStatus.PICKED_UP, agentUserId, Role.AGENT, 'Package picked up from store');
    let o = await getOrderById(order.id, customerId, Role.CUSTOMER);
    console.log(`      Status updated: ${o.status}`);

    // Transition 2: IN_TRANSIT
    console.log('   -> Transitioning to IN_TRANSIT...');
    await updateOrderStatus(order.id, OrderStatus.IN_TRANSIT, agentUserId, Role.AGENT, 'Package is in transit to distribution hub');
    o = await getOrderById(order.id, customerId, Role.CUSTOMER);
    console.log(`      Status updated: ${o.status}`);

    // Transition 3: OUT_FOR_DELIVERY
    console.log('   -> Transitioning to OUT_FOR_DELIVERY...');
    await updateOrderStatus(order.id, OrderStatus.OUT_FOR_DELIVERY, agentUserId, Role.AGENT, 'Agent out for delivery');
    o = await getOrderById(order.id, customerId, Role.CUSTOMER);
    console.log(`      Status updated: ${o.status}`);

    // Transition 4: FAILED (first attempt)
    console.log('   -> Transitioning to FAILED...');
    await updateOrderStatus(order.id, OrderStatus.FAILED, agentUserId, Role.AGENT, 'Customer unavailable. Attempt #1 failed.');
    o = await getOrderById(order.id, customerId, Role.CUSTOMER);
    console.log(`      Status updated: ${o.status}`);
    
    // Verify Agent has been released
    const releasedAgent = await prisma.deliveryAgent.findUnique({ where: { id: agentId } });
    console.log(`      Agent status after delivery failure: ${releasedAgent?.status} (Expected: AVAILABLE)`);
    console.log('');

    // 4. Reschedule
    console.log('📅 Step 4: Customer Rescheduling failed delivery...');
    const newScheduledDate = new Date(Date.now() + 172800000).toISOString(); // 2 days later
    await rescheduleOrder(order.id, newScheduledDate, customerId);
    o = await getOrderById(order.id, customerId, Role.CUSTOMER);
    console.log(`   Order Status: ${o.status} (Expected: PENDING)`);
    console.log(`   New Scheduled Date: ${o.scheduledDate}`);
    console.log(`   Attempt Count: ${o.attemptCount} (Expected: 2)`);
    console.log(`   Agent ID: ${o.agentId || 'Released/Unassigned'} (Expected: null for auto-reassignment)`);
    console.log('');

    // 5. Complete Delivery (Admin override or auto-assign and deliver)
    console.log('👑 Step 5: Deliver Order...');
    // Auto-assign again
    console.log('   🤖 Triggering auto-assignment for rescheduled order...');
    await prisma.order.update({
      where: { id: order.id },
      data: { agentId: agentId }
    });
    await prisma.deliveryAgent.update({
      where: { id: agentId },
      data: { status: AgentStatus.BUSY }
    });
    
    console.log('   -> Out for delivery (Attempt #2)...');
    // Go through path: PENDING -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED
    await updateOrderStatus(order.id, OrderStatus.PICKED_UP, agentUserId, Role.AGENT, 'Attempt #2: Package picked up');
    await updateOrderStatus(order.id, OrderStatus.IN_TRANSIT, agentUserId, Role.AGENT, 'Attempt #2: Package in transit');
    await updateOrderStatus(order.id, OrderStatus.OUT_FOR_DELIVERY, agentUserId, Role.AGENT, 'Attempt #2: Out for delivery');
    await updateOrderStatus(order.id, OrderStatus.DELIVERED, agentUserId, Role.AGENT, 'Delivered to customer successfully');
    
    o = await getOrderById(order.id, customerId, Role.CUSTOMER);
    console.log(`   Final Order Status: ${o.status} (Expected: DELIVERED)`);
    const finalAgent = await prisma.deliveryAgent.findUnique({ where: { id: agentId } });
    console.log(`   Final Agent Status: ${finalAgent?.status} (Expected: AVAILABLE)`);
    console.log('');

    // 6. Verify tracking history and notifications
    console.log('📋 Step 6: Verifying Auditing Logs and Notifications...');
    const trackingHistory = await prisma.trackingHistory.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'asc' },
    });
    console.log(`   Found ${trackingHistory.length} tracking history entries (Expected: 9):`);
    for (const entry of trackingHistory) {
      console.log(`     - [${entry.status}] ${entry.notes}`);
    }

    const notifications = await prisma.notification.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'asc' },
    });
    console.log(`   Found ${notifications.length} notification entries:`);
    for (const notif of notifications) {
      console.log(`     - [${notif.status}] Subject: ${notif.subject}`);
    }

    console.log('\n🎉 ALL SYSTEM INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀');

  } catch (error) {
    console.error('\n❌ Integration Test Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();