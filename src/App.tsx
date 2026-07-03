import { useState, useEffect } from 'react';
import { LayoutDashboard, Columns, Settings as SettingsIcon, MessageSquare, Plus, X, Sun, Moon } from 'lucide-react';
import Kanban from './components/Kanban';
import Dashboard from './components/Dashboard';
import SettingsView from './components/SettingsView';
import Chat from './components/Chat';
import AddLeadModal from './components/AddLeadModal';
import { Lead, Settings } from './types';

export default function App() {
  const [view, setView] = useState<'kanban' | 'dashboard' | 'settings'>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<Settings>({ pixelId: '', accessToken: '', configurado: false });
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      setLeads(data.leads);
      setSettings(data.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            LF
          </div>
          <span className="ml-3 font-semibold text-lg hidden md:block">LeadFlow AI</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={<Columns />} label="Kanban" active={view === 'kanban'} onClick={() => setView('kanban')} />
          <NavItem icon={<SettingsIcon />} label="Ajustes Meta" active={view === 'settings'} onClick={() => setView('settings')} />
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-full flex items-center justify-center md:justify-start p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="ml-3 hidden md:block">{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 justify-between transition-colors">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold capitalize">{view}</h1>
            {view === 'kanban' && (
              <button 
                onClick={() => setIsAddLeadModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Novo Lead
              </button>
            )}
          </div>
          {!settings.configurado && (
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs px-3 py-1.5 rounded-full font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 mr-2 animate-pulse" />
              Meta CAPI Inativa
            </div>
          )}
        </header>
        
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
          {loading ? (
            <div className="flex h-full items-center justify-center">Carregando...</div>
          ) : (
            <>
              {view === 'kanban' && <Kanban leads={leads} onUpdate={fetchState} />}
              {view === 'dashboard' && <Dashboard leads={leads} />}
              {view === 'settings' && <SettingsView settings={settings} onUpdate={fetchState} />}
            </>
          )}
        </div>
      </main>

      {/* AI Chat Floating Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 h-[500px] mb-4 flex flex-col overflow-hidden">
            <Chat onActionComplete={fetchState} />
          </div>
        )}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-blue-700 transition-colors"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

      {/* Modals */}
      <AddLeadModal 
        isOpen={isAddLeadModalOpen} 
        onClose={() => setIsAddLeadModalOpen(false)} 
        onSave={fetchState} 
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center p-3 rounded-lg transition-colors ${
        active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center justify-center w-6">{icon}</div>
      <span className="ml-3 hidden md:block font-medium">{label}</span>
    </button>
  );
}
