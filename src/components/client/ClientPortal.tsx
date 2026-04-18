import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Project, Task, Photo, CheckIn, Profile } from '../../types/database';
import { 
  Building2, 
  TrendingUp, 
  Calendar, 
  Users, 
  Image as ImageIcon, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  ArrowRight,
  ChevronRight,
  Activity,
  DollarSign,
  CheckCircle,
  Timer
} from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Cargando su portal...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-sm p-12 border border-gray-100">
            <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bienvenido a su Portal</h2>
            <p className="text-gray-600 text-lg mb-8">
              Aún no hay obras vinculadas a su perfil. Tan pronto como se inicie una obra, podrá seguir todo el progreso por aquí.
            </p>
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
              <Activity className="w-5 h-5" />
              Monitoreo en tiempo real
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {selectedProject ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setSelectedProject(null)}
              className="group flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium"
            >
              <div className="bg-white p-2 rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              Volver a mis obras
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-48 bg-blue-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90" />
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80' )] bg-cover bg-center" />
                <div className="relative h-full flex flex-col justify-end p-8 text-white">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
                          {selectedProject.status === 'in_progress' ? 'En progreso' : 
                           selectedProject.status === 'completed' ? 'Completado' : 
                           selectedProject.status.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1 text-sm opacity-90">
                          <Calendar className="w-4 h-4" />
                          Inicio: {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString('es-ES') : 'A definir'}
                        </span>
                      </div>
                      <h1 className="text-4xl font-bold">{selectedProject.name}</h1>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[280px]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium opacity-90">Progreso de la Obra</span>
                        <span className="text-2xl font-bold">{selectedProject.progress_percentage}%</span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${selectedProject.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <div className="p-8 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Ubicación</span>
                  </div>
                  <p className="text-gray-900 font-semibold leading-tight">{selectedProject.address}</p>
                </div>
                <div className="p-8 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Presupuesto Total</span>
                  </div>
                  <p className="text-gray-900 text-2xl font-bold">€{Number(selectedProject.budget || 0).toLocaleString('es-ES')}</p>
                </div>
                <div className="p-8 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Valor Invertido</span>
                  </div>
                  <p className="text-purple-600 text-2xl font-bold">€{Number(selectedProject.spent || 0).toLocaleString('es-ES')}</p>
                </div>
                <div className="p-8 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Equipo en el Lugar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 text-2xl font-bold">{selectedProject.active_workers}</p>
                    <span className="text-sm text-gray-500 font-medium">profesionales activos</span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Descripción del Proyecto</h3>
                <p className="text-gray-700 text-lg leading-relaxed max-w-4xl">
                  {selectedProject.description || 'No hay una descripción detallada disponible para este proyecto.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Cronograma de Actividades</h3>
                      <p className="text-gray-500">Siga el estado de cada etapa de su obra</p>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-700 font-semibold text-sm">
                      {selectedProject.tasks.length} Tareas Totales
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedProject.tasks.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Timer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Esperando el inicio de las tareas.</p>
                      </div>
                    ) : (
                      selectedProject.tasks.map((task) => (
                        <div key={task.id} className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              task.status === 'approved' ? 'bg-green-50 text-green-600' :
                              task.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              task.status === 'review' ? 'bg-yellow-50 text-yellow-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {task.status === 'approved' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Plazo: {task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'A definir'}
                                </span>
                                {task.quality_score && (
                                  <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                                    Nota: {task.quality_score}/10
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              task.status === 'approved' ? 'bg-green-100 text-green-700' :
                              task.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              task.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {task.status === 'in_progress' ? 'En progreso' : 
                               task.status === 'approved' ? 'Aprobado' : 
                               task.status === 'rejected' ? 'Rechazado' : 
                               task.status === 'review' ? 'En revisión' : 
                               task.status.replace('_', ' ')}
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Galería</h3>
                    <button className="text-blue-600 font-bold text-sm hover:underline">Ver todas</button>
                  </div>

                  {selectedProject.photos.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No hay fotos disponibles.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedProject.photos.slice(0, 4).map((photo) => (
                        <div key={photo.id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                          <img 
                            src={photo.photo_url} 
                            alt={photo.description || 'Foto de la obra'} 
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                            <p className="text-white font-medium text-sm mb-1">
                              {photo.description || 'Registro de progreso'}
                            </p>
                            <p className="text-white/70 text-xs">
                              {new Date(photo.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-lg p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">¿Necesita ayuda?</h3>
                  <p className="opacity-90 mb-6 leading-relaxed">
                    Póngase en contacto directo con el maestro de obras o con el soporte administrativo para cualquier duda sobre su proyecto.
                  </p>
                  <button className="w-full bg-white text-blue-600 font-bold py-4 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20">
                    Hablar con Soporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Mis Obras</h1>
                <p className="text-gray-500 text-lg">Gestione y siga el progreso de todas sus inversiones.</p>
              </div>
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-3 bg-blue-50 rounded-xl">
                  <span className="text-sm text-blue-600 font-bold uppercase tracking-wider">Total de Obras</span>
                  <p className="text-2xl font-black text-blue-700">{projects.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-6 right-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 ${
                        project.status === 'completed' ? 'bg-green-500/80 text-white' :
                        project.status === 'in_progress' ? 'bg-blue-500/80 text-white' :
                        'bg-gray-500/80 text-white'
                      }`}>
                        {project.status === 'in_progress' ? 'En progreso' : 
                         project.status === 'completed' ? 'Completado' : 
                         project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white mb-1">{project.name}</h3>
                      <p className="text-white/80 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.address}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progresso</span>
                        <p className="text-2xl font-black text-gray-900">{project.progress_percentage}%</p>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                        <Activity className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>

                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-8">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:bg-blue-500"
                        style={{ width: `${project.progress_percentage}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Equipo</span>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-gray-900">{project.active_workers}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Tareas</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-gray-900">{project.tasks.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                        Ver Detalles de la Obra
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
