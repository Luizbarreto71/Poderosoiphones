-- ============================================
-- CORREÇÃO: Adicionar colunas faltantes
-- Execute se der erro "column does not exist"
-- ============================================

-- Verificar e adicionar coluna price em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'price'
  ) THEN
    ALTER TABLE products ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Verificar e adicionar coluna cost em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'cost'
  ) THEN
    ALTER TABLE products ADD COLUMN cost DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Verificar e adicionar coluna stock em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock'
  ) THEN
    ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
  END IF;
END $$;

-- Verificar e adicionar coluna min_stock em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'min_stock'
  ) THEN
    ALTER TABLE products ADD COLUMN min_stock INTEGER DEFAULT 5;
  END IF;
END $$;

-- Verificar e adicionar coluna brand em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'brand'
  ) THEN
    ALTER TABLE products ADD COLUMN brand TEXT;
  END IF;
END $$;

-- Verificar e adicionar coluna model em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'model'
  ) THEN
    ALTER TABLE products ADD COLUMN model TEXT;
  END IF;
END $$;

-- Verificar e adicionar coluna category em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE products ADD COLUMN category TEXT;
  END IF;
END $$;

-- Verificar e adicionar coluna color em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'color'
  ) THEN
    ALTER TABLE products ADD COLUMN color TEXT;
  END IF;
END $$;

-- Verificar e adicionar coluna capacity em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'capacity'
  ) THEN
    ALTER TABLE products ADD COLUMN capacity TEXT;
  END IF;
END $$;

-- Verificar e adicionar coluna condition em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'condition'
  ) THEN
    ALTER TABLE products ADD COLUMN condition TEXT;
  END IF;
END $$;

-- Verificar e adicionar coluna image_url em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Verificar e adicionar coluna specs em products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'specs'
  ) THEN
    ALTER TABLE products ADD COLUMN specs TEXT;
  END IF;
END $$;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Colunas adicionadas com sucesso!';
END $$;