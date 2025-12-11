# AWS Services - Sistema de Cartão de Acesso

Um sistema completo de cartão de acesso digital inspirado nos princípios dos serviços AWS, desenvolvido com tecnologias modernas e integração com Cloudflare R2 para armazenamento de arquivos e Neon para banco de dados PostgreSQL.

## 📋 Sobre o Projeto

Este projeto implementa um sistema de cartão de acesso digital que permite aos usuários:
- Criar contas com informações pessoais e foto
- Fazer autenticação segura com JWT
- Visualizar e editar seus dados pessoais
- Upload e gerenciamento de fotos de perfil

O sistema segue os princípios de arquitetura dos serviços AWS, utilizando:
- **Cloudflare R2** (equivalente ao AWS S3) para armazenamento de imagens
- **Neon PostgreSQL** (equivalente ao AWS RDS) para banco de dados
- **JWT** para autenticação e autorização
- **API RESTful** com documentação Swagger

## 🏗️ Arquitetura

```
├── apps/
│   ├── api/          # Backend API (Fastify + TypeScript)
│   └── web/          # Frontend (React + TypeScript)
├── prisma/           # Schema e migrações do banco
└── Configurações raiz
```

### Backend (API)
- **Framework**: Fastify com TypeScript
- **Banco de dados**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autenticação**: JWT
- **Upload de arquivos**: Cloudflare R2 (S3-compatible)
- **Documentação**: Swagger UI
- **Validação**: Zod schemas

### Frontend (Web)
- **Framework**: React com TypeScript
- **Build tool**: Vite
- **Estilização**: CSS puro
- **Estado**: React hooks

## 🚀 Tecnologias Utilizadas

### Backend
- **Fastify** - Framework web rápido e eficiente
- **TypeScript** - Tipagem estática
- **Prisma** - ORM moderno para PostgreSQL
- **Zod** - Validação de schemas
- **JWT** - Autenticação stateless
- **Bcrypt** - Hash de senhas
- **AWS SDK** - Integração com Cloudflare R2
- **Swagger** - Documentação da API

### Frontend
- **React 18** - Biblioteca para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna

### Infraestrutura
- **Cloudflare R2** - Armazenamento de objetos (S3-compatible)
- **Neon** - PostgreSQL serverless
- **JWT** - Tokens de autenticação

## ⚙️ Configuração do Ambiente

### 1. Pré-requisitos
- Node.js 18+
- pnpm (gerenciador de pacotes)
- Conta no Cloudflare (para R2)
- Conta no Neon (para PostgreSQL)

### 2. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```env
# Banco de dados (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database"

# Servidor
PORT=3333

# JWT
JWT_SECRET="seu-jwt-secret"

# Documentação da API
API_DOCS_LOGIN="admin"
API_DOCS_PASSWORD="password"

# Frontend
VITE_API_URL="http://localhost:3333"
VITE_PORT=5173

# Cloudflare R2
CLOUDFLARE_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_ACCESS_KEY_ID="your-access-key"
CLOUDFLARE_SECRET_ACCESS_KEY="your-secret-key"
CLOUDFLARE_BUCKET_NAME="your-bucket-name"
CLOUDFLARE_PUBLIC_URL="https://your-public-domain.com"
```

### 3. Instalação

```bash
# Instalar dependências
pnpm install

# Gerar cliente Prisma
pnpm run db:generate

# Executar migrações
pnpm run db:migrate
```

## 🎯 Como Usar

### Desenvolvimento

#### Backend (API)
```bash
# Modo desenvolvimento com hot reload
pnpm run api:dev

# Build para produção
pnpm run api:build

# Executar versão de produção
pnpm run api:start
```

#### Frontend (Web)
```bash
# Modo desenvolvimento
cd apps/web
pnpm run web:dev

# Build para produção
pnpm run web:build

# Preview da build
pnpm run web:preview
```

### Banco de Dados

```bash
# Executar migrações
pnpm run db:migrate

# Reset completo do banco
pnpm run db:reset

# Gerar cliente Prisma
pnpm run db:generate
```

## 📚 API Endpoints

### Autenticação
- `POST /user/register` - Criar nova conta
- `POST /user/auth` - Fazer login

### Usuário (Autenticado)
- `GET /user` - Obter dados do usuário
- `POST /user/update` - Atualizar dados do usuário

### Documentação
- `GET /api-docs` - Swagger UI (requer autenticação básica)

## 🔐 Funcionalidades de Segurança

### Autenticação JWT
- Tokens com expiração de 24 horas
- Middleware de verificação automática
- Headers Authorization Bearer

### Upload de Arquivos
- Limite de 5MB por arquivo
- Validação de tipos MIME
- Armazenamento seguro no Cloudflare R2
- URLs públicas para acesso às imagens

### Validação de Dados
- Schemas Zod para validação rigorosa
- Sanitização de CPF (apenas números)
- Validação de email e senha
- Hash bcrypt para senhas

### Proteção de Rotas
- Middleware JWT para rotas protegidas
- Verificação de propriedade de recursos
- Tratamento de erros padronizado

## 🗄️ Estrutura do Banco de Dados

### Tabela Users
```sql
- id: UUID (Primary Key)
- photo: String (URL da foto no R2)
- name: String (Nome completo)
- cpf: String (CPF único, apenas números)
- email: String (Email único)
- password: String (Hash bcrypt)
- createdAt: DateTime
- updatedAt: DateTime
```


## 🔧 Scripts Disponíveis

### API
- `api:dev` - Desenvolvimento com hot reload
- `api:build` - Build para produção
- `api:start` - Executar versão de produção

### Banco de Dados
- `db:migrate` - Executar migrações
- `db:reset` - Reset completo
- `db:generate` - Gerar cliente Prisma

### Web
- `web:dev` - Desenvolvimento
- `web:build` - Build para produção
- `web:preview` - Preview da build

## 📝 Funcionalidades do Sistema

### Registro de Usuário
- Formulário com nome, email, CPF e senha
- Upload opcional de foto de perfil
- Validação de CPF único
- Validação de email único
- Hash seguro da senha

### Login
- Autenticação por email e senha
- Geração de token JWT
- Persistência local do token
- Redirecionamento automático

### Cartão de Acesso
- Visualização dos dados pessoais
- Exibição da foto de perfil
- Informações formatadas (nome, email, CPF)
- Interface limpa e profissional

### Edição de Perfil
- Atualização do nome
- Troca da foto de perfil
- Preview das alterações
- Validação antes do envio

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `package.json` para mais detalhes.

## 👨‍💻 Autor

**Victor de Toledo**

---

*Sistema desenvolvido seguindo os princípios de arquitetura dos serviços AWS, com foco em escalabilidade, segurança e performance.*