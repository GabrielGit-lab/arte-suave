# 🥋 Arte Suave — Plataforma de Gestão e Treinamento de Jiu-Jitsu Brasileiro

Uma aplicação web completa e moderna voltada para o universo do Jiu-Jitsu Brasileiro (BJJ), projetada para atender perfeitamente tanto o **Professor/Mestre** quanto o **Aluno**.

---

## 🚀 Como Iniciar a Aplicação

### 1. Iniciar o Servidor (Backend + Frontend)
Na raiz do projeto (`c:\Repositório\Arte suave`), execute:

```bash
npm start
```
Ou:
```bash
node server/server.js
```

O sistema estará disponível em:
👉 **http://localhost:5000**

---

## 🌍 Acesso Público Online (Internet)

O sistema foi publicado com conexão segura HTTPS para acesso externo (celulares, tablets, computadores fora da rede local):

👉 **Link Direto (Sem senha):**
**https://property-wendy-mass-kid.trycloudflare.com**

*(Para reabrir o túnel público online a qualquer momento, basta rodar: `npm run online`)*.

---

## 🔑 Contas de Demonstração (Acesso com 1 Clique)

Você pode acessar instantaneamente com as contas pré-configuradas ou alternar entre elas no topo do sistema:

| Perfil | E-mail | Senha | Função / Detalhes |
| :--- | :--- | :--- | :--- |
| **🥋 Mestre Carlos (Professor)** | `professor@artesuave.com` | `senha123` | Faixa Preta 3º Grau (Acesso administrativo completo) |
| **🥋 Gabriel Rocha (Aluno)** | `aluno@artesuave.com` | `senha123` | Faixa Branca 3º Grau, 77.8kg (Perto da Faixa Azul) |
| **🥋 Mariana Costa (Aluna)** | `mariana@artesuave.com` | `senha123` | Faixa Azul 2º Grau, Peso Pena |

*(Também é possível cadastrar novos professores e novos alunos através do formulário de cadastro ou na tela de alunos).*

---

## 🌟 Funcionalidades Implementadas

### 1. 📚 Tutoriais de Posições (Vídeo, Imagem e Passo a Passo)
- **Biblioteca completa com técnicas fundamentais e avançadas**: Armlock da Guarda Fechada, Triângulo, Raspagem Tesourinha, Passagem Toreando, Kimura, Guarda De La Riva, Saída dos 100kg, Mata-Leão e muito mais.
- **Player de Vídeo incorporado** (YouTube / MP4) e fotos ilustrativas de alta qualidade.
- **Passo a Passo detalhado e numerado** com descrições biomecânicas.
- **Dicas de Ouro & Alavanca** (segredos de pegadas e pressão dos mestres).
- **Contra-ataques e Defesas** de cada posição.
- **Filtros avançados**: por categoria (Guardas, Passagens, Finalizações, Raspagens, Quedas, Defesas), dificuldade (Iniciante, Intermediário, Avançado), kimono (Gi / No-Gi).
- **Marcadores do Aluno**: salvar como *Favorito ⭐*, marcar como *Já Pratiquei no Tatame 🥋* ou *Quero Dominar 🎯*.
- **Criação de Novas Posições**: Professores podem cadastrar novas técnicas com passos dinâmicos.

### 2. 📝 Controle de Presença e Chamada Oficial
- **Agendamento de Aulas**: criação de treinos com data, horário, tipo (Gi, No-Gi, Fundamentos, Avançado, Open Mat) e tatame.
- **Lista de Chamada Interativa**: o professor visualiza todos os alunos cadastrados com foto, faixa e graus.
- **Assinatura Digital da Chamada**: marcação individual ou em lote (*"Presentes Todos"*) com registro do mestre responsável e data/hora.
- **Alimentação Automática da Graduação**: cada presença assinada soma horas/aulas necessárias para o próximo grau ou faixa.
- **Histórico do Aluno**: o aluno pode consultar todas as aulas em que esteve presente.

### 3. 👤 Cadastro e Dossiê Completo dos Alunos
- Perfis com foto, nome, e-mail, telefone, data de nascimento/idade, data de matrícula e contato de emergência.
- Histórico completo de treinos assistidos.
- Linha do tempo de graduações e pesagens.
- Busca instantânea e filtros por faixa.
- Matrícula de novos alunos diretamente pelo painel do professor.

