import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Header from './components/Header';
import AdminDashboard from './components/admin/AdminDashboard';
import WorkerDashboard from './components/worker/WorkerDashboard';
import ClientPortal from './components/client/ClientPortal';

function App() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
  (async () => {
    await signUp(
      'bruno@admin.com',
      'Bruno2025',
      'Administrador',
      'admin'
    );
  })();
}, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {profile.role === 'admin' && <AdminDashboard />}
      {profile.role === 'worker' && <WorkerDashboard />}
      {profile.role === 'client' && <ClientPortal />}
    </div>
  );
}

export default App;
