import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { Lead, WebhookLog } from './src/types';

const DATA_FILE = path.join(process.cwd(), 'data.json');

const app = express();
app.use(express.json());
const PORT = 3000;

// Initialize Google GenAI
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Types
interface Settings {
  pixelId: string;
  accessToken: string;
  configurado: boolean;
}

interface State {
  leads: Lead[];
  settings: Settings;
  webhookLogs: WebhookLog[];
}

// Initial State
let state: State = {
  leads: [],
  settings: { pixelId: '', accessToken: '', configurado: false },
  webhookLogs: []
};

// Load State
async function loadState() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    state = JSON.parse(data);
  } catch (e) {
    console.log('No existing data file, starting fresh.');
  }
}

// Save State
async function saveState() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

// Meta CAPI Helper
function hashData(val?: string) {
  if (!val) return undefined;
  return crypto.createHash('sha256').update(val.toLowerCase().trim()).digest('hex');
}

function hashPhone(val?: string) {
  if (!val) return undefined;
  let digits = val.replace(/\D/g, '');
  if (digits.length > 0 && !digits.startsWith('55') && digits.length <= 11) {
    digits = '55' + digits;
  }
  return crypto.createHash('sha256').update(digits).digest('hex');
}

const COLUMNS = [
  { name: 'Novo Lead', event: 'Lead', action_source: 'crm' },
  { name: 'Contato', event: 'Contact', action_source: 'phone_call' },
  { name: 'Qualificado', event: 'CompleteRegistration', action_source: 'crm' },
  { name: 'Proposta', event: 'InitiateCheckout', action_source: 'crm' },
  { name: 'Negociação', event: 'CustomEvent', action_source: 'crm', custom_event_type: 'Negotiation' },
  { name: 'Fechado Won', event: 'Purchase', action_source: 'crm' },
  { name: 'Pós-venda', event: 'Subscribe', action_source: 'crm' },
  { name: 'Perdido', event: 'CustomEvent', action_source: 'crm', custom_event_type: 'LostDeal' }
];

