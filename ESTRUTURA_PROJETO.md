# Estrutura do Projeto

## Visão Geral da Arquitetura

Este é um sistema completo de gestão de obras construído com:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Estilo**: TailwindCSS
- **Ícones**: Lucide React

## Estrutura de Pastas

```
project/
├── src/
│   ├── components/           # Componentes React
│   │   ├── admin/           # Dashboard e componentes do Admin
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   ├── WorkerActivity.tsx
│   │   │   ├── IssuesList.tsx
│   │   │   └── TaskApproval.tsx
│   │   ├── worker/          # Dashboard e componentes do Funcionário
│   │   │   ├── WorkerDashboard.tsx
│   │   │   └── WorkerTasks.tsx
│   │   ├── client/          # Portal do Cliente
│   │   │   └── ClientPortal.tsx
│   │   ├── Header.tsx       # Header com notificações
│   │   └── Login.tsx        # Tela de login
│   ├── contexts/            # Context API do React
│   │   └── AuthContext.tsx  # Gerenciamento de autenticação
│   ├── lib/                 # Bibliotecas e configurações
│   │   └── supabase.ts      # Cliente Supabase
│   ├── types/               # TypeScript types
│   │   └── database.ts      # Tipos do banco de dados
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── supabase/                # Configurações Supabase (se necessário)
├── .env                     # Variáveis de ambiente
├── GUIA_COMPLETO.md        # Guia completo do sistema
├── COMO_USAR.md            # Instruções de uso
├── DADOS_TESTE.sql         # Dados de teste
└── ESTRUTURA_PROJETO.md    # Este arquivo
```

## Componentes Principais

### 1. Autenticação (AuthContext.tsx)

**Responsabilidade:**
- Gerencia estado de autenticação
- Fornece funções de login/logout
- Carrega perfil do usuário
- Sincroniza com Supabase Auth

**Principais funções:**
- `signIn(email, password)` - Login
- `signUp(email, password, fullName, role)` - Criar conta
- `signOut()` - Logout
- Hook `useAuth()` - Acessa contexto

**Estado:**
- `user` - Usuário autenticado (Supabase)
- `profile` - Perfil do usuário (nossa tabela)
- `loading` - Estado de carregamento

### 2. Admin Dashboard (AdminDashboard.tsx)

**Responsabilidade:**
- Dashboard principal do administrador
- Visão geral de todas as obras
- Monitoramento em tempo real

**Componentes filhos:**
- `ProjectList` - Lista de obras ativas
- `WorkerActivity` - Atividade dos funcionários
- `IssuesList` - Problemas urgentes
- `TaskApproval` - Aprovação de tarefas

**Dados exibidos:**
- Obras ativas
- Funcionários trabalhando
- Problemas abertos
- Tarefas pendentes de aprovação
- Progresso do dia

**Atualização:**
- Tempo real via Supabase Realtime
- Polling a cada 30 segundos

### 3. Worker Dashboard (WorkerDashboard.tsx)

**Responsabilidade:**
- Interface do funcionário
- Check-in/check-out
- Gerenciamento de tarefas

**Funcionalidades:**
- Check-in ao chegar
- Ver tarefas atribuídas
- Atualizar status de tarefas
- Upload de fotos
- Check-out ao sair

**Componentes:**
- `CheckInCard` - Card de check-in
- `CheckOutButton` - Botão de check-out
- `WorkerTasks` - Lista de tarefas

### 4. Client Portal (ClientPortal.tsx)

**Responsabilidade:**
- Portal do cliente
- Visualização de progresso
- Transparência total

**Funcionalidades:**
- Ver obras do cliente
- Progresso em tempo real
- Galeria de fotos
- Lista de tarefas concluídas
- Orçamento vs Gasto

**Tabs:**
- Visão Geral - Estatísticas
- Fotos - Galeria
- Tarefas - Lista de tarefas

### 5. Header (Header.tsx)

**Responsabilidade:**
- Barra superior
- Notificações
- Menu de perfil

**Funcionalidades:**
- Sino de notificações com contador
- Lista de notificações não lidas
- Menu de perfil com logout
- Exibe role do usuário

**Realtime:**
- Notificações atualizadas em tempo real
- Contador atualizado automaticamente

### 6. Task Approval (TaskApproval.tsx)

**Responsabilidade:**
- Revisar trabalhos dos funcionários
- Aprovar ou rejeitar tarefas
- Dar notas de qualidade

**Fluxo:**
1. Ver tarefas em revisão
2. Clicar em "Revisar"
3. Ver fotos do trabalho
4. Dar nota 0-10
5. Aprovar ou Recusar
6. Sistema notifica funcionário

**Modal:**
- `TaskReviewModal` - Modal de revisão completa

## Banco de Dados

### Tabelas Principais

#### profiles
```sql
- id (uuid) - FK para auth.users
- full_name (text) - Nome completo
- role (text) - admin, worker, client
- phone (text) - Telefone
- rating (numeric) - Avaliação 0-5
- total_ratings (int) - Total de avaliações
- is_active (boolean) - Ativo/Inativo
```

#### projects
```sql
- id (uuid) - PK
- name (text) - Nome da obra
- client_id (uuid) - FK profiles
- address (text) - Endereço
- status (text) - planning, in_progress, paused, completed
- progress_percentage (int) - 0-100
- budget (numeric) - Orçamento
- spent (numeric) - Gasto
- start_date, expected_end_date (date)
```

#### tasks
```sql
- id (uuid) - PK
- project_id (uuid) - FK projects
- assigned_to (uuid) - FK profiles
- title, description (text)
- status (text) - pending, in_progress, review, approved, rejected
- priority (text) - low, medium, high, urgent
- quality_score (int) - 0-10
- due_date (date)
```

