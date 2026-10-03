import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ApiResponse, PaginatedData } from '../../types';

export default function CustomerDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<ApiResponse<PaginatedData>>('/orders?limit=500')
      .then(res => {
        const orders = res.data.orders || [];
        setStats({
          total: res.data.pagination.total,
          pending: orders.filter(o => o.status === 'PENDING').length,
          inTransit: orders.filter(o => ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
          delivered: orders.filter(o => o.status === 'DELIVERED').length,
          failed: orders.filter(o => o.status === 'FAILED').length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page animate-slide-in">
      <div className="page-header">
        <h1>My Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/customer/orders/new')}>+ New Order</button>
      </div>

      <div className="stats-grid">
        <div 
          className="stat-card glass-card interactive-card" 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate('/customer/orders')}
        >
          <p className="stat-label">Total Orders</p>
          <p className="stat-value" style={{ color: '#667eea' }}>{stats.total}</p>
        </div>
        <div 
          className="stat-card glass-card interactive-card" 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate('/customer/orders?status=PENDING')}
        >
          <p className="stat-label">Pending</p>
          <p className="stat-value" style={{ color: '#f6ad55' }}>{stats.pending}</p>
        </div>
        <div 
          className="stat-card glass-card interactive-card" 
          style={{ cursor: 'pointer' }} 
          // Since "inTransit" spans multiple statuses, redirecting to just IN_TRANSIT for now
          onClick={() => navigate('/customer/orders?status=IN_TRANSIT')}
        >
          <p className="stat-label">In Transit</p>
          <p className="stat-value" style={{ color: '#9f7aea' }}>{stats.inTransit}</p>
        </div>
        <div 
          className="stat-card glass-card interactive-card" 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate('/customer/orders?status=DELIVERED')}
        >
          <p className="stat-label">Delivered</p>
          <p className="stat-value" style={{ color: '#38a169' }}>{stats.delivered}</p>
        </div>
        <div 
          className="stat-card glass-card interactive-card" 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate('/customer/orders?status=FAILED')}
        >
          <p className="stat-label">Failed</p>
          <p className="stat-value" style={{ color: '#fc8181' }}>{stats.failed}</p>
        </div>
      </div>
    </div>
  );
}