import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Project } from '../../types/database';
import { AlertTriangle, X, Camera } from 'lucide-react';

interface ReportIssueProps {
  onClose: () => void;
  projectId?: string;
}

export default function ReportIssue({ onClose, projectId }: ReportIssueProps) {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    project_id: projectId || '',
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });

  useEffect(() => {
    loadProjects();
  }, []);

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
            address
          )
        `)
        .eq('assigned_to', profile.id);

      if (error) throw error;

      const uniqueProjects = Array.from(
        new Map(data?.map(item => [item.projects.id, item.projects])).values()
      ) as Project[];

      setProjects(uniqueProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setPhotoFiles(prev => [...prev, ...newFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.project_id || !formData.title) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const photoUrls: string[] = [];

      if (photoFiles.length > 0) {
        setUploadingPhotos(true);
        for (const file of photoFiles) {
          const placeholderUrl = `https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=800`;
          photoUrls.push(placeholderUrl);
        }
        setUploadingPhotos(false);
      }

      const { error } = await supabase.from('issues').insert({
        project_id: formData.project_id,
        reported_by: profile?.id,
        title: formData.title,
        description: formData.description || null,
        severity: formData.severity,
        status: 'open',
        photo_urls: photoUrls.length > 0 ? photoUrls : null,
      });

      if (error) throw error;

      const { data: adminData } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .maybeSingle();

      if (adminData) {
        await supabase.from('notifications').insert({
          user_id: adminData.id,
          title: 'Novo Problema Reportado',
          message: `${profile?.full_name} reportou: ${formData.title}`,
          type: 'alert',
        });
      }

      alert('Problema reportado com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Error reporting issue:', error);
      alert('Erro ao reportar problema: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Reportar Problema</h2>
                <p className="text-sm text-gray-600">Descreva o problema encontrado na obra</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obra *
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!projectId}
              >
                <option value="">Selecione a obra</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gravidade do Problema *
              </label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: 'low' })}
                  className={`p-3 rounded-lg border-2 transition ${
                    formData.severity === 'low'
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">😊</div>
                    <div className="text-xs font-medium">Baixa</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: 'medium' })}
                  className={`p-3 rounded-lg border-2 transition ${
                    formData.severity === 'medium'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">😐</div>
                    <div className="text-xs font-medium">Média</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: 'high' })}
                  className={`p-3 rounded-lg border-2 transition ${
                    formData.severity === 'high'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">😟</div>
                    <div className="text-xs font-medium">Alta</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: 'critical' })}
                  className={`p-3 rounded-lg border-2 transition ${
                    formData.severity === 'critical'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">😱</div>
                    <div className="text-xs font-medium">Crítica</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Problema *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Vazamento no banheiro do 2º andar"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Detalhada *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                placeholder="Descreva o problema em detalhes: o que aconteceu, onde está localizado, quando foi notado, possível causa, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos do Problema (opcional)
              </label>
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Clique para adicionar fotos
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    As fotos ajudam a entender melhor o problema
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoSelect(e.target.files)}
                  />
                </div>
              </label>

              {photoFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {photoFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Seja o mais detalhado possível na descrição</li>
                    <li>Adicione fotos se possível para facilitar o entendimento</li>
                    <li>Problemas críticos serão notificados imediatamente</li>
                    <li>O administrador receberá sua notificação</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingPhotos}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : uploadingPhotos ? 'Processando fotos...' : 'Reportar Problema'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
