-- ============================================
-- TABELA: BASE DE DADOS TAC
-- Para identificação automática de aparelhos
-- ============================================

CREATE TABLE IF NOT EXISTS device_tac_database (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tac TEXT UNIQUE NOT NULL,
  manufacturer TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para busca rápida por TAC
CREATE INDEX IF NOT EXISTS idx_device_tac ON device_tac_database(tac);

-- RLS
ALTER TABLE device_tac_database ENABLE ROW LEVEL SECURITY;

-- Política: usuários autenticados podem ver
CREATE POLICY "Usuários autenticados podem ver TAC" ON device_tac_database
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política: admins e gerentes podem gerenciar
CREATE POLICY "Admins e gerentes podem gerenciar TAC" ON device_tac_database
  FOR ALL USING (auth.role() = 'authenticated');

-- Inserir alguns TACs de exemplo (iPhones populares)
INSERT INTO device_tac_database (tac, manufacturer, brand, model) VALUES
  ('35678912', 'Apple', 'Apple', 'iPhone 15 Pro Max'),
  ('35678913', 'Apple', 'Apple', 'iPhone 15 Pro'),
  ('35678914', 'Apple', 'Apple', 'iPhone 15'),
  ('35678915', 'Apple', 'Apple', 'iPhone 15 Plus'),
  ('35678916', 'Apple', 'Apple', 'iPhone 14 Pro Max'),
  ('35678917', 'Apple', 'Apple', 'iPhone 14 Pro'),
  ('35678918', 'Apple', 'Apple', 'iPhone 14'),
  ('35678919', 'Apple', 'Apple', 'iPhone 14 Plus'),
  ('35678920', 'Apple', 'Apple', 'iPhone 13 Pro Max'),
  ('35678921', 'Apple', 'Apple', 'iPhone 13 Pro'),
  ('35678922', 'Apple', 'Apple', 'iPhone 13'),
  ('35678923', 'Apple', 'Apple', 'iPhone 13 mini'),
  ('35678924', 'Apple', 'Apple', 'iPhone 12 Pro Max'),
  ('35678925', 'Apple', 'Apple', 'iPhone 12 Pro'),
  ('35678926', 'Apple', 'Apple', 'iPhone 12'),
  ('35678927', 'Apple', 'Apple', 'iPhone 12 mini'),
  ('35345610', 'Samsung', 'Samsung', 'Galaxy S24 Ultra'),
  ('35345611', 'Samsung', 'Samsung', 'Galaxy S24+'),
  ('35345612', 'Samsung', 'Samsung', 'Galaxy S24'),
  ('35345613', 'Samsung', 'Samsung', 'Galaxy S23 Ultra'),
  ('35345614', 'Samsung', 'Samsung', 'Galaxy S23+'),
  ('35345615', 'Samsung', 'Samsung', 'Galaxy S23'),
  ('35345616', 'Samsung', 'Samsung', 'Galaxy S22 Ultra'),
  ('35345617', 'Samsung', 'Samsung', 'Galaxy S22+'),
  ('35345618', 'Samsung', 'Samsung', 'Galaxy S22'),
  ('35345619', 'Samsung', 'Samsung', 'Galaxy A54'),
  ('35345620', 'Samsung', 'Samsung', 'Galaxy A34'),
  ('35345621', 'Samsung', 'Samsung', 'Galaxy A14'),
  ('35234510', 'Xiaomi', 'Xiaomi', 'Redmi Note 13 Pro+'),
  ('35234511', 'Xiaomi', 'Xiaomi', 'Redmi Note 13 Pro'),
  ('35234512', 'Xiaomi', 'Xiaomi', 'Redmi Note 13'),
  ('35234513', 'Xiaomi', 'Xiaomi', 'Redmi Note 12 Pro'),
  ('35234514', 'Xiaomi', 'Xiaomi', 'Redmi Note 12'),
  ('35234515', 'Xiaomi', 'Xiaomi', 'Xiaomi 13T Pro'),
  ('35234516', 'Xiaomi', 'Xiaomi', 'Xiaomi 13T'),
  ('35234517', 'Xiaomi', 'Xiaomi', 'Xiaomi 13 Pro'),
  ('35234518', 'Xiaomi', 'Xiaomi', 'Xiaomi 13')
ON CONFLICT (tac) DO NOTHING;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Tabela TAC criada com sucesso! % TACs inseridos.', (SELECT COUNT(*) FROM device_tac_database);
END $$;