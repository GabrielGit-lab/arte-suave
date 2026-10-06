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
  X,
  Award,
  Flame,
  ShieldCheck,
  UserX
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
  const [searchStudent, setSearchStudent] = useState('');

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
        notes: newStatus === 'present' ? 'Presença confirmada no tatame' : ''
      });
      // Refresh count on class list
      fetchClasses();
    } catch (err) {
      console.error(err);
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

      setMessage(markAll ? 'Todos os alunos foram marcados com presença confirmada!' : 'Chamada da aula limpa com sucesso.');
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

  const filteredStudents = studentsSheet.filter((s) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.belt.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const presentCount = studentsSheet.filter((s) => s.status === 'present').length;
  const absentCount = studentsSheet.length - presentCount;

  return (
    <div className="space-y-6">
      {/* Header Banner - Black / Gold / Red theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-zinc-950 to-neutral-900 border border-amber-500/30 p-6 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-red-950/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-700/50">
                Livro Oficial de Tatame
              </span>
              <span className="text-amber-400/80 text-xs font-semibold">• Validação de Frequência & Graus</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <ClipboardCheck className="w-7 h-7 text-amber-400" />
              {isProfessor ? 'Chamada e Assinatura de Treinos' : 'Meu Histórico de Presenças'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              {isProfessor
                ? 'Assine as presenças de cada guerreiro no tatame para validar o tempo mínimo e requisitos de graduação da CBJJ.'
                : 'Acompanhe todos os treinos oficiais em que sua presença foi assinada pelo professor.'}
            </p>
          </div>

          {isProfessor && (
            <button
              onClick={() => setIsCreateClassOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Agendar Nova Aula
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/60 via-zinc-950 to-black border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 shadow-md">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Layout */}
      {isProfessor ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Classes Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Cronograma de Aulas ({classes.length})
            </h3>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {classes.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-black border border-zinc-800 text-zinc-500 text-xs">
                  Nenhuma aula cadastrada ainda.
                </div>
              ) : (
                classes.map((c) => {
                  const isSelected = selectedClassId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectClass(c.id)}
                      className={`p-3.5 rounded-xl cursor-pointer border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-amber-500 shadow-xl ring-1 ring-amber-500/30'
                          : 'bg-black/90 hover:bg-zinc-950 border-zinc-800 hover:border-amber-500/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-semibold text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {c.date} • {c.time}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-950 text-red-300 border border-red-700/50">
                            {c.class_type}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">{c.title}</h4>
                      </div>

                      <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-zinc-800/80">
                        <span className="text-zinc-500 text-[10px]">{c.instructor_name || 'Mestre Carlos'}</span>
                        <span className="text-amber-400 font-black">
                          {c.present_count || 0} confirmados
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
              <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-950 to-black border border-amber-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-700/50">
                      {classDetails.class_type}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {classDetails.date} às {classDetails.time}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">
                    {classDetails.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tatame: <strong className="text-zinc-200">{classDetails.notes || 'Tatame Principal'}</strong> • Assinatura Oficial do Mestre
                  </p>
                </div>

                {/* Batch Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleBatchMark(true)}
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 text-red-400" /> Assinar Todos
                  </button>
                  <button
                    onClick={() => handleBatchMark(false)}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" /> Limpar
                  </button>
                </div>
              </div>
            )}

            {/* Attendance List */}
            <div className="bg-black border border-amber-500/25 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header stats & search */}
              <div className="p-3.5 border-b border-zinc-800 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Lista de Chamada ({studentsSheet.length} Atletas)
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded font-black bg-red-950 text-red-300 border border-red-800/40">
                      {presentCount} Presentes
                    </span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {absentCount} Ausentes
                    </span>
                  </div>
                </div>

                {/* Quick search input */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="Filtrar aluno ou faixa..."
                    className="w-full pl-8 pr-2.5 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Student Rows */}
              <div className="divide-y divide-zinc-900 max-h-[500px] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    Nenhum aluno encontrado com este filtro.
                  </div>
                ) : (
                  filteredStudents.map((student) => {
                    const isPresent = student.status === 'present';
                    return (
                      <div
                        key={student.student_id}
                        className={`p-3.5 flex items-center justify-between gap-3 transition ${
                          isPresent
                            ? 'bg-gradient-to-r from-red-950/30 via-black to-zinc-950/40'
                            : 'hover:bg-zinc-950/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                            alt={student.name}
                            className={`w-10 h-10 rounded-full object-cover shrink-0 ring-2 ${
                              isPresent ? 'ring-amber-500/60 shadow-md' : 'ring-zinc-800'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{student.name}</h4>
                              {isPresent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-red-950/90 text-red-300 border border-red-700/50">
                                  Confirmado
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5">
                              <BeltBadge belt={student.belt} degrees={student.degrees} size="sm" showLabel={true} />
                            </div>
                          </div>
                        </div>

                        {/* Presence Toggle Action */}
                        <div className="flex items-center gap-2.5">
                          {isPresent && (
                            <span className="text-[10px] text-zinc-400 font-semibold hidden sm:inline">
                              Assinado {student.signed_by_name ? `por ${student.signed_by_name.split(' ')[0]}` : ''}
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleAttendance(student.student_id, student.status)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md ${
                              isPresent
                                ? 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white border border-red-500/60'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            {isPresent ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>Presente</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Ausente</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Student View: Personal Attendance Log */
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-black via-zinc-950 to-neutral-900 border border-amber-500/30 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Total de Presenças Assinadas no Tatame
              </p>
              <h3 className="text-4xl font-black text-white mt-1">
                {studentHistory.length} <span className="text-lg font-bold text-zinc-400">Treinos Oficiais</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Assinados e validados pelos professores e mestres responsáveis.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-700/50 text-red-400 shadow-lg">
              <FileCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-black border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-zinc-950/90 border-b border-zinc-800 text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Histórico Detalhado de Aulas Concluídas
            </div>

            <div className="divide-y divide-zinc-900">
              {studentHistory.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  Nenhuma presença registrada ainda. Compareça ao tatame para assinar seu treino!
                </div>
              ) : (
                studentHistory.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-zinc-950/40 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-700/50">
                          {item.class_type}
                        </span>
                        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {item.date} às {item.time}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500">
                        Professor: {item.instructor_name || 'Mestre Carlos'} • Tatame 1
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-700/50 text-xs font-bold shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                      Presença Assinada
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
          title="Agendar Nova Aula no Cronograma"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Nome do Treino / Tema
              </label>
              <input
                type="text"
                required
                value={newClassTitle}
                onChange={(e) => setNewClassTitle(e.target.value)}
                placeholder="Ex: Treino Noturno de Raspagens e Rola"
                className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={newClassDate}
                  onChange={(e) => setNewClassDate(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  required
                  value={newClassTime}
                  onChange={(e) => setNewClassTime(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Tipo de Aula
                </label>
                <select
                  value={newClassType}
                  onChange={(e) => setNewClassType(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
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
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Tatame / Local
                </label>
                <input
                  type="text"
                  value={newClassNotes}
                  onChange={(e) => setNewClassNotes(e.target.value)}
                  placeholder="Tatame Principal"
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreateClassOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black transition shadow-md"
              >
                Agendar Treino
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
