import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import BeltBadge from './BeltBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { 
  Award, 
  Calendar, 
  Clock, 
  Edit3, 
  Mail, 
  Phone, 
  Scale, 
  Trash2, 
  Upload, 
  Camera, 
  Crosshair, 
  Flame, 
  Zap, 
  Quote, 
  Check, 
  Sparkles, 
  HelpCircle,
  FileText,
  UserCheck,
  Shield,
  Activity,
  AlertCircle
} from 'lucide-react';

const GAME_STYLES = [
  {
    id: 'Guardeiro',
    label: 'Guardeiro',
    icon: '🥋',
    subtitle: 'Jogo por baixo',
    desc: 'Especialista em guarda fechada, raspagens refinadas, laçada, de la riva e botes de finalização por baixo.',
    activeClass: 'bg-red-950 text-red-200 border-red-600 shadow-lg shadow-red-950/50 ring-1 ring-red-500'
  },
  {
    id: 'Passador',
    label: 'Passador',
    icon: '⚡',
    subtitle: 'Jogo por cima',
    desc: 'Especialista em pressão esmagadora, passagens toureadas, emborcadas, leg drag, joelho na barriga e montada.',
    activeClass: 'bg-amber-950 text-amber-200 border-amber-600 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500'
  },
  {
    id: 'Equilibrado',
    label: 'Completo / Híbrido',
    icon: '⚔️',
    subtitle: 'Cima & Baixo',
    desc: 'Transita fluidamente entre raspar da guarda e passar por cima, adaptando o jogo a qualquer oponente.',
    activeClass: 'bg-zinc-800 text-zinc-100 border-zinc-500 shadow-lg ring-1 ring-zinc-400'
  }
];

const SUGGESTED_POSITIONS = [
  'Guarda Fechada',
  'Meia Guarda Profunda',
  'Guarda De La Riva',
  'Guarda Aranha (Spider)',
  'Passagem Toureado',
  'Passagem Emborcando',
  'Passagem Leg Drag',
  'Montada Alta',
  'Pegada de Costas',
  '100 Kilos / Cruzifixo'
];

const SUGGESTED_SUBMISSIONS = [
  'Triângulo',
  'Armlock da Guarda',
  'Mata-Leão',
  'Kimura',
  'Estrangulamento Cruzado',
  'Ezequiel',
  'Guilhotina',
  'Chave de Pé (Botinha)',
  'Omoplata',
  'Kneebar (Chave de Joelho)'
];

