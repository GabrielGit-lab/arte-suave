import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Award, 
  Scale, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  FileText
} from 'lucide-react';
import BeltBadge from '../components/BeltBadge';

const CATEGORIES = [
  { id: 'all', label: 'Todas as Seções' },
  { id: 'points', label: 'Tabela de Pontos' },
  { id: 'techniques', label: 'Golpes por Faixa' },
  { id: 'penalties', label: 'Faltas e Punições' },
  { id: 'match_time', label: 'Duração dos Combates' },
  { id: 'uniform', label: 'Kimono e Uniforme' },
  { id: 'graduation_rules', label: 'Tempos de Graduação' },
];

const TECHNIQUES_DATA = [
  {
    name: 'Chave de Braço Reta (Armlock) e Kimura',
    branca: true,
    azul: true,
    roxa: true,
    marrom: true,
    preta: true,
    nogi_extra: 'Permitido em todas',
    desc: 'Alavanca de hiperextensão do cotovelo ou rotação escapular sem torção cervical.'
  },
  {
    name: 'Estrangulamentos com Lapela e Braço (Triângulo, Mata-Leão, Ezequiel)',
    branca: true,
    azul: true,
    roxa: true,
    marrom: true,
    preta: true,
    nogi_extra: 'Permitido (lapela apenas no Gi)',
    desc: 'Compressão das artérias carótidas e traqueia. Permitido em todas as graduações adultas.'
  },
  {
    name: 'Chave de Pé Reta (Botinha / Straight Ankle Lock)',
    branca: false,
    azul: true,
    roxa: true,
    marrom: true,
    preta: true,
    nogi_extra: 'Permitido a partir da Faixa Azul',
    desc: 'Ataque ao tendão de aquiles em linha reta. O pé deve girar para dentro e nunca para fora.'
  },
  {
    name: 'Chave de Joelho Reta (Kneebar / Leg Lock)',
    branca: false,
    azul: false,
    roxa: false,
    marrom: true,
    preta: true,
    nogi_extra: 'Permitido Marrom e Preta',
    desc: 'Hiperextensão da articulação do joelho na linha sagital.'
  },
  {
    name: 'Americana de Pé (Toe Hold)',
    branca: false,
    azul: false,
    roxa: false,
    marrom: true,
    preta: true,
    nogi_extra: 'Permitido Marrom e Preta',
    desc: 'Torção do tornozelo em figura 4 flexionando os dedos para o calcanhar.'
  },
  {
    name: 'Chave de Panturrilha (Calf Slicer)',
    branca: false,
    azul: false,
    roxa: false,
    marrom: true,
    preta: true,
    nogi_extra: 'Permitido Marrom e Preta',
    desc: 'Compressão do músculo gastrocnêmio contra o osso tibial com alavanca de joelho dobrado.'
  },
  {
    name: 'Chave de Bíceps (Biceps Slicer)',
    branca: false,
    azul: false,
    roxa: false,
    marrom: true,
    preta: true,
    nogi_extra: 'Permitido Marrom e Preta',
    desc: 'Compressão do músculo bíceps contra o rádio/ulna fechando o cotovelo.'
  },
  {
    name: 'Chave de Calcanhar (Heel Hook)',
    branca: false,
    azul: false,
    roxa: false,
    marrom: false,
    preta: false,
    nogi_extra: 'LIBERADO no No-Gi Adulto Marrom/Preta. PROIBIDO com Kimono!',
    desc: 'Torção de calcanhar que gera rotação interna ou externa dos ligamentos cruzados do joelho.'
  },
  {
    name: 'Cruzamento de Joelho por Dentro (Knee Reaping)',
    branca: false,
    azul: false,
    roxa: false,
    marrom: false,
    preta: false,
    nogi_extra: 'Permitido no No-Gi Marrom/Preta junto ao Heel Hook',
    desc: 'Passar o pé de fora sobre a coxa do adversário cruzando a linha média do joelho com o pé preso.'
  },
  {
    name: 'Bate-Estaca (Slam)',
    branca: false,
    azul: false,
    roxa: false,
    marrom: false,
    preta: false,
    nogi_extra: 'PROIBIDO UNIVERSALMENTE (Desclassificação Sumária)',
    desc: 'Projetar o adversário contra o tatame de maneira intencional para escapar de golpes ou guarda.'
  },
  {
    name: 'Torção Cervical sem Estrangulamento (Neck Crank)',
    branca: false,
    azul: false,
    roxa: false,
    marrom: false,
    preta: false,
    nogi_extra: 'PROIBIDO UNIVERSALMENTE (Desclassificação Sumária)',
    desc: 'Forçar a coluna cervical do adversário sem estrangulamento carotídeo direto.'
  },
  {
    name: 'Mata-Leão no Pé (Twisting Footlock)',
    branca: false,
    azul: false,
    roxa: false,
    marrom: false,
    preta: false,
    nogi_extra: 'PROIBIDO no Gi',
    desc: 'Torcer o pé girando o calcanhar com a perna presa em chave torcional de tendão.'
  }
];

