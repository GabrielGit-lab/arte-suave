import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BeltBadge from './BeltBadge';
import AvatarUploadModal from './AvatarUploadModal';
import StudentProfileModal from './StudentProfileModal';
import { LogOut, ShieldAlert, Award, User, RefreshCw, Camera, Crosshair } from 'lucide-react';

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout, login, refreshUser } = useAuth();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleQuickSwitch = async (role) => {
    try {
      if (role === 'professor') {
        await login('professor@artesuave.com', 'senha123');
      } else {
        await login('aluno@artesuave.com', 'senha123');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-[#1f1f28] bg-[#07070a]/95 backdrop-blur-md relative overflow-hidden">
      {/* Top luminous cyber line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b]" />

      <div className="flex items-center justify-between px-3 sm:px-6 h-16">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 text-zinc-400 hover:text-amber-400 rounded hover:bg-zinc-900 border border-transparent hover:border-amber-500/30 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <span className="text-2xl filter drop-shadow inline-block animate-float">🥋</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs sm:text-sm font-bold text-amber-300 tracking-wider uppercase">
                  Arte Suave
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-pixel rounded bg-black text-amber-400 border border-amber-500/60 shadow-[1px_1px_0px_#000]">
                  <span className="text-red-400 font-serif">柔術</span>
                  <span>16-BIT BJJ</span>
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:flex items-center gap-1.5 font-pixel">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                <span className="text-zinc-500">Dojo Digital</span>
                <span className="text-zinc-700">•</span>
                <span className="text-amber-500/90 text-[9px]">押忍 OSS</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Demo Account Switcher (Tactile 16-Bit Arcade style) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-black border border-zinc-800 rounded shadow-[2px_2px_0px_#000]">
          <span className="text-zinc-400 font-pixel text-[10px] flex items-center gap-1 uppercase tracking-wider">
            <RefreshCw className="w-3 h-3 text-amber-400" />
            Perfil Teste:
          </span>
          <button
            onClick={() => handleQuickSwitch('professor')}
            className={`px-2.5 py-1 text-[10px] font-pixel transition border ${
              user?.role === 'professor'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[1px_1px_0px_#78350f]'
                : 'text-zinc-400 hover:text-white bg-zinc-950 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Professor
          </button>
          <button
            onClick={() => handleQuickSwitch('student')}
            className={`px-2.5 py-1 text-[10px] font-pixel transition border ${
              user?.role === 'student'
                ? 'bg-red-700 text-white border-red-500 shadow-[1px_1px_0px_#450a0a]'
                : 'text-zinc-400 hover:text-white bg-zinc-950 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Aluno
          </button>
        </div>

        {/* Right: User Profile & Belt Badge */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              title="Ver meu perfil completo & curiosidades"
              className="flex items-center gap-2.5 sm:gap-3 text-right group cursor-pointer focus:outline-none p-1 sm:p-1.5 rounded hover:bg-zinc-900/60 transition border border-transparent hover:border-amber-500/30"
            >
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[11px] text-zinc-200 group-hover:text-amber-300 transition truncate max-w-[130px]">
                    {user.name}
                  </span>
                  <span className={`text-[9px] font-pixel px-1.5 py-0.5 rounded uppercase border ${
                    user.role === 'professor' 
                      ? 'bg-amber-950/80 text-amber-300 border-amber-600/60 shadow-[1px_1px_0px_#000]' 
                      : 'bg-red-950/80 text-red-300 border-red-700/60 shadow-[1px_1px_0px_#000]'
                  }`}>
                    {user.role === 'professor' ? 'Mestre' : 'Faixa'}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <BeltBadge belt={user.belt} degrees={user.degrees} size="sm" showLabel={true} />
                  <span className={`text-[8px] font-pixel uppercase px-1 py-0.2 rounded border ${
                    user.game_style === 'Passador'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-600/40'
                      : user.game_style === 'Guardeiro'
                      ? 'bg-red-950/80 text-red-400 border-red-700/40'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                  }`}>
                    {user.game_style || 'Guardeiro'}
                  </span>
                </div>
              </div>

              {/* Avatar with Crisp Pixel Border */}
              <div className="relative shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded object-cover border-2 border-amber-500/70 shadow-[2px_2px_0px_#000] group-hover:border-amber-400 transition"
                  />
                ) : (
                  <div className="w-9 h-9 rounded bg-black border-2 border-amber-500/60 shadow-[2px_2px_0px_#000] group-hover:border-amber-400 flex items-center justify-center text-amber-300 font-pixel text-xs transition">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}

                <div className="absolute inset-0 rounded bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                </div>

                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border border-black ${
                  user.role === 'professor' ? 'bg-amber-400' : 'bg-red-600'
                }`} />
              </div>
            </button>

            <button
              onClick={logout}
              title="Sair da conta"
              className="p-2 rounded bg-black text-zinc-400 hover:text-red-400 hover:border-red-800/80 border border-zinc-800 shadow-[1px_1px_0px_#000] transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Avatar Modal */}
      {isAvatarModalOpen && (
        <AvatarUploadModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      )}

      {/* Full Profile & Curiosities Modal */}
      {isProfileModalOpen && user && (
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          studentId={user.id}
          initialTab="curiosities"
          onClose={() => setIsProfileModalOpen(false)}
          onUpdated={refreshUser}
        />
      )}
    </header>
  );
}
