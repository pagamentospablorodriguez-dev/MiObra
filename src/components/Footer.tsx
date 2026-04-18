import { Building2, Shield, Zap, HeartHandshake } from 'lucide-react';

interface FooterProps {
  role?: 'admin' | 'worker' | 'client';
}

export default function Footer({ role }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">AlaObra</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Gestión profesional de obras en tiempo real. Controla todo desde cualquier lugar.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Funcionalidades
            </p>
            <div className="grid grid-cols-1 gap-2">
              {role === 'admin' && (
                <>
                  <FooterLink label="Dashboard de Control" />
                  <FooterLink label="Aprobación de Tareas" />
                  <FooterLink label="Gestión de Empleados" />
                  <FooterLink label="Reportes de Problemas" />
                </>
              )}
              {role === 'worker' && (
                <>
                  <FooterLink label="Check-in / Check-out" />
                  <FooterLink label="Mis Tareas" />
                  <FooterLink label="Envío de Fotos" />
                  <FooterLink label="Reportar Problemas" />
                </>
              )}
              {role === 'client' && (
                <>
                  <FooterLink label="Seguimiento de Obra" />
                  <FooterLink label="Galería de Fotos" />
                  <FooterLink label="Progreso en Tiempo Real" />
                  <FooterLink label="Control de Presupuesto" />
                </>
              )}
              {!role && (
                <>
                  <FooterLink label="Monitoreo Remoto" />
                  <FooterLink label="Control de Calidad" />
                  <FooterLink label="Portal del Cliente" />
                  <FooterLink label="Alertas en Tiempo Real" />
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Garantías
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <div className="bg-green-50 p-1.5 rounded-md flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-green-600" />
                </div>
                Actualizaciones en tiempo real
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <div className="bg-blue-50 p-1.5 rounded-md flex-shrink-0">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                </div>
                Datos seguros y cifrados
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <div className="bg-purple-50 p-1.5 rounded-md flex-shrink-0">
                  <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
                </div>
                Soporte disponible
              </div>
            </div>
          </div>
        </div>

        <div className="py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {year} AlaObra · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-gray-400">Sistema operativo</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500">
      <div className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
      {label}
    </div>
  );
}
