import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile, Task } from '../../types/database';
import { TrendingUp, Star, CheckCircle, AlertCircle } from 'lucide-react';

interface WorkerWithStats extends Profile {
  totalTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
  avgQualityScore: number;
  recentTasks: Task[];
}

export default function WorkerStats() {
  const [workers, setWorkers] = useState<WorkerWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkerStats();
  }, []);

  const loadWorkerStats = async () => {
    try {
      const { data: workersData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (workersData) {
        const workersWithStats = await Promise.all(
          workersData.map(async (worker) => {
            const { data: allTasks } = await supabase
              .from('tasks')
              .select('*')
              .eq('assigned_to', worker.id);

            const { data: recentTasks } = await supabase
              .from('tasks')
              .select('*')
              .eq('assigned_to', worker.id)
              .order('created_at', { ascending: false })
              .limit(3);

            const approvedTasks = allTasks?.filter(t => t.status === 'approved').length || 0;
            const rejectedTasks = allTasks?.filter(t => t.status === 'rejected').length || 0;
            const tasksWithQuality = allTasks?.filter(t => t.quality_score !== null && t.status === 'approved') || [];
            const avgQuality = tasksWithQuality.length > 0
              ? tasksWithQuality.reduce((sum, t) => sum + (t.quality_score || 0), 0) / tasksWithQuality.length
              : 0;

            return {
              ...worker,
              totalTasks: allTasks?.length || 0,
              approvedTasks,
              rejectedTasks,
              avgQualityScore: avgQuality,
              recentTasks: recentTasks || [],
            };
          })
        );

        setWorkers(workersWithStats.sort((a, b) => b.approvedTasks - a.approvedTasks));
      }
    } catch (error) {
      console.error('Error loading worker stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (avgScore: number) => {
    if (avgScore >= 8) return 'text-green-600';
    if (avgScore >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBg = (avgScore: number) => {
    if (avgScore >= 8) return 'bg-green-50 border-green-200';
    if (avgScore >= 6) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
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
        <h2 className="text-2xl font-bold text-gray-900">Desempenho dos Funcionários</h2>
        <span className="text-sm text-gray-500">{workers.length} funcionários ativos</span>
      </div>

      {workers.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum funcionário cadastrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className={`border-2 border-gray-200 rounded-xl p-5 hover:shadow-md transition ${getPerformanceBg(worker.avgQualityScore)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{worker.full_name}</h3>
                  {worker.phone && (
                    <p className="text-sm text-gray-600">{worker.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className={`w-5 h-5 ${getPerformanceColor(worker.avgQualityScore)}`} />
                    <span className={`text-lg font-bold ${getPerformanceColor(worker.avgQualityScore)}`}>
                      {worker.avgQualityScore > 0 ? worker.avgQualityScore.toFixed(1) : '-'}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {worker.rating > 0 ? `Avaliação: ${worker.rating.toFixed(1)}` : 'Sem avaliação'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{worker.totalTasks}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3 text-center">
                  <p className="text-sm text-green-700 font-semibold">Aprovadas</p>
                  <p className="text-2xl font-bold text-green-700">{worker.approvedTasks}</p>
                </div>
                <div className="bg-red-100 rounded-lg p-3 text-center">
                  <p className="text-sm text-red-700 font-semibold">Recusadas</p>
                  <p className="text-2xl font-bold text-red-700">{worker.rejectedTasks}</p>
                </div>
              </div>

              {worker.totalTasks > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Taxa de Aprovação</span>
                    <span className="font-bold text-gray-900">
                      {((worker.approvedTasks / worker.totalTasks) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(worker.approvedTasks / worker.totalTasks) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {worker.recentTasks.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Tarefas Recentes:</p>
                  <div className="space-y-1">
                    {worker.recentTasks.slice(0, 2).map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-xs">
                        {task.status === 'approved' && (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        )}
                        {task.status === 'rejected' && (
                          <AlertCircle className="w-3 h-3 text-red-600" />
                        )}
                        {!['approved', 'rejected'].includes(task.status) && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                        <span className="text-gray-700">{task.title}</span>
                        {task.quality_score && (
                          <span className="text-gray-500">({task.quality_score}/10)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
