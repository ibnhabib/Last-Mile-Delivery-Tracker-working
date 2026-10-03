import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/customer/LandinPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrder';
import CreateOrder from './pages/customer/CreateOrder';
import OrderDetail from './pages/customer/OrderDetail';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentOrders from './pages/agent/AgentOrder';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrder';
import ZoneManagement from './pages/admin/ZoneManager';
import RateCardManagement from './pages/admin/RateCardManagement';
import AgentManagement from './pages/admin/AgentManager';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer routes */}
      <Route path="/customer" element={<ProtectedRoute roles={['CUSTOMER']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="orders/new" element={<CreateOrder />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>

      {/* Agent routes */}
      <Route path="/agent" element={<ProtectedRoute roles={['AGENT']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="orders" element={<AgentOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/new" element={<CreateOrder />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="zones" element={<ZoneManagement />} />
        <Route path="rate-cards" element={<RateCardManagement />} />
        <Route path="agents" element={<AgentManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}