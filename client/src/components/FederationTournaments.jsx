import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from './Modal';
import { 
  Trophy, 
  Globe, 
  Calendar, 
  MapPin, 
  Tv, 
  ExternalLink, 
  Flame, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Sparkles, 
  Award, 
  Scale, 
  ChevronRight,
  Radio,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

const FEDERATIONS_LIST = [
  { id: 'Todas', name: 'Todas as Federações', badge: 'Mundial' },
  { id: 'IBJJF', name: 'IBJJF', full: 'International BJJ Federation', color: 'from-blue-600 to-indigo-700' },
  { id: 'CBJJ', name: 'CBJJ', full: 'Confederação Brasileira de JJ', color: 'from-emerald-600 to-teal-700' },
  { id: 'ADCC', name: 'ADCC', full: 'Abu Dhabi Combat Club', color: 'from-red-600 to-rose-700' },
  { id: 'AJP', name: 'AJP Tour', full: 'Abu Dhabi Jiu Jitsu Pro', color: 'from-amber-600 to-yellow-600' },
  { id: 'CJI', name: 'CJI', full: 'Craig Jones Invitational', color: 'from-purple-600 to-pink-700' }
];

export default function FederationTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [stats, setStats] = useState({ total: 0, liveCount: 0, openCount: 0, checkCount: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedFed, setSelectedFed] = useState('Todas');
  const [selectedGi, setSelectedGi] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTour, setSelectedTour] = useState(null);
  const [now, setNow] = useState(new Date());

  // Real-time clock tick for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [selectedFed, selectedGi, selectedStatus]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFed !== 'Todas') params.append('federation', selectedFed);
      if (selectedGi !== 'Todos') params.append('gi_type', selectedGi);
      if (selectedStatus !== 'Todos') params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/tournaments/federations?${params.toString()}`);
      setTournaments(res.tournaments || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Erro ao buscar torneios das federações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTournaments();
  };

  // Helper for live countdown
  const getCountdown = (targetDateStr) => {
    if (!targetDateStr) return null;
    const target = new Date(targetDateStr + 'T09:00:00');
    const diff = target - now;

    if (diff <= 0) {
      return { isPast: true, text: 'Em andamento / Realizado' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
      isPast: false,
      days,
      hours,
      minutes,
      seconds,
      text: `${days}d ${hours}h ${minutes}m ${seconds}s`
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-950 text-red-300 border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            🔴 AO VIVO NO TATAME
          </span>
        );
      case 'registration_open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Inscrições Abertas
          </span>
        );
      case 'check_phase':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <Clock className="w-3 h-3 text-amber-400" />
            Fase de Checagem
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700">
            <Calendar className="w-3 h-3 text-zinc-400" />
            Em Breve
          </span>
        );
    }
  };

  const getFedBadgeStyle = (fed) => {
    switch (fed) {
      case 'IBJJF':
        return 'bg-blue-950/80 text-blue-300 border-blue-600/60 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      case 'CBJJ':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      case 'ADCC':
        return 'bg-red-950/80 text-red-300 border-red-600/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      case 'AJP':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      case 'CJI':
        return 'bg-purple-950/80 text-purple-300 border-purple-600/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      default:
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Telemetry Live Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-black via-zinc-950 to-neutral-950 border border-amber-500/40 shadow-2xl relative overflow-hidden cyber-card">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b]" />
        
        {/* Background Kanji Watermark */}
        <div className="absolute top-1 right-4 text-7xl sm:text-9xl font-serif text-amber-500/[0.035] select-none pointer-events-none">
          世界
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-600/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                RADAR EM TEMPO REAL
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-[11px] text-amber-400 font-mono">
                {now.toLocaleTimeString('pt-BR')} (Horário Oficial do Tatame)
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
              <span>Grandes Ligas & Melhores Federações</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Acompanhe em tempo real o calendário mundial oficial de campeonatos da <strong className="text-zinc-200">IBJJF, CBJJ, ADCC, AJP Tour</strong> e <strong className="text-zinc-200">CJI</strong>. Prazos de inscrição com desconto, chaves, transmissões e premiações milionárias.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto shrink-0">
            <div className="p-2.5 rounded-xl bg-black/80 border border-red-600/40 text-center">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Ao Vivo</span>
              <span className="text-lg font-black text-red-400">{stats.liveCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/80 border border-emerald-600/40 text-center">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Inscrições</span>
              <span className="text-lg font-black text-emerald-400">{stats.openCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/80 border border-amber-600/40 text-center">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Checagem</span>
              <span className="text-lg font-black text-amber-400">{stats.checkCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/80 border border-zinc-700 text-center">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Grand Slams</span>
              <span className="text-lg font-black text-zinc-200">{stats.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Federation Tabs */}
      <div className="space-y-3">
        {/* Federation Badges Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          {FEDERATIONS_LIST.map((f) => {
            const isSelected = selectedFed === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFed(f.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer flex items-center gap-2 cyber-card ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300 font-extrabold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800'
                }`}
              >
                <span>{f.name}</span>
                {f.id !== 'Todas' && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {f.id}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Modality & Status */}
        <div className="p-3 rounded-xl bg-black border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Gi / No-Gi filter */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs">
              <span className="text-[10px] text-zinc-500 px-1 font-semibold uppercase">Modalidade:</span>
              {['Todos', 'Gi', 'No-Gi'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedGi(type)}
                  className={`px-2 py-1 rounded text-xs font-bold transition ${
                    selectedGi === type
                      ? 'bg-amber-500 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {type === 'Gi' ? '🥋 Com Kimono' : type === 'No-Gi' ? '🩳 Sem Kimono' : 'Todas'}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs">
              <span className="text-[10px] text-zinc-500 px-1 font-semibold uppercase">Status:</span>
              {[
                { id: 'Todos', label: 'Todos' },
                { id: 'live', label: '🔴 Ao Vivo' },
                { id: 'registration_open', label: '🟢 Inscrições' },
                { id: 'check_phase', label: '⏳ Checagem' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2 py-1 rounded text-xs font-bold transition ${
                    selectedStatus === st.id
                      ? 'bg-amber-500 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar cidade, país ou evento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Main Tournaments Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin shadow-[0_0_15px_#f59e0b]" />
          <span className="text-xs text-zinc-400 font-medium">Sincronizando radar das federações mundiais...</span>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="text-base font-bold text-white">Nenhum campeonato encontrado para este filtro</h4>
          <p className="text-xs text-zinc-400">Tente selecionar "Todas as Federações" ou remover o termo de busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tournaments.map((tour) => {
            const countdown = getCountdown(tour.date);
            return (
              <div
                key={tour.id}
                className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-black via-zinc-950 to-neutral-900 border border-zinc-800/90 hover:border-amber-500/60 shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between cyber-card group"
              >
                {/* Top Corner Fed Indicator */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getFedBadgeStyle(tour.federation)}`}>
                      {tour.federation}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400">
                      {tour.gi_type === 'Gi' ? '🥋 Gi (Kimono)' : tour.gi_type === 'No-Gi' ? '🩳 No-Gi' : '🥋/🩳 Gi & No-Gi'}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(tour.status)}
                  </div>
                </div>

                {/* Tournament Title & Location */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors tracking-tight line-clamp-2">
                    {tour.name}
                  </h3>

                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{tour.city}, {tour.country}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{tour.date} {tour.end_date ? `até ${tour.end_date}` : ''}</span>
                    </span>
                  </div>

                  {tour.venue && (
                    <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                      Arena: {tour.venue}
                    </p>
                  )}
                </div>

                {/* Real-time Countdown Box */}
                <div className="my-3.5 p-3 rounded-xl bg-black/80 border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block tracking-wider">
                        Contagem Regressiva do Tatame
                      </span>
                      <span className="text-xs font-mono font-black text-amber-300">
                        {countdown?.isPast ? 'Em Andamento / Concluído' : countdown?.text}
                      </span>
                    </div>
                  </div>

                  {tour.registration_batch && (
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block">Lote Atual</span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        {tour.registration_batch}
                      </span>
                    </div>
                  )}
                </div>

                {/* Highlights: Prize & Points */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/90">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" /> Premiação
                    </span>
                    <span className="text-[11px] font-black text-amber-200 truncate block mt-0.5">
                      {tour.prize_pool || 'Medalhas Oficiais'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/90">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block flex items-center gap-1">
                      <Award className="w-3 h-3 text-red-400" /> Ranking
                    </span>
                    <span className="text-[11px] font-black text-zinc-300 truncate block mt-0.5">
                      {tour.ranking_points || 'Pontuação Oficial'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setSelectedTour(tour)}
                    className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-zinc-700/80 cursor-pointer"
                  >
                    <span>Dossiê & Regras</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  {tour.official_url && (
                    <a
                      href={tour.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black transition flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] cyber-btn-shimmer cursor-pointer"
                    >
                      <span>Inscrição Oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {tour.stream_url && (
                    <a
                      href={tour.stream_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Assistir no ${tour.stream_platform}`}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950 text-red-400 border border-zinc-800 hover:border-red-600/50 transition cursor-pointer"
                    >
                      <Tv className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Tournament Dossier Modal */}
      {selectedTour && (
        <Modal
          isOpen={!!selectedTour}
          onClose={() => setSelectedTour(null)}
          title={`Dossiê Oficial: ${selectedTour.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-black border border-amber-500/40 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getFedBadgeStyle(selectedTour.federation)}`}>
                  {selectedTour.federation_full_name}
                </span>
                {getStatusBadge(selectedTour.status)}
              </div>
              <h3 className="text-lg font-black text-white">{selectedTour.name}</h3>
              <p className="text-xs text-zinc-400 mt-1">{selectedTour.description}</p>
            </div>

            {/* Grid of Key Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Data & Local</span>
                <p className="font-bold text-white mt-0.5">{selectedTour.date} {selectedTour.end_date ? `a ${selectedTour.end_date}` : ''}</p>
                <p className="text-zinc-400 text-[11px]">{selectedTour.venue} • {selectedTour.city}, {selectedTour.country}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Prazo de Inscrição</span>
                <p className="font-bold text-emerald-400 mt-0.5">{selectedTour.registration_deadline || 'Consultar federação'}</p>
                <p className="text-zinc-400 text-[11px]">{selectedTour.registration_batch || 'Lote Regular'}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Premiação & Troféu</span>
                <p className="font-bold text-amber-300 mt-0.5">{selectedTour.prize_pool}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Transmissão Oficial</span>
                <p className="font-bold text-red-400 mt-0.5">{selectedTour.stream_platform || 'FloGrappling'}</p>
              </div>
            </div>

            {/* Rules and Divisions */}
            <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-4 h-4" /> Regulamento & Arbitragem
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedTour.rules_type}
              </p>
              {selectedTour.featured_division && (
                <div className="pt-2 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-500 font-bold">Destaque:</span>{' '}
                  <span className="text-white font-semibold">{selectedTour.featured_division}</span>
                </div>
              )}
            </div>

            {/* External Links */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedTour(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
              {selectedTour.official_url && (
                <a
                  href={selectedTour.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5"
                >
                  <span>Ir para Site da {selectedTour.federation}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
