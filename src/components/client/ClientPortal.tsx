import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Project, Task, Photo } from '../../types/database';
import { Building2, TrendingUp, Calendar, Users, Image as ImageIcon, Clock, DollarSign, AlertTriangle } from 'lucide-react';

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

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas obras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Suas Obras
          </h1>
          <p className="text-gray-600">
            Acompanhe o progresso em tempo real das suas construções
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">Nenhuma obra cadastrada</p>
            <p className="text-sm text-gray-500">Entre em contato com o administrador para associar obras à sua conta</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {projects.map((project) => {
                const daysRemaining = getDaysRemaining(project.expected_end_date);
                const budgetPercent = (project.spent / project.budget) * 100;
                const isOverBudget = project.spent > project.budget;

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition hover:shadow-lg ${
                      selectedProject?.id === project.id ? 'ring-2 ring-blue-500 shadow-md' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
                      {isOverBudget && (
                        <div className="bg-red-100 p-1 rounded">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{project.address}</p>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 font-medium">Progresso</span>
                          <span className="font-bold text-blue-600">{project.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${project.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{project.active_workers} trabalhando</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <ImageIcon className="w-4 h-4" />
                          <span>{project.photos.length} fotos</span>
                        </div>
                      </div>

                      {daysRemaining !== null && (
                        <div className={`text-sm font-medium ${
                          daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {daysRemaining < 0
                            ? `Atrasado ${Math.abs(daysRemaining)} dias`
                            : `${daysRemaining} dias restantes`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-2">
              {selectedProject ? (
                <ProjectDetails project={selectedProject} />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Selecione uma obra para ver os detalhes</p>
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
  const budgetPercent = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
  const isOverBudget = project.spent > project.budget;
  const remaining = project.budget - project.spent;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h2>
        <p className="text-gray-600">{project.address}</p>
        {project.description && (
          <p className="text-sm text-gray-500 mt-2">{project.description}</p>
        )}
      </div>

      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'photos'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Fotos ({project.photos.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'tasks'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Tarefas ({completedTasks}/{totalTasks})
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-900">Progresso Geral</span>
                </div>
                <p className="text-4xl font-bold text-blue-900">{project.progress_percentage}%</p>
                <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-900">Trabalhando Agora</span>
                </div>
                <p className="text-4xl font-bold text-green-900">{project.active_workers}</p>
                <p className="text-sm text-green-700 mt-2">
                  {project.active_workers > 0 ? 'Equipe ativa na obra' : 'Ninguém trabalhando no momento'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-purple-900">Prazo</span>
                </div>
                <p className="text-xl font-bold text-purple-900">
                  {project.expected_end_date
                    ? new Date(project.expected_end_date).toLocaleDateString('pt-BR')
                    : 'Não definido'}
                </p>
                {project.start_date && (
                  <p className="text-sm text-purple-700 mt-2">
                    Início: {new Date(project.start_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-orange-900">Tarefas</span>
                </div>
                <p className="text-4xl font-bold text-orange-900">
                  {completedTasks}/{totalTasks}
                </p>
                <p className="text-sm text-orange-700 mt-2">Tarefas concluídas</p>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Orçamento e Gastos
                </h3>
                {isOverBudget && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Acima do Orçamento
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Orçamento Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    €{Number(project.budget || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Gasto Atual</span>
                  <span className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
                    €{Number(project.spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Utilização do Orçamento</span>
                    <span className={`text-sm font-bold ${
                      budgetPercent > 100 ? 'text-red-600' : budgetPercent > 80 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {budgetPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        budgetPercent > 100 ? 'bg-red-600' : budgetPercent > 80 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  remaining >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${remaining >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {remaining >= 0 ? 'Saldo Restante' : 'Valor Excedido'}
                    </span>
                    <span className={`text-xl font-bold ${remaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      €{Math.abs(remaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            {project.photos.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Nenhuma foto disponível ainda</p>
                <p className="text-sm text-gray-400">As fotos aparecerão aqui conforme o trabalho avança</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {project.photos.map((photo) => (
                  <div key={photo.id} className="aspect-video bg-gray-100 rounded-xl overflow-hidden group relative shadow-sm hover:shadow-md transition">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || 'Foto do projeto'}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {photo.description && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                        <p className="text-white text-sm font-medium">
                          {photo.description}
                        </p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white rounded-lg px-3 py-1 text-xs font-medium text-gray-700 shadow">
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
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Nenhuma tarefa cadastrada</p>
                <p className="text-sm text-gray-400">As tarefas aparecerão aqui quando forem criadas</p>
              </div>
            ) : (
              project.tasks.map((task) => (
                <div key={task.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      )}
                      {task.quality_score !== null && task.status === 'approved' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">Qualidade:</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-4 rounded-sm ${
                                  i < task.quality_score! ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                            <span className="text-sm font-bold text-gray-900 ml-1">
                              {task.quality_score}/10
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ml-4 ${
                        task.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : task.status === 'review'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {task.status === 'approved' && '✓ Concluída'}
                      {task.status === 'in_progress' && '⏳ Em Andamento'}
                      {task.status === 'review' && '👀 Em Revisão'}
                      {task.status === 'pending' && '⏸ Pendente'}
                      {task.status === 'rejected' && '✗ Recusada'}
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
