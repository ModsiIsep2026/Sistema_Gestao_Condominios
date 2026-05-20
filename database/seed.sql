INSERT INTO perfil (nome, descricao, status) VALUES
('visitante', 'Acesso a informacao publica do condominio', 1),
('condomino', 'Consulta quotas, faz reservas e reporta avarias', 1),
('gestor', 'Responsavel pela gestao operacional e financeira do condominio', 1),
('tecnico', 'Executa e acompanha ordens de trabalho', 1),
('administrador', 'Responsavel pela administracao da plataforma e backoffice', 1);

INSERT INTO estado_reserva (nome_pt, nome_en) VALUES
('pendente', 'pending'),
('aprovada', 'approved'),
('rejeitada', 'rejected'),
('cancelada', 'cancelled'),
('concluida', 'completed');

INSERT INTO estado_ordem_trabalho (nome_pt, nome_en) VALUES
('aberta', 'open'),
('em curso', 'in progress'),
('em espera', 'on hold'),
('concluida', 'completed'),
('cancelada', 'cancelled');

INSERT INTO categoria_avaria (nome_pt, nome_en) VALUES
('canalizacao', 'plumbing'),
('eletricidade', 'electrical'),
('elevador', 'elevator'),
('limpeza', 'cleaning'),
('seguranca', 'security'),
('outra', 'other');

INSERT INTO categoria_despesa (nome_pt, nome_en) VALUES
('manutencao', 'maintenance'),
('agua', 'water'),
('eletricidade', 'electricity'),
('limpeza', 'cleaning'),
('jardinagem', 'gardening'),
('seguro', 'insurance'),
('outra', 'other');
