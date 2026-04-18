import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, MapPin, Camera } from 'lucide-react';
import Footer from '../Footer';

export default function WorkerDashboard() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [workingTime, setWorkingTime] = useState('0h 0m');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!checkedIn) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setWorkingTime(`${hours}h ${minutes}m`);
    }, 60000);

    return () => clearInterval(interval);
  }, [checkedIn]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Bem-vindo, João Silva!
            </h1>
            <p className="text-slate-600">
              {checkedIn ? '✅ Você está trabalhando' : '📱 Registre sua entrada para começar'}
            </p>
          </div>

          {/* Check-in Section */}
          {!checkedIn ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Registre sua Entrada</h2>
                <p className="text-slate-600">Clique abaixo para começar seu dia de trabalho</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Obra Selecionada</p>
                  <p className="font-bold text-slate-900">Obra Centro - Fundações</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Localização</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <p className="font-bold text-slate-900">Detectando...</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCheckedIn(true)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg transition duration-200 text-lg"
              >
                ✓ Registrar Entrada
              </button>
            </div>
          ) : (
            <>
              {/* Active Work Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-green-700 font-medium mb-1">Tempo Trabalhado</p>
                    <p className="text-4xl font-bold text-green-900">{workingTime}</p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-white rounded-lg border border-green-100">
                    <p className="text-xs text-slate-600 mb-1">Entrada</p>
                    <p className="font-bold text-slate-900">08:00</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-green-100">
                    <p className="text-xs text-slate-600 mb-1">Obra</p>
                    <p className="font-bold text-slate-900">Fundações</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-white text-slate-900 font-bold py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                    Reportar Problema
                  </button>
                  <button
                    onClick={() => setCheckedIn(false)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
                  >
                    Registrar Saída
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Tasks Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Minhas Tarefas</h2>

            <div className="space-y-4">
              {[
                { title: 'Preparar fundações', status: 'in_progress', priority: 'high' },
                { title: 'Escavar área', status: 'completed', priority: 'high' },
                { title: 'Compactar solo', status: 'pending', priority: 'medium' },
              ].map((task, i) => (
                <div
                  key={i}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : task.status === 'in_progress'
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-300'
                        }`}
                      ></div>
                      <div>
                        <p className="font-bold text-slate-900">{task.title}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {task.status === 'completed'
                            ? '✓ Concluída'
                            : task.status === 'in_progress'
                            ? '🔄 Em progresso'
                            : '⏳ Pendente'}
                        </p>
                      </div>
                    </div>
                       <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {task.priority === 'high' ? 'Alta' : 'Média'}
                    </span>
                  </div>

                  {task.status === 'in_progress' && (
                    <button className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-100 transition">
                      <Camera size={16} />
                      Enviar Foto
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Notificações</h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Tarefa aprovada</p>
                  <p className="text-sm text-blue-700">Sua tarefa "Escavar área" foi aprovada com nota 9/10</p>
                  <p className="text-xs text-blue-600 mt-1">Há 2 horas</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-medium text-yellow-900">Tarefa aguardando aprovação</p>
                  <p className="text-sm text-yellow-700">Sua tarefa "Compactar solo" está aguardando revisão</p>
                  <p className="text-xs text-yellow-600 mt-1">Há 1 hora</p>
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
