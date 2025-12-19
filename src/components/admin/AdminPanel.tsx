import { useState } from 'react';
import { Bolt Database } from '../../lib/supabase';
import { ArrowLeft, Plus } from 'lucide-react';
import UserManagement from './UserManagement';
import ProjectManagement from './ProjectManagement';

type TabType = 'users' | 'projects' | 'tasks';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('users');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'projects'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Obras
        </button>
      </div>

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'projects' && <ProjectManagement />}
    </div>
  );
}
