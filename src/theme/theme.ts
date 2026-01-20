export const colors = {
    background: '#1A1A2E', // Dark Blue/Black
    surface: '#16213E',    // Slightly lighter
    primary: '#E94560',    // Neon Pink/Red (Arcade vibe)
    secondary: '#0F3460',  // Deep Blue
    accent: '#533483',     // Purple
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    success: '#4CAF50',
    error: '#F44336',
    cardBack: '#E94560',
    disabled: '#555555',

    // Card Suits
    hearts: '#E94560',
    diamonds: '#E94560',
    clubs: '#E0E0E0',
    spades: '#E0E0E0',
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 999,
};

export const typography = {
    h1: { fontSize: 32, fontWeight: 'bold' as const },
    h2: { fontSize: 24, fontWeight: 'bold' as const },
    body: { fontSize: 16, fontWeight: 'normal' as const },
    caption: { fontSize: 12, fontWeight: 'normal' as const },
};
