import React, { useState } from 'react';
import { 
  GitFork, 
  Crown, 
  Award, 
  ShieldAlert, 
  ChevronRight, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Search,
  ExternalLink,
  Users
} from 'lucide-react';
import BeltBadge from '../components/BeltBadge';

// Comprehensive BJJ Lineage dataset
const LINEAGE_DATA = [
  {
    era: 'Origens no Japão & Chegada ao Brasil (Século XIX - Início Século XX)',
    patriarch: {
      name: 'Jigoro Kano',
      dates: '1860 – 1938',
      role: 'Fundador do Kodokan Judo (Kano Jiu-Jitsu)',
      origin: 'Japão',
      belt: 'Mestre Fundador',
      description: 'Sistematizou as antigas técnicas do Jujutsu tradicional japonês em uma arte voltada à eficiência mecânica, alavanca e combate real (Judo Kodokan).'
    },
    emissaries: [
      {
        name: 'Mitsuyo Maeda ("Conde Koma")',
        dates: '1878 – 1941',
        role: 'O Emissário e Lenda dos Desafios',
        origin: 'Japão / Belém do Pará (Brasil)',
        belt: 'Mestre 7º Dan Kodokan',
        description: 'Mestre do Kodokan que viajou pelo mundo em desafios sem regras (Vale-Tudo). Chegou a Belém do Pará em 1914 e ensinou a arte marcial a Carlos Gracie e Luiz França.',
        quote: '"A técnica supera a força; o chão anula a vantagem de tamanho."'
      },
      {
        name: 'Soishiro Satake',
        dates: '1877 – 1956',
        role: 'Companheiro de Maeda e Pioneiro em Manaus',
        origin: 'Japão / Manaus (Brasil)',
        belt: 'Pioneiro do Judo/Jujutsu no Amazonas',
        description: 'Companheiro de Maeda nas turnês internacionais de luta livre, fundou a primeira academia oficial na Amazônia brasileira.'
      }
    ]
  },
  {
    era: 'Os Pilares Fundadores do Jiu-Jitsu Brasileiro',
    lineages: [
      {
        id: 'gracie',
        title: 'Linhagem Gracie (Carlos & Helio Gracie)',
        badge: 'Linhagem Primária',
        badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/40',
        pioneers: [
          {
            name: 'Carlos Gracie Sr.',
            dates: '1902 – 1994',
            title: 'O Patriarca e Visionário',
            belt: 'Faixa Vermelha 10º Grau',
            degrees: 10,
            bio: 'Primeiro aluno de Mitsuyo Maeda em 1917. Abriu a lendária Academia Gracie na Rua Marquês de Abrantes no Rio de Janeiro em 1925, estabeleceu o "Desafio Gracie" e desenvolveu a Dieta Gracie.',
            notableStudents: ['Helio Gracie', 'Carlson Gracie', 'Rolls Gracie', 'Carlos Gracie Jr.', 'Reyson Gracie']
          },
          {
            name: 'Helio Gracie',
            dates: '1913 – 2009',
            title: 'O Criador Técnico e Símbolo do BJJ',
            belt: 'Faixa Vermelha 10º Grau',
            degrees: 10,
            bio: 'Irmão mais novo de Carlos. Devido ao biotipo frágil, adaptou as alavancas do Jiu-Jitsu para permitir que uma pessoa menor e mais fraca vencesse oponentes muito maiores e mais fortes. Enfrentou lendas como Masahiko Kimura e Waldemar Santana.',
            notableStudents: ['Rickson Gracie', 'Royce Gracie', 'Rorion Gracie', 'Royler Gracie', 'Pedro Valente']
          },
          {
            name: 'George & Oswaldo Gracie',
            dates: 'Irmãos Fundadores',
            title: 'Lutadores Temidos do Vale-Tudo',
            belt: 'Faixas Vermelhas',
            degrees: 9,
            bio: 'George foi um dos lutadores mais ativos da família, defendendo a bandeira da arte em centenas de combates nos anos 1930 a 1950.'
          }
        ]
      },
      {
        id: 'fadda',
        title: 'Linhagem Fadda (Luiz França & Oswaldo Fadda)',
        badge: 'O Jiu-Jitsu do Povo e Chaves de Perna',
        badgeColor: 'border-red-600/40 text-red-300 bg-red-950/40',
        pioneers: [
          {
            name: 'Luiz França Filho',
            dates: 'Pioneiro Contemporâneo',
            title: 'Aluno Direto de Mitsuyo Maeda',
            belt: 'Mestre Fundador',
            bio: 'Aprendeu Jiu-Jitsu diretamente com Conde Koma em Belém e abriu sua própria academia no subúrbio carioca, formando grandes mestres.',
            notableStudents: ['Oswaldo Fadda']
          },
          {
            name: 'Mestre Oswaldo Fadda',
            dates: '1921 – 2005',
            title: 'Mestre dos Subúrbios e Chaves de Pé',
            belt: 'Faixa Vermelha 9º Grau',
            degrees: 9,
            bio: 'Levou o Jiu-Jitsu para as classes populares da Zona Norte e subúrbio do Rio de Janeiro. Notabilizou-se pelo pioneirismo e maestria em chaves de perna e pé (leg locks), vencendo o histórico confronto de academias contra a Gracie em 1951.',
            notableStudents: ['Deo Germano', 'Wilson Mattos', 'Sebastião Ricardo', 'Luiz Paulo']
          }
        ]
      }
    ]
  },
  {
    era: 'A Era de Ouro e os Grandes Mestres Formadores',
    branches: [
      {
        master: 'Carlson Gracie',
        dates: '1935 – 2006',
        belt: 'Faixa Vermelha 9º Grau',
        legacy: 'O Campeão do Vale-Tudo e Revolução Moderna',
        desc: 'Filho mais velho de Carlos Gracie, vingou a derrota de Helio contra Waldemar Santana. Criou uma das maiores equipes competitivas da história, enfatizando agressividade, guarda pesada e preparação física.',
        iconicStudents: [
          'Murilo Bustamante (BTT)',
          'Zé Mario Sperry (BTT)',
          'Ricardo Libório (ATT)',
          'Vitor Belfort',
          'Amaury Bitetti',
          'Wallid Ismail',
          'Pederneiras (Nova União - via Carlson lineage)',
          'Cassio Cardoso'
        ]
      },
      {
        master: 'Rolls Gracie',
        dates: '1951 – 1982',
        belt: 'Faixa Vermelha e Preta',
        legacy: 'O Maior Visionário Técnico do BJJ',
        desc: 'Considerado o maior fenômeno de sua era. Incorporou técnicas de Wrestling olímpico, Sambo russo e Judo internacional, revolucionando a guarda aberta, raspagens e triângulos modernos.',
        iconicStudents: [
          'Carlos Gracie Jr. (Gracie Barra)',
          'Rickson Gracie',
          'Romero "Jacaré" Cavalcanti (Alliance)',
          'Mauricio Motta Gomes (Pai de Roger Gracie)',
          'Marcio "Macarrão" Stambowsky',
          'Nicin Azulay'
        ]
      },
      {
        master: 'Rickson Gracie',
        dates: '1958 – Presente',
        belt: 'Faixa Vermelha 9º Grau',
        legacy: 'O Samurai Invencível (400-0) e Jiu-Jitsu Invisível',
        desc: 'Considerado o maior lutador e expoente técnico da família Gracie. Campeão invicto de Vale-Tudo no Japão (Pride e Vale Tudo Japan), mestre do controle respiratório e da pressão conectiva.',
        iconicStudents: [
          'Kron Gracie',
          'Pedro Sauer',
          'Henry Akins',
          'Luiz Claudio'
        ]
      },
      {
        master: 'Francisco Mansor & Reyson Gracie',
        dates: 'Grandes Mestres 9º Grau',
        belt: 'Faixa Vermelha',
        legacy: 'Estruturação Pedagógica e Expansão',
        desc: 'Mestre Mansor foi um dos mais prolíficos alunos de Helio Gracie, concedendo faixas pretas a dezenas de grandes professores no Brasil e EUA.'
      }
    ]
  },
  {
    era: 'As Grandes Equipes Mundiais Contemporâneas',
    teams: [
      {
        name: 'Gracie Barra',
        foundedBy: 'Carlos Gracie Jr. (1986)',
        lineage: 'Maeda ➔ Carlos Gracie Sr. ➔ Rolls / Carlos Jr.',
        motto: '"Organizados como um exército, unidos como uma família"',
        stars: ['Marcio Feitosa', 'Nino Schembri', 'Braulio Estima', 'Romulo Barral', 'Flávio Canto', 'Kaynan Duarte']
      },
      {
        name: 'Alliance Jiu-Jitsu',
        foundedBy: 'Romero "Jacaré" Cavalcanti & Fabio Gurgel (1993)',
        lineage: 'Maeda ➔ Carlos Gracie Sr. ➔ Rolls Gracie ➔ Jacaré Cavalcanti',
        motto: 'Maior vencedora de Mundiais por equipes (14x campeã mundial)',
        stars: ['Marcelo Garcia', 'Cobrinha (Rubens Charles)', 'Fabio Gurgel', 'Michael Langhi', 'Bernardo Faria', 'Nicholas Meregali']
      },
      {
        name: 'Nova União',
        foundedBy: 'André Pederneiras & Wendell Alexander (1995)',
        lineage: 'Fusão das linhagens Carlson Gracie (Dedé) + Oswaldo Fadda (Wendell)',
        motto: 'Mestres do peso leve e reis das chaves de perna e MMA',
        stars: ['José Aldo', 'Renan Barão', 'Robson Moura (5x campeão mundial)', 'Vitor Ribeiro "Shaolin"', 'Marlon Sandro']
      },
      {
        name: 'Checkmat / Brasa',
        foundedBy: 'Leo Vieira & Ricardo Vieira (2008)',
        lineage: 'Rolls Gracie ➔ Jacaré ➔ Roberto Traven / Vieira Bros',
        motto: 'Criatividade, raspagens acrobáticas e guardas modernas',
        stars: ['Leo Vieira (Leozinho)', 'Marcus "Buchecha" Almeida', 'Lucas Leite', 'Michelle Nicolini', 'Gabriel Arges']
      },
      {
        name: 'Atos Jiu-Jitsu',
        foundedBy: 'André Galvão & Ramon Lemos (2008)',
        lineage: 'Carlson Gracie ➔ Ricardo De La Riva / Tererê ➔ Galvão',
        motto: 'Pioneiros da guarda 50/50, Berimbolo e força competitiva',
        stars: ['André Galvão', 'Keenan Cornelius', 'Lucas "Hulk" Barbosa', 'Tye Ruotolo', 'Kade Ruotolo', 'Kaynan Duarte']
      },
      {
        name: 'GFTeam (Grappling Fight Team)',
        foundedBy: 'Julio Cesar Pereira (UGF / 1996)',
        lineage: 'Mitsuyo Maeda ➔ Luiz França ➔ Oswaldo Fadda ➔ Monir Salomão ➔ Julio Cesar',
        motto: 'Força bruta suburbana, passadores de guarda de elite',
        stars: ['Rodolfo Vieira', 'Patrick Gaudio', 'Jaime Canuto', 'Gutemberg Pereira', 'Victor Honorio']
      }
    ]
  }
];

