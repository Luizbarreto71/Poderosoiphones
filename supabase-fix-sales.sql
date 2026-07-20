-- ============================================
-- CORREÇÃO: Adicionar colunas faltantes em sales
-- Execute se der erro "column does not exist" em sales
-- ============================================

-- Adicionar colunas faltantes na tabela sales (se não existirem)
DO $$
BEGIN
  -- product_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE sales ADD COLUMN product_id UUID REFERENCES products(id);
  END IF;
END $$;

DO $$
BEGIN
  -- customer_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE sales ADD COLUMN customer_name TEXT NOT NULL DEFAULT 'Cliente';
  END IF;
END $$;

DO $$
BEGIN
  -- customer_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE sales ADD COLUMN customer_phone TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  -- product_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE sales ADD COLUMN product_name TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  -- imei
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'imei'
  ) THEN
    ALTER TABLE sales ADD COLUMN imei TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  -- quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE sales ADD COLUMN quantity INTEGER DEFAULT 1;
  END IF;
END $$;

DO $$
BEGIN
  -- unit_price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE sales ADD COLUMN unit_price DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  -- total_price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE sales ADD COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  -- discount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'discount'
  ) THEN
    ALTER TABLE sales ADD COLUMN discount DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  -- final_price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'final_price'
  ) THEN
    ALTER TABLE sales ADD COLUMN final_price DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  -- payment_method
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE sales ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'pix';
  END IF;
END $$;

DO $$
BEGIN
  -- installments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'installments'
  ) THEN
    ALTER TABLE sales ADD COLUMN installments INTEGER DEFAULT 1;
  END IF;
END $$;

DO $$
BEGIN
  -- sale_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'sale_status'
  ) THEN
    ALTER TABLE sales ADD COLUMN sale_status TEXT DEFAULT 'completed';
  END IF;
END $$;

DO $$
BEGIN
  -- date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'date'
  ) THEN
    ALTER TABLE sales ADD COLUMN date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

DO $$
BEGIN
  -- notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'notes'
  ) THEN
    ALTER TABLE sales ADD COLUMN notes TEXT;
  END IF;
END $$;

DO $$
BEGIN
  -- created_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE sales ADD COLUMN created_by UUID;
  END IF;
END $$;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Todas as colunas da tabela sales foram verificadas e corrigidas!';
END $$;