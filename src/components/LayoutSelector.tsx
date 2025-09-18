import { useState } from 'react';
import type { FormLayout, FormLayoutType } from '../types/schema';
import { LAYOUT_DESCRIPTIONS, LAYOUT_PRESETS } from '../utils/layoutUtils';

interface LayoutSelectorProps {
  currentLayout?: FormLayout;
  onLayoutChange: (layout: FormLayout) => void;
  className?: string;
}

export function LayoutSelector({ currentLayout, onLayoutChange, className = '' }: LayoutSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const currentType = currentLayout?.type || 'grid';

  const handleLayoutPresetChange = (layoutType: FormLayoutType) => {
    const preset = LAYOUT_PRESETS[`${layoutType}${layoutType === 'grid' ? '-3' : ''}` as keyof typeof LAYOUT_PRESETS] || LAYOUT_PRESETS['grid-3'];
    onLayoutChange(preset);
  };

  const handleAdvancedChange = (field: string, value: string | number) => {
    const updatedLayout: FormLayout = {
      ...currentLayout,
      type: currentType,
      settings: {
        ...currentLayout?.settings,
        [field]: value,
      },
    };
    onLayoutChange(updatedLayout);
  };

  const handleResponsiveChange = (breakpoint: string, value: number) => {
    const updatedLayout: FormLayout = {
      ...currentLayout,
      type: currentType,
      settings: {
        ...currentLayout?.settings,
        responsiveBreakpoints: {
          ...currentLayout?.settings?.responsiveBreakpoints,
          [breakpoint]: value,
        },
      },
    };
    onLayoutChange(updatedLayout);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Layout Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Form Layout
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(LAYOUT_DESCRIPTIONS).map(([type, description]) => (
            <div
              key={type}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                currentType === type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleLayoutPresetChange(type as FormLayoutType)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {currentType === type && (
                    <div className="flex h-5 w-5 items-center justify-center">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className={`${currentType === type ? 'ml-3' : ''}`}>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {type.replace('-', ' ')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                </div>
              </div>

              {/* Layout Preview */}
              <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <LayoutPreview type={type as FormLayoutType} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <svg className={`w-4 h-4 mr-1 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Layout Settings
        </button>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Grid-specific settings */}
          {currentType === 'grid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Columns per Row
              </label>
              <select
                value={currentLayout?.settings?.columnsPerRow || 3}
                onChange={(e) => handleAdvancedChange('columnsPerRow', parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
                <option value={5}>5 Columns</option>
                <option value={6}>6 Columns</option>
              </select>
            </div>
          )}

          {/* Card-specific settings */}
          {currentType === 'card' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Spacing
              </label>
              <select
                value={currentLayout?.settings?.cardSpacing || 'md'}
                onChange={(e) => handleAdvancedChange('cardSpacing', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
          )}

          {/* Horizontal-specific settings */}
          {currentType === 'horizontal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Field Alignment
              </label>
              <select
                value={currentLayout?.settings?.fieldAlignment || 'left'}
                onChange={(e) => handleAdvancedChange('fieldAlignment', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          )}

          {/* Section Spacing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Section Spacing
            </label>
            <select
              value={currentLayout?.settings?.sectionSpacing || 'normal'}
              onChange={(e) => handleAdvancedChange('sectionSpacing', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>

          {/* Responsive Breakpoints */}
          {(currentType === 'grid' || currentType === 'two-column') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Responsive Breakpoints
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Mobile</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={currentLayout?.settings?.responsiveBreakpoints?.mobile || 1}
                    onChange={(e) => handleResponsiveChange('mobile', parseInt(e.target.value))}
                    className="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tablet</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={currentLayout?.settings?.responsiveBreakpoints?.tablet || 2}
                    onChange={(e) => handleResponsiveChange('tablet', parseInt(e.target.value))}
                    className="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Desktop</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={currentLayout?.settings?.responsiveBreakpoints?.desktop || (currentType === 'grid' ? 3 : 2)}
                    onChange={(e) => handleResponsiveChange('desktop', parseInt(e.target.value))}
                    className="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple layout preview component
function LayoutPreview({ type }: { type: FormLayoutType }) {
  const getPreviewElements = () => {
    switch (type) {
      case 'single-column':
        return (
          <div className="space-y-1">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          </div>
        );
      case 'two-column':
        return (
          <div className="grid grid-cols-2 gap-1">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        );
      case 'grid':
        return (
          <div className="grid grid-cols-3 gap-1">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        );
      case 'horizontal':
        return (
          <div className="flex gap-1">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
          </div>
        );
      case 'card':
        return (
          <div className="space-y-1">
            <div className="p-1 bg-gray-200 dark:bg-gray-700 rounded border">
              <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
              <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="p-1 bg-gray-200 dark:bg-gray-700 rounded border">
              <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
              <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        );
      case 'wizard':
        return (
          <div className="relative">
            <div className="h-1 bg-blue-300 rounded mb-2"></div>
            <div className="space-y-1">
              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        );
      default:
        return <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>;
    }
  };

  return <div className="h-8 flex items-center">{getPreviewElements()}</div>;
}