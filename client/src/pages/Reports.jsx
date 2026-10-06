import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BeltBadge from '../components/BeltBadge';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Users, 
  Calendar, 
  CheckCircle, 
  Flame,
  ArrowUpRight,
  PieChart
} from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.get('/reports/dashboard');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const beltDist = stats?.belt_distribution || [];
  const topAttendees = stats?.top_attendees || [];
  const trend = stats?.attendance_trend || [];
  const totalStudents = stats?.summary?.total_students || 1;

  // Max attendance in trend for scaling bars
  const maxTrend = Math.max(...trend.map((t) => t.present_count || 0), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Estatísticas & Análise
            </span>
            <span className="text-slate-500 text-xs">• Desempenho e Frequência</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Relatórios de Desempenho da Academia
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Indicadores de assiduidade, adesão aos treinos e distribuição de faixas no tatame.
          </p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total de Atletas</span>
          <h3 className="text-3xl font-black text-white mt-1">{stats?.summary?.total_students}</h3>
          <p className="text-[11px] text-blue-400 mt-1">Alunos cadastrados no sistema</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Treinos Ministrados</span>
          <h3 className="text-3xl font-black text-amber-400 mt-1">{stats?.summary?.total_classes}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Sessões completas de aula</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Presenças Computadas</span>
          <h3 className="text-3xl font-black text-emerald-400 mt-1">{stats?.summary?.total_attendances}</h3>
          <p className="text-[11px] text-emerald-400 mt-1">Assinaturas do professor</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Prontos p/ Exame de Faixa</span>
          <h3 className="text-3xl font-black text-amber-300 mt-1">{stats?.summary?.eligible_count}</h3>
          <p className="text-[11px] text-amber-300 mt-1">Meta de aulas CBJJ batida</p>
        </div>
      </div>

      {/* Main Charts & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Frequência nas Últimas Aulas
              </h3>
              <p className="text-xs text-slate-500">Número de alunos presentes por aula</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {trend.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhum treino recente registrado.</p>
            ) : (
              trend.map((item, idx) => {
                const count = item.present_count || 0;
                const percent = Math.round((count / maxTrend) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[220px]">
                        {item.title} <span className="text-slate-500 text-[10px]">({item.date})</span>
                      </span>
                      <span className="font-black text-emerald-400">{count} presentes</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Belts Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              Distribuição de Faixas da Academia
            </h3>
            <p className="text-xs text-slate-500">Divisão dos atletas por graduação</p>
          </div>

          <div className="space-y-3 pt-2">
            {beltDist.map((item) => {
              const percentage = Math.round((item.count / totalStudents) * 100);
              return (
                <div key={item.belt} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <BeltBadge belt={item.belt} degrees={0} size="sm" showLabel={true} />
                    <span className="font-bold text-slate-200">
                      {item.count} atletas ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.belt === 'Branca' ? 'bg-slate-300' :
                        item.belt === 'Azul' ? 'bg-blue-500' :
                        item.belt === 'Roxa' ? 'bg-purple-500' :
                        item.belt === 'Marrom' ? 'bg-amber-700' : 'bg-red-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Attendance Warriors Ranking */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Hall da Fama & Ranking Geral de Disciplina
            </h3>
            <p className="text-xs text-slate-400">Atletas que mais pisaram no tatame neste ciclo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topAttendees.map((att, index) => (
            <div
              key={att.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                  index === 0 ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/30' :
                  index === 1 ? 'bg-slate-300 text-slate-950' :
                  index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>

                <div>
                  <h4 className="text-xs font-bold text-white">{att.name}</h4>
                  <div className="mt-0.5">
                    <BeltBadge belt={att.belt} degrees={att.degrees} size="sm" showLabel={false} />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-amber-400">{att.attendances_count}</span>
                <span className="text-[10px] text-slate-500 block">treinos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
