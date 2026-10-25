import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BeltBadge from '../components/BeltBadge';
import AvatarUploadModal from '../components/AvatarUploadModal';
import ProfileCuriositiesModal from '../components/ProfileCuriositiesModal';
import StudentProfileModal from '../components/StudentProfileModal';
import { 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Scale, 
  BookOpen, 
  ChevronRight,
  Flame,
  AlertCircle,
  Camera,
  GitFork,
  Crosshair,
  Zap,
  Sparkles,
  Quote,
  Edit3
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [stats, setStats] = useState(() => {
    try {
      const cached = localStorage.getItem('artesuave_dashboard_cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [classesToday, setClassesToday] = useState(() => {
    try {
      const cached = localStorage.getItem('artesuave_classes_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCuriositiesModalOpen, setIsCuriositiesModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const data = await api.get('/reports/dashboard');
      setStats(data);
      try {
        localStorage.setItem('artesuave_dashboard_cache', JSON.stringify(data));
      } catch {}

      const classesData = await api.get('/classes?limit=5');
      setClassesToday(classesData);
      try {
        localStorage.setItem('artesuave_classes_cache', JSON.stringify(classesData));
      } catch {}
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7 sm:space-y-9">
      {/* Welcome Banner - 16-Bit Dojo Arcade Panel */}
      <div className="pixel-panel-gold rounded-lg p-6 sm:p-8 shadow-[4px_4px_0px_#000]">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* 16-Bit Avatar Frame */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title="Abrir perfil completo"
                className="relative rounded block group cursor-pointer focus:outline-none"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded object-cover border-2 border-amber-500 shadow-[3px_3px_0px_#000] group-hover:border-amber-400 transition"
                  />
                ) : (
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded bg-black border-2 border-amber-500 shadow-[3px_3px_0px_#000] group-hover:border-amber-400 flex items-center justify-center text-amber-300 font-pixel text-2xl sm:text-3xl transition">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="absolute inset-0 rounded bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <span className="font-pixel text-[8px] mt-1 text-amber-300">PERFIL</span>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAvatarModalOpen(true);
                }}
                title="Alterar foto"
                className="absolute -bottom-1 -right-1 p-1.5 rounded bg-black text-amber-400 hover:text-white hover:bg-amber-600 border border-amber-500 shadow-[1px_1px_0px_#000] cursor-pointer transition"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="pixel-tag bg-red-950 text-red-300 border-red-700/80">
                  {isProfessor ? 'MESTRE / INSTRUTOR' : 'ÁREA DO ATLETA'}
                </span>
                <span className="font-pixel text-[10px] text-amber-400">
                  // ARTE SUAVE BJJ
                </span>
              </div>

              <h2 className="font-pixel text-xl sm:text-2xl font-bold text-amber-300 tracking-wide">
                Oss, {user?.name}!
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed font-sans">
                {isProfessor 
                  ? 'Acompanhe as chamadas de presença, graduações de faixas e o progresso técnico dos guerreiros.'
                  : 'Monitore seus treinos concluídos, evolução de peso corporal e domine as técnicas do tatame.'}
              </p>

              <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="pixel-btn-action px-3.5 py-1.5 rounded text-[11px] inline-flex items-center gap-1.5"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Ver Perfil & Detalhes
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="pixel-btn-secondary px-3 py-1.5 rounded text-[11px] inline-flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Foto
                </button>
              </div>
            </div>
          </div>

          {/* Graduation Badge Box */}
          <div className="pixel-panel p-4 rounded border-2 border-zinc-700 shadow-[3px_3px_0px_#000] flex flex-col items-center w-full md:w-auto min-w-[190px] shrink-0">
            <span className="font-pixel text-[10px] text-zinc-400 uppercase tracking-widest mb-2">
              Graduação
            </span>
            <BeltBadge belt={user?.belt} degrees={user?.degrees} size="md" showLabel={true} />
            <span className="font-pixel text-[11px] text-amber-400 mt-2 font-bold">
              {user?.belt} • {user?.degrees}º GRAU
            </span>
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      {isAvatarModalOpen && (
        <AvatarUploadModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      )}

      {/* Athlete Curiosities & Profile Modal */}
      {isProfileModalOpen && user && (
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          studentId={user.id}
          initialTab="curiosities"
          onClose={() => setIsProfileModalOpen(false)}
          onUpdated={fetchDashboardData}
        />
      )}

      {/* Legacy/Quick Curiosities Modal */}
      {isCuriositiesModalOpen && (
        <ProfileCuriositiesModal
          isOpen={isCuriositiesModalOpen}
          onClose={() => setIsCuriositiesModalOpen(false)}
          onUpdated={fetchDashboardData}
        />
      )}

      {/* Clean 16-Bit Combat Dossier / DNA Marcial */}
      <div className="pixel-panel rounded-lg p-5 sm:p-6 shadow-[3px_3px_0px_#000]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-3 border-b-2 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border-2 border-amber-500/50 text-amber-400 flex items-center justify-center font-bold">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <span>DNA Marcial & Estilo de Luta</span>
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Características táticas e preferências no tatame.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="pixel-btn-secondary px-3 py-1.5 rounded text-[10px] inline-flex items-center gap-1.5"
          >
            <Edit3 className="w-3 h-3 text-amber-400" />
            Editar DNA
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Estilo */}
          <div className="p-3.5 rounded bg-black border-2 border-zinc-800 shadow-[2px_2px_0px_#000]">
            <span className="font-pixel text-[9px] text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Crosshair className="w-3 h-3 text-amber-400" /> Estilo de Luta
            </span>
            <div>
              <span className={`inline-block pixel-tag ${
                user?.game_style === 'Passador'
                  ? 'bg-amber-950 text-amber-300 border-amber-500'
                  : user?.game_style === 'Guardeiro'
                  ? 'bg-red-950 text-red-300 border-red-600'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}>
                {user?.game_style || 'Guardeiro'}
              </span>
              <p className="text-xs text-zinc-400 mt-2 font-sans">
                {user?.game_style === 'Passador'
                  ? 'Pressão por cima, passagens e montada.'
                  : user?.game_style === 'Guardeiro'
                  ? 'Raspagens, triângulos e jogo por baixo.'
                  : 'Atua tanto por cima quanto por baixo.'}
              </p>
            </div>
          </div>

          {/* Posição Favorita */}
          <div className="p-3.5 rounded bg-black border-2 border-zinc-800 shadow-[2px_2px_0px_#000]">
            <span className="font-pixel text-[9px] text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Flame className="w-3 h-3 text-amber-400" /> Posição Favorita
            </span>
            <div>
              <h5 className="font-pixel text-xs text-amber-300 truncate">
                {user?.favorite_position || 'Não informada'}
              </h5>
              <p className="text-xs text-zinc-400 mt-2 font-sans">
                Área de maior conforto no combate.
              </p>
            </div>
          </div>

          {/* Golpe Fatal */}
          <div className="p-3.5 rounded bg-black border-2 border-zinc-800 shadow-[2px_2px_0px_#000]">
            <span className="font-pixel text-[9px] text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Zap className="w-3 h-3 text-red-400" /> Golpe Fatal
            </span>
            <div>
              <h5 className="font-pixel text-xs text-red-300 truncate">
                {user?.favorite_submission || 'Não informada'}
              </h5>
              <p className="text-xs text-zinc-400 mt-2 font-sans">
                Finalização de assinatura.
              </p>
            </div>
          </div>

          {/* Inspiração */}
          <div className="p-3.5 rounded bg-black border-2 border-zinc-800 shadow-[2px_2px_0px_#000]">
            <span className="font-pixel text-[9px] text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Award className="w-3 h-3 text-amber-400" /> Inspiração
            </span>
            <div>
              <h5 className="font-pixel text-xs text-amber-300 truncate">
                {user?.idol || 'Mestres do BJJ'}
              </h5>
              <p className="text-xs text-zinc-400 mt-2 font-sans truncate">
                {user?.bjj_motto ? `"${user.bjj_motto}"` : 'Referência no tatame'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {isProfessor ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="pixel-panel p-5 rounded border-2 border-zinc-800 shadow-[3px_3px_0px_#000] flex items-center justify-between">
            <div>
              <p className="font-pixel text-[10px] text-zinc-400 uppercase tracking-wider">Alunos Ativos</p>
              <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-amber-300 mt-1">{stats?.summary?.total_students || 0}</h3>
              <p className="font-pixel text-[10px] text-emerald-400 mt-1">// MATRICULADOS</p>
            </div>
            <div className="w-10 h-10 rounded bg-red-950/60 border-2 border-red-800/80 text-red-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="pixel-panel p-5 rounded border-2 border-zinc-800 shadow-[3px_3px_0px_#000] flex items-center justify-between">
            <div>
              <p className="font-pixel text-[10px] text-zinc-400 uppercase tracking-wider">Aulas Registradas</p>
              <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-white mt-1">{stats?.summary?.total_classes || 0}</h3>
              <p className="font-pixel text-[10px] text-zinc-400 mt-1">// HISTÓRICO</p>
            </div>
            <div className="w-10 h-10 rounded bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="pixel-panel p-5 rounded border-2 border-zinc-800 shadow-[3px_3px_0px_#000] flex items-center justify-between">
            <div>
              <p className="font-pixel text-[10px] text-zinc-400 uppercase tracking-wider">Presenças</p>
              <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{stats?.summary?.total_attendances || 0}</h3>
              <p className="font-pixel text-[10px] text-emerald-400 mt-1">// CHAMADAS</p>
            </div>
            <div className="w-10 h-10 rounded bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="pixel-panel p-5 rounded border-2 border-zinc-800 shadow-[3px_3px_0px_#000] flex items-center justify-between">
            <div>
              <p className="font-pixel text-[10px] text-zinc-400 uppercase tracking-wider">P/ Graduação</p>
              <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-amber-400 mt-1">{stats?.summary?.eligible_count || 0}</h3>
              <p className="font-pixel text-[10px] text-amber-300 mt-1">// APTOS</p>
            </div>
            <div className="w-10 h-10 rounded bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      ) : (
        /* Student KPI Cards */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="pixel-panel p-5 rounded border-2 border-zinc-800 shadow-[3px_3px_0px_#000]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-[10px] text-zinc-400 uppercase">Treinos Feitos</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-white">{user?.total_attendances || 0}</h3>
            <p className="font-pixel text-[10px] text-emerald-400 mt-1">// COMPUTADOS</p>
          </div>

          <div className="pixel-panel p-5 rounded border-2 border-zinc-800 shadow-[3px_3px_0px_#000]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-[10px] text-zinc-400 uppercase">Peso Atual</span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-amber-300">
              {user?.physical?.weight ? `${user.physical.weight} kg` : '-- kg'}
            </h3>
            <p className="font-pixel text-[10px] text-zinc-400 mt-1 truncate">
              {user?.physical?.height ? `ALTURA: ${user.physical.height} CM` : 'SEM MEDIDAS'}
            </p>
          </div>

          <div className="pixel-panel p-5 rounded border-2 border-zinc-800 shadow-[3px_3px_0px_#000]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-[10px] text-zinc-400 uppercase">Técnicas</span>
              <BookOpen className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-white">
              {stats?.student_stats?.practiced_techniques || 0}
            </h3>
            <p className="font-pixel text-[10px] text-red-400 mt-1">// ESTUDADAS</p>
          </div>

          <div className="pixel-panel p-5 rounded border-2 border-zinc-800 shadow-[3px_3px_0px_#000]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-[10px] text-zinc-400 uppercase">Tatame</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-pixel text-lg sm:text-xl font-bold text-emerald-400">Ativo & Focado</h3>
            <p className="font-pixel text-[10px] text-zinc-400 mt-1">// DISCIPLINA</p>
          </div>
        </div>
      )}

      {/* Graduation Alert for Professor */}
      {isProfessor && stats?.eligible_students && stats.eligible_students.length > 0 && (
        <div className="pixel-panel-gold p-5 rounded border-2 border-amber-600 shadow-[3px_3px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-500/20 text-amber-400 border-2 border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-pixel text-xs font-bold text-amber-200 uppercase tracking-wider">
                Alunos Elegíveis para Graduação ({stats.eligible_students.length})
              </h4>
              <p className="text-xs text-zinc-300 font-sans mt-0.5">
                {stats.eligible_students.map(s => `${s.name} (${s.belt})`).join(', ')} já atingiram os critérios para receber grau ou nova faixa.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('graduations')}
            className="pixel-btn-action px-4 py-2 rounded text-[11px] whitespace-nowrap shrink-0"
          >
            Avaliar e Graduar
          </button>
        </div>
      )}

      {/* Main Grid: Classes & Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left: Classes and Attendance Sign */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="font-pixel text-xs sm:text-sm font-bold text-amber-300 uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Treinos & Chamadas do Dia
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">Grade e frequência em tempo real no tatame</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="font-pixel text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 uppercase"
            >
              Ver Todas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {classesToday.length === 0 ? (
              <div className="p-8 text-center rounded bg-black border-2 border-zinc-800 text-zinc-500 font-pixel text-xs">
                // NENHUMA AULA PROGRAMADA NO MOMENTO
              </div>
            ) : (
              classesToday.map((c) => (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 rounded bg-black border-2 border-zinc-800 hover:border-amber-500/50 shadow-[2px_2px_0px_#000] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="pixel-tag bg-red-950 text-red-300 border-red-700/80">
                        {c.class_type}
                      </span>
                      <span className="font-pixel text-[10px] text-zinc-400">
                        {c.date} às {c.time}
                      </span>
                    </div>
                    <h4 className="font-pixel text-xs sm:text-sm font-bold text-zinc-100">{c.title}</h4>
                    <p className="text-xs text-zinc-400 font-sans">
                      Instrutor: {c.instructor_name || 'Mestre Carlos'} • Tatame 1
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                    <div className="text-right">
                      <span className="font-pixel text-[11px] text-emerald-400 font-bold">
                        {c.present_count || 0} PRESENTES
                      </span>
                    </div>
                    {isProfessor && (
                      <button
                        onClick={() => onNavigate('attendance')}
                        className="pixel-btn-action px-3 py-1.5 rounded text-[10px]"
                      >
                        Fazer Chamada
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Top Ranking or Belt Distribution */}
        <div className="space-y-4">
          <div className="pb-1">
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-amber-300 uppercase flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Ranking de Assiduidade
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">Top guerreiros mais presentes</p>
          </div>

          <div className="pixel-panel p-5 rounded border-2 border-zinc-800 shadow-[3px_3px_0px_#000] space-y-3">
            {stats?.top_attendees && stats.top_attendees.length > 0 ? (
              stats.top_attendees.map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-2.5 rounded bg-black/60 border border-zinc-800/80 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 flex items-center justify-center font-pixel text-[10px] font-bold rounded shadow-[1px_1px_0px_#000] ${
                      index === 0 ? 'bg-amber-400 text-black' :
                      index === 1 ? 'bg-zinc-300 text-black' :
                      index === 2 ? 'bg-amber-800 text-white' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="font-pixel text-xs text-zinc-200">{attendee.name}</h5>
                      <BeltBadge belt={attendee.belt} degrees={attendee.degrees} size="sm" showLabel={false} />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-pixel text-xs text-amber-400 font-bold">
                      {attendee.attendances_count}
                    </span>
                    <span className="font-pixel text-[8px] text-zinc-500 block uppercase">aulas</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-pixel text-xs text-zinc-500 text-center py-4">// SEM DADOS NO RANKING</p>
            )}

            <div className="pt-2 border-t-2 border-zinc-800">
              <button
                onClick={() => onNavigate('reports')}
                className="pixel-btn-secondary w-full py-2 text-center text-[10px] rounded"
              >
                Ver Métricas Completas →
              </button>
            </div>
          </div>

          {/* Quick Lineage Teaser */}
          <div className="pixel-panel-red p-5 rounded border-2 border-red-900 shadow-[3px_3px_0px_#000]">
            <h4 className="font-pixel text-xs font-bold text-red-300 uppercase flex items-center gap-2 mb-2">
              <GitFork className="w-4 h-4 text-amber-400" />
              Árvore Genealógica
            </h4>
            <p className="text-xs text-zinc-300 font-sans mb-3.5 leading-relaxed">
              Descubra a história dos samurais do Kodokan, Conde Koma e as linhagens Gracie & Fadda.
            </p>
            <button
              onClick={() => onNavigate('lineage')}
              className="pixel-btn-secondary w-full py-2 px-3 rounded text-[10px] text-center"
            >
              Conhecer a Linhagem Completa →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
