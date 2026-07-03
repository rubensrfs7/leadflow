import { useState, useEffect } from 'react';
import { Settings } from '../types';
import { Facebook, CheckCircle2, ChevronRight, Loader2, X } from 'lucide-react';

export default function SettingsView({ settings, onUpdate }: { settings: Settings, onUpdate: () => void }) {
  const [pixelId, setPixelId] = useState(settings.pixelId);
  const [accessToken, setAccessToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectStep, setConnectStep] = useState(0);

  useEffect(() => {
    setAppUrl(window.location.origin);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixelId, accessToken })
      });
      if (res.ok) {
        setMessage('Configurações salvas com sucesso! Integração Meta CAPI ativada.');
        onUpdate();
      }
    } catch (err) {
      setMessage('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const simulateMetaConnection = () => {
    setConnectStep(1);
    setTimeout(() => setConnectStep(2), 1500);
    setTimeout(() => setConnectStep(3), 3000);
    setTimeout(() => {
      setConnectStep(4);
      setPixelId('1234567890123456');
      setAccessToken('EAA' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
      setTimeout(() => {
        setIsConnectModalOpen(false);
        setConnectStep(0);
        setMessage('Conectado com o Meta com sucesso! Não se esqueça de salvar as configurações.');
      }, 1500);
    }, 4500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Integração Meta CAPI</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Configure as credenciais para disparar eventos de conversão automaticamente para o Meta Ads.
            </p>
          </div>
        </div>

        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50 flex flex-col items-center text-center transition-colors">
          <Facebook className="text-blue-600 dark:text-blue-400 w-12 h-12 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Conecte sua conta do Meta</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            A forma mais fácil de configurar a API de Conversões é conectando diretamente com sua conta do Facebook Business.
          </p>
          <button
            type="button"
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            <Facebook size={20} />
            Conectar com a Meta
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 transition-colors"></div>
          <span className="text-sm text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Ou configure manualmente</span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 transition-colors"></div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pixel ID (Dataset ID)</label>
            <input
              type="text"
              required
              value={pixelId}
              onChange={e => setPixelId(e.target.value)}
              placeholder="Ex: 1234567890123456"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500/50 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Token</label>
            <input
              type="password"
              required={!settings.configurado}
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              placeholder={settings.configurado ? '••••••••••••••••••••••••' : 'EAA...'}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500/50 outline-none transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Gerado no Events Manager &gt; Configurações &gt; API de Conversões.</p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm transition-colors ${message.includes('Erro') ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações Manuais'}
          </button>
        </form>
      </div>


      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-colors">
            <div className="bg-blue-600 dark:bg-blue-700 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Facebook size={20} />
                <span className="font-medium">Conectar Meta Business</span>
              </div>
              <button onClick={() => { setIsConnectModalOpen(false); setConnectStep(0); }} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {connectStep === 0 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Facebook size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Autorizar LeadFlow AI</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    O LeadFlow precisará de acesso ao seu Gerenciador de Negócios para configurar a API de Conversões automaticamente.
                  </p>
                  <button
                    onClick={simulateMetaConnection}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                  >
                    Continuar como [Seu Nome]
                  </button>
                </div>
              )}

              {connectStep > 0 && (
                <div className="space-y-6">
                  <Step active={connectStep >= 1} done={connectStep > 1} title="Autenticando conta" />
                  <Step active={connectStep >= 2} done={connectStep > 2} title="Acessando Gerenciador de Negócios" />
                  <Step active={connectStep >= 3} done={connectStep > 3} title="Selecionando Pixel (Dataset)" />
                  <Step active={connectStep >= 4} done={connectStep >= 4} title="Gerando Token de Acesso" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ active, done, title }: { active: boolean, done: boolean, title: string }) {
  return (
    <div className={`flex items-center gap-3 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
        {done ? <CheckCircle2 size={18} /> : active ? <Loader2 size={18} className="animate-spin" /> : <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <span className={`font-medium transition-colors ${done ? 'text-green-700 dark:text-green-400' : active ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {title}
      </span>
    </div>
  );
}
