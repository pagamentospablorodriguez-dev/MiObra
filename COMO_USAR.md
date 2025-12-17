# Como Usar o Sistema - Passo a Passo

## INÍCIO RÁPIDO (5 minutos)

### Passo 1: Criar Usuário Admin no Supabase

1. Abra o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Authentication** > **Users**
3. Clique em **Add User** > **Create new user**
4. Preencha:
   - Email: `admin@teste.com` (ou o email do seu tio)
   - Password: `senha123` (ou qualquer senha)
   - ✅ Marque **Auto Confirm User**
5. Clique em **Create user**

### Passo 2: Fazer Login no Sistema

1. Abra o sistema
2. Use o email e senha que você criou
3. Pronto! Você está logado como Admin

### Passo 3: Adicionar Dados de Teste (Opcional)

Se quiser ver o sistema funcionando com dados de exemplo:

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `DADOS_TESTE.sql` deste projeto
3. Copie e cole o conteúdo no SQL Editor
4. Clique em **Run**
5. Atualize o sistema - agora terá 4 obras, tarefas, fotos, etc.

## USO DIÁRIO

### Como Admin (Seu Tio)

#### Manhã - Verificação Rápida (2 minutos)
1. Abra o sistema
2. Veja no Dashboard:
   - Quantos funcionários fizeram check-in
   - Quais obras têm problemas
   - Tarefas aguardando aprovação

#### Durante o Dia - Aprovar Trabalhos (5-10 minutos)
1. Vá em **"Aguardando Aprovação"**
2. Clique em **"Revisar"** na tarefa
3. Veja as fotos do trabalho
4. Dê uma nota de 0-10
5. Clique em **"Aprovar"** ou **"Recusar"**
6. Se recusar, escreva o que precisa corrigir

#### Resolver Problemas (conforme necessário)
1. Veja **"Problemas Urgentes"**
2. Leia a descrição
3. Tome ação necessária
4. Clique em **"Marcar como Resolvido"**

#### Monitorar Obras
1. Role a página até **"Obras Ativas"**
2. Veja progresso de cada uma
3. Clique em uma obra para ver detalhes
4. Veja gastos vs orçamento
5. Veja quem está trabalhando

### Como Funcionário

#### Ao Chegar na Obra
1. Abra o sistema
2. Clique em **"Fazer Check-In"**
3. Selecione a obra
4. Clique em **"Iniciar Trabalho"**

#### Durante o Trabalho
1. Veja suas **"Tarefas"**
2. Clique em uma tarefa
3. Clique em **"Iniciar Tarefa"**
4. Trabalhe normalmente
5. Tire fotos do trabalho
6. Clique em **"Adicionar Foto"** e envie

#### Ao Concluir Tarefa
1. Abra a tarefa
2. Certifique-se de ter enviado fotos
3. Clique em **"Enviar para Revisão"**
4. Aguarde aprovação do admin

#### Ao Sair da Obra
1. Clique em **"Encerrar"** (botão no topo)
2. Escreva observações do dia (opcional)
3. Clique em **"Confirmar"**

### Como Cliente

#### Ver Progresso da Obra
1. Faça login
2. Veja sua obra na lista
3. Clique nela

#### Ver Detalhes
1. Clique em **"Visão Geral"** - vê estatísticas
2. Clique em **"Fotos"** - vê todas as fotos
3. Clique em **"Tarefas"** - vê o que foi feito

## CRIAR NOVOS USUÁRIOS

### Adicionar Funcionário

1. No Supabase, vá em **Authentication** > **Users**
2. Clique em **Add User**
3. Preencha:
   - Email do funcionário
   - Senha temporária
   - ✅ Auto Confirm User
4. Clique em **Create**
5. Vá em **Table Editor** > **profiles**
6. Encontre o usuário criado
7. Edite o campo **role** para `worker`
8. Salve

### Adicionar Cliente

Mesmo processo acima, mas:
- No passo 7, coloque **role** = `client`
- Depois, na tabela **projects**, associe o projeto ao cliente:
  - Edite o projeto
  - No campo **client_id**, coloque o ID do cliente
  - Salve

## CRIAR NOVA OBRA

1. No Supabase, vá em **Table Editor** > **projects**
2. Clique em **Insert** > **Insert row**
3. Preencha:
   - **name**: Nome da obra
   - **address**: Endereço
   - **status**: `in_progress`
   - **budget**: Orçamento (número)
   - **progress_percentage**: 0
   - Outros campos conforme necessário
4. Clique em **Save**

## CRIAR TAREFAS

1. Vá em **Table Editor** > **tasks**
2. Clique em **Insert row**
3. Preencha:
   - **project_id**: ID da obra (copie da tabela projects)
   - **title**: Título da tarefa
   - **description**: Descrição
   - **assigned_to**: ID do funcionário (copie da tabela profiles)
   - **status**: `pending`
   - **priority**: `medium` (ou low, high, urgent)
   - **due_date**: Prazo (formato: 2024-12-31)
4. Salve

## SOLUÇÃO DE PROBLEMAS

### Não consigo fazer login
- Verifique se o usuário foi criado no Supabase
- Verifique se marcou "Auto Confirm User"
- Tente resetar a senha

### Não vejo nenhuma obra
- Verifique se criou projetos na tabela `projects`
- Verifique o role do usuário:
  - Admin vê todas
  - Worker vê só as que tem tarefas
  - Client vê só as dele

### Funcionário não vê suas tarefas
- Verifique se o campo `assigned_to` da tarefa tem o ID correto do funcionário
- Verifique se o status da tarefa não é `completed`

### Fotos não aparecem
- As fotos de teste usam URLs de placeholder
- Para fotos reais, você precisaria configurar Supabase Storage
- Por enquanto, o sistema aceita URLs de qualquer imagem online

## PRÓXIMAS MELHORIAS SUGERIDAS

Quando quiser expandir o sistema:

1. **Upload Real de Fotos**
   - Configurar Supabase Storage
   - Permitir upload direto da câmera

2. **Relatórios PDF**
   - Gerar relatórios semanais/mensais
   - Exportar dados para Excel

3. **App Mobile**
   - Versão mobile nativa
   - Notificações push

4. **Localização GPS**
   - Verificar se funcionário realmente está na obra
   - Tracking de rota

5. **Gestão de Materiais**
   - Controle de estoque
   - Pedidos de materiais

6. **Timesheet Automático**
   - Cálculo de horas automaticamente
   - Relatório de pagamento

## SUPORTE

Para dúvidas ou problemas:
1. Leia o arquivo `GUIA_COMPLETO.md`
2. Verifique a tabela no Supabase
3. Veja o console do navegador (F12) para erros

## IMPORTANTE

**BACKUP DOS DADOS:**
- O Supabase faz backup automático
- Mas é bom exportar dados importantes periodicamente
- Vá em cada tabela e clique em **Download as CSV**

**SEGURANÇA:**
- Use senhas fortes
- Não compartilhe credenciais
- Mude senhas temporárias de funcionários

**PERFORMANCE:**
- O sistema atualiza em tempo real
- Se ficar lento, recarregue a página
- Limpe notificações antigas periodicamente
