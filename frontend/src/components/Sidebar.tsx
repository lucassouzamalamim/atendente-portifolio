import React from 'react';
import { Layers, Cpu, Zap } from 'lucide-react';

interface SidebarProps {
    onAction: (action: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAction }) => {
    return (
        <aside className="w-[300px] glass-panel border-r-0 border-r border-white/5 flex flex-col hidden md:flex relative z-20 h-full">
            <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-nebula-purple to-nebula-cyan rounded-full blur animate-pulse-slow group-hover:blur-md transition"></div>
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=LucasDev&backgroundColor=transparent"
                            className="w-14 h-14 relative rounded-full border-2 border-white/20 bg-void-950"
                            alt="Avatar"
                        />
                    </div>
                    <div>
                        <h1 className="font-bold text-white font-orbit tracking-wider text-lg group-hover:text-nebula-glow transition">
                            LUCAS DEV
                        </h1>
                        <p className="text-[10px] text-nebula-cyan font-orbit tracking-[0.2em] uppercase">
                            Software Architect
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4 font-orbit">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest pl-2 mb-2">Painel de Controle</div>

                <button
                    onClick={() => onAction('portfolio')}
                    className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-nebula-blue/20 border border-white/5 hover:border-nebula-cyan/50 transition-all group flex items-center gap-3"
                >
                    <Layers className="w-5 h-5 text-nebula-purple group-hover:text-nebula-cyan transition" />
                    <span className="text-sm text-slate-300 group-hover:text-white">Projetos (Cases)</span>
                </button>

                <button
                    onClick={() => onAction('stack')}
                    className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-nebula-blue/20 border border-white/5 hover:border-nebula-cyan/50 transition-all group flex items-center gap-3"
                >
                    <Cpu className="w-5 h-5 text-nebula-purple group-hover:text-nebula-cyan transition" />
                    <span className="text-sm text-slate-300 group-hover:text-white">Stack Tecnológica</span>
                </button>

                <button
                    onClick={() => onAction('contact')}
                    className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-nebula-purple/20 to-nebula-blue/20 border border-nebula-cyan/30 hover:border-nebula-cyan hover:shadow-neon transition-all group flex items-center gap-3 mt-4"
                >
                    <Zap className="w-5 h-5 text-nebula-glow animate-pulse" />
                    <span className="text-sm text-white font-bold tracking-wide">CONTRATAR AGORA</span>
                </button>
            </div>

            <div className="mt-auto p-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Sistema Online • v2.4
                </div>
            </div>
        </aside>
    );
};
