import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckIn, Task, Project } from '../../types/database';
import { Clock, MapPin, CheckCircle, AlertCircle, Camera, LogOut, LogIn } from 'lucide-react';
import WorkerTasks from './WorkerTasks';

export default function WorkerDashboard() {
  const { profile } = useAuth();
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveCheckIn();
  }, [profile]);

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
    } catch (error) {
      console.error('Error loading check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (projectId: string, photo?: string) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          worker_id: profile.id,
          project_id: projectId,
          check_in_photo: photo,
        })
        .select()
        .single();

      if (error) throw error;
      setActiveCheckIn(data);
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Erro ao fazer check-in');
    }
  };

  const handleCheckOut = async (photo?: string, notes?: string) => {
    if (!activeCheckIn) return;

    try {
      const { error } = await supabase
        .from('check_ins')
        .update({
          check_out_time: new Date().toISOString(),
          check_out_photo: photo,
          notes: notes,
        })
        .eq('id', activeCheckIn.id);

      if (error) throw error;
      setActiveCheckIn(null);
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Erro ao fazer check-out');
    }
  };

  const getWorkingHours = () => {
    if (!activeCheckIn) return '0h 0m';
    const start = new Date(activeCheckIn.check_in_time);
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
            Olá, {profile?.full_name}
          </h1>
          <p className="text-gray-600">
            {activeCheckIn ? 'Você está trabalhando' : 'Faça check-in para começar'}
          </p>
        </div>

        {activeCheckIn ? (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Trabalhando há</p>
                  <p className="text-2xl font-bold">{getWorkingHours()}</p>
                </div>
              </div>
              <CheckOutButton onCheckOut={handleCheckOut} />
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <MapPin className="w-4 h-4" />
              <span>Obra Ativa</span>
            </div>
          </div>
        ) : (
          <CheckInCard onCheckIn={handleCheckIn} />
        )}

        {activeCheckIn && <WorkerTasks />}
      </div>
    </div>
  );
}

function CheckInCard({ onCheckIn }: { onCheckIn: (projectId: string) => void }) {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

  useEffect(() => {
    loadProjects();
  }, [profile]);

  const loadProjects = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('project_id, project:projects(*)')
        .eq('assigned_to', profile.id)
        .eq('project.status', 'in_progress');

      if (error) throw error;

      const uniqueProjects = Array.from(
        new Map(data?.map(item => [item.project.id, item.project])).values()
      );
      setProjects(uniqueProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-lg">
          <LogIn className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Fazer Check-In</h2>
          <p className="text-sm text-gray-600">Selecione a obra onde vai trabalhar</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Obra
        </label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione uma obra</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} - {project.address}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => selectedProject && onCheckIn(selectedProject)}
        disabled={!selectedProject}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Iniciar Trabalho
      </button>
    </div>
  );
}

function CheckOutButton({ onCheckOut }: { onCheckOut: (photo?: string, notes?: string) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onCheckOut(undefined, notes);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Encerrar
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Encerrar Trabalho</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações do dia (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="O que foi feito hoje..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition"
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
