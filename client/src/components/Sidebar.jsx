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
      icon: LayoutDashboard,
      badge: null,
      desc: 'Visão geral e métricas'
    },
    {
      id: 'lineage',
      label: 'Árvore Genealógica',
      icon: GitFork,
      badge: 'Linhagens',
      desc: 'Origens e grandes mestres'
    },
    {
      id: 'tutorials',
      label: 'Biblioteca de Posições',
      icon: BookOpen,
      badge: 'Vídeo/Fotos',
      desc: 'Técnicas passo a passo'
    },
    {
      id: 'attendance',
      label: 'Controle de Presença',
      icon: ClipboardCheck,
      badge: isProfessor ? 'Chamada' : 'Minhas Aulas',
      desc: 'Assinatura de treinos'
    },
    {
      id: 'students',
      label: isProfessor ? 'Cadastro de Alunos' : 'Comunidade / Perfil',
      icon: Users,
      badge: null,
      desc: 'Perfis e históricos'
    },
    {
      id: 'graduations',
      label: 'Gestão de Graduação',
      icon: Award,
      badge: 'CBJJ',
      desc: 'Faixas e graus'
    },
    {
      id: 'physical',
      label: 'Dados Físicos & Peso',
      icon: Scale,
      badge: 'IBJJF',
      desc: 'Pesagem e evolução'
    },
    {
      id: 'reports',
      label: 'Relatórios & Estatísticas',
      icon: BarChart3,
      badge: null,
      desc: 'Frequência e ranking'
    },
    {
      id: 'tournaments',
      label: 'Chaveamento de Torneios',
      icon: Trophy,
      badge: 'Brackets',
      desc: 'Absoluto, Gi/No-Gi e Faixas'
    },
    {
      id: 'rules',
      label: 'Manual de Regras CBJJ',
      icon: FileText,
      badge: '2026',
      desc: 'Pontos, golpes e faltas'
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
        bg-[#09090b] border-r border-amber-500/20
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        flex flex-col justify-between p-3 overflow-y-auto
      `}>
        <div className="space-y-1">
          {/* Mobile drawer header */}
          <div className="flex md:hidden items-center justify-between px-3 py-2 border-b border-zinc-800 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥋</span>
              <span className="font-black text-amber-300 text-sm uppercase tracking-wider">Arte Suave</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-amber-500/30 transition"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Demo Switcher on mobile inside sidebar */}
          <div className="lg:hidden p-2.5 rounded-xl bg-black border border-amber-500/25 mb-3 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-2 text-[11px]">
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>Alternar perfil de teste:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  login('professor@artesuave.com', 'senha123');
                  setMobileOpen(false);
                }}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-center ${
                  user?.role === 'professor'
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
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
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-center ${
                  user?.role === 'student'
                    ? 'bg-red-700 text-white shadow'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                Aluno
              </button>
            </div>
          </div>

          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Navegação Principal
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-all group
                  ${isActive 
                    ? 'bg-gradient-to-r from-amber-500/20 via-black to-red-950/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/70 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-zinc-900 text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[10px] font-normal text-zinc-500 group-hover:text-zinc-400">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isActive 
                      ? 'bg-red-950/80 text-red-300 border border-red-700/40' 
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Academy badge */}
        <div className="p-3 bg-gradient-to-br from-black to-zinc-950 rounded-xl border border-amber-500/25 mt-4 shadow-md">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200">
              {isProfessor ? 'Modo Instrutor / Mestre' : 'Modo Aluno Ativo'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {isProfessor
              ? 'Acesso administrativo a chamadas, graduações de alunos e métricas.'
              : 'Acesso do aluno a treinos, frequência, peso e evolução.'}
          </p>
        </div>
      </aside>
    </>
  );
}
