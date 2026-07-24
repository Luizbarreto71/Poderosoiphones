-- ============================================
-- CRIAR TABELA TRODAS COMPLETA
-- ============================================

-- Criar tabela trades
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  device_received TEXT NOT NULL,
  device_received_imei TEXT NOT NULL,
  device_received_condition TEXT NOT NULL,
  device_given TEXT NOT NULL,
  device_given_price DECIMAL(10, 2) NOT NULL,
  difference DECIMAL(10, 2) NOT NULL,
  description TEXT,
  device_received_photo TEXT,
  device_given_photo TEXT,
  date DATE DEFAULT CURRENT_DATE,
  trade_status TEXT DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_trades_customer ON trades(customer_name, customer_phone);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(created_at DESC);

-- RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Política: todos autenticados podem ver
CREATE POLICY "Usuários autenticados podem ver trocas" ON trades
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política: admins e gerentes podem gerenciar
CREATE POLICY "Admins e gerentes podem gerenciar trocas" ON trades
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_trades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_trades_updated_at();

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Tabela trades criada com sucesso!';
END $$;