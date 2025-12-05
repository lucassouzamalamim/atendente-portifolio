import React, { useState } from 'react';
import { Terminal, SendHorizontal } from 'lucide-react';

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
        <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-void-950 via-void-950 to-transparent pt-20 z-30">
            <div className="max-w-4xl mx-auto">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-nebula-purple to-nebula-cyan rounded-xl opacity-30 group-hover:opacity-70 transition blur"></div>
                    <div className="relative flex items-center bg-void-900 rounded-xl border border-white/10 p-2 shadow-2xl">
                        <div className="px-3 text-nebula-cyan"><Terminal className="w-5 h-5" /></div>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite sua pergunta ou escolha uma opção acima..."
                            className="flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none py-3 font-mono text-sm"
                            autoComplete="off"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="p-3 bg-white/5 hover:bg-nebula-cyan/20 hover:text-nebula-cyan text-slate-400 rounded-lg transition disabled:opacity-30"
                        >
                            <SendHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-600 font-orbit uppercase tracking-widest">Lucas AI System • Online</span>
                </div>
            </div>
        </div>
    );
};
