# ⚠️ Erro: Tabela suggested_prices não encontrada

## 🔧 Solução:

Execute este arquivo SQL no Supabase:

### **Arquivo**: `supabase-suggested-prices.sql`

1. Acesse https://supabase.com
2. Abra seu projeto
3. Clique em **SQL Editor**
4. Copie TODO o conteúdo do arquivo `supabase-suggested-prices.sql`
5. Cole no editor
6. Clique em **Run**

---

## ✅ O que este SQL faz:

- Cria a tabela `suggested_prices`
- Adiciona campos: marca, modelo, capacidade, preço
- Configura RLS (segurança)
- Insere 28 preços de exemplo

---

## 🚀 Depois de executar:

1. **Recarregue a página** (F5)
2. **Acesse**: http://localhost:3000/trocas
3. **Clique na aba**: "Preços Sugeridos"
4. **Veja**: Os preços carregados!

---

## 📋 Todos os SQLs necessários:

Execute **todos** estes arquivos no Supabase, **nesta ordem**:

1. ✅ `supabase-create-trades.sql` - Tabela de trocas
2. ✅ `supabase-suggested-prices.sql` - Tabela de preços sugeridos
3. ✅ `supabase-tac-database.sql` - Base de dados TAC
4. ✅ `supabase-trades-fields.sql` - Campos adicionais (opcional, já incluído no create)

---

## 📸 Não esqueça do Storage:

Após executar os SQLs, configure o Storage para as fotos:

1. **Storage** → **New bucket**
2. **Name**: `photos`
3. **Public bucket**: ✅
4. **Create bucket**

5. **Storage Policies**:
```sql
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Fotos são públicas para leitura" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Usuários autenticados podem excluir" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos' AND auth.role() = 'authenticated');
```

---

## 🐛 Se ainda der erro:

1. **Limpe o cache do navegador**: `Cmd + Shift + R` (Mac) ou `Ctrl + Shift + R` (Windows)
2. **Verifique o console (F12)** para ver o erro exato
3. **Confirme que executou o SQL** no Supabase

---

## 📦 GitHub:
https://github.com/Luizbarreto71/Poderosoiphones.git

**Execute o SQL `supabase-suggested-prices.sql` e recarregue a página! 🚀**