export const tokens = {
    // Typography Scale
    typography: {
        fontFamily: {
            sans: 'Inter, system-ui, sans-serif',
            mono: 'JetBrains Mono, monospace',
        },
        fontSize: {
            xs: ['0.75rem', { lineHeight: '1rem' }],
            sm: ['0.875rem', { lineHeight: '1.25rem' }],
            base: ['1rem', { lineHeight: '1.5rem' }],
            lg: ['1.125rem', { lineHeight: '1.75rem' }],
            xl: ['1.25rem', { lineHeight: '1.75rem' }],
            '2xl': ['1.5rem', { lineHeight: '2rem' }],
            '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
            '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        },
        fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
    },

    // Spacing Scale (4px base)
    spacing: {
        0: '0',
        px: '1px',
        0.5: '0.125rem', // 2px
        1: '0.25rem',    // 4px
        1.5: '0.375rem', // 6px
        2: '0.5rem',     // 8px
        2.5: '0.625rem', // 10px
        3: '0.75rem',    // 12px
        3.5: '0.875rem', // 14px
        4: '1rem',       // 16px
        5: '1.25rem',    // 20px
        6: '1.5rem',     // 24px
        7: '1.75rem',    // 28px
        8: '2rem',       // 32px
        9: '2.25rem',    // 36px
        10: '2.5rem',    // 40px
        12: '3rem',      // 48px
        14: '3.5rem',    // 56px
        16: '4rem',      // 64px
    },

    // Color Palette
    colors: {
        // Brand
        primary: {
            50: 'hsl(217 91% 97%)',
            100: 'hsl(217 91% 94%)',
            200: 'hsl(217 91% 86%)',
            300: 'hsl(217 91% 74%)',
            400: 'hsl(217 91% 60%)',
            500: 'hsl(217 91% 50%)', // Main
            600: 'hsl(217 91% 42%)',
            700: 'hsl(217 91% 34%)',
            800: 'hsl(217 91% 26%)',
            900: 'hsl(217 91% 18%)',
        },

        // Semantic
        success: {
            light: 'hsl(142 76% 95%)',
            main: 'hsl(142 76% 36%)',
            dark: 'hsl(142 76% 26%)',
        },
        warning: {
            light: 'hsl(38 92% 95%)',
            main: 'hsl(38 92% 50%)',
            dark: 'hsl(38 92% 40%)',
        },
        error: {
            light: 'hsl(0 84% 95%)',
            main: 'hsl(0 84% 60%)',
            dark: 'hsl(0 84% 40%)',
        },
        info: {
            light: 'hsl(199 89% 95%)',
            main: 'hsl(199 89% 48%)',
            dark: 'hsl(199 89% 38%)',
        },
    },

    // Border Radius
    borderRadius: {
        none: '0',
        sm: '0.25rem',   // 4px
        md: '0.375rem',  // 6px
        lg: '0.5rem',    // 8px
        xl: '0.75rem',   // 12px
        '2xl': '1rem',   // 16px
        '3xl': '1.5rem', // 24px
        full: '9999px',
    },

    // Shadows
    boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        glow: '0 0 40px -10px var(--primary)',
    },

    // Z-Index Scale
    zIndex: {
        dropdown: 100,
        sticky: 200,
        modal: 300,
        toast: 400,
        tooltip: 500,
    },

    // Animations
    animation: {
        duration: {
            fast: '150ms',
            normal: '250ms',
            slow: '400ms',
        },
        easing: {
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
            in: 'cubic-bezier(0.4, 0, 1, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        },
    },
};
