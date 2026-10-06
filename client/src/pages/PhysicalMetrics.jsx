import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { 
  Scale, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Calendar, 
  Trash2, 
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const IBJJF_MALE_GI = [
  { name: 'Galo', max: 57.5 },
  { name: 'Pluma', max: 64.0 },
  { name: 'Pena', max: 70.0 },
  { name: 'Leve', max: 76.0 },
  { name: 'Médio', max: 82.3 },
  { name: 'Meio-Pesado', max: 88.3 },
  { name: 'Pesado', max: 94.3 },
  { name: 'Super Pesado', max: 100.5 },
  { name: 'Pesadíssimo', max: 999 },
];

export default function PhysicalMetrics() {
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(user?.id);
  const [physicalData, setPhysicalData] = useState({ latest: null, history: [] });
  const [loading, setLoading] = useState(true);

  // New weigh-in modal
  const [isOpen, setIsOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newWingspan, setNewWingspan] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isProfessor) {
      api.get('/students').then((data) => {
        setStudents(data);
        if (data.length > 0 && !selectedStudentId) {
          setSelectedStudentId(data[0].id);
        }
      });
    }
  }, [isProfessor]);

  useEffect(() => {
    const targetId = isProfessor ? selectedStudentId : user?.id;
    if (targetId) {
      fetchPhysical(targetId);
    }
  }, [selectedStudentId, user]);

  const fetchPhysical = async (studentId) => {
    setLoading(true);
    try {
      const data = await api.get(`/physical/student/${studentId}`);
      setPhysicalData(data);
      if (data.latest) {
        if (data.latest.height) setNewHeight(data.latest.height);
        if (data.latest.wingspan) setNewWingspan(data.latest.wingspan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const targetId = isProfessor ? selectedStudentId : user?.id;

    try {
      await api.post('/physical', {
        student_id: targetId,
        weight: parseFloat(newWeight),
        height: newHeight ? parseFloat(newHeight) : null,
        wingspan: newWingspan ? parseFloat(newWingspan) : null,
        body_fat: newBodyFat ? parseFloat(newBodyFat) : null,
        notes: newNotes,
        recorded_at: newDate,
      });

      setIsOpen(false);
      setNewWeight('');
      setNewNotes('');
      fetchPhysical(targetId);
    } catch (err) {
      alert(err.message || 'Erro ao registrar pesagem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Excluir este registro de pesagem?')) return;
    try {
      await api.delete(`/physical/${id}`);
      const targetId = isProfessor ? selectedStudentId : user?.id;
      fetchPhysical(targetId);
    } catch (err) {
      alert(err.message || 'Erro ao excluir');
    }
  };

  const latest = physicalData.latest;
  const history = physicalData.history || [];

  // Evolution stats
  const firstRecord = history.length > 0 ? history[0] : null;
  const weightChange = (latest && firstRecord && history.length > 1) 
    ? +(latest.weight - firstRecord.weight).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Acompanhamento Biométrico
            </span>
            <span className="text-slate-500 text-xs">• Categorias de Peso IBJJF / CBJJ</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-400" />
            Dados Físicos e Evolução de Peso
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de pesagem para campeonatos oficiais, cálculo de IMC e índice de envergadura.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Registrar Nova Pesagem
        </button>
      </div>

      {/* Professor student picker */}
      {isProfessor && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <label className="text-xs font-bold text-slate-300 whitespace-nowrap">
            Selecionar Atleta:
          </label>
          <select
            value={selectedStudentId || ''}
            onChange={(e) => setSelectedStudentId(parseInt(e.target.value, 10))}
            className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 flex-1 max-w-xs"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.belt} - {s.degrees}º)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Top Biometric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Weight */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Peso Atual</span>
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-3xl font-black text-white">
            {latest ? `${latest.weight} kg` : 'Sem dados'}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] mt-1 font-semibold">
            {weightChange !== 0 ? (
              weightChange < 0 ? (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" /> {weightChange} kg desde o início
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +{weightChange} kg desde o início
                </span>
              )
            ) : (
              <span className="text-slate-500">Primeira pesagem registrada</span>
            )}
          </div>
        </div>

        {/* CBJJ / IBJJF Category */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Categoria CBJJ / IBJJF</span>
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-black text-amber-300">
            {latest?.category_ibjjf || 'Não definido'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Adulto Gi (Com Kimono)
          </p>
        </div>

        {/* BMI & Height */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Índice IMC</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-white">
            {latest?.bmi_info ? `${latest.bmi_info.bmi}` : 'N/A'}
          </h3>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
            {latest?.bmi_info?.status || 'Cadastre peso e altura'}
          </p>
        </div>

        {/* Envergadura & Altura */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Estrutura Corporal</span>
            <Info className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {latest?.height ? `${latest.height} cm` : 'Alt. --'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Envergadura: <strong className="text-purple-300">{latest?.wingspan ? `${latest.wingspan} cm` : 'Não informada'}</strong>
          </p>
        </div>
      </div>

      {/* Official CBJJ Weight Divisions Chart Reference */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          Tabela Oficial de Categorias de Peso CBJJ (Masculino Adulto Gi)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {IBJJF_MALE_GI.map((cat) => {
            const isCurrent = latest && (
              cat.name === 'Pesadíssimo' ? latest.weight > 100.5 :
              (latest.weight <= cat.max && (cat.name === 'Galo' || latest.weight > (IBJJF_MALE_GI[IBJJF_MALE_GI.indexOf(cat) - 1]?.max || 0)))
            );

            return (
              <div
                key={cat.name}
                className={`p-2.5 rounded-lg border text-center transition ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold ring-1 ring-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate-400">Peso {cat.name}</div>
                <div className="text-xs font-black mt-0.5 text-white">
                  {cat.max === 999 ? '+100.5 kg' : `até ${cat.max} kg`}
                </div>
                {isCurrent && (
                  <span className="text-[9px] text-amber-400 font-bold block mt-1 uppercase">Sua Categoria</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
          <span>Histórico de Pesagens ({history.length} Registros)</span>
        </div>

        <div className="divide-y divide-slate-800">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhuma pesagem cadastrada ainda.
            </div>
          ) : (
            history.map((record) => (
              <div key={record.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-850">
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="font-semibold text-slate-400 w-24">
                    {record.recorded_at}
                  </div>
                  <div>
                    <span className="font-black text-amber-400 text-sm">{record.weight} kg</span>
                    <span className="text-[11px] text-slate-400 ml-2">({record.category_ibjjf})</span>
                  </div>
                  {record.notes && (
                    <span className="text-slate-400 italic text-[11px] hidden md:inline">
                      "{record.notes}"
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {record.bmi_info && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-400 font-bold hidden sm:inline">
                      IMC: {record.bmi_info.bmi} ({record.bmi_info.status})
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    title="Excluir pesagem"
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Weigh-in Modal */}
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Lançar Nova Pesagem"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Peso (em kg) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Ex: 77.8"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  placeholder="178"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Envergadura (cm)
                </label>
                <input
                  type="number"
                  value={newWingspan}
                  onChange={(e) => setNewWingspan(e.target.value)}
                  placeholder="182"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  % Gordura (Opcional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newBodyFat}
                  onChange={(e) => setNewBodyFat(e.target.value)}
                  placeholder="15.5"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data da Pesagem
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anotações
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Ex: Em jejum, pré-campeonato"
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : 'Salvar Pesagem'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
