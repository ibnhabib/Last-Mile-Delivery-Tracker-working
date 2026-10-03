import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ApiResponse, ChargeBreakdown } from '../../types';

export default function CreateOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const [form, setForm] = useState({
    pickupAddress: '', pickupArea: '', pickupPincode: '',
    dropAddress: '', dropArea: '', dropPincode: '',
    length: '', breadth: '', height: '', actualWeight: '',
    orderType: 'B2C', paymentType: 'PREPAID', customerId: '',
  });
  const [charges, setCharges] = useState<ChargeBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setCharges(null); // Reset charges on form change
  };

  const calculateCharges = async () => {
    setError('');
    setCalcLoading(true);
    try {
      const res = await api.post<ApiResponse<ChargeBreakdown>>('/orders/calculate', {
        pickupArea: form.pickupArea, pickupPincode: form.pickupPincode,
        dropArea: form.dropArea, dropPincode: form.dropPincode,
        length: parseFloat(form.length), breadth: parseFloat(form.breadth),
        height: parseFloat(form.height), actualWeight: parseFloat(form.actualWeight),
        orderType: form.orderType, paymentType: form.paymentType,
      });
      setCharges(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCalcLoading(false);
    }
  };

  const confirmOrder = async () => {
    setError('');
    setLoading(true);
    try {
      const body: any = {
        pickupAddress: form.pickupAddress, pickupArea: form.pickupArea, pickupPincode: form.pickupPincode,
        dropAddress: form.dropAddress, dropArea: form.dropArea, dropPincode: form.dropPincode,
        length: parseFloat(form.length), breadth: parseFloat(form.breadth),
        height: parseFloat(form.height), actualWeight: parseFloat(form.actualWeight),
        orderType: form.orderType, paymentType: form.paymentType,
      };
      if (isAdmin && form.customerId) body.customerId = form.customerId;

      const res = await api.post<ApiResponse<any>>('/orders', body);
      setSuccess(`Order created! Tracking ID: ${res.data.trackingId}`);
      setTimeout(() => navigate(isAdmin ? `/admin/orders/${res.data.id}` : `/customer/orders/${res.data.id}`), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canCalculate = form.pickupArea && form.pickupPincode && form.dropArea && form.dropPincode &&
    form.length && form.breadth && form.height && form.actualWeight;

  return (
    <div className="page">
      <div className="page-header"><h1>{isAdmin ? 'Create Order (Admin)' : 'Create New Order'}</h1></div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-grid">
        <div className="form-section glass-card">
          <h3>📍 Pickup Details</h3>
          <div className="form-group">
            <label>Address</label>
            <input value={form.pickupAddress} onChange={e => update('pickupAddress', e.target.value)} placeholder="Full pickup address" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Area Name</label>
              <input value={form.pickupArea} onChange={e => update('pickupArea', e.target.value)} placeholder="e.g., Connaught Place" required />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input value={form.pickupPincode} onChange={e => update('pickupPincode', e.target.value)} placeholder="e.g., 110001" required />
            </div>
          </div>
        </div>

        <div className="form-section glass-card">
          <h3>📍 Drop Details</h3>
          <div className="form-group">
            <label>Address</label>
            <input value={form.dropAddress} onChange={e => update('dropAddress', e.target.value)} placeholder="Full drop address" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Area Name</label>
              <input value={form.dropArea} onChange={e => update('dropArea', e.target.value)} placeholder="e.g., Koramangala" required />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input value={form.dropPincode} onChange={e => update('dropPincode', e.target.value)} placeholder="e.g., 560034" required />
            </div>
          </div>
        </div>

        <div className="form-section glass-card">
          <h3>📐 Package Dimensions (cm) & Weight (kg)</h3>
          <div className="form-row">
            <div className="form-group"><label>Length</label><input type="number" value={form.length} onChange={e => update('length', e.target.value)} placeholder="cm" min="0.1" step="0.1" required /></div>
            <div className="form-group"><label>Breadth</label><input type="number" value={form.breadth} onChange={e => update('breadth', e.target.value)} placeholder="cm" min="0.1" step="0.1" required /></div>
            <div className="form-group"><label>Height</label><input type="number" value={form.height} onChange={e => update('height', e.target.value)} placeholder="cm" min="0.1" step="0.1" required /></div>
            <div className="form-group"><label>Actual Weight</label><input type="number" value={form.actualWeight} onChange={e => update('actualWeight', e.target.value)} placeholder="kg" min="0.1" step="0.1" required /></div>
          </div>
        </div>

        <div className="form-section glass-card">
          <h3>⚙️ Order Configuration</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Order Type</label>
              <div className="radio-group">
                {['B2B', 'B2C'].map(t => (
                  <label key={t} className={`radio-card ${form.orderType === t ? 'active' : ''}`}>
                    <input type="radio" name="orderType" value={t} checked={form.orderType === t} onChange={e => update('orderType', e.target.value)} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Payment Type</label>
              <div className="radio-group">
                {['PREPAID', 'COD'].map(t => (
                  <label key={t} className={`radio-card ${form.paymentType === t ? 'active' : ''}`}>
                    <input type="radio" name="paymentType" value={t} checked={form.paymentType === t} onChange={e => update('paymentType', e.target.value)} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="form-group">
              <label>Customer ID (Admin: order on behalf)</label>
              <input value={form.customerId} onChange={e => update('customerId', e.target.value)} placeholder="Customer UUID" />
            </div>
          )}
        </div>
      </div>

      <div className="action-bar">
        <button className="btn btn-secondary" onClick={calculateCharges} disabled={!canCalculate || calcLoading}>
          {calcLoading ? 'Calculating...' : '💰 Calculate Charges'}
        </button>
      </div>

      {charges && (
        <div className="charge-breakdown glass-card">
          <h3>💰 Charge Breakdown</h3>
          <div className="charge-grid">
            <div className="charge-item"><span>Pickup Zone</span><span>{charges.pickupZoneName}</span></div>
            <div className="charge-item"><span>Drop Zone</span><span>{charges.dropZoneName}</span></div>
            <div className="charge-item"><span>Zone Type</span><span className="badge badge-outline">{charges.zoneType.replace('_', ' ')}</span></div>
            <div className="charge-item"><span>Volumetric Weight</span><span>{charges.volumetricWeight} kg</span></div>
            <div className="charge-item"><span>Billable Weight</span><span><strong>{charges.billableWeight} kg</strong></span></div>
            <div className="charge-item"><span>Base Charge</span><span>₹{charges.baseCharge.toFixed(2)}</span></div>
            <div className="charge-item"><span>Weight Charge</span><span>₹{charges.weightCharge.toFixed(2)}</span></div>
            {charges.codSurcharge > 0 && <div className="charge-item"><span>COD Surcharge</span><span>₹{charges.codSurcharge.toFixed(2)}</span></div>}
            <div className="charge-item charge-total"><span>Total Charge</span><span>₹{charges.totalCharge.toFixed(2)}</span></div>
          </div>
          <button className="btn btn-primary btn-full" onClick={confirmOrder} disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Creating Order...' : '✅ Confirm & Create Order'}
          </button>
        </div>
      )}
    </div>
  );
}