import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BeltBadge from '../components/BeltBadge';
import AvatarUploadModal from '../components/AvatarUploadModal';
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
  GitFork
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classesToday, setClassesToday] = useState([]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.get('/reports/dashboard');
      setStats(data);

      const classesData = await api.get('/classes?limit=5');
      setClassesToday(classesData);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs text-zinc-400 font-medium">Carregando tatame...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-zinc-950 to-neutral-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-red-950/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* Interactive Profile Photo */}
            <div className="relative group shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-amber-500/50 shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-900 ring-4 ring-amber-500/40 flex items-center justify-center text-zinc-300 font-black text-2xl sm:text-3xl shadow-xl">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Alterar ou remover foto de perfil"
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <Camera className="w-5 h-5 text-amber-400" />
                <span className="text-[9px] font-bold mt-0.5">Editar</span>
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-700/50">
                  {isProfessor ? 'Professor Responsável' : 'Área do Aluno'}
                </span>
                <span className="text-amber-400/80 text-xs font-semibold">• Arte Suave BJJ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Oss, {user?.name}!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                {isProfessor 
                  ? 'Monitore a frequência dos alunos, controle chamadas do dia e acompanhe a evolução de graduação de cada faixa.'
                  : 'Acompanhe seu ritmo de treinos, evolução física de peso e aprimore seu jogo com a biblioteca de posições.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="mt-2 text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Camera className="w-3.5 h-3.5" />
                {user?.avatar ? 'Alterar / Remover foto de perfil' : 'Adicionar foto de perfil'}
              </button>
            </div>
          </div>

          <div className="bg-black/90 p-4 rounded-xl border border-amber-500/30 flex flex-col items-center min-w-[200px] shrink-0 shadow-lg">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">
              Graduação Atual
            </span>
            <BeltBadge belt={user?.belt} degrees={user?.degrees} size="md" showLabel={true} />
            <span className="text-[11px] text-amber-400/90 font-medium mt-1">
              {user?.belt} • {user?.degrees}º Grau
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

      {/* KPI Cards */}
      {isProfessor ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 hover:border-amber-500/40 transition flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Alunos Ativos</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats?.summary?.total_students || 0}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">Matriculados no tatame</p>
            </div>
            <div className="p-3 rounded-xl bg-red-950/40 text-red-400 border border-red-800/40">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 hover:border-amber-500/40 transition flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Aulas Registradas</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats?.summary?.total_classes || 0}</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Histórico da academia</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 hover:border-amber-500/40 transition flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Presenças Assinadas</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats?.summary?.total_attendances || 0}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">Chamadas confirmadas</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 hover:border-amber-500/40 transition flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Prontos p/ Graduação</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{stats?.summary?.eligible_count || 0}</h3>
              <p className="text-[11px] text-amber-300 mt-1">Atingiram critérios CBJJ</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      ) : (
        /* Student KPI Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Treinos Concluídos</span>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-3xl font-black text-white">{user?.total_attendances || 0}</h3>
            <p className="text-[11px] text-zinc-400 mt-1">Presenças computadas no tatame</p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Peso Atual</span>
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-3xl font-black text-white">
              {user?.physical?.weight ? `${user.physical.weight} kg` : 'Sem registro'}
            </h3>
            <p className="text-[11px] text-amber-400 mt-1">
              {user?.physical?.height ? `Altura: ${user.physical.height} cm` : 'Cadastre suas medidas'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Técnicas Praticadas</span>
              <BookOpen className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-3xl font-black text-white">
              {stats?.student_stats?.practiced_techniques || 0}
            </h3>
            <p className="text-[11px] text-red-400 mt-1">Posições marcadas nos tutoriais</p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Status no Tatame</span>
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-xl font-black text-emerald-400">Ativo & Focado</h3>
            <p className="text-[11px] text-zinc-400 mt-1">Disciplina gera mestria</p>
          </div>
        </div>
      )}

      {/* Graduation Alert for Professor */}
      {isProfessor && stats?.eligible_students && stats.eligible_students.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/60 via-black to-zinc-900 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Alunos Elegíveis para Graduação ({stats.eligible_students.length})
              </h4>
              <p className="text-xs text-zinc-300">
                {stats.eligible_students.map(s => `${s.name} (${s.belt})`).join(', ')} já atingiram os requisitos mínimos de treinos para receber o próximo grau ou faixa.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('graduations')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs transition whitespace-nowrap shadow-md"
          >
            Avaliar e Graduar
          </button>
        </div>
      )}

      {/* Main Grid: Classes & Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Classes and Attendance Sign */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Treinos Recentes & Próximas Chamadas
              </h3>
              <p className="text-xs text-zinc-400">Acompanhe as aulas ministradas no tatame</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {classesToday.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-black border border-zinc-800 text-zinc-500 text-xs">
                Nenhuma aula programada no momento.
              </div>
            ) : (
              classesToday.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-gradient-to-b from-zinc-950 to-black hover:border-amber-500/40 border border-zinc-800 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-800/50">
                        {c.class_type}
                      </span>
                      <span className="text-xs font-medium text-zinc-400">
                        {c.date} às {c.time}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-100">{c.title}</h4>
                    <p className="text-xs text-zinc-500">
                      Instrutor: {c.instructor_name || 'Mestre Carlos'} • Tatame 1
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">
                        {c.present_count || 0} presentes
                      </span>
                    </div>
                    {isProfessor && (
                      <button
                        onClick={() => onNavigate('attendance')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
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
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Ranking de Assiduidade
            </h3>
            <p className="text-xs text-zinc-400">Guerreiros mais frequentes no tatame</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-amber-500/20 space-y-3 shadow-lg">
            {stats?.top_attendees && stats.top_attendees.length > 0 ? (
              stats.top_attendees.map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-black ${
                      index === 0 ? 'bg-amber-400 text-black shadow-sm font-bold' :
                      index === 1 ? 'bg-zinc-300 text-black font-bold' :
                      index === 2 ? 'bg-red-800 text-white font-bold' :
                      'text-zinc-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-200">{attendee.name}</h5>
                      <BeltBadge belt={attendee.belt} degrees={attendee.degrees} size="sm" showLabel={false} />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400">
                      {attendee.attendances_count}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">treinos</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-4">Sem dados no ranking ainda.</p>
            )}

            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={() => onNavigate('reports')}
                className="w-full py-2 text-center text-xs font-semibold text-zinc-400 hover:text-amber-400 transition"
              >
                Ver estatísticas completas →
              </button>
            </div>
          </div>

          {/* Quick Lineage Teaser */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-black via-zinc-950 to-red-950/30 border border-amber-500/30 shadow-lg">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <GitFork className="w-4 h-4 text-amber-400" />
              Árvore Genealógica
            </h4>
            <p className="text-xs text-zinc-400 mb-3">
              Descubra a história dos samurais do Kodokan, Conde Koma e as linhagens Gracie & Fadda.
            </p>
            <button
              onClick={() => onNavigate('lineage')}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition text-center"
            >
              Conhecer a Linhagem Completa →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
