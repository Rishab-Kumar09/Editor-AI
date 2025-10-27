/**
 * Caption style presets for popular YouTube/TikTok styles
 */

export interface CaptionStyle {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  letterSpacing?: number;
  shadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };
  animation?: {
    type: 'fade' | 'slide' | 'bounce' | 'highlight';
    duration: number;
  };
  position: {
    x: 'left' | 'center' | 'right';
    y: 'top' | 'center' | 'bottom';
  };
}

export const CAPTION_STYLES: CaptionStyle[] = [
  {
    id: 'mrbeast',
    name: 'MrBeast Style',
    description: 'Large yellow text with black outline, words pop one by one',
    fontFamily: 'Impact, sans-serif',
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFF00',
    strokeColor: '#000000',
    strokeWidth: 8,
    textTransform: 'uppercase',
    animation: {
      type: 'bounce',
      duration: 0.3,
    },
    position: {
      x: 'center',
      y: 'center',
    },
  },
  {
    id: 'hormozi',
    name: 'Alex Hormozi Style',
    description: 'Clean white text with black outline, professional look',
    fontFamily: 'Arial, sans-serif',
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 6,
    textTransform: 'none',
    position: {
      x: 'center',
      y: 'bottom',
    },
  },
  {
    id: 'viral_tiktok',
    name: 'Viral TikTok',
    description: 'Large text with highlight on current word',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 2,
    animation: {
      type: 'highlight',
      duration: 0.2,
    },
    position: {
      x: 'center',
      y: 'center',
    },
  },
  {
    id: 'ali_abdaal',
    name: 'Ali Abdaal',
    description: 'Clean, simple yellow captions',
    fontFamily: 'Helvetica, sans-serif',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    shadow: {
      x: 2,
      y: 2,
      blur: 4,
      color: 'rgba(0,0,0,0.5)',
    },
    textTransform: 'none',
    position: {
      x: 'center',
      y: 'bottom',
    },
  },
  {
    id: 'vsauce',
    name: 'VSauce',
    description: 'White text with subtle shadow, minimal',
    fontFamily: 'Arial, sans-serif',
    fontSize: 40,
    fontWeight: 'normal',
    color: '#FFFFFF',
    shadow: {
      x: 0,
      y: 2,
      blur: 4,
      color: 'rgba(0,0,0,0.8)',
    },
    textTransform: 'none',
    position: {
      x: 'center',
      y: 'bottom',
    },
  },
  {
    id: 'gaming',
    name: 'Gaming Style',
    description: 'Bold colorful text for gaming videos',
    fontFamily: 'Impact, sans-serif',
    fontSize: 64,
    fontWeight: 'bold',
    color: '#00FF00',
    strokeColor: '#000000',
    strokeWidth: 4,
    textTransform: 'uppercase',
    animation: {
      type: 'slide',
      duration: 0.3,
    },
    position: {
      x: 'center',
      y: 'top',
    },
  },
];

/**
 * Get caption style by ID
 */
export function getCaptionStyle(styleId: string): CaptionStyle | undefined {
  return CAPTION_STYLES.find((style) => style.id === styleId);
}

/**
 * Convert caption style to CSS
 */
export function captionStyleToCSS(style: CaptionStyle): React.CSSProperties {
  const css: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight as any,
    color: style.color,
    textTransform: style.textTransform as any,
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
  };

  if (style.backgroundColor) {
    css.backgroundColor = style.backgroundColor;
    css.padding = '8px 16px';
    css.borderRadius = '4px';
  }

  if (style.shadow) {
    css.textShadow = `${style.shadow.x}px ${style.shadow.y}px ${style.shadow.blur}px ${style.shadow.color}`;
  }

  if (style.strokeColor && style.strokeWidth) {
    // WebKit stroke
    css.WebkitTextStroke = `${style.strokeWidth}px ${style.strokeColor}`;
  }

  return css;
}

