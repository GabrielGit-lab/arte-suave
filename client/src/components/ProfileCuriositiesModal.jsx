import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Award, 
  Heart, 
  Quote, 
  Check, 
  Edit3, 
  HelpCircle,
  Crosshair,
  Zap
} from 'lucide-react';

const GAME_STYLES = [
  {
    id: 'Guardeiro',
    label: 'Guardeiro',
    icon: '🥋',
    desc: 'Joga por baixo, mestre em raspagens, botes de finalização e defesas sólidas.',
    badgeColor: 'bg-red-950/80 text-red-300 border-red-700/60'
  },
  {
    id: 'Passador',
    label: 'Passador',
    icon: '⚡',
    desc: 'Joga por cima, pressão pesada, passagens toureadas, emborcadas e amassando.',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-600/60'
  },
  {
    id: 'Equilibrado',
    label: 'Completo / Híbrido',
    icon: '⚔️',
    desc: 'Tanto joga raspando por baixo quanto pressiona passando por cima sem preferência.',
    badgeColor: 'bg-zinc-900 text-zinc-300 border-zinc-700'
  }
];

const SUGGESTED_POSITIONS = [
  'Guarda Fechada',
  'Meia Guarda Profunda',
  'Guarda De La Riva',
  'Guarda Aranha (Spider)',
  'Passagem Emborcando',
  'Passagem Toureado',
  'Passagem Leg Drag',
  'Montada Alta',
  'Pegada pelas Costas',
  '100 Kilos / Cruzifixo'
];

const SUGGESTED_SUBMISSIONS = [
  'Triângulo',
  'Armlock da Guarda',
  'Mata-Leão',
  'Kimura',
  'Estrangulamento Cruzado',
  'Ezequiel',
  'Guilhotina',
  'Chave de Pé (Botinha)',
  'Omoplata',
  'Kneebar / Chave de Joelho'
];

export default function ProfileCuriositiesModal({ isOpen, onClose, onUpdated }) {
  const { user, refreshUser } = useAuth();

  const [gameStyle, setGameStyle] = useState(user?.game_style || 'Guardeiro');
  const [favoritePosition, setFavoritePosition] = useState(user?.favorite_position || '');
  const [favoriteSubmission, setFavoriteSubmission] = useState(user?.favorite_submission || '');
  const [idol, setIdol] = useState(user?.idol || '');
  const [bjjMotto, setBjjMotto] = useState(user?.bjj_motto || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/auth/profile-curiosities', {
        game_style: gameStyle,
        favorite_position: favoritePosition,
        favorite_submission: favoriteSubmission,
        idol,
        bjj_motto: bjjMotto
      });

      await refreshUser();
      if (onUpdated) onUpdated();
      setSuccess('Curiosidades do seu jogo salvas com sucesso!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Erro ao salvar curiosidades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Curiosidades do Atleta & Estilo de Luta"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/60 text-red-300 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. Guardeiro vs Passador */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Crosshair className="w-4 h-4" /> Qual é o seu estilo principal no tatame?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {GAME_STYLES.map((st) => {
              const isSelected = gameStyle === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setGameStyle(st.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-zinc-900 to-black border-amber-500 ring-1 ring-amber-500/40 shadow-lg'
                      : 'bg-black hover:bg-zinc-950 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{st.icon}</span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${st.badgeColor}`}>
                      {st.id}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">{st.label}</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Posição Favorita */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" /> Posição Favorita de Domínio
          </label>
          <input
            type="text"
            value={favoritePosition}
            onChange={(e) => setFavoritePosition(e.target.value)}
            placeholder="Ex: Meia Guarda Profunda, Guarda Fechada, Passagem Toureado..."
            className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          {/* Quick pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 pb-0.5 scrollbar-thin">
            {SUGGESTED_POSITIONS.map((pos) => (
              <button
                type="button"
                key={pos}
                onClick={() => setFavoritePosition(pos)}
                className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 whitespace-nowrap transition"
              >
                + {pos}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Finalização Favorita */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-red-400" /> Finalização / Golpe de Assinatura
          </label>
          <input
            type="text"
            value={favoriteSubmission}
            onChange={(e) => setFavoriteSubmission(e.target.value)}
            placeholder="Ex: Triângulo, Armlock voador, Mata-Leão, Chave de Pé..."
            className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          {/* Quick pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 pb-0.5 scrollbar-thin">
            {SUGGESTED_SUBMISSIONS.map((sub) => (
              <button
                type="button"
                key={sub}
                onClick={() => setFavoriteSubmission(sub)}
                className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-300 border border-zinc-800 whitespace-nowrap transition"
              >
                + {sub}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Ídolo / Inspiração & Lema */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> Ídolo / Referência no BJJ
            </label>
            <input
              type="text"
              value={idol}
              onChange={(e) => setIdol(e.target.value)}
              placeholder="Ex: Rickson Gracie, Marcelo Garcia, Leandro Lo..."
              className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1.5">
              <Quote className="w-4 h-4 text-red-400" /> Frase de Tatame / Lema
            </label>
            <input
              type="text"
              value={bjjMotto}
              onChange={(e) => setBjjMotto(e.target.value)}
              placeholder="Ex: A técnica supera a força; o chão é o oceano."
              className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <span>Salvando...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Curiosidades</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
