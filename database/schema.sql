-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 21-Maio-2026 às 12:09 Documento criado pelo servidor
-- Versão do servidor: 10.11.11-MariaDB
-- versão do PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `1211405`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `avaria`
--

CREATE TABLE `avaria` (
  `id_avaria` int(11) NOT NULL,
  `utilizador_id` int(11) NOT NULL,
  `edificio_id` int(11) NOT NULL,
  `fracao_id` int(11) DEFAULT NULL,
  `categoria_id` int(11) NOT NULL,
  `descricao` mediumtext NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `categoria_avaria`
--

CREATE TABLE `categoria_avaria` (
  `id_categoria` int(11) NOT NULL,
  `nome_pt` varchar(50) NOT NULL,
  `nome_en` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `categoria_avaria`
--

INSERT INTO `categoria_avaria` (`id_categoria`, `nome_pt`, `nome_en`) VALUES
(1, 'canalizacao', 'plumbing'),
(2, 'eletricidade', 'electrical'),
(3, 'elevador', 'elevator'),
(4, 'limpeza', 'cleaning'),
(5, 'seguranca', 'security'),
(6, 'outra', 'other');

-- --------------------------------------------------------

--
-- Estrutura da tabela `categoria_despesa`
--

CREATE TABLE `categoria_despesa` (
  `id_categoria` int(11) NOT NULL,
  `nome_pt` varchar(50) NOT NULL,
  `nome_en` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `categoria_despesa`
--

INSERT INTO `categoria_despesa` (`id_categoria`, `nome_pt`, `nome_en`) VALUES
(1, 'manutencao', 'maintenance'),
(2, 'agua', 'water'),
(3, 'eletricidade', 'electricity'),
(4, 'limpeza', 'cleaning'),
(5, 'jardinagem', 'gardening'),
(6, 'seguro', 'insurance'),
(7, 'outra', 'other');

-- --------------------------------------------------------

--
-- Estrutura da tabela `despesa`
--

CREATE TABLE `despesa` (
  `id_despesa` int(11) NOT NULL,
  `edificio_id` int(11) NOT NULL,
  `gestor_id` int(11) NOT NULL,
  `fornecedor_id` int(11) DEFAULT NULL,
  `categoria_id` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_despesa` date NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `edificio`
--

CREATE TABLE `edificio` (
  `id_edificio` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `morada` varchar(255) NOT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `edificio`
--

INSERT INTO `edificio` (`id_edificio`, `nome`, `morada`, `codigo_postal`, `cidade`, `latitude`, `longitude`, `status`) VALUES
(1, 'Edifício Aliados', 'Avenida dos Aliados, 100', '4000-064', 'Porto', '41.1496000', '-8.6109000', 0),
(2, 'Edifício Marquês', 'Avenida da Liberdade, 200', '1250-147', 'Lisboa', '38.7214000', '-9.1459312', 0),
(3, 'Edifício Sé Velha', 'Rua Larga, 15', '3004-505', 'Coimbra', '40.2086000', '-8.4262000', 1),
(4, 'Edifício Sameiro', 'Rua do Souto, 45', '4700-326', 'Braga', '41.5503000', '-8.4262000', 1),
(5, 'Edifício Forum', 'Rua de Coimbra, 10', '3810-186', 'Aveiro', '40.6404000', '-8.6538000', 1),
(6, 'Edifício Grão Vasco', 'Rua Direita, 60', '3500-088', 'Viseu', '40.6610000', '-7.9097000', 1),
(7, 'Edifício Ria Formosa', 'Rua de Santo António, 25', '8000-285', 'Faro', '37.0150000', '-7.9351000', 1),
(8, 'Edifício Templários', 'Rua Serpa Pinto, 80', '7000-537', 'Évora', '38.5712000', '-7.9136000', 1),
(9, 'Edifício Sado', 'Avenida Luísa Todi, 150', '2900-462', 'Setúbal', '38.5244000', '-8.8882000', 1),
(10, 'Edifício Atlântico', 'Rua da Carreira, 50', '9000-042', 'Funchal', '32.6469000', '-16.9089000', 1),
(11, 'ISEP', 'R. Dr. António Bernardino de Almeida 431', '4249-015', 'Porto', '41.1781210', '-8.6073629', 1),
(12, 'FEUP', 'R. Dr. Roberto Frias s/n', '4200-465', 'Porto', '41.1791486', '-8.5986378', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `espaco_comum`
--

CREATE TABLE `espaco_comum` (
  `id_espaco` int(11) NOT NULL,
  `edificio_id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `capacidade` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `estado_ordem_trabalho`
--

CREATE TABLE `estado_ordem_trabalho` (
  `id_estado` int(11) NOT NULL,
  `nome_pt` varchar(50) NOT NULL,
  `nome_en` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `estado_ordem_trabalho`
--

INSERT INTO `estado_ordem_trabalho` (`id_estado`, `nome_pt`, `nome_en`) VALUES
(1, 'aberta', 'open'),
(2, 'em curso', 'in progress'),
(3, 'em espera', 'on hold'),
(4, 'concluida', 'completed'),
(5, 'cancelada', 'cancelled');

-- --------------------------------------------------------

--
-- Estrutura da tabela `estado_reserva`
--

CREATE TABLE `estado_reserva` (
  `id_estado` int(11) NOT NULL,
  `nome_pt` varchar(50) NOT NULL,
  `nome_en` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `estado_reserva`
--

INSERT INTO `estado_reserva` (`id_estado`, `nome_pt`, `nome_en`) VALUES
(1, 'pendente', 'pending'),
(2, 'aprovada', 'approved'),
(3, 'rejeitada', 'rejected'),
(4, 'cancelada', 'cancelled'),
(5, 'concluida', 'completed');

-- --------------------------------------------------------

--
-- Estrutura da tabela `fornecedor`
--

CREATE TABLE `fornecedor` (
  `id_fornecedor` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `servico` varchar(100) DEFAULT NULL,
  `site` varchar(255) DEFAULT NULL,
  `preco_hora` decimal(8,2) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `fornecedor`
--

INSERT INTO `fornecedor` (`id_fornecedor`, `nome`, `servico`, `site`, `preco_hora`, `status`) VALUES
(1, 'Otis Portugal', 'Elevadores', 'https://www.otis.com/pt/pt/produtos/elevadores-gen3-gen360?utm_feeditemid=', '50.00', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `fracao`
--

CREATE TABLE `fracao` (
  `id_fracao` int(11) NOT NULL,
  `edificio_id` int(11) NOT NULL,
  `codigo_fracao` varchar(20) NOT NULL,
  `andar` varchar(10) DEFAULT NULL,
  `area_m2` decimal(8,2) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `gestor_edificio`
--

CREATE TABLE `gestor_edificio` (
  `id_gestor_edificio` int(11) NOT NULL,
  `gestor_id` int(11) NOT NULL,
  `edificio_id` int(11) NOT NULL,
  `data_inicio` date NOT NULL DEFAULT curdate(),
  `data_fim` date DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `log_acesso`
--

CREATE TABLE `log_acesso` (
  `id_log` int(11) NOT NULL,
  `utilizador_id` int(11) DEFAULT NULL,
  `acao` varchar(50) NOT NULL,
  `timestamp` datetime NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `resultado` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `log_acesso`
--

INSERT INTO `log_acesso` (`id_log`, `utilizador_id`, `acao`, `timestamp`, `ip_address`, `resultado`) VALUES
(1, 1, 'login', '2026-05-20 23:43:06', '127.0.0.1', 'sucesso'),
(2, 4, 'registo', '2026-05-20 23:45:58', '127.0.0.1', 'sucesso'),
(3, 1, 'esqueci_password', '2026-05-21 01:13:03', NULL, 'sucesso'),
(4, 5, 'registo', '2026-05-21 01:13:58', '127.0.0.1', 'sucesso'),
(5, 5, 'esqueci_password', '2026-05-21 01:14:36', NULL, 'sucesso'),
(6, 5, 'reset_password', '2026-05-21 01:15:20', '127.0.0.1', 'sucesso'),
(7, 5, 'login', '2026-05-21 01:15:32', '127.0.0.1', 'sucesso'),
(8, 5, 'esqueci_password', '2026-05-21 01:20:12', NULL, 'sucesso'),
(9, NULL, 'login_failed', '2026-05-21 01:21:16', '127.0.0.1', 'falhou'),
(10, 5, 'login', '2026-05-21 01:21:25', '127.0.0.1', 'sucesso'),
(11, 1, 'login', '2026-05-21 01:37:51', '127.0.0.1', 'sucesso'),
(12, 1, 'logout', '2026-05-21 01:39:44', '127.0.0.1', 'sucesso'),
(13, NULL, 'login_failed', '2026-05-21 01:40:00', '127.0.0.1', 'falhou'),
(14, NULL, 'login_failed', '2026-05-21 01:40:04', '127.0.0.1', 'falhou'),
(15, 4, 'login', '2026-05-21 01:40:08', '127.0.0.1', 'sucesso'),
(16, 1, 'login', '2026-05-21 01:40:24', '127.0.0.1', 'sucesso'),
(17, 1, 'esqueci_password', '2026-05-21 02:03:43', NULL, 'sucesso'),
(18, 1, 'login', '2026-05-21 02:10:56', '127.0.0.1', 'sucesso'),
(19, 1, 'logout', '2026-05-21 02:33:35', '127.0.0.1', 'sucesso'),
(20, NULL, 'login_failed', '2026-05-21 02:33:47', '127.0.0.1', 'falhou'),
(21, 4, 'login', '2026-05-21 02:33:51', '127.0.0.1', 'sucesso'),
(22, NULL, 'login_failed', '2026-05-21 02:34:03', '127.0.0.1', 'falhou'),
(23, 5, 'login', '2026-05-21 02:34:08', '127.0.0.1', 'sucesso');

-- --------------------------------------------------------

--
-- Estrutura da tabela `notificacao`
--

CREATE TABLE `notificacao` (
  `id_notificacao` int(11) NOT NULL,
  `utilizador_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `mensagem` mediumtext NOT NULL,
  `lida` int(11) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 1,
  `tipo` varchar(50) DEFAULT NULL,
  `referencia_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `ordem_trabalho`
--

CREATE TABLE `ordem_trabalho` (
  `id_ordem` int(11) NOT NULL,
  `avaria_id` int(11) NOT NULL,
  `tecnico_id` int(11) DEFAULT NULL,
  `gestor_id` int(11) NOT NULL,
  `fornecedor_id` int(11) DEFAULT NULL,
  `estado_id` int(11) NOT NULL,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `pagamento`
--

CREATE TABLE `pagamento` (
  `id_pagamento` int(11) NOT NULL,
  `quota_id` int(11) NOT NULL,
  `utilizador_id` int(11) NOT NULL,
  `valor_pago` decimal(10,2) NOT NULL,
  `data_pagamento` date NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `perfil`
--

CREATE TABLE `perfil` (
  `id_perfil` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `descricao` mediumtext DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `perfil`
--

INSERT INTO `perfil` (`id_perfil`, `nome`, `descricao`, `status`) VALUES
(1, 'visitante', 'Acesso a informacao publica do condominio', 1),
(2, 'condomino', 'Consulta quotas, faz reservas e reporta avarias', 1),
(3, 'gestor', 'Responsavel pela gestao operacional e financeira do condominio', 1),
(4, 'tecnico', 'Executa e acompanha ordens de trabalho', 1),
(5, 'administrador', 'Responsavel pela administracao da plataforma e backoffice', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `quota`
--

CREATE TABLE `quota` (
  `id_quota` int(11) NOT NULL,
  `fracao_id` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `mes_referencia` date NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `reserva`
--

CREATE TABLE `reserva` (
  `id_reserva` int(11) NOT NULL,
  `utilizador_id` int(11) NOT NULL,
  `espaco_id` int(11) NOT NULL,
  `aprovador_id` int(11) DEFAULT NULL,
  `estado_id` int(11) NOT NULL,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `data_aprovacao` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `utilizador`
--

CREATE TABLE `utilizador` (
  `id_utilizador` int(11) NOT NULL,
  `perfil_id` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telemovel` varchar(20) DEFAULT NULL,
  `nif` varchar(20) DEFAULT NULL,
  `lingua` varchar(5) NOT NULL DEFAULT 'pt',
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `email_verificado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `utilizador`
--

INSERT INTO `utilizador` (`id_utilizador`, `perfil_id`, `nome`, `email`, `password_hash`, `telemovel`, `nif`, `lingua`, `status`, `created_at`, `email_verificado`) VALUES
(1, 5, 'Gustavo Marques', '1211405@isep.ipp.pt', '$2b$12$QeLHDR.2E6M5JWeRQ2GD1.YiIWr9ud62fKtSFveJ2MFlZ1PXDTX1O', '937062814', '257430011', 'pt', 1, '2026-05-21 00:30:23', 0),
(2, 5, 'Guilherme Soares', '1220847@isep.ipp.pt', '$2b$12$QeLHDR.2E6M5JWeRQ2GD1.YiIWr9ud62fKtSFveJ2MFlZ1PXDTX1O', '937212433', NULL, 'pt', 1, '2026-05-21 00:30:23', 0),
(3, 5, 'Rodrigo Fernandes', '1211070@isep.ipp.pt', '$2b$12$QeLHDR.2E6M5JWeRQ2GD1.YiIWr9ud62fIWr9ud62fKtSFveJ2MFlZ1PXDTX1O', '944888710', NULL, 'pt', 1, '2026-05-21 00:30:23', 0),
(4, 2, 'Mariana Sousa', 'marianasousa@gmail.com', '$2b$12$Pr6qtGan1j0q2RFDpuFqMO/6ltLWMz2k7rlsr2XmdrcuA615NcT.O', '931555837', '125444333', 'pt', 1, '2026-05-21 00:45:58', 0),
(5, 3, 'Goncalo Marques', 'gustavooliveiramarques10@gmail.com', '$2b$12$aK0l8FxPc1MVTNz1iTKiEOjRDuaiLUWI1B4AwEJsynRb.uDjRUaoy', '938273222', '333222110', 'pt', 1, '2026-05-21 02:13:58', 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `utilizador_fracao`
--

CREATE TABLE `utilizador_fracao` (
  `id_utilizador_fracao` int(11) NOT NULL,
  `utilizador_id` int(11) NOT NULL,
  `fracao_id` int(11) NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `avaria`
--
ALTER TABLE `avaria`
  ADD PRIMARY KEY (`id_avaria`),
  ADD KEY `idx_avaria_utilizador` (`utilizador_id`),
  ADD KEY `idx_avaria_edificio` (`edificio_id`),
  ADD KEY `idx_avaria_fracao` (`fracao_id`),
  ADD KEY `idx_avaria_categoria` (`categoria_id`);

--
-- Índices para tabela `categoria_avaria`
--
ALTER TABLE `categoria_avaria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Índices para tabela `categoria_despesa`
--
ALTER TABLE `categoria_despesa`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Índices para tabela `despesa`
--
ALTER TABLE `despesa`
  ADD PRIMARY KEY (`id_despesa`),
  ADD KEY `idx_despesa_edificio` (`edificio_id`),
  ADD KEY `idx_despesa_gestor` (`gestor_id`),
  ADD KEY `idx_despesa_fornecedor` (`fornecedor_id`),
  ADD KEY `idx_despesa_categoria` (`categoria_id`);

--
-- Índices para tabela `edificio`
--
ALTER TABLE `edificio`
  ADD PRIMARY KEY (`id_edificio`);

--
-- Índices para tabela `espaco_comum`
--
ALTER TABLE `espaco_comum`
  ADD PRIMARY KEY (`id_espaco`),
  ADD KEY `idx_espaco_edificio` (`edificio_id`);

--
-- Índices para tabela `estado_ordem_trabalho`
--
ALTER TABLE `estado_ordem_trabalho`
  ADD PRIMARY KEY (`id_estado`);

--
-- Índices para tabela `estado_reserva`
--
ALTER TABLE `estado_reserva`
  ADD PRIMARY KEY (`id_estado`);

--
-- Índices para tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  ADD PRIMARY KEY (`id_fornecedor`);

--
-- Índices para tabela `fracao`
--
ALTER TABLE `fracao`
  ADD PRIMARY KEY (`id_fracao`),
  ADD KEY `idx_fracao_edificio` (`edificio_id`);

--
-- Índices para tabela `gestor_edificio`
--
ALTER TABLE `gestor_edificio`
  ADD PRIMARY KEY (`id_gestor_edificio`),
  ADD KEY `idx_ge_gestor` (`gestor_id`),
  ADD KEY `idx_ge_edificio` (`edificio_id`);

--
-- Índices para tabela `log_acesso`
--
ALTER TABLE `log_acesso`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `idx_log_acesso_utilizador` (`utilizador_id`);

--
-- Índices para tabela `notificacao`
--
ALTER TABLE `notificacao`
  ADD PRIMARY KEY (`id_notificacao`),
  ADD KEY `idx_notificacao_utilizador` (`utilizador_id`);

--
-- Índices para tabela `ordem_trabalho`
--
ALTER TABLE `ordem_trabalho`
  ADD PRIMARY KEY (`id_ordem`),
  ADD KEY `idx_ot_avaria` (`avaria_id`),
  ADD KEY `idx_ot_tecnico` (`tecnico_id`),
  ADD KEY `idx_ot_gestor` (`gestor_id`),
  ADD KEY `idx_ot_fornecedor` (`fornecedor_id`),
  ADD KEY `idx_ot_estado` (`estado_id`);

--
-- Índices para tabela `pagamento`
--
ALTER TABLE `pagamento`
  ADD PRIMARY KEY (`id_pagamento`),
  ADD KEY `idx_pagamento_quota` (`quota_id`),
  ADD KEY `idx_pagamento_utilizador` (`utilizador_id`);

--
-- Índices para tabela `perfil`
--
ALTER TABLE `perfil`
  ADD PRIMARY KEY (`id_perfil`);

--
-- Índices para tabela `quota`
--
ALTER TABLE `quota`
  ADD PRIMARY KEY (`id_quota`),
  ADD KEY `idx_quota_fracao` (`fracao_id`);

--
-- Índices para tabela `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `idx_reserva_utilizador` (`utilizador_id`),
  ADD KEY `idx_reserva_espaco` (`espaco_id`),
  ADD KEY `idx_reserva_aprovador` (`aprovador_id`),
  ADD KEY `idx_reserva_estado` (`estado_id`);

--
-- Índices para tabela `utilizador`
--
ALTER TABLE `utilizador`
  ADD PRIMARY KEY (`id_utilizador`),
  ADD UNIQUE KEY `uq_utilizador_email` (`email`),
  ADD KEY `idx_utilizador_perfil` (`perfil_id`);

--
-- Índices para tabela `utilizador_fracao`
--
ALTER TABLE `utilizador_fracao`
  ADD PRIMARY KEY (`id_utilizador_fracao`),
  ADD KEY `idx_uf_utilizador` (`utilizador_id`),
  ADD KEY `idx_uf_fracao` (`fracao_id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `avaria`
--
ALTER TABLE `avaria`
  MODIFY `id_avaria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `categoria_avaria`
--
ALTER TABLE `categoria_avaria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `categoria_despesa`
--
ALTER TABLE `categoria_despesa`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `despesa`
--
ALTER TABLE `despesa`
  MODIFY `id_despesa` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `edificio`
--
ALTER TABLE `edificio`
  MODIFY `id_edificio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `espaco_comum`
--
ALTER TABLE `espaco_comum`
  MODIFY `id_espaco` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `estado_ordem_trabalho`
--
ALTER TABLE `estado_ordem_trabalho`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `estado_reserva`
--
ALTER TABLE `estado_reserva`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  MODIFY `id_fornecedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `fracao`
--
ALTER TABLE `fracao`
  MODIFY `id_fracao` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `gestor_edificio`
--
ALTER TABLE `gestor_edificio`
  MODIFY `id_gestor_edificio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `log_acesso`
--
ALTER TABLE `log_acesso`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de tabela `notificacao`
--
ALTER TABLE `notificacao`
  MODIFY `id_notificacao` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `ordem_trabalho`
--
ALTER TABLE `ordem_trabalho`
  MODIFY `id_ordem` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pagamento`
--
ALTER TABLE `pagamento`
  MODIFY `id_pagamento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `perfil`
--
ALTER TABLE `perfil`
  MODIFY `id_perfil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `quota`
--
ALTER TABLE `quota`
  MODIFY `id_quota` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `reserva`
--
ALTER TABLE `reserva`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `utilizador`
--
ALTER TABLE `utilizador`
  MODIFY `id_utilizador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `utilizador_fracao`
--
ALTER TABLE `utilizador_fracao`
  MODIFY `id_utilizador_fracao` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `avaria`
--
ALTER TABLE `avaria`
  ADD CONSTRAINT `fk_avaria_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_avaria` (`id_categoria`),
  ADD CONSTRAINT `fk_avaria_edificio` FOREIGN KEY (`edificio_id`) REFERENCES `edificio` (`id_edificio`),
  ADD CONSTRAINT `fk_avaria_fracao` FOREIGN KEY (`fracao_id`) REFERENCES `fracao` (`id_fracao`),
  ADD CONSTRAINT `fk_avaria_utilizador` FOREIGN KEY (`utilizador_id`) REFERENCES `utilizador` (`id_utilizador`);

--
-- Limitadores para a tabela `despesa`
--
ALTER TABLE `despesa`
  ADD CONSTRAINT `fk_despesa_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_despesa` (`id_categoria`),
  ADD CONSTRAINT `fk_despesa_edificio` FOREIGN KEY (`edificio_id`) REFERENCES `edificio` (`id_edificio`),
  ADD CONSTRAINT `fk_despesa_fornecedor` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedor` (`id_fornecedor`),
  ADD CONSTRAINT `fk_despesa_gestor` FOREIGN KEY (`gestor_id`) REFERENCES `utilizador` (`id_utilizador`);

--
-- Limitadores para a tabela `espaco_comum`
--
ALTER TABLE `espaco_comum`
  ADD CONSTRAINT `fk_espaco_comum_edificio` FOREIGN KEY (`edificio_id`) REFERENCES `edificio` (`id_edificio`);

--
-- Limitadores para a tabela `fracao`
--
ALTER TABLE `fracao`
  ADD CONSTRAINT `fk_fracao_edificio` FOREIGN KEY (`edificio_id`) REFERENCES `edificio` (`id_edificio`);

--
-- Limitadores para a tabela `gestor_edificio`
--
ALTER TABLE `gestor_edificio`
  ADD CONSTRAINT `fk_ge_edificio` FOREIGN KEY (`edificio_id`) REFERENCES `edificio` (`id_edificio`),
  ADD CONSTRAINT `fk_ge_gestor` FOREIGN KEY (`gestor_id`) REFERENCES `utilizador` (`id_utilizador`);

--
-- Limitadores para a tabela `log_acesso`
--
ALTER TABLE `log_acesso`
  ADD CONSTRAINT `fk_log_acesso_util` FOREIGN KEY (`utilizador_id`) REFERENCES `utilizador` (`id_utilizador`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `notificacao`
--
ALTER TABLE `notificacao`
  ADD CONSTRAINT `fk_notificacao_utilizador` FOREIGN KEY (`utilizador_id`) REFERENCES `utilizador` (`id_utilizador`);

--
-- Limitadores para a tabela `ordem_trabalho`
--
ALTER TABLE `ordem_trabalho`
  ADD CONSTRAINT `fk_ordem_trabalho_avaria` FOREIGN KEY (`avaria_id`) REFERENCES `avaria` (`id_avaria`),
  ADD CONSTRAINT `fk_ordem_trabalho_estado` FOREIGN KEY (`estado_id`) REFERENCES `estado_ordem_trabalho` (`id_estado`),
  ADD CONSTRAINT `fk_ordem_trabalho_fornecedor` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedor` (`id_fornecedor`),
  ADD CONSTRAINT `fk_ordem_trabalho_gestor` FOREIGN KEY (`gestor_id`) REFERENCES `utilizador` (`id_utilizador`),
  ADD CONSTRAINT `fk_ordem_trabalho_tecnico` FOREIGN KEY (`tecnico_id`) REFERENCES `utilizador` (`id_utilizador`);

--
-- Limitadores para a tabela `pagamento`
--
ALTER TABLE `pagamento`
  ADD CONSTRAINT `fk_pagamento_quota` FOREIGN KEY (`quota_id`) REFERENCES `quota` (`id_quota`),
  ADD CONSTRAINT `fk_pagamento_utilizador` FOREIGN KEY (`utilizador_id`) REFERENCES `utilizador` (`id_utilizador`);

--
-- Limitadores para a tabela `quota`
--
ALTER TABLE `quota`
  ADD CONSTRAINT `fk_quota_fracao` FOREIGN KEY (`fracao_id`) REFERENCES `fracao` (`id_fracao`);

--
-- Limitadores para a tabela `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `fk_reserva_aprovador` FOREIGN KEY (`aprovador_id`) REFERENCES `utilizador` (`id_utilizador`),
  ADD CONSTRAINT `fk_reserva_espaco` FOREIGN KEY (`espaco_id`) REFERENCES `espaco_comum` (`id_espaco`),
  ADD CONSTRAINT `fk_reserva_estado` FOREIGN KEY (`estado_id`) REFERENCES `estado_reserva` (`id_estado`),
  ADD CONSTRAINT `fk_reserva_utilizador` FOREIGN KEY (`utilizador_id`) REFERENCES `utilizador` (`id_utilizador`);

--
-- Limitadores para a tabela `utilizador`
--
ALTER TABLE `utilizador`
  ADD CONSTRAINT `fk_utilizador_perfil` FOREIGN KEY (`perfil_id`) REFERENCES `perfil` (`id_perfil`);

--
-- Limitadores para a tabela `utilizador_fracao`
--
ALTER TABLE `utilizador_fracao`
  ADD CONSTRAINT `fk_utilizador_fracao_fracao` FOREIGN KEY (`fracao_id`) REFERENCES `fracao` (`id_fracao`),
  ADD CONSTRAINT `fk_utilizador_fracao_utilizador` FOREIGN KEY (`utilizador_id`) REFERENCES `utilizador` (`id_utilizador`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
