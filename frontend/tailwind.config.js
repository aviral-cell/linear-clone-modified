/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '0.75rem',
        'space-lg': '1rem',
        'space-xl': '1.5rem',
        'space-2xl': '2rem',
        'space-3xl': '3rem',
      },
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
      fontSize: {
        'table-header': ['11px', { lineHeight: '14px' }],
        'table-cell': ['13px', { lineHeight: '20px' }],
      },
      colors: {
        // Darker Theme Colors (brand/surface)
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
        // Semantic aliases for alerts/feedback
        success: '#16a34a',
        warning: '#eab308',
        danger: '#dc2626',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      },
      // Z-index layers: sticky/in-flow, overlay, modal/panel, dropdown/popover
      zIndex: {
        sticky: '10',
        overlay: '40',
        modal: '50',
        dropdown: '9999',
      },
      // Transition durations for interactive elements
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
      },
      // Dropdown/min-width tokens to avoid arbitrary values
      minWidth: {
        'dropdown-sm': '140px',
        'dropdown-md': '180px',
        'dropdown-lg': '220px',
        'dropdown-xl': '280px',
      },
      maxWidth: {
        'dropdown-viewport': 'calc(100vw - 2rem)',
        'container-narrow': '768px',
        'container-default': '1152px',
        'container-wide': '1280px',
      },
    },
  },
  plugins: [],
};
