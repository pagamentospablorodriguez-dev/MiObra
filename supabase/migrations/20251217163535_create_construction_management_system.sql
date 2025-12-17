/*
  # Sistema Completo de Gestão de Obras

  ## Visão Geral
  Sistema para resolver TODOS os problemas de gestão de construção:
  - Monitoramento remoto de múltiplas obras
  - Controle de funcionários e presença
  - Qualidade e aprovação de trabalhos
  - Comunicação com clientes
  - Alertas e notificações

  ## Novas Tabelas

  ### 1. `profiles`
  Perfis de usuários (funcionários, admin, clientes)
  - `id` (uuid, FK para auth.users)
  - `full_name` (text) - Nome completo
  - `role` (text) - Tipo: admin, worker, client
  - `phone` (text) - Telefone
  - `avatar_url` (text) - Foto do perfil
  - `rating` (numeric) - Avaliação do funcionário (0-5)
  - `total_ratings` (int) - Total de avaliações recebidas
  - `is_active` (boolean) - Ativo ou não
  - `created_at` (timestamptz)

  ### 2. `projects`
  Obras/Projetos de construção
  - `id` (uuid, PK)
  - `name` (text) - Nome da obra
  - `client_id` (uuid, FK) - Cliente responsável
  - `address` (text) - Endereço da obra
  - `description` (text) - Descrição detalhada
  - `status` (text) - Status: planning, in_progress, paused, completed
  - `start_date` (date) - Data de início
  - `expected_end_date` (date) - Previsão de término
  - `budget` (numeric) - Orçamento total
  - `spent` (numeric) - Gasto até agora
  - `progress_percentage` (int) - Progresso 0-100
  - `project_documents` (text[]) - URLs dos documentos do projeto
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `tasks`
  Tarefas específicas em cada obra
  - `id` (uuid, PK)
  - `project_id` (uuid, FK)
  - `title` (text) - Título da tarefa
  - `description` (text) - Descrição detalhada
  - `assigned_to` (uuid, FK) - Funcionário responsável
  - `status` (text) - Status: pending, in_progress, review, approved, rejected
  - `priority` (text) - Prioridade: low, medium, high, urgent
  - `due_date` (date) - Prazo
  - `quality_score` (int) - Nota de qualidade (0-10)
  - `review_notes` (text) - Notas da revisão
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 4. `check_ins`
  Registro de presença dos funcionários nas obras
  - `id` (uuid, PK)
  - `worker_id` (uuid, FK)
  - `project_id` (uuid, FK)
  - `check_in_time` (timestamptz) - Hora de entrada
  - `check_out_time` (timestamptz) - Hora de saída
  - `location_lat` (numeric) - Latitude
  - `location_lng` (numeric) - Longitude
  - `check_in_photo` (text) - Foto ao chegar
  - `check_out_photo` (text) - Foto ao sair
  - `notes` (text) - Observações do dia
  - `created_at` (timestamptz)

  ### 5. `photos`
  Fotos de progresso e evidências de trabalho
  - `id` (uuid, PK)
  - `project_id` (uuid, FK)
  - `task_id` (uuid, FK, nullable)
  - `uploaded_by` (uuid, FK)
  - `photo_url` (text) - URL da foto
  - `description` (text) - Descrição da foto
  - `photo_type` (text) - Tipo: progress, issue, completion, before, after
  - `is_approved` (boolean) - Aprovada pelo admin
  - `created_at` (timestamptz)

  ### 6. `issues`
  Problemas e alertas nas obras
  - `id` (uuid, PK)
  - `project_id` (uuid, FK)
  - `reported_by` (uuid, FK)
  - `title` (text) - Título do problema
  - `description` (text) - Descrição detalhada
  - `severity` (text) - Gravidade: low, medium, high, critical
  - `status` (text) - Status: open, in_progress, resolved
  - `photo_urls` (text[]) - Fotos do problema
  - `resolved_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 7. `comments`
  Comentários em tarefas e projetos
  - `id` (uuid, PK)
  - `project_id` (uuid, FK, nullable)
  - `task_id` (uuid, FK, nullable)
  - `user_id` (uuid, FK)
  - `comment` (text) - Comentário
  - `created_at` (timestamptz)

  ### 8. `notifications`
  Notificações e alertas
  - `id` (uuid, PK)
  - `user_id` (uuid, FK)
  - `title` (text) - Título da notificação
  - `message` (text) - Mensagem
  - `type` (text) - Tipo: alert, info, warning, success
  - `is_read` (boolean) - Lida ou não
  - `link` (text) - Link relacionado
  - `created_at` (timestamptz)

  ## Segurança
  - RLS ativado em todas as tabelas
  - Admin tem acesso total
  - Funcionários veem apenas suas tarefas e obras atribuídas
  - Clientes veem apenas seus projetos
*/