### 4. 🎓 Gestão de Graduação (Regulamento CBJJ / IBJJF)
- Registro da faixa atual e número de graus (0 a 4 graus para faixas coloridas; até 6 para preta).
- **Cálculo Inteligente de Elegibilidade**:
  - Requisitos de assiduidade mínimos por faixa e grau baseados na CBJJ (ex: 30-35 aulas por grau de branca, 60 por grau de azul).
  - Alerta visual no painel: *"Aluno Elegível para Graduação ⭐"*.
- **Cerimônia de Promoção Oficial**:
  - Modal para o professor conceder nova faixa ou grau com anotação e data.
  - Efeito comemorativo de confete (`canvas-confetti`) na promoção!
  - Histórico imutável de graduações com nome do mestre conferente.

### 5. ⚖️ Dados Físicos e Acompanhamento Biométrico
- Registro de **peso corporal (kg)**, **altura (cm)**, **envergadura (cm)** e **% de gordura**.
- **Cálculo Automático de IMC** com classificação (Saudável, Sobrepeso, etc.).
- **Calculadora Automática de Categorias de Peso CBJJ / IBJJF**:
  - Enquadra o atleta na sua categoria oficial (Galo, Pluma, Pena, Leve, Médio, Meio-Pesado, Pesado, Super Pesado, Pesadíssimo).
- Tabela de referência com limites de peso para campeonatos com kimono.
- Histórico cronológico de pesagens com comparativo de evolução desde a primeira pesagem.

### 6. 📊 Relatórios e Estatísticas da Academia
- Gráfico de tendência de frequência nas últimas aulas.
- Gráfico de distribuição de faixas (percentual de brancas, azuis, roxas, marrons e pretas).
- **Hall da Fama / Ranking de Assiduidade**: troféus 🥇🥈🥉 para os atletas mais dedicados e disciplinados do mês.
- Relatório de alunos prontos para exame de faixa.

### 7. 🔒 Segurança, Perfis e Autenticação
- Autenticação com senhas criptografadas via **bcryptjs** e tokens **JWT**.
- Controle de acesso baseado em cargos (**Professor** vs **Aluno**).
- Banco de dados embutido **SQLite** (`node:sqlite`) de alto desempenho e zero dependências externas.
- Design responsivo tatame dark aesthetic, com renderização gráfica realista das faixas de BJJ e graus.

### 8. 📜 Manual de Regras da CBJJ Atualizado (2026)
- **Tabela Oficial de Pontuações (4, 3, 2 pontos)** e regra mandatória dos 3 segundos de estabilização.
- **Matriz de Golpes Permitidos e Proibidos por Faixa**: regras detalhadas para *Armlock, Triângulo, Botinha (Chave de Pé Reta), Kneebar, Toe Hold, Calf/Biceps Slicers, Heel Hook no No-Gi, Proibição de Bate-Estaca (Slam)* e *Knee Reaping*.
- **Escala de Faltas e Punições**: da 1ª advertência verbal até a 4ª punição (desclassificação), além de faltas gravíssimas com eliminação sumária.
- **Tempos Oficiais de Luta por Faixa**: Branca (5 min), Azul (6 min), Roxa (7 min), Marrom (8 min), Preta (10 min) e Masters (5 min).
- **Normas de Kimono e Uniforme No-Gi**: medidas oficiais (Kimonometer), folgas de manga, cores autorizadas e regras de rashguards.
- **Buscador Dinâmico de Regras**: pesquisa instantânea para tirar dúvidas rápidas sobre qualquer golpe ou penalidade.

### 9. 🏆 Sistema de Chaveamento de Torneios & Brackets
- **Categorias Absoluto (Open Class) e por Peso**: crie torneios sem limite de peso ou com divisões tradicionais (Galo até Pesadíssimo).
- **Modalidades Gi e No-Gi**: torneios com kimono ou submission grappling sem kimono.
- **Categorias Mistas e por Faixa**: suporte a categorias abertas/mistas (todas as faixas), faixas agrupadas ou divisões exclusivas (Branca, Azul, Roxa, Marrom & Preta).
- **Gerador Automático de Chaves (Single Elimination)**: sorteio automático de confrontos (Quartas, Semifinais e Finais).
- **Súmula e Lançamento de Placar ao Vivo**: registro de Pontos, Vantagens, Punições e tipo de vitória (*Armlock, Triângulo, Pontos, Decisão, DQ*).
- **Avanço Automático do Vencedor**: o atleta vencedor progride automaticamente na chave até a Grande Final.
- **Pódio & Premiação**: celebração de confete e exibição do Campeão (1º Lugar 🥇).

---

Oss! 🥋
