# 💰 Guia: Preços Sugeridos para Trocas

## ✅ O que foi implementado?

Sistema de preços sugeridos para agilizar o atendimento no módulo de trocas.

---

## 🗄️ Passo 1: Executar SQL no Supabase

### **Arquivo**: `supabase-suggested-prices.sql`

1. Acesse https://supabase.com
2. Abra seu projeto
3. Clique em **SQL Editor**
4. Copie TODO o conteúdo do arquivo `supabase-suggested-prices.sql`
5. Cole no editor
6. Clique em **Run**
7. Aguarde a mensagem: "Tabela de preços sugeridos criada com sucesso!"

---

## 🚀 Passo 2: Acessar o Sistema

### **URL**: http://localhost:3000/trocas

---

## 📋 Como Usar

### **Aba "Preços Sugeridos"**

Nesta aba você pode:

#### **1. Cadastrar Preço Individual**
- Marca: Apple
- Modelo: iPhone 13
- Capacidade: 128GB
- Preço: R$ 2.800
- Clique em "Cadastrar"

#### **2. Importação Rápida (Bulk)**
Cole uma lista no formato:
```
iPhone 13 128GB - 2300
iPhone 13 256GB - 2600
iPhone 14 128GB - 3100
iPhone 15 Pro Max 256GB - 6500
```

Clique em "Importar Lista" e o sistema cria todos os registros automaticamente!

---

## 🎯 Funcionalidades

### **Cadastro Individual**
- ✅ Campos: Marca, Modelo, Capacidade, Preço
- ✅ Validação de duplicatas
- ✅ Edição e exclusão

### **Importação em Massa**
- ✅ Formato simples: `Modelo Capacidade - Preço`
- ✅ Processamento automático
- ✅ Suporte a múltiplas linhas
- ✅ Exemplo: `iPhone 13 128GB - 2300`

### **Gerenciamento**
- ✅ Listagem de todos os preços
- ✅ Exclusão individual
- ✅ Contador de registros
- ✅ Ordenação por marca/modelo

---

## 📊 Exemplos de Uso

### **Cadastro Manual:**
```
Marca: Apple
Modelo: iPhone 13
Capacidade: 128GB
Preço: R$ 2.800
```

### **Importação em Lote:**
```
iPhone 11 128GB - 1800
iPhone 11 256GB - 2100
iPhone 12 128GB - 2200
iPhone 12 256GB - 2500
iPhone 13 128GB - 2800
iPhone 13 256GB - 3200
iPhone 14 128GB - 3500
iPhone 14 256GB - 3900
iPhone 15 Pro Max 256GB - 6500
```

---

## 🔧 Estrutura da Tabela

**Tabela**: `suggested_prices`

**Campos:**
- `id` - UUID (chave primária)
- `brand` - Marca (text)
- `model` - Modelo (text)
- `capacity` - Capacidade (text)
- `suggested_price` - Preço sugerido (decimal)
- `created_at` - Data de criação
- `updated_at` - Data de atualização

**Índice**: Busca rápida por marca + modelo + capacidade

---

## 🎯 Próximos Passos (Futuro)

- [ ] Integrar com o formulário de Nova Troca
- [ ] Exibir preço sugerido automaticamente ao selecionar marca/modelo/capacidade
- [ ] Botão "Usar Valor Sugerido"
- [ ] Histórico de alterações de preço

---

## 📦 GitHub

https://github.com/Luizbarreto71/Poderosoiphones.git

**Execute o SQL e cadastre seus preços! 🚀**