export default function StudentProfileModal({
  isOpen,
  onClose,
  studentId,
  initialTab = 'curiosities',
  onUpdated
}) {
  const { user: currentUser, refreshUser } = useAuth();
  const isProfessor = currentUser?.role === 'professor';
  const isOwnProfile = currentUser?.id === studentId;
  const canEdit = isProfessor || isOwnProfile;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEditingCuriosities, setIsEditingCuriosities] = useState(false);
  const [savingCuriosities, setSavingCuriosities] = useState(false);
  const [curiosityMsg, setCuriosityMsg] = useState({ text: '', type: '' });

  // Curiosities form state
  const [gameStyle, setGameStyle] = useState('Guardeiro');
  const [favoritePosition, setFavoritePosition] = useState('');
  const [favoriteSubmission, setFavoriteSubmission] = useState('');
  const [idol, setIdol] = useState('');
  const [bjjMotto, setBjjMotto] = useState('');

  // Avatar upload
  const fileInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      loadProfileData();
    }
  }, [isOpen, studentId]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const loadProfileData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.get(`/students/${studentId}`);
      setDetails(data);
      setGameStyle(data.game_style || 'Guardeiro');
      setFavoritePosition(data.favorite_position || '');
      setFavoriteSubmission(data.favorite_submission || '');
      setIdol(data.idol || '');
      setBjjMotto(data.bjj_motto || '');
    } catch (err) {
      console.error('Erro ao carregar perfil do aluno:', err);
      setLoadError(err.message || 'Falha ao carregar dossiê do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCuriosities = async (e) => {
    e.preventDefault();
    setSavingCuriosities(true);
    setCuriosityMsg({ text: '', type: '' });

    try {
      await api.put(`/students/${studentId}`, {
        game_style: gameStyle,
        favorite_position: favoritePosition,
        favorite_submission: favoriteSubmission,
        idol,
        bjj_motto: bjjMotto
      });

      // Update local state
      setDetails(prev => ({
        ...prev,
        game_style: gameStyle,
        favorite_position: favoritePosition,
        favorite_submission: favoriteSubmission,
        idol,
        bjj_motto: bjjMotto
      }));

      if (isOwnProfile) {
        await refreshUser();
      }
      if (onUpdated) onUpdated();

      setCuriosityMsg({ text: 'Curiosidades salvas com sucesso no tatame!', type: 'success' });
      setIsEditingCuriosities(false);
    } catch (err) {
      console.error(err);
      setCuriosityMsg({ text: 'Falha ao salvar curiosidades. Tente novamente.', type: 'error' });
    } finally {
      setSavingCuriosities(false);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setAvatarLoading(true);
      try {
        await api.put(`/students/${studentId}`, { avatar: reader.result });
        setDetails(prev => ({ ...prev, avatar: reader.result }));
        if (isOwnProfile) {
          await refreshUser();
        }
        if (onUpdated) onUpdated();
      } catch (err) {
        console.error(err);
        alert('Erro ao atualizar foto de perfil.');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Tem certeza que deseja remover a foto de perfil?')) return;
    setAvatarLoading(true);
    try {
      await api.put(`/students/${studentId}`, { avatar: null });
      setDetails(prev => ({ ...prev, avatar: null }));
      if (isOwnProfile) {
        await refreshUser();
      }
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
      alert('Erro ao remover foto de perfil.');
    } finally {
      setAvatarLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={details ? `Perfil do Atleta: ${details.name}` : 'Perfil do Atleta'}
      maxWidth="max-w-3xl"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin shadow-[0_0_15px_#f59e0b]" />
          <span className="text-xs text-zinc-400 font-medium">Carregando dossiê marcial...</span>
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <span className="text-sm text-red-400 font-bold">{loadError}</span>
          <button
            type="button"
            onClick={loadProfileData}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-amber-500/40 text-xs font-bold text-amber-400 hover:bg-zinc-800 transition cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      ) : !details ? (
        <div className="py-12 text-center text-xs text-zinc-500">Nenhum dado encontrado para este atleta.</div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {/* Top Athlete Header Banner */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-black via-zinc-950 to-neutral-900 border border-amber-500/30 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative group shrink-0">
                {details.avatar ? (
                  <img
                    src={details.avatar}
                    alt={details.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-amber-500/60 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-900 ring-2 ring-amber-500/40 flex items-center justify-center text-zinc-300 font-black text-xl sm:text-2xl shadow-lg">
                    {details.name ? details.name[0].toUpperCase() : 'A'}
                  </div>
                )}

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    title="Trocar foto de perfil"
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span className="text-[9px] font-bold mt-0.5">Editar</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />

              <div className="w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    details.role === 'professor'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                      : 'bg-red-950/80 text-red-300 border border-red-700/60'
                  }`}>
                    {details.role === 'professor' ? 'Professor Faixa Preta' : 'Atleta Cadastrado'}
                  </span>
                  <span className="text-[11px] text-zinc-500 hidden xs:inline">• Arte Suave BJJ</span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {details.name}
                </h3>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" /> {details.email}
                  </span>
                  {details.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" /> {details.phone}
                    </span>
                  )}
                </div>

                {canEdit && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarLoading}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <Upload className="w-3 h-3" />
                      {avatarLoading ? 'Processando...' : 'Alterar Foto'}
                    </button>
                    {details.avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={avatarLoading}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover Foto
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full sm:w-auto text-center sm:text-right shrink-0 bg-black/60 p-3 rounded-xl border border-zinc-800/80 flex flex-col items-center sm:items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">Graduação</span>
              <BeltBadge belt={details.belt} degrees={details.degrees} size="md" showLabel={true} />
              <p className="text-[11px] text-amber-400/90 font-bold mt-1">
                {details.total_attendances || 0} Presenças no Tatame
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Specially Highlighting Curiosidades */}
          <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none touch-pan-x -mx-1 px-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('curiosities');
                setIsEditingCuriosities(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 border ${
                activeTab === 'curiosities'
                  ? 'bg-gradient-to-r from-red-950 via-zinc-950 to-amber-950 text-amber-300 border-amber-500/60 shadow-lg shadow-black/80 ring-1 ring-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <Crosshair className="w-4 h-4 text-amber-400" />
              <span>Curiosidades & Estilo</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                details.game_style === 'Passador'
                  ? 'bg-amber-900/60 text-amber-300'
                  : details.game_style === 'Guardeiro'
                  ? 'bg-red-900/60 text-red-300'
                  : 'bg-zinc-800 text-zinc-300'
              }`}>
                {details.game_style || 'Guardeiro'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                activeTab === 'overview'
                  ? 'bg-zinc-900 text-amber-300 border-amber-500/40 shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Dados do Aluno
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('graduations')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                activeTab === 'graduations'
                  ? 'bg-zinc-900 text-amber-300 border-amber-500/40 shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Graduações ({details.graduation_history?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('metrics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                activeTab === 'metrics'
                  ? 'bg-zinc-900 text-amber-300 border-amber-500/40 shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-zinc-400" />
              Pesagens ({details.physical_history?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('attendances')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                activeTab === 'attendances'
                  ? 'bg-zinc-900 text-amber-300 border-amber-500/40 shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Treinos Recentes
            </button>
          </div>

          {/* Feedback messages */}
          {curiosityMsg.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              curiosityMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
                : 'bg-red-950/80 border-red-700/60 text-red-300'
            }`}>
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{curiosityMsg.text}</span>
            </div>
          )}

          {/* TAB 1: CURIOSIDADES & ESTILO (GUARDEIRO OU PASSADOR) */}
          {activeTab === 'curiosities' && (
            <div className="space-y-4">
              {!isEditingCuriosities ? (
                <>
                  {/* Style Hero Card */}
                  <div className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden cyber-card ${
                    details.game_style === 'Passador'
                      ? 'bg-gradient-to-br from-amber-950/70 via-black to-zinc-950 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : details.game_style === 'Guardeiro'
                      ? 'bg-gradient-to-br from-red-950/70 via-black to-zinc-950 border-red-600/50 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                      : 'bg-gradient-to-br from-zinc-900/70 via-black to-zinc-950 border-zinc-700 shadow-md'
                  }`}>
                    {/* Watermark Kanji */}
                    <div className="absolute top-1 right-3 text-7xl sm:text-8xl font-serif text-amber-500/[0.04] select-none pointer-events-none">
                      {details.game_style === 'Passador' ? '攻' : details.game_style === 'Guardeiro' ? '守' : '全'}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl filter drop-shadow">
                          {details.game_style === 'Passador' ? '⚡' : details.game_style === 'Guardeiro' ? '🥋' : '⚔️'}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-mono">
                            // IDENTIDADE TÁTICA • 柔術
                          </span>
                          <h4 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                            {details.game_style === 'Passador' && 'Atleta Passador (攻め)'}
                            {details.game_style === 'Guardeiro' && 'Atleta Guardeiro (守り)'}
                            {details.game_style === 'Equilibrado' && 'Atleta Completo (全能)'}
                            {!details.game_style && 'Atleta Guardeiro (守り)'}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border shadow-xs ${
                              details.game_style === 'Passador'
                                ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                : details.game_style === 'Guardeiro'
                                ? 'bg-red-950 text-red-300 border-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-600'
                            }`}>
                              {details.game_style || 'Guardeiro'}
                            </span>
                          </h4>
                        </div>
                      </div>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setIsEditingCuriosities(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 shadow hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] cyber-btn-shimmer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          Editar Curiosidades
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed bg-black/60 p-3 rounded-xl border border-zinc-800/90 relative z-10 backdrop-blur-xs">
                      {details.game_style === 'Passador'
                        ? '🔥 Estilo focado em controle territorial, pressão contínua por cima, esgrima forte, transições de passagem e submissões a partir de posições de domínio.'
                        : details.game_style === 'Guardeiro'
                        ? '🌪️ Estilo refinado focado em jogo por baixo, armadilhas técnicas da guarda, pegadas estratégicas, alavancas de raspagem e botes certeiros de finalização.'
                        : '⚖️ Estilo versátil que se adapta prontamente ao jogo do adversário, atuando com a mesma eficiência tanto raspando por baixo quanto passando guarda.'}
                    </p>
                  </div>

                  {/* 4 Details Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Favorite Position */}
                    <div className="p-4 rounded-xl bg-black border border-zinc-800/90 hover:border-amber-500/60 transition cyber-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-400" /> Posição Favorita
                        </span>
                        <span className="text-[10px] text-amber-400/80 font-mono">技 #Controle</span>
                      </div>
                      <p className="text-sm font-black text-amber-200">
                        {details.favorite_position || 'Não informada ainda'}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Área de maior dominância técnica e conforto durante o combate.
                      </p>
                    </div>

                    {/* Signature Submission */}
                    <div className="p-4 rounded-xl bg-black border border-zinc-800/90 hover:border-red-600/60 transition cyber-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-red-400" /> Finalização de Assinatura
                        </span>
                        <span className="text-[10px] text-red-400/80 font-mono">極 #Golpe</span>
                      </div>
                      <p className="text-sm font-black text-red-300">
                        {details.favorite_submission || 'Não informada ainda'}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Golpe característico mais buscado nos rolas e campeonatos.
                      </p>
                    </div>

                    {/* Idol / Inspiration */}
                    <div className="p-4 rounded-xl bg-black border border-zinc-800/90 hover:border-amber-500/60 transition cyber-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-400" /> Maior Ídolo / Inspiração
                        </span>
                        <span className="text-[10px] text-amber-400/80 font-mono">師 #Mestre</span>
                      </div>
                      <p className="text-sm font-black text-zinc-100">
                        {details.idol || 'Lendas da Arte Suave'}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Atleta profissional ou mestre em quem se espelha tecnicamente.
                      </p>
                    </div>

                    {/* BJJ Motto */}
                    <div className="p-4 rounded-xl bg-black border border-zinc-800/90 hover:border-red-600/60 transition cyber-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Quote className="w-4 h-4 text-red-400" /> Lema / Filosofia de Tatame
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">道 #Bushido</span>
                      </div>
                      <p className="text-xs font-semibold italic text-zinc-300 leading-snug">
                        "{details.bjj_motto || 'A mente comanda, o corpo obedece. Foco e disciplina diária no tatame.'}"
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* Edit Curiosities Form */
                <form onSubmit={handleSaveCuriosities} className="space-y-5 p-4 rounded-2xl bg-zinc-950 border border-amber-500/30">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-amber-400" />
                      Editar Curiosidades & Estilo de Luta
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-semibold">
                      Personalize seu DNA no Jiu-Jitsu
                    </span>
                  </div>

                  {/* 1. Escolha Guardeiro / Passador / Completo */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      1. Qual é o seu Estilo de Jogo Predominante?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {GAME_STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setGameStyle(style.id)}
                          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                            gameStyle === style.id
                              ? style.activeClass
                              : 'bg-black/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-lg">{style.icon}</span>
                              {gameStyle === style.id && (
                                <span className="p-0.5 rounded-full bg-amber-400 text-black">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <span className="font-black text-xs block text-white">{style.label}</span>
                            <span className="text-[10px] text-zinc-400 block">{style.subtitle}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-2 leading-tight">
                            {style.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Posição Favorita */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      2. Posição Favorita de Controle ou Ataque
                    </label>
                    <input
                      type="text"
                      value={favoritePosition}
                      onChange={(e) => setFavoritePosition(e.target.value)}
                      placeholder="Ex: Meia Guarda Profunda, Guarda Fechada, Passagem Toureado..."
                      className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                    {/* Quick suggestion pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-zinc-500 font-semibold self-center mr-1">Sugestões:</span>
                      {SUGGESTED_POSITIONS.map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setFavoritePosition(pos)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                            favoritePosition === pos
                              ? 'bg-amber-950 text-amber-300 border-amber-600'
                              : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Finalização de Assinatura */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      3. Finalização Predileta (Assinatura de Golpe)
                    </label>
                    <input
                      type="text"
                      value={favoriteSubmission}
                      onChange={(e) => setFavoriteSubmission(e.target.value)}
                      placeholder="Ex: Triângulo da Guarda, Armlock Invertido, Mata-Leão..."
                      className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                    />
                    {/* Quick suggestion pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-zinc-500 font-semibold self-center mr-1">Sugestões:</span>
                      {SUGGESTED_SUBMISSIONS.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setFavoriteSubmission(sub)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                            favoriteSubmission === sub
                              ? 'bg-red-950 text-red-300 border-red-700'
                              : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Ídolo / Referência */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      4. Ídolo ou Maior Inspiração no Jiu-Jitsu
                    </label>
                    <input
                      type="text"
                      value={idol}
                      onChange={(e) => setIdol(e.target.value)}
                      placeholder="Ex: Rickson Gracie, Leandro Lo, Roger Gracie, Marcelinho Garcia, Rodolfo Vieira..."
                      className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* 5. Lema de Tatame */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      5. Lema / Frase de Tatame
                    </label>
                    <input
                      type="text"
                      value={bjjMotto}
                      onChange={(e) => setBjjMotto(e.target.value)}
                      placeholder="Ex: A mente comanda, o corpo obedece; Saber vencer sem orgulho..."
                      className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingCuriosities(false)}
                      disabled={savingCuriosities}
                      className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingCuriosities}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg transition flex items-center gap-2"
                    >
                      {savingCuriosities ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                          <span>Gravando no Tatame...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Salvar Curiosidades</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: DADOS DO ALUNO */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-black border border-zinc-800 text-xs">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">Data de Nascimento</span>
                  <span className="text-zinc-200 font-semibold">{details.birthdate || 'Não informada'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black border border-zinc-800 text-xs">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">Data de Ingresso na Academia</span>
                  <span className="text-zinc-200 font-semibold">{details.academy_join_date || '2025'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black border border-zinc-800 text-xs">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">Telefone / WhatsApp</span>
                  <span className="text-zinc-200 font-semibold">{details.phone || 'Não informado'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black border border-zinc-800 text-xs">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">Contato de Emergência</span>
                  <span className="text-red-300 font-semibold">{details.emergency_contact || 'Nenhum cadastrado'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black border border-zinc-800/80">
                <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  Status da Matrícula
                </h5>
                <p className="text-xs text-zinc-400">
                  Aluno ativo no tatame da Arte Suave BJJ. Acesso liberado para chamadas e acompanhamento técnico.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: GRADUAÇÕES */}
          {activeTab === 'graduations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Linha do Tempo de Faixas e Graus
                </span>
                <span className="text-xs text-amber-400 font-bold">
                  Faixa Atual: {details.belt} ({details.degrees}º Grau)
                </span>
              </div>

              {(!details.graduation_history || details.graduation_history.length === 0) ? (
                <div className="p-6 text-center rounded-xl bg-black border border-zinc-800 text-zinc-500 text-xs">
                  Nenhuma graduação registrada no histórico até o momento.
                </div>
              ) : (
                <div className="space-y-2">
                  {details.graduation_history.map((grad) => (
                    <div key={grad.id} className="p-3 rounded-xl bg-black border border-zinc-800 flex items-center justify-between text-xs hover:border-amber-500/40 transition">
                      <div className="flex items-center gap-3">
                        <BeltBadge belt={grad.belt} degrees={grad.degrees} size="sm" showLabel={true} />
                        <span className="text-zinc-400 text-[11px]">{grad.notes || 'Promovido com mérito.'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-300 font-bold block">{grad.awarded_date}</span>
                        <span className="text-[10px] text-zinc-500 block">Mestre: {grad.awarded_by_name || 'Mestre Carlos'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PESAGENS & MEDIDAS */}
          {activeTab === 'metrics' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  Histórico de Pesagens e Métricas Físicas
                </span>
                <span className="text-[11px] text-zinc-500">
                  {details.physical_history?.length || 0} registros
                </span>
              </div>

              {(!details.physical_history || details.physical_history.length === 0) ? (
                <div className="p-6 text-center rounded-xl bg-black border border-zinc-800 text-zinc-500 text-xs">
                  Nenhum registro de pesagem física encontrado para este atleta.
                </div>
              ) : (
                <div className="space-y-2">
                  {details.physical_history.map((phy) => (
                    <div key={phy.id} className="p-3 rounded-xl bg-black border border-zinc-800 flex items-center justify-between text-xs hover:border-amber-500/40 transition">
                      <div className="flex items-center gap-4">
                        <span className="font-black text-amber-400 text-sm">{phy.weight} kg</span>
                        {phy.height && <span className="text-zinc-400">{phy.height} cm</span>}
                        {phy.wingspan && <span className="text-zinc-400">Envergadura: {phy.wingspan} cm</span>}
                        {phy.notes && <span className="text-zinc-500 italic text-[11px]">"{phy.notes}"</span>}
                      </div>
                      <span className="text-zinc-400 text-[11px] font-semibold">{phy.recorded_at}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TREINOS & PRESENÇAS */}
          {activeTab === 'attendances' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Presenças e Aulas Recentes
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  Total: {details.total_attendances || 0} presenças
                </span>
              </div>

              {(!details.recent_attendances || details.recent_attendances.length === 0) ? (
                <div className="p-6 text-center rounded-xl bg-black border border-zinc-800 text-zinc-500 text-xs">
                  Nenhuma presença registrada ainda.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {details.recent_attendances.map((att) => (
                    <div key={att.id} className="p-2.5 rounded-xl bg-black border border-zinc-800 flex items-center justify-between text-xs hover:border-emerald-500/30 transition">
                      <div>
                        <span className="font-bold text-zinc-200">{att.class_title}</span>
                        <span className="text-[10px] text-zinc-500 block">{att.class_type} • Tatame Principal</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold block">{att.class_date}</span>
                        <span className="text-[10px] text-zinc-500">{att.class_time || 'Horário de Treino'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
