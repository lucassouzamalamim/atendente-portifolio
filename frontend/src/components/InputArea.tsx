import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

interface InputAreaProps {
    onSend: (text: string) => void;
    isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="absolute bottom-0 z-30 w-full bg-gradient-to-t from-[#050b14] via-[#050b14]/95 to-transparent px-4 pb-4 pt-14 sm:px-6">
            <div className="mx-auto max-w-4xl">
                <div className="rounded-3xl border border-cyan-300/15 bg-white/7 p-2 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Descreva seu projeto, desafio ou ideia..."
                            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                            autoComplete="off"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
                            aria-label="Enviar mensagem"
                        >
                            <SendHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="mt-2 text-center">
                    <span className="text-xs text-slate-500">Resposta inicial automatizada. Projetos avançam para conversa direta no WhatsApp.</span>
                </div>
            </div>
        </div>
    );
};
