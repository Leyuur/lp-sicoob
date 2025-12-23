-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  data_nascimento DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de números da sorte
CREATE TABLE IF NOT EXISTS numeros (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  numero VARCHAR(32) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_usuario (usuario_id),
  KEY idx_numero (numero),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de chaves de acesso (notas fiscais)
CREATE TABLE IF NOT EXISTS chaves_acesso (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  chave_acesso VARCHAR(100) NOT NULL,
  quantidade_numeros INT NOT NULL DEFAULT 1,
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_chave (chave_acesso),
  KEY idx_usuario (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de possíveis ganhadores (indicados manualmente)
CREATE TABLE IF NOT EXISTS possiveis_ganhadores (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  numero VARCHAR(32) NOT NULL,
  data_indicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  indicado_por VARCHAR(255) NOT NULL,
  KEY idx_usuario (usuario_id),
  KEY idx_numero (numero),
  UNIQUE KEY uq_possivel (usuario_id, numero),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de ganhadores oficiais
CREATE TABLE IF NOT EXISTS ganhadores (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  numero VARCHAR(32) NOT NULL,
  data_premiacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  premiado_por VARCHAR(255) NOT NULL,
  KEY idx_usuario (usuario_id),
  KEY idx_numero (numero),
  UNIQUE KEY uq_ganhador (usuario_id, numero),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de logs de upload
CREATE TABLE IF NOT EXISTS upload_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uploaded_by VARCHAR(255) NOT NULL,
  total_lines INT NOT NULL DEFAULT 0,
  processed_lines INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  numbers_generated INT NOT NULL DEFAULT 0,
  users_affected INT NOT NULL DEFAULT 0,
  affected_users TEXT,
  status ENUM('success', 'error') NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_status (status),
  KEY idx_uploaded_by (uploaded_by),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
