import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS: Record<string, { label: string; path: string; icon: string }[]> = {
  CUSTOMER: [
    { label: 'Dashboard', path: '/customer/dashboard', icon: '📊' },
    { label: 'All Orders', path: '/customer/orders', icon: '📋' },
    { label: 'New Order', path: '/customer/orders/new', icon: '📦' },
  ],
  AGENT: [
    { label: 'Dashboard', path: '/agent/dashboard', icon: '🚚' },
    { label: 'All Orders', path: '/agent/orders', icon: '📋' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'All Orders', path: '/admin/orders', icon: '📋' },
    { label: 'New Order', path: '/admin/orders/new', icon: '📦' },
    { label: 'Zones & Areas', path: '/admin/zones', icon: '🗺️' },
    { label: 'Rate Cards', path: '/admin/rate-cards', icon: '💰' },
    { label: 'Agents', path: '/admin/agents', icon: '👤' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS[user?.role || 'CUSTOMER'] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-logo">🚀 LastMileUS</h2>
          <p className="sidebar-role">{user?.role}</p>
        </div>
        <nav className="sidebar-nav">
          {items.map(item => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}