# Arquitect - Frontend Enviar leads

## Visão Técnica

Aplicação Next.js com rotas autenticadas e CRUDs dinâmicos montados a partir dos metadados de tabelas gerados pelo ProtoSoft. O frontend é instalado separadamente e consome a API por HTTP.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- lucide-react
- Docker

## Estrutura de Pastas

| Caminho | Responsabilidade |
|---|---|
| `src/app/login/page.tsx` | Login e registro de usuários |
| `src/app/app/layout.tsx` | Shell autenticado, topo, sidebar e menu mobile |
| `src/app/app/dashboard/page.tsx` | Cards de totais e gráficos demonstrativos |
| `src/app/app/[tableName]/page.tsx` | CRUD dinâmico por tabela |
| `src/components/theme-provider.tsx` | Tema claro/escuro persistido |
| `src/components/records-report.tsx` | Geração de PDF no navegador |
| `src/lib/api.ts` | Cliente HTTP com token e query string |
| `src/lib/tables.ts` | Metadados de entidades, campos e relacionamentos |
| `src/lib/theme-config.ts` | Identidade visual escolhida no ProtoSoft |

## Integração com a API

- Base URL: `NEXT_PUBLIC_API_URL`.
- Login: `POST /api/auth/login`.
- Registro: `POST /api/auth/register`.
- CRUDs: endpoints definidos em `src/lib/tables.ts`.
- Token JWT: armazenado no navegador e enviado no header `Authorization`.

## Fluxo de Navegação

1. Usuário acessa `/login`.
2. Após autenticação, é redirecionado para `/app/dashboard`.
3. O layout autenticado carrega menus a partir das tabelas disponíveis.
4. Cada rota de CRUD usa o parâmetro da URL para localizar sua configuração.
5. Operações de dados chamam diretamente a API externa.

## Modelo Consumido pelo Frontend

- items
  - id: integer (PK)
  - name: varchar(255)

- user
  - id: uuid (PK)
  - name: varchar(255)
  - email: varchar(255)

## Relacionamentos

- Nenhum relacionamento configurado.

## Responsividade

- Desktop: CRUDs em tabela com ações por linha.
- Mobile: registros exibidos como cards.
- Sidebar: alterna para menu móvel em telas menores.
- Modais: usam largura máxima e rolagem interna quando necessário.

## Pontos de Evolução

- Trocar gráficos mockados por endpoints analíticos reais.
- Adicionar testes de componentes e fluxos críticos.
- Implementar permissões por perfil.
- Customizar componentes por identidade visual da empresa.
