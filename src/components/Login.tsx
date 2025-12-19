import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@alaobra.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Trying to login with:', email);
      await signIn(email, password);
      console.log('Login successful!');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const createAdminNow = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Creating admin user...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@alaobra.com',
        password: 'admin123',
      });

      if (signUpError && !signUpError.message.includes('already')) {
        throw signUpError;
      }

      const userId = signUpData.user?.id;
      if (userId) {
        console.log('User created, ID:', userId);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: 'Administrador',
            role: 'admin',
            is_active: true
          });

        if (profileError) {
          console.error('Profile error:', profileError);
        }
      }

      console.log('Now trying to sign in...');
      await signIn('admin@alaobra.com', 'admin123');
      
    } catch (err: any) {
      console.error('Create admin error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <Building2 className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            AlaObra
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Gestão completa de obras
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm font-medium mb-2">Login padrão:</p>
            <p className="text-blue-600 text-xs">Email: admin@alaobra.com</p>
            <p className="text-blue-600 text-xs">Senha: admin123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mb-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <button
            onClick={createAdminNow}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Criar Admin e Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
