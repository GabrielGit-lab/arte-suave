import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BeltBadge from '../components/BeltBadge';
import Modal from '../components/Modal';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Plus, 
  Users, 
  Calendar, 
  MapPin, 
  Swords, 
  ChevronRight, 
  CheckCircle, 
  Sparkles, 
  Shuffle, 
  Trash2, 
  Flame, 
  Scale, 
  Award,
  Filter
} from 'lucide-react';

const BELT_CATEGORIES = [
  'Todas as Faixas (Absoluto Livre)',
  'Faixa Branca',
  'Faixa Azul',
  'Faixa Roxa',
  'Faixa Marrom & Preta',
  'Misto (Iniciante / Branca & Azul)',
  'Misto (Avançado / Roxa, Marrom & Preta)'
];

const WEIGHT_DIVISIONS = [
  'Absoluto Livre (Sem limite de peso)',
  'Galo (até 57.5kg)',
  'Pluma (até 64.0kg)',
  'Pena (até 70.0kg)',
  'Leve (até 76.0kg)',
  'Médio (até 82.3kg)',
  'Meio-Pesado (até 88.3kg)',
  'Pesado (até 94.3kg)',
  'Super Pesado (até 100.5kg)',
  'Pesadíssimo (+100.5kg)'
];

const SUBMISSIONS_LIST = [
  'Finalização (Armlock)',
  'Finalização (Triângulo)',
  'Finalização (Mata-Leão)',
  'Finalização (Kimura)',
  'Finalização (Ezequiel)',
  'Finalização (Chave de Pé / Botinha)',
  'Finalização (Heel Hook / Calcanhar)',
  'Finalização (Kneebar / Joelho)',
  'Finalização (Guilhotina)',
  'Finalização (Omoplata)',
  'Vitória por Pontos',
  'Vitória por Vantagens',
  'Decisão do Árbitro',
  'Desclassificação (DQ)'
];

