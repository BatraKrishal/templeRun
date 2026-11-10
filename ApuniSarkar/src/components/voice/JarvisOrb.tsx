import React from 'react';

interface JarvisOrbProps {
  dialogueState: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const JarvisOrb: React.FC<JarvisOrbProps> = ({
  dialogueState,
  onClick,
  size = 'md',
}) => {
  const isListening = dialogueState === 'LISTENING';
  const isThinking = dialogueState === 'THINKING';
  const isSpeaking = dialogueState === 'SPEAKING';

  const dimensionClasses =
    size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';

  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center rounded-full cursor-pointer select-none outline-none focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95 ${dimensionClasses}`}
      aria-label="Vaani-Jarvis Voice Assistant"
      title="Summon Vaani-Jarvis (Voice Assistant & Narrator)"
    >
      {/* Outer Holographic Glow Aura */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isListening
            ? 'bg-cyan-400/40 blur-xl animate-pulse scale-125'
            : isSpeaking
            ? 'bg-amber-400/40 blur-xl animate-pulse scale-125'
            : isThinking
            ? 'bg-blue-500/40 blur-xl animate-spin scale-110'
            : 'bg-cyan-500/20 blur-md group-hover:bg-cyan-500/35'
        }`}
      />

      {/* Ripple Rings in Listening Mode */}
      {isListening && (
        <>
          <span className="absolute -inset-2 rounded-full border-2 border-cyan-400/60 animate-ping" />
          <span className="absolute -inset-4 rounded-full border border-cyan-300/40 animate-pulse" />
        </>
      )}

      {/* Speaking Siri Fluid Wave Ring */}
      {isSpeaking && (
        <>
          <span className="absolute -inset-2 rounded-full border-2 border-amber-400/70 animate-ping duration-1000" />
          <span className="absolute -inset-3.5 rounded-full border border-orange-400/50 animate-pulse" />
        </>
      )}

      {/* Futuristic Metallic Bezel */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black p-1 shadow-[0_0_20px_rgba(14,165,233,0.35)] border border-cyan-500/40 overflow-hidden flex items-center justify-center">
        {/* Rotating Outer Gyro Ring with Ticks */}
        <svg
          viewBox="0 0 100 100"
          className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ${
            isThinking
              ? 'animate-[spin_1.5s_linear_infinite]'
              : isListening
              ? 'animate-[spin_4s_linear_infinite]'
              : 'animate-[spin_20s_linear_infinite]'
          }`}
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            className={
              isListening
                ? 'text-cyan-400'
                : isSpeaking
                ? 'text-amber-400'
                : isThinking
                ? 'text-sky-300'
                : 'text-cyan-600/70'
            }
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="16 12"
            className="text-cyan-300/50"
          />
        </svg>

        {/* Counter-Rotating Inner Ring */}
        <svg
          viewBox="0 0 100 100"
          className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ${
            isThinking
              ? 'animate-[spin_2s_linear_infinite_reverse]'
              : 'animate-[spin_12s_linear_infinite_reverse]'
          }`}
        >
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="12 20"
            className={isSpeaking ? 'text-amber-300/80' : 'text-cyan-400/60'}
          />
        </svg>

        {/* Core Arc Reactor / Plasma Center */}
        <div
          className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-300 ${
            size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10'
          } ${
            isListening
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-400 shadow-[0_0_15px_#22d3ee]'
              : isSpeaking
              ? 'bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_15px_#fbbf24]'
              : isThinking
              ? 'bg-gradient-to-tr from-blue-600 to-cyan-300 shadow-[0_0_15px_#38bdf8] animate-pulse'
              : 'bg-gradient-to-tr from-cyan-600/80 to-blue-700/80 shadow-[0_0_10px_rgba(6,182,212,0.4)] group-hover:from-cyan-500 group-hover:to-blue-600'
          }`}
        >
          {/* Animated Waveform / Mic Icon inside Core */}
          {isListening ? (
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" />
              <span className="w-1 h-5 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.15s]" />
              <span className="w-1 h-3.5 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.3s]" />
              <span className="w-1 h-2 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.45s]" />
            </div>
          ) : isSpeaking ? (
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-2 bg-slate-950 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
              <span className="w-1 h-4 bg-slate-950 rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.1s]" />
              <span className="w-1 h-5 bg-slate-950 rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.2s]" />
              <span className="w-1 h-3 bg-slate-950 rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.3s]" />
            </div>
          ) : isThinking ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4 text-white drop-shadow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

