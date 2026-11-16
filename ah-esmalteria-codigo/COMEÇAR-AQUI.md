# Comece por aqui — agenda online da Ah! Esmalteria

Esta versão precisa de internet e de um projeto Supabase conectado. Não cria reservas locais: sem conexão/configuração, não confirma agendamentos. Os agendamentos antigos salvos somente no aparelho não são enviados automaticamente.

## 1. Criar sua conta e o projeto

Acesse https://supabase.com/dashboard e crie sua conta. Escolha New project, dê o nome Ah Esmalteria, crie uma senha para o banco e guarde-a. Escolha uma região próxima do salão. Confira as condições do plano na tela antes de confirmar; não é necessário contratar um plano pago para preparar o projeto.

## 2. Preparar a agenda

No projeto, abra SQL Editor e crie uma consulta. Abra o arquivo supabase/schema.sql desta pasta, copie todo o conteúdo para o editor e clique Run. Execute uma única vez em um projeto novo.

Esse arquivo cria a agenda, as regras de acesso e a confirmação de horários. Clientes autenticadas leem somente as próprias reservas; a manicure autorizada lê todas. Outras clientes consultam apenas os horários ocupados, sem nomes ou telefones. Valores, duração, expediente e conflitos são verificados no servidor.

## 3. Conectar o aplicativo

Na área Connect / API Keys do projeto, copie Project URL e a chave pública publishable (ou a chave pública anon de projetos antigos). Na pasta do aplicativo, faça uma cópia de .env.example com o nome .env e substitua os dois valores:

    EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA-CHAVE-PUBLICA

Use apenas a chave pública. Chaves secret ou service_role e a senha do banco não devem entrar no aplicativo nem ser enviadas pelo chat.

## 4. Abrir no celular

Abra o terminal dentro da pasta que contém package.json. Execute um por vez:

    npm install
    npx expo install --fix
    npx expo start --clear

Abra no Expo Go compatível com a versão do projeto ou em um emulador. O projeto usa Expo SDK 58; se o Expo Go indicar incompatibilidade, envie a mensagem exata para ajustar a versão.

Crie sua conta na tela do aplicativo. Se o Supabase solicitar confirmação por e-mail, confirme o cadastro e volte ao app para entrar com a senha. Não é necessário entrar automaticamente pelo link de confirmação. O envio de e-mails em produção pode exigir configurar um provedor SMTP no Supabase, conforme os limites e orientações mostrados no painel.

## 5. Liberar o acesso da manicure

A manicure cria a própria conta no aplicativo e confirma o e-mail. Depois, a responsável pelo projeto executa no SQL Editor a consulta abaixo, substituindo o e-mail pelo e-mail real da manicure:

    insert into public.salon_admins(user_id)
    select id from auth.users where lower(email)=lower('EMAIL-DA-MANICURE')
    on conflict do nothing;

A consulta deve inserir uma linha. Se não inserir, confira se a conta foi criada com esse e-mail. A manicure sai e entra no aplicativo novamente. Em Agenda, ela verá “Agenda da manicure” e todas as reservas. Pode cancelar agendamentos; as clientes podem cancelar somente os próprios. O acesso especial depende da tabela protegida, não de um botão ou senha fixa no app.

Para remover o acesso, a responsável executa:

    delete from public.salon_admins
    where user_id in (select id from auth.users where lower(email)=lower('EMAIL-DA-MANICURE'));

## 6. Conferir antes de usar com clientes reais

Use duas contas de teste em dois aparelhos ou sessões. Salve nome e telefone, agende em uma conta, confira na conta da manicure e tente reservar o mesmo horário na outra conta. A segunda reserva deve ser recusada. Confira que uma cliente não vê o nome/telefone de outra, que o cancelamento libera o horário, e que domingo e segunda ficam bloqueados. As telas atualizam a cada 30 segundos, ao trocar de aba e ao voltar para o app. A confirmação usa o servidor imediatamente, mesmo antes da próxima atualização da tela.

Mão: 30 minutos; pé: 30 minutos; pé e mão: 60 minutos. Os demais itens são adicionais sem tempo extra. Uma reserva exige um dos três serviços principais. Atendimento inicial de terça a sábado, 9h às 18h, em America/Sao_Paulo. Para mudar expediente, altere tanto App.js quanto as regras em supabase/schema.sql, aplicando a alteração no servidor. A agenda é de uma profissional.

## Verificações desta entrega

Sintaxe JavaScript/JSX verificada. A conexão com um Supabase real e o fluxo em celulares dependem da criação e configuração do projeto e ainda precisam ser validados. Esta entrega não é um APK nem uma publicação em loja. Recuperação de senha pode ser feita pelo painel Supabase enquanto o fluxo de recuperação dentro do app não estiver implementado.

Referências oficiais:
- https://supabase.com/docs/guides/auth/quickstarts/react-native
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://docs.expo.dev/guides/using-supabase/

Também passaram 9 verificações de disponibilidade: domingo e segunda bloqueados, fim do expediente, conflito e limite entre reservas, ausência de conexão e serviço sem duração. A instalação de novas dependências não foi concluída nesta sessão; execute npm install conforme instruído.

