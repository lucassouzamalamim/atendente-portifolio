import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Logo } from './Logo';

export const Header: React.FC = () => {
    return (
        <header className="absolute top-0 z-20 flex h-16 w-full items-center justify-between px-4 sm:px-6">
            <Logo compact />

            <a
                href="https://wa.me/5542999839219"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/8 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-sm backdrop-blur transition hover:bg-white/12"
            >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
            </a>
        </header>
    );
};
