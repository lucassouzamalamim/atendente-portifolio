import React from 'react';

interface LogoProps {
    compact?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ compact = false }) => {
    const iconClass = compact ? 'h-10 w-[68px]' : 'h-24 w-40';
    const titleClass = compact
        ? 'text-xl font-semibold tracking-wide'
        : 'text-4xl font-semibold tracking-wide';
    const subtitleClass = compact
        ? 'mt-1 text-[8px] font-semibold uppercase tracking-[0.24em]'
        : 'mt-2 text-[11px] font-semibold uppercase tracking-[0.36em]';

    return (
        <div className={compact ? 'flex items-center gap-3' : 'flex flex-col items-center text-center'}>
            <svg
                viewBox="0 0 180 120"
                aria-hidden="true"
                className={`${iconClass} shrink-0 overflow-visible`}
            >
                <defs>
                    <linearGradient id="logo-cyan" x1="22" y1="18" x2="152" y2="106" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#5ff7df" />
                        <stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>
                    <filter id="logo-glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <path
                    d="M54 22h62c28 0 48 20 48 46s-20 46-48 46H66c-30 0-52-20-52-46s18-46 40-46Z"
                    fill="none"
                    stroke="url(#logo-cyan)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    filter="url(#logo-glow)"
                />
                <rect x="53" y="55" width="15" height="26" rx="8" fill="url(#logo-cyan)" />
                <rect x="111" y="55" width="15" height="26" rx="8" fill="url(#logo-cyan)" />
                <path
                    d="M123 98h22c11 0 20-8 20-19v-9"
                    fill="none"
                    stroke="url(#logo-cyan)"
                    strokeWidth="7"
                    strokeLinecap="round"
                />
                <rect x="105" y="91" width="31" height="18" rx="9" fill="url(#logo-cyan)" />
            </svg>

            <div className={compact ? 'leading-none' : 'mt-1 leading-none'}>
                <div className={`${titleClass} text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.18)]`}>
                    Lucas <span className="text-cyan-300">AI</span>
                </div>
                <div className={`${subtitleClass} text-cyan-300`}>
                    Atendimento por IA
                </div>
            </div>
        </div>
    );
};
