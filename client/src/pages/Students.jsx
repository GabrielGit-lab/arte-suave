import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BeltBadge from '../components/BeltBadge';
import Modal from '../components/Modal';
import StudentProfileModal from '../components/StudentProfileModal';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  Scale, 
  Award, 
  Clock, 
  Trash2, 
  Edit3, 
  AlertCircle,
  FileText,
  Camera,
  Upload,
  Crosshair,
  Zap,
  Flame,
  Quote,
  Sparkles
} from 'lucide-react';

const BELTS = ['Todas', 'Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];

export default function Students() {
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [beltFilter, setBeltFilter] = useState('Todas');

  // Selected student for full profile modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // New student modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('senha123');
  const [newBelt, setNewBelt] = useState('Branca');
  const [newDegrees, setNewDegrees] = useState(0);
  const [newPhone, setNewPhone] = useState('');
  const [newBirthdate, setNewBirthdate] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newEmergency, setNewEmergency] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [beltFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (beltFilter !== 'Todas') params.append('belt', beltFilter);
      if (search.trim()) params.append('search', search.trim());

      const data = await api.get(`/students?${params.toString()}`);
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const openStudentProfile = (s) => {
    setSelectedStudent(s);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await api.post('/auth/register', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: 'student',
        belt: newBelt,
        degrees: parseInt(newDegrees, 10),
        phone: newPhone,
        birthdate: newBirthdate,
        weight: newWeight ? parseFloat(newWeight) : null,
        height: newHeight ? parseFloat(newHeight) : null,
        emergency_contact: newEmergency,
      });

      setIsAddOpen(false);
      // Reset
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewWeight('');
      setNewHeight('');
      setNewEmergency('');
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar aluno');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteStudent = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Tem certeza que deseja remover o aluno ${name}?`)) return;
    try {
      await api.delete(`/students/${id}`);
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
        setStudentDetails(null);
      }
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Erro ao remover aluno');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-700/50">
              Quadro de Alunos
            </span>
            <span className="text-zinc-500 text-xs">• Perfis, Histórico e Contatos</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Cadastro e Perfis dos Alunos
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Consulte peso, altura, faixa atual, histórico de treinos e graduações de cada atleta.
          </p>
        </div>

        {isProfessor && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-md transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Matricular Novo Aluno
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail do aluno..."
              className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-200 text-xs font-bold rounded-lg transition"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs text-zinc-500 font-semibold mr-1">Filtrar Faixa:</span>
          {BELTS.map((b) => (
            <button
              key={b}
              onClick={() => setBeltFilter(b)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                beltFilter === b
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-black text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Students List Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-zinc-200">Nenhum aluno encontrado</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => openStudentProfile(student)}
              className="p-4 rounded-xl bg-zinc-950 hover:bg-slate-850 border border-zinc-800 hover:border-blue-500/40 transition cursor-pointer shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{student.name}</h4>
                      <p className="text-[11px] text-zinc-400">{student.email}</p>
                    </div>
                  </div>

                  {isProfessor && (
                    <button
                      onClick={(e) => handleDeleteStudent(student.id, student.name, e)}
                      title="Excluir Aluno"
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="my-2">
                  <BeltBadge belt={student.belt} degrees={student.degrees} size="md" showLabel={true} />
                </div>

                {student.is_eligible_for_promotion && (
                  <div className="mt-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    Elegível para próximo grau / faixa!
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-lg bg-black border border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Estilo no Tatame:</span>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-black uppercase border ${
                      student.game_style === 'Passador'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                        : student.game_style === 'Guardeiro'
                        ? 'bg-red-950/80 text-red-300 border-red-700/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {student.game_style || 'Guardeiro'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Presenças:</span>
                    <span className="font-bold text-emerald-400">{student.total_attendances || 0} treinos</span>
                  </div>
                  {student.favorite_position && (
                    <div className="col-span-2 pt-1 border-t border-zinc-900 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 text-[10px]">Posição:</span>
                      <span className="text-amber-400 font-semibold truncate max-w-[150px]">{student.favorite_position}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Início: {student.academy_join_date || '2025'}</span>
                <span className="text-amber-400 font-bold hover:underline">Ver Dossiê Completo →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Dossier Modal with dedicated Curiosities Tab */}
      {selectedStudent && (
        <StudentProfileModal
          isOpen={!!selectedStudent}
          studentId={selectedStudent.id}
          initialTab="curiosities"
          onClose={() => setSelectedStudent(null)}
          onUpdated={fetchStudents}
        />
      )}

      {/* Professor Add Student Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Matricular Novo Aluno no Tatame"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nome Completo do Aluno
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Leandro Lo da Silva"
                className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="aluno@artesuave.com"
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Senha Provisória
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Faixa Inicial
                </label>
                <select
                  value={newBelt}
                  onChange={(e) => setNewBelt(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {BELTS.filter((b) => b !== 'Todas').map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Graus (0 a 4)
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={newDegrees}
                  onChange={(e) => setNewDegrees(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Peso Inicial (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Ex: 77.5"
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  placeholder="Ex: 178"
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="(11) 98888-7777"
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={newBirthdate}
                  onChange={(e) => setNewBirthdate(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Contato de Emergência
              </label>
              <input
                type="text"
                value={newEmergency}
                onChange={(e) => setNewEmergency(e.target.value)}
                placeholder="Ex: Esposa: Ana (11) 99999-0000"
                className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-zinc-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {addLoading ? 'Cadastrando...' : 'Concluir Matrícula'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
