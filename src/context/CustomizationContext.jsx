import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomizationContext = createContext(null);

const DEFAULT_SETTINGS = {
  theme: 'light',
  fontSize: 'medium',
  iconStyle: 'default',
  showStickyNotes: true,
  dashboardSections: {
    kpiCards: { visible: true, order: 0 },
    quickActions: { visible: true, order: 1 },
    engagementStats: { visible: true, order: 2 },
    tasksOverview: { visible: true, order: 3 },
    upcomingRenewals: { visible: true, order: 4 },
    recentNotes: { visible: true, order: 5 },
    calendarSection: { visible: true, order: 6 },
  }
};

export function CustomizationProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('dashboardCustomization');
      return savedSettings
        ? {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(savedSettings),
            dashboardSections: {
              ...DEFAULT_SETTINGS.dashboardSections,
              ...(JSON.parse(savedSettings)?.dashboardSections || {})
            }
          }
        : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading customization settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);
  }, [settings.fontSize]);

  useEffect(() => {
    try {
      localStorage.setItem('dashboardCustomization', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving customization settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const setFontSize = (size) => {
    setSettings(prev => ({
      ...prev,
      fontSize: size
    }));
  };

  const setIconStyle = (style) => {
    setSettings(prev => ({
      ...prev,
      iconStyle: style
    }));
  };

  const toggleSectionVisibility = (sectionId) => {
    setSettings(prev => ({
      ...prev,
      dashboardSections: {
        ...prev.dashboardSections,
        [sectionId]: {
          ...prev.dashboardSections[sectionId],
          visible: !prev.dashboardSections[sectionId]?.visible
        }
      }
    }));
  };

  const toggleStickyNotesVisibility = () => {
    setSettings(prev => ({
      ...prev,
      showStickyNotes: !prev.showStickyNotes
    }));
  };

  const updateSectionOrder = (newOrder) => {
    const updatedSections = { ...settings.dashboardSections };
    newOrder.forEach((sectionId, index) => {
      if (updatedSections[sectionId]) {
        updatedSections[sectionId].order = index;
      }
    });

    setSettings(prev => ({
      ...prev,
      dashboardSections: updatedSections
    }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const getSortedSections = () => {
    return Object.entries(settings.dashboardSections)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([id]) => id);
  };

  const getVisibleSections = () => {
    return Object.entries(settings.dashboardSections)
      .filter(([, section]) => section.visible)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([id]) => id);
  };

  const getIconForSection = (sectionId, defaultIcon) => {
    const iconMappings = {
      default: {
        kpiCards: defaultIcon,
        quickActions: defaultIcon,
        engagementStats: defaultIcon,
        tasksOverview: defaultIcon,
        upcomingRenewals: defaultIcon,
        recentNotes: defaultIcon,
        calendarSection: defaultIcon, // ✅ Calendar support here
      },
      alternative: {
        kpiCards: defaultIcon,
        quickActions: defaultIcon,
        engagementStats: defaultIcon,
        tasksOverview: defaultIcon,
        upcomingRenewals: defaultIcon,
        recentNotes: defaultIcon,
        calendarSection: defaultIcon, // ✅ Calendar support here
      }
    };

    return iconMappings[settings.iconStyle]?.[sectionId] || defaultIcon;
  };

  const value = {
    settings,
    updateSettings,
    toggleTheme,
    setFontSize,
    setIconStyle,
    toggleSectionVisibility,
    toggleStickyNotesVisibility,
    updateSectionOrder,
    resetToDefaults,
    getSortedSections,
    getVisibleSections,
    getIconForSection
  };

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
}