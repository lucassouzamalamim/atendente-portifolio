import React from 'react';
import { Bot, ExternalLink, FolderKanban, User } from 'lucide-react';
import { marked } from 'marked';
import { useTypewriter } from '../hooks/useTypewriter';

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

const renderMarkdown = (text: string) => {
    let html = marked.parse(text) as string;

    html = html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
    html = html.replace(/<a [^>]*href="(https:\/\/wa\.me[^"]+)"[^>]*>(.*?)<\/a>/g, (_, href, text) => {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-full bg-cyan-300/12 px-3 py-1.5 text-sm font-semibold text-cyan-100 no-underline transition hover:bg-cyan-300/18">${text}</a>`;
    });

    return html;
};

const splitTechnology = (technology?: string) => {
    return (technology ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
    const isUser = message.role === 'user';
    const shouldAnimate = !isUser && isLast;
    const { displayedText, isFinished } = useTypewriter(message.content, 14, shouldAnimate);

    const showProjectCard = message.projectCard && (!shouldAnimate || isFinished);
    const showProjects = message.projects && message.projects.length > 0 && (!shouldAnimate || isFinished);

    if (isUser) {
        return (
            <div className="mb-6 flex flex-row-reverse gap-3 animate-fade-in">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-sm">
                    <User className="h-5 w-5" />
                </div>
                <div className="max-w-[82%] rounded-3xl rounded-tr-md bg-cyan-400 px-5 py-3 text-sm leading-6 text-slate-950 shadow-lg shadow-cyan-950/20">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8 flex gap-3 animate-fade-in sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <Bot className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">Atendente Lucas</span>
                    <span className="rounded-full border border-cyan-300/15 bg-white/5 px-2 py-0.5 text-xs font-medium text-cyan-100/70">
                        Qualificação inicial
                    </span>
                </div>

                <div className="rounded-3xl rounded-tl-md border border-cyan-300/15 bg-white/7 px-5 py-4 shadow-sm backdrop-blur">
                    <div
                        className="prose max-w-none text-sm leading-7 text-slate-200"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(displayedText) }}
                    />

                    {shouldAnimate && !isFinished && (
                        <span className="mt-1 inline-block h-4 w-1.5 animate-pulse rounded-full bg-cyan-300 align-middle" />
                    )}
                </div>

                {showProjectCard && message.projectCard && (
                    <div className="mt-4 max-w-md rounded-3xl border border-cyan-300/15 bg-white/7 p-4 shadow-sm backdrop-blur">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
                                <FolderKanban className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-semibold text-white">{message.projectCard.title}</h4>
                                <p className="mt-1 text-sm leading-6 text-slate-300">{message.projectCard.desc}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {splitTechnology(message.projectCard.tech).map((tech) => (
                                        <span key={tech} className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-medium text-cyan-100/80">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showProjects && message.projects && (
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {message.projects.map((project, index) => (
                            <article key={`${project.title}-${index}`} className="overflow-hidden rounded-3xl border border-cyan-300/15 bg-white/7 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10">
                                <div className="flex h-32 items-center justify-center overflow-hidden border-b border-cyan-300/10 bg-white/5">
                                    {project.imageUrl && project.imageUrl.startsWith('http') && !project.imageUrl.includes('via.placeholder') ? (
                                        <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover opacity-80" />
                                    ) : (
                                        <FolderKanban className="h-10 w-10 text-cyan-200" />
                                    )}
                                </div>
                                <div className="flex min-h-[220px] flex-col p-5">
                                    <h4 className="text-base font-semibold text-white">{project.title}</h4>
                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{project.description}</p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {splitTechnology(project.technology).slice(0, 4).map((tech) => (
                                            <span key={tech} className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-medium text-cyan-100/80">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
                                    >
                                        Visualizar
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
