import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardCheck, 
  Users, 
  Award, 
  Scale, 
  BarChart3,
  UserCheck,
  ShieldCheck,
  FileText,
  Trophy,
  GitFork,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { user, login } = useAuth();
  const isProfessor = user?.role === 'professor';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      kanji: '主',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'lineage',
      label: 'Árvore Genealógica',
      kanji: '系',
      icon: GitFork,
      badge: 'Linhagens'
    },
    {
      id: 'tutorials',
      label: 'Biblioteca de Posições',
      kanji: '技',
      icon: BookOpen,
      badge: 'Técnicas'
    },
    {
      id: 'attendance',
      label: 'Controle de Presença',
      kanji: '席',
      icon: ClipboardCheck,
      badge: isProfessor ? 'Chamada' : 'Aulas'
    },
    {
      id: 'students',
      label: isProfessor ? 'Cadastro de Alunos' : 'Comunidade / Perfil',
      kanji: '門',
      icon: Users,
      badge: null
    },
    {
      id: 'graduations',
      label: 'Gestão de Graduação',
      kanji: '段',
      icon: Award,
      badge: 'CBJJ'
    },
    {
      id: 'physical',
      label: 'Dados Físicos & Peso',
      kanji: '体',
      icon: Scale,
      badge: 'IBJJF'
    },
    {
      id: 'reports',
      label: 'Relatórios & Métricas',
      kanji: '計',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'tournaments',
      label: 'Federações & Eventos',
      kanji: '合',
      icon: Trophy,
      badge: 'Chaves'
    },
    {
      id: 'rules',
      label: 'Manual de Regras CBJJ',
      kanji: '規',
      icon: FileText,
      badge: 'Regras'
    },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 md:top-16 left-0 z-50 md:z-40
        w-72 max-w-[85vw] md:w-64 h-full md:h-[calc(100vh-4rem)]
        bg-[#09090d] border-r-2 border-[#1f1f28]
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        flex flex-col justify-between p-3.5 overflow-y-auto
      `}>
        <div className="space-y-1.5">
          {/* Mobile drawer header */}
          <div className="flex md:hidden items-center justify-between px-3 py-2 border-b-2 border-zinc-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥋</span>
              <span className="font-pixel text-amber-300 text-xs uppercase tracking-wider">Arte Suave</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-amber-500/30 transition"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Demo Switcher on mobile inside sidebar */}
          <div className="lg:hidden p-3 rounded bg-black border border-amber-500/30 mb-3 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400 font-pixel text-[10px] mb-2 uppercase tracking-wider">
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>Modo de Teste:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  login('professor@artesuave.com', 'senha123');
                  setMobileOpen(false);
                }}
                className={`px-2 py-2 text-[10px] font-pixel transition text-center border ${
                  user?.role === 'professor'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[1px_1px_0px_#000]'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                Professor
              </button>
              <button
                type="button"
                onClick={() => {
                  login('aluno@artesuave.com', 'senha123');
                  setMobileOpen(false);
                }}
                className={`px-2 py-2 text-[10px] font-pixel transition text-center border ${
                  user?.role === 'student'
                    ? 'bg-red-700 text-white border-red-500 shadow-[1px_1px_0px_#000]'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                Aluno
              </button>
            </div>
          </div>

          {/* Section Header */}
          <div className="px-2.5 py-1 text-[10px] font-pixel uppercase tracking-widest text-zinc-500 flex items-center justify-between">
            <span>// Menu Dojo</span>
            <span className="text-amber-500/60 text-[9px]">16-BIT</span>
          </div>

          {/* Clean Menu Items */}
          <div className="space-y-1.5 pt-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 text-left transition-all group pixel-nav-item rounded
                    ${isActive 
                      ? 'active text-amber-300' 
                      : 'text-zinc-400 hover:text-zinc-100'}
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 shrink-0 flex items-center justify-center rounded border transition-all ${
                      isActive 
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[1px_1px_0px_#f59e0b]' 
                        : 'bg-black border-zinc-800 text-zinc-400 group-hover:text-amber-300 group-hover:border-zinc-700'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-pixel text-[11px] tracking-wide truncate">
                        {item.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-pixel uppercase tracking-wider transition ${
                        isActive 
                          ? 'bg-red-950 text-red-300 border border-red-600/70' 
                          : 'bg-black text-zinc-500 border border-zinc-800 group-hover:text-zinc-400 group-hover:border-zinc-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <span className={`text-[10px] font-serif px-1 py-0.2 rounded leading-none transition ${
                      isActive ? 'text-amber-400 font-bold' : 'text-zinc-600 group-hover:text-amber-500/70'
                    }`}>
                      {item.kanji}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Academy badge */}
        <div className="p-3 bg-black rounded border-2 border-zinc-800 hover:border-amber-500/40 transition mt-4 shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-pixel text-[10px] text-zinc-200 uppercase tracking-wider truncate">
              {isProfessor ? 'Instrutor' : 'Aluno Ativo'}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-normal">
            {isProfessor
              ? 'Controle de chamadas, graduações e métricas do dojo.'
              : 'Histórico de treinos, evolução física e técnicas.'}
          </p>
        </div>
      </aside>
    </>
  );
}
