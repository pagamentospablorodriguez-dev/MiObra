import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Project, CheckIn, Task, Issue, Profile } from '../../types/database';
import { AlertCircle, CheckCircle, Clock, Users, Building2, TrendingUp } from 'lucide-react';
import ProjectList from './ProjectList';
import WorkerActivity from './WorkerActivity';
import IssuesList from './IssuesList';
import TaskApproval from './TaskApproval';

interface DashboardStats {
  activeProjects: number;
  totalWorkers: number;
  activeCheckIns: number;
  openIssues: number;
  pendingTasks: number;
  todayProgress: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    totalWorkers: 0,
    activeCheckIns: 0,
    openIssues: 0,
    pendingTasks: 0,
    todayProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        projectsRes,
        workersRes,
        checkInsRes,
        issuesRes,
        tasksRes,
      ] = await Promise.all([
        supabase.from('projects').select('*').in('status', ['in_progress', 'planning']),
        supabase.from('profiles').select('*').eq('role', 'worker').eq('is_active', true),
        supabase.from('check_ins').select('*').is('check_out_time', null),
        supabase.from('issues').select('*').eq('status', 'open'),
        supabase.from('tasks').select('*').eq('status', 'review'),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const { data: todayTasks } = await supabase
        .from('tasks')
        .select('*')
        .gte('completed_at', today)
        .eq('status', 'approved');

      setStats({
        activeProjects: projectsRes.data?.length || 0,
        totalWorkers: workersRes.data?.length || 0,
        activeCheckIns: checkInsRes.data?.length || 0,
        openIssues: issuesRes.data?.length || 0,
        pendingTasks: tasksRes.data?.length || 0,
        todayProgress: todayTasks?.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
            Panel de Control
          </h1>
          <p className="text-gray-600">
            Visión completa de todas sus obras
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Building2 className="w-6 h-6" />}
            title="Obras Activas"
            value={stats.activeProjects}
            color="blue"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Trabajando Ahora"
            value={stats.activeCheckIns}
            subtitle={`de ${stats.totalWorkers} empleados`}
            color="green"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Problemas Abiertos"
            value={stats.openIssues}
            color={stats.openIssues > 0 ? 'red' : 'gray'}
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Esperando Aprobación"
            value={stats.pendingTasks}
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Completados Hoy"
            value={stats.todayProgress}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Progreso Medio"
            value="78%"
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <IssuesList />
          <TaskApproval />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProjectList />
          </div>
          <div>
            <WorkerActivity />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
