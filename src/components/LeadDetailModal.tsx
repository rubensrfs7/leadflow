import { useState, memo } from 'react';
import { X, User, Copy, ChevronRight, Save, Trash2 } from 'lucide-react';
import { Lead } from '../types';

export default memo(function LeadDetailModal({ lead, onClose, onUpdateLead, onDelete }: { lead: Lead | null, onClose: () => void, onUpdateLead: (updatedLead: Lead) => void, onDelete: () => void }) {
  if (!lead) return null;

  const [protocolo, setProtocolo] = useState(lead.protocolo || '');
  const [activeSidePanel, setActiveSidePanel] = useState<'Informações' | 'Comentários' | 'Histórico' | null>(null);
  const [newComment, setNewComment] = useState('');
  
  // State for editable information
  const [formData, setFormData] = useState({
      nome: lead.nome,
      empresa: lead.empresa || '',
      email: lead.email || '',
      condicao_negociacao: lead.condicao_negociacao || '',
      motivo_perda: lead.motivo_perda || '',
      plano_vendido: lead.plano_vendido || '',
      segmento_atuacao: lead.segmento_atuacao || '',
      avaliacao_lead: lead.avaliacao_lead || '',
      origem: lead.origem || '',
      conjunto: lead.conjunto || '',
      campanha: lead.campanha || '',
      criativo: lead.criativo || '',
      cidade: lead.cidade || '',
      estado: lead.estado || '',
  });

  const handleSaveProtocol = async () => {
    if (protocolo !== lead.protocolo) {
        const updatedLead = { ...lead, protocolo };
        await fetch(`/api/leads/${lead.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ protocolo })
        });
        onUpdateLead(updatedLead);
    }
  };

  const handleSaveInfo = async () => {
      const updatedLead = { ...lead, ...formData };
      await fetch(`/api/leads/${lead.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        onUpdateLead(updatedLead);
  }

  const handleAddComment = async () => {
      if (!newComment.trim()) return;
      const comment = { text: newComment, timestamp: new Date().toLocaleString(), user: 'Você' };
      const updatedLead = { ...lead, comentarios: [...(lead.comentarios || []), comment] };
      await fetch(`/api/leads/${lead.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comentarios: updatedLead.comentarios })
        });
        onUpdateLead(updatedLead);
        setNewComment('');
  }

  const handleDelete = async () => {
      if (confirm('Tem certeza que deseja excluir este lead?')) {
          await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' });
          onDelete();
          onClose();
      }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="flex gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl transition-colors border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between mb-4">
              <button onClick={handleDelete} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-full transition-colors">
                  <Trash2 size={20} />
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Avatar/Name/Protocol */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">PROTOCOLO <Copy size={12} className="inline ml-1" /></p>
              <input 
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value)}
                onBlur={handleSaveProtocol}
                placeholder="Inserir Protocolo"
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent text-center border-b border-gray-300 dark:border-gray-600 outline-none w-full"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Atendimentos</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">0</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mensagens</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">0</p>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-2">
                {['Informações', 'Comentários', 'Histórico'].map(section => (
                    <button 
                        key={section}
                        onClick={() => setActiveSidePanel(section as any)}
                        className={`w-full flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 ${activeSidePanel === section ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    >
                        {section}
                        <ChevronRight size={16} />
                    </button>
                ))}
            </div>
          </div>
          <SidePanel 
              activeSidePanel={activeSidePanel} 
              setActiveSidePanel={setActiveSidePanel} 
              lead={lead} 
              formData={formData} 
              setFormData={setFormData}
              newComment={newComment}
              setNewComment={setNewComment}
              handleSaveInfo={handleSaveInfo}
              handleAddComment={handleAddComment}
          />
      </div>
    </div>
  );
})

const SidePanel = memo(({ activeSidePanel, setActiveSidePanel, lead, formData, setFormData, newComment, setNewComment, handleSaveInfo, handleAddComment }: any) => {
      if (!activeSidePanel) return null;
      return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl transition-colors border border-gray-200 dark:border-gray-700 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{activeSidePanel}</h2>
                <button onClick={() => setActiveSidePanel(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <div className="overflow-y-auto flex-grow pr-2">
            {activeSidePanel === 'Informações' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500">Nome</label>
                            <input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500">Empresa</label>
                            <input value={formData.empresa} onChange={(e) => setFormData({...formData, empresa: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500">E-mail</label>
                            <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">Negociação</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500">Condição</label>
                                <input value={formData.condicao_negociacao} onChange={(e) => setFormData({...formData, condicao_negociacao: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">Motivo Perda</label>
                                <input value={formData.motivo_perda} onChange={(e) => setFormData({...formData, motivo_perda: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-gray-500">Plano</label>
                                <input value={formData.plano_vendido} onChange={(e) => setFormData({...formData, plano_vendido: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">Marketing e Local</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="col-span-2">
                                <label className="block text-xs text-gray-500">Segmento</label>
                                <input value={formData.segmento_atuacao} onChange={(e) => setFormData({...formData, segmento_atuacao: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">Origem</label>
                                <input value={formData.origem} onChange={(e) => setFormData({...formData, origem: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">Conjunto</label>
                                <input value={formData.conjunto} onChange={(e) => setFormData({...formData, conjunto: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-gray-500">Campanha</label>
                                <input value={formData.campanha} onChange={(e) => setFormData({...formData, campanha: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-gray-500">Criativo</label>
                                <input value={formData.criativo} onChange={(e) => setFormData({...formData, criativo: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                             <div>
                                <label className="block text-xs text-gray-500">Cidade</label>
                                <input value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">Estado</label>
                                <input value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSaveInfo} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        <Save size={16} /> Salvar
                    </button>
                </div>
            )}
            {activeSidePanel === 'Comentários' && (
                <div className="space-y-3">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(lead.comentarios || []).map((c: any, i: number) => (
                            <div key={i} className="text-sm p-2 bg-gray-100 dark:bg-gray-900 rounded">
                                <p className="text-gray-900 dark:text-gray-100">{c.text}</p>
                                <p className="text-xs text-gray-500">{c.user} - {c.timestamp}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Adicionar comentário..."
                        />
                        <button onClick={handleAddComment} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Save size={20} />
                        </button>
                    </div>
                </div>
            )}
            {activeSidePanel === 'Histórico' && (
                <div className="space-y-3">
                    {(lead.historico || []).map((h: any, i: number) => (
                        <div key={i} className="text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded border-l-2 border-blue-500">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{h.message}</p>
                            <p className="text-xs text-gray-500">{h.timestamp} {h.user && `- ${h.user}`}</p>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
      );
  });
