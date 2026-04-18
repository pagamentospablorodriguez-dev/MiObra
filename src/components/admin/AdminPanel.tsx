import { useState } from 'react';
import { Users, Building2, ListTodo, BarChart3, Plus, Edit2, Trash2 } from 'lucide-react';
import Footer from '../Footer';

type TabType = 'users' | 'projects' | 'tasks' | 'stats';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('users');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Painel Administrativo</h1>
            <p className="text-slate-600">Gerencie usuários, obras, tarefas e visualize estatísticas</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'users', label: 'Usuários', icon: Users },
              { id: 'projects', label: 'Obras', icon: Building2 },
              { id: 'tasks', label: 'Tarefas', icon: ListTodo },
              { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`px-6 py-3 font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'stats' && <StatsTab />}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function UsersTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Usuários</h2>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
          <Plus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Função</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[
              { name: 'Carlos Silva', email: 'carlos@alaobra.com', role: 'Admin', status: 'Ativo' },
              { name: 'João Santos', email: 'joao@alaobra.com', role: 'Funcionário', status: 'Ativo' },
              { name: 'Maria Costa', email: 'maria@alaobra.com', role: 'Cliente', status: 'Ativo' },
              { name: 'Pedro Oliveira', email: 'pedro@alaobra.com', role: 'Funcionário', status: 'Inativo' },
            ].map((user, i) => (
              <tr key={i} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      user.status === 'Ativo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Obras</h2>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
          <Plus size={18} />
          Nova Obra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Obra Centro', status: 'in_progress', progress: 65 },
          { name: 'Obra Norte', status: 'in_progress', progress: 45 },
          { name: 'Obra Sul', status: 'planning', progress: 10 },
          { name: 'Obra Leste', status: 'completed', progress: 100 },
        ].map((project, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900">{project.name}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {project.status === 'in_progress'
                    ? 'Em Progresso'
                    : project.status === 'planning'
                    ? 'Planejamento'
                    : 'Concluída'}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  project.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-700'
                    : project.status === 'planning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {project.progress}%
              </span>
            </div>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                Editar
              </button>
              <button className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Tarefas</h2>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
          <Plus size={18} />
          Nova Tarefa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tarefa</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Obra</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Atribuído a</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[
              { task: 'Fundações', project: 'Obra Centro', assigned: 'João', status: 'in_progress' },
              { task: 'Estrutura', project: 'Obra Norte', assigned: 'Pedro', status: 'pending' },
              { task: 'Alvenaria', project: 'Obra Centro', assigned: 'Maria', status: 'completed' },
            ].map((item, i) => (
              <tr key={i} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium text-slate-900">{item.task}</td>
                <td className="px-6 py-4 text-slate-600">{item.project}</td>
                <td className="px-6 py-4 text-slate-600">{item.assigned}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      item.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {item.status === 'completed'
                      ? 'Concluída'
                      : item.status === 'in_progress'
                      ? 'Em Progresso'
                      : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Estatísticas do Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Usuários Totais" value="15" color="blue" />
        <StatCard title="Obras Ativas" value="3" color="green" />
        <StatCard title="Tarefas Concluídas" value="42" color="purple" />
        <StatCard title="Taxa de Sucesso" value="94%" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Distribuição por Função</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Funcionários</span>
                <span className="font-bold text-slate-900">10</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '67%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Clientes</span>
                <span className="font-bold text-slate-900">3</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Admins</span>
                <span className="font-bold text-slate-900">2</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '13%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Desempenho das Obras</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-900">Obra Centro</span>
              <span className="text-lg font-bold text-blue-600">65%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-900">Obra Norte</span>
              <span className="text-lg font-bold text-blue-600">45%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-900">Obra Sul</span>
              <span className="text-lg font-bold text-blue-600">10%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-900">Obra Leste</span>
              <span className="text-lg font-bold text-green-600">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <p className="text-slate-600 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mt-4`}>
        <BarChart3 size={24} />
      </div>
    </div>
  );
}
