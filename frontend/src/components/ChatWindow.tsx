import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { WelcomeScreen } from './WelcomeScreen';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';

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

export const ChatWindow: React.FC<ChatWindowProps> = ({ inputAction, onActionConsumed }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            setTimeout(() => {
                chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
            }, 100);
        }
    };

    const handleSend = async (text: string) => {
        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        scrollToBottom();

        try {
            const response = await fetch('http://localhost:8080/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const botMsg: Message = {
                role: 'assistant',
                content: data.content,
                projectCard: data.projectCard,
                projects: data.projects
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua mensagem.' }]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    const handleAction = (type: string) => {
        let text = "";
        if (type === 'why_architect') text = "O que é esse diferencial de 'Arquitetura' e por que importa?";
        if (type === 'why_business') text = "Como você foca no ROI e no lucro do meu negócio?";
        if (type === 'why_risk') text = "Como você garante Risco Zero e cumprimento de prazos?";
        if (type === 'portfolio') text = "Projetos (cases)";
        if (type === 'stack') text = "Quais tecnologias você usa? É algo moderno?";
        if (type === 'contact') text = "Estou convencido. Como iniciamos?";

        if (text) handleSend(text);
    };

    useEffect(() => {
        if (inputAction) {
            handleAction(inputAction);
            onActionConsumed();
        }
    }, [inputAction]);

    return (
        <>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 pt-24 pb-40 scroll-smooth">
                <div className="max-w-4xl mx-auto">
                    {messages.length === 0 ? (
                        <WelcomeScreen onAction={handleAction} />
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <MessageBubble key={index} message={msg} isLast={index === messages.length - 1} />
                            ))}

                            {isLoading && (
                                <div className="ml-14 flex items-center gap-2 text-nebula-cyan/50 text-xs font-orbit animate-pulse">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    PROCESSANDO DADOS...
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <InputArea onSend={handleSend} isLoading={isLoading} />
        </>
    );
};
