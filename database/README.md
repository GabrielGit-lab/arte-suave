# 🗄️ Pasta do Banco de Dados — Arte Suave BJJ

Esta pasta foi criada especialmente para que você possa acessar, gerenciar, visualizar e fazer backup dos dados da aplicação.

---

## 📁 O que você encontra nesta pasta:

- **`artesuave.db`**: O arquivo de banco de dados SQLite principal onde todas as informações estão salvas (alunos, aulas, presenças, graduações, pesagens e tutoriais).
- **`ver_banco.bat`**: Dê um duplo clique neste arquivo para visualizar instantaneamente todas as tabelas e registros direto no terminal.
- **`fazer_backup.bat`**: Dê um duplo clique para gerar um backup completo em JSON de todas as tabelas na pasta `backups/`.
- **`gerenciador.js`**: Script Node.js que conecta ao SQLite e exibe os dados formatados em tabelas.
- **`exportar_backup.js`**: Script de exportação de dados para JSON.

---

## 🖥️ Como abrir o banco de dados visualmente (Modo Gráfico):

O arquivo `artesuave.db` é um banco **SQLite padrão**, totalmente compatível com qualquer software de banco de dados:

1. **DB Browser for SQLite (Recomendado & Gratuito):**
   - Baixe gratuitamente em: [https://sqlitebrowser.org/dl/](https://sqlitebrowser.org/dl/)
   - Abra o programa e clique em **"Abrir Banco de Dados"**.
   - Selecione o arquivo `artesuave.db` desta pasta.
   - Você poderá navegar pelas tabelas, editar dados, executar comandos SQL e exportar para Excel/CSV.

2. **Extensão para o VS Code:**
   - Instale a extensão **SQLite Viewer** (de Florian Klampfer).
   - Basta clicar duas vezes no arquivo `artesuave.db` dentro do VS Code para ver as tabelas como se fossem uma planilha!

3. **DBeaver ou TablePlus:**
   - Crie uma nova conexão do tipo **SQLite**.
   - Aponte o caminho para: `c:\Repositório\Arte suave\database\artesuave.db`.

---

## 📋 Estrutura das Tabelas:

| Tabela | O que armazena |
| :--- | :--- |
| **`users`** | Cadastro de alunos e professores (nome, e-mail, senha criptografada, faixa, graus, telefone, contato de emergência) |
| **`classes`** | Aulas e treinos agendados (título, data, horário, modalidade Gi/No-Gi, instrutor) |
| **`attendances`** | Livro de chamadas com presenças assinadas pelo professor |
| **`graduations`** | Linha do tempo de graduações, graus concedidos e observações do mestre |
| **`physical_records`**| Histórico de pesagens corporais, altura, IMC e envergadura |
| **`tutorials`** | Biblioteca de posições e técnicas de BJJ com vídeos e passos |
| **`tutorial_bookmarks`**| Favoritos e técnicas marcadas como praticadas pelos alunos |
