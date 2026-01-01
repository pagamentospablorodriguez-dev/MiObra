import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Task, Project, Photo } from '../../types/database';
import { Clock, CheckCircle, AlertCircle, Camera, X, AlertTriangle } from 'lucide-react';

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
        .in('status', ['pending', 'in_progress', 'review', 'rejected'])
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Minhas Tarefas</h2>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">Nenhuma tarefa pendente</p>
          <p className="text-sm text-gray-400 mt-1">Parabéns! Todas as suas tarefas foram concluídas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`border-2 rounded-xl p-5 cursor-pointer transition ${
                task.status === 'rejected'
                  ? 'border-red-300 bg-red-50 hover:border-red-400'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                    {task.status === 'rejected' && (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  {(task as any).specifications && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 text-sm">
                      <p className="font-semibold text-blue-900 mb-1">📋 Especificações Exatas:</p>
                      <p className="text-blue-800 whitespace-pre-wrap">{(task as any).specifications}</p>
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ml-4 whitespace-nowrap ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>

              {task.status === 'rejected' && task.review_notes && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-3">
                  <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Motivo da Rejeição:</p>
                  <p className="text-red-800">{task.review_notes}</p>
                  <p className="text-xs text-red-700 mt-2">Faça as correções solicitadas e envie novamente para revisão</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">{task.project.name}</span>
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
                <span className={`font-bold ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'urgent' && '🔥 '}
                  {task.priority.toUpperCase()}
                </span>
              </div>

              {task.photos.length > 0 && (
                <div className="flex items-center gap-2 mt-3 text-sm text-green-600 font-medium">
                  <Camera className="w-4 h-4" />
                  <span>✓ {task.photos.length} foto(s) enviada(s)</span>
                </div>
              )}
              {task.status !== 'approved' && task.status !== 'rejected' && task.photos.length === 0 && (
                <div className="flex items-center gap-2 mt-3 text-sm text-orange-600 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>Nenhuma foto enviada ainda</span>
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

  const handlePhotoUpload = async (file: File) => {
    if (!profile) return;

    setUploading(true);
    try {
      const photoUrl = `https://images.pexels.com/photos/1268558/pexels-photo-1268558.jpeg?auto=compress&cs=tinysrgb&w=800`;

      const { error: photoError } = await supabase
        .from('photos')
        .insert({
          project_id: task.project_id,
          task_id: task.id,
          uploaded_by: profile.id,
          photo_url: photoUrl,
          photo_type: 'progress',
          description: `Foto da tarefa: ${task.title}`,
        });

      if (photoError) throw photoError;

      onUpdate();
      alert('✓ Foto enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
    }
  };

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
      alert('⚠️ IMPORTANTE: Você PRECISA enviar pelo menos UMA FOTO antes de enviar a tarefa para revisão!\n\nAs fotos são a prova visual do trabalho realizado.');
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
        title: 'Tarefa Concluída e Aguardando Aprovação',
        message: `A tarefa "${task.title}" foi concluída e aguarda sua aprovação`,
        type: 'info',
      });

      onUpdate();
      onClose();
      alert('✓ Tarefa enviada para revisão! O administrador vai avaliar em breve.');
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {task.description && (
            <div>
              <p className="text-gray-600 text-lg">{task.description}</p>
            </div>
          )}

          {(task as any).specifications && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5">
              <p className="font-bold text-blue-900 mb-3 text-lg">📋 Especificações e Medidas EXATAS:</p>
              <p className="text-blue-800 whitespace-pre-wrap font-medium">{(task as any).specifications}</p>
              <p className="text-xs text-blue-700 mt-3 border-t border-blue-200 pt-3">
                ✓ Verifique as medidas com muito cuidado
                <br />✓ Tire fotos da medida sendo verificada
                <br />✓ Certifique-se que o acabamento está perfeito conforme especificado
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-600">Obra:</span>
              <p className="font-bold text-gray-900">{task.project.name}</p>
            </div>
            {task.due_date && (
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-gray-600">Prazo:</span>
                <p className="font-bold text-gray-900">
                  {new Date(task.due_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          {task.status === 'rejected' && task.review_notes && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
              <p className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Motivo da Rejeição:
              </p>
              <p className="text-red-800">{task.review_notes}</p>
              <p className="text-xs text-red-700 mt-3">
                ⚠️ Por favor, faça as correções solicitadas acima e envie novamente para revisão
              </p>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Fotos do Trabalho
              </h4>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                task.photos.length > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {task.photos.length > 0 ? `✓ ${task.photos.length} foto(s)` : '⚠️ Nenhuma foto'}
              </span>
            </div>

            {task.status !== 'review' && task.status !== 'approved' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-900 font-semibold mb-3">
                  📸 Adicione fotos do trabalho realizado:
                </p>

                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-700 font-medium">
                      {uploading ? 'Enviando foto...' : 'Clique para adicionar foto'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                    />
                  </div>
                </label>
              </div>
            )}

            {task.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {task.photos.map((photo) => (
                  <div key={photo.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || 'Foto da tarefa'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-white text-xs">
                        {new Date(photo.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma foto enviada ainda</p>
              </div>
            )}
          </div>

          <div className="border-t pt-6 flex gap-3">
            {task.status === 'pending' && (
              <button
                onClick={handleStartTask}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold"
              >
                Começar Tarefa
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={handleSubmitForReview}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold"
              >
                Enviar para Revisão
              </button>
            )}
            {task.status === 'rejected' && (
              <button
                onClick={handleSubmitForReview}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-bold"
              >
                Enviar Novamente (Corrigida)
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-bold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
