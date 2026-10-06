import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Play, 
  Star, 
  CheckCircle2, 
  Target, 
  Plus, 
  Trash2, 
  Eye, 
  Video, 
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'Todas',
  'Finalizações',
  'Guardas',
  'Passagens de Guarda',
  'Raspagens',
  'Quedas e Projeções',
  'Defesas e Saídas'
];

const DIFFICULTIES = ['Todos', 'Iniciante', 'Intermediário', 'Avançado'];
const GI_TYPES = ['Todos', 'Gi', 'No-Gi', 'Ambos'];

export default function Tutorials() {
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [selectedGiType, setSelectedGiType] = useState('Todos');
  const [bookmarkFilter, setBookmarkFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create tutorial modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Finalizações');
  const [newDifficulty, setNewDifficulty] = useState('Iniciante');
  const [newGiType, setNewGiType] = useState('Ambos');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSteps, setNewSteps] = useState([
    { step: 1, title: 'Postura e pegadas iniciais', desc: '' },
    { step: 2, title: 'Transição e quebra de postura', desc: '' },
    { step: 3, title: 'Ajuste fino da alavanca e finalização', desc: '' }
  ]);
  const [newKeyPoints, setNewKeyPoints] = useState('');
  const [newCounterAttacks, setNewCounterAttacks] = useState('');

  useEffect(() => {
    fetchTutorials();
  }, [selectedCategory, selectedDifficulty, selectedGiType, bookmarkFilter]);

  const fetchTutorials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'Todas') params.append('category', selectedCategory);
      if (selectedDifficulty !== 'Todos') params.append('difficulty', selectedDifficulty);
      if (selectedGiType !== 'Todos') params.append('gi_type', selectedGiType);
      if (bookmarkFilter !== 'all') params.append('bookmark', bookmarkFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const data = await api.get(`/tutorials?${params.toString()}`);
      setTutorials(data);
    } catch (err) {
      console.error('Erro ao buscar tutoriais:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTutorials();
  };

  const handleToggleBookmark = async (tutorialId, status, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/tutorials/${tutorialId}/bookmark`, { status });
      // Update local state
      setTutorials((prev) =>
        prev.map((tut) => {
          if (tut.id === tutorialId) {
            if (status === 'favorite') return { ...tut, is_favorite: !tut.is_favorite };
            if (status === 'practiced') return { ...tut, is_practiced: !tut.is_practiced };
            if (status === 'to_master') return { ...tut, is_to_master: !tut.is_to_master };
          }
          return tut;
        })
      );
      if (selectedTutorial && selectedTutorial.id === tutorialId) {
        setSelectedTutorial((prev) => {
          if (status === 'favorite') return { ...prev, is_favorite: !prev.is_favorite };
          if (status === 'practiced') return { ...prev, is_practiced: !prev.is_practiced };
          if (status === 'to_master') return { ...prev, is_to_master: !prev.is_to_master };
          return prev;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStep = () => {
    setNewSteps((prev) => [
      ...prev,
      { step: prev.length + 1, title: `Passo ${prev.length + 1}`, desc: '' }
    ]);
  };

  const handleUpdateStep = (index, field, value) => {
    setNewSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveStep = (index) => {
    if (newSteps.length <= 1) return;
    setNewSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateTutorial = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const keysArray = newKeyPoints
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean);

      await api.post('/tutorials', {
        title: newTitle,
        category: newCategory,
        difficulty: newDifficulty,
        gi_type: newGiType,
        video_url: newVideoUrl,
        image_url: newImageUrl,
        description: newDesc,
        steps: newSteps,
        key_points: keysArray,
        counter_attacks: newCounterAttacks,
      });

      setIsCreateOpen(false);
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewVideoUrl('');
      setNewImageUrl('');
      setNewKeyPoints('');
      setNewCounterAttacks('');
      fetchTutorials();
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar tutorial');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTutorial = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir este tutorial?')) return;
    try {
      await api.delete(`/tutorials/${id}`);
      if (selectedTutorial?.id === id) setSelectedTutorial(null);
      fetchTutorials();
    } catch (err) {
      alert(err.message || 'Erro ao excluir');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Biblioteca Técnica
            </span>
            <span className="text-zinc-500 text-xs">• Passo a Passo & Vídeos</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            Posições e Técnicas de Jiu-Jitsu
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Estude a mecânica, pegadas, alavancas e contra-ataques de cada posição do tatame.
          </p>
        </div>

        {isProfessor && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nova Posição / Tutorial
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por golpe, alavanca ou guarda (ex: Armlock, De La Riva, Kimura...)"
              className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </form>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>Nível: {d}</option>
              ))}
            </select>

            <select
              value={selectedGiType}
              onChange={(e) => setSelectedGiType(e.target.value)}
              className="px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
            >
              {GI_TYPES.map((g) => (
                <option key={g} value={g}>Estilo: {g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-black text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* User Bookmarks Toggle */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 text-xs">
          <span className="text-zinc-500 font-medium">Marcadores do Aluno:</span>
          <button
            onClick={() => setBookmarkFilter('all')}
            className={`px-2.5 py-1 rounded-md transition ${bookmarkFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setBookmarkFilter('favorite')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${bookmarkFilter === 'favorite' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-zinc-400 hover:text-white'}`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Favoritos
          </button>
          <button
            onClick={() => setBookmarkFilter('practiced')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${bookmarkFilter === 'practiced' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-zinc-400 hover:text-white'}`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Já Pratiquei
          </button>
          <button
            onClick={() => setBookmarkFilter('to_master')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${bookmarkFilter === 'to_master' ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30' : 'text-zinc-400 hover:text-white'}`}
          >
            <Target className="w-3 h-3 text-amber-400" /> Quero Dominar
          </button>
        </div>
      </div>

      {/* Tutorials Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : tutorials.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-zinc-200">Nenhuma posição encontrada</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Tente mudar os filtros de categoria ou busque por outro termo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tutorials.map((tut) => (
            <div
              key={tut.id}
              onClick={() => setSelectedTutorial(tut)}
              className="group cursor-pointer rounded-2xl bg-zinc-950 hover:bg-slate-850 border border-zinc-800 hover:border-amber-500/40 transition-all shadow-md overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image / Video preview container */}
                <div className="relative h-44 w-full bg-black overflow-hidden">
                  <img
                    src={tut.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'}
                    alt={tut.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/90 text-slate-950 shadow">
                      {tut.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-950/90 text-zinc-200 border border-zinc-700/80 shadow">
                      {tut.gi_type}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      onClick={(e) => handleToggleBookmark(tut.id, 'favorite', e)}
                      title="Salvar nos favoritos"
                      className={`p-1.5 rounded-lg backdrop-blur-md transition ${
                        tut.is_favorite ? 'bg-amber-500 text-slate-950' : 'bg-black/50 text-white/80 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${tut.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                    {isProfessor && (
                      <button
                        onClick={(e) => handleDeleteTutorial(tut.id, e)}
                        title="Excluir posição"
                        className="p-1.5 rounded-lg bg-black/50 text-red-400 hover:text-red-300 hover:bg-red-950/80 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Video Play Indicator */}
                  {tut.video_url && (
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-amber-300 font-semibold border border-amber-500/30">
                      <Play className="w-3 h-3 fill-amber-400 text-amber-400" /> Vídeo Explicativo
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className={`font-semibold ${
                      tut.difficulty === 'Iniciante' ? 'text-emerald-400' :
                      tut.difficulty === 'Intermediário' ? 'text-amber-400' : 'text-purple-400'
                    }`}>
                      Nível {tut.difficulty}
                    </span>
                    <span>{tut.steps?.length || 0} passos explicados</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                    {tut.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {tut.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-0 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span className="truncate max-w-[150px]">
                  Instrutor: {tut.instructor_name || 'Mestre Carlos'}
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Ver técnica <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tutorial Details Modal */}
      {selectedTutorial && (
        <Modal
          isOpen={!!selectedTutorial}
          onClose={() => setSelectedTutorial(null)}
          title={selectedTutorial.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Video or Image View */}
            <div className="rounded-xl overflow-hidden bg-black border border-zinc-800">
              {selectedTutorial.video_url ? (
                <div className="relative aspect-video w-full">
                  <iframe
                    src={selectedTutorial.video_url}
                    title={selectedTutorial.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="h-64 w-full">
                  <img
                    src={selectedTutorial.image_url}
                    alt={selectedTutorial.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Badges & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-black border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedTutorial.category}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedTutorial.gi_type}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-slate-800 text-zinc-300">
                  Nível {selectedTutorial.difficulty}
                </span>
              </div>

              {/* Bookmark Toggle Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleBookmark(selectedTutorial.id, 'practiced')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    selectedTutorial.is_practiced
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedTutorial.is_practiced ? 'Praticado no Tatame' : 'Marcar como Praticado'}
                </button>

                <button
                  onClick={() => handleToggleBookmark(selectedTutorial.id, 'favorite')}
                  className={`p-2 rounded-lg text-xs transition ${
                    selectedTutorial.is_favorite
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                  title="Favoritar"
                >
                  <Star className={`w-4 h-4 ${selectedTutorial.is_favorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* General Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Visão Geral do Golpe
              </h4>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {selectedTutorial.description}
              </p>
            </div>

            {/* Step-by-Step Breakdown */}
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Passo a Passo Detalhado
              </h4>
              <div className="space-y-3">
                {selectedTutorial.steps?.map((stepObj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-black/80 border border-zinc-800 flex items-start gap-3.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs shrink-0">
                      {stepObj.step || idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-zinc-200">
                        {stepObj.title}
                      </h5>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {stepObj.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Leverage Points / Tips */}
            {selectedTutorial.key_points && selectedTutorial.key_points.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/40">
                <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Dicas de Ouro & Detalhes de Alavanca
                </h5>
                <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
                  {selectedTutorial.key_points.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Counter Attacks */}
            {selectedTutorial.counter_attacks && (
              <div className="p-4 rounded-xl bg-black border border-zinc-800">
                <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Como Defender / Contra-Ataques
                </h5>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {selectedTutorial.counter_attacks}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Professor Create Tutorial Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Cadastrar Nova Posição de Jiu-Jitsu"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateTutorial} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nome da Técnica / Posição
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Raspagem De La Riva com Chave de Pé"
                className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Categoria
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {CATEGORIES.filter((c) => c !== 'Todas').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Dificuldade
                </label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Kimono
                </label>
                <select
                  value={newGiType}
                  onChange={(e) => setNewGiType(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Ambos">Ambos (Gi & No-Gi)</option>
                  <option value="Gi">Com Kimono (Gi)</option>
                  <option value="No-Gi">Sem Kimono (No-Gi)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL do Vídeo (YouTube embed ou MP4)
                </label>
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL da Imagem / Foto Ilustrativa
                </label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Descrição Geral
              </label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Explique o objetivo da técnica e em quais cenários aplicá-la..."
                className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Dynamic Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-200">
                  Etapas do Passo a Passo ({newSteps.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  + Adicionar Passo
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {newSteps.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-black border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400">Passo {idx + 1}</span>
                      {newSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Título do passo (ex: Pegada na gola e manga)"
                      value={s.title}
                      onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                      className="w-full p-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Descrição detalhada do movimento..."
                      value={s.desc}
                      onChange={(e) => handleUpdateStep(idx, 'desc', e.target.value)}
                      className="w-full p-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Dicas de Ouro e Alavanca (uma por linha)
              </label>
              <textarea
                rows={2}
                value={newKeyPoints}
                onChange={(e) => setNewKeyPoints(e.target.value)}
                placeholder="Ex: Manter os joelhos pressionados para impedir fuga de quadril"
                className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Defesas e Contra-Ataques
              </label>
              <input
                type="text"
                value={newCounterAttacks}
                onChange={(e) => setNewCounterAttacks(e.target.value)}
                placeholder="Ex: Fuga de quadril no tempo do giro ou esmagamento na base"
                className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-zinc-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
              >
                {createLoading ? 'Salvando...' : 'Salvar Posição'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
