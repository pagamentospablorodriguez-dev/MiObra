import { useState } from 'react';
import { Bell, Menu, X, LogOut, User, Settings } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export default function Header({ userName = 'Usuário', userRole = 'admin', onLogout }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Tarefa Aprovada', message: 'Sua tarefa foi aprovada com nota 9/10', time: '2h' },
    { id: 2, title: 'Novo Problema', message: 'Problema crítico reportado na Obra Centro', time: '4h' },
    { id: 3, title: 'Check-in Registrado', message: 'Seu check-in foi registrado com sucesso', time: '6h' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AO</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900">AlaObra</h1>
              <p className="text-xs text-slate-500">Gestão de Obras</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-900">Notificações</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <p className="font-medium text-slate-900">{notif.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-slate-500 mt-2">{notif.time} atrás</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Ver todas as notificações
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                </div>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <p className="font-medium text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
                      <User size={16} />
                      <span className="text-sm">Meu Perfil</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
                      <Settings size={16} />
                      <span className="text-sm">Configurações</span>
                    </button>
                  </div>
                  <div className="border-t border-slate-200 p-2">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition rounded-lg"
                    >
                      <LogOut size={16} />
                      <span className="text-sm font-medium">Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-200 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition rounded-lg">
              <Bell size={18} />
              <span>Notificações</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition rounded-lg">
              <User size={18} />
              <span>Meu Perfil</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition rounded-lg">
              <Settings size={18} />
              <span>Configurações</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition rounded-lg"
            >
              <LogOut size={18} />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
