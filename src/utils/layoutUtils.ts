import type { FormLayout, FormLayoutType } from '../types/schema';

export interface LayoutConfig {
  containerClasses: string;
  sectionClasses: string;
  fieldClasses: string;
  sectionStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}

export function getLayoutConfig(layout?: FormLayout): LayoutConfig {
  const layoutType = layout?.type || 'grid';
  const settings = layout?.settings || {};

  switch (layoutType) {
    case 'single-column':
      return {
        containerClasses: 'max-w-2xl mx-auto',
        sectionClasses: 'space-y-6',
        fieldClasses: 'grid grid-cols-1 gap-4',
      };

    case 'two-column':
      return {
        containerClasses: 'max-w-4xl mx-auto',
        sectionClasses: 'space-y-6',
        fieldClasses: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
      };

    case 'grid': {
      const columnsPerRow = settings.columnsPerRow || 3;
      const { mobile = 1, tablet = 2, desktop = columnsPerRow } = settings.responsiveBreakpoints || {};

      return {
        containerClasses: 'max-w-6xl mx-auto',
        sectionClasses: 'space-y-6',
        fieldClasses: `grid gap-4 md:gap-6
          grid-cols-${mobile}
          md:grid-cols-${tablet}
          lg:grid-cols-${desktop}`,
      };
    }

    case 'horizontal': {
      const alignment = settings.fieldAlignment || 'left';
      return {
        containerClasses: 'max-w-full mx-auto',
        sectionClasses: 'space-y-8',
        fieldClasses: `flex flex-wrap gap-4 md:gap-6 ${
          alignment === 'center' ? 'justify-center' :
          alignment === 'right' ? 'justify-end' : 'justify-start'
        }`,
      };
    }

    case 'card': {
      const cardSpacing = settings.cardSpacing || 'md';
      const cardGap = cardSpacing === 'sm' ? 'gap-3' : cardSpacing === 'lg' ? 'gap-8' : 'gap-6';

      return {
        containerClasses: 'max-w-5xl mx-auto',
        sectionClasses: `space-y-8 ${cardGap}`,
        fieldClasses: 'space-y-4',
        sectionStyle: {
          backgroundColor: 'var(--card-bg)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      };
    }

    case 'wizard':
      return {
        containerClasses: 'max-w-3xl mx-auto',
        sectionClasses: 'space-y-6',
        fieldClasses: 'space-y-6',
        containerStyle: {
          minHeight: '400px',
        },
      };

    default:
      // Fallback to current grid system
      return {
        containerClasses: 'max-w-4xl mx-auto',
        sectionClasses: 'space-y-6',
        fieldClasses: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
      };
  }
}

export function getSpacingClasses(spacing?: string): string {
  switch (spacing) {
    case 'compact':
      return 'space-y-3 gap-3';
    case 'relaxed':
      return 'space-y-8 gap-8';
    default:
      return 'space-y-6 gap-6';
  }
}

export function getFieldLayoutClasses(
  layoutType: FormLayoutType,
  fieldCount: number,
  settings?: FormLayout['settings']
): string {
  switch (layoutType) {
    case 'single-column':
      return 'grid grid-cols-1 gap-4';

    case 'two-column':
      return 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6';

    case 'horizontal':
      return 'flex flex-wrap items-end gap-4 md:gap-6';

    case 'card':
      return 'space-y-4';

    case 'wizard':
      return 'space-y-6';

    case 'grid':
    default: {
      const columnsPerRow = settings?.columnsPerRow || 3;
      const { mobile = 1, tablet = 2, desktop = Math.min(columnsPerRow, fieldCount) } = settings?.responsiveBreakpoints || {};

      if (fieldCount === 1) return 'grid grid-cols-1';
      if (fieldCount === 2) return 'grid grid-cols-1 sm:grid-cols-2';

      return `grid gap-4 sm:gap-6 grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${Math.min(desktop, fieldCount)}`;
    }
  }
}

export const LAYOUT_DESCRIPTIONS = {
  'single-column': 'Single column layout - All fields stacked vertically in one column',
  'two-column': 'Two column layout - Fields arranged in two columns on larger screens',
  'grid': 'Grid layout - Flexible grid with customizable columns (current default)',
  'horizontal': 'Horizontal layout - Fields arranged horizontally in rows',
  'card': 'Card layout - Each section displayed as a separate card',
  'wizard': 'Wizard layout - Step-by-step form with one section at a time',
} as const;

export const LAYOUT_PRESETS = {
  'single-column': {
    type: 'single-column' as FormLayoutType,
    settings: {
      sectionSpacing: 'normal' as const,
    },
  },
  'two-column': {
    type: 'two-column' as FormLayoutType,
    settings: {
      sectionSpacing: 'normal' as const,
      responsiveBreakpoints: {
        mobile: 1,
        tablet: 2,
        desktop: 2,
      },
    },
  },
  'grid-3': {
    type: 'grid' as FormLayoutType,
    settings: {
      columnsPerRow: 3,
      sectionSpacing: 'normal' as const,
      responsiveBreakpoints: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      },
    },
  },
  'grid-4': {
    type: 'grid' as FormLayoutType,
    settings: {
      columnsPerRow: 4,
      sectionSpacing: 'normal' as const,
      responsiveBreakpoints: {
        mobile: 1,
        tablet: 2,
        desktop: 4,
      },
    },
  },
  'horizontal': {
    type: 'horizontal' as FormLayoutType,
    settings: {
      fieldAlignment: 'left' as const,
      sectionSpacing: 'relaxed' as const,
    },
  },
  'card': {
    type: 'card' as FormLayoutType,
    settings: {
      cardSpacing: 'md' as const,
      sectionSpacing: 'normal' as const,
    },
  },
  'wizard': {
    type: 'wizard' as FormLayoutType,
    settings: {
      sectionSpacing: 'normal' as const,
    },
  },
} as const;