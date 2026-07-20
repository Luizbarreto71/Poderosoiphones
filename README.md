# 🚀 Poderoso iPhones - Sistema de Gestão

Sistema completo de gestão para loja de iPhones e acessórios, desenvolvido com Next.js 15, TypeScript, Supabase e design premium.

## ✨ Funcionalidades

### 📊 Dashboard
- KPIs em tempo real (faturamento, vendas, estoque, clientes, garantias)
- Gráficos de evolução de vendas (7 dias)
- Gráfico de produtos por categoria
- Dados atualizados diretamente do Supabase

### 🛒 PDV (Ponto de Venda)
- Carrinho de compras interativo
- Busca de produtos
- Seleção de cliente
- Modal de pagamento (PIX, Dinheiro, Débito, Crédito)
- **Integrado com Supabase**: Salva vendas, atualiza estoque, cria cliente automaticamente

### 📦 Produtos
- Cadastro completo de produtos
- Categorias: iPhone, Samsung, Xiaomi, Apple Watch, AirPods, Capinhas, Películas, Carregadores, Cabos, Fones, Outros
- Campos: Nome, Marca, Modelo, Cor, Capacidade, Condição, Custo, Preço, Estoque
- Busca e filtros por categoria
- Exclusão de produtos

### 🛍️ Vendas
- Histórico completo de vendas
- Busca por cliente, produto ou IMEI
- **Modal de garantia**: Registra garantia diretamente da venda
- Status: Concluída, Pendente, Cancelada

### 🛡️ Garantias
- Lista completa de garantias
- **Status automático**: 
  - ✅ Ativa
  - ⚠️ Vencendo (30 dias)
  - ❌ Vencida
- Filtros: Todas, Ativas, Vencendo, Vencidas
- Busca por cliente, produto ou IMEI

### 👥 Clientes
- Lista de clientes
- Classificação automática: Bronze, Prata, Ouro, Diamante
- Busca por nome ou telefone
- Total gasto e última compra

### 📊 Estoque
- Indicadores: Total, OK, Baixo, Crítico
- Tabela completa com status
- Filtros inteligentes
- Cálculo automático de status

### 🔄 Trocas
- Formulário completo:
  - Dados do cliente (nome, telefone, endereço)
  - Aparelho de entrada (modelo, IMEI, condição)
  - Aparelho de saída (modelo, valor, diferença)
- Lista de trocas recentes

### 🛠️ Ordens de Serviço
- Cadastro de ordens de serviço
- Status: Recebido, Em análise, Aguardando peça, Em reparo, Finalizado, Entregue

### 💰 Financeiro
- Controle financeiro completo
- Receitas e despesas
- Contas a pagar e receber

### 📈 Relatórios
- Relatórios de vendas
- Relatórios de estoque
- Relatórios financeiros

### ⚙️ Configurações
- Configurações do sistema
- Gerenciamento de usuários

## 🗄️ Banco de Dados (Supabase)

### Tabelas
1. **users** - Usuários do sistema
2. **products** - Produtos
3. **imeis** - Controle de IMEI
4. **customers** - Clientes
5. **sales** - Vendas
6. **trades** - Trocas
7. **warranties** - Garantias
8. **service_orders** - Ordens de serviço
9. **stock_movements** - Movimentações de estoque
10. **financial_transactions** - Transações financeiras

### Recursos
- Row Level Security (RLS)
- Triggers automáticos
- Índices para performance
- Funções para classificação de clientes

## 🚀 Como Usar

### 1. Configuração Inicial

```bash
# Clone o repositório
git clone <seu-repositorio>

# Entre na pasta
cd poderoso-iphones

# Instale as dependências
npm install

# Configure o Supabase
# Edite o arquivo .env.local com suas credenciais do Supabase
```

### 2. Configurar Supabase

1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor**
4. Execute o arquivo `supabase-schema.sql`
5. (Opcional) Se já executou o schema anterior, use `supabase-migrate.sql`

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Executar o Projeto

```bash
# Modo desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

### 5. Criar Conta

1. Acesse http://localhost:3000/register
2. Crie sua conta
3. Confirme o email
4. Faça login

### 6. Cadastrar Produtos

1. Vá em **Produtos**
2. Clique em **Novo Produto**
3. Preencha os dados
4. Clique em **Cadastrar Produto**

### 7. Testar PDV

1. Vá em **PDV**
2. Busque produtos
3. Adicione ao carrinho
4. Preencha dados do cliente
5. Selecione forma de pagamento
6. Finalize venda

### 8. Registrar Garantia

1. Vá em **Vendas**
2. Encontre a venda
3. Clique no ícone de escudo
4. Selecione período de garantia
5. Registre garantia

### 9. Verificar Garantias

1. Vá em **Garantias**
2. Veja status automático (ativa/vencendo/vencida)
3. Use filtros para buscar

## 📱 Páginas Disponíveis

| Rota | Descrição |
|------|-----------|
| `/` | Redireciona conforme login |
| `/login` | Login |
| `/register` | Criar conta |
| `/dashboard` | Dashboard com KPIs e gráficos |
| `/produtos` | Cadastro de produtos |
| `/imeis` | Controle de IMEI |
| `/estoque` | Controle de estoque |
| `/vendas` | Histórico de vendas |
| `/pdv` | Ponto de venda |
| `/trocas` | Sistema de trocas |
| `/clientes` | Gestão de clientes |
| `/garantias` | Controle de garantias |
| `/servicos` | Ordens de serviço |
| `/financeiro` | Controle financeiro |
| `/relatorios` | Relatórios |
| `/configuracoes` | Configurações |
| `/configuracoes/usuarios` | Gerenciar usuários |

## 🎨 Design

- **Estilo**: Premium, minimalista, inspirado em Apple/Stripe/Shopify
- **Cores**: Primary (#2563EB), Dark (#0F172A)
- **Responsivo**: Mobile First
- **Animações**: Framer Motion
- **Componentes**: Shadcn UI

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Supabase, PostgreSQL
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## 📦 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── produtos/
│   ├── imeis/
│   ├── estoque/
│   ├── vendas/
│   ├── pdv/
│   ├── trocas/
│   ├── clientes/
│   ├── garantias/
│   ├── servicos/
│   ├── financeiro/
│   ├── relatorios/
│   ├── configuracoes/
│   └── layout.tsx
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── products/
│   ├── customers/
│   ├── pos/
│   └── ui/
├── contexts/
│   └── auth-context.tsx
├── lib/
│   ├── supabase.ts
│   └── utils.ts
└── types/
```

## 🔒 Segurança

- Autenticação via Supabase
- Row Level Security (RLS)
- Proteção de rotas
- Perfis de usuário (admin, gerente, vendedor, técnico, caixa)

## 📝 Próximos Passos

- [ ] Implementar leitor de código de barras
- [ ] Implementar leitor de QR Code
- [ ] Adicionar impressão de etiquetas
- [ ] Implementar PWA completo
- [ ] Adicionar notificações push
- [ ] Implementar backup automático
- [ ] Adicionar exportação PDF/Excel

## 👨‍💻 Desenvolvido por

**Poderoso iPhones** - Sistema de Gestão Completo

## � Licença

Este projeto é proprietário e confidencial.

---

**Versão**: 1.0.0  
**Data**: 2026  
**Status**: ✅ Produção