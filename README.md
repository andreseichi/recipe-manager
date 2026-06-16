# Recipe Manager

Aplicação full-stack para organizar receitas culinárias privadas por usuário. O
projeto combina um CRUD completo com autenticação OAuth, busca, tags,
paginação e upload direto de imagens.

![Landing page do Recipe Manager](docs/screenshots/landing.png)

![Listagem autenticada de receitas](docs/screenshots/recipes.png)

## Recursos

- Login com Google.
- Isolamento completo das receitas por usuário.
- Criação, leitura, edição e exclusão de receitas.
- Ingredientes e etapas ordenadas.
- Busca por nome, filtro por tags e paginação.
- Imagens JPEG, PNG ou WebP de até 5 MB no Vercel Blob.
- Interface responsiva e acessível em português.
- Validação no servidor e autorização repetida em cada operação.

## Stack

- Next.js 16, React 19 e TypeScript
- Tailwind CSS 4 e componentes no padrão shadcn/ui
- Better Auth com sessões persistidas
- PostgreSQL (Neon) e Prisma 7
- Vercel Blob
- Zod, Vitest e Playwright
- pnpm com versões diretas fixadas e scripts de build permitidos por allowlist

## Arquitetura

```mermaid
flowchart LR
    Browser["Browser / React"] --> Actions["Server Actions"]
    Browser --> AuthRoute["Better Auth route"]
    Browser --> UploadRoute["Authenticated upload route"]
    Actions --> DAL["Server-only data layer"]
    AuthRoute --> Prisma["Prisma Client"]
    DAL --> Prisma
    Prisma --> Postgres["Neon PostgreSQL"]
    UploadRoute --> Blob["Vercel Blob"]
```

As páginas autenticadas verificam a sessão no layout. A camada de dados repete
autenticação e autorização e sempre inclui o `userId` nas consultas. Server
Actions são tratadas como endpoints públicos: validam `FormData` com Zod e
retornam somente estados necessários ao formulário.

## Configuração local

Requisitos:

- Node.js 22.12 ou superior
- pnpm 10.13.1
- Banco PostgreSQL

Instale as dependências:

```bash
pnpm install --frozen-lockfile
```

Crie `.env` a partir de `.env.example` e preencha:

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="uma-chave-aleatoria-com-pelo-menos-32-caracteres"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
BLOB_READ_WRITE_TOKEN=""
E2E_TEST_MODE="false"
```

Gere o Prisma Client e aplique a migration:

```bash
pnpm db:generate
pnpm db:migrate
```

Inicie a aplicação:

```bash
pnpm dev
```

## Docker

O Docker é usado somente para rodar o PostgreSQL local. A aplicação Next.js e o
Prisma rodam no host com `pnpm`, conectando ao banco por `localhost`.

Crie o arquivo de ambiente do banco:

```powershell
Copy-Item .env.docker.example .env.docker
```

Troque `POSTGRES_PASSWORD` por uma senha local segura e use os mesmos dados no
`DATABASE_URL` do `.env` da aplicação:

```env
DATABASE_URL="postgresql://recipe_manager:sua_senha@localhost:5432/recipe_manager?schema=public"
```

Suba o PostgreSQL:

```bash
pnpm docker:up
```

Depois gere o Prisma Client, aplique a migration e rode o Next.js localmente:

```bash
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Comandos úteis:

```bash
pnpm docker:logs
pnpm docker:down
pnpm docker:reset
```

`pnpm docker:down` preserva os dados do PostgreSQL. `pnpm docker:reset` remove
também o volume local do banco. Se a porta `5432` já estiver ocupada, altere
`POSTGRES_PORT` em `.env.docker` e use a mesma porta no `DATABASE_URL`.

## OAuth

Cadastre as URLs de callback nos provedores:

- Google: `http://localhost:3000/api/auth/callback/google`

No deploy, substitua o host local pelo domínio definitivo da Vercel e configure
`BETTER_AUTH_URL` com esse mesmo domínio.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `pnpm dev` | Servidor local |
| `pnpm build` | Build de produção |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript sem emissão |
| `pnpm test` | Testes unitários |
| `pnpm test:e2e` | Fluxos Playwright |
| `pnpm test:coverage` | Cobertura unitária |
| `pnpm audit` | Auditoria das dependências de produção |
| `pnpm db:migrate` | Migration em desenvolvimento |
| `pnpm db:deploy` | Aplica migrations em produção |
| `pnpm db:studio` | Interface do Prisma Studio |

| `pnpm docker:up` | Inicia o PostgreSQL em container |
| `pnpm docker:down` | Para o PostgreSQL sem apagar o volume |
| `pnpm docker:logs` | Acompanha logs do PostgreSQL |
| `pnpm docker:reset` | Remove o container e o volume local do banco |

## Testes E2E

Os testes E2E habilitam login por e-mail somente quando
`E2E_TEST_MODE=true`. Essa opção deve ser usada exclusivamente em banco
isolado local ou de CI e nunca no ambiente público.

Com um `DATABASE_URL` de teste configurado:

```bash
pnpm db:deploy
pnpm exec playwright install chromium
pnpm test:e2e
```

Os cenários Playwright cobrem landing page, CRUD, busca, filtro, exclusão e
isolamento entre usuários. Tipo, tamanho, ownership, substituição e remoção de
imagens são cobertos pelos testes unitários.

## Segurança

- URLs, IDs, query params e campos ocultos nunca são considerados confiáveis.
- Receitas de outra conta retornam a mesma resposta de recurso inexistente.
- Tags são únicas por usuário após normalização de caixa e espaços.
- Tokens de upload são emitidos somente para sessões autenticadas.
- O pathname do Blob deve pertencer ao namespace do usuário autenticado.
- Imagens são públicas por URL, embora a receita e sua listagem sejam privadas.
- A imagem anterior só é removida depois de a alteração no banco ser confirmada.
- Dependências diretas usam versões exatas e o pnpm executa pós-instalação apenas
  para os pacotes listados em `onlyBuiltDependencies`.

## Deploy na Vercel

1. Crie o PostgreSQL no Neon e o Blob Store na Vercel.
2. Configure todas as variáveis de `.env.example`.
3. Use `pnpm db:deploy` para aplicar migrations no banco de produção.
4. Cadastre os callbacks OAuth com o domínio final.
5. Faça o deploy e valide login, CRUD, upload e acesso em dispositivo móvel.

A workflow em `.github/workflows/ci.yml` executa migration, lint, typecheck,
testes unitários, build e Playwright com PostgreSQL isolado.
