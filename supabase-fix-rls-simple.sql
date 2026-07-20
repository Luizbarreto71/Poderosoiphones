-- ============================================
-- CORREÇÃO RLS SIMPLIFICADA
-- Execute se der erro "relation users does not exist"
-- ============================================

-- Política para customers: qualquer usuário autenticado pode gerenciar
CREATE POLICY "Usuários autenticados podem gerenciar clientes" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

-- Política para sales: qualquer usuário autenticado pode criar vendas
CREATE POLICY "Usuários autenticados podem criar vendas" ON sales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para sales: qualquer usuário autenticado pode atualizar vendas
CREATE POLICY "Usuários autenticados podem atualizar vendas" ON sales
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para products: qualquer usuário autenticado pode atualizar estoque
CREATE POLICY "Usuários autenticados podem atualizar produtos" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS simplificadas aplicadas com sucesso!';
END $$;