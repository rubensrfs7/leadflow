# PRD - Frontend Enviar leads

## Propósito

Entregar uma interface administrativa para consumir a API do projeto Enviar leads, permitindo que usuários façam login, acompanhem indicadores e mantenham registros por entidade.

## Contexto do Projeto

Sistema para envio de leads para Meta e Google Ads

## Usuários

- Usuários administrativos que operam cadastros e consultas.
- Equipes que precisam validar rapidamente a API gerada.
- Times que desejam evoluir um frontend inicial após o download do ZIP.

## Escopo Funcional

- Login e registro de novo usuário.
- Layout autenticado com topo, nome do usuário, sidebar e menu mobile.
- Dashboard com cards por entidade.
- Gráficos demonstrativos de vendas por período e categorias.
- CRUD responsivo para cada entidade exposta pela API.
- Tabela desktop com busca, paginação e ordenação por coluna.
- Cards mobile para consulta em telas menores.
- Modal de criação e edição de registros.
- Confirmação antes de excluir registros.
- Lookups para selecionar registros de tabelas pai.
- Área de registros filhos dentro do modal do registro principal.
- Exportação de relatório PDF por entidade.
- Tema claro/escuro persistido no navegador.

## Entidades Atendidas

- items: CRUD com 1 campo(s) exibível(is).
- user: CRUD com 2 campo(s) exibível(is).

## Relacionamentos Atendidos

- Nenhum relacionamento configurado.

## Critérios de Aceite

- O frontend permite configurar a URL da API por `NEXT_PUBLIC_API_URL`.
- O login armazena token e dados básicos do usuário no navegador.
- Cada entidade possui rota de CRUD acessível pelo menu.
- Campos sensíveis ou técnicos, como `password`, `created_at` e `updated_at`, não aparecem nas listagens.
- Telas de CRUD permanecem utilizáveis em desktop e mobile.
- Operações de criar, salvar e excluir exibem toast de retorno.

## Fora de Escopo

- Execução do frontend dentro do ProtoSoft.
- Backend próprio além do consumo da API gerada.
- Autorização por perfil ou controle granular de permissões.
- Dados reais para gráficos demonstrativos.