async function triggerMetaEvent(lead: Lead, eventInfo: any, reason?: string) {
  if (!state.settings.configurado || !state.settings.pixelId || !state.settings.accessToken) {
    return { success: false, reason: 'CAPI não configurada' };
  }

  const userData: any = {};
  if (lead.email) userData.em = hashData(lead.email);
  if (lead.telefone) userData.ph = hashPhone(lead.telefone);
  if (lead.nome) {
    const parts = lead.nome.split(' ');
    userData.fn = hashData(parts[0]);
    if (parts.length > 1) {
      userData.ln = hashData(parts.slice(1).join(' '));
    }
  }
  if (lead.ip) userData.client_ip_address = lead.ip;
  if (lead.fbp) userData.fbp = lead.fbp;
  if (lead.fbc) userData.fbc = lead.fbc;

  if (Object.keys(userData).length === 0) {
    return { success: false, reason: 'Sem dados de usuário (email/telefone)' };
  }

  const customData: any = {
    currency: lead.moeda || 'BRL',
    order_id: lead.id,
    content_name: lead.nome,
    status: lead.coluna_atual
  };

  if (lead.valor_estimado) customData.value = lead.valor_estimado;

  if (eventInfo.event === 'Purchase') {
    customData.content_type = 'product';
    customData.contents = [{ id: lead.id, quantity: 1, item_price: lead.valor_estimado || 0 }];
  }

  if (eventInfo.event === 'CustomEvent') {
    customData.custom_event_type = eventInfo.custom_event_type;
    if (reason) customData.reason = reason;
  }

  const payload = {
    data: [{
      event_name: eventInfo.event,
      event_time: Math.floor(Date.now() / 1000),
      action_source: eventInfo.action_source,
      event_id: `${lead.id}-${Date.now()}`,
      user_data: userData,
      custom_data: customData
    }]
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${state.settings.pixelId}/events?access_token=${state.settings.accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    return { success: res.ok, result, payload };
  } catch (error: any) {
    return { success: false, reason: error.message };
  }
}

function calculateScore(lead: Partial<Lead>) {
  let score = 0;
  if (lead.email) score += 20;
  if (lead.telefone) score += 20;
  if (lead.empresa) score += 10;
  if (lead.cargo) score += 10;
  if (lead.valor_estimado) score += 15;
  if (lead.fbp || lead.fbc) score += 5;
  
  const colIndex = COLUMNS.findIndex(c => c.name === lead.coluna_atual);
  if (colIndex > 1) score += 20; // Avançou além de contato
  
  return score;
}

// Routes
app.get('/api/state', (req, res) => {
  res.json({
    leads: state.leads,
    settings: {
      configurado: state.settings.configurado,
      pixelId: state.settings.pixelId,
      // Hide token
      accessToken: state.settings.accessToken ? `EAA...${state.settings.accessToken.slice(-4)}` : ''
    }
  });
});

app.post('/api/settings', async (req, res) => {
  const { pixelId, accessToken } = req.body;
  state.settings = {
    pixelId,
    accessToken,
    configurado: !!(pixelId && accessToken)
  };
  await saveState();
  res.json({ success: true });
});

app.get('/api/webhook-logs', (req, res) => {
  res.json(state.webhookLogs);
});

app.post('/webhook/lead', async (req, res) => {
  const data = req.body;
  const log: WebhookLog = {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    endpoint: '/webhook/lead',
    method: 'POST',
    payload: data,
    responseStatus: 200,
    responseBody: {},
    status: 'success'
  };

  try {
    const newLead: Lead = {
      id: `LEAD-${Date.now()}`,
      nome: data.nome || 'Novo Lead via Webhook',
      email: data.email || '',
      telefone: data.telefone || '',
      empresa: data.empresa || '',
      cargo: data.cargo || '',
      origem: data.origem || 'Webhook',
      valor_estimado: data.valor_estimado ? Number(data.valor_estimado) : null,
      moeda: 'BRL',
      tags: data.tags || [],
      ip: data.ip || '',
      fbp: data.fbp || '',
      fbc: data.fbc || '',
      coluna_atual: 'Novo Lead',
      historico: [{ message: `Criado via Webhook em ${new Date().toISOString()}`, timestamp: new Date().toISOString() }],
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      comentarios: [],
      notas: data.notas || [],
      responsavel: data.responsavel || '',
      score: 0,
      condicao_negociacao: data.condicao_negociacao || '',
      motivo_perda: data.motivo_perda || '',
      plano_vendido: data.plano_vendido || '',
      segmento_atuacao: data.segmento_atuacao || '',
      avaliacao_lead: data.avaliacao_lead || '',
      conjunto: data.conjunto || '',
      campanha: data.campanha || '',
      criativo: data.criativo || '',
      cidade: data.cidade || '',
      estado: data.estado || ''
    };
    newLead.score = calculateScore(newLead);
    state.leads.push(newLead);
    
    const eventInfo = COLUMNS.find(c => c.name === 'Novo Lead');
    let metaResult = null;
    if (eventInfo) {
      metaResult = await triggerMetaEvent(newLead, eventInfo);
    }
    
    log.responseBody = { success: true, lead: newLead, meta: metaResult };
    state.webhookLogs.push(log);
    await saveState();
    res.json(log.responseBody);
  } catch (e: any) {
    log.status = 'failure';
    log.responseStatus = 500;
    log.responseBody = { error: e.message };
    state.webhookLogs.push(log);
    await saveState();
    res.status(500).json(log.responseBody);
  }
});

app.get('/webhook/lead', async (req, res) => {
  res.send('GET request to /webhook/lead received. The server is working.');
});

app.post('/api/leads', async (req, res) => {
  const data = req.body;
  const newLead: Lead = {
    id: `LEAD-${Date.now()}`,
    nome: data.nome || 'Novo Lead',
    email: data.email || '',
    telefone: data.telefone || '',
    empresa: data.empresa || '',
    cargo: data.cargo || '',
    origem: data.origem || '',
    valor_estimado: data.valor_estimado ? Number(data.valor_estimado) : null,
    moeda: 'BRL',
    tags: data.tags || [],
    ip: data.ip || '',
    fbp: data.fbp || '',
    fbc: data.fbc || '',
    coluna_atual: 'Novo Lead',
    historico: [{ message: `Criado em ${new Date().toISOString()}`, timestamp: new Date().toISOString() }],
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
    comentarios: [],
    notas: data.notas || [],
    responsavel: data.responsavel || '',
    score: 0,
    condicao_negociacao: data.condicao_negociacao || '',
    motivo_perda: data.motivo_perda || '',
    plano_vendido: data.plano_vendido || '',
    segmento_atuacao: data.segmento_atuacao || '',
    avaliacao_lead: data.avaliacao_lead || '',
    conjunto: data.conjunto || '',
    campanha: data.campanha || '',
    criativo: data.criativo || '',
    cidade: data.cidade || '',
    estado: data.estado || ''
  };
  newLead.score = calculateScore(newLead);
  state.leads.push(newLead);
  
  const eventInfo = COLUMNS.find(c => c.name === 'Novo Lead');
  let metaResult = null;
  if (eventInfo) {
    metaResult = await triggerMetaEvent(newLead, eventInfo);
  }
  
  await saveState();
  res.json({ lead: newLead, meta: metaResult });
});

app.put('/api/leads/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const index = state.leads.findIndex(l => l.id === id);
  if (index === -1) return res.status(404).json({ error: 'Lead não encontrado' });

  const lead = state.leads[index];
  const oldColumn = lead.coluna_atual;
  
  const updatedLead = { ...lead, ...updates, atualizado_em: new Date().toISOString() };
  updatedLead.score = calculateScore(updatedLead);
  state.leads[index] = updatedLead;

  let metaResult = null;
  if (updates.coluna_atual && updates.coluna_atual !== oldColumn) {
    updatedLead.historico.push(`Movido de ${oldColumn} para ${updates.coluna_atual}`);
    const eventInfo = COLUMNS.find(c => c.name === updates.coluna_atual);
    if (eventInfo) {
      metaResult = await triggerMetaEvent(updatedLead, eventInfo, updates.motivo_perdido);
    }
  }

  if (updates.nota) {
    updatedLead.notas.push(updates.nota);
    updatedLead.historico.push(`Nota adicionada: ${updates.nota}`);
  }

  await saveState();
  res.json({ lead: updatedLead, meta: metaResult });
});

