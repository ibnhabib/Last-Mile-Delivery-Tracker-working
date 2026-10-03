import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ApiResponse, DeliveryAgent, Zone } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#38a169', BUSY: '#f6ad55', OFFLINE: '#fc8181',
};

export default function AgentManagement() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    try {
      const [aRes, zRes] = await Promise.all([
        api.get<ApiResponse<DeliveryAgent[]>>('/agents'),
        api.get<ApiResponse<Zone[]>>('/zones'),
      ]);
      setAgents(aRes.data);
      setZones(zRes.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (agentId: string, status: string) => {
    setActionLoading(`${agentId}-status`);
    try {
      await api.patch(`/agents/${agentId}/status`, { status });
      setMsg('Agent status updated!');
      fetchData();
    } catch (err: any) { setMsg(err.message); }
    finally { setActionLoading(''); }
  };

  const updateZone = async (agentId: string, zoneId: string) => {
    setActionLoading(`${agentId}-zone`);
    try {
      await api.patch(`/agents/${agentId}/location`, { zoneId });
      setMsg('Agent zone updated!');
      fetchData();
    } catch (err: any) { setMsg(err.message); }
    finally { setActionLoading(''); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      {msg && <div className="alert alert-success">{msg}</div>}

      <h1>Agent Management</h1>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card glass-card"><p className="stat-label">Total Agents</p><p className="stat-value" style={{ color: '#667eea' }}>{agents.length}</p></div>
        <div className="stat-card glass-card"><p className="stat-label">Available</p><p className="stat-value" style={{ color: '#38a169' }}>{agents.filter(a => a.status === 'AVAILABLE').length}</p></div>
        <div className="stat-card glass-card"><p className="stat-label">Busy</p><p className="stat-value" style={{ color: '#f6ad55' }}>{agents.filter(a => a.status === 'BUSY').length}</p></div>
        <div className="stat-card glass-card"><p className="stat-label">Offline</p><p className="stat-value" style={{ color: '#fc8181' }}>{agents.filter(a => a.status === 'OFFLINE').length}</p></div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem 0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '0 1.5rem' }}>
          <table style={{ minWidth: '850px', width: '100%' }}>
          <thead><tr><th>Agent</th><th>Status</th><th>Actions</th><th>Email</th><th>Phone</th><th>Zone</th><th>Area</th></tr></thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id}>
                <td style={{ whiteSpace: 'nowrap' }}><strong>{a.user?.name}</strong></td>
                <td><span className="badge" style={{ background: (STATUS_COLORS[a.status] || '#666') + '22', color: STATUS_COLORS[a.status], whiteSpace: 'nowrap' }}>{a.status}</span></td>
                <td>
                  <div className="btn-group" style={{ flexWrap: 'nowrap' }}>
                    {['AVAILABLE', 'BUSY', 'OFFLINE'].filter(s => s !== a.status).map(s => (
                      <button key={s} className="btn btn-xs btn-outline" onClick={() => updateStatus(a.id, s)}
                        disabled={actionLoading === `${a.id}-status`} style={{ whiteSpace: 'nowrap' }}>{s}</button>
                    ))}
                  </div>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{a.user?.email}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{a.user?.phone || '—'}</td>
                <td style={{ minWidth: '150px' }}>
                  <select value={a.zoneId || ''} onChange={e => updateZone(a.id, e.target.value)}
                    disabled={actionLoading === `${a.id}-zone`} className="inline-select" style={{ width: '100%' }}>
                    <option value="">Unassigned</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{a.currentArea || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}