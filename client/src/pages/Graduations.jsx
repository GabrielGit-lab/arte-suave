import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BeltBadge from '../components/BeltBadge';
import Modal from '../components/Modal';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const BELT_LIST = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];

export default function Graduations() {
  const { user, refreshUser } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Promote modal state
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [promoteStudentId, setPromoteStudentId] = useState(null);
  const [newBelt, setNewBelt] = useState('Branca');
  const [newDegrees, setNewDegrees] = useState(0);
  const [promoteDate, setPromoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [promoteNotes, setPromoteNotes] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Student specific timeline
  const [studentTimeline, setStudentTimeline] = useState([]);

  useEffect(() => {
    fetchGraduations();
    if (!isProfessor && user?.id) {
      fetchStudentTimeline(user.id);
    }
  }, [user]);

  const fetchGraduations = async () => {
    setLoading(true);
    try {
      const data = await api.get('/graduations/overview');
      setOverview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentTimeline = async (id) => {
    try {
      const data = await api.get(`/graduations/student/${id}`);
      setStudentTimeline(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPromote = (s) => {
    setPromoteStudentId(s.id);
    // Pre-select next degree or next belt
    let targetBelt = s.belt;
    let targetDegree = (s.degrees || 0) + 1;

    if (targetDegree > 4) {
      const currIdx = BELT_LIST.indexOf(s.belt);
      if (currIdx !== -1 && currIdx < BELT_LIST.length - 1) {
        targetBelt = BELT_LIST[currIdx + 1];
        targetDegree = 0;
      }
    }

    setNewBelt(targetBelt);
    setNewDegrees(targetDegree);
    setPromoteNotes(`Concessão de ${targetDegree > 0 ? `${targetDegree}º Grau` : `Faixa ${targetBelt}`} por mérito e disciplina no tatame.`);
    setIsPromoteOpen(true);
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    setPromoting(true);
    try {
      const res = await api.post('/graduations/promote', {
        student_id: promoteStudentId,
        belt: newBelt,
        degrees: parseInt(newDegrees, 10),
        awarded_date: promoteDate,
        notes: promoteNotes,
      });

      // Confetti celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(''), 5000);

      setIsPromoteOpen(false);
      fetchGraduations();
      refreshUser();
    } catch (err) {
      alert(err.message || 'Erro ao graduar aluno');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Sistema CBJJ / IBJJF
            </span>
            <span className="text-slate-500 text-xs">• Graus, Faixas e Promoções</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Gestão de Graduação e Faixas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe a assiduidade requerida para cada grau e realize a promoção oficial de faixa dos guerreiros.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          {successMessage}
        </div>
      )}

      {/* CBJJ Guideline Explanation Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Sistema de Graus da Academia (Regulamento CBJJ)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
              • <strong>Faixa Branca:</strong> 4 graus (cerca de 30-35 treinos por grau)<br className="hidden sm:inline" />
              • <strong>Faixa Azul:</strong> 4 graus (tempo mínimo de 2 anos)<br className="hidden sm:inline" />
              • <strong>Faixa Roxa:</strong> 1.5 anos • <strong>Marrom:</strong> 1 ano
            </p>
          </div>
        </div>
      </div>

      {/* If Student view, show own progress card first */}
      {!isProfessor && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/30 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Sua Situação Atual de Graduação
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {user?.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total de treinos no tatame: <strong className="text-emerald-400">{user?.total_attendances || 0} treinos</strong>
              </p>
            </div>

            <div>
              <BeltBadge belt={user?.belt} degrees={user?.degrees} size="lg" showLabel={true} />
            </div>
          </div>

          {/* Progress bar towards next degree */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Progresso para o próximo grau ({((user?.degrees || 0) + 1)}º Grau):</span>
              <span className="text-amber-400 font-bold">
                {Math.min(100, Math.round(((user?.total_attendances || 0) / 35) * 100))}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, Math.round(((user?.total_attendances || 0) / 35) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Mantenha a frequência nas aulas para que o professor avalie sua aptidão na próxima cerimônia.
            </p>
          </div>

          {/* Personal Timeline */}
          {studentTimeline.length > 0 && (
            <div className="pt-3 border-t border-slate-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Histórico de Promoções Recebidas:
              </h5>
              <div className="space-y-2">
                {studentTimeline.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <BeltBadge belt={item.belt} degrees={item.degrees} size="sm" showLabel={true} />
                      <span className="text-slate-400">{item.notes}</span>
                    </div>
                    <span className="text-slate-400 font-semibold">{item.awarded_date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Professor View: All Students Eligibility Board */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Quadro Geral de Graduação dos Alunos
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.map((student) => {
              const isEligible = student.is_ready;

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-xl bg-slate-900 border transition-all flex flex-col justify-between ${
                    isEligible 
                      ? 'border-amber-500/60 ring-1 ring-amber-500/30 shadow-lg' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{student.name}</h4>
                          <span className="text-[10px] text-slate-500">
                            {student.total_attendances} treinos no histórico
                          </span>
                        </div>
                      </div>

                      {isEligible ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950 shadow-sm animate-pulse">
                          Elegível ⭐
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                          {student.progress_percent}%
                        </span>
                      )}
                    </div>

                    <div className="my-2.5">
                      <BeltBadge belt={student.belt} degrees={student.degrees} size="md" showLabel={true} />
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 my-3">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Meta do próximo grau:</span>
                        <span className="font-bold text-amber-400">{student.total_attendances} / {student.target_attendances} aulas</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isEligible ? 'bg-amber-400' : 'bg-slate-600'
                          }`}
                          style={{ width: `${student.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Promotion Button */}
                  {isProfessor && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleOpenPromote(student)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isEligible
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Graduar / Promover Aluno
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Professor Promote Modal */}
      {isPromoteOpen && (
        <Modal
          isOpen={isPromoteOpen}
          onClose={() => setIsPromoteOpen(false)}
          title="Cerimônia Oficial de Graduação"
          maxWidth="max-w-md"
        >
          <form onSubmit={handlePromoteSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-700/40 text-xs text-amber-200">
              Selecione a nova faixa ou grau a ser concedido ao atleta pelo professor responsável.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nova Faixa
                </label>
                <select
                  value={newBelt}
                  onChange={(e) => setNewBelt(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {BELT_LIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número de Graus (0 a 4)
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={newDegrees}
                  onChange={(e) => setNewDegrees(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Belt Preview */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Prévia da Nova Faixa</span>
              <BeltBadge belt={newBelt} degrees={newDegrees} size="md" showLabel={true} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data da Promoção
              </label>
              <input
                type="date"
                required
                value={promoteDate}
                onChange={(e) => setPromoteDate(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações / Ata de Graduação
              </label>
              <textarea
                rows={2}
                value={promoteNotes}
                onChange={(e) => setPromoteNotes(e.target.value)}
                placeholder="Ex: Concedido em virtude da excelente técnica e dedicação ao dojô"
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPromoteOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={promoting}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition disabled:opacity-50"
              >
                {promoting ? 'Promovendo...' : 'Confirmar Graduação 🥋'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
