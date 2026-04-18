import { useState } from 'react';
import { Eye, Download, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import Footer from '../Footer';

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'tasks' | 'budget'>('overview');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Portal do Cliente</h1>
            <p className="text-slate-600">Acompanhe o progresso da sua obra em tempo real</p>
          </div>

          {/* Project Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Obra Centro - Fundações</h2>
                <p className="text-slate-600">Localização: Rua Principal, 123 - Centro</p>
              </div>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg">
                Em Progresso
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">Progresso Geral</span>
                <span className="text-2xl font-bold text-slate-900">65%</span>
              </div>
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Data de Início</p>
                <p className="font-bold text-slate-900">01/01/2024</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Previsão de Término</p>
                <p className="font-bold text-slate-900">30/06/2024</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Dias Restantes</p>
                <p className="font-bold text-slate-900">45 dias</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <p className="font-bold text-green-600">No Prazo</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-slate-200">
            <div className="flex gap-8">
              {(['overview', 'photos', 'tasks', 'budget'] as const).map((tab) => (
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
                  {tab === 'photos' && 'Fotos'}
                  {tab === 'tasks' && 'Tarefas'}
                  {tab === 'budget' && 'Orçamento'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Timeline */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Atividades Recentes</h3>
                  <div className="space-y-4">
                    {[
                      { date: 'Hoje', title: 'Fundações iniciadas', status: 'completed' },
                      { date: 'Ontem', title: 'Escavação concluída', status: 'completed' },
                      { date: '2 dias', title: 'Preparação do terreno', status: 'completed' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          {i < 2 && <div className="w-0.5 h-12 bg-slate-200 my-2"></div>}
                        </div>
                        <div className="pt-1">
                          <p className="text-xs text-slate-500 font-medium">{item.date}</p>
                          <p className="font-medium text-slate-900">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Contato do Gerente</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Nome</p>
                      <p className="font-bold text-slate-900">Carlos Silva</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Telefone</p>
                      <p className="font-bold text-blue-600">+351 234 567 890</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-bold text-blue-600">carlos@alaobra.com</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Resumo</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tarefas Concluídas</span>
                      <span className="font-bold text-slate-900">18/28</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Fotos Enviadas</span>
                      <span className="font-bold text-slate-900">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Problemas</span>
                      <span className="font-bold text-green-600">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Galeria de Fotos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition group"
                  >
                    <Eye className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Tarefas</h3>
              <div className="space-y-3">
                {[
                  { title: 'Escavação', status: 'completed' },
                  { title: 'Fundações', status: 'in_progress' },
                  { title: 'Estrutura', status: 'pending' },
                  { title: 'Alvenaria', status: 'pending' },
                ].map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : task.status === 'in_progress'
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-300'
                        }`}
                      ></div>
                      <span className="font-medium text-slate-900">{task.title}</span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.status === 'completed'
                        ? 'Concluída'
                        : task.status === 'in_progress'
                        ? 'Em Progresso'
                        : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  Orçamento
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Orçamento Total</span>
                      <span className="font-bold text-slate-900">€50.000</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Gasto Até Agora</span>
                      <span className="font-bold text-slate-900">€32.500</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Restante</span>
                      <span className="font-bold text-green-600">€17.500</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Percentual Gasto</span>
                      <span className="font-bold text-slate-900">65%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Ações</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                    <Download size={18} />
                    Baixar Relatório
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-3 rounded-lg transition">
                    <Calendar size={18} />
                    Ver Cronograma
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
