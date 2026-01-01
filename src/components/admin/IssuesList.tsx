import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Issue, Profile, Project } from '../../types/database';
import { AlertTriangle, CheckCircle, X, Image as ImageIcon, Clock } from 'lucide-react';

interface IssueWithDetails extends Issue {
  reporter: Profile;
  project: Project;
}

export default function IssuesList() {
  const [openIssues, setOpenIssues] = useState<IssueWithDetails[]>([]);
  const [resolvedIssues, setResolvedIssues] = useState<IssueWithDetails[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<IssueWithDetails | null>(null);
  const [showHistory, setShowHistory] = useState(false);
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
      const [openRes, resolvedRes] = await Promise.all([
        supabase
          .from('issues')
          .select(`
            *,
            reporter:profiles!issues_reported_by_fkey(*),
            project:projects(*)
          `)
          .in('status', ['open', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('issues')
          .select(`
            *,
            reporter:profiles!issues_reported_by_fkey(*),
            project:projects(*)
          `)
          .eq('status', 'resolved')
          .order('resolved_at', { ascending: false })
          .limit(10),
      ]);

      if (openRes.error) throw openRes.error;
      if (resolvedRes.error) throw resolvedRes.error;

      setOpenIssues(openRes.data || []);
      setResolvedIssues(resolvedRes.data || []);
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
      setSelectedIssue(null);
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
    <>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Problemas Urgentes</h2>
          <div className="flex items-center gap-2">
            {openIssues.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
                {openIssues.length} abertos
              </span>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showHistory ? 'Ver Abertos' : 'Ver Histórico'}
            </button>
          </div>
        </div>

        {showHistory ? (
          resolvedIssues.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum problema resolvido ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resolvedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="border border-gray-200 rounded-lg p-4 bg-green-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{issue.project.name}</span>
                          <span>•</span>
                          <span>{issue.reporter.full_name}</span>
                          <span>•</span>
                          <span>Resolvido em {new Date(issue.resolved_at!).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getSeverityColor(issue.severity)}`}>
                      {getSeverityLabel(issue.severity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : openIssues.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum problema aberto!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {openIssues.map((issue) => (
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
                        {issue.photo_urls && issue.photo_urls.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {issue.photo_urls.length} foto(s)
                            </span>
                          </>
                        )}
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
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="bg-gray-100 text-gray-700 text-sm py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onResolve={handleResolve}
        />
      )}
    </>
  );
}

function IssueDetailModal({
  issue,
  onClose,
  onResolve,
}: {
  issue: IssueWithDetails;
  onClose: () => void;
  onResolve: (id: string) => void;
}) {
  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      critical: 'bg-red-100 text-red-700 border-red-300',
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-2xl font-bold text-gray-900">{issue.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`border-2 rounded-xl p-4 ${getSeverityColor(issue.severity)}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">Gravidade:</span>
              <span className="text-lg font-bold">{getSeverityLabel(issue.severity)}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Descrição do Problema:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-600">Obra:</span>
              <p className="font-bold text-gray-900">{issue.project.name}</p>
              <p className="text-xs text-gray-600 mt-1">{issue.project.address}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-600">Reportado por:</span>
              <p className="font-bold text-gray-900">{issue.reporter.full_name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(issue.created_at).toLocaleDateString('pt-BR')} às {new Date(issue.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {issue.photo_urls && issue.photo_urls.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Fotos do Problema ({issue.photo_urls.length})
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {issue.photo_urls.map((url, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={url}
                      alt={`Foto ${index + 1} do problema`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {issue.status !== 'resolved' && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => onResolve(issue.id)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold"
              >
                Marcar como Resolvido
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-bold"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
