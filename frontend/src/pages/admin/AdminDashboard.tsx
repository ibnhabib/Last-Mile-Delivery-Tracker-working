import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f6ad55', PICKED_UP: '#4299e1', IN_TRANSIT: '#9f7aea',
  OUT_FOR_DELIVERY: '#48bb78', DELIVERED: '#38a169', FAILED: '#fc8181',
};

export default function AdminDashboard() {
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch a large page just to get accurate stats for the dashboard
        const res = await api.get<any>(`/orders?page=1&limit=500`);
        const orders = res.data.orders || [];
        setTotalOrders(res.data.pagination.total);
        
        const counts = orders.reduce((acc: any, o: any) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        }, {});
        setStatusCounts(counts);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="page animate-slide-in">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/orders/new')}>+ New Order</button>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <div className="stats-grid">
          <div 
            className="stat-card glass-card interactive-card" 
            style={{ cursor: 'pointer' }} 
            onClick={() => navigate('/admin/orders')}
          >
            <p className="stat-label">📈 Total Orders</p>
            <p className="stat-value" style={{ color: '#818cf8' }}>{totalOrders}</p>
          </div>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div 
              key={status} 
              className="stat-card glass-card interactive-card" 
              style={{ cursor: 'pointer' }} 
              onClick={() => navigate(`/admin/orders?status=${status}`)}
            >
              <p className="stat-label">{status.replace(/_/g, ' ')}</p>
              <p className="stat-value" style={{ color }}>{statusCounts[status] || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}