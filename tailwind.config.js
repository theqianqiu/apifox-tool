/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
    darkMode: 'class',
    plugins: [],
    theme: {
        fontSize: {
            xxs: 'var(--text-xxs)',
            xs: 'var(--text-xs)',
            DEFAULT: 'var(--text-base)',
            title: 'var(--text-title)',
            text18: 'var(--text-18)',
        },
        borderRadius: {
            none: '0',
            sm: 'var(--round-base)',
            DEFAULT: 'var(--round-md)',
            lg: 'var(--round-lg)',
        },
        extend: {
            boxShadow: {
                itemHover: '0px 12px 32px 0px rgba(4,8,35,0.0933)',
            },
        },
    },
};
