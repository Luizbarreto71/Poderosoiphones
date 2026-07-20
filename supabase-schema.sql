-- ============================================
-- PODEROSO IPHONES - SCHEMA COMPLETO
-- Sistema de Gestão para Loja de iPhones
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'vendedor' CHECK (role IN ('admin', 'gerente', 'vendedor', 'tecnico', 'caixa')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABELA: PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('iPhone', 'Samsung', 'Xiaomi', 'Apple Watch', 'AirPods', 'Capinhas', 'Películas', 'Carregadores', 'Cabos', 'Fones', 'Outros')),
  color TEXT,
  capacity TEXT,
  condition TEXT CHECK (condition IN ('novo', 'seminovo', 'usado', 'vitrine')),
  supplier TEXT,
  cost DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) GENERATED ALWAYS AS (price - cost) STORED,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  image_url TEXT,
  specs TEXT,
  product_status TEXT DEFAULT 'ativo' CHECK (product_status IN ('ativo', 'inativo', 'descontinuado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABELA: IMEIs
-- ============================================
CREATE TABLE IF NOT EXISTS imeis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  imei_primary TEXT UNIQUE NOT NULL,
  imei_secondary TEXT,
  serial_number TEXT UNIQUE,
  imei_status TEXT DEFAULT 'estoque' CHECK (imei_status IN ('estoque', 'vitrine', 'reservado', 'vendido', 'defeito')),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABELA: CLIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  birth_date DATE,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_purchase DATE,
  classification TEXT DEFAULT 'bronze' CHECK (classification IN ('bronze', 'prata', 'ouro', 'diamante')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABELA: VENDAS
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  imei TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'dinheiro', 'debito', 'credito', 'parcelado')),
  installments INTEGER DEFAULT 1,
  sale_status TEXT DEFAULT 'completed' CHECK (sale_status IN ('completed', 'pending', 'cancelled')),
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABELA: TROCAS
-- ============================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  device_received TEXT NOT NULL,
  device_received_imei TEXT NOT NULL,
  device_received_condition TEXT NOT NULL,
  device_given TEXT NOT NULL,
  device_given_price DECIMAL(10,2) NOT NULL,
  difference DECIMAL(10,2) NOT NULL,
  trade_status TEXT DEFAULT 'pending' CHECK (trade_status IN ('pending', 'completed', 'cancelled')),
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABELA: GARANTIAS
-- ============================================
CREATE TABLE IF NOT EXISTS warranties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  product_name TEXT NOT NULL,
  imei TEXT NOT NULL,
  sale_date DATE NOT NULL,
  warranty_end_date DATE NOT NULL,
  warranty_months INTEGER NOT NULL,
  warranty_status TEXT DEFAULT 'active' CHECK (warranty_status IN ('active', 'expired', 'near_expiry')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABELA: ORDENS DE SERVIÇO
-- ============================================
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_brand TEXT,
  device_model TEXT,
  imei TEXT,
  reported_defect TEXT NOT NULL,
  technical_diagnosis TEXT,
  service_value DECIMAL(10,2),
  parts_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (service_value + parts_cost) STORED,
  service_status TEXT DEFAULT 'received' CHECK (service_status IN ('received', 'in_analysis', 'waiting_parts', 'in_repair', 'completed', 'delivered')),
  photos TEXT[],
  notes TEXT,
  received_date DATE DEFAULT CURRENT_DATE,
  completion_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABELA: MOVIMENTAÇÕES DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  imei_id UUID REFERENCES imeis(id),
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida', 'ajuste')),
  reason TEXT NOT NULL CHECK (reason IN ('compra', 'venda', 'troca', 'devolucao', 'perda', 'defeito', 'ajuste')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABELA: FINANCEIRO
-- ============================================
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('pix', 'dinheiro', 'debito', 'credito')),
  due_date DATE,
  paid_date DATE,
  transaction_status TEXT DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'paid', 'cancelled')),
  related_sale_id UUID REFERENCES sales(id),
  related_trade_id UUID REFERENCES trades(id),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(product_status);
CREATE INDEX IF NOT EXISTS idx_imeis_status ON imeis(imei_status);
CREATE INDEX IF NOT EXISTS idx_imeis_product ON imeis(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(warranty_status);
CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON warranties(warranty_end_date);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(service_status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE imeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES
-- ============================================

-- Usuários autenticados podem ver todos os dados
CREATE POLICY "Usuários autenticados podem ver dados" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver produtos" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver IMEIs" ON imeis
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver clientes" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver vendas" ON sales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver trocas" ON trades
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver garantias" ON warranties
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver ordens de serviço" ON service_orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins e gerentes podem inserir/atualizar dados
CREATE POLICY "Admins e gerentes podem gerenciar produtos" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'gerente')
    )
  );

CREATE POLICY "Admins e gerentes podem gerenciar vendas" ON sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'gerente', 'vendedor', 'caixa')
    )
  );

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atualizar classificação do cliente baseado no total gasto
CREATE OR REPLACE FUNCTION update_customer_classification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_spent >= 10000 THEN
    NEW.classification = 'diamante';
  ELSIF NEW.total_spent >= 5000 THEN
    NEW.classification = 'ouro';
  ELSIF NEW.total_spent >= 2000 THEN
    NEW.classification = 'prata';
  ELSE
    NEW.classification = 'bronze';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_classification_trigger BEFORE UPDATE OF total_spent ON customers
  FOR EACH ROW EXECUTE FUNCTION update_customer_classification();

-- ============================================
-- FIM DO SCHEMA
-- ============================================