#### check_ins
```sql
- id (uuid) - PK
- worker_id (uuid) - FK profiles
- project_id (uuid) - FK projects
- check_in_time, check_out_time (timestamptz)
- location_lat, location_lng (numeric)
- check_in_photo, check_out_photo (text) - URLs
- notes (text)
```

#### photos
```sql
- id (uuid) - PK
- project_id (uuid) - FK projects
- task_id (uuid) - FK tasks (opcional)
- uploaded_by (uuid) - FK profiles
- photo_url (text) - URL da foto
- photo_type (text) - progress, issue, completion, before, after
- is_approved (boolean)
```

#### issues
```sql
- id (uuid) - PK
- project_id (uuid) - FK projects
- reported_by (uuid) - FK profiles
- title, description (text)
- severity (text) - low, medium, high, critical
- status (text) - open, in_progress, resolved
- photo_urls (text[]) - Array de URLs
```

#### notifications
```sql
- id (uuid) - PK
- user_id (uuid) - FK profiles
- title, message (text)
- type (text) - alert, info, warning, success
- is_read (boolean)
- link (text) - Link relacionado
```

### Row Level Security (RLS)

**Admin:**
- Vê TUDO
- Pode modificar TUDO

**Worker:**
- Vê suas tarefas
- Vê projetos onde tem tarefas
- Pode atualizar suas tarefas
- Pode criar check-ins
- Pode fazer upload de fotos

**Client:**
- Vê seus projetos
- Vê tarefas dos seus projetos
- Vê fotos aprovadas dos seus projetos
- Não pode modificar nada

### Triggers

**create_profile_for_user:**
- Cria automaticamente perfil quando usuário é criado
- Usa dados de `raw_user_meta_data`

**update_updated_at:**
- Atualiza campo `updated_at` automaticamente

## Fluxo de Dados

### Login
```
1. Usuário envia email/senha
2. Supabase Auth valida
3. AuthContext carrega perfil da tabela profiles
4. App renderiza baseado no role
```

### Check-in
```
1. Worker seleciona obra
2. Sistema cria registro em check_ins
3. Admin vê em tempo real no dashboard
4. Worker pode começar tarefas
```

### Aprovação de Tarefa
```
1. Worker marca tarefa como "review"
2. Admin recebe notificação
3. Admin vê fotos e dá nota
4. Admin aprova/rejeita
5. Worker recebe notificação
6. Se aprovado, tarefa vai para "approved"
7. Se rejeitado, volta para "in_progress"
```

### Realtime Updates
```
1. Componente cria subscription Supabase
2. Supabase notifica mudanças via WebSocket
3. Componente recarrega dados
4. UI atualiza automaticamente
```

## Padrões de Código

### Naming
- Componentes: PascalCase (AdminDashboard.tsx)
- Funções: camelCase (loadProjects)
- Constantes: UPPER_SNAKE_CASE (MAX_PHOTOS)
- Tipos: PascalCase (Project, Task)

### Estrutura de Componente
```typescript
// 1. Imports
import { useState } from 'react';
import { supabase } from '../lib/supabase';

// 2. Tipos
interface Props {
  id: string;
}

// 3. Componente
export default function Component({ id }: Props) {
  // 3.1 States
  const [data, setData] = useState([]);

  // 3.2 Effects
  useEffect(() => {
    loadData();
  }, []);

  // 3.3 Handlers
  const loadData = async () => {
    // lógica
  };

  // 3.4 Render
  return <div>...</div>;
}
```

### Query Supabase
```typescript
// Sempre usar try/catch
try {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('field', value);

  if (error) throw error;
  // usar data
} catch (error) {
  console.error('Error:', error);
}
```

### Realtime Subscription
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('channel_name')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_name'
    }, () => {
      loadData(); // recarregar dados
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Melhorias Futuras

### Curto Prazo
1. Paginação em listas longas
2. Filtros e busca
3. Exportar relatórios
4. Upload real de fotos (Supabase Storage)
5. Localização GPS real

### Médio Prazo
1. App mobile (React Native)
2. Notificações push
3. Chat entre admin e workers
4. Gestão de materiais
5. Calendário de obras

### Longo Prazo
1. IA para prever problemas
2. Análise de performance
3. Otimização de rotas
4. Integração com ERPs
5. Dashboard de analytics avançado

## Manutenção

### Atualizar Dependências
```bash
npm update
npm audit fix
```

### Backup Banco de Dados
1. Supabase Dashboard > Database > Backups
2. Ou exportar tabelas manualmente

### Monitoramento
- Supabase Dashboard > Logs
- Browser Console (F12)
- Supabase Analytics

### Performance
- Lazy loading de imagens
- Paginação de listas
- Cache de queries
- Debounce em buscas

## Segurança

### Checklist
- ✅ RLS ativado em todas tabelas
- ✅ Políticas restritivas
- ✅ Validação de entrada
- ✅ HTTPS obrigatório
- ✅ Tokens em variáveis de ambiente
- ✅ Sem dados sensíveis no frontend

### Boas Práticas
- Nunca expor SUPABASE_SERVICE_ROLE_KEY
- Sempre validar dados do usuário
- Usar prepared statements (Supabase já faz)
- Logs de ações importantes
- Rate limiting (Supabase já tem)

## Testes

### Manual
1. Testar login/logout
2. Testar cada role
3. Testar criação de dados
4. Testar atualização em tempo real
5. Testar em diferentes navegadores

### Automatizado (futuro)
- Jest para testes unitários
- Cypress para testes E2E
- Supabase local para testes

## Documentação Adicional

- `GUIA_COMPLETO.md` - Guia do usuário
- `COMO_USAR.md` - Instruções passo a passo
- `DADOS_TESTE.sql` - Dados de exemplo
- Este arquivo - Documentação técnica