-- Criar enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'worker', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'paused', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'review', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'worker',
  phone text,
  avatar_url text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_ratings int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  address text NOT NULL,
  description text,
  status text DEFAULT 'planning',
  start_date date,
  expected_end_date date,
  budget numeric DEFAULT 0,
  spent numeric DEFAULT 0,
  progress_percentage int DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  project_documents text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  due_date date,
  quality_score int CHECK (quality_score >= 0 AND quality_score <= 10),
  review_notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tabela de check-ins
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  check_in_time timestamptz DEFAULT now(),
  check_out_time timestamptz,
  location_lat numeric,
  location_lng numeric,
  check_in_photo text,
  check_out_photo text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Tabela de fotos
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  photo_url text NOT NULL,
  description text,
  photo_type text DEFAULT 'progress',
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Tabela de problemas
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  title text NOT NULL,
  description text,
  severity text DEFAULT 'medium',
  status text DEFAULT 'open',
  photo_urls text[],
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS - PROFILES
-- =============================================

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- POLÍTICAS RLS - PROJECTS
-- =============================================

CREATE POLICY "Admin can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can view their projects"
  ON projects FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Workers can view assigned projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.project_id = projects.id
      AND tasks.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Admin can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- POLÍTICAS RLS - TASKS
-- =============================================

CREATE POLICY "Admin can view all tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Workers can view assigned tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Clients can view tasks in their projects"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.client_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Workers can update their tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- =============================================
-- POLÍTICAS RLS - CHECK_INS
-- =============================================

CREATE POLICY "Admin can view all check-ins"
  ON check_ins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Workers can view own check-ins"
  ON check_ins FOR SELECT
  TO authenticated
  USING (worker_id = auth.uid());

CREATE POLICY "Workers can create check-ins"
  ON check_ins FOR INSERT
  TO authenticated
  WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Workers can update own check-ins"
  ON check_ins FOR UPDATE
  TO authenticated
  USING (worker_id = auth.uid())
  WITH CHECK (worker_id = auth.uid());

-- =============================================
-- POLÍTICAS RLS - PHOTOS
-- =============================================

CREATE POLICY "Admin can view all photos"
  ON photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view photos from accessible projects"
  ON photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = photos.project_id
      AND (
        projects.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM tasks
          WHERE tasks.project_id = projects.id
          AND tasks.assigned_to = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Workers can upload photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admin can manage photos"
  ON photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- POLÍTICAS RLS - ISSUES
-- =============================================

CREATE POLICY "Admin can view all issues"
  ON issues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view issues from accessible projects"
  ON issues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = issues.project_id
      AND (
        projects.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM tasks
          WHERE tasks.project_id = projects.id
          AND tasks.assigned_to = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Authenticated users can report issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Admin can manage issues"
  ON issues FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- POLÍTICAS RLS - COMMENTS
-- =============================================

CREATE POLICY "Users can view comments from accessible projects/tasks"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = comments.project_id
      AND (
        projects.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM tasks
          WHERE tasks.project_id = projects.id
          AND tasks.assigned_to = auth.uid()
        )
      )
    ))
    OR
    (task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = comments.task_id
      AND tasks.assigned_to = auth.uid()
    ))
  );

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- POLÍTICAS RLS - NOTIFICATIONS
-- =============================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para projetos
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();