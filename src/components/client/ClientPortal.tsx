import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Project, Task, Photo, CheckIn, Profile } from '../../types/database';
import { Building2, TrendingUp, Calendar, Users, Image as ImageIcon, Clock } from 'lucide-react';

interface ProjectWithDetails extends Project {
  tasks: Task[];
  photos: Photo[];
  active_workers: number;
}

export default function ClientPortal() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();

    const subscription = supabase
      .channel('client_projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        loadProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => {
        loadProjects();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile]);

  const loadProjects = async () => {
    if (!profile) return;

    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (projectsData) {
        const projectsWithDetails = await Promise.all(
          projectsData.map(async (project) => {
            const [tasksRes, photosRes, checkInsRes] = await Promise.all([
              supabase.from('tasks').select('*').eq('project_id', project.id),
              supabase.from('photos').select('*').eq('project_id', project.id).eq('is_approved', true).order('created_at', { ascending: false }),
              supabase.from('check_ins').select('*').eq('project_id', project.id).is('check_out_time', null),
            ]);

            return {
              ...project,
              tasks: tasksRes.data || [],
              photos: photosRes.data || [],
              active_workers: checkInsRes.data?.length || 0,
            };
          })
        );

        setProjects(projectsWithDetails);
        if (selectedProject) {
          const updated = projectsWithDetails.find(p => p.id === selectedProject.id);
          if (updated) setSelectedProject(updated);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minhas Obras
          </h1>
          <p className="text-gray-600">
            Acompanhe o progresso em tempo real
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma obra cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition hover:shadow-md ${
                    selectedProject?.id === project.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <h3 className="font-bold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{project.address}</p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span className="font-medium">{project.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{project.active_workers} trabalhando</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <ImageIcon className="w-4 h-4" />
                        <span>{project.photos.length} fotos</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedProject ? (
                <ProjectDetails project={selectedProject} />
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <p className="text-gray-500">Selecione uma obra para ver detalhes</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectDetails({ project }: { project: ProjectWithDetails }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'tasks'>('overview');

  const completedTasks = project.tasks.filter(t => t.status === 'approved').length;
  const totalTasks = project.tasks.length;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h2>
        <p className="text-gray-600">{project.address}</p>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'photos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Fotos ({project.photos.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'tasks'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tarefas ({completedTasks}/{totalTasks})
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <span className="text-sm text-gray-600">Progresso</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{project.progress_percentage}%</p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-green-600" />
                  <span className="text-sm text-gray-600">Trabalhando Agora</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{project.active_workers}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  <span className="text-sm text-gray-600">Prazo</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {project.expected_end_date
                    ? new Date(project.expected_end_date).toLocaleDateString('pt-BR')
                    : 'Sem prazo'}
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <span className="text-sm text-gray-600">Tarefas Concluídas</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
            </div>

            {project.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Orçamento</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Gasto</span>
                  <span className="font-medium">€{project.spent.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(project.spent / project.budget) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Orçamento Total</span>

                  
                  <span className="font-medium">€{Number(project.budget || 0).toLocaleString()}</span>
                
                
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            {project.photos.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma foto disponível</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {project.photos.map((photo) => (
                  <div key={photo.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden group relative">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || 'Foto do projeto'}
                      className="w-full h-full object-cover"
                    />
                    {photo.description && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition flex items-end p-4">
                        <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition">
                          {photo.description}
                        </p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 text-xs text-gray-600">
                      {new Date(photo.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {project.tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhuma tarefa cadastrada</p>
              </div>
            ) : (
              project.tasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      {task.quality_score !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Qualidade:</span>
                          <span className="text-sm font-medium text-blue-600">
                            {task.quality_score}/10
                          </span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {task.status === 'approved'
                        ? 'Concluída'
                        : task.status === 'in_progress'
                        ? 'Em Andamento'
                        : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
