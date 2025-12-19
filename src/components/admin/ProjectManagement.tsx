import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Project } from '../../types/database';
import { Trash2 } from 'lucide-react';

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    budget: '',
    description: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('projects').insert({
        name: formData.name,
        address: formData.address,
        budget: parseFloat(formData.budget),
        description: formData.description,
        status: 'in_progress',
        progress_percentage: 0,
      });

      if (error) throw error;

      setFormData({ name: '', address: '', budget: '', description: '' });
      setShowForm(false);
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Erro ao criar obra');
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta obra?')) return;

    try {
      await supabase.from('projects').delete().eq('id', projectId);
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erro ao deletar obra');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Nova Obra
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Criar Nova Obra</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento (€)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Endereço</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Orçamento</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Progresso</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{project.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{project.address}</td>
                  <td className="px-6 py-3">€{project.budget.toLocaleString()}</td>
                  <td className="px-6 py-3">{project.progress_percentage}%</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
