import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BeltBadge from './BeltBadge';
import AvatarUploadModal from './AvatarUploadModal';
import StudentProfileModal from './StudentProfileModal';
import { LogOut, ShieldAlert, Award, User, RefreshCw, Camera, Crosshair } from 'lucide-react';

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout, login } = useAuth();
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
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/25 bg-[#07070a]/95 backdrop-blur-md relative overflow-hidden">
      {/* Top luminous cyber line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_#f59e0b]" />

      <div className="flex items-center justify-between px-3 sm:px-6 h-16">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 text-zinc-400 hover:text-amber-400 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-amber-500/30 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative group">
              <span className="text-2xl filter drop-shadow inline-block animate-float">🥋</span>
              <div className="absolute -inset-1 rounded-full bg-amber-500/20 blur-xs -z-10 group-hover:bg-amber-500/40 transition" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-base sm:text-lg bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent uppercase">
                  Arte Suave
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black rounded-sm bg-gradient-to-r from-red-950 to-zinc-950 text-red-300 border border-red-700/60 uppercase tracking-widest shadow-[0_0_8px_rgba(239,68,68,0.25)]">
                  <span>柔術</span>
                  <span className="text-amber-400">CYBER BJJ</span>
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                <span>Gestão & Dojo Digital</span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400/90 font-mono text-[9px]">押忍 OSS</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Demo Account Switcher */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-zinc-950/90 border border-amber-500/25 rounded-full text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            Alternar perfil de teste:
          </span>
          <button
            onClick={() => handleQuickSwitch('professor')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
              user?.role === 'professor'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Mestre Carlos (Professor)
          </button>
          <button
            onClick={() => handleQuickSwitch('student')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
              user?.role === 'student'
                ? 'bg-red-700 text-white shadow-sm font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Gabriel Rocha (Aluno)
          </button>
        </div>

        {/* Right: User Profile & Belt Badge */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              title="Ver meu perfil completo & curiosidades"
              className="flex items-center gap-2 sm:gap-3 text-right group cursor-pointer focus:outline-none p-1 sm:p-1.5 rounded-xl hover:bg-zinc-900/80 transition border border-transparent hover:border-amber-500/30"
            >
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 transition truncate max-w-[140px]">
                    {user.name}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    user.role === 'professor' 
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60' 
                      : 'bg-red-950 text-red-300 border border-red-800/60'
                  }`}>
                    {user.role === 'professor' ? 'Professor' : 'Aluno'}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <BeltBadge belt={user.belt} degrees={user.degrees} size="sm" showLabel={true} />
                  <span className={`text-[9px] font-black uppercase px-1 py-0.2 rounded border ${
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

              {/* Avatar Clickable */}
              <div className="relative shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/50 group-hover:ring-amber-400 transition"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-zinc-900 ring-2 ring-amber-500/40 group-hover:ring-amber-400 flex items-center justify-center text-zinc-300 font-bold text-sm transition">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}

                {/* Hover overlay with crosshair/edit icon */}
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                </div>

                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${
                  user.role === 'professor' ? 'bg-amber-400' : 'bg-red-600'
                }`} />
              </div>
            </button>

            <button
              onClick={logout}
              title="Sair da conta"
              className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition"
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
        />
      )}
    </header>
  );
}