export default function LineageBJJ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPioneer, setSelectedPioneer] = useState(null);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-zinc-950 to-neutral-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-red-950/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-700/50">
                Tradição & Ancestralidade
              </span>
              <span className="text-amber-400/80 text-xs font-semibold">• Código Samurai ao Tatame Moderno</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-400" />
              Árvore Genealógica do Jiu-Jitsu
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Conheça a linha de sucessão e os grandes mestres que forjaram a Arte Suave: desde o Japão feudal de Jigoro Kano e Conde Koma, até as matrizes <strong>Gracie</strong> e <strong>Fadda</strong> e as equipes mundiais do século XXI.
            </p>
          </div>

          <div className="bg-black/90 p-4 rounded-xl border border-amber-500/30 flex flex-col items-center min-w-[200px] shadow-lg">
            <span className="text-[10px] text-amber-400/90 uppercase tracking-widest font-black mb-1">
              Origem Reconhecida
            </span>
            <div className="text-2xl font-black text-white flex items-center gap-2">
              <span>🇯🇵</span>
              <span className="text-amber-400">➔</span>
              <span>🇧🇷</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-semibold mt-1">
              Japão 1882 ➔ Belém 1914
            </span>
          </div>
        </div>
      </div>

      {/* Visual Lineage Timeline Flow */}
      <div className="bg-black/80 rounded-2xl border border-amber-500/20 p-5 sm:p-7 shadow-xl">
        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5 mb-6 pb-3 border-b border-zinc-800">
          <GitFork className="w-5 h-5 text-amber-400" />
          Tronco Principal de Sucessão Histórica
        </h3>

        {/* Tree Diagram Flow */}
        <div className="relative">
          {/* Central Vertical connecting golden line */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-[2px] bg-gradient-to-b from-amber-500/60 via-red-600/40 to-amber-500/60 transform -translate-x-1/2" />

          {/* Step 1: Kano */}
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="max-w-md w-full bg-gradient-to-b from-zinc-900 to-black p-4 rounded-2xl border-2 border-amber-500/50 shadow-xl text-center">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-zinc-800 text-amber-300 border border-amber-500/30">
                1860 - 1938 • Tóquio, Japão
              </span>
              <h4 className="text-lg font-black text-white mt-1">Jigoro Kano</h4>
              <p className="text-[11px] text-amber-400 font-bold">Fundador do Kodokan Judo (Kano Jiu-Jitsu)</p>
              <p className="text-xs text-zinc-400 mt-2">
                Reuniu as técnicas do Kito-ryu e Tenshin Shinyo-ryu em um sistema focado na máxima eficiência com o mínimo esforço (*Seiryoku Zenyo*).
              </p>
            </div>
            <div className="w-[2px] h-8 bg-amber-500/70" />
          </div>

          {/* Step 2: Maeda */}
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="max-w-md w-full bg-gradient-to-b from-zinc-900 to-black p-4 rounded-2xl border-2 border-red-600/50 shadow-xl text-center">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-700/50">
                1878 - 1941 • O Emissário Global
              </span>
              <h4 className="text-lg font-black text-white mt-1">Mitsuyo Maeda ("Conde Koma")</h4>
              <p className="text-[11px] text-red-400 font-bold">Mestre do Kodokan e Campeão de Desafios</p>
              <p className="text-xs text-zinc-400 mt-2">
                Viajou as Américas e Europa disputando desafios de luta real. Estabeleceu-se em Belém do Pará em 1914 e transmitiu a arte marcial no Brasil.
              </p>
            </div>
            <div className="w-[2px] h-8 bg-amber-500/70" />
          </div>

          {/* Step 3: Split Gracie & Fadda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Gracie Branch */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-amber-500/60 shadow-2xl relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-950 text-amber-300 border border-amber-500/40">
                  Linhagem Gracie
                </span>
                <span className="text-[10px] text-zinc-400">Rio de Janeiro • 1925</span>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30">
                  <h5 className="text-sm font-black text-amber-300">Carlos Gracie Sr. (1902–1994)</h5>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Primeiro aluno de Maeda em 1917. Pioneiro do Desafio Gracie, patriarca e estrategista da família.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30">
                  <h5 className="text-sm font-black text-amber-300">Helio Gracie (1913–2009)</h5>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Ajustou as alavancas corporais e base de guarda para superar adversários muito maiores sem depender de força física.
                  </p>
                </div>

                {/* Sub-lineages */}
                <div className="p-3 rounded-xl bg-black/90 border border-zinc-800 text-xs space-y-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
                    Principais Ramos de Sucessão:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                      <strong className="text-white block">Carlson Gracie</strong>
                      <span className="text-zinc-400 text-[10px]">Origem da BTT, ATT e Nova União</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                      <strong className="text-white block">Rolls Gracie</strong>
                      <span className="text-zinc-400 text-[10px]">Origem da Alliance & Gracie Barra</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                      <strong className="text-white block">Carlos Gracie Jr.</strong>
                      <span className="text-zinc-400 text-[10px]">Fundador da Gracie Barra & IBJJF</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                      <strong className="text-white block">Rickson Gracie</strong>
                      <span className="text-zinc-400 text-[10px]">Lenda do Vale-Tudo e Jiu-Jitsu Invisível</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fadda Branch */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-red-700/60 shadow-2xl relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-700/50">
                  Linhagem Fadda
                </span>
                <span className="text-[10px] text-zinc-400">Subúrbio Carioca • 1937</span>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-black/60 border border-red-700/30">
                  <h5 className="text-sm font-black text-red-300">Luiz França Filho</h5>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Aluno direto de Conde Koma em Belém. Trouxe os ensinamentos para os subúrbios do Rio e formou Oswaldo Fadda.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-red-700/30">
                  <h5 className="text-sm font-black text-red-300">Oswaldo Fadda (1921–2005)</h5>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Faixa Vermelha 9º Grau. Democratizou o Jiu-Jitsu para as classes populares e dominou as finalizações de chaves de perna e pé.
                  </p>
                </div>

                {/* Sub-lineages */}
                <div className="p-3 rounded-xl bg-black/90 border border-zinc-800 text-xs space-y-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
                    Principais Ramos de Sucessão:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                      <strong className="text-white block">Wendell Alexander</strong>
                      <span className="text-zinc-400 text-[10px]">Cofundador da Nova União com Dedé</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                      <strong className="text-white block">Mestre Deo Germano</strong>
                      <span className="text-zinc-400 text-[10px]">Pilar histórico e preservador técnico</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                      <strong className="text-white block">GFTeam (Julio Cesar)</strong>
                      <span className="text-zinc-400 text-[10px]">Via Mestre Monir Salomão ➔ GFTeam</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                      <strong className="text-white block">Leg Locks Modernos</strong>
                      <span className="text-zinc-400 text-[10px]">Origem da cultura de ataques aos pés</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hall of Masters (Os Grandes Mestres Formadores) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Galeria dos Mestres e Ícones da Arte Suave
            </h3>
            <p className="text-xs text-zinc-400">
              Personalidades que revolucionaram o esporte competitivo e o combate real.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Rolls Gracie',
              era: '1951 – 1982',
              title: 'O Maior Inovador Técnico',
              belt: 'Coral (Vermelha e Preta)',
              quote: 'Incorporou o Wrestling, Sambo e Judo às raspagens e triângulos.',
              tag: 'Inovação Moderna',
              lineage: 'Carlos Gracie ➔ Rolls'
            },
            {
              name: 'Carlson Gracie',
              era: '1935 – 2006',
              title: 'O Campeão dos Desafios',
              belt: 'Vermelha 9º Grau',
              quote: 'Criou a equipe mais temida do Vale-Tudo e lapidou a passagem de guarda pesada.',
              tag: 'Vale-Tudo & Pressão',
              lineage: 'Carlos Gracie ➔ Carlson'
            },
            {
              name: 'Rickson Gracie',
              era: '1958 – Presente',
              title: 'Invicto com 400 Lutas',
              belt: 'Vermelha 9º Grau',
              quote: 'O mestre da precisão milimétrica, controle respiratório e Jiu-Jitsu invisível.',
              tag: 'Lenda Viva',
              lineage: 'Helio Gracie ➔ Rickson'
            },
            {
              name: 'Oswaldo Fadda',
              era: '1921 – 2005',
              title: 'Patriarca Suburbano',
              belt: 'Vermelha 9º Grau',
              quote: 'Mostrou a eficácia das chaves de pé e levou a arte para todos os cidadãos.',
              tag: 'Matriz Fadda',
              lineage: 'Conde Koma ➔ Luiz França ➔ Fadda'
            },
            {
              name: 'Carlos Gracie Jr. (Carlinhos)',
              era: '1956 – Presente',
              title: 'Fundador da Gracie Barra & IBJJF',
              belt: 'Vermelha 9º Grau',
              quote: 'Padronizou o ensino do BJJ pelo mundo e fundou a federação oficial.',
              tag: 'Organização Mundial',
              lineage: 'Carlos Gracie ➔ Carlinhos'
            },
            {
              name: 'Romero "Jacaré" Cavalcanti',
              era: '1952 – Presente',
              title: 'Fundador da Alliance BJJ',
              belt: 'Vermelha 9º Grau',
              quote: 'Discípulo de Rolls Gracie, fundou a equipe que conquistou 14 títulos mundiais.',
              tag: 'Formador de Campeões',
              lineage: 'Rolls Gracie ➔ Jacaré'
            }
          ].map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gradient-to-b from-zinc-900 to-black border border-amber-500/20 hover:border-amber-400/50 transition-all flex flex-col justify-between shadow-lg group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-950/70 text-red-300 border border-red-700/40">
                    {m.tag}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">{m.belt}</span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  {m.name}
                </h4>
                <p className="text-[10px] text-zinc-500 font-semibold">{m.era} • {m.title}</p>
                <p className="text-xs text-zinc-300 mt-2.5 italic">
                  "{m.quote}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
                <span>Linhagem:</span>
                <span className="font-semibold text-amber-400/90">{m.lineage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Major BJJ Teams Matrix */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            As Grandes Escolas do Jiu-Jitsu Contemporâneo
          </h3>
          <p className="text-xs text-zinc-400">
            Origens das principais equipes que dominam os campeonatos da IBJJF, ADCC e ligas mundiais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              team: 'Gracie Barra',
              founders: 'Carlos Gracie Jr. (1986)',
              origin: 'Rolls & Carlos Gracie',
              iconic: 'Marcio Feitosa, Braulio Estima, Romulo Barral, Kaynan Duarte',
              style: 'Currículo padronizado, autodefesa e liderança global.'
            },
            {
              team: 'Alliance Jiu-Jitsu',
              founders: 'Romero Jacaré & Fabio Gurgel (1993)',
              origin: 'Rolls Gracie ➔ Jacaré',
              iconic: 'Marcelo Garcia, Cobrinha, Bernardo Faria, Nicholas Meregali',
              style: '14x Campeã Mundial IBJJF, excelência metodológica de pressão.'
            },
            {
              team: 'Nova União',
              founders: 'Dedé Pederneiras & Wendell Alexander (1995)',
              origin: 'Carlson Gracie + Oswaldo Fadda',
              iconic: 'José Aldo, Robson Moura, Shaolin, Renan Barão',
              style: 'Mestres do peso leve, meia guarda e pioneirismo no MMA mundial.'
            },
            {
              team: 'Atos Jiu-Jitsu',
              founders: 'André Galvão & Ramon Lemos (2008)',
              origin: 'Carlson Gracie / Tererê ➔ Galvão',
              iconic: 'André Galvão, Irmãos Ruotolo, Keenan Cornelius, Lucas Hulk',
              style: 'Berimbolo, leg locks, guarda 50/50 e dominância no ADCC.'
            },
            {
              team: 'Checkmat',
              founders: 'Leo Vieira & Ricardo Vieira (2008)',
              origin: 'Rolls ➔ Jacaré ➔ Vieira Bros',
              iconic: 'Marcus "Buchecha" Almeida (13x mundial), Lucas Leite',
              style: 'Velocidade, quedas plásticas e ataques explosivos de meia guarda.'
            },
            {
              team: 'GFTeam',
              founders: 'Mestre Julio Cesar Pereira (1996)',
              origin: 'Conde Koma ➔ França ➔ Fadda ➔ Monir ➔ Julio Cesar',
              style: 'Passadores incansáveis, pressão física e finalizações impiedosas.',
              iconic: 'Rodolfo Vieira, Patrick Gaudio, Gutemberg Pereira, Victor Honorio'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-zinc-800 hover:border-amber-500/40 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-black text-amber-300">{item.team}</h4>
                  <span className="text-[10px] text-zinc-500 font-bold">{item.origin}</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">Fundação: {item.founders}</p>
                <p className="text-xs text-zinc-300 mt-2">{item.style}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 block">Destaques Históricos:</span>
                <span className="text-[11px] text-red-400 font-bold line-clamp-1">{item.iconic}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
