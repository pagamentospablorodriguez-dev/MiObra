import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckIn, Project } from '../../types/database';
import { Clock, LogOut, LogIn, AlertTriangle, CheckCircle, ListTodo } from 'lucide-react';
import WorkerTasks from './WorkerTasks';
import ReportIssue from './ReportIssue';

export default function WorkerDashboard() {
  const { profile } = useAuth();
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [workingTime, setWorkingTime] = useState('0h 0m');

  useEffect(() => {
    loadActiveCheckIn();
  }, [profile]);

  useEffect(() => {
    if (activeCheckIn) {
      const interval = setInterval(() => {
        setWorkingTime(getWorkingHours());
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [activeCheckIn]);

  const loadActiveCheckIn = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('worker_id', profile.id)
        .is('check_out_time', null)
        .maybeSingle();

      if (error) throw error;
      setActiveCheckIn(data);
      if (data) {
        setWorkingTime(getWorkingHours(data));
      }
    } catch (error) {
      console.error('Error loading check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (projectId: string) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          worker_id: profile.id,
          project_id: projectId,
        })
        .select()
        .single();

      if (error) throw error;
      setActiveCheckIn(data);
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Erro ao fazer check-in. Tente novamente.');
    }
  };

  const handleCheckOut = async (notes?: string) => {
    if (!activeCheckIn) return;

    if (!confirm('Tem certeza que deseja encerrar seu trabalho?')) return;

    try {
      const { error } = await supabase
        .from('check_ins')
        .update({
          check_out_time: new Date().toISOString(),
          notes: notes,
        })
        .eq('id', activeCheckIn.id);

      if (error) throw error;
      setActiveCheckIn(null);
      alert('Trabalho encerrado! Até amanhã!');
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Erro ao fazer check-out. Tente novamente.');
    }
  };

  const getWorkingHours = (checkIn = activeCheckIn) => {
    if (!checkIn) return '0h 0m';
    const start = new Date(checkIn.check_in_time);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {profile?.full_name}!
          </h1>
          <p className="text-lg text-gray-600">
            {activeCheckIn ? '👷 Você está trabalhando' : '📱 Faça check-in para começar seu dia'}
          </p>
        </div>

        {!activeCheckIn ? (
          <CheckInSection onCheckIn={handleCheckIn} />
        ) : (
          <>
            <ActiveWorkSection
              workingTime={workingTime}
              onCheckOut={handleCheckOut}
              onReportIssue={() => setShowReportIssue(true)}
            />
            <WorkerTasks />
          </>
        )}
      </div>

      {showReportIssue && (
        <ReportIssue onClose={() => setShowReportIssue(false)} projectId={activeCheckIn?.project_id} />
      )}
    </div>
  );
}

function CheckInSection({ onCheckIn }: { onCheckIn: (projectId: string) => void }) {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [profile]);

  const loadProjects = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          project_id,
          projects!inner (
            id,
            name,
            address,
            status
          )
        `)
        .eq('assigned_to', profile.id)
        .eq('projects.status', 'in_progress');

      if (error) throw error;

      const uniqueProjects = Array.from(
        new Map(data?.map(item => [item.projects.id, item.projects])).values()
      ) as Project[];

      setProjects(uniqueProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-2xl">
          <LogIn className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Começar o Trabalho</h2>
          <p className="text-gray-600 mt-1">Selecione a obra onde você vai trabalhar hoje</p>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">📋 Instruções:</h3>
        <ol className="space-y-2 text-blue-800">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Quando chegar na obra, selecione qual obra você está</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Clique no botão verde "Iniciar Trabalho"</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>O sistema vai começar a contar suas horas automaticamente</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Quando terminar o dia, clique em "Encerrar Trabalho"</span>
          </li>
        </ol>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Carregando obras...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">Você não tem obras atribuídas no momento.</p>
          <p className="text-sm text-gray-500 mt-1">Entre em contato com seu supervisor.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Selecione a Obra:
            </label>
            <div className="space-y-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    selectedProject === project.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedProject === project.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedProject === project.id && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-600">{project.address}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => selectedProject && onCheckIn(selectedProject)}
            disabled={!selectedProject}
            className="w-full bg-green-600 text-white py-5 rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
          >
            <LogIn className="w-6 h-6" />
            {selectedProject ? 'Iniciar Trabalho' : 'Selecione uma obra primeiro'}
          </button>
        </>
      )}
    </div>
  );
}

function ActiveWorkSection({
  workingTime,
  onCheckOut,
  onReportIssue,
}: {
  workingTime: string;
  onCheckOut: (notes?: string) => void;
  onReportIssue: () => void;
}) {
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [notes, setNotes] = useState('');

  const handleCheckOut = () => {
    onCheckOut(notes);
    setShowCheckOutModal(false);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-2xl">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-green-100 text-sm font-medium">Tempo Trabalhado Hoje</p>
              <p className="text-4xl font-bold">{workingTime}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCheckOutModal(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 backdrop-blur"
          >
            <LogOut className="w-5 h-5" />
            Encerrar Trabalho
          </button>
        </div>

        <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur">
          <p className="text-sm text-green-100 mb-2">✅ Você está trabalhando</p>
          <p className="text-xs text-green-100">
            O sistema está registrando suas horas automaticamente. Quando terminar, clique em "Encerrar Trabalho".
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={onReportIssue}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="font-semibold text-gray-900">Reportar Problema</span>
          </div>
          <p className="text-sm text-gray-600">
            Encontrou algum problema na obra? Reporte aqui.
          </p>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ListTodo className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">Minhas Tarefas</span>
          </div>
          <p className="text-sm text-gray-600">
            Veja suas tarefas abaixo e envie fotos quando concluir.
          </p>
        </div>
      </div>

      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Encerrar Trabalho</h3>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-800 font-medium mb-2">Tempo trabalhado: {workingTime}</p>
              <p className="text-sm text-green-700">
                Suas horas serão salvas automaticamente.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações do dia (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="O que você fez hoje? Ex: Instalei 5 portas, preparei as paredes para pintura..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckOut}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowCheckOutModal(false)}
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
