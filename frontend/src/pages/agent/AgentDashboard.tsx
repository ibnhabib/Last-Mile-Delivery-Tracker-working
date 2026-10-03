import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ApiResponse, PaginatedData, Order, DeliveryAgent } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f6ad55', PICKED_UP: '#4299e1', IN_TRANSIT: '#9f7aea',
  OUT_FOR_DELIVERY: '#48bb78', DELIVERED: '#38a169', FAILED: '#fc8181',
};

const NEXT_STATUS: Record<string, string[]> = {
  PENDING: ['PICKED_UP'], PICKED_UP: ['IN_TRANSIT'], IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
};

const AVAILABILITY_COLORS: Record<string, string> = {
  AVAILABLE: '#38a169', BUSY: '#f6ad55', OFFLINE: '#fc8181',
};

export default function AgentDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agent, setAgent] = useState<DeliveryAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [ordersRes, agentRes] = await Promise.all([
        api.get<ApiResponse<PaginatedData>>('/orders?limit=50'),
        api.get<ApiResponse<DeliveryAgent>>('/agents/me'),
      ]);
      setOrders(ordersRes.data.orders);
      setAgent(agentRes.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const updateAvailability = async (status: string) => {
    if (!agent) return;
    setActionLoading('status');
    try {
      await api.patch(`/agents/${agent.id}/status`, { status });
      setMsg(`Status updated to ${status}`);
      fetchData();
    } catch { }
    finally { setActionLoading(''); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setMsg('Order status updated!');
      fetchData();
    } catch (err: any) { setMsg(err.message); }
    finally { setActionLoading(''); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const activeOrders = orders.filter(o => !['DELIVERED', 'FAILED'].includes(o.status));
  const completedOrders = orders.filter(o => ['DELIVERED', 'FAILED'].includes(o.status));

  return (
    <div className="page">
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="page-header">
        <h1>Agent Dashboard</h1>
        {agent && (
          <div className="agent-status-bar">
            <span>Status: </span>
            <span className="badge badge-lg" style={{ background: (AVAILABILITY_COLORS[agent.status] || '#666') + '22', color: AVAILABILITY_COLORS[agent.status] }}>
              {agent.status}
            </span>
          </div>
        )}
      </div>

      {/* Availability Controls */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>⚡ My Availability</h3>
        <div className="btn-group">
          {['AVAILABLE', 'BUSY', 'OFFLINE'].map(s => (
            <button key={s} className={`btn ${agent?.status === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => updateAvailability(s)} disabled={actionLoading === 'status' || agent?.status === s}>
              {s}
            </button>
          ))}
        </div>
        {agent?.zone && <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Zone: {agent.zone.name} | Area: {agent.currentArea || 'N/A'}</p>}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div 
          className="stat-card glass-card interactive-card" 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate('/agent/orders')}
        >
          <p className="stat-label">Total Assigned</p>
          <p className="stat-value" style={{ color: '#667eea' }}>{orders.length}</p>
        </div>
        <div 
          className="stat-card glass-card interactive-card" 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate('/agent/orders?status=PENDING')}
        >
          <p className="stat-label">Pending / Active</p>
          <p className="stat-value" style={{ color: '#f6ad55' }}>{activeOrders.length}</p>
        </div>
        <div 
          className="stat-card glass-card interactive-card" 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate('/agent/orders?status=DELIVERED')}
        >
          <p className="stat-label">Completed</p>
          <p className="stat-value" style={{ color: '#38a169' }}>{completedOrders.length}</p>
        </div>
      </div>

      {/* Active Orders */}
      <div className="section">
        <h2>Active Deliveries ({activeOrders.length})</h2>
        {activeOrders.length === 0 ? (
          <div className="empty-state glass-card"><p>No active deliveries assigned to you.</p></div>
        ) : (
          <div className="order-cards">
            {activeOrders.map(o => (
              <div key={o.id} className="order-card glass-card">
                <div className="order-card-header">
                  <strong>{o.trackingId}</strong>
                  <span className="badge" style={{ background: (STATUS_COLORS[o.status] || '#666') + '22', color: STATUS_COLORS[o.status] }}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p>{o.pickupArea} → {o.dropArea}</p>
                <p className="text-muted">{o.dropAddress}</p>
                <div className="btn-group" style={{ marginTop: '0.75rem' }}>
                  {NEXT_STATUS[o.status]?.map(s => (
                    <button key={s} className="btn btn-sm btn-primary" onClick={() => updateOrderStatus(o.id, s)}
                      disabled={actionLoading === o.id}>→ {s.replace(/_/g, ' ')}</button>
                  ))}
                  <button className="btn btn-sm btn-outline" onClick={() => navigate(`/agent/orders/${o.id}`)}>Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}