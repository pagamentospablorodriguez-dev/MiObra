import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Task, Project, Profile } from '../../types/database';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface TaskWithDetails extends Task {
  project: Project;
  worker: Profile | null;
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specifications: '',
    project_id: '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: '',
    status: 'pending' as 'pending' | 'in_progress' | 'review' | 'approved' | 'rejected',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes, workersRes] = await Promise.all([
        supabase
          .from('tasks')
          .select(`
            *,
            project:projects(*),
            worker:profiles!tasks_assigned_to_fkey(*)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('name'),
        supabase.from('profiles').select('*').eq('role', 'worker').eq('is_active', true),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (workersRes.error) throw workersRes.error;

      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setWorkers(workersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.project_id) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: formData.title,
            description: formData.description || null,
            specifications: formData.specifications || null,
            project_id: formData.project_id,
            assigned_to: formData.assigned_to || null,
            priority: formData.priority,
            due_date: formData.due_date || null,
            status: formData.status,
          })
          .eq('id', editingTask.id);

        if (error) throw error;
        alert('Tarefa atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('tasks').insert({
          title: formData.title,
          description: formData.description || null,
          specifications: formData.specifications || null,
          project_id: formData.project_id,
          assigned_to: formData.assigned_to || null,
          priority: formData.priority,
          due_date: formData.due_date || null,
          status: 'pending',
        });

        if (error) throw error;

        if (formData.assigned_to) {
          await supabase.from('notifications').insert({
            user_id: formData.assigned_to,
            title: 'Nova Tarefa Atribuída',
            message: `Você recebeu uma nova tarefa: ${formData.title}`,
            type: 'info',
          });
        }

        alert('Tarefa criada com sucesso!');
      }

      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving task:', error);
      alert('Erro ao salvar tarefa: ' + error.message);
    }
  };

  const handleEdit = (task: TaskWithDetails) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      specifications: (task as any).specifications || '',
      project_id: task.project_id,
      assigned_to: task.assigned_to || '',
      priority: task.priority,
      due_date: task.due_date || '',
      status: task.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      alert('Tarefa deletada com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Erro ao deletar tarefa');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      specifications: '',
      project_id: '',
      assigned_to: '',
      priority: 'medium',
      due_date: '',
      status: 'pending',
    });
    setEditingTask(null);
    setShowForm(false);
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
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      urgent: 'Urgente',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Tarefas</h2>
          <p className="text-gray-600 mt-1">Crie e gerencie tarefas das obras</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {editingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Instalar portas do 2º andar"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Geral
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição geral da tarefa..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especificações e Medidas Exatas (opcional)
                </label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                  rows={4}
                  placeholder="Exemplo:
• Parede: 3 metros de largura x 2.5 metros de altura
• Cor: Branco gelo (Suvinil código 10001)
• Material: Tinta PVA premium
• Acabamento: Sem imperfeições, liso perfeito"
                />
                <p className="text-xs text-blue-600 mt-1">💡 Use este campo quando precisar de medidas exatas e acabamentos específicos</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obra *
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione a obra</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atribuir a Funcionário
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Não atribuído</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {editingTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="review">Em Revisão</option>
                    <option value="approved">Aprovada</option>
                    <option value="rejected">Recusada</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {editingTask ? 'Atualizar Tarefa' : 'Criar Tarefa'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tarefa</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Obra</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Funcionário</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Prioridade</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Prazo</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma tarefa cadastrada
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">{task.description}</p>
                        )}
                        {(task as any).specifications && (
                          <p className="text-xs text-blue-600 mt-1">✓ Com especificações</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{task.project.name}</td>
                    <td className="px-6 py-4 text-sm">
                      {task.worker ? task.worker.full_name : <span className="text-gray-400">Não atribuído</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
