module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'source-code-pro',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
      },
      colors: {
        // Darker Theme Colors
        background: {
          DEFAULT: '#0d0d0d',
          secondary: '#141414',
          tertiary: '#1a1a1a',
          hover: '#1f1f1f',
          card: '#1a1a1a',
        },
        border: {
          DEFAULT: '#2a2a2a',
          hover: '#3a3a3a',
        },
        text: {
          primary: '#e5e5e6',
          secondary: '#9ea0a6',
          tertiary: '#6d6e73',
        },
        accent: {
          DEFAULT: '#5e6ad2',
          hover: '#505ac9',
        },
        priority: {
          urgent: '#f5534b',
          high: '#ff6f00',
          medium: '#f59f0a',
          low: '#6d6e73',
        },
        status: {
          backlog: '#6d6e73',
          todo: '#9ea0a6',
          in_progress: '#f59f0a',
          in_review: '#8b5cf6',
          done: '#22c55e',
          cancelled: '#6d6e73',
          duplicate: '#6d6e73',
        },
      },
    },
  },
  plugins: [],
};

