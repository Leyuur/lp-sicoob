-- MIGRATION: Add period reference support and dual number tables

-- 1. Add period-related fields to usuarios table
ALTER TABLE usuarios 
  ADD COLUMN IF NOT EXISTS data_nascimento_abertura DATE DEFAULT NULL COMMENT 'Data de nascimento (PF) ou abertura (PJ)',
  ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255) DEFAULT NULL COMMENT 'Nome completo ou razão social';

-- 2. Create new table for monthly lottery numbers
CREATE TABLE IF NOT EXISTS numeros_mensais (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  numero VARCHAR(32) NOT NULL,
  periodo_mes ENUM('janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro') NOT NULL,
  periodo_ano YEAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(255) NOT NULL,
  KEY idx_usuario (usuario_id),
  KEY idx_numero (numero),
  KEY idx_periodo (periodo_mes, periodo_ano),
  UNIQUE KEY uq_numero_periodo (numero, periodo_mes, periodo_ano),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Números da sorte para sorteios mensais';

-- 3. Create new table for periodic lottery numbers
CREATE TABLE IF NOT EXISTS numeros_periodicos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  numero VARCHAR(32) NOT NULL,
  periodo_tipo ENUM('trimestre_1', 'trimestre_2', 'trimestre_3', 'trimestre_4', 
                    'semestral', 'anual') NOT NULL,
  periodo_ano YEAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(255) NOT NULL,
  KEY idx_usuario (usuario_id),
  KEY idx_numero (numero),
  KEY idx_periodo (periodo_tipo, periodo_ano),
  UNIQUE KEY uq_numero_periodo (numero, periodo_tipo, periodo_ano),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Números da sorte para sorteios periódicos (trimestral, semestral, anual)';

-- 4. Update chaves_acesso table to include period reference
ALTER TABLE chaves_acesso 
  ADD COLUMN IF NOT EXISTS tipo_sorteio ENUM('mensal', 'periodico') NOT NULL DEFAULT 'mensal' AFTER quantidade_numeros,
  ADD COLUMN IF NOT EXISTS periodo_referencia VARCHAR(50) DEFAULT NULL AFTER tipo_sorteio,
  ADD COLUMN IF NOT EXISTS periodo_ano YEAR DEFAULT NULL AFTER periodo_referencia,
  ADD INDEX idx_tipo_periodo (tipo_sorteio, periodo_referencia, periodo_ano);

-- 5. Update notas_fiscais table if it exists (based on exportNotas.php)
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  numero_nota VARCHAR(100) NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  data_compra DATE DEFAULT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_usuario (usuario_id),
  KEY idx_numero_nota (numero_nota),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Update possiveis_ganhadores to reference period
ALTER TABLE possiveis_ganhadores
  ADD COLUMN IF NOT EXISTS tipo_sorteio ENUM('mensal', 'periodico') DEFAULT 'mensal' AFTER numero,
  ADD COLUMN IF NOT EXISTS periodo_referencia VARCHAR(50) DEFAULT NULL AFTER tipo_sorteio,
  ADD COLUMN IF NOT EXISTS periodo_ano YEAR DEFAULT NULL AFTER periodo_referencia;

-- 7. Update ganhadores to reference period
ALTER TABLE ganhadores
  ADD COLUMN IF NOT EXISTS tipo_sorteio ENUM('mensal', 'periodico') DEFAULT 'mensal' AFTER numero,
  ADD COLUMN IF NOT EXISTS periodo_referencia VARCHAR(50) DEFAULT NULL AFTER tipo_sorteio,
  ADD COLUMN IF NOT EXISTS periodo_ano YEAR DEFAULT NULL AFTER periodo_referencia;

-- 8. Update upload_logs to track period information
ALTER TABLE upload_logs
  ADD COLUMN IF NOT EXISTS tipo_sorteio ENUM('mensal', 'periodico') DEFAULT NULL AFTER uploaded_by,
  ADD COLUMN IF NOT EXISTS periodo_referencia VARCHAR(50) DEFAULT NULL AFTER tipo_sorteio,
  ADD COLUMN IF NOT EXISTS periodo_ano YEAR DEFAULT NULL AFTER periodo_referencia;

-- Note: The original 'numeros' table is preserved for backward compatibility
-- New uploads should use numeros_mensais or numeros_periodicos
