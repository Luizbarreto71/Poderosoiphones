-- ============================================
-- CORREÇÃO RLS FINAL
-- Remove políticas antigas e cria novas
-- ============================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar clientes" ON customers;
DROP POLICY IF EXISTS "Usuários autenticados podem criar vendas" ON sales;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar vendas" ON sales;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar produtos" ON products;

-- Criar políticas novas
CREATE POLICY "Usuários autenticados podem gerenciar clientes" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar vendas" ON sales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar vendas" ON sales
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar produtos" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS aplicadas com sucesso!';
END $$;