import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Header from './components/Header';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminPanel from './components/admin/AdminPanel';
import WorkerDashboard from './components/worker/WorkerDashboard';
import ClientPortal from './components/client/ClientPortal';
import { useState } from 'react';

function App() {
  const { user, profile, loading } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  if (showAdminPanel && profile.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AdminPanel onBack={() => setShowAdminPanel(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAdminPanel={() => setShowAdminPanel(true)} />
      {profile.role === 'admin' && <AdminDashboard />}
      {profile.role === 'worker' && <WorkerDashboard />}
      {profile.role === 'client' && <ClientPortal />}
    </div>
  );
}

export default App;
