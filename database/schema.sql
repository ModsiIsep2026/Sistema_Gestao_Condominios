-- phpMyAdmin SQL Dump
-- version 5.2.2-1.fc41
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 23-Maio-2026 às 08:22
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
-- Base de dados: `1211405_modsigc`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `pw` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `aluguer_espaco`
--

CREATE TABLE `aluguer_espaco` (
  `id` int(11) NOT NULL,
  `id_espaco` int(11) NOT NULL,
  `id_condomino` int(11) NOT NULL,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime NOT NULL,
  `preco_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `aluguer_material`
--

CREATE TABLE `aluguer_material` (
  `id` int(11) NOT NULL,
  `id_material_espaco` int(11) NOT NULL,
  `qtd_alugada` int(11) NOT NULL DEFAULT 1,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime NOT NULL,
  `id_condomino` int(11) NOT NULL,
  `preco_total` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `apartamento`
--

CREATE TABLE `apartamento` (
  `id` int(11) NOT NULL,
  `fracao` varchar(20) NOT NULL,
  `andar` smallint(6) DEFAULT NULL,
  `id_edificio` int(11) NOT NULL,
  `permilagem` decimal(6,2) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `condomino`
--

CREATE TABLE `condomino` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `pw` varchar(255) NOT NULL,
  `telemovel` varchar(150) NOT NULL,
  `id_apartamento` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `contrato`
--

CREATE TABLE `contrato` (
  `id` int(11) NOT NULL,
  `id_licenca` int(11) NOT NULL,
  `id_gestor` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `edificio`
--

CREATE TABLE `edificio` (
  `id` int(11) NOT NULL,
  `rua` varchar(100) NOT NULL,
  `cp` varchar(100) NOT NULL,
  `cidade` varchar(80) DEFAULT NULL,
  `lat` decimal(10,7) NOT NULL,
  `lng` decimal(10,7) NOT NULL,
  `iban` varchar(100) NOT NULL,
  `valor_base_mensal` decimal(10,2) NOT NULL,
  `id_gestor` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `espaco`
--

CREATE TABLE `espaco` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `id_edificio` int(11) NOT NULL,
  `preco_hora` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `gestor`
--

CREATE TABLE `gestor` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `empresa` varchar(100) DEFAULT NULL,
  `telemovel` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `pw` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `licenca`
--

CREATE TABLE `licenca` (
  `id` int(11) NOT NULL,
  `num_edificios` int(11) NOT NULL,
  `ppem` decimal(10,2) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `licenca`
--

INSERT INTO `licenca` (`id`, `num_edificios`, `ppem`, `status`) VALUES
(1, 1, 200.00, 1),
(2, 5, 180.00, 1),
(3, 20, 125.00, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `material_espaco`
--

CREATE TABLE `material_espaco` (
  `id` int(11) NOT NULL,
  `material` varchar(100) NOT NULL,
  `qtd` int(11) NOT NULL DEFAULT 0,
  `preco_unitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `id_espaco` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `pagamento`
--

CREATE TABLE `pagamento` (
  `id` int(11) NOT NULL,
  `id_apartamento` int(11) NOT NULL,
  `mes` char(7) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `data_i` datetime NOT NULL,
  `data_p` datetime DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `parceiro`
--

CREATE TABLE `parceiro` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `servico` varchar(100) DEFAULT NULL,
  `localizacao` varchar(100) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `id_admin` int(11) NOT NULL,
  `site` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `registo_avaria`
--

CREATE TABLE `registo_avaria` (
  `id` int(11) NOT NULL,
  `id_condomino` int(11) NOT NULL,
  `zona` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `data_registo` datetime NOT NULL,
  `id_edificio` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `resolucao_avaria`
--

CREATE TABLE `resolucao_avaria` (
  `id` int(11) NOT NULL,
  `id_registo_avaria` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `data_resolucao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tecnico`
--

CREATE TABLE `tecnico` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `funcao` varchar(50) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `pw` varchar(255) NOT NULL,
  `id_gestor` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_admin_email` (`email`);

--
-- Índices para tabela `aluguer_espaco`
--
ALTER TABLE `aluguer_espaco`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aluguer_espaco_condomino` (`id_condomino`),
  ADD KEY `fk_aluguer_espaco_espaco` (`id_espaco`);

--
-- Índices para tabela `aluguer_material`
--
ALTER TABLE `aluguer_material`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aluguer_material_material_espaco` (`id_material_espaco`),
  ADD KEY `fk_aluguer_material_condomino` (`id_condomino`);

--
-- Índices para tabela `apartamento`
--
ALTER TABLE `apartamento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_apartamento_edificio` (`id_edificio`);

--
-- Índices para tabela `condomino`
--
ALTER TABLE `condomino`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `uq_condomino_telemovel` (`telemovel`),
  ADD KEY `fk_condomino_apartamento` (`id_apartamento`);

--
-- Índices para tabela `contrato`
--
ALTER TABLE `contrato`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_contrato_licenca_gestor` (`id_licenca`,`id_gestor`),
  ADD KEY `fk_contrato_gestor` (`id_gestor`);

--
-- Índices para tabela `edificio`
--
ALTER TABLE `edificio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `iban` (`iban`),
  ADD KEY `fk_edificio_gestor` (`id_gestor`);

--
-- Índices para tabela `espaco`
--
ALTER TABLE `espaco`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_espaco_edificio` (`id_edificio`);

--
-- Índices para tabela `gestor`
--
ALTER TABLE `gestor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `telemovel` (`telemovel`),
  ADD UNIQUE KEY `uq_gestor_email` (`email`);

--
-- Índices para tabela `licenca`
--
ALTER TABLE `licenca`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `material_espaco`
--
ALTER TABLE `material_espaco`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_material_espaco_espaco` (`id_espaco`);

--
-- Índices para tabela `pagamento`
--
ALTER TABLE `pagamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_pagamento` (`id_apartamento`,`mes`);

--
-- Índices para tabela `parceiro`
--
ALTER TABLE `parceiro`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_parceiro_admin` (`id_admin`);

--
-- Índices para tabela `registo_avaria`
--
ALTER TABLE `registo_avaria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_registo_avaria_condomino` (`id_condomino`),
  ADD KEY `fk_registo_avaria_edificio` (`id_edificio`);

--
-- Índices para tabela `resolucao_avaria`
--
ALTER TABLE `resolucao_avaria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resolucao_avaria_registo` (`id_registo_avaria`),
  ADD KEY `fk_resolucao_avaria_tecnico` (`id_tecnico`);

--
-- Índices para tabela `tecnico`
--
ALTER TABLE `tecnico`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tecnico_email` (`email`),
  ADD KEY `fk_tecnico_gestor` (`id_gestor`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `aluguer_espaco`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `aluguer_material`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `apartamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `condomino`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `contrato`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `edificio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `espaco`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `gestor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `licenca`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `material_espaco`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `pagamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `parceiro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `registo_avaria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `resolucao_avaria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tecnico`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

ALTER TABLE `aluguer_espaco`
  ADD CONSTRAINT `fk_aluguer_espaco_condomino` FOREIGN KEY (`id_condomino`) REFERENCES `condomino` (`id`),
  ADD CONSTRAINT `fk_aluguer_espaco_espaco` FOREIGN KEY (`id_espaco`) REFERENCES `espaco` (`id`);

ALTER TABLE `aluguer_material`
  ADD CONSTRAINT `fk_aluguer_material_condomino` FOREIGN KEY (`id_condomino`) REFERENCES `condomino` (`id`),
  ADD CONSTRAINT `fk_aluguer_material_material_espaco` FOREIGN KEY (`id_material_espaco`) REFERENCES `material_espaco` (`id`);

ALTER TABLE `apartamento`
  ADD CONSTRAINT `fk_apartamento_edificio` FOREIGN KEY (`id_edificio`) REFERENCES `edificio` (`id`) ON UPDATE CASCADE;

ALTER TABLE `condomino`
  ADD CONSTRAINT `fk_condomino_apartamento` FOREIGN KEY (`id_apartamento`) REFERENCES `apartamento` (`id`);

ALTER TABLE `contrato`
  ADD CONSTRAINT `fk_contrato_gestor` FOREIGN KEY (`id_gestor`) REFERENCES `gestor` (`id`),
  ADD CONSTRAINT `fk_contrato_licenca` FOREIGN KEY (`id_licenca`) REFERENCES `licenca` (`id`);

ALTER TABLE `edificio`
  ADD CONSTRAINT `fk_edificio_gestor` FOREIGN KEY (`id_gestor`) REFERENCES `gestor` (`id`);

ALTER TABLE `espaco`
  ADD CONSTRAINT `fk_espaco_edificio` FOREIGN KEY (`id_edificio`) REFERENCES `edificio` (`id`) ON UPDATE CASCADE;

ALTER TABLE `material_espaco`
  ADD CONSTRAINT `fk_material_espaco_espaco` FOREIGN KEY (`id_espaco`) REFERENCES `espaco` (`id`);

ALTER TABLE `pagamento`
  ADD CONSTRAINT `fk_pagamento_apartamento` FOREIGN KEY (`id_apartamento`) REFERENCES `apartamento` (`id`);

ALTER TABLE `parceiro`
  ADD CONSTRAINT `fk_parceiro_admin` FOREIGN KEY (`id_admin`) REFERENCES `admin` (`id`);

ALTER TABLE `registo_avaria`
  ADD CONSTRAINT `fk_registo_avaria_condomino` FOREIGN KEY (`id_condomino`) REFERENCES `condomino` (`id`),
  ADD CONSTRAINT `fk_registo_avaria_edificio` FOREIGN KEY (`id_edificio`) REFERENCES `edificio` (`id`);

ALTER TABLE `resolucao_avaria`
  ADD CONSTRAINT `fk_resolucao_avaria_registo` FOREIGN KEY (`id_registo_avaria`) REFERENCES `registo_avaria` (`id`),
  ADD CONSTRAINT `fk_resolucao_avaria_tecnico` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnico` (`id`);

ALTER TABLE `tecnico`
  ADD CONSTRAINT `fk_tecnico_gestor` FOREIGN KEY (`id_gestor`) REFERENCES `gestor` (`id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