export default function Tournaments() {
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [tournamentDetail, setTournamentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [filterGi, setFilterGi] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterGender, setFilterGender] = useState('Todos');

  // Create Tournament modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Tatame Central Arte Suave Arena');
  const [giType, setGiType] = useState('Gi');
  const [categoryType, setCategoryType] = useState('Absoluto');
  const [weightDivision, setWeightDivision] = useState('Absoluto Livre (Sem limite de peso)');
  const [gender, setGender] = useState('Misto');
  const [beltCategory, setBeltCategory] = useState('Todas as Faixas (Absoluto Livre)');
  
  // Available academy students for quick enrollment
  const [academyStudents, setAcademyStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Match score modal
  const [activeMatch, setActiveMatch] = useState(null);
  const [winnerName, setWinnerName] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [adv1, setAdv1] = useState(0);
  const [adv2, setAdv2] = useState(0);
  const [pen1, setPen1] = useState(0);
  const [pen2, setPen2] = useState(0);
  const [winType, setWinType] = useState('Finalização (Armlock)');
  const [matchNotes, setMatchNotes] = useState('');
  const [scoreLoading, setScoreLoading] = useState(false);

  // Add athlete modal
  const [isAddAthOpen, setIsAddAthOpen] = useState(false);
  const [athName, setAthName] = useState('');
  const [athBelt, setAthBelt] = useState('Branca');
  const [athWeight, setAthWeight] = useState('');
  const [athTeam, setAthTeam] = useState('Arte Suave BJJ');

  useEffect(() => {
    fetchTournaments();
    api.get('/students').then(setAcademyStudents).catch(() => {});
  }, [filterGi, filterCategory, filterGender]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterGi !== 'Todos') params.append('gi_type', filterGi);
      if (filterCategory !== 'Todos') params.append('category_type', filterCategory);
      if (filterGender !== 'Todos') params.append('gender', filterGender);

      const data = await api.get(`/tournaments?${params.toString()}`);
      setTournaments(data);
      if (data.length > 0 && !selectedTourId) {
        setSelectedTourId(data[0].id);
        fetchTournamentDetail(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournamentDetail = async (id) => {
    setDetailLoading(true);
    try {
      const detail = await api.get(`/tournaments/${id}`);
      setTournamentDetail(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectTournament = (id) => {
    setSelectedTourId(id);
    fetchTournamentDetail(id);
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      // Selected enrolled students
      const enrolled = academyStudents
        .filter((s) => selectedStudentIds.includes(s.id))
        .map((s) => ({
          user_id: s.id,
          name: s.name,
          belt: s.belt,
          weight: s.current_weight || 75.0,
          team: 'Arte Suave BJJ'
        }));

      const created = await api.post('/tournaments', {
        title,
        date,
        location,
        gi_type: giType,
        category_type: categoryType,
        weight_division: weightDivision,
        gender,
        belt_category: beltCategory,
        athletes: enrolled
      });

      setIsCreateOpen(false);
      setTitle('');
      setSelectedStudentIds([]);
      fetchTournaments();
      setSelectedTourId(created.id);
      fetchTournamentDetail(created.id);
    } catch (err) {
      alert(err.message || 'Erro ao criar campeonato');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    if (!selectedTourId) return;
    if (!window.confirm('Deseja sortear e gerar o chaveamento oficial da categoria?')) return;
    try {
      await api.post(`/tournaments/${selectedTourId}/generate-bracket`, {});
      fetchTournamentDetail(selectedTourId);
      fetchTournaments();
    } catch (err) {
      alert(err.message || 'Erro ao gerar chave');
    }
  };

  const handleOpenScoreModal = (match) => {
    setActiveMatch(match);
    setWinnerName(match.winner_name || match.athlete1_name || '');
    setScore1(match.score1 || 0);
    setScore2(match.score2 || 0);
    setAdv1(match.adv1 || 0);
    setAdv2(match.adv2 || 0);
    setPen1(match.pen1 || 0);
    setPen2(match.pen2 || 0);
    setWinType(match.win_type || 'Finalização (Armlock)');
    setMatchNotes(match.notes || '');
  };

  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!activeMatch || !winnerName) return;
    setScoreLoading(true);

    try {
      const winnerId = winnerName === activeMatch.athlete1_name 
        ? activeMatch.athlete1_id 
        : activeMatch.athlete2_id;

      const res = await api.post(`/tournaments/${selectedTourId}/matches/${activeMatch.id}/score`, {
        winner_id: winnerId,
        winner_name: winnerName,
        score1,
        score2,
        adv1,
        adv2,
        pen1,
        pen2,
        win_type: winType,
        notes: matchNotes
      });

      if (res.is_final) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 }
        });
      }

      setActiveMatch(null);
      fetchTournamentDetail(selectedTourId);
      fetchTournaments();
    } catch (err) {
      alert(err.message || 'Erro ao registrar resultado da luta');
    } finally {
      setScoreLoading(false);
    }
  };

  const handleAddAthlete = async (e) => {
    e.preventDefault();
    if (!selectedTourId) return;
    try {
      await api.post(`/tournaments/${selectedTourId}/athletes`, {
        athlete_name: athName,
        belt: athBelt,
        weight: athWeight ? parseFloat(athWeight) : null,
        team: athTeam
      });
      setIsAddAthOpen(false);
      setAthName('');
      setAthWeight('');
      fetchTournamentDetail(selectedTourId);
    } catch (err) {
      alert(err.message || 'Erro ao adicionar atleta');
    }
  };

  const handleDeleteTournament = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Excluir este campeonato e todas as suas chaves?')) return;
    try {
      await api.delete(`/tournaments/${id}`);
      setSelectedTourId(null);
      setTournamentDetail(null);
      fetchTournaments();
    } catch (err) {
      alert(err.message || 'Erro ao excluir campeonato');
    }
  };

  const currentTour = tournamentDetail?.tournament;
  const rounds = tournamentDetail?.rounds || [];
  const athletes = tournamentDetail?.athletes || [];
  const champion = tournamentDetail?.champion;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Chaveamento Oficial
            </span>
            <span className="text-slate-500 text-xs">• Brackets Gi, No-Gi & Absoluto</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Sistema de Chaves e Torneios de Jiu-Jitsu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gerador de chaves de eliminação simples, categorias por peso ou absoluto livre, mistas e por faixa.
          </p>
        </div>

        {isProfessor && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Novo Torneio / Campeonato
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filtros:
          </span>

          <select
            value={filterGi}
            onChange={(e) => setFilterGi(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="Todos">Modalidade: Todas</option>
            <option value="Gi">Com Kimono (Gi)</option>
            <option value="No-Gi">Sem Kimono (No-Gi)</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="Todos">Divisão: Todas</option>
            <option value="Absoluto">Absoluto (Open Class)</option>
            <option value="Peso">Por Peso</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="Todos">Gênero: Todos</option>
            <option value="Misto">Misto</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Tournaments List & Bracket Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tournaments List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            Torneios Disponíveis ({tournaments.length})
          </h3>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {tournaments.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                Nenhum campeonato cadastrado com esses filtros.
              </div>
            ) : (
              tournaments.map((t) => {
                const isSelected = selectedTourId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTournament(t.id)}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/70 shadow-lg ring-1 ring-amber-500/30'
                        : 'bg-slate-950 hover:bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            t.gi_type === 'Gi' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {t.gi_type}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {t.category_type}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300">
                            {t.gender}
                          </span>
                        </div>

                        {isProfessor && (
                          <button
                            onClick={(e) => handleDeleteTournament(t.id, e)}
                            title="Excluir Campeonato"
                            className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1">{t.title}</h4>
                      <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                        {t.belt_category}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{t.date}</span>
                      <span className="font-bold text-emerald-400">
                        {t.athletes_count} atletas • {t.matches_count} lutas
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Bracket Viewer */}
        <div className="lg:col-span-2 space-y-4">
          {detailLoading || !currentTour ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex flex-col items-center justify-center">
              <Swords className="w-10 h-10 text-slate-600 animate-pulse mb-2" />
              <p className="text-xs">Carregando chaveamento...</p>
            </div>
          ) : (
            <>
              {/* Tournament Banner Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                        {currentTour.gi_type} • {currentTour.category_type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        Formato: {currentTour.gender}
                      </span>
                      <span className="text-xs text-slate-400">
                        {currentTour.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">{currentTour.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Graduação: <strong className="text-amber-300">{currentTour.belt_category}</strong> • {currentTour.location}
                    </p>
                  </div>

                  {/* Actions for Professor */}
                  {isProfessor && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setIsAddAthOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Atleta
                      </button>
                      <button
                        onClick={handleGenerateBracket}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Shuffle className="w-3.5 h-3.5" /> Sortear Chave
                      </button>
                    </div>
                  )}
                </div>

                {/* Champion Podium Box if finished */}
                {champion && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 flex items-center gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shrink-0">
                      🥇
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        CAMPEÃO DO TORNEIO (1º LUGAR):
                      </span>
                      <h4 className="text-base font-black text-white">
                        {champion.name}
                      </h4>
                    </div>
                  </div>
                )}
              </div>

              {/* Tournament Athletes Horizontal Bar */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                  <span>Atletas Inscritos na Categoria ({athletes.length})</span>
                  <span className="text-amber-400 font-normal lowercase">{currentTour.weight_division}</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {athletes.map((ath, idx) => (
                    <div
                      key={ath.id}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 whitespace-nowrap text-xs"
                    >
                      <span className="font-bold text-slate-400 text-[10px]">#{idx + 1}</span>
                      <span className="font-semibold text-slate-200">{ath.athlete_name}</span>
                      <BeltBadge belt={ath.belt} degrees={0} size="sm" showLabel={false} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tournament Bracket Columns (Visualizer) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-amber-400" />
                  Árvore de Chaveamento da Categoria
                </h4>

                {rounds.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                    Nenhuma chave gerada ainda. Adicione atletas e clique em "Sortear Chave".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-2">
                    {rounds.map((round) => (
                      <div key={round.round_number} className="space-y-3 min-w-[240px]">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs font-bold text-amber-400 uppercase tracking-wider">
                          {round.round_name}
                        </div>

                        <div className="space-y-3 flex flex-col justify-around h-full">
                          {round.matches.map((match) => {
                            const isDone = match.status === 'completed';
                            const winner = match.winner_name;

                            return (
                              <div
                                key={match.id}
                                className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 relative ${
                                  isDone
                                    ? 'bg-slate-900 border-emerald-500/40 shadow-sm'
                                    : 'bg-slate-950 border-slate-800'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-slate-800/80">
                                  <span>Luta #{match.match_number}</span>
                                  {isDone ? (
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Finalizada
                                    </span>
                                  ) : (
                                    <span className="text-amber-400 font-semibold">Pendente</span>
                                  )}
                                </div>

                                {/* Athlete 1 */}
                                <div className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                                  winner === match.athlete1_name ? 'bg-emerald-500/15 font-bold text-emerald-300' : 'text-slate-200'
                                }`}>
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="truncate">{match.athlete1_name || 'A definir'}</span>
                                    {match.athlete1_belt && (
                                      <BeltBadge belt={match.athlete1_belt} degrees={0} size="sm" showLabel={false} />
                                    )}
                                  </div>
                                  <span className="font-mono font-bold text-xs ml-2">
                                    {match.score1}
                                  </span>
                                </div>

                                {/* Athlete 2 */}
                                <div className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                                  winner === match.athlete2_name ? 'bg-emerald-500/15 font-bold text-emerald-300' : 'text-slate-200'
                                }`}>
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="truncate">{match.athlete2_name || 'A definir'}</span>
                                    {match.athlete2_belt && (
                                      <BeltBadge belt={match.athlete2_belt} degrees={0} size="sm" showLabel={false} />
                                    )}
                                  </div>
                                  <span className="font-mono font-bold text-xs ml-2">
                                    {match.score2}
                                  </span>
                                </div>

                                {/* Result Details */}
                                {isDone && match.win_type && (
                                  <div className="text-[10px] text-amber-300/90 font-medium pt-1 border-t border-slate-800">
                                    Vitória: <strong>{match.winner_name}</strong> por {match.win_type}
                                  </div>
                                )}

                                {/* Score Button for Professor */}
                                {isProfessor && match.athlete1_name && match.athlete2_name && (
                                  <button
                                    onClick={() => handleOpenScoreModal(match)}
                                    className="w-full mt-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold transition text-center"
                                  >
                                    {isDone ? 'Editar Placar' : 'Lançar Resultado'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Match Score & Result Modal */}
      {activeMatch && (
        <Modal
          isOpen={!!activeMatch}
          onClose={() => setActiveMatch(null)}
          title={`Luta #${activeMatch.match_number} — ${activeMatch.round_name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveScore} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Confronto no Tatame</span>
              <div className="flex items-center justify-center gap-3 text-sm font-black text-white mt-1">
                <span>{activeMatch.athlete1_name}</span>
                <span className="text-amber-400">VS</span>
                <span>{activeMatch.athlete2_name}</span>
              </div>
            </div>

            {/* Select Winner */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Atleta Vencedor da Luta *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWinnerName(activeMatch.athlete1_name)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    winnerName === activeMatch.athlete1_name
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {activeMatch.athlete1_name}
                </button>
                <button
                  type="button"
                  onClick={() => setWinnerName(activeMatch.athlete2_name)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    winnerName === activeMatch.athlete2_name
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {activeMatch.athlete2_name}
                </button>
              </div>
            </div>

            {/* Win Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Método de Vitória (Finalização, Pontos ou Decisão)
              </label>
              <select
                value={winType}
                onChange={(e) => setWinType(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {SUBMISSIONS_LIST.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Points & Penalties Inputs */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              {/* Athlete 1 score */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-300 truncate">{activeMatch.athlete1_name}</h5>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pontos:</span>
                  <input
                    type="number"
                    min="0"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    className="w-16 p-1 bg-slate-900 border border-slate-800 rounded text-center font-bold text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vantagens:</span>
                  <input
                    type="number"
                    min="0"
                    value={adv1}
                    onChange={(e) => setAdv1(e.target.value)}
                    className="w-16 p-1 bg-slate-900 border border-slate-800 rounded text-center text-amber-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Punições:</span>
                  <input
                    type="number"
                    min="0"
                    value={pen1}
                    onChange={(e) => setPen1(e.target.value)}
                    className="w-16 p-1 bg-slate-900 border border-slate-800 rounded text-center text-red-400"
                  />
                </div>
              </div>

              {/* Athlete 2 score */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-300 truncate">{activeMatch.athlete2_name}</h5>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pontos:</span>
                  <input
                    type="number"
                    min="0"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    className="w-16 p-1 bg-slate-900 border border-slate-800 rounded text-center font-bold text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vantagens:</span>
                  <input
                    type="number"
                    min="0"
                    value={adv2}
                    onChange={(e) => setAdv2(e.target.value)}
                    className="w-16 p-1 bg-slate-900 border border-slate-800 rounded text-center text-amber-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Punições:</span>
                  <input
                    type="number"
                    min="0"
                    value={pen2}
                    onChange={(e) => setPen2(e.target.value)}
                    className="w-16 p-1 bg-slate-900 border border-slate-800 rounded text-center text-red-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anotações do Árbitro / Súmula
              </label>
              <input
                type="text"
                value={matchNotes}
                onChange={(e) => setMatchNotes(e.target.value)}
                placeholder="Ex: Pegada pelas costas e finalização aos 4:15"
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveMatch(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={scoreLoading || !winnerName}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
              >
                {scoreLoading ? 'Salvando...' : 'Confirmar Resultado e Avançar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Athlete Modal */}
      {isAddAthOpen && (
        <Modal
          isOpen={isAddAthOpen}
          onClose={() => setIsAddAthOpen(false)}
          title="Inscrever Atleta no Torneio"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddAthlete} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Atleta
              </label>
              <input
                type="text"
                required
                value={athName}
                onChange={(e) => setAthName(e.target.value)}
                placeholder="Ex: Leandro Lo"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Faixa
                </label>
                <select
                  value={athBelt}
                  onChange={(e) => setAthBelt(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Branca">Branca</option>
                  <option value="Azul">Azul</option>
                  <option value="Roxa">Roxa</option>
                  <option value="Marrom">Marrom</option>
                  <option value="Preta">Preta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={athWeight}
                  onChange={(e) => setAthWeight(e.target.value)}
                  placeholder="Ex: 77.5"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Equipe / Dojô
              </label>
              <input
                type="text"
                value={athTeam}
                onChange={(e) => setAthTeam(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddAthOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
              >
                Inscrever
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Tournament Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Criar Novo Torneio de Jiu-Jitsu"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Campeonato / Torneio *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Copa Arte Suave — Absoluto Gi 2026"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data do Evento
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Local / Tatame
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Modalidade
                </label>
                <select
                  value={giType}
                  onChange={(e) => setGiType(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Gi">Com Kimono (Gi)</option>
                  <option value="No-Gi">Sem Kimono (No-Gi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Categoria
                </label>
                <select
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Absoluto">Absoluto (Open Class)</option>
                  <option value="Peso">Por Peso</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gênero / Formato
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Misto">Misto</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Graduação de Faixa
                </label>
                <select
                  value={beltCategory}
                  onChange={(e) => setBeltCategory(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {BELT_CATEGORIES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Divisão de Peso
                </label>
                <select
                  value={weightDivision}
                  onChange={(e) => setWeightDivision(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {WEIGHT_DIVISIONS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Athlete Selection from Academy */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Inscrever Alunos da Academia Imediatamente ({selectedStudentIds.length} selecionados):
              </label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 max-h-36 overflow-y-auto space-y-1.5">
                {academyStudents.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                        isChecked ? 'bg-amber-500/20 text-white' : 'hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedStudentIds((prev) =>
                              isChecked ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                            );
                          }}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                        <span className="font-semibold">{s.name}</span>
                      </div>
                      <BeltBadge belt={s.belt} degrees={s.degrees} size="sm" showLabel={false} />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
              >
                {createLoading ? 'Criando...' : 'Criar Torneio'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
