import React from 'react';

const BELT_CONFIGS = {
  Branca: {
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-900',
    barBg: 'bg-zinc-900',
    stripeColor: 'bg-white',
    label: 'Faixa Branca',
  },
  Azul: {
    bg: 'bg-blue-600',
    border: 'border-blue-500',
    text: 'text-white',
    barBg: 'bg-zinc-950',
    stripeColor: 'bg-white',
    label: 'Faixa Azul',
  },
  Roxa: {
    bg: 'bg-purple-700',
    border: 'border-purple-600',
    text: 'text-white',
    barBg: 'bg-zinc-950',
    stripeColor: 'bg-white',
    label: 'Faixa Roxa',
  },
  Marrom: {
    bg: 'bg-amber-900',
    border: 'border-amber-800',
    text: 'text-amber-100',
    barBg: 'bg-zinc-950',
    stripeColor: 'bg-white',
    label: 'Faixa Marrom',
  },
  Preta: {
    bg: 'bg-zinc-950',
    border: 'border-zinc-700',
    text: 'text-red-100',
    barBg: 'bg-red-600',
    stripeColor: 'bg-white',
    label: 'Faixa Preta',
  },
  Coral: {
    bg: 'bg-gradient-to-r from-red-600 via-zinc-950 to-red-600',
    border: 'border-red-700',
    text: 'text-white',
    barBg: 'bg-white',
    stripeColor: 'bg-zinc-900',
    label: 'Faixa Coral',
  },
  Vermelha: {
    bg: 'bg-red-700',
    border: 'border-red-600',
    text: 'text-white',
    barBg: 'bg-amber-400',
    stripeColor: 'bg-white',
    label: 'Grande Mestre (Vermelha)',
  },
};

export default function BeltBadge({ belt = 'Branca', degrees = 0, size = 'md', showLabel = true }) {
  const config = BELT_CONFIGS[belt] || BELT_CONFIGS.Branca;
  const numDegrees = Math.min(Math.max(0, parseInt(degrees, 10) || 0), belt === 'Preta' ? 6 : 4);

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className={`relative flex items-center justify-between w-64 h-8 rounded-sm shadow-md overflow-hidden ${config.bg} ${config.border} border`}>
          {/* Main Belt Body */}
          <div className="flex-1 px-3 flex items-center">
            <span className={`text-xs font-black tracking-wider uppercase drop-shadow ${config.text}`}>
              {belt}
            </span>
          </div>

          {/* Sleeve (Ponta da Faixa) */}
          <div className={`w-20 h-full ${config.barBg} flex items-center justify-evenly px-1.5 border-l border-black/30 shadow-inner`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-6 rounded-xs transition-all ${
                  i < numDegrees ? `${config.stripeColor} shadow-sm opacity-100` : 'bg-transparent border border-white/10 opacity-30'
                }`}
                title={i < numDegrees ? `Grau ${i + 1}` : undefined}
              />
            ))}
          </div>
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-slate-400">
            {config.label} • {numDegrees} {numDegrees === 1 ? 'Grau' : 'Graus'}
          </span>
        )}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className="inline-flex items-center gap-1.5">
        <div className={`relative flex items-center h-4 w-12 rounded-[2px] overflow-hidden ${config.bg} border ${config.border}`}>
          <div className={`ml-auto w-3.5 h-full ${config.barBg} flex items-center justify-center gap-[1px] px-[1px]`}>
            {Array.from({ length: Math.min(numDegrees, 4) }).map((_, i) => (
              <div key={i} className={`w-[2px] h-3 ${config.stripeColor}`} />
            ))}
          </div>
        </div>
        {showLabel && (
          <span className="text-xs font-semibold text-slate-300">
            {belt} {numDegrees > 0 && `(${numDegrees}º)`}
          </span>
        )}
      </div>
    );
  }

  // Medium (Default)
  return (
    <div className="inline-flex items-center gap-2">
      <div className={`relative flex items-center h-6 w-24 rounded-xs shadow-sm overflow-hidden ${config.bg} border ${config.border}`}>
        <span className={`pl-2 text-[10px] font-bold tracking-wider uppercase truncate ${config.text}`}>
          {belt}
        </span>
        <div className={`ml-auto w-8 h-full ${config.barBg} flex items-center justify-center gap-1 px-1 border-l border-black/20`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-4 rounded-[1px] ${
                i < numDegrees ? `${config.stripeColor} shadow-xs` : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-300">
          {numDegrees}º grau
        </span>
      )}
    </div>
  );
}
