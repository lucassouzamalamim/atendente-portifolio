import React from 'react';
import { Rocket, Box, TrendingUp, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
    onAction: (action: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
            <div className="relative w-32 h-32 mb-8 group cursor-pointer animate-float">
                <div className="absolute inset-0 border border-nebula-purple/50 rounded-full animate-spin-slow" style={{ borderStyle: 'dashed' }}></div>
                <div className="absolute inset-2 border border-nebula-cyan/50 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                <div className="absolute inset-0 bg-nebula-cyan/5 rounded-full blur-xl"></div>

                <div className="relative w-full h-full flex items-center justify-center rounded-full bg-void-900 border border-white/10 shadow-cosmic backdrop-blur-md">
                    <Rocket className="w-12 h-12 text-nebula-glow" />
                </div>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 font-orbit tracking-tight">
                VOCÊ TEM 100 PROPOSTAS.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-nebula-purple via-nebula-blue to-nebula-glow">
                    POR QUE A MINHA?
                </span>
            </h2>

            <p className="text-slate-400 max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
                A maioria vende linhas de código. Eu vendo <strong>Sistemas de Alta Performance</strong>, <strong>Segurança</strong> e <strong>Retorno sobre Investimento (ROI)</strong>.
                <br />Escolha seu diferencial:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <button onClick={() => onAction('why_architect')} className="group text-left p-6 rounded-2xl bg-void-900/50 border border-white/10 hover:border-nebula-purple/60 hover:bg-void-800 transition-all hover:-translate-y-1 hover:shadow-cosmic relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition">
                        <Box className="w-16 h-16 text-nebula-purple" />
                    </div>
                    <h3 className="font-orbit font-bold text-white mb-2 relative z-10">ARQUITETURA</h3>
                    <p className="text-xs text-slate-400 relative z-10">Adeus "código espaguete". Crio sistemas escaláveis e limpos.</p>
                </button>

                <button onClick={() => onAction('why_business')} className="group text-left p-6 rounded-2xl bg-void-900/50 border border-white/10 hover:border-nebula-blue/60 hover:bg-void-800 transition-all hover:-translate-y-1 hover:shadow-cosmic relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition">
                        <TrendingUp className="w-16 h-16 text-nebula-blue" />
                    </div>
                    <h3 className="font-orbit font-bold text-white mb-2 relative z-10">FOCO NO ROI</h3>
                    <p className="text-xs text-slate-400 relative z-10">Não penso em features, penso em como o software vai te dar lucro.</p>
                </button>

                <button onClick={() => onAction('why_risk')} className="group text-left p-6 rounded-2xl bg-void-900/50 border border-white/10 hover:border-nebula-cyan/60 hover:bg-void-800 transition-all hover:-translate-y-1 hover:shadow-cosmic relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition">
                        <ShieldCheck className="w-16 h-16 text-nebula-cyan" />
                    </div>
                    <h3 className="font-orbit font-bold text-white mb-2 relative z-10">RISCO ZERO</h3>
                    <p className="text-xs text-slate-400 relative z-10">Entregas semanais. Contrato claro. Sem sumiços.</p>
                </button>
            </div>
        </div>
    );
};
