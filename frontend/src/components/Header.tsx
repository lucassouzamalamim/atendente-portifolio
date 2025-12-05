import React from 'react';
import { MessageCircle } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="absolute top-0 w-full h-20 flex items-center justify-between px-6 z-20 glass-panel border-b border-white/5">
            <div className="md:hidden font-orbit font-bold text-transparent bg-clip-text bg-gradient-to-r from-nebula-purple to-nebula-cyan">
                LUCAS.AI //
            </div>
            <div className="hidden md:block"></div>
            <a
                href="https://wa.me/5542999839219"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-nebula-cyan/10 hover:bg-nebula-cyan/20 border border-nebula-cyan/50 text-nebula-cyan px-5 py-2 rounded-full font-orbit text-xs font-bold tracking-wider transition hover:shadow-neon"
            >
                <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
        </header>
    );
};
