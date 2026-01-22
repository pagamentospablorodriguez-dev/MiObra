import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Task, Profile, Project, Photo } from '../../types/database';
import { CheckCircle, XCircle, Image, User } from 'lucide-react';

interface TaskWithDetails extends Task {
  worker: Profile;
  project: Project;
  photos: Photo[];
}

export default function TaskApproval() {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);

  useEffect(() => {
    loadTasks();

    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTasks = async () => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          worker:profiles!tasks_assigned_to_fkey(*),
          project:projects(*)
        `)
        .eq('status', 'review')
        .order('created_at', { ascending: false })
        .limit(5);

      if (tasksError) throw tasksError;

      if (tasksData) {
        const tasksWithPhotos = await Promise.all(
          tasksData.map(async (task) => {
            const { data: photos } = await supabase
              .from('photos')
              .select('*')
              .eq('task_id', task.id)
              .order('created_at', { ascending: false });

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

  const handleApprove = async (taskId: string, qualityScore: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'approved',
          quality_score: qualityScore,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: selectedTask?.assigned_to,
        title: '¡Tarea Aprobada!',
        message: `Su tarea "${selectedTask?.title}" fue aprobada con nota ${qualityScore}/10`,
        type: 'success',
      });

      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error approving task:', error);
    }
  };

  const handleReject = async (taskId: string, reviewNotes: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'rejected',
          review_notes: reviewNotes,
        })
        .eq('id', taskId);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: selectedTask?.assigned_to,
        title: 'Tarea Rechazada',
        message: `Su tarea "${selectedTask?.title}" necesita correcciones: ${reviewNotes}`,
        type: 'warning',
      });

      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error rejecting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Esperando Aprobación</h2>
        {tasks.length > 0 && (
          <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
            {tasks.length} tareas
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">¡Todo aprobado!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span>{task.worker?.full_name}</span>
                    <span>•</span>
                    <span>{task.project.name}</span>
                  </div>
                  {task.photos.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Image className="w-4 h-4" />
                      <span>{task.photos.length} foto(s) adjunta(s)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTask(task)}
                  className="flex-1 bg-green-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-green-700 transition"
                >
                  Revisar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskReviewModal
          task={selectedTask}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

function TaskReviewModal({
  task,
  onApprove,
  onReject,
  onClose,
}: {
  task: TaskWithDetails;
  onApprove: (taskId: string, score: number) => void;
  onReject: (taskId: string, notes: string) => void;
  onClose: () => void;
}) {
  const [score, setScore] = useState(8);
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h3>
          <p className="text-gray-600 mb-4">{task.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="text-gray-600">Empleado:</span>
              <p className="font-medium">{task.worker?.full_name}</p>
            </div>
            <div>
              <span className="text-gray-600">Obra:</span>
              <p className="font-medium">{task.project.name}</p>
            </div>
          </div>

          {task.photos.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Fotos del Trabajo</h4>
              <div className="grid grid-cols-2 gap-4">
                {task.photos.map((photo) => (
                  <div key={photo.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || 'Foto de la tarea'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota de Calidad (0-10)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-2xl font-bold text-blue-600 mt-2">
              {score}/10
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Comentarios sobre el trabajo..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onApprove(task.id, score)}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Aprobar
            </button>
            <button
              onClick={() => {
                if (notes.trim()) {
                  onReject(task.id, notes);
                } else {
                  alert('Por favor, añada observaciones sobre lo que necesita ser corregido');
                }
              }}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Rechazar
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
