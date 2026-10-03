import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ApiResponse, Zone, Area } from '../../types';

export default function ZoneManagement() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneForm, setZoneForm] = useState({ name: '', description: '' });
  const [areaForm, setAreaForm] = useState({ name: '', pincode: '', zoneId: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [zRes, aRes] = await Promise.all([
        api.get<ApiResponse<Zone[]>>('/zones'),
        api.get<ApiResponse<Area[]>>('/areas'),
      ]);
      setZones(zRes.data);
      setAreas(aRes.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const createZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/zones', zoneForm);
      setMsg('Zone created!');
      setZoneForm({ name: '', description: '' });
      fetchData();
    } catch (err: any) { setError(err.message); }
  };

  const createArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/areas', areaForm);
      setMsg('Area created!');
      setAreaForm({ name: '', pincode: '', zoneId: '' });
      fetchData();
    } catch (err: any) { setError(err.message); }
  };

  const deleteZone = async (id: string) => {
    if (!confirm('Delete this zone? All associated areas will also be deleted.')) return;
    try { await api.delete(`/zones/${id}`); fetchData(); } catch (err: any) { setError(err.message); }
  };

  const deleteArea = async (id: string) => {
    try { await api.delete(`/areas/${id}`); fetchData(); } catch (err: any) { setError(err.message); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <h1>Zone & Area Management</h1>

      <div className="management-grid">
        {/* Create Zone */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>➕ Create Zone</h3>
          <form onSubmit={createZone}>
            <div className="form-group"><label>Name</label><input value={zoneForm.name} onChange={e => setZoneForm(f => ({ ...f, name: e.target.value }))} placeholder="Zone name" required /></div>
            <div className="form-group"><label>Description</label><input value={zoneForm.description} onChange={e => setZoneForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" /></div>
            <button type="submit" className="btn btn-primary">Create Zone</button>
          </form>
        </div>

        {/* Create Area */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>➕ Create Area</h3>
          <form onSubmit={createArea}>
            <div className="form-group"><label>Name</label><input value={areaForm.name} onChange={e => setAreaForm(f => ({ ...f, name: e.target.value }))} placeholder="Area name" required /></div>
            <div className="form-group"><label>Pincode</label><input value={areaForm.pincode} onChange={e => setAreaForm(f => ({ ...f, pincode: e.target.value }))} placeholder="e.g., 110001" required /></div>
            <div className="form-group">
              <label>Zone</label>
              <select value={areaForm.zoneId} onChange={e => setAreaForm(f => ({ ...f, zoneId: e.target.value }))} required>
                <option value="">Select Zone</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Create Area</button>
          </form>
        </div>
      </div>

      {/* Zones List */}
      <div className="section">
        <h2>Zones ({zones.length})</h2>
        <div className="table-wrapper glass-card">
          <table>
            <thead><tr><th>Name</th><th>Description</th><th>Areas</th><th>Agents</th><th>Actions</th></tr></thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.id}>
                  <td><strong>{z.name}</strong></td>
                  <td>{z.description || '—'}</td>
                  <td>{z._count?.areas || 0}</td>
                  <td>{z._count?.agents || 0}</td>
                  <td><button className="btn btn-xs btn-danger" onClick={() => deleteZone(z.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Areas List */}
      <div className="section">
        <h2>Areas ({areas.length})</h2>
        <div className="table-wrapper glass-card">
          <table>
            <thead><tr><th>Name</th><th>Pincode</th><th>Zone</th><th>Actions</th></tr></thead>
            <tbody>
              {areas.map(a => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.pincode}</td>
                  <td>{a.zone?.name || 'N/A'}</td>
                  <td><button className="btn btn-xs btn-danger" onClick={() => deleteArea(a.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}