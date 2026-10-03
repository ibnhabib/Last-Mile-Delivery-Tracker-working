import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { ApiResponse, PaginatedData, Order } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f6ad55', PICKED_UP: '#4299e1', IN_TRANSIT: '#9f7aea',
  OUT_FOR_DELIVERY: '#48bb78', DELIVERED: '#38a169', FAILED: '#fc8181',
};

export default function CustomerOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: initialStatus, search: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const statusFromUrl = searchParams.get('status') || '';
    if (statusFromUrl !== filters.status) {
      setFilters(f => ({ ...f, status: statusFromUrl }));
    }
  }, [searchParams]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);

    try {
      const res = await api.get<ApiResponse<PaginatedData>>(`/orders?${params}`);
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(f => ({ ...f, [key]: value }));
    if (key === 'status') {
      if (value) searchParams.set('status', value);
      else searchParams.delete('status');
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="page animate-slide-in">
      <div className="page-header">
        <h1>{filters.status ? `${filters.status.replace(/_/g, ' ')} Orders` : 'All Orders'}</h1>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => navigate('/customer/dashboard')}>← Back to Dashboard</button>
          <button className="btn btn-primary" onClick={() => navigate('/customer/orders/new')}>+ New Order</button>
        </div>
      </div>

      <div className="filter-bar glass-card">
        <input placeholder="🔍 Search tracking ID or address..." value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)} />
        <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <div className="table-wrapper glass-card">
          <table>
            <thead>
              <tr><th>Tracking ID</th><th>From → To</th><th>Type</th><th>Payment</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>No orders found.</td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} onClick={() => navigate(`/customer/orders/${o.id}`)} className="clickable-row">
                    <td><strong>{o.trackingId}</strong></td>
                    <td>{o.pickupArea} → {o.dropArea}</td>
                    <td><span className="badge badge-outline">{o.orderType}</span></td>
                    <td><span className="badge badge-outline">{o.paymentType}</span></td>
                    <td>₹{Number(o.totalCharge).toFixed(2)}</td>
                    <td><span className="badge" style={{ background: (STATUS_COLORS[o.status] || '#666') + '22', color: STATUS_COLORS[o.status] }}>{o.status.replace(/_/g, ' ')}</span></td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-sm btn-outline" disabled={pagination.page <= 1} onClick={() => fetchOrders(pagination.page - 1)}>← Prev</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-sm btn-outline" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchOrders(pagination.page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}