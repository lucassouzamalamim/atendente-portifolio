import React, { useCallback, useRef, useState } from 'react';
import { MessageSquareText, Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import { Logo } from './Logo';

type VoiceStatus = 'idle' | 'requesting' | 'connecting' | 'listening' | 'speaking' | 'error';

export type TranscriptItem = {
    role: 'lead' | 'assistant' | 'system';
    text: string;
};

interface VoiceAssistantProps {
    onTextFallback: () => void;
    onTranscriptChange?: (items: TranscriptItem[]) => void;
}

const getRealtimeTokenEndpoint = () => {
    const explicitEndpoint = import.meta.env.VITE_REALTIME_TOKEN_ENDPOINT;
    if (explicitEndpoint) return explicitEndpoint;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
        throw new Error('Missing VITE_SUPABASE_URL or VITE_REALTIME_TOKEN_ENDPOINT');
    }

    return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/realtime-token`;
};

const getFunctionHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseAnonKey) {
        headers.apikey = supabaseAnonKey;
        headers.Authorization = `Bearer ${supabaseAnonKey}`;
    }

    return headers;
};

const statusLabel: Record<VoiceStatus, string> = {
    idle: 'Pronto para atendimento',
    requesting: 'Aguardando permissão do microfone',
    connecting: 'Conectando com a IA',
    listening: 'Ouvindo você',
    speaking: 'IA respondendo',
    error: 'Não foi possível iniciar a voz',
};

const statusHelp: Record<VoiceStatus, string> = {
    idle: 'Clique, permita o microfone e converse naturalmente sobre sua ideia, necessidade ou dúvidas sobre serviços.',
    requesting: 'O navegador vai solicitar acesso ao microfone para iniciar a conversa.',
    connecting: 'Estamos abrindo uma sessão segura de voz em tempo real.',
    listening: 'Pode falar. A IA está pronta para entender sua necessidade.',
    speaking: 'A IA está falando.',
    error: 'Use o atendimento por texto ou tente iniciar novamente.',
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onTextFallback, onTranscriptChange }) => {
    const [status, setStatus] = useState<VoiceStatus>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState('');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const speakingTimeoutRef = useRef<number | null>(null);

    const addTranscript = useCallback((role: TranscriptItem['role'], text: string) => {
        if (!text.trim()) return;
        setTranscript((current) => {
            const next = [...current.slice(-8), { role, text }];
            onTranscriptChange?.(next);
            return next;
        });
    }, [onTranscriptChange]);

    const markSpeaking = useCallback((holdMs = 1300) => {
        setStatus('speaking');

        if (speakingTimeoutRef.current) {
            window.clearTimeout(speakingTimeoutRef.current);
        }

        speakingTimeoutRef.current = window.setTimeout(() => {
            setStatus('listening');
            speakingTimeoutRef.current = null;
        }, holdMs);
    }, []);

    const speakLocalMessage = useCallback((message: string) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.onstart = () => markSpeaking(2200);
        utterance.onend = () => setStatus('error');
        window.speechSynthesis.speak(utterance);
    }, [markSpeaking]);

    const cleanupSession = useCallback((nextStatus: VoiceStatus = 'idle') => {
        if (speakingTimeoutRef.current) {
            window.clearTimeout(speakingTimeoutRef.current);
            speakingTimeoutRef.current = null;
        }

        dataChannelRef.current?.close();
        dataChannelRef.current = null;

        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;

        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        if (audioRef.current) {
            audioRef.current.srcObject = null;
        }

        setIsMuted(false);
        setStatus(nextStatus);
    }, []);

    const handleRealtimeEvent = useCallback((rawEvent: MessageEvent) => {
        try {
            const event = JSON.parse(rawEvent.data);
            const type = String(event.type ?? '');
            const isResponseStream = type.startsWith('response.audio') ||
                type.startsWith('response.text') ||
                type.startsWith('response.output_text') ||
                type.includes('audio.delta') ||
                type.includes('transcript.delta');
            const isResponseDone = type === 'response.done' ||
                type === 'response.audio.done' ||
                type === 'response.audio_transcript.done' ||
                type.endsWith('.done');

            if (type === 'input_audio_buffer.speech_started') {
                setStatus('listening');
            }

            if (isResponseStream) {
                markSpeaking();
            }

            if (isResponseDone) {
                markSpeaking(850);
            }

            if (type === 'conversation.item.input_audio_transcription.completed') {
                addTranscript('lead', event.transcript ?? '');
            }

            if (type === 'response.audio_transcript.done') {
                addTranscript('assistant', event.transcript ?? '');
            }

            if (type === 'error') {
                setError(event.error?.message ?? 'A sessão de voz retornou um erro.');
                setStatus('error');
            }
        } catch {
            // Ignore non-JSON diagnostic messages from the data channel.
        }
    }, [addTranscript, markSpeaking]);

    const startVoiceSession = useCallback(async () => {
        if (status === 'requesting' || status === 'connecting') return;

        cleanupSession('idle');
        setError('');
        setTranscript([]);
        onTranscriptChange?.([]);

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Este navegador não oferece suporte a microfone por WebRTC.');
            }

            setStatus('requesting');
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = mediaStream;

            setStatus('connecting');
            const tokenResponse = await fetch(getRealtimeTokenEndpoint(), {
                method: 'POST',
                headers: getFunctionHeaders(),
                body: JSON.stringify({}),
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json().catch(() => ({}));
                const message = errorData.spoken_message || errorData.error || 'Não foi possível iniciar o atendimento por voz.';

                if (tokenResponse.status === 429) {
                    setError(message);
                    addTranscript('system', message);
                    speakLocalMessage(message);
                    cleanupSession('error');
                    return;
                }

                throw new Error(message);
            }

            const tokenData = await tokenResponse.json();
            const ephemeralKey = tokenData.value ?? tokenData.client_secret?.value;

            if (!ephemeralKey) {
                throw new Error('A credencial temporária de voz veio vazia.');
            }

            const peerConnection = new RTCPeerConnection();
            peerConnectionRef.current = peerConnection;

            peerConnection.ontrack = (event) => {
                markSpeaking(1800);
                if (audioRef.current) {
                    audioRef.current.srcObject = event.streams[0];
                    audioRef.current.play().catch(() => undefined);
                }
            };

            peerConnection.onconnectionstatechange = () => {
                if (peerConnection.connectionState === 'connected') {
                    setStatus('listening');
                }
                if (peerConnection.connectionState === 'failed') {
                    setStatus('error');
                }
            };

            mediaStream.getAudioTracks().forEach((track) => peerConnection.addTrack(track, mediaStream));

            const dataChannel = peerConnection.createDataChannel('oai-events');
            dataChannelRef.current = dataChannel;
            dataChannel.addEventListener('message', handleRealtimeEvent);
            dataChannel.addEventListener('open', () => {
                setStatus('listening');
                dataChannel.send(JSON.stringify({
                    type: 'response.create',
                    response: {
                        instructions: 'Cumprimente o visitante em português do Brasil e pergunte qual projeto, ideia ou desafio ele quer discutir.',
                    },
                }));
            });

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${ephemeralKey}`,
                    'Content-Type': 'application/sdp',
                },
                body: offer.sdp,
            });

            if (!sdpResponse.ok) {
                throw new Error('A OpenAI não aceitou a conexão de voz.');
            }

            await peerConnection.setRemoteDescription({
                type: 'answer',
                sdp: await sdpResponse.text(),
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro inesperado ao iniciar atendimento por voz.';
            setError(message);
            addTranscript('system', message);
            cleanupSession('error');
        }
    }, [addTranscript, cleanupSession, handleRealtimeEvent, markSpeaking, onTranscriptChange, speakLocalMessage, status]);

    const stopVoiceSession = useCallback(() => {
        cleanupSession('idle');
    }, [cleanupSession]);

    const toggleMute = useCallback(() => {
        const audioTracks = mediaStreamRef.current?.getAudioTracks() ?? [];
        const nextMuted = !isMuted;
        audioTracks.forEach((track) => {
            track.enabled = !nextMuted;
        });
        setIsMuted(nextMuted);
    }, [isMuted]);

    const isConnected = ['listening', 'speaking'].includes(status);
    const isBusy = ['requesting', 'connecting'].includes(status);
    const isSpeaking = status === 'speaking';

    return (
        <section className="w-full max-w-[464px]">
            <div className={`relative overflow-hidden rounded-[28px] bg-[#07111e] p-5 text-white shadow-2xl shadow-slate-950/20 transition sm:p-7 ${isSpeaking ? 'shadow-cyan-500/20' : ''}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(15,185,177,0.28),transparent_34%),linear-gradient(180deg,rgba(14,165,233,0.12),transparent_52%)]" />

                <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-3">
                                <Logo compact />
                            </div>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Atendimento por voz</h1>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                            PT-BR
                        </span>
                    </div>

                    <div className="mt-12 flex flex-col items-center text-center">
                        <div className="relative flex h-48 w-48 items-center justify-center">
                            <div className={`voice-ring h-44 w-44 ${isSpeaking ? 'is-speaking' : ''}`} />
                            <div className={`voice-ring voice-ring-delay h-36 w-36 ${isSpeaking ? 'is-speaking' : ''}`} />
                            <div className={`voice-glow ${isSpeaking ? 'is-speaking' : ''}`} />
                            <button
                                onClick={isConnected ? stopVoiceSession : startVoiceSession}
                                disabled={isBusy}
                                className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-cyan-500 text-slate-950 shadow-2xl shadow-cyan-500/25 transition hover:scale-105 disabled:cursor-wait disabled:opacity-70 ${isSpeaking ? 'scale-110' : ''}`}
                                aria-label={isConnected ? 'Encerrar atendimento por voz' : 'Iniciar atendimento por voz'}
                            >
                                {isSpeaking ? (
                                    <div className="voice-bars" aria-hidden="true">
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                ) : isConnected ? (
                                    <Volume2 className="h-9 w-9" />
                                ) : (
                                    <Mic className="h-9 w-9" />
                                )}
                            </button>
                        </div>

                        <p className="mt-6 text-lg font-semibold">{statusLabel[status]}</p>
                        <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
                            {statusHelp[status]}
                        </p>

                        {error && (
                            <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-100">
                                {error}
                            </p>
                        )}

                        {transcript.length > 0 && (
                            <div className="mt-5 w-full space-y-2 lg:hidden">
                                {transcript.slice(-3).map((item, index) => (
                                    <div key={`${item.role}-${index}`} className="rounded-2xl bg-white/7 px-4 py-3 text-left text-xs leading-5 text-slate-300">
                                        <span className="mr-2 font-semibold text-cyan-200">
                                            {item.role === 'assistant' ? 'IA' : item.role === 'lead' ? 'Lead' : 'Sistema'}:
                                        </span>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-3">
                        <button
                            onClick={toggleMute}
                            disabled={!isConnected}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            {isMuted ? 'Pausado' : 'Mutar'}
                        </button>
                        <button
                            onClick={stopVoiceSession}
                            disabled={!isConnected && !isBusy}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                            <PhoneOff className="h-4 w-4" />
                            Encerrar
                        </button>
                        <button
                            onClick={onTextFallback}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/12 px-3 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/18"
                        >
                            <MessageSquareText className="h-4 w-4" />
                            Texto
                        </button>
                    </div>
                </div>
            </div>

            <audio ref={audioRef} autoPlay className="hidden" />
        </section>
    );
};
