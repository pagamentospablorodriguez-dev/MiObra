import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Project, Profile } from '../../types/database';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    budget: '',
    spent: '',
    description: '',
    client_id: '',
    status: 'in_progress' as 'planning' | 'in_progress' | 'paused' | 'completed',
    start_date: '',
    expected_end_date: '',
    progress_percentage: '0',
  });

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .eq('is_active', true);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      name: formData.name,
      address: formData.address,
      budget: parseFloat(formData.budget) || 0,
      spent: parseFloat(formData.spent) || 0,
      description: formData.description || null,
      status: formData.status,
      progress_percentage: parseInt(formData.progress_percentage) || 0,
      client_id: formData.client_id || null,
      start_date: formData.start_date || null,
      expected_end_date: formData.expected_end_date || null,
    };

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
        alert('¡Obra actualizada con éxito!');
      } else {
        const { error } = await supabase.from('projects').insert(projectData);

        if (error) throw error;
        alert('¡Obra creada con éxito!');
      }

      resetForm();
      await loadProjects();
    } catch (error: any) {
      console.error('Error saving project:', error);
      alert('Error al guardar la obra: ' + error.message);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      address: project.address,
      budget: project.budget.toString(),
      spent: project.spent.toString(),
      description: project.description || '',
      client_id: project.client_id || '',
      status: project.status,
      start_date: project.start_date || '',
      expected_end_date: project.expected_end_date || '',
      progress_percentage: project.progress_percentage.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta obra? Todas las tareas, fotos y datos relacionados se perderán.')) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      alert('¡Obra eliminada con éxito!');
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error al eliminar la obra');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      budget: '',
      spent: '',
      description: '',
      client_id: '',
      status: 'in_progress',
      start_date: '',
      expected_end_date: '',
      progress_percentage: '0',
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      paused: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planning: 'Planificación',
      in_progress: 'En Curso',
      paused: 'Pausada',
      completed: 'Completada',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Obras</h2>
          <p className="text-gray-600 mt-1">Cree y gestione todas las obras y sus detalles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Obra
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {editingProject ? 'Editar Obra' : 'Crear Nueva Obra'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Obra *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Casa de la Familia Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Calle, número, barrio, ciudad"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sin cliente asignado</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="planning">Planificación</option>
                  <option value="in_progress">En Curso</option>
                  <option value="paused">Pausada</option>
                  <option value="completed">Completada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presupuesto Total (€) *
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  placeholder="50000.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gasto Actual (€)
                </label>
                <input
                  type="number"
                  value={formData.spent}
                  onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previsión de Finalización
                </label>
                <input
                  type="date"
                  value={formData.expected_end_date}
                  onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progreso (0-100%)
                </label>
                <input
                  type="number"
                  value={formData.progress_percentage}
                  onChange={(e) => setFormData({ ...formData, progress_percentage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción de la Obra
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describa los detalles de la obra, especificaciones, etc."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {editingProject ? 'Actualizar Obra' : 'Crear Obra'}
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Obra</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Progreso</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Presupuesto</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Gasto</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Ninguna obra registrada
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const client = clients.find(c => c.id === project.client_id);
                  return (
                    <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          <p className="text-sm text-gray-600">{project.address}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {client ? client.full_name : <span className="text-gray-400">Sin cliente</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{project.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        €{Number(project.budget || 0).toLocaleString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className={project.spent > project.budget ? 'text-red-600 font-medium' : 'text-gray-900'}>
                            €{Number(project.spent || 0).toLocaleString('es-ES')}
                          </span>
                          {project.spent > project.budget && (
                            <p className="text-xs text-red-600">¡Por encima del presupuesto!</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
