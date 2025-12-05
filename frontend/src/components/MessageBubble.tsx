import React from 'react';
import { User, Bot, Database, Eye } from 'lucide-react';
import { marked } from 'marked';

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

interface MessageBubbleProps {
    message: Message;
    isLast: boolean;
}

import { useTypewriter } from '../hooks/useTypewriter';

const renderMarkdown = (text: string) => {
    let html = marked.parse(text) as string;

    // 1. Add target="_blank" to all links
    html = html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');

    // 2. Style WhatsApp links specifically
    html = html.replace(/<a [^>]*href="(https:\/\/wa\.me[^"]+)"[^>]*>(.*?)<\/a>/g, (match, href, text) => {
        const iconSvg = `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-1 inline-block"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-[#25D366] hover:text-[#20BD5C] font-bold transition-colors no-underline">${iconSvg}${text}</a>`;
    });

    return html;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
    const isUser = message.role === 'user';
    const shouldAnimate = !isUser && isLast;

    const { displayedText, isFinished } = useTypewriter(message.content, 20, shouldAnimate);

    const showProjectCard = message.projectCard && (!shouldAnimate || isFinished);
    const showProjects = message.projects && message.projects.length > 0 && (!shouldAnimate || isFinished);

    return (
        <div className={`mb-8 animate-fade-in group ${isUser ? '' : 'flex gap-4 relative'}`}>
            {isUser ? (
                <div className="flex flex-row-reverse gap-4">
                    <div className="w-10 h-10 rounded-full bg-void-800 border border-white/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="glass-panel px-6 py-4 rounded-3xl rounded-tr-sm text-slate-200 text-sm max-w-[80%] border-white/10 shadow-lg">
                        {message.content}
                    </div>
                </div>
            ) : (
                <>
                    <div className={`absolute top-10 left-5 w-[1px] h-[calc(100%+2rem)] bg-gradient-to-b from-nebula-cyan/50 to-transparent -z-10 ${isLast ? 'hidden' : ''}`}></div>

                    <div className="w-10 h-10 rounded-full bg-void-950 border border-nebula-cyan shadow-neon flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-5 h-5 text-nebula-glow" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-orbit font-bold text-transparent bg-clip-text bg-gradient-to-r from-nebula-purple to-nebula-cyan text-sm">
                                LUCAS AI
                            </span>
                            <span className="text-[10px] text-slate-600 border border-slate-800 px-1 rounded bg-void-900">
                                SYSTEM_REPLY
                            </span>
                        </div>

                        <div
                            className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed mb-4 min-h-[20px]"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(displayedText) }}
                        />

                        {/* Cursor effect while typing */}
                        {shouldAnimate && !isFinished && (
                            <span className="inline-block w-1.5 h-4 bg-nebula-cyan align-middle ml-1 animate-pulse" />
                        )}

                        {showProjectCard && message.projectCard && (
                            <div className="mt-4 max-w-md bg-void-900/80 border border-nebula-cyan/30 rounded-xl overflow-hidden relative group cursor-pointer hover:border-nebula-cyan hover:shadow-neon transition-all">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nebula-cyan/10 to-transparent h-[200%] w-full animate-[float_3s_linear_infinite] opacity-0 group-hover:opacity-100 pointer-events-none"></div>

                                <div className="h-32 bg-void-950 relative flex items-center justify-center overflow-hidden border-b border-white/5">
                                    <div className="absolute inset-0 bg-cosmic-gradient opacity-20"></div>
                                    <Database className="w-12 h-12 text-nebula-cyan/50 group-hover:text-nebula-glow transition duration-500" />
                                </div>
                                <div className="p-5 relative z-10">
                                    <h4 className="font-orbit font-bold text-white text-lg flex items-center gap-2">
                                        {message.projectCard.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-2 my-3">
                                        {message.projectCard.tech.split(', ').map((tech, i) => (
                                            <span key={i} className="text-[10px] uppercase font-bold text-nebula-cyan bg-nebula-cyan/10 px-2 py-1 rounded border border-nebula-cyan/20">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4">{message.projectCard.desc}</p>
                                    <button className="w-full py-2 bg-nebula-cyan/10 border border-nebula-cyan/30 text-nebula-cyan font-bold font-orbit text-xs rounded hover:bg-nebula-cyan hover:text-void-950 transition flex items-center justify-center gap-2">
                                        <Eye className="w-3 h-3" /> VER DEMO
                                    </button>
                                </div>
                            </div>
                        )}

                        {showProjects && message.projects && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {message.projects.map((project, index) => (
                                    <div key={index} className="bg-void-900/80 border border-white/10 rounded-xl overflow-hidden hover:border-nebula-cyan/50 transition-all group flex flex-col">
                                        <div className="h-32 bg-void-950 relative flex items-center justify-center overflow-hidden border-b border-white/5">
                                            {project.imageUrl && project.imageUrl.startsWith('http') && !project.imageUrl.includes('via.placeholder') ? (
                                                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-void-900 to-transparent opacity-50"></div>
                                                    <Database className="w-10 h-10 text-nebula-cyan/40 group-hover:text-nebula-cyan transition-colors" />
                                                </>
                                            )}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h4 className="font-bold text-white text-md mb-1">{project.title}</h4>
                                            <p className="text-xs text-slate-400 mb-3 line-clamp-2">{project.description}</p>

                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {project.technology.split(', ').slice(0, 3).map((tech, i) => (
                                                    <span key={i} className="text-[9px] uppercase font-bold text-slate-300 bg-white/5 px-2 py-1 rounded">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>

                                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-auto w-full py-2 bg-nebula-cyan/10 border border-nebula-cyan/20 text-nebula-cyan text-xs font-bold rounded hover:bg-nebula-cyan hover:text-void-950 transition flex items-center justify-center gap-2">
                                                <Eye className="w-3 h-3" /> VISUALIZAR
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
