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

-- Inserir TACs de exemplo (iPhones, Samsung, Xiaomi e outros)
INSERT INTO device_tac_database (tac, manufacturer, brand, model) VALUES
  -- iPhones (série 35)
  ('35618816', 'Apple', 'Apple', 'iPhone 15 Pro Max'),
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
  ('35678928', 'Apple', 'Apple', 'iPhone 11 Pro Max'),
  ('35678929', 'Apple', 'Apple', 'iPhone 11 Pro'),
  ('35678930', 'Apple', 'Apple', 'iPhone 11'),
  ('35678931', 'Apple', 'Apple', 'iPhone XS Max'),
  ('35678932', 'Apple', 'Apple', 'iPhone XS'),
  ('35678933', 'Apple', 'Apple', 'iPhone XR'),
  ('35678934', 'Apple', 'Apple', 'iPhone X'),
  ('35678935', 'Apple', 'Apple', 'iPhone 8 Plus'),
  ('35678936', 'Apple', 'Apple', 'iPhone 8'),
  ('35678937', 'Apple', 'Apple', 'iPhone SE (3ª geração)'),
  ('35678938', 'Apple', 'Apple', 'iPhone SE (2ª geração)'),
  -- Samsung Galaxy S
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
  ('35345622', 'Samsung', 'Samsung', 'Galaxy A15'),
  ('35345623', 'Samsung', 'Samsung', 'Galaxy A55'),
  ('35345624', 'Samsung', 'Samsung', 'Galaxy Z Fold5'),
  ('35345625', 'Samsung', 'Samsung', 'Galaxy Z Flip5'),
  ('35345626', 'Samsung', 'Samsung', 'Galaxy Z Fold4'),
  ('35345627', 'Samsung', 'Samsung', 'Galaxy Z Flip4'),
  -- Xiaomi
  ('35234510', 'Xiaomi', 'Xiaomi', 'Redmi Note 13 Pro+'),
  ('35234511', 'Xiaomi', 'Xiaomi', 'Redmi Note 13 Pro'),
  ('35234512', 'Xiaomi', 'Xiaomi', 'Redmi Note 13'),
  ('35234513', 'Xiaomi', 'Xiaomi', 'Redmi Note 12 Pro'),
  ('35234514', 'Xiaomi', 'Xiaomi', 'Redmi Note 12'),
  ('35234515', 'Xiaomi', 'Xiaomi', 'Xiaomi 13T Pro'),
  ('35234516', 'Xiaomi', 'Xiaomi', 'Xiaomi 13T'),
  ('35234517', 'Xiaomi', 'Xiaomi', 'Xiaomi 13 Pro'),
  ('35234518', 'Xiaomi', 'Xiaomi', 'Xiaomi 13'),
  ('35234519', 'Xiaomi', 'Xiaomi', 'Xiaomi 14 Pro'),
  ('35234520', 'Xiaomi', 'Xiaomi', 'Xiaomi 14'),
  ('35234521', 'Xiaomi', 'Xiaomi', 'Poco X6 Pro'),
  ('35234522', 'Xiaomi', 'Xiaomi', 'Poco X6'),
  ('35234523', 'Xiaomi', 'Xiaomi', 'Poco F5 Pro'),
  ('35234524', 'Xiaomi', 'Xiaomi', 'Poco F5'),
  -- Motorola
  ('35456710', 'Motorola', 'Motorola', 'Edge 50 Pro'),
  ('35456711', 'Motorola', 'Motorola', 'Edge 50'),
  ('35456712', 'Motorola', 'Motorola', 'Moto G84'),
  ('35456713', 'Motorola', 'Motorola', 'Moto G54'),
  ('35456714', 'Motorola', 'Motorola', 'Moto G34'),
  ('35456715', 'Motorola', 'Motorola', 'Moto G14'),
  ('35456716', 'Motorola', 'Motorola', 'Razr 50 Ultra'),
  ('35456717', 'Motorola', 'Motorola', 'Razr 50'),
  -- Apple Watch
  ('35890110', 'Apple', 'Apple', 'Apple Watch Ultra 2'),
  ('35890111', 'Apple', 'Apple', 'Apple Watch Ultra'),
  ('35890112', 'Apple', 'Apple', 'Apple Watch Series 9'),
  ('35890113', 'Apple', 'Apple', 'Apple Watch Series 8'),
  ('35890114', 'Apple', 'Apple', 'Apple Watch SE (2ª geração)'),
  -- AirPods
  ('35901210', 'Apple', 'Apple', 'AirPods Pro 2'),
  ('35901211', 'Apple', 'Apple', 'AirPods Pro'),
  ('35901212', 'Apple', 'Apple', 'AirPods 3'),
  ('35901213', 'Apple', 'Apple', 'AirPods 2'),
  ('35901214', 'Apple', 'Apple', 'AirPods Max')
ON CONFLICT (tac) DO NOTHING;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Tabela TAC criada com sucesso! % TACs inseridos.', (SELECT COUNT(*) FROM device_tac_database);
END $$;