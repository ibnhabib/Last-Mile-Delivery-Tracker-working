import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import TrackingTimeline from '../../components/common/TrackingTimeline';

interface TrackingEntry {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  user?: { name: string; role: string };
}

interface OrderDetails {
  id: string;
  trackingId: string;
  status: string;
  pickupAddress: string;
  pickupArea: string;
  pickupPincode: string;
  dropAddress: string;
  dropArea: string;
  dropPincode: string;
  orderType: string;
  paymentType: string;
  totalCharge: number | string;
  createdAt: string;
  scheduledDate: string | null;
  trackingHistory: TrackingEntry[];
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f6ad55',
  PICKED_UP: '#4299e1',
  IN_TRANSIT: '#9f7aea',
  OUT_FOR_DELIVERY: '#48bb78',
  DELIVERED: '#38a169',
  FAILED: '#fc8181',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const basePath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'AGENT' ? '/agent' : '/customer';

  useEffect(() => {
    if (!id) {
      setError('Order ID is missing.');
      setLoading(false);
      return;
    }

    api.get<ApiResponse<OrderDetails>>(`/orders/${id}`)
      .then(response => setOrder(response.data))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  if (error || !order) {
    return (
      <div className="page">
        <div className="alert alert-error">{error || 'Order not found.'}</div>
        <button className="btn btn-outline" onClick={() => navigate(`${basePath}/orders`)}>Back to Orders</button>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[order.status] || '#a0a0c0';

  return (
    <div className="page animate-slide-in">
      <div className="page-header">
        <div>
          <p className="text-muted">Order details</p>
          <h1>{order.trackingId}</h1>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(`${basePath}/orders`)}>← Back to Orders</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <p className="stat-label">Status</p>
          <p className="stat-value" style={{ color: statusColor }}>{order.status.replace(/_/g, ' ')}</p>
        </div>
        <div className="stat-card glass-card">
          <p className="stat-label">Delivery Charge</p>
          <p className="stat-value">₹{Number(order.totalCharge).toFixed(2)}</p>
        </div>
        <div className="stat-card glass-card">
          <p className="stat-label">Order Type</p>
          <p className="stat-value">{order.orderType} · {order.paymentType}</p>
        </div>
        <div className="stat-card glass-card">
          <p className="stat-label">Created</p>
          <p className="stat-value">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="management-grid">
        <section className="glass-card" style={{ padding: '1.5rem' }}>
          <h2>Pickup</h2>
          <p>{order.pickupAddress}</p>
          <p className="text-muted">{order.pickupArea} · {order.pickupPincode}</p>
        </section>
        <section className="glass-card" style={{ padding: '1.5rem' }}>
          <h2>Delivery</h2>
          <p>{order.dropAddress}</p>
          <p className="text-muted">{order.dropArea} · {order.dropPincode}</p>
        </section>
      </div>

      {order.scheduledDate && (
        <p className="text-muted">Scheduled for {new Date(order.scheduledDate).toLocaleString()}</p>
      )}

      <section className="section">
        <h2>Tracking History</h2>
        {order.trackingHistory.length
          ? <TrackingTimeline entries={order.trackingHistory} />
          : <p className="text-muted">No tracking updates yet.</p>}
      </section>

      <Link className="btn btn-outline" to={`${basePath}/orders`}>Back to Orders</Link>
    </div>
  );
}