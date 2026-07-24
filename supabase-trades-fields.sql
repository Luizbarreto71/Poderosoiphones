-- ============================================
-- ADICIONAR CAMPOS DE DESCRIÇÃO E FOTOS NAS TROCAS
-- ============================================

-- Adicionar coluna de descrição
ALTER TABLE trades 
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Adicionar colunas de fotos
ALTER TABLE trades 
  ADD COLUMN IF NOT EXISTS device_received_photo TEXT,
  ADD COLUMN IF NOT EXISTS device_given_photo TEXT;

-- Comentários
COMMENT ON COLUMN trades.description IS 'Descrição detalhada da troca';
COMMENT ON COLUMN trades.device_received_photo IS 'URL da foto do aparelho de entrada';
COMMENT ON COLUMN trades.device_given_photo IS 'URL da foto do aparelho de saída';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Campos adicionados com sucesso!';
END $$;