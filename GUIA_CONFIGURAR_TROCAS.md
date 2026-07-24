# ⚙️ Guia: Configurar Módulo de Trocas com Fotos

## ✅ O que foi implementado?

1. **Campo de Descrição** - Textarea para descrever detalhes da troca
2. **Upload de Fotos** - Foto do aparelho de entrada e saída
3. **Tratamento de Erros** - Mensagens detalhadas para debug

---

## 🗄️ Passo 1: Executar SQL no Supabase

### **Arquivo**: `supabase-trades-fields.sql`

1. Acesse https://supabase.com
2. Abra seu projeto
3. Clique em **SQL Editor**
4. Copie TODO o conteúdo do arquivo `supabase-trades-fields.sql`
5. Cole no editor
6. Clique em **Run**

---

## 📸 Passo 2: Configurar Storage (OBRIGATÓRIO)

### **Criar Bucket para Fotos:**

1. No Supabase, clique em **Storage** (menu esquerdo)
2. Clique em **New bucket**
3. Preencha:
   - **Name**: `photos`
   - **Public bucket**: ✅ (marque esta opção)
   - **File size limit**: 50MB
   - **Allowed MIME types**: `image/*`
4. Clique em **Create bucket**

### **Configurar Políticas de Segurança:**

Após criar o bucket, clique em **Storage Policies** e adicione:

```sql
-- Permitir upload de fotos para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Permitir visualização pública das fotos
CREATE POLICY "Fotos são públicas para leitura" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Usuários autenticados podem excluir" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos' AND auth.role() = 'authenticated');
```

---

## 🚀 Passo 3: Acessar o Sistema

### **URL**: http://localhost:3000/trocas

---

## 📋 Como Usar

### **Nova Troca:**

1. **Clique em**: "Nova Troca"
2. **Preencha os dados do cliente**
3. **Aparelho de Entrada:**
   - Modelo, IMEI, Condição
   - **Escolha uma foto** (opcional)
4. **Aparelho de Saída:**
   - Modelo, Valor, Diferença
   - **Escolha uma foto** (opcional)
5. **Descrição da Troca:**
   - Descreva detalhes, observações, estado dos aparelhos
6. **Clique em**: "Registrar Troca"

---

## 🔧 Funcionalidades

### **Upload de Fotos:**
- ✅ Preview antes de enviar
- ✅ Upload automático para Supabase Storage
- ✅ Armazenamento em pasta `trade-photos/`
- ✅ URLs públicas geradas automaticamente

### **Campo de Descrição:**
- ✅ Textarea com 4 linhas
- ✅ Placeholder com instruções
- ✅ Opcional (não obrigatório)

### **Tratamento de Erros:**
- ✅ Mensagens detalhadas no console (F12)
- ✅ Alert com erro específico do Supabase
- ✅ Validação de campos obrigatórios

---

## 🐛 Se der erro "Não foi possível realizar a troca":

### **Verifique:**

1. **Bucket criado?**
   - Vá em Storage → Verifique se o bucket `photos` existe

2. **Políticas configuradas?**
   - Execute o SQL de políticas acima

3. **Console do navegador (F12):**
   - Abra o DevTools
   - Vá na aba Console
   - Tente fazer uma troca
   - Veja o erro detalhado

4. **Erros comuns:**
   - `new row violates row-level security policy` → Falta criar as políticas
   - `bucket not found` → Bucket `photos` não existe
   - `permission denied` → Políticas não configuradas

---

## 📊 Estrutura de Dados

### **Tabela `trades` - Novos Campos:**

```sql
description TEXT -- Descrição detalhada
device_received_photo TEXT -- URL da foto do aparelho de entrada
device_given_photo TEXT -- URL da foto do aparelho de saída
```

### **Storage:**

```
bucket: photos
folder: trade-photos/
files: {timestamp}-{random}.{ext}
```

---

## 🎯 Exemplo de Uso:

```
Cliente: João Silva
Telefone: (11) 99999-9999
Endereço: Rua das Flores, 123

Aparelho de Entrada:
- Modelo: iPhone 13 128GB
- IMEI: 356789123456789
- Condição: Usado - Bom estado
- Foto: [foto do aparelho]

Aparelho de Saída:
- Modelo: iPhone 14 128GB
- Valor: R$ 3.500
- Diferença: R$ 1.200

Descrição:
Cliente entregou iPhone 13 com tela trincada mas funcionando perfeitamente.
Recebeu iPhone 14 com garantia de 3 meses.
```

---

## 📦 GitHub:

https://github.com/Luizbarreto71/Poderosoiphones.git

**Execute o SQL, configure o Storage e teste! 🚀**