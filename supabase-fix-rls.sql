-- ============================================
-- CORREÇÃO: Adicionar políticas RLS faltantes
-- Execute se der erro "violates row-level security policy"
-- ============================================

-- Política para INSERT/UPDATE em customers (qualquer usuário autenticado pode criar/editar clientes)
CREATE POLICY "Usuários autenticados podem gerenciar clientes" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'gerente', 'vendedor', 'caixa', 'tecnico')
    )
  );

-- Política para INSERT em sales (qualquer usuário autenticado pode criar vendas)
CREATE POLICY "Usuários autenticados podem criar vendas" ON sales
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'gerente', 'vendedor', 'caixa')
    )
  );

-- Política para UPDATE em sales (qualquer usuário autenticado pode atualizar vendas)
CREATE POLICY "Usuários autenticados podem atualizar vendas" ON sales
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'gerente', 'vendedor', 'caixa')
    )
  );

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS corrigidas com sucesso!';
END $$;