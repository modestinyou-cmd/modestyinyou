import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ivory: '#F2F1ED', sand: '#B38F6F', taupe: '#B38F6F', espresso: '#710014', sage: '#B38F6F', obsidian: '#161616', crimson: '#710014', pearl: '#F2F1ED' }, fontFamily: { serif: ['Georgia', 'serif'] } } }, plugins: [] };
export default config;
