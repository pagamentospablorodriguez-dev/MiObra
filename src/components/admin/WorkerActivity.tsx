import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckIn, Profile } from '../../types/database';
import { Clock, MapPin, User } from 'lucide-react';

interface WorkerCheckIn extends CheckIn {
  worker: Profile;
}

export default function WorkerActivity() {
  const [checkIns, setCheckIns] = useState<WorkerCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckIns();

    const subscription = supabase
      .channel('check_ins_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_ins' }, () => {
        loadCheckIns();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadCheckIns = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('check_ins')
        .select(`
          *,
          worker:profiles!check_ins_worker_id_fkey(*)
        `)
        .gte('check_in_time', today)
        .order('check_in_time', { ascending: false });

      if (error) throw error;
      setCheckIns(data || []);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWorkingHours = (checkIn: CheckIn) => {
    const start = new Date(checkIn.check_in_time);
    const end = checkIn.check_out_time ? new Date(checkIn.check_out_time) : new Date();
    const hours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor(((end.getTime() - start.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Atividade dos Funcionários</h2>

      {checkIns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum check-in hoje</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className={`border rounded-lg p-4 ${
                checkIn.check_out_time ? 'border-gray-200 bg-gray-50' : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  checkIn.check_out_time ? 'bg-gray-200' : 'bg-green-200'
                }`}>
                  <User className="w-4 h-4 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {checkIn.worker.full_name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(checkIn.check_in_time)}</span>
                    {checkIn.check_out_time && (
                      <>
                        <span>→</span>
                        <span>{formatTime(checkIn.check_out_time)}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    {!checkIn.check_out_time ? (
                      <span className="text-green-600 font-medium">
                        Trabalhando: {getWorkingHours(checkIn)}
                      </span>
                    ) : (
                      <span>Total: {getWorkingHours(checkIn)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
