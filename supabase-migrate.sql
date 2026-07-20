-- ============================================
-- MIGRAÇÃO: Renomear colunas status
-- Execute este script APENAS se já executou o schema anterior
-- ============================================

-- Renomear coluna status em products
ALTER TABLE IF EXISTS products RENAME COLUMN status TO product_status;

-- Renomear coluna status em imeis
ALTER TABLE IF EXISTS imeis RENAME COLUMN status TO imei_status;

-- Renomear coluna status em sales
ALTER TABLE IF EXISTS sales RENAME COLUMN status TO sale_status;

-- Renomear coluna status em trades
ALTER TABLE IF EXISTS trades RENAME COLUMN status TO trade_status;

-- Renomear coluna status em warranties
ALTER TABLE IF EXISTS warranties RENAME COLUMN status TO warranty_status;

-- Renomear coluna status em service_orders
ALTER TABLE IF EXISTS service_orders RENAME COLUMN status TO service_status;

-- Renomear coluna status em financial_transactions
ALTER TABLE IF EXISTS financial_transactions RENAME COLUMN status TO transaction_status;

-- Atualizar CHECK constraints
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (product_status IN ('ativo', 'inativo', 'descontinuado'));

ALTER TABLE imeis DROP CONSTRAINT IF EXISTS imeis_status_check;
ALTER TABLE imeis ADD CONSTRAINT imeis_status_check CHECK (imei_status IN ('estoque', 'vitrine', 'reservado', 'vendido', 'defeito'));

ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_status_check;
ALTER TABLE sales ADD CONSTRAINT sales_status_check CHECK (sale_status IN ('completed', 'pending', 'cancelled'));

ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_status_check;
ALTER TABLE trades ADD CONSTRAINT trades_status_check CHECK (trade_status IN ('pending', 'completed', 'cancelled'));

ALTER TABLE warranties DROP CONSTRAINT IF EXISTS warranties_status_check;
ALTER TABLE warranties ADD CONSTRAINT warranties_status_check CHECK (warranty_status IN ('active', 'expired', 'near_expiry'));

ALTER TABLE service_orders DROP CONSTRAINT IF EXISTS service_orders_status_check;
ALTER TABLE service_orders ADD CONSTRAINT service_orders_status_check CHECK (service_status IN ('received', 'in_analysis', 'waiting_parts', 'in_repair', 'completed', 'delivered'));

ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_status_check;
ALTER TABLE financial_transactions ADD CONSTRAINT financial_transactions_status_check CHECK (transaction_status IN ('pending', 'paid', 'cancelled'));

-- Atualizar índices
DROP INDEX IF EXISTS idx_products_status;
CREATE INDEX idx_products_status ON products(product_status);

DROP INDEX IF EXISTS idx_imeis_status;
CREATE INDEX idx_imeis_status ON imeis(imei_status);

DROP INDEX IF EXISTS idx_warranties_status;
CREATE INDEX idx_warranties_status ON warranties(warranty_status);

DROP INDEX IF EXISTS idx_service_orders_status;
CREATE INDEX idx_service_orders_status ON service_orders(service_status);

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migração concluída! Colunas status renomeadas com sucesso.';
END $$;