import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Project, Profile } from '../../types/database';
import { Building2, TrendingUp, Users, AlertTriangle } from 'lucide-react';

interface ProjectWithClient extends Project {
  client: Profile | null;
  active_workers: number;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();

    const subscription = supabase
      .channel('projects_list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        loadProjects();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProjects = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .in('status', ['in_progress', 'planning'])
        .order('progress_percentage', { ascending: true });

      if (error) throw error;

      if (projectsData) {
        const projectsWithDetails = await Promise.all(
          projectsData.map(async (project) => {
            const [clientRes, checkInsRes] = await Promise.all([
              project.client_id
                ? supabase.from('profiles').select('*').eq('id', project.client_id).maybeSingle()
                : Promise.resolve({ data: null }),
              supabase.from('check_ins').select('*').eq('project_id', project.id).is('check_out_time', null),
            ]);

            return {
              ...project,
              client: clientRes.data,
              active_workers: checkInsRes.data?.length || 0,
            };
          })
        );

        setProjects(projectsWithDetails);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
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
      planning: 'Planejamento',
      in_progress: 'Em Andamento',
      paused: 'Pausada',
      completed: 'Concluída',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Obras Ativas</h2>
        <span className="text-sm text-gray-500">{projects.length} em andamento</span>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma obra ativa no momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const isOverBudget = project.spent > project.budget;
            const budgetPercent = (project.spent / project.budget) * 100;

            return (
              <div
                key={project.id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{project.name}</h3>
                      {isOverBudget && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Acima do orçamento
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{project.address}</p>
                    {project.client && (
                      <p className="text-xs text-gray-500 mt-1">
                        Cliente: {project.client.full_name}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-600">Progresso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {project.progress_percentage}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600">Trabalhando</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {project.active_workers} {project.active_workers === 1 ? 'pessoa' : 'pessoas'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600">Orçamento</span>
                    </div>
                    <p className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                      {budgetPercent.toFixed(0)}% usado
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      €{Number(project.spent).toLocaleString()} / €{Number(project.budget).toLocaleString()}
                    </span>
                    {project.expected_end_date && (
                      <span className="text-gray-500">
                        Prazo: {new Date(project.expected_end_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