export default function RulesCBJJ() {
  const [selectedSection, setSelectedSection] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBeltTech, setSelectedBeltTech] = useState('todas');

  const filteredTechniques = TECHNIQUES_DATA.filter((tech) => {
    const matchesSearch = 
      tech.name.toLowerCase().includes(search.toLowerCase()) ||
      tech.desc.toLowerCase().includes(search.toLowerCase()) ||
      tech.nogi_extra.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedBeltTech === 'branca') return tech.branca;
    if (selectedBeltTech === 'azul_roxa') return tech.azul || tech.roxa;
    if (selectedBeltTech === 'marrom_preta') return tech.marrom || tech.preta;
    if (selectedBeltTech === 'proibidas') return !tech.branca && !tech.preta;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Regulamento Oficial 2026
            </span>
            <span className="text-slate-500 text-xs">• CBJJ & IBJJF Rulebook</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Livro de Regras da CBJJ (Atualizado 2026)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manual completo de arbitragem, pontuações, faltas, uniformes e golpes permitidos por faixa.
          </p>
        </div>

        <a
          href="https://cbjj.com.br/regras"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 text-xs font-bold transition shadow-sm"
        >
          <span>Portal Oficial CBJJ</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por regra (ex: botinha, bate estaca, 4 pontos, heel hook, tempo, kimono...)"
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedSection(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedSection === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: POINTS TABLE */}
      {(selectedSection === 'all' || selectedSection === 'points') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Tabela Oficial de Pontos CBJJ
            </h3>
            <span className="text-[11px] text-amber-400 font-semibold">
              * Exige estabilização de 3 segundos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 4 Points */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Maior Domínio
                </span>
                <span className="text-2xl font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                  4 PONTOS
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Montada (Mount):</strong> O atleta por cima senta sobre o tronco do oponente com os joelhos ou pés no chão.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Montada pelas Costas (Back Mount):</strong> Oponente de barriga para baixo e o atleta montado em suas costas.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Pegada pelas Costas com Ganchos (Back Control):</strong> Calcanhares colocados na parte interna das coxas do adversário (sem cruzar os pés).
                  </div>
                </li>
              </ul>
            </div>

            {/* 3 Points */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950/20 border border-blue-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  Superação de Guarda
                </span>
                <span className="text-2xl font-black text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/30">
                  3 PONTOS
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Passagem de Guarda:</strong> O atleta que está por cima supera as pernas do atleta que faz guarda e estabiliza em posição lateral ou 100kg por 3 segundos.
                  </div>
                </li>
                <li className="flex items-start gap-2 text-slate-400 text-[11px]">
                  <span>ℹ️ Se o atleta passar a guarda mas o oponente virar de quatro apoios imediatamente, considera-se Vantagem ao invés de pontos.</span>
                </li>
              </ul>
            </div>

            {/* 2 Points */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Ações Fundamentais
                </span>
                <span className="text-2xl font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                  2 PONTOS
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Queda (Takedown):</strong> Desequilibrar o oponente e colocá-lo de costas ou lado no tatame, mantendo o controle por 3 segundos.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Raspagem (Sweep):</strong> Estando em posição de guarda por baixo, inverter a luta e ficar por cima mantendo o controle.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Joelho na Barriga (Knee on Belly):</strong> Colocar um joelho no abdômen ou peito do oponente, mantendo a outra perna esticada com base firme.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Vantagens & Critério de Desempate */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                <Flame className="w-4 h-4 text-amber-400" />
                Critério de Vantagens (Advantages)
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Concedida quando o atleta quase conclui um golpe de pontuação ou encaixa uma finalização que coloca o adversário em risco real de desistência, mas este consegue defender no limite.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 uppercase">
                <Scale className="w-4 h-4 text-blue-400" />
                Ordem de Desempate da Luta
              </h4>
              <p className="text-slate-400 leading-relaxed">
                1º Maior número de Pontos → 2º Maior número de Vantagens → 3º Menor número de Punições → 4º Decisão do Árbitro Central (baseada em ofensividade e combatividade).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PERMITTED / FORBIDDEN TECHNIQUES BY BELT */}
      {(selectedSection === 'all' || selectedSection === 'techniques') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Tabela de Golpes Permitidos e Proibidos por Faixa
              </h3>
              <p className="text-xs text-slate-400">Classificação conforme a idade adulta da CBJJ</p>
            </div>

            {/* Sub-filter by Belt */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedBeltTech('todas')}
                className={`px-2.5 py-1 rounded transition ${selectedBeltTech === 'todas' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedBeltTech('branca')}
                className={`px-2.5 py-1 rounded transition ${selectedBeltTech === 'branca' ? 'bg-slate-200 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Branca
              </button>
              <button
                onClick={() => setSelectedBeltTech('azul_roxa')}
                className={`px-2.5 py-1 rounded transition ${selectedBeltTech === 'azul_roxa' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Azul & Roxa
              </button>
              <button
                onClick={() => setSelectedBeltTech('marrom_preta')}
                className={`px-2.5 py-1 rounded transition ${selectedBeltTech === 'marrom_preta' ? 'bg-amber-900 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Marrom & Preta
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="p-3.5">Golpe / Chave Articular</th>
                    <th className="p-3.5 text-center">Branca</th>
                    <th className="p-3.5 text-center">Azul</th>
                    <th className="p-3.5 text-center">Roxa</th>
                    <th className="p-3.5 text-center">Marrom</th>
                    <th className="p-3.5 text-center">Preta</th>
                    <th className="p-3.5">Regra Especial No-Gi / Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTechniques.map((tech, idx) => (
                    <tr key={idx} className="hover:bg-slate-850 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{tech.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{tech.desc}</div>
                      </td>
                      <td className="p-3.5 text-center">
                        {tech.branca ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto opacity-70" />
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {tech.azul ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto opacity-70" />
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {tech.roxa ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto opacity-70" />
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {tech.marrom ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto opacity-70" />
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {tech.preta ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto opacity-70" />
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tech.nogi_extra.includes('LIBERADO')
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : tech.nogi_extra.includes('PROIBIDO')
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {tech.nogi_extra}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PENALTIES & FOULS */}
      {(selectedSection === 'all' || selectedSection === 'penalties') && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Escalada de Faltas e Punições (Combatividade)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                1ª Punição
              </span>
              <h4 className="text-sm font-bold text-amber-400">Advertência Verbal</h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                O árbitro interrompe a luta, sinaliza o gesto de falta de combatividade e adverte o atleta.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                2ª Punição
              </span>
              <h4 className="text-sm font-bold text-amber-400">+1 Vantagem ao Oponente</h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                O adversário recebe 1 vantagem no placar eletrônico oficial.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                3ª Punição
              </span>
              <h4 className="text-sm font-bold text-amber-400">+2 Pontos ao Oponente</h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                O adversário recebe 2 pontos válidos na contagem geral.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-red-800/80 bg-red-950/20">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                4ª Punição
              </span>
              <h4 className="text-sm font-bold text-red-400">DESCLASSIFICAÇÃO (DQ)</h4>
              <p className="text-red-300 mt-1 leading-relaxed font-semibold">
                O atleta é desclassificado imediatamente do combate pelo árbitro.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/60 text-xs space-y-2">
            <h4 className="font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-400" />
              Faltas Gravíssimas (Desclassificação Imediata no 1º Segundo)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
              <div>• Aplicar Bate-Estaca (Slam)</div>
              <div>• Fugir deliberadamente da área de luta para escapar de finalização encaixada</div>
              <div>• Morder, puxar cabelo, enfiar dedos nos olhos ou genitália</div>
              <div>• Uso de pomadas, substâncias escorregadias ou óleos corporais</div>
              <div>• Desrespeito moral ou agressão física ao árbitro ou mesa</div>
              <div>• Cruzar intencionalmente os dedos dentro da manga ou da calça do kimono</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: MATCH DURATION */}
      {(selectedSection === 'all' || selectedSection === 'match_time') && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Tempo Oficial de Luta por Faixa e Categoria (CBJJ 2026)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <BeltBadge belt="Branca" degrees={0} size="sm" showLabel={false} />
              <div className="text-xs font-bold text-slate-300 mt-1">Branca Adulto</div>
              <div className="text-xl font-black text-amber-400 mt-1">5 MIN</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <BeltBadge belt="Azul" degrees={0} size="sm" showLabel={false} />
              <div className="text-xs font-bold text-slate-300 mt-1">Azul Adulto</div>
              <div className="text-xl font-black text-blue-400 mt-1">6 MIN</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <BeltBadge belt="Roxa" degrees={0} size="sm" showLabel={false} />
              <div className="text-xs font-bold text-slate-300 mt-1">Roxa Adulto</div>
              <div className="text-xl font-black text-purple-400 mt-1">7 MIN</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <BeltBadge belt="Marrom" degrees={0} size="sm" showLabel={false} />
              <div className="text-xs font-bold text-slate-300 mt-1">Marrom Adulto</div>
              <div className="text-xl font-black text-amber-600 mt-1">8 MIN</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <BeltBadge belt="Preta" degrees={0} size="sm" showLabel={false} />
              <div className="text-xs font-bold text-slate-300 mt-1">Preta Adulto</div>
              <div className="text-xl font-black text-red-500 mt-1">10 MIN</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Masters 1 a 7</span>
              <div className="text-xs font-bold text-slate-300 mt-1">Todas as Faixas</div>
              <div className="text-xl font-black text-emerald-400 mt-1">5 MIN</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: UNIFORM & GI REGULATIONS */}
      {(selectedSection === 'all' || selectedSection === 'uniform') && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            Normas de Uniforme, Kimono e No-Gi (Medições Oficiais)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 uppercase tracking-wider">
                Regulamento do Kimono (Gi)
              </h4>
              <ul className="text-slate-300 space-y-1.5 list-disc list-inside">
                <li><strong>Cores autorizadas:</strong> Branco, Azul Royal ou Preto homogêneo (proibido mesclar casaco branco com calça azul).</li>
                <li><strong>Comprimento da manga:</strong> Não pode ultrapassar 5 cm de distância da articulação do punho quando os braços estiverem estendidos à frente.</li>
                <li><strong>Largura da manga:</strong> Folga mínima de 7 cm em toda a extensão do braço.</li>
                <li><strong>Faixa:</strong> Largura de 4 a 5 cm com pontas de 20 a 30 cm sobrando após o nó amarrado com firmeza.</li>
                <li><strong>Kimonometer:</strong> O fiscal checa espessura da gola (máx. 1,3 cm) e largura (máx. 5 cm).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-blue-300 uppercase tracking-wider">
                Regulamento Sem Kimono (No-Gi)
              </h4>
              <ul className="text-slate-300 space-y-1.5 list-disc list-inside">
                <li><strong>Rashguard (Camisa de Lycra):</strong> Deve conter pelo menos 10% da cor da sua faixa atual (ex: rashguard com detalhes azuis para faixa azul).</li>
                <li><strong>Bermuda / Short de Luta:</strong> Cores preta, branca ou da sua faixa. Sem bolsos, botões, zíperes ou ilhoses de metal que possam machucar os dedos.</li>
                <li><strong>Comprimento da bermuda:</strong> No mínimo até metade da coxa e no máximo até a linha superior do joelho. Calça legging por baixo é permitida desde que justa.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: GRADUATION & AGE REQUIREMENTS */}
      {(selectedSection === 'all' || selectedSection === 'graduation_rules') && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Tempos Mínimos de Permanência e Idades CBJJ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <BeltBadge belt="Branca" degrees={4} size="sm" showLabel={false} />
              <h4 className="font-bold text-white text-sm">Faixa Branca</h4>
              <p className="text-slate-400">Sem tempo mínimo fixado pela CBJJ. Critério do professor da academia.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <BeltBadge belt="Azul" degrees={4} size="sm" showLabel={false} />
              <h4 className="font-bold text-blue-400 text-sm">Faixa Azul</h4>
              <p className="text-slate-400">Idade mínima: <strong>16 anos</strong>.<br />Tempo mínimo: <strong>2 anos</strong> de permanência.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <BeltBadge belt="Roxa" degrees={4} size="sm" showLabel={false} />
              <h4 className="font-bold text-purple-400 text-sm">Faixa Roxa</h4>
              <p className="text-slate-400">Idade mínima: <strong>18 anos</strong>.<br />Tempo mínimo: <strong>1 ano e meio (18 meses)</strong>.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <BeltBadge belt="Marrom" degrees={4} size="sm" showLabel={false} />
              <h4 className="font-bold text-amber-600 text-sm">Faixa Marrom</h4>
              <p className="text-slate-400">Idade mínima: <strong>19 anos</strong>.<br />Tempo mínimo: <strong>1 ano</strong> de permanência.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
