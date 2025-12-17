-- DADOS DE TESTE PARA O SISTEMA
-- Execute este SQL no Supabase para ter dados prontos para testar

-- IMPORTANTE: Primeiro crie 3 usuários no Supabase Authentication:
-- 1. admin@exemplo.com (Admin - seu tio)
-- 2. funcionario@exemplo.com (Funcionário)
-- 3. cliente@exemplo.com (Cliente)
-- Todos com senha: 123456

-- Depois pegue os IDs dos usuários criados e substitua abaixo
-- Você encontra os IDs em Authentication > Users no Supabase

-- ============================================
-- INSERIR PROJETOS (4 OBRAS)
-- ============================================

INSERT INTO projects (name, address, status, description, budget, spent, progress_percentage, start_date, expected_end_date, client_id)
VALUES
(
  'Casa Moderna - Vila Nova',
  'Rua das Flores, 123 - Vila Nova',
  'in_progress',
  'Construção de casa moderna com 3 quartos, piscina e área gourmet',
  150000,
  87000,
  65,
  '2024-01-15',
  '2024-06-30',
  NULL -- Substitua por ID do cliente se quiser
),
(
  'Edifício Comercial Centro',
  'Avenida Central, 456 - Centro',
  'in_progress',
  'Reforma completa de edifício comercial de 4 andares',
  320000,
  198000,
  58,
  '2023-11-01',
  '2024-05-15',
  NULL
),
(
  'Apartamento Luxo',
  'Rua do Sol, 789 - Bairro Nobre',
  'in_progress',
  'Renovação completa de apartamento de alto padrão',
  95000,
  43000,
  45,
  '2024-02-01',
  '2024-04-30',
  NULL
),
(
  'Galpão Industrial',
  'Zona Industrial, Lote 12',
  'planning',
  'Construção de galpão industrial com 2000m²',
  580000,
  15000,
  8,
  '2024-03-01',
  '2024-12-31',
  NULL
);

-- ============================================
-- INSERIR TAREFAS DE EXEMPLO
-- ============================================

-- Pegue o ID do primeiro projeto e use nas tarefas abaixo
-- SELECT id FROM projects WHERE name = 'Casa Moderna - Vila Nova';

INSERT INTO tasks (project_id, title, description, status, priority, due_date)
SELECT
  p.id,
  'Finalizar instalação elétrica',
  'Completar toda a instalação elétrica do segundo andar',
  'in_progress',
  'high',
  CURRENT_DATE + INTERVAL '3 days'
FROM projects p WHERE p.name = 'Casa Moderna - Vila Nova';

INSERT INTO tasks (project_id, title, description, status, priority, due_date)
SELECT
  p.id,
  'Pintura externa',
  'Pintar toda a fachada externa com tinta impermeável',
  'review',
  'medium',
  CURRENT_DATE + INTERVAL '5 days'
FROM projects p WHERE p.name = 'Casa Moderna - Vila Nova';

INSERT INTO tasks (project_id, title, description, status, priority, due_date)
SELECT
  p.id,
  'Instalação de portas',
  'Instalar todas as portas internas e externas',
  'pending',
  'medium',
  CURRENT_DATE + INTERVAL '7 days'
FROM projects p WHERE p.name = 'Casa Moderna - Vila Nova';

INSERT INTO tasks (project_id, title, description, status, priority, due_date)
SELECT
  p.id,
  'Piso da sala',
  'Colocar piso de porcelanato na sala de estar',
  'approved',
  'high',
  CURRENT_DATE - INTERVAL '2 days'
FROM projects p WHERE p.name = 'Casa Moderna - Vila Nova';

-- Tarefas para Edifício Comercial
INSERT INTO tasks (project_id, title, description, status, priority, due_date)
SELECT
  p.id,
  'Reforma banheiros 2º andar',
  'Renovação completa dos banheiros',
  'in_progress',
  'high',
  CURRENT_DATE + INTERVAL '4 days'
