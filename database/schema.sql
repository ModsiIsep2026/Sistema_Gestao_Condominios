-- Esquema SQL da base de dados para registo no MariaDB do AVE

CREATE TABLE perfil
(
    id_perfil INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    status INT NOT NULL DEFAULT 1
);

CREATE TABLE utilizador
(
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    perfil_id INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telemovel VARCHAR(20),
    nif VARCHAR(20),
    lingua VARCHAR(5) NOT NULL DEFAULT 'pt',
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_utilizador_perfil
        FOREIGN KEY (perfil_id) REFERENCES perfil(id_perfil)
);

CREATE TABLE fornecedor
(
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    nif VARCHAR(20),
    servico VARCHAR(100),
    status INT NOT NULL DEFAULT 1
);

CREATE TABLE log_acesso
(
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT NOT NULL,
    acao VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL,
    CONSTRAINT fk_log_acesso_utilizador
        FOREIGN KEY (utilizador_id) REFERENCES utilizador(id_utilizador)
);

CREATE TABLE edificio
(
    id_edificio INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    morada VARCHAR(255) NOT NULL,
    codigo_postal VARCHAR(10),
    cidade VARCHAR(100),
    status INT NOT NULL DEFAULT 1
);

CREATE TABLE fracao
(
    id_fracao INT AUTO_INCREMENT PRIMARY KEY,
    edificio_id INT NOT NULL,
    codigo_fracao VARCHAR(20) NOT NULL,
    andar VARCHAR(10),
    area_m2 DECIMAL(8,2),
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_fracao_edificio
        FOREIGN KEY (edificio_id) REFERENCES edificio(id_edificio)
);

CREATE TABLE utilizador_fracao
(
    id_utilizador_fracao INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT NOT NULL,
    fracao_id INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_utilizador_fracao_utilizador
        FOREIGN KEY (utilizador_id) REFERENCES utilizador(id_utilizador),
    CONSTRAINT fk_utilizador_fracao_fracao
        FOREIGN KEY (fracao_id) REFERENCES fracao(id_fracao)
);

CREATE TABLE quota
(
    id_quota INT AUTO_INCREMENT PRIMARY KEY,
    fracao_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    mes_referencia DATE NOT NULL,
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_quota_fracao
        FOREIGN KEY (fracao_id) REFERENCES fracao(id_fracao)
);

CREATE TABLE pagamento
(
    id_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    quota_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL,
    data_pagamento DATE NOT NULL,
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_pagamento_quota
        FOREIGN KEY (quota_id) REFERENCES quota(id_quota),
    CONSTRAINT fk_pagamento_utilizador
        FOREIGN KEY (utilizador_id) REFERENCES utilizador(id_utilizador)
);

CREATE TABLE espaco_comum
(
    id_espaco INT AUTO_INCREMENT PRIMARY KEY,
    edificio_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    capacidade INT,
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_espaco_comum_edificio
        FOREIGN KEY (edificio_id) REFERENCES edificio(id_edificio)
);

CREATE TABLE estado_reserva
(
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nome_pt VARCHAR(50) NOT NULL,
    nome_en VARCHAR(50) NOT NULL
);

CREATE TABLE reserva
(
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT NOT NULL,
    espaco_id INT NOT NULL,
    aprovador_id INT,
    estado_id INT NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_reserva_utilizador
        FOREIGN KEY (utilizador_id) REFERENCES utilizador(id_utilizador),
    CONSTRAINT fk_reserva_espaco
        FOREIGN KEY (espaco_id) REFERENCES espaco_comum(id_espaco),
    CONSTRAINT fk_reserva_aprovador
        FOREIGN KEY (aprovador_id) REFERENCES utilizador(id_utilizador),
    CONSTRAINT fk_reserva_estado
        FOREIGN KEY (estado_id) REFERENCES estado_reserva(id_estado)
);

CREATE TABLE categoria_avaria
(
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_pt VARCHAR(50) NOT NULL,
    nome_en VARCHAR(50) NOT NULL
);

CREATE TABLE avaria
(
    id_avaria INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT NOT NULL,
    edificio_id INT NOT NULL,
    fracao_id INT,
    categoria_id INT NOT NULL,
    descricao TEXT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_avaria_utilizador
        FOREIGN KEY (utilizador_id) REFERENCES utilizador(id_utilizador),
    CONSTRAINT fk_avaria_edificio
        FOREIGN KEY (edificio_id) REFERENCES edificio(id_edificio),
    CONSTRAINT fk_avaria_fracao
        FOREIGN KEY (fracao_id) REFERENCES fracao(id_fracao),
    CONSTRAINT fk_avaria_categoria
        FOREIGN KEY (categoria_id) REFERENCES categoria_avaria(id_categoria)
);

CREATE TABLE estado_ordem_trabalho
(
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nome_pt VARCHAR(50) NOT NULL,
    nome_en VARCHAR(50) NOT NULL
);

CREATE TABLE ordem_trabalho
(
    id_ordem INT AUTO_INCREMENT PRIMARY KEY,
    avaria_id INT NOT NULL,
    tecnico_id INT,
    gestor_id INT NOT NULL,
    fornecedor_id INT,
    estado_id INT NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME,
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_ordem_trabalho_avaria
        FOREIGN KEY (avaria_id) REFERENCES avaria(id_avaria),
    CONSTRAINT fk_ordem_trabalho_tecnico
        FOREIGN KEY (tecnico_id) REFERENCES utilizador(id_utilizador),
    CONSTRAINT fk_ordem_trabalho_gestor
        FOREIGN KEY (gestor_id) REFERENCES utilizador(id_utilizador),
    CONSTRAINT fk_ordem_trabalho_fornecedor
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id_fornecedor),
    CONSTRAINT fk_ordem_trabalho_estado
        FOREIGN KEY (estado_id) REFERENCES estado_ordem_trabalho(id_estado)
);

CREATE TABLE categoria_despesa
(
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_pt VARCHAR(50) NOT NULL,
    nome_en VARCHAR(50) NOT NULL
);

CREATE TABLE despesa
(
    id_despesa INT AUTO_INCREMENT PRIMARY KEY,
    edificio_id INT NOT NULL,
    gestor_id INT NOT NULL,
    fornecedor_id INT,
    categoria_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_despesa DATE NOT NULL,
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_despesa_edificio
        FOREIGN KEY (edificio_id) REFERENCES edificio(id_edificio),
    CONSTRAINT fk_despesa_gestor
        FOREIGN KEY (gestor_id) REFERENCES utilizador(id_utilizador),
    CONSTRAINT fk_despesa_fornecedor
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id_fornecedor),
    CONSTRAINT fk_despesa_categoria
        FOREIGN KEY (categoria_id) REFERENCES categoria_despesa(id_categoria)
);

CREATE TABLE notificacao
(
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    lida INT NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_notificacao_utilizador
        FOREIGN KEY (utilizador_id) REFERENCES utilizador(id_utilizador)
);
