import { Lead, COLUMNS } from '../types';

export default function Dashboard({ leads }: { leads: Lead[] }) {
  const totalLeads = leads.length;
  const emAberto = leads.filter(l => !['Fechado Won', 'Perdido'].includes(l.coluna_atual)).length;
  const fechados = leads.filter(l => l.coluna_atual === 'Fechado Won').length;
  const perdidos = leads.filter(l => l.coluna_atual === 'Perdido').length;

  const pipeline = leads.reduce((acc, lead) => acc + (lead.valor_estimado || 0), 0);
  const receita = leads.filter(l => l.coluna_atual === 'Fechado Won').reduce((acc, lead) => acc + (lead.valor_estimado || 0), 0);
  const ticketMedio = fechados > 0 ? Math.round(receita / fechados) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Analítico</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Métricas de conversão e pipeline</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={totalLeads} />
        <StatCard title="Em Aberto" value={emAberto} />
        <StatCard title="Fechados" value={fechados} className="border-green-100 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/20 text-green-700 dark:text-green-400" />
        <StatCard title="Perdidos" value={perdidos} className="border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/20 text-red-700 dark:text-red-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pipeline Total" value={`R$ ${pipeline.toLocaleString('pt-BR')}`} />
        <StatCard title="Receita (Fechados)" value={`R$ ${receita.toLocaleString('pt-BR')}`} className="text-green-700 dark:text-green-400" />
        <StatCard title="Ticket Médio" value={`R$ ${ticketMedio.toLocaleString('pt-BR')}`} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Funil de Conversão</h3>
        <div className="space-y-4">
          {COLUMNS.map((col, idx) => {
            const count = leads.filter(l => l.coluna_atual === col).length;
            const max = Math.max(...COLUMNS.map(c => leads.filter(l => l.coluna_atual === c).length), 1);
            const percentage = Math.round((count / max) * 100);
            
            return (
              <div key={col} className="flex items-center">
                <div className="w-32 text-sm text-gray-600 dark:text-gray-300 font-medium">{col}</div>
                <div className="flex-1 flex items-center">
                  <div 
                    className="h-6 bg-blue-500 rounded-r transition-all" 
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  ></div>
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, className = '' }: { title: string, value: string | number, className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors ${className}`}>
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">{title}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
}
