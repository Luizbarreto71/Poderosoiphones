-- ============================================
-- TABELA: PREÇOS SUGERIDOS PARA TROCAS
-- ============================================

CREATE TABLE IF NOT EXISTS suggested_prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  capacity TEXT NOT NULL,
  suggested_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_brand_model_capacity UNIQUE (brand, model, capacity)
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_suggested_prices_brand_model ON suggested_prices(brand, model, capacity);

-- RLS
ALTER TABLE suggested_prices ENABLE ROW LEVEL SECURITY;

-- Política: todos autenticados podem ver
CREATE POLICY "Usuários autenticados podem ver preços sugeridos" ON suggested_prices
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política: admins e gerentes podem gerenciar
CREATE POLICY "Admins e gerentes podem gerenciar preços" ON suggested_prices
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_suggested_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suggested_prices_updated_at
  BEFORE UPDATE ON suggested_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_suggested_prices_updated_at();

-- Inserir alguns preços sugeridos de exemplo
INSERT INTO suggested_prices (brand, model, capacity, suggested_price) VALUES
  ('Apple', 'iPhone 11', '128GB', 1800.00),
  ('Apple', 'iPhone 11', '256GB', 2100.00),
  ('Apple', 'iPhone 12', '128GB', 2200.00),
  ('Apple', 'iPhone 12', '256GB', 2500.00),
  ('Apple', 'iPhone 13', '128GB', 2800.00),
  ('Apple', 'iPhone 13', '256GB', 3200.00),
  ('Apple', 'iPhone 13', '512GB', 3600.00),
  ('Apple', 'iPhone 14', '128GB', 3500.00),
  ('Apple', 'iPhone 14', '256GB', 3900.00),
  ('Apple', 'iPhone 14', '512GB', 4300.00),
  ('Apple', 'iPhone 15', '128GB', 4500.00),
  ('Apple', 'iPhone 15', '256GB', 5000.00),
  ('Apple', 'iPhone 15 Pro', '128GB', 5500.00),
  ('Apple', 'iPhone 15 Pro', '256GB', 6000.00),
  ('Apple', 'iPhone 15 Pro Max', '256GB', 6500.00),
  ('Apple', 'iPhone 15 Pro Max', '512GB', 7200.00),
  ('Samsung', 'Galaxy S23', '128GB', 2800.00),
  ('Samsung', 'Galaxy S23', '256GB', 3200.00),
  ('Samsung', 'Galaxy S24', '128GB', 3500.00),
  ('Samsung', 'Galaxy S24', '256GB', 4000.00),
  ('Samsung', 'Galaxy S24 Ultra', '256GB', 5500.00),
  ('Samsung', 'Galaxy A54', '128GB', 1500.00),
  ('Samsung', 'Galaxy A54', '256GB', 1800.00),
  ('Xiaomi', 'Redmi Note 13', '128GB', 800.00),
  ('Xiaomi', 'Redmi Note 13', '256GB', 1000.00),
  ('Xiaomi', 'Redmi Note 13 Pro', '256GB', 1300.00),
  ('Xiaomi', 'Xiaomi 13T', '256GB', 1800.00),
  ('Xiaomi', 'Xiaomi 14', '256GB', 2800.00)
ON CONFLICT (brand, model, capacity) DO NOTHING;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Tabela de preços sugeridos criada com sucesso!';
END $$;