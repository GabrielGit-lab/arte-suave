import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BeltBadge from '../components/BeltBadge';
import Modal from '../components/Modal';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  Plus, 
  UserCheck, 
  Search, 
  FileCheck,
  History,
  Check,
  X
} from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  // Classes & Selection
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [studentsSheet, setStudentsSheet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Student history view
  const [studentHistory, setStudentHistory] = useState([]);

  // Create class modal
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [newClassTitle, setNewClassTitle] = useState('');
  const [newClassDate, setNewClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [newClassTime, setNewClassTime] = useState('19:30');
  const [newClassType, setNewClassType] = useState('Gi');
  const [newClassNotes, setNewClassNotes] = useState('Tatame Principal');

  useEffect(() => {
    fetchClasses();
    if (!isProfessor) {
      fetchStudentHistory();
    }
  }, [user]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await api.get('/classes?limit=30');
      setClasses(data);
      if (data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id);
        fetchAttendanceSheet(data[0].id);
      } else if (selectedClassId) {
        fetchAttendanceSheet(selectedClassId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSheet = async (classId) => {
    try {
      const data = await api.get(`/attendance/class/${classId}`);
      setClassDetails(data.class);
      setStudentsSheet(data.students);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentHistory = async () => {
    try {
      const data = await api.get('/attendance/my-history');
      setStudentHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectClass = (cId) => {
    setSelectedClassId(cId);
    fetchAttendanceSheet(cId);
  };

  // Toggle single student attendance
  const handleToggleAttendance = async (studentId, currentStatus) => {
    if (!isProfessor || !selectedClassId) return;
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';

    // Optimistic UI update
    setStudentsSheet((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, status: newStatus } : s))
    );

    try {
      await api.post('/attendance/sign', {
        class_id: selectedClassId,
        student_id: studentId,
        status: newStatus,
        notes: newStatus === 'present' ? 'Presença confirmada' : ''
      });
      // Refresh count on class list
      fetchClasses();
    } catch (err) {
      console.error(err);
      // Revert on error
      fetchAttendanceSheet(selectedClassId);
    }
  };

  // Batch mark all
  const handleBatchMark = async (markAll) => {
    if (!isProfessor || !selectedClassId) return;
    setSaving(true);
    try {
      const presentIds = markAll ? studentsSheet.map((s) => s.student_id) : [];
      await api.post('/attendance/batch', {
        class_id: selectedClassId,
        present_student_ids: presentIds,
      });

      setMessage(markAll ? 'Todos os alunos foram marcados!' : 'Chamada limpa com sucesso.');
      setTimeout(() => setMessage(''), 3000);
      fetchAttendanceSheet(selectedClassId);
      fetchClasses();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar chamada');
    } finally {
      setSaving(false);
    }
  };

  // Create new class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const created = await api.post('/classes', {
        title: newClassTitle,
        date: newClassDate,
        time: newClassTime,
        class_type: newClassType,
        notes: newClassNotes,
      });

      setIsCreateClassOpen(false);
      setNewClassTitle('');
      fetchClasses();
      setSelectedClassId(created.id);
      fetchAttendanceSheet(created.id);
    } catch (err) {
      alert(err.message || 'Erro ao criar aula');
    }
  };

  const presentCount = studentsSheet.filter((s) => s.status === 'present').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Controle de Frequência
            </span>
            <span className="text-zinc-500 text-xs">• Livro de Presença Oficial</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-400" />
            {isProfessor ? 'Chamada e Assinatura de Aulas' : 'Meu Histórico de Presenças'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {isProfessor
              ? 'Assine a presença dos alunos em cada aula do tatame para alimentar os requisitos de graduação.'
              : 'Verifique todos os treinos em que você esteve presente e computados pelo professor.'}
          </p>
        </div>

        {isProfessor && (
          <button
            onClick={() => setIsCreateClassOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-md transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nova Aula no Cronograma
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      {/* Main Layout */}
      {isProfessor ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Classes Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Selecione a Aula / Turma
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {classes.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
                  Nenhuma aula cadastrada.
                </div>
              ) : (
                classes.map((c) => {
                  const isSelected = selectedClassId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectClass(c.id)}
                      className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-zinc-950 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-black hover:bg-zinc-950/60 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          {c.date} • {c.time}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-zinc-300">
                          {c.class_type}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{c.title}</h4>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">{c.instructor_name || 'Mestre Carlos'}</span>
                        <span className="text-emerald-400 font-bold">
                          {c.present_count || 0} alunos
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Attendance Sheet for Selected Class */}
          <div className="lg:col-span-2 space-y-4">
            {classDetails && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {classDetails.class_type}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {classDetails.date} às {classDetails.time}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    {classDetails.title}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Tatame: {classDetails.notes || 'Tatame 1'} • Assinatura do Professor
                  </p>
                </div>

                {/* Batch Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBatchMark(true)}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Presentes Todos
                  </button>
                  <button
                    onClick={() => handleBatchMark(false)}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Limpar
                  </button>
                </div>
              </div>
            )}

            {/* Attendance List */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 bg-black flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 uppercase tracking-wider">
                  Lista de Chamada ({studentsSheet.length} Alunos)
                </span>
                <span className="text-emerald-400 font-bold">
                  {presentCount} Presentes / {studentsSheet.length - presentCount} Ausentes
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {studentsSheet.map((student) => {
                  const isPresent = student.status === 'present';
                  return (
                    <div
                      key={student.student_id}
                      className={`p-3.5 flex items-center justify-between gap-3 transition ${
                        isPresent ? 'bg-emerald-950/20' : 'hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800 shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{student.name}</h4>
                          <div className="mt-0.5">
                            <BeltBadge belt={student.belt} degrees={student.degrees} size="sm" showLabel={true} />
                          </div>
                        </div>
                      </div>

                      {/* Presence Toggle Action */}
                      <div className="flex items-center gap-2">
                        {isPresent && (
                          <span className="text-[10px] text-emerald-400 font-semibold hidden sm:inline">
                            Assinado {student.signed_by_name ? `por ${student.signed_by_name.split(' ')[0]}` : ''}
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleAttendance(student.student_id, student.status)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                            isPresent
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> Presente
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Ausente
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Student View: Personal Attendance Log */
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase">Total de Presenças Assinadas</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">
                {studentHistory.length} Treinos
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Computadas oficialmente pelos professores no tatame
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-black border-b border-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Histórico Detalhado de Aulas Concluídas
            </div>

            <div className="divide-y divide-slate-800">
              {studentHistory.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  Nenhuma presença registrada ainda.
                </div>
              ) : (
                studentHistory.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-zinc-300">
                          {item.class_type}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400">
                          {item.date} às {item.time}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500">
                        Professor: {item.instructor_name || 'Mestre Carlos'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Presença Confirmada
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {isCreateClassOpen && (
        <Modal
          isOpen={isCreateClassOpen}
          onClose={() => setIsCreateClassOpen(false)}
          title="Agendar Nova Aula / Treino"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nome do Treino / Tema
              </label>
              <input
                type="text"
                required
                value={newClassTitle}
                onChange={(e) => setNewClassTitle(e.target.value)}
                placeholder="Ex: Treino Noturno de Raspagens e Rola"
                className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={newClassDate}
                  onChange={(e) => setNewClassDate(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  required
                  value={newClassTime}
                  onChange={(e) => setNewClassTime(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tipo de Aula
                </label>
                <select
                  value={newClassType}
                  onChange={(e) => setNewClassType(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Gi">Com Kimono (Gi)</option>
                  <option value="No-Gi">Sem Kimono (No-Gi)</option>
                  <option value="Fundamentos">Fundamentos</option>
                  <option value="Avançado">Avançado / Competição</option>
                  <option value="Open Mat">Open Mat / Treino Livre</option>
                  <option value="Defesa Pessoal">Defesa Pessoal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tatame / Local
                </label>
                <input
                  type="text"
                  value={newClassNotes}
                  onChange={(e) => setNewClassNotes(e.target.value)}
                  placeholder="Tatame 1"
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreateClassOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-zinc-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
              >
                Criar Aula
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
