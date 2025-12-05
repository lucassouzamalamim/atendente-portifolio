/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
            orbit: ['Orbitron', 'sans-serif'],
        },
        extend: {
            colors: {
                void: { 800: '#1e1b2e', 900: '#0f0c19', 950: '#05040a' }, // Fundo Profundo
                nebula: {
                    purple: '#a855f7', // Roxo
                    blue: '#3b82f6',   // Azul
                    cyan: '#06b6d4',   // Ciano
                    glow: '#00f0ff'    // Neon
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 12s linear infinite',
            },
            boxShadow: {
                'cosmic': '0 0 15px rgba(168, 85, 247, 0.3), 0 0 30px rgba(6, 182, 212, 0.1)',
                'neon': '0 0 5px #06b6d4, 0 0 10px #06b6d4',
            },
            backgroundImage: {
                'cosmic-gradient': 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(6,182,212,0.1) 100%)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
