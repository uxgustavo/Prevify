# Guia de Integração Supabase - Exclusivo do Desenvolvedor

Este guia é de uso exclusivo do desenvolvedor para configurar o banco de dados centralizado no Supabase. O aplicativo sincronizará automaticamente todas as contas, transações e configurações de forma unificada no seu banco de dados, sem que os usuários finais tenham visibilidade ou controle sobre essa conexão.

---

## 🚀 Passo 1: Configurar Variáveis de Ambiente (Secrets)

No painel de controle do **AI Studio**, acesse o menu **Settings** (Configurações) e adicione as seguintes chaves de segredo (Secrets):

| Nome do Segredo | Descrição | Exemplo de Valor |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | URL de API do seu projeto Supabase | `https://xyzabc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (anon/public) do projeto | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## 🗄️ Passo 2: Executar Script SQL no Supabase

Conecte-se ao console do [Supabase](https://supabase.com), abra o **SQL Editor** do seu projeto, clique em **New query** (Nova Consulta), cole o script a seguir e clique em **Run** (Executar):

```sql
-- 1. Tabela de Usuários do Aplicativo (Sincronização Centralizada)
CREATE TABLE IF NOT EXISTS public.app_users (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Tags Customizadas
CREATE TABLE IF NOT EXISTS public.custom_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES public.app_users(email) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_tag UNIQUE (user_email, name)
);

-- 3. Tabela de Transações dos 5 Pilares
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES public.app_users(email) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ENTRADA', 'SAIDA', 'DIARIO', 'CARTAO', 'ECONOMIA')),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}', -- Coleção de marcadores
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Saldos Correntes dos Usuários
CREATE TABLE IF NOT EXISTS public.user_balances (
  user_email TEXT PRIMARY KEY REFERENCES public.app_users(email) ON DELETE CASCADE,
  balance NUMERIC DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Desativar ou Flexibilizar RLS para chamadas diretas através do Cliente Anon
-- Como os dados são segregados logicamente por e-mail pelo aplicativo e o controle é do desenvolvedor,
-- pode-se habilitar políticas de livre leitura/gravação baseadas na chave anônima ou simplesmente
-- desabilitar o RLS se desejar acesso simplificado.
ALTER TABLE public.app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances DISABLE ROW LEVEL SECURITY;
```

---

## ⚙️ Como Funciona a Sincronização

1. **Transparência Absoluta:** O usuário final não vê botões de banco nem configurações.
2. **Dupla Persistência (Offline-First):** Toda alteração (Adicionar, Editar, Deletar Transações, Tags, Perfil, Cadastro) é salva instantaneamente no `LocalStorage` local de forma segura e, caso a chave do Supabase esteja configurada nas Secrets do desenvolvedor, o app envia em segundo plano estas atualizações para o banco de dados na nuvem.
3. **Resiliência:** Se a internet falhar ou as credenciais não estiverem configuradas, o app continua funcionando em modo Local sem emitir erros intrusivos na tela.
