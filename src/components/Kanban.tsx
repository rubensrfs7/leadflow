import { useState, useCallback } from 'react';
import { Lead, COLUMNS } from '../types';
import { LayoutGrid, List, Zap, UserPlus, Phone, CheckCircle, FileText, Briefcase, Award, Headphones, Trash2, Building, DollarSign, Target } from 'lucide-react';
import LeadDetailModal from './LeadDetailModal';

const COLUMN_METADATA: Record<string, { color: string, icon: JSX.Element }> = {
  'Novo Lead': { color: 'text-blue-500', icon: <UserPlus size={16} /> },
  'Contato': { color: 'text-orange-500', icon: <Phone size={16} /> },
  'Qualificado': { color: 'text-green-500', icon: <CheckCircle size={16} /> },
  'Proposta': { color: 'text-purple-500', icon: <FileText size={16} /> },
  'Negociação': { color: 'text-yellow-500', icon: <Briefcase size={16} /> },
  'Fechado Won': { color: 'text-emerald-500', icon: <Award size={16} /> },
  'Pós-venda': { color: 'text-cyan-500', icon: <Headphones size={16} /> },
  'Perdido': { color: 'text-red-500', icon: <Trash2 size={16} /> }
};

export default function Kanban({ leads, onUpdate }: { leads: Lead[], onUpdate: () => void }) {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, toColumn: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    try {
      const lead = leads.find(l => l.id === leadId);
      if (lead && lead.coluna_atual !== toColumn) {
        const response = await fetch(`/api/leads/${leadId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coluna_atual: toColumn })
        });
        const data = await response.json();
        onUpdate();
        
        if (data.meta) {
          if (data.meta.success) {
            showToast(`✓ Evento Meta CAPI disparado: ${data.meta.payload.data[0].event_name}`, 'success');
          } else {
            showToast(`⚠ Falha no Meta CAPI: ${data.meta.reason}`, 'error');
          }
        }
      }
    } catch (err) {
      console.error('Error moving lead', err);
    }
  };

  const handleUpdateLead = useCallback((updatedLead: Lead) => {
    onUpdate();
    setSelectedLead(updatedLead);
  }, [onUpdate]);

  return (
    <div className="h-full flex flex-col relative">
      <LeadDetailModal key={selectedLead?.id} lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdateLead={handleUpdateLead} />
      {toast && (
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}
      <div className="flex justify-end mb-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 flex items-center shadow-sm transition-colors">
          <button 
            onClick={() => setViewMode('board')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'board' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="flex-1 flex overflow-x-auto pb-4 gap-6">
          {COLUMNS.map(column => {
            const columnLeads = leads.filter(l => l.coluna_atual === column);
            return (
              <div key={column} className="flex-shrink-0 w-80 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl flex flex-col max-h-full border border-gray-200/50 dark:border-gray-700/50 transition-colors">
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-xl transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={COLUMN_METADATA[column]?.color || 'text-gray-500'}>
                      {COLUMN_METADATA[column]?.icon}
                    </div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs">{column}</h3>
                    <Zap className="text-yellow-500 w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-700/50 px-2 py-1 rounded-full">{columnLeads.length}</span>
                </div>
                <div 
                  className="flex-1 overflow-y-auto p-3 space-y-3"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column)}
                >
                  {columnLeads.map(lead => (
                    <div 
                      key={lead.id} 
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, lead.id!)}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">{lead.nome}</div>
                        <div className="p-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <UserPlus size={14} className="text-gray-400" />
                        </div>
                      </div>
                      {lead.empresa && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <Building size={12} />
                          {lead.empresa}
                        </div>
                      )}
                      {lead.valor_estimado && (
                        <div className="text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 w-fit px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <DollarSign size={12} />
                          R$ {lead.valor_estimado.toLocaleString('pt-BR')}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Target size={12} className="text-orange-500" />
                          Score: {lead.score}
                        </div>
                        {lead.responsavel && (
                          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{lead.responsavel}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-500 text-sm transition-colors">
                      Vazio
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-sm transition-colors">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 transition-colors">
                  <th className="p-4 font-medium">Nome</th>
                  <th className="p-4 font-medium">Empresa</th>
                  <th className="p-4 font-medium">Estágio</th>
                  <th className="p-4 font-medium">Valor</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Origem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer text-sm">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{lead.nome}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lead.email || lead.telefone || 'Sem contato'}</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{lead.empresa || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${COLUMN_METADATA[lead.coluna_atual]?.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-gray-700 ${COLUMN_METADATA[lead.coluna_atual]?.color} dark:text-gray-200`}>
                        <div className={COLUMN_METADATA[lead.coluna_atual]?.color}>
                          {COLUMN_METADATA[lead.coluna_atual]?.icon}
                        </div>
                        {lead.coluna_atual}
                        <Zap className="w-3 h-3 text-yellow-500" />
                      </span>
                    </td>
                    <td className="p-4 text-gray-900 dark:text-gray-100 font-medium">
                      {lead.valor_estimado ? `R$ ${lead.valor_estimado.toLocaleString('pt-BR')}` : '-'}
                    </td>
                    <td className="p-4 text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                        {lead.score}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{lead.origem || '-'}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Nenhum lead encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

