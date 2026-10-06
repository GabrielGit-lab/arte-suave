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
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
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
          className="fixed inset-0 z-40 bg-black/70 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-16 left-0 z-40
        w-64 h-[calc(100vh-4rem)]
        bg-slate-950 border-r border-slate-800
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col justify-between p-3 overflow-y-auto
      `}>
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[10px] font-normal text-slate-500 group-hover:text-slate-400">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Academy badge */}
        <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-800/80 mt-4">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
              {isProfessor ? 'Modo Instrutor / Mestre' : 'Modo Aluno Ativo'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isProfessor
              ? 'Acesso administrativo a chamadas, graduações de alunos e métricas.'
              : 'Acompanhe seus treinos, peso, progresso de graus e estude posições.'}
          </p>
        </div>
      </aside>
    </>
  );
}
