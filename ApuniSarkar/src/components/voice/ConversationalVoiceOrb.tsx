import React from 'react';
import { Mic, MicOff, Volume2, Square, Play } from 'lucide-react';

interface ConversationalVoiceOrbProps {
  dialogueState: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ConversationalVoiceOrb: React.FC<ConversationalVoiceOrbProps> = ({
  dialogueState,
  isListening,
  isSpeaking,
  onClick,
  size = 'md',
}) => {
  const isThinking = dialogueState === 'THINKING';

  // Dimension mapping
  const config = {
    sm: {
      orbSize: 'w-14 h-14',
      centerSize: 'w-6 h-6',
      iconSize: 'size-3.5',
      svgViewBox: '0 0 100 100',
      svgRadius: 42,
      svgStroke: 2,
      dashArray: '2 6',
      pad: '-inset-2.5',
    },
    md: {
      orbSize: 'w-20 h-20',
      centerSize: 'w-8 h-8',
      iconSize: 'size-4',
      svgViewBox: '0 0 120 120',
      svgRadius: 52,
      svgStroke: 2.5,
      dashArray: '2.5 8',
      pad: '-inset-3.5',
    },
    lg: {
      orbSize: 'w-32 h-32',
      centerSize: 'w-12 h-12',
      iconSize: 'size-6',
      svgViewBox: '0 0 160 160',
      svgRadius: 70,
      svgStroke: 3,
      dashArray: '3 10',
      pad: '-inset-5',
    },
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center justify-center rounded-full cursor-pointer select-none outline-none focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95 ${config.orbSize}`}
      aria-label="Conversational AI Voice Agent"
      title={
        isListening
          ? 'Listening... Click to pause'
          : isSpeaking
          ? 'Speaking (ElevenLabs)... Click to pause'
          : 'Click to start voice conversation'
      }
    >
      {/* Outer Dotted Arc / Progress Halo (Exact Match to ElevenLabs screenshot) */}
      <svg
        className={`absolute ${config.pad} w-[calc(100%+${size === 'lg' ? '40px' : size === 'md' ? '28px' : '20px'})] h-[calc(100%+${size === 'lg' ? '40px' : size === 'md' ? '28px' : '20px'})] pointer-events-none transition-all duration-700 ${
          isThinking
            ? 'animate-[spin_2s_linear_infinite]'
            : isListening
            ? 'animate-[spin_12s_linear_infinite]'
            : isSpeaking
            ? 'animate-[spin_16s_linear_infinite]'
            : 'animate-[spin_40s_linear_infinite]'
        }`}
        viewBox={config.svgViewBox}
      >
        <circle
          cx={size === 'lg' ? 80 : size === 'md' ? 60 : 50}
          cy={size === 'lg' ? 80 : size === 'md' ? 60 : 50}
          r={config.svgRadius}
          fill="none"
          stroke={
            isListening
              ? '#0284c7'
              : isSpeaking
              ? '#0369a1'
              : isThinking
              ? '#38bdf8'
              : '#94a3b8'
          }
          strokeWidth={config.svgStroke}
          strokeDasharray={config.dashArray}
          strokeLinecap="round"
          className="transition-colors duration-500 opacity-80"
        />
      </svg>

      {/* Ambient Outer Aura Glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 ${
          isListening
            ? 'bg-sky-400/40 blur-xl scale-125 animate-pulse'
            : isSpeaking
            ? 'bg-cyan-400/40 blur-xl scale-125 animate-pulse'
            : isThinking
            ? 'bg-blue-400/30 blur-lg scale-110'
            : 'bg-sky-300/20 blur-md group-hover:bg-sky-400/30'
        }`}
      />

      {/* Main Fluid Blue Watercolor Orb */}
      <div
        className={`relative w-full h-full rounded-full overflow-hidden shadow-xl border border-white/60 transition-all duration-500 flex items-center justify-center ${
          isListening || isSpeaking ? 'shadow-sky-300/60' : 'shadow-slate-300/50'
        }`}
        style={{
          background:
            'radial-gradient(circle at 35% 35%, #e0f2fe 0%, #7dd3fc 35%, #38bdf8 60%, #0284c7 90%)',
        }}
      >
        {/* Animated Fluid Watercolor Texture Overlays */}
        <div
          className={`absolute inset-0 rounded-full mix-blend-overlay opacity-75 transition-transform duration-1000 ${
            isListening || isSpeaking
              ? 'animate-[spin_8s_linear_infinite]'
              : 'animate-[spin_25s_linear_infinite]'
          }`}
          style={{
            background:
              'radial-gradient(circle at 70% 30%, #bae6fd 0%, transparent 60%), radial-gradient(circle at 30% 70%, #0284c7 0%, transparent 70%)',
          }}
        />

        {/* Soft Organic Fluid Breathing Layer */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400/40 via-cyan-200/30 to-blue-600/30 transition-all duration-700 ${
            isListening ? 'scale-110 animate-ping opacity-25' : 'opacity-40'
          }`}
        />

        {/* Center White Disc with Icon */}
        <div
          className={`relative z-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-800 transition-all duration-300 group-hover:scale-105 ${config.centerSize}`}
        >
          {isListening ? (
            <div className="flex items-center gap-0.5">
              <span className="w-0.5 h-2 bg-sky-600 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
              <span className="w-0.5 h-3 bg-sky-600 rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.15s]" />
              <span className="w-0.5 h-2 bg-sky-600 rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.3s]" />
            </div>
          ) : isSpeaking ? (
            <div className="flex items-center gap-0.5">
              <span className="w-0.5 h-1.5 bg-blue-700 rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" />
              <span className="w-0.5 h-3.5 bg-blue-700 rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.1s]" />
              <span className="w-0.5 h-2 bg-blue-700 rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.2s]" />
            </div>
          ) : isThinking ? (
            <div className="size-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className={`${config.iconSize} fill-slate-800 ml-0.5`} />
          )}
        </div>
      </div>
    </button>
  );
};

