import React, { useEffect, useState } from 'react';
import { WebhookLog } from '../types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function WebhookLogsView() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'entrada' | 'saida'>('entrada');
  const [appUrl, setAppUrl] = useState('');
  const [outboundUrl, setOutboundUrl] = useState('');

  useEffect(() => {
    setAppUrl(window.location.origin);
    fetchLogs();
    fetch('/api/outbound-webhook').then(res => res.json()).then(data => setOutboundUrl(data.url || ''));
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/webhook-logs');
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando logs...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Configurações de Webhook</h2>
      
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('entrada')}
          className={`pb-2 ${activeTab === 'entrada' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`}
        >
          Entrada
        </button>
        <button 
          onClick={() => setActiveTab('saida')}
          className={`pb-2 ${activeTab === 'saida' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`}
        >
          Saída
        </button>
      </div>

      {activeTab === 'entrada' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Webhook de Entrada (Leads)</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Envie requisições POST para este endpoint para criar leads automaticamente a partir de formulários, RD Station, Typeform, etc.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">POST</span> {appUrl}/webhook/lead
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">O payload deve ser um JSON com pelo menos o campo <code className="dark:bg-gray-800 dark:text-gray-300 p-0.5 rounded">nome</code>. Outros campos aceitos: <code className="dark:bg-gray-800 dark:text-gray-300 p-0.5 rounded">email</code>, <code className="dark:bg-gray-800 dark:text-gray-300 p-0.5 rounded">telefone</code>, <code className="dark:bg-gray-800 dark:text-gray-300 p-0.5 rounded">empresa</code>, <code className="dark:bg-gray-800 dark:text-gray-300 p-0.5 rounded">valor_estimado</code>, <code className="dark:bg-gray-800 dark:text-gray-300 p-0.5 rounded">origem</code>.</p>
              <pre className="text-xs bg-gray-800 dark:bg-gray-950 text-green-400 p-3 rounded-lg overflow-x-auto border dark:border-gray-800">
    {`{
      "nome": "João Silva",
      "email": "joao@email.com",
      "telefone": "11987654321",
      "empresa": "Acme Corp",
      "origem": "Formulário Site"
    }`}
              </pre>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Exemplo cURL</h4>
              <pre className="text-xs bg-gray-900 dark:bg-black text-gray-300 p-4 rounded-lg overflow-x-auto border border-gray-700">
{`curl -X POST ${appUrl}/webhook/lead \\
  -H "Content-Type: application/json" \\
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "11987654321",
    "empresa": "Acme Corp",
    "origem": "Formulário Site"
  }'`}
              </pre>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-6">
            <h3 className="text-lg font-semibold mb-4">Logs de Entrada</h3>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Endpoint</th>
                  <th className="p-3">Payload</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b dark:border-gray-700">
                    <td className="p-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="text-green-500" size={16} />
                      ) : (
                        <XCircle className="text-red-500" size={16} />
                      )}
                    </td>
                    <td className="p-3 flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Clock size={14} />
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-xs">{log.endpoint}</td>
                    <td className="p-3">
                        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded max-w-sm overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                        </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'saida' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Webhook de Saída</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Dados de leads atualizados ou fechados serão enviados automaticamente para esta URL.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
              <span className="font-bold text-gray-700 dark:text-gray-300">URL Atual:</span> {outboundUrl || 'Não configurada'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