app.delete('/api/leads/:id', async (req, res) => {
  state.leads = state.leads.filter(l => l.id !== req.params.id);
  await saveState();
  res.json({ success: true });
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ reply: 'GEMINI_API_KEY não configurada no servidor.' });
  }

  const { message, chatHistory } = req.body;

  const systemPrompt = `Você é o LeadFlow AI, um assistente de CRM visual. 
O CRM possui as seguintes colunas fixas: Novo Lead, Contato, Qualificado, Proposta, Negociação, Fechado Won, Pós-venda, Perdido.
Sua função é auxiliar o usuário na gestão de leads, interpretando comandos de linguagem natural para criar, mover, atualizar leads e adicionar notas.
Você deve SEMPRE usar as ferramentas fornecidas para executar as ações no CRM.
Responda de forma curta e direta usando o padrão de caracteres como ✓ ⚡ ⚠ ✗ →.
Mostre sempre o status do evento Meta caso as ferramentas retornem essa informação.
`;

  try {
    const formattedHistory = chatHistory.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
    
    formattedHistory.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: systemPrompt,
        tools: [{
          functionDeclarations: [
            {
              name: 'create_lead',
              description: 'Cria um novo lead no CRM',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  email: { type: Type.STRING },
                  telefone: { type: Type.STRING },
                  empresa: { type: Type.STRING },
                  valor_estimado: { type: Type.NUMBER }
                },
                required: ['nome']
              }
            },
            {
              name: 'move_lead',
              description: 'Move um lead para uma nova coluna. Use isto quando o usuário pedir para avançar um lead.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  id_ou_nome: { type: Type.STRING, description: 'ID exato do lead ou nome aproximado' },
                  nova_coluna: { type: Type.STRING, description: 'Nome exato da nova coluna (ex: Fechado Won, Proposta)' },
                  valor_final: { type: Type.NUMBER, description: 'Se moveu para Fechado Won, o valor fechado.' },
                  motivo: { type: Type.STRING, description: 'Se moveu para Perdido, o motivo.' }
                },
                required: ['id_ou_nome', 'nova_coluna']
              }
            },
            {
              name: 'add_note',
              description: 'Adiciona uma nota ao histórico do lead',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  id_ou_nome: { type: Type.STRING },
                  nota: { type: Type.STRING }
                },
                required: ['id_ou_nome', 'nota']
              }
            },
            {
              name: 'get_dashboard_summary',
              description: 'Retorna um resumo dos dados do CRM para responder perguntas sobre estatísticas',
              parameters: {
                type: Type.OBJECT,
                properties: {}
              }
            }
          ]
        }]
      }
    });

    let reply = response.text;
    
    // We should ideally implement a while loop to handle function calls and pass them back to Gemini,
    // but to keep it simple, if there's a function call, we'll execute it and return a formatted string directly,
    // or just pass the function result back to Gemini for the final reply.
    // For now, if there's a function call, we handle it and append the result.
    
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      let toolResult = "";
      
      const findLead = (query: string) => {
        return state.leads.find(l => l.id === query || l.nome.toLowerCase().includes(query.toLowerCase()));
      };

      if (call.name === 'create_lead') {
        const args = call.args as any;
        const newLead: Lead = {
          id: `LEAD-${Date.now()}`,
          nome: args.nome,
          email: args.email || '',
          telefone: args.telefone || '',
          empresa: args.empresa || '',
          cargo: '',
          origem: 'Chat',
          valor_estimado: args.valor_estimado || null,
          moeda: 'BRL',
          tags: [],
          coluna_atual: 'Novo Lead',
          historico: [{ message: `Criado via Chat`, timestamp: new Date().toISOString() }],
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
          comentarios: [],
          notas: [],
          score: 0
        };
        newLead.score = calculateScore(newLead);
        state.leads.push(newLead);
        const meta = await triggerMetaEvent(newLead, COLUMNS[0]);
        await saveState();
        toolResult = `✓ Lead criado: ${newLead.nome} (${newLead.id})\nMeta CAPI: ${meta?.success ? '✓' : '✗ ' + (meta?.reason || '')}`;
      } 
      else if (call.name === 'move_lead') {
        const args = call.args as any;
        const lead = findLead(args.id_ou_nome);
        if (lead) {
          const old = lead.coluna_atual;
          lead.coluna_atual = args.nova_coluna;
          if (args.valor_final) lead.valor_estimado = args.valor_final;
          const ev = COLUMNS.find(c => c.name === args.nova_coluna);
          const meta = ev ? await triggerMetaEvent(lead, ev, args.motivo) : null;
          lead.score = calculateScore(lead);
          await saveState();
          toolResult = `→ ${lead.nome} movido: ${old} → ${lead.coluna_atual}\nMeta CAPI: ${meta?.success ? '✓ Evento ' + ev?.event + ' disparado' : '⚠ Falha: ' + (meta?.reason||'')}`;
        } else {
          toolResult = `✗ Lead não encontrado: ${args.id_ou_nome}`;
        }
      }
      else if (call.name === 'add_note') {
        const args = call.args as any;
        const lead = findLead(args.id_ou_nome);
        if (lead) {
          lead.notas.push(args.nota);
          lead.historico.push({ message: `Nota: ${args.nota}`, timestamp: new Date().toISOString() });
          await saveState();
          toolResult = `✓ Nota adicionada ao lead ${lead.nome}.`;
        } else {
          toolResult = `✗ Lead não encontrado.`;
        }
      }
      else if (call.name === 'get_dashboard_summary') {
        const total = state.leads.length;
        const fechados = state.leads.filter(l => l.coluna_atual === 'Fechado Won').length;
        const pipeline = state.leads.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);
        toolResult = `Resumo: ${total} leads totais, ${fechados} fechados. Pipeline total: R$ ${pipeline}.`;
      }

      reply = toolResult; // Just reply with the action result to save time
    }

    res.json({ reply });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ reply: 'Erro ao processar mensagem: ' + err.message });
  }
});


// Boot
async function startServer() {
  await loadState();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
