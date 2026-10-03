import { TrackingEntry } from '../../types';

const STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
  PENDING: { color: '#f6ad55', icon: '⏳' },
  PICKED_UP: { color: '#4299e1', icon: '📥' },
  IN_TRANSIT: { color: '#9f7aea', icon: '🚚' },
  OUT_FOR_DELIVERY: { color: '#48bb78', icon: '🏃' },
  DELIVERED: { color: '#38a169', icon: '✅' },
  FAILED: { color: '#fc8181', icon: '❌' },
};

export default function TrackingTimeline({ entries }: { entries: TrackingEntry[] }) {
  return (
    <div className="timeline">
      {entries.map((entry, i) => {
        const config = STATUS_CONFIG[entry.status] || { color: '#a0a0c0', icon: '•' };
        return (
          <div key={entry.id || i} className="timeline-item" style={{ '--dot-color': config.color } as any}>
            <div className="timeline-dot">{config.icon}</div>
            <div className="timeline-content glass-card">
              <div className="timeline-header">
                <span className="badge" style={{ background: config.color + '22', color: config.color }}>
                  {entry.status.replace(/_/g, ' ')}
                </span>
                <span className="timeline-time">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              {entry.notes && <p className="timeline-notes">{entry.notes}</p>}
              {entry.user && <p className="timeline-actor">By: {entry.user.name} ({entry.user.role})</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}