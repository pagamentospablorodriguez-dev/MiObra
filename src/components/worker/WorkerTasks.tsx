import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Task, Project, Photo } from '../../types/database';
import { Clock, CheckCircle, AlertCircle, Camera, Upload } from 'lucide-react';

interface TaskWithProject extends Task {
  project: Project;
  photos: Photo[];
}

export default function WorkerTasks() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);

  useEffect(() => {
    loadTasks();

    const subscription = supabase
      .channel('worker_tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile]);

  const loadTasks = async () => {
    if (!profile) return;

    try {
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('assigned_to', profile.id)
        .in('status', ['pending', 'in_progress', 'review'])
        .order('due_date', { ascending: true });

      if (error) throw error;

      if (tasksData) {
        const tasksWithPhotos = await Promise.all(
          tasksData.map(async (task) => {
            const { data: photos } = await supabase
              .from('photos')
              .select('*')
              .eq('task_id', task.id);

            return { ...task, photos: photos || [] };
          })
        );

        setTasks(tasksWithPhotos);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      review: 'bg-purple-100 text-purple-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      review: 'Em Revisão',
      approved: 'Aprovada',
      rejected: 'Recusada',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Minhas Tarefas</h2>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma tarefa pendente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ml-2 ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">{task.project.name}</span>
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
                <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'urgent' && '🔥'} {task.priority.toUpperCase()}
                </span>
              </div>

              {task.photos.length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Camera className="w-4 h-4" />
                  <span>{task.photos.length} foto(s) enviada(s)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadTasks}
        />
      )}
    </div>
  );
}

function TaskDetailModal({
  task,
  onClose,
  onUpdate,
}: {
  task: TaskWithProject;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleStartTask = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', task.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error starting task:', error);
    }
  };

  const handleSubmitForReview = async () => {
    if (task.photos.length === 0) {
      alert('Por favor, adicione pelo menos uma foto antes de enviar para revisão');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'review' })
        .eq('id', task.id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: task.project.client_id,
        title: 'Tarefa Concluída',
        message: `A tarefa "${task.title}" foi concluída e aguarda sua aprovação`,
        type: 'info',
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!profile) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const photoUrl = `https://via.placeholder.com/800x600?text=Photo+${task.photos.length + 1}`;

      const { error: photoError } = await supabase
        .from('photos')
        .insert({
          project_id: task.project_id,
          task_id: task.id,
          uploaded_by: profile.id,
          photo_url: photoUrl,
          photo_type: 'progress',
        });

      if (photoError) throw photoError;

      onUpdate();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h3>
          <p className="text-gray-600 mb-4">{task.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="text-gray-600">Obra:</span>
              <p className="font-medium">{task.project.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Prazo:</span>
              <p className="font-medium">
                {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem prazo'}
              </p>
            </div>
          </div>

          {task.review_notes && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900 mb-1">Observações da Revisão:</p>
              <p className="text-sm text-red-700">{task.review_notes}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Fotos do Trabalho</h4>
              {task.status !== 'review' && (
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  {uploading ? 'Enviando...' : 'Adicionar Foto'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {task.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {task.photos.map((photo) => (
                  <div key={photo.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || 'Foto da tarefa'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma foto adicionada</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {task.status === 'pending' && (
              <button
                onClick={handleStartTask}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Iniciar Tarefa
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={handleSubmitForReview}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                Enviar para Revisão
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
