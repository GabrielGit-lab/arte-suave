import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BeltBadge from '../components/BeltBadge';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  MapPin, 
  GitFork, 
  Copy, 
  Check, 
  Share2, 
  PlusCircle, 
  Edit3, 
  LogOut, 
  UserCheck, 
  Sparkles,
  Building2,
  ExternalLink,
  MessageCircle,
  Crosshair,
  Calendar,
  AlertCircle,
  Camera,
  Image,
  X,
  Upload
} from 'lucide-react';

export default function TeamManagement({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('members'); // 'members' | 'invite' | 'edit'

  // Forms
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formLineage, setFormLineage] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [logoUrlMode, setLogoUrlMode] = useState(false);

  // File upload refs
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const bannerLogoInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Messages
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const handleLogoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Selecione um arquivo de imagem válido (PNG, JPG, WebP).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormLogo(event.target.result);
      setStatusMsg({ type: '', text: '' });
    };
    reader.readAsDataURL(file);
  };

  const handleBannerLogoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Selecione um arquivo de imagem válido.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      try {
        setUploadingLogo(true);
        const res = await api.put('/teams/my-team/logo', { logo: base64Data });
        setStatusMsg({ type: 'success', text: res.message || 'Foto da equipe atualizada com sucesso!' });
        setTeamData(prev => prev ? { ...prev, team: { ...prev.team, logo: base64Data } } : prev);
        setFormLogo(base64Data);
        if (refreshUser) refreshUser();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message || 'Erro ao atualizar foto da equipe' });
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchMyTeam();
  }, [user]);

  const fetchMyTeam = async () => {
    try {
      setLoading(true);
      const data = await api.get('/teams/my-team');
      setTeamData(data);
      if (data?.team) {
        setFormName(data.team.name || '');
        setFormCity(data.team.city || '');
        setFormState(data.team.state || '');
        setFormLineage(data.team.lineage || '');
        setFormLogo(data.team.logo || '');
        setFormDescription(data.team.description || '');
      }
    } catch (err) {
      console.error('Erro ao carregar equipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyInviteLink = (code) => {
    const origin = window.location.origin;
    const inviteLink = `${origin}/?team=${code}`;
    const shareMessage = `🥋 Oss! Venha fazer parte da equipe *${teamData?.team?.name || 'Arte Suave'}* no Dojo Digital Arte Suave!\n\nUse o código de equipe: *${code}*\nOu acesse: ${inviteLink}`;
    navigator.clipboard.writeText(shareMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = (code) => {
    const origin = window.location.origin;
    const inviteLink = `${origin}/?team=${code}`;
    const text = encodeURIComponent(`🥋 *Oss! Convite para a equipe ${teamData?.team?.name || 'Arte Suave'}*\n\nCadastre-se na nossa plataforma de treinos e graduações.\nCódigo da Equipe: *${code}*\nLink de Acesso: ${inviteLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setSaving(true);
    try {
      const res = await api.post('/teams', {
        name: formName,
        code: formCode,
        city: formCity,
        state: formState,
        lineage: formLineage,
        logo: formLogo,
        description: formDescription
      });
      setStatusMsg({ type: 'success', text: res.message || 'Equipe registrada com sucesso!' });
      setIsCreatingTeam(false);
      await fetchMyTeam();
      if (refreshUser) refreshUser();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Erro ao registrar equipe' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setSaving(true);
    try {
      const res = await api.put('/teams/my-team', {
        name: formName,
        city: formCity,
        state: formState,
        lineage: formLineage,
        logo: formLogo,
        description: formDescription
      });
      setStatusMsg({ type: 'success', text: res.message || 'Dados atualizados com sucesso!' });
      await fetchMyTeam();
      if (refreshUser) refreshUser();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Erro ao atualizar equipe' });
    } finally {
      setSaving(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setSaving(true);
    try {
      const res = await api.post('/teams/join', { code: joinCodeInput });
      setStatusMsg({ type: 'success', text: res.message || 'Vinculado com sucesso à equipe!' });
      setIsJoiningTeam(false);
      setJoinCodeInput('');
      await fetchMyTeam();
      if (refreshUser) refreshUser();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Código de equipe inválido' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-xs text-zinc-500 font-mono">Carregando dados da equipe...</span>
      </div>
    );
  }

  // CASE 1: USER HAS NO TEAM
  if (!teamData?.hasTeam && !isCreatingTeam && !isJoiningTeam) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-black via-zinc-950 to-neutral-900 border border-amber-500/30 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 text-3xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            🛡️
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Você ainda não possui equipe vinculada
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto mt-2 leading-relaxed">
            {isProfessor
              ? 'Como professor responsável, registre agora a sua própria equipe/dojô para gerar códigos de convite e gerenciar todos os seus alunos e filiais.'
              : 'Entre na equipe do seu mestre utilizando o código de convite fornecido pelo seu professor.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            {isProfessor && (
              <button
                onClick={() => setIsCreatingTeam(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Registrar Minha Equipe
              </button>
            )}

            <button
              onClick={() => setIsJoiningTeam(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              Entrar com Código de Equipe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: REGISTRATION FORM FOR NEW TEAM (PROFESSOR)
  if (isCreatingTeam) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <button
          onClick={() => setIsCreatingTeam(false)}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
        >
          ← Voltar
        </button>

        <div className="p-6 sm:p-8 rounded-2xl bg-black border border-amber-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Registrar Nova Equipe / CT
              </h3>
              <p className="text-xs text-zinc-400">
                Você será registrado como o Mestre Fundador e Líder da equipe.
              </p>
            </div>
          </div>

          {statusMsg.text && (
            <div className={`p-3.5 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === 'error' 
                ? 'bg-red-950/80 border border-red-700/60 text-red-300' 
                : 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Nome da Equipe / Dojô *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Arte Suave Jiu-Jitsu Matriz"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Sigla/Código (Opcional)
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="Ex: SUAVE-01"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-amber-300 font-mono text-sm outline-none transition uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={formState}
                  onChange={(e) => setFormState(e.target.value.toUpperCase())}
                  placeholder="SP"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition uppercase text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Linhagem Marcial
              </label>
              <input
                type="text"
                value={formLineage}
                onChange={(e) => setFormLineage(e.target.value)}
                placeholder="Ex: Mitsuyo Maeda > Carlos Gracie > Carlson Gracie > Mestre Carlos"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition"
              />
            </div>

            {/* Foto / Brasão da Equipe */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase">
                Foto / Brasão da Equipe (Opcional)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-black border-2 border-amber-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-lg relative group">
                  {formLogo ? (
                    <img src={formLogo} alt="Brasão da Equipe" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl filter drop-shadow">🥋</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileSelect}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{formLogo ? 'Trocar Foto / Brasão' : 'Selecionar Foto do Computador'}</span>
                    </button>

                    {formLogo && (
                      <button
                        type="button"
                        onClick={() => setFormLogo('')}
                        className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setLogoUrlMode(!logoUrlMode)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition"
                    >
                      {logoUrlMode ? 'Ocultar URL' : 'Inserir Link URL'}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-500">
                    Formatos: PNG, JPG, WebP (até 5MB).
                  </p>
                </div>
              </div>

              {logoUrlMode && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <input
                    type="url"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="Ou cole a URL direta da imagem (https://...)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-xs outline-none transition"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Apresentação / Descrição
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Breve história, horários de treino e missão do dojô..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingTeam(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
              >
                {saving ? 'Criando Equipe...' : 'Confirmar & Gerar Código'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // CASE 3: JOIN EXISTING TEAM VIA CODE
  if (isJoiningTeam) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <button
          onClick={() => setIsJoiningTeam(false)}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
        >
          ← Voltar
        </button>

        <div className="p-6 rounded-2xl bg-black border border-amber-500/30 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2 text-2xl">
              🔑
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Ingressar em Equipe
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Insira o código fornecido pelo seu professor para vincular seu perfil.
            </p>
          </div>

          {statusMsg.text && (
            <div className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === 'error' 
                ? 'bg-red-950/80 border border-red-700/60 text-red-300' 
                : 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleJoinTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Código da Equipe
              </label>
              <input
                type="text"
                required
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="Ex: ARTE-01"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-amber-300 font-mono text-center text-lg font-bold outline-none transition tracking-widest uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !joinCodeInput.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
            >
              {saving ? 'Verificando Código...' : 'Confirmar Vínculo à Equipe'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // CASE 4: USER HAS A TEAM (DASHBOARD & MANAGEMENT)
  const team = teamData?.team;
  const leader = teamData?.leader;
  const members = teamData?.members || [];
  const stats = teamData?.stats || { totalMembers: 0, totalInstructors: 0, totalStudents: 0 };
  const isLeader = teamData?.isLeader;

  return (
    <div className="space-y-6">
      {/* Team Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-zinc-950 to-neutral-900 border border-amber-500/30 p-5 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-red-950/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Team Logo / Shield */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900 border-2 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-center shrink-0 overflow-hidden relative group">
              {team?.logo ? (
                <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl filter drop-shadow">🥋</span>
              )}

              {isLeader && (
                <>
                  <input
                    ref={bannerLogoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerLogoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bannerLogoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    title="Alterar Foto / Brasão da Equipe"
                    className="absolute inset-0 bg-black/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300 gap-1 cursor-pointer"
                  >
                    <Camera className="w-5 h-5 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white">
                      {uploadingLogo ? 'Enviando...' : 'Trocar Foto'}
                    </span>
                  </button>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-300 border border-red-700/60">
                  {isLeader ? 'Mestre Fundador' : isProfessor ? 'Instrutor Vinculado' : 'Membro Oficial'}
                </span>
                {team?.city && (
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {team.city}{team.state ? ` - ${team.state}` : ''}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                {team?.name}
              </h2>

              {team?.lineage && (
                <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                  <GitFork className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-zinc-300">Linhagem:</span>
                  <span>{team.lineage}</span>
                </p>
              )}

              {team?.description && (
                <p className="text-xs text-zinc-400 max-w-xl line-clamp-2">
                  {team.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Team Invite Code Card */}
          <div className="bg-black/90 p-4 rounded-xl border border-amber-500/40 shadow-xl flex flex-col items-center min-w-[220px] shrink-0">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">
              Código de Convite da Equipe
            </span>
            <div className="font-mono text-xl font-black text-amber-400 tracking-wider my-1 bg-zinc-950 px-3 py-1 rounded border border-amber-500/30">
              {team?.code}
            </div>

            <div className="grid grid-cols-2 gap-1.5 w-full mt-2">
              <button
                onClick={() => handleCopyCode(team?.code)}
                className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                title="Copiar código"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copiedCode ? 'Copiado!' : 'Código'}</span>
              </button>

              <button
                onClick={() => handleWhatsAppShare(team?.code)}
                className="px-2 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                title="Compartilhar no WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Zap</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total de Membros</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats.totalMembers}</h3>
            <p className="text-[10px] text-emerald-400 mt-0.5">Ativos no Dojô</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Instrutores / Mestres</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{stats.totalInstructors}</h3>
            <p className="text-[10px] text-amber-300 mt-0.5">Corpo Docente</p>
          </div>
          <div className="p-2.5 rounded-xl bg-red-950/40 text-red-400 border border-red-800/40">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Alunos Matriculados</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats.totalStudents}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Em Graduação</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Mestre Responsável</p>
            <h3 className="text-sm font-black text-zinc-100 mt-1 truncate max-w-[140px]">
              {leader?.name || 'Mestre Carlos'}
            </h3>
            <p className="text-[10px] text-amber-400 mt-0.5">
              {leader?.belt || 'Preta'} • {leader?.degrees || 3}º Grau
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border border-amber-500/40 overflow-hidden shrink-0">
            {leader?.avatar ? (
              <img src={leader.avatar} alt="Líder" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center font-bold text-amber-400">
                🥋
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveSubTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'members'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Membros do Dojô ({members.length})
        </button>

        <button
          onClick={() => setActiveSubTab('invite')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'invite'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Convidar Alunos
        </button>

        {isLeader && (
          <button
            onClick={() => setActiveSubTab('edit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'edit'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Editar Dados da Equipe
          </button>
        )}
      </div>

      {/* Status Alert */}
      {statusMsg.text && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          statusMsg.type === 'error' 
            ? 'bg-red-950/80 border border-red-700/60 text-red-300' 
            : 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* SUB-TAB 1: MEMBERS LIST */}
      {activeSubTab === 'members' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-zinc-800 hover:border-amber-500/40 transition flex items-start justify-between gap-3 shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/30 group-hover:ring-amber-400 transition"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-zinc-900 ring-2 ring-amber-500/30 flex items-center justify-center font-bold text-zinc-300 text-sm">
                        {member.name ? member.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${
                      member.role === 'professor' ? 'bg-amber-400' : 'bg-red-600'
                    }`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition">
                        {member.name}
                      </h4>
                      {member.team_role === 'leader' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-amber-950 text-amber-300 border border-amber-600/50">
                          Mestre
                        </span>
                      )}
                      {member.team_role === 'instructor' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-red-950 text-red-300 border border-red-700/50">
                          Instrutor
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <BeltBadge belt={member.belt} degrees={member.degrees} size="sm" showLabel={true} />
                      {member.game_style && (
                        <span className="text-[9px] font-semibold text-zinc-500">
                          • {member.game_style}
                        </span>
                      )}
                    </div>

                    {member.phone && (
                      <p className="text-[11px] text-zinc-500 mt-1">
                        {member.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INVITE STUDENTS & QR / WHATSAPP */}
      {activeSubTab === 'invite' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-black border border-amber-500/30 shadow-2xl space-y-6">
          <div className="text-center">
            <span className="text-4xl">🥋</span>
            <h3 className="text-lg font-black text-white uppercase tracking-wider mt-2">
              Convite para Membros & Alunos
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Envie o link ou o código exclusivo da sua equipe para que os alunos façam o cadastro e sejam automaticamente filiados ao seu Dojô.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 text-center space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Código Oficial da Equipe
            </span>
            <div className="text-2xl font-mono font-black text-amber-400 tracking-widest">
              {team?.code}
            </div>
            <p className="text-[11px] text-zinc-400">
              O aluno pode digitar esse código durante o cadastro na tela de login.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleWhatsAppShare(team?.code)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar Convite via WhatsApp
            </button>

            <button
              onClick={() => handleCopyInviteLink(team?.code)}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              {copiedLink ? 'Mensagem de Convite Copiada!' : 'Copiar Mensagem Completa com Link'}
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EDIT TEAM DETAILS (LEADER ONLY) */}
      {activeSubTab === 'edit' && isLeader && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-black border border-amber-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Editar Dados da Equipe
              </h3>
              <p className="text-xs text-zinc-400">
                Altere nome, linhagem marcial, brasão e localização do seu CT.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Nome da Equipe / Dojô *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={formState}
                  onChange={(e) => setFormState(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition uppercase text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Linhagem Marcial
              </label>
              <input
                type="text"
                value={formLineage}
                onChange={(e) => setFormLineage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition"
              />
            </div>

            {/* Foto / Brasão da Equipe */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase">
                Foto / Brasão da Equipe
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-black border-2 border-amber-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-lg relative group">
                  {formLogo ? (
                    <img src={formLogo} alt="Brasão da Equipe" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl filter drop-shadow">🥋</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileSelect}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{formLogo ? 'Trocar Foto / Brasão' : 'Selecionar Foto do Computador'}</span>
                    </button>

                    {formLogo && (
                      <button
                        type="button"
                        onClick={() => setFormLogo('')}
                        className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setLogoUrlMode(!logoUrlMode)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition"
                    >
                      {logoUrlMode ? 'Ocultar URL' : 'Inserir Link URL'}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-500">
                    Formatos: PNG, JPG, WebP (até 5MB).
                  </p>
                </div>
              </div>

              {logoUrlMode && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <input
                    type="url"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="Ou cole a URL direta da imagem (https://...)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-xs outline-none transition"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Descrição & Missão
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-sm outline-none transition resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
