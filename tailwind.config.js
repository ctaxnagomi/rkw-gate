/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['"Fira Code"', 'monospace'],
                retro: ['"VT323"', 'monospace'],
            },
            colors: {
                terminal: {
                    bg: '#0a0a0a',
                    green: '#4af626',
                    amber: '#ffb000',
                    dim: '#2d332b',
                    red: '#ff3333'
                }
            },
            animation: {
                'blink': 'blink 1s step-end infinite',
                'glitch': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite',
                'scanline': 'scanline 8s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' }
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                }
            }
        }
    },
    plugins: [],
}
