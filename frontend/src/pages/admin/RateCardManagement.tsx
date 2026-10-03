import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ApiResponse, RateCard } from '../../types';

export default function RateCardManagement() {
  const [cards, setCards] = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ orderType: 'B2C', zoneType: 'INTRA_ZONE', baseRate: '', perKgRate: '', codSurcharge: '0' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ baseRate: '', perKgRate: '', codSurcharge: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchCards = async () => {
    try {
      const res = await api.get<ApiResponse<RateCard[]>>('/rate-cards');
      setCards(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCards(); }, []);

  const createCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/rate-cards', {
        orderType: form.orderType, zoneType: form.zoneType,
        baseRate: parseFloat(form.baseRate), perKgRate: parseFloat(form.perKgRate),
        codSurcharge: parseFloat(form.codSurcharge || '0'),
      });
      setMsg('Rate card created!');
      setForm({ orderType: 'B2C', zoneType: 'INTRA_ZONE', baseRate: '', perKgRate: '', codSurcharge: '0' });
      fetchCards();
    } catch (err: any) { setError(err.message); }
  };

  const startEdit = (card: RateCard) => {
    setEditId(card.id);
    setEditForm({ baseRate: String(card.baseRate), perKgRate: String(card.perKgRate), codSurcharge: String(card.codSurcharge) });
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      await api.put(`/rate-cards/${editId}`, {
        baseRate: parseFloat(editForm.baseRate), perKgRate: parseFloat(editForm.perKgRate),
        codSurcharge: parseFloat(editForm.codSurcharge),
      });
      setMsg('Rate card updated!');
      setEditId(null);
      fetchCards();
    } catch (err: any) { setError(err.message); }
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Delete this rate card?')) return;
    try { await api.delete(`/rate-cards/${id}`); fetchCards(); } catch (err: any) { setError(err.message); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <h1>Rate Card Management</h1>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3>➕ Create Rate Card</h3>
        <form onSubmit={createCard} className="form-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="form-group">
            <label>Order Type</label>
            <select value={form.orderType} onChange={e => setForm(f => ({ ...f, orderType: e.target.value }))}>
              <option value="B2B">B2B</option><option value="B2C">B2C</option>
            </select>
          </div>
          <div className="form-group">
            <label>Zone Type</label>
            <select value={form.zoneType} onChange={e => setForm(f => ({ ...f, zoneType: e.target.value }))}>
              <option value="INTRA_ZONE">Intra Zone</option><option value="INTER_ZONE">Inter Zone</option>
            </select>
          </div>
          <div className="form-group"><label>Base Rate (₹)</label><input type="number" step="0.01" value={form.baseRate} onChange={e => setForm(f => ({ ...f, baseRate: e.target.value }))} required /></div>
          <div className="form-group"><label>Per Kg Rate (₹)</label><input type="number" step="0.01" value={form.perKgRate} onChange={e => setForm(f => ({ ...f, perKgRate: e.target.value }))} required /></div>
          <div className="form-group"><label>COD Surcharge (₹)</label><input type="number" step="0.01" value={form.codSurcharge} onChange={e => setForm(f => ({ ...f, codSurcharge: e.target.value }))} /></div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Create</button>
        </form>
      </div>

      <div className="table-wrapper glass-card">
        <table>
          <thead><tr><th>Order Type</th><th>Zone Type</th><th>Base Rate</th><th>Per Kg</th><th>COD Surcharge</th><th>Actions</th></tr></thead>
          <tbody>
            {cards.map(c => (
              <tr key={c.id}>
                <td><span className="badge badge-outline">{c.orderType}</span></td>
                <td>{c.zoneType.replace('_', ' ')}</td>
                {editId === c.id ? (
                  <>
                    <td><input type="number" step="0.01" value={editForm.baseRate} onChange={e => setEditForm(f => ({ ...f, baseRate: e.target.value }))} className="inline-input" /></td>
                    <td><input type="number" step="0.01" value={editForm.perKgRate} onChange={e => setEditForm(f => ({ ...f, perKgRate: e.target.value }))} className="inline-input" /></td>
                    <td><input type="number" step="0.01" value={editForm.codSurcharge} onChange={e => setEditForm(f => ({ ...f, codSurcharge: e.target.value }))} className="inline-input" /></td>
                    <td><div className="btn-group"><button className="btn btn-xs btn-primary" onClick={saveEdit}>Save</button><button className="btn btn-xs btn-outline" onClick={() => setEditId(null)}>Cancel</button></div></td>
                  </>
                ) : (
                  <>
                    <td>₹{Number(c.baseRate).toFixed(2)}</td>
                    <td>₹{Number(c.perKgRate).toFixed(2)}</td>
                    <td>₹{Number(c.codSurcharge).toFixed(2)}</td>
                    <td><div className="btn-group"><button className="btn btn-xs btn-outline" onClick={() => startEdit(c)}>Edit</button><button className="btn btn-xs btn-danger" onClick={() => deleteCard(c.id)}>Delete</button></div></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}