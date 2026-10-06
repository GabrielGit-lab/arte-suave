import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BeltBadge from './BeltBadge';
import AvatarUploadModal from './AvatarUploadModal';
import { LogOut, ShieldAlert, Award, User, RefreshCw, Camera } from 'lucide-react';

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout, login } = useAuth();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

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
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-black/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-2xl filter drop-shadow">🥋</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-base sm:text-lg bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent uppercase">
                  Arte Suave
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-red-950/80 text-red-400 border border-red-700/50 uppercase tracking-widest">
                  BJJ ACADEMY
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block">
                Gestão e Treinamento de Jiu-Jitsu Brasileiro
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 sm:gap-3 text-right">
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200 truncate max-w-[140px]">
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
                <div className="mt-0.5">
                  <BeltBadge belt={user.belt} degrees={user.degrees} size="sm" showLabel={true} />
                </div>
              </div>

              {/* Avatar Clickable */}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Clique para alterar ou remover foto de perfil"
                className="relative group cursor-pointer focus:outline-none"
              >
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

                {/* Hover overlay with camera icon */}
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                </div>

                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${
                  user.role === 'professor' ? 'bg-amber-400' : 'bg-red-600'
                }`} />
              </button>
            </div>

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
    </header>
  );
}
