import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MessageSquareText, Mic } from 'lucide-react';
import { VoiceAssistant, type TranscriptItem } from './VoiceAssistant';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { Logo } from './Logo';

interface Project {
    title: string;
    description: string;
    technology: string;
    url: string;
    imageUrl: string;
}

interface ProjectCard {
    title: string;
    tech: string;
    desc: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    projectCard?: ProjectCard;
    projects?: Project[];
}

interface ChatWindowProps {
    inputAction: string | null;
    onActionConsumed: () => void;
}

type ExperienceMode = 'choice' | 'voice' | 'text';

const getChatEndpoint = () => {
    const explicitEndpoint = import.meta.env.VITE_CHAT_ENDPOINT;
    if (explicitEndpoint) return explicitEndpoint;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
        throw new Error('Missing VITE_SUPABASE_URL or VITE_CHAT_ENDPOINT');
    }

    return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/chat`;
};

const getChatHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseAnonKey) {
        headers.apikey = supabaseAnonKey;
        headers.Authorization = `Bearer ${supabaseAnonKey}`;
    }

    return headers;
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ inputAction, onActionConsumed }) => {
    const [mode, setMode] = useState<ExperienceMode>('choice');
    const [messages, setMessages] = useState<Message[]>([]);
    const [voiceTranscript, setVoiceTranscript] = useState<TranscriptItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            setTimeout(() => {
                chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
            }, 100);
        }
    }, []);

    const handleSend = useCallback(async (text: string) => {
        const userMsg: Message = { role: 'user', content: text };
        setMode('text');
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);
        scrollToBottom();

        try {
            const response = await fetch(getChatEndpoint(), {
                method: 'POST',
                headers: getChatHeaders(),
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.content || 'Network response was not ok');

            const botMsg: Message = {
                role: 'assistant',
                content: data.content,
                projectCard: data.projectCard,
                projects: data.projects,
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: error instanceof Error
                        ? error.message
                        : 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente ou chame diretamente no WhatsApp.',
                },
            ]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    }, [scrollToBottom]);

    const handleAction = useCallback((type: string) => {
        let text = '';
        if (type === 'idea') text = 'Tenho uma ideia de sistema, mas ainda preciso organizar o escopo. Como podemos começar?';
        if (type === 'automation') text = 'Quero automatizar meu atendimento e qualificação de leads. O que você precisa saber?';
        if (type === 'estimate') text = 'Preciso estimar um projeto. Quais informações você precisa para entender escopo, prazo e investimento?';
        if (type === 'portfolio') text = 'Projetos (cases)';
        if (type === 'stack') text = 'Quais tecnologias você usa e como decide a arquitetura de um projeto?';
        if (type === 'contact') text = 'Estou convencido. Como iniciamos?';

        if (text) handleSend(text);
    }, [handleSend]);

    useEffect(() => {
        if (inputAction) {
            handleAction(inputAction);
            onActionConsumed();
        }
    }, [handleAction, inputAction, onActionConsumed]);

    if (mode === 'choice') {
        return (
            <div className="flex flex-1 items-center justify-center px-4 pt-20">
                <div className="w-full max-w-3xl rounded-[32px] border border-cyan-300/15 bg-[#07111e] p-6 text-center text-white shadow-2xl shadow-slate-950/25 sm:p-8">
                    <div className="mb-8 flex justify-center">
                        <Logo />
                    </div>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
                        Como você prefere ser atendido?
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                        Escolha voz para conversar em tempo real com a IA, ou texto para iniciar uma qualificação escrita.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <button
                            onClick={() => setMode('voice')}
                            className="group rounded-3xl border border-cyan-300/20 bg-cyan-300/12 p-6 text-left transition hover:-translate-y-0.5 hover:bg-cyan-300/18"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                                <Mic className="h-6 w-6" />
                            </span>
                            <h2 className="mt-5 text-xl font-semibold">Falar com IA por voz</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Ideal para explicar a ideia naturalmente e acelerar a qualificação.
                            </p>
                        </button>

                        <button
                            onClick={() => {
                                setMode('text');
                                handleAction('estimate');
                            }}
                            className="group rounded-3xl border border-white/10 bg-white/7 p-6 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
                                <MessageSquareText className="h-6 w-6" />
                            </span>
                            <h2 className="mt-5 text-xl font-semibold">Falar com IA por texto</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Use se preferir escrever ou se não quiser liberar o microfone.
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 pb-10 pt-20 scroll-smooth sm:px-6">
                <div className={mode === 'voice' ? 'mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(360px,464px)_1fr]' : 'mx-auto max-w-4xl'}>
                    {mode === 'voice' && (
                        <VoiceAssistant
                            onTextFallback={() => setMode('text')}
                            onTranscriptChange={setVoiceTranscript}
                        />
                    )}

                    <ConversationPanel
                        mode={mode}
                        messages={messages}
                        voiceTranscript={voiceTranscript}
                        isLoading={isLoading}
                    />
                </div>
            </div>
            {mode === 'text' && <InputArea onSend={handleSend} isLoading={isLoading} />}
        </>
    );
};

function ConversationPanel({
    mode,
    messages,
    voiceTranscript,
    isLoading,
}: {
    mode: ExperienceMode;
    messages: Message[];
    voiceTranscript: TranscriptItem[];
    isLoading: boolean;
}) {
    const hasVoiceTranscript = voiceTranscript.length > 0;
    const hasTextMessages = messages.length > 0;

    return (
        <section className="min-h-[520px] rounded-[28px] border border-cyan-300/15 bg-[#07111e]/92 p-5 text-white shadow-2xl shadow-slate-950/20">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-cyan-200">
                        {mode === 'voice' ? 'Chat do atendimento por voz' : 'Chat por texto'}
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight">Conversa</h2>
                </div>
                <span className="rounded-full border border-cyan-300/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    Protegido por limite de uso
                </span>
            </div>

            {mode === 'voice' && (
                <div className="space-y-3">
                    {!hasVoiceTranscript && (
                        <EmptyConversation text="Quando a conversa por voz começar, a transcrição aparece aqui." />
                    )}
                    {voiceTranscript.map((item, index) => (
                        <div
                            key={`${item.role}-${index}`}
                            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === 'assistant'
                                ? 'bg-cyan-300/12 text-cyan-50'
                                : item.role === 'lead'
                                    ? 'bg-cyan-400 text-slate-950'
                                    : 'bg-white/7 text-slate-300'
                                }`}
                        >
                            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] opacity-60">
                                {item.role === 'assistant' ? 'IA' : item.role === 'lead' ? 'Cliente' : 'Sistema'}
                            </span>
                            {item.text}
                        </div>
                    ))}
                </div>
            )}

            {mode === 'text' && (
                <div>
                    {!hasTextMessages && <EmptyConversation text="Escreva sua primeira mensagem no campo abaixo." />}
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} isLast={index === messages.length - 1} />
                    ))}

                    {isLoading && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/7 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm backdrop-blur sm:ml-14">
                            <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                            Analisando sua mensagem...
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

function EmptyConversation({ text }: { text: string }) {
    return (
        <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-cyan-300/15 bg-white/5 p-6 text-center text-sm leading-6 text-slate-400">
            {text}
        </div>
    );
}
