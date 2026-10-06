import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BeltBadge from '../components/BeltBadge';
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
  AlertCircle
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classesToday, setClassesToday] = useState([]);

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
          <span className="text-xs text-slate-400 font-medium">Carregando tatame...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {isProfessor ? 'Professor Responsável' : 'Área do Aluno'}
              </span>
              <span className="text-slate-500 text-xs">• Arte Suave BJJ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Oss, {user?.name}!
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              {isProfessor 
                ? 'Monitore a frequência dos alunos, controle chamadas do dia e acompanhe a evolução de graduação de cada faixa.'
                : 'Acompanhe seu ritmo de treinos, evolução física de peso e aprimore seu jogo com a biblioteca de posições.'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center min-w-[200px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
              Graduação Atual
            </span>
            <BeltBadge belt={user?.belt} degrees={user?.degrees} size="md" showLabel={true} />
            <span className="text-[11px] text-amber-400/90 font-medium mt-1">
              {user?.belt} • {user?.degrees}º Grau
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {isProfessor ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alunos Ativos</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats?.summary?.total_students || 0}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">Matriculados no tatame</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aulas Registradas</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats?.summary?.total_classes || 0}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Histórico da academia</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Presenças Assinadas</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats?.summary?.total_attendances || 0}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">Chamadas confirmadas</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prontos p/ Graduação</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{stats?.summary?.eligible_count || 0}</h3>
              <p className="text-[11px] text-amber-300 mt-1">Atingiram critérios CBJJ</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      ) : (
        /* Student KPI Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Treinos Concluídos</span>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-3xl font-black text-white">{user?.total_attendances || 0}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Presenças computadas no tatame</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Peso Atual</span>
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-3xl font-black text-white">
              {user?.physical?.weight ? `${user.physical.weight} kg` : 'Sem registro'}
            </h3>
            <p className="text-[11px] text-amber-400 mt-1">
              {user?.physical?.height ? `Altura: ${user.physical.height} cm` : 'Cadastre suas medidas'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Técnicas Praticadas</span>
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-3xl font-black text-white">
              {stats?.student_stats?.practiced_techniques || 0}
            </h3>
            <p className="text-[11px] text-blue-400 mt-1">Posições marcadas nos tutoriais</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Status no Tatame</span>
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-xl font-black text-emerald-400">Ativo & Focado</h3>
            <p className="text-[11px] text-slate-400 mt-1">Disciplina gera mestria</p>
          </div>
        </div>
      )}

      {/* Graduation Alert for Professor */}
      {isProfessor && stats?.eligible_students && stats.eligible_students.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Alunos Elegíveis para Graduação ({stats.eligible_students.length})
              </h4>
              <p className="text-xs text-slate-300">
                {stats.eligible_students.map(s => `${s.name} (${s.belt})`).join(', ')} já atingiram os requisitos mínimos de treinos para receber o próximo grau ou faixa.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('graduations')}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition whitespace-nowrap shadow-sm"
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
              <p className="text-xs text-slate-400">Acompanhe as aulas ministradas no tatame</p>
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
              <div className="p-6 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                Nenhuma aula programada no momento.
              </div>
            ) : (
              classesToday.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {c.class_type}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {c.date} às {c.time}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{c.title}</h4>
                    <p className="text-xs text-slate-500">
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
            <p className="text-xs text-slate-400">Guerreiros mais frequentes no tatame</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            {stats?.top_attendees && stats.top_attendees.length > 0 ? (
              stats.top_attendees.map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-black ${
                      index === 0 ? 'bg-amber-400 text-slate-950 shadow-sm' :
                      index === 1 ? 'bg-slate-300 text-slate-950' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">{attendee.name}</h5>
                      <BeltBadge belt={attendee.belt} degrees={attendee.degrees} size="sm" showLabel={false} />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400">
                      {attendee.attendances_count}
                    </span>
                    <span className="text-[10px] text-slate-500 block">treinos</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Sem dados no ranking ainda.</p>
            )}

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => onNavigate('reports')}
                className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-amber-400 transition"
              >
                Ver estatísticas completas →
              </button>
            </div>
          </div>

          {/* Quick Tutorials Teaser */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Estude as Posições
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Reveja armlocks, triângulos, raspagens e defesas gravadas passo a passo pelos mestres.
            </p>
            <button
              onClick={() => onNavigate('tutorials')}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition text-center"
            >
              Abrir Biblioteca de Vídeos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
