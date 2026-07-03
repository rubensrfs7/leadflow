import React, { useEffect, useState } from 'react';
import { WebhookLog } from '../types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function WebhookLogsView() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <div>Carregando logs...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Logs de Webhook</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
  );
}
