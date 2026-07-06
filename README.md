# Frontend Enviar leads

Frontend Next.js gerado pelo ProtoSoft para ser instalado e executado fora do workspace do gerador.

## Requisitos

- Node.js 18 ou superior.
- API do projeto rodando separadamente.
- URL publica ou local da API configurada em `NEXT_PUBLIC_API_URL`.

## Configuracao

Crie `.env.local` a partir do exemplo:

```bash
cp .env.example .env.local
```

Configure a URL da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Execucao local

```bash
npm install
npm run dev
```

Aplicacao local: `http://localhost:3000`.

## Build de producao

```bash
npm run build
npm start
```

## Docker com docker-compose

```bash
NEXT_PUBLIC_API_URL=https://sua-api.com docker-compose up --build
```

## Docker manual

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 -t enviar-leads-frontend .
docker run --rm -p 3000:3000 enviar-leads-frontend
```

## Publicacao na Vercel

1. Envie este projeto para um repositorio Git.
2. Importe o repositorio na Vercel.
3. Configure `NEXT_PUBLIC_API_URL=https://url-publica-da-sua-api.com`.
4. Execute o deploy.

Pela CLI:

```bash
npm install
npm install -g vercel
vercel
vercel env add NEXT_PUBLIC_API_URL
vercel --prod
```

Importante: `localhost` nao funciona na Vercel para acessar uma API externa. Use uma URL publica.

## Documentos do projeto

- `PRD.md`: objetivos, telas, fluxos e criterios funcionais.
- `Arquitect.md`: arquitetura Next.js, estrutura de pastas e integracao com a API.
