import { PrismaClient, Role, AgentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (order matters due to FK constraints)
  await prisma.notification.deleteMany();
  await prisma.trackingHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.deliveryAgent.deleteMany();
  await prisma.area.deleteMany();
  await prisma.rateCard.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('admin123', 12);
  const customerHash = await bcrypt.hash('customer123', 12);
  const agentHash = await bcrypt.hash('agent123', 12);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@delivery.com',
      password: passwordHash,
      phone: '9999999999',
      role: Role.ADMIN,
      isVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  const customer = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'customer@delivery.com',
      password: customerHash,
      phone: '9876543210',
      role: Role.CUSTOMER,
      isVerified: true,
    },
  });
  console.log('✅ Customer created:', customer.email);

  const customer2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'customer2@delivery.com',
      password: customerHash,
      phone: '9876543211',
      role: Role.CUSTOMER,
      isVerified: true,
    },
  });
  console.log('✅ Customer 2 created:', customer2.email);

  const agentUser1 = await prisma.user.create({
    data: {
      name: 'Vikram Singh',
      email: 'agent1@delivery.com',
      password: agentHash,
      phone: '9111111111',
      role: Role.AGENT,
      isVerified: true,
    },
  });

  const agentUser2 = await prisma.user.create({
    data: {
      name: 'Amit Kumar',
      email: 'agent2@delivery.com',
      password: agentHash,
      phone: '9222222222',
      role: Role.AGENT,
      isVerified: true,
    },
  });

  // 2. Create Zones
  const northZone = await prisma.zone.create({
    data: { name: 'North Zone', description: 'Delhi NCR and surrounding areas' },
  });

  const southZone = await prisma.zone.create({
    data: { name: 'South Zone', description: 'Bangalore and surrounding areas' },
  });

  const eastZone = await prisma.zone.create({
    data: { name: 'East Zone', description: 'Kolkata and surrounding areas' },
  });
  console.log('✅ 3 Zones created');

  // 3. Create Areas (2 per zone)
  const areas = await Promise.all([
    prisma.area.create({ data: { name: 'Connaught Place', pincode: '110001', zoneId: northZone.id } }),
    prisma.area.create({ data: { name: 'Karol Bagh', pincode: '110005', zoneId: northZone.id } }),
    prisma.area.create({ data: { name: 'Koramangala', pincode: '560034', zoneId: southZone.id } }),
    prisma.area.create({ data: { name: 'Indiranagar', pincode: '560038', zoneId: southZone.id } }),
    prisma.area.create({ data: { name: 'Salt Lake', pincode: '700091', zoneId: eastZone.id } }),
    prisma.area.create({ data: { name: 'Park Street', pincode: '700016', zoneId: eastZone.id } }),
  ]);
  console.log('✅ 6 Areas created');

  // 4. Create Rate Cards
  await Promise.all([
    prisma.rateCard.create({
      data: { orderType: 'B2B', zoneType: 'INTRA_ZONE', baseRate: 50, perKgRate: 10, codSurcharge: 25 },
    }),
    prisma.rateCard.create({
      data: { orderType: 'B2B', zoneType: 'INTER_ZONE', baseRate: 100, perKgRate: 15, codSurcharge: 35 },
    }),
    prisma.rateCard.create({
      data: { orderType: 'B2C', zoneType: 'INTRA_ZONE', baseRate: 40, perKgRate: 12, codSurcharge: 20 },
    }),
    prisma.rateCard.create({
      data: { orderType: 'B2C', zoneType: 'INTER_ZONE', baseRate: 80, perKgRate: 18, codSurcharge: 30 },
    }),
  ]);
  console.log('✅ 4 Rate Cards created');

  // 5. Create Delivery Agents
  await prisma.deliveryAgent.create({
    data: {
      userId: agentUser1.id,
      zoneId: northZone.id,
      status: AgentStatus.AVAILABLE,
      currentArea: 'Connaught Place',
    },
  });

  await prisma.deliveryAgent.create({
    data: {
      userId: agentUser2.id,
      zoneId: southZone.id,
      status: AgentStatus.AVAILABLE,
      currentArea: 'Koramangala',
    },
  });
  console.log('✅ 2 Delivery Agents created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:    admin@delivery.com / admin123');
  console.log('  Customer: customer@delivery.com / customer123');
  console.log('  Agent 1:  agent1@delivery.com / agent123');
  console.log('  Agent 2:  agent2@delivery.com / agent123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });