import { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import Footer from '../Footer';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'workers' | 'issues'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard Admin</h1>
            <p className="text-slate-600">Bem-vindo ao painel de controle do AlaObra</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Obras Ativas"
              value="4"
              subtitle="3 em progresso"
              color="blue"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              title="Funcionários"
              value="12"
              subtitle="Todos ativos"
              color="green"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              title="Tarefas Pendentes"
              value="8"
              subtitle="Aguardando aprovação"
              color="yellow"
            />
            <StatCard
              icon={<AlertCircle className="w-6 h-6" />}
              title="Problemas Abertos"
              value="2"
              subtitle="1 crítico"
              color="red"
            />
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-slate-200">
            <div className="flex gap-8">
              {(['overview', 'projects', 'workers', 'issues'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium border-b-2 transition ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'overview' && 'Visão Geral'}
                  {tab === 'projects' && 'Obras'}
                  {tab === 'workers' && 'Funcionários'}
                  {tab === 'issues' && 'Problemas'}
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Atividades Recentes</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Tarefa aprovada</p>
                        <p className="text-sm text-slate-600">Fundações - Obra Centro</p>
                        <p className="text-xs text-slate-500 mt-1">Há 2 horas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects Overview */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Obras em Progresso</h2>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                      <div>
                        <p className="font-medium text-slate-900">Obra {i}</p>
                        <div className="w-32 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${25 + i * 15}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-600">{25 + i * 15}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Resumo do Dia</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Check-ins</span>
                    <span className="font-bold text-slate-900">12/12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tarefas Completas</span>
                    <span className="font-bold text-slate-900">8/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Fotos Enviadas</span>
                    <span className="font-bold text-slate-900">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Problemas Reportados</span>
                    <span className="font-bold text-red-600">2</span>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Alertas Importantes</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900">Problema crítico detectado</p>
                    <p className="text-xs text-red-700 mt-1">Obra Centro - Fundações</p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">Tarefa atrasada</p>
                    <p className="text-xs text-yellow-700 mt-1">Estrutura - Obra Norte</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-slate-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
