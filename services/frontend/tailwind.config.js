/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        moderate: 'var(--moderate)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
      }
    },
  },
  plugins: [],
}