FROM projects p WHERE p.name = 'Edifício Comercial Centro';

INSERT INTO tasks (project_id, title, description, status, priority, due_date)
SELECT
  p.id,
  'Troca de janelas',
  'Substituir todas as janelas antigas por novas',
  'review',
  'urgent',
  CURRENT_DATE + INTERVAL '2 days'
FROM projects p WHERE p.name = 'Edifício Comercial Centro';

-- ============================================
-- INSERIR PROBLEMAS/ALERTAS
-- ============================================

INSERT INTO issues (project_id, title, description, severity, status, reported_by)
SELECT
  p.id,
  'Vazamento no telhado',
  'Foi detectado um vazamento na área do telhado após a chuva de ontem. Precisa de atenção urgente.',
  'high',
  'open',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
FROM projects p WHERE p.name = 'Casa Moderna - Vila Nova';

INSERT INTO issues (project_id, title, description, severity, status, reported_by)
SELECT
  p.id,
  'Material errado entregue',
  'O fornecedor entregou cerâmica errada. Precisa trocar.',
  'medium',
  'open',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
FROM projects p WHERE p.name = 'Apartamento Luxo';

-- ============================================
-- INSERIR FOTOS DE EXEMPLO (URLs de placeholder)
-- ============================================

INSERT INTO photos (project_id, uploaded_by, photo_url, description, photo_type, is_approved)
SELECT
  p.id,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
  'Progresso da fachada - manhã',
  'progress',
  true
FROM projects p WHERE p.name = 'Casa Moderna - Vila Nova';

INSERT INTO photos (project_id, uploaded_by, photo_url, description, photo_type, is_approved)
SELECT
  p.id,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg',
  'Instalação elétrica concluída',
  'completion',
  true
FROM projects p WHERE p.name = 'Casa Moderna - Vila Nova';

INSERT INTO photos (project_id, uploaded_by, photo_url, description, photo_type, is_approved)
SELECT
  p.id,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg',
  'Vista geral do edifício',
  'progress',
  true
FROM projects p WHERE p.name = 'Edifício Comercial Centro';

-- ============================================
-- INSERIR NOTIFICAÇÕES DE TESTE
-- ============================================

INSERT INTO notifications (user_id, title, message, type)
SELECT
  id,
  'Bem-vindo ao Sistema!',
  'Este é o novo sistema de gestão de obras. Explore todas as funcionalidades!',
  'success'
FROM profiles WHERE role = 'admin';

INSERT INTO notifications (user_id, title, message, type)
SELECT
  id,
  'Tarefa aguardando aprovação',
  'A tarefa "Pintura externa" foi concluída e aguarda sua revisão.',
  'info'
FROM profiles WHERE role = 'admin';

INSERT INTO notifications (user_id, title, message, type)
SELECT
  id,
  'Problema reportado!',
  'Foi reportado um vazamento no telhado da obra Casa Moderna.',
  'alert'
FROM profiles WHERE role = 'admin';

-- ============================================
-- VERIFICAR DADOS INSERIDOS
-- ============================================

-- Ver todos os projetos
SELECT
  name,
  status,
  progress_percentage,
  address
FROM projects;

-- Ver todas as tarefas
SELECT
  t.title,
  t.status,
  p.name as projeto
FROM tasks t
JOIN projects p ON t.project_id = p.id;

-- Ver todos os problemas
SELECT
  i.title,
  i.severity,
  p.name as projeto
FROM issues i
JOIN projects p ON i.project_id = p.id;

-- Ver todas as fotos
SELECT
  ph.description,
  p.name as projeto
FROM photos ph
JOIN projects p ON ph.project_id = p.id;

-- ============================================
-- PRONTO!
-- ============================================
-- Agora você pode fazer login com:
-- Email: admin@exemplo.com
-- Senha: 123456
--
-- E ver todo o sistema funcionando com dados reais!
