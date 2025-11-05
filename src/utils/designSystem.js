/**
 * Brain Visualization App - Unified Design System
 * Consistent styling patterns for all components
 */

export const designSystem = {
  // ============================================================================
  // BACKGROUNDS
  // ============================================================================
  backgrounds: {
    // Primary app background - consistent gradient
    primary: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',

    // Alternative backgrounds
    dark: 'bg-gray-950',
    black: 'bg-black',

    // Card backgrounds
    card: 'bg-black/40 backdrop-blur-xl',
    cardHover: 'hover:bg-black/50',

    // Glassmorphism
    glass: 'bg-white/5 backdrop-blur-sm',
    glassDark: 'bg-black/30 backdrop-blur-sm',
  },

  // ============================================================================
  // BORDERS
  // ============================================================================
  borders: {
    // Standard borders
    default: 'border border-white/10',
    hover: 'hover:border-white/20',
    focus: 'focus:border-white/30',

    // Colored borders
    purple: 'border-purple-500/30',
    purpleHover: 'hover:border-purple-400/50',
    blue: 'border-blue-500/30',

    // Border positions
    bottom: 'border-b border-white/10',
    top: 'border-t border-white/10',
    left: 'border-l-2',

    // Gradient borders (use with relative/absolute positioning)
    gradientPurple: 'bg-gradient-to-r from-purple-600/20 to-blue-600/20',
  },

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  typography: {
    // Headings
    h1: 'text-4xl font-extralight text-white tracking-wide',
    h2: 'text-3xl font-light text-white',
    h3: 'text-2xl font-light text-white',
    h4: 'text-xl font-light text-white',

    // Body text
    body: 'text-base text-gray-300',
    bodyLarge: 'text-lg text-gray-300',
    bodySmall: 'text-sm text-gray-400',

    // Special text
    label: 'text-xs uppercase tracking-wider text-gray-500',
    caption: 'text-xs text-gray-500',
    link: 'text-blue-400 hover:text-blue-300 underline transition-colors',

    // Emphasis
    highlight: 'text-purple-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    success: 'text-green-400',
  },

  // ============================================================================
  // BUTTONS & INTERACTIVE ELEMENTS
  // ============================================================================
  buttons: {
    // Primary button
    primary: `
      px-6 py-3
      bg-gradient-to-r from-purple-600 to-blue-600
      text-white font-medium rounded-xl
      hover:from-purple-700 hover:to-blue-700
      transition-all duration-300
      shadow-lg hover:shadow-xl
    `.replace(/\s+/g, ' ').trim(),

    // Secondary button
    secondary: `
      px-6 py-3
      bg-white/5 backdrop-blur-sm
      text-white border border-white/10 rounded-xl
      hover:bg-white/10 hover:border-white/20
      transition-all duration-300
    `.replace(/\s+/g, ' ').trim(),

    // Ghost button
    ghost: `
      px-4 py-2
      text-gray-400
      hover:text-white hover:bg-white/5
      transition-all duration-300 rounded-lg
    `.replace(/\s+/g, ' ').trim(),

    // Tab button (inactive)
    tabInactive: `
      px-6 py-4 capitalize whitespace-nowrap
      text-gray-400
      hover:text-white hover:bg-white/5
      transition-all duration-300
    `.replace(/\s+/g, ' ').trim(),

    // Tab button (active)
    tabActive: `
      px-6 py-4 capitalize whitespace-nowrap
      text-white
      border-b-2 border-purple-400 bg-white/5
    `.replace(/\s+/g, ' ').trim(),
  },

  // ============================================================================
  // CARDS & CONTAINERS
  // ============================================================================
  cards: {
    // Standard card
    default: `
      bg-black/40 backdrop-blur-xl
      rounded-3xl p-8
      border border-white/10
    `.replace(/\s+/g, ' ').trim(),

    // Card with hover effect
    hover: `
      bg-black/40 backdrop-blur-sm
      rounded-2xl p-6
      border border-white/10
      hover:border-white/20
      transition-all duration-300
      hover:transform hover:scale-[1.01]
    `.replace(/\s+/g, ' ').trim(),

    // Card with glow effect
    glow: `
      relative group
      bg-black/40 backdrop-blur-sm
      rounded-2xl p-6
      border border-white/10
    `.replace(/\s+/g, ' ').trim(),

    // Inner glow (use as child of glow card)
    glowEffect: `
      absolute inset-0
      bg-gradient-to-r from-purple-600/10 to-blue-600/10
      rounded-2xl blur-xl
      opacity-0 group-hover:opacity-100
      transition-all duration-300
    `.replace(/\s+/g, ' ').trim(),

    // Stat card
    stat: `
      relative group
      bg-black/40 backdrop-blur-sm
      rounded-2xl p-6
      border border-white/10
      hover:border-white/20
      transition-all duration-300
    `.replace(/\s+/g, ' ').trim(),
  },

  // ============================================================================
  // SPACING
  // ============================================================================
  spacing: {
    // Padding
    cardPadding: 'p-8',
    cardPaddingSmall: 'p-6',
    cardPaddingTiny: 'p-4',

    // Margins
    sectionMargin: 'mb-8',
    itemMargin: 'mb-6',

    // Gaps
    gridGap: 'gap-6',
    flexGap: 'gap-4',

    // Spacing groups
    stackLarge: 'space-y-8',
    stackMedium: 'space-y-6',
    stackSmall: 'space-y-4',
    stackTiny: 'space-y-2',
  },

  // ============================================================================
  // COLORS
  // ============================================================================
  colors: {
    // Primary palette
    primary: {
      purple: '#8b5cf6',
      blue: '#3b82f6',
      indigo: '#6366f1',
    },

    // Status colors
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },

    // Impact visualization
    impact: {
      reduction: 'text-blue-400', // Volume reduction
      reductionBg: 'bg-blue-500/20',
      increase: 'text-orange-400', // Hyperactivity
      increaseBg: 'bg-orange-500/20',
      neutral: 'text-gray-400',
    },

    // Severity indicators
    severity: {
      subtle: 'text-green-400',
      notable: 'text-yellow-400',
      moderate: 'text-orange-400',
      severe: 'text-red-400',
    },
  },

  // ============================================================================
  // ANIMATIONS
  // ============================================================================
  animations: {
    fadeIn: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',

    // Transitions
    smooth: 'transition-all duration-300 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out',
  },

  // ============================================================================
  // LAYOUT
  // ============================================================================
  layout: {
    // Containers
    pageContainer: 'min-h-screen',
    maxWidth: 'max-w-7xl mx-auto',
    maxWidthNarrow: 'max-w-4xl mx-auto',

    // Headers
    pageHeader: 'relative overflow-hidden p-8 border-b border-white/10',
    sectionHeader: 'mb-6',

    // Navigation
    tabNavigation: 'sticky top-0 z-20 backdrop-blur-lg bg-black/30 border-b border-white/10',
    tabContainer: 'flex overflow-x-auto',

    // Grids
    grid: 'grid grid-cols-1',
    gridMd: 'md:grid-cols-2',
    gridLg: 'lg:grid-cols-3',
    gridXl: 'xl:grid-cols-4',
  },

  // ============================================================================
  // UTILITIES
  // ============================================================================
  utilities: {
    // Rounded corners
    roundedLarge: 'rounded-3xl',
    roundedMedium: 'rounded-2xl',
    roundedSmall: 'rounded-xl',
    roundedTiny: 'rounded-lg',

    // Shadows
    shadowLarge: 'shadow-2xl',
    shadowMedium: 'shadow-xl',
    shadowSmall: 'shadow-lg',

    // Blur
    blurLarge: 'blur-2xl',
    blurMedium: 'blur-xl',
    blurSmall: 'blur-lg',

    // Overflow
    scrollY: 'overflow-y-auto',
    scrollX: 'overflow-x-auto',
    hidden: 'overflow-hidden',
  },
};

// ============================================================================
// COMPOSITE PATTERNS (Common combinations)
// ============================================================================
export const compositePatterns = {
  // Results page layout
  resultsPage: {
    container: `${designSystem.backgrounds.primary} ${designSystem.layout.pageContainer}`,
    header: designSystem.layout.pageHeader,
    tabNav: designSystem.layout.tabNavigation,
    content: `${designSystem.layout.maxWidth} p-8`,
  },

  // Impact card
  impactCard: {
    container: designSystem.cards.hover,
    header: `flex items-center justify-between ${designSystem.spacing.itemMargin}`,
    title: designSystem.typography.h4,
    stat: 'text-2xl font-light',
  },

  // Alert/Warning box
  alert: {
    info: `${designSystem.cards.default} border-blue-500/30 bg-blue-500/10`,
    warning: `${designSystem.cards.default} border-yellow-500/30 bg-yellow-500/10`,
    error: `${designSystem.cards.default} border-red-500/30 bg-red-500/10`,
    success: `${designSystem.cards.default} border-green-500/30 bg-green-500/10`,
  },
};

export default designSystem;
