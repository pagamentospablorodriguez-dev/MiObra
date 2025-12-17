import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Issue, Profile, Project } from '../../types/database';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface IssueWithDetails extends Issue {
  reporter: Profile;
  project: Project;
}

export default function IssuesList() {
  const [issues, setIssues] = useState<IssueWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();

    const subscription = supabase
      .channel('issues_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => {
        loadIssues();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          reporter:profiles!issues_reported_by_fkey(*),
          project:projects(*)
        `)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica',
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const handleResolve = async (issueId: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', issueId);

      if (error) throw error;
      loadIssues();
    } catch (error) {
      console.error('Error resolving issue:', error);
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
        <h2 className="text-xl font-bold text-gray-900">Problemas Urgentes</h2>
        {issues.length > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
            {issues.length} abertos
          </span>
        )}
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum problema aberto!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{issue.project.name}</span>
                      <span>•</span>
                      <span>{issue.reporter.full_name}</span>
                      <span>•</span>
                      <span>{new Date(issue.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getSeverityColor(issue.severity)}`}>
                  {getSeverityLabel(issue.severity)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleResolve(issue.id)}
                  className="flex-1 bg-green-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-green-700 transition"
                >
                  Marcar como Resolvido
                </button>
                <button className="bg-gray-100 text-gray-700 text-sm py-2 px-4 rounded-lg hover:bg-gray-200 transition">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
