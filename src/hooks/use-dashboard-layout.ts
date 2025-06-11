import type {
  DashboardComponent,
  DashboardLayout,
  DashboardState,
  GridItemLayout,
} from '@/lib/types/dashboard';
import { useCallback, useEffect, useState } from 'react';

interface UseDashboardLayoutOptions {
  initialLayout?: DashboardLayout;
  persistToLocalStorage?: boolean;
  storageKey?: string;
}

interface UseDashboardLayoutReturn extends DashboardState {
  addComponent: (component: DashboardComponent) => void;
  removeComponent: (componentId: string) => void;
  updateComponent: (componentId: string, updates: Partial<DashboardComponent>) => void;
  updateLayout: (newLayout: GridItemLayout[]) => void;
  resetLayout: () => void;
  toggleEditMode: () => void;
  selectLayout: (layoutId: string) => void;
  createLayout: (layout: DashboardLayout) => void;
  deleteLayout: (layoutId: string) => void;
}

const DEFAULT_LAYOUT: DashboardLayout = {
  id: 'default',
  name: 'Default Dashboard',
  description: 'Standard dashboard layout',
  components: [],
  gridCols: { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  rowHeight: 100,
  compactType: 'vertical',
  preventCollision: false,
  isResizable: true,
  isDraggable: true,
  margin: [10, 10],
  containerPadding: [20, 20],
  useCSSTransforms: true,
};

export function useDashboardLayout({
  initialLayout = DEFAULT_LAYOUT,
  persistToLocalStorage = true,
  storageKey = 'dashboard-layout',
}: UseDashboardLayoutOptions = {}): UseDashboardLayoutReturn {
  const [state, setState] = useState<DashboardState>(() => {
    if (persistToLocalStorage && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            activeLayout: parsed.activeLayout || initialLayout,
            layouts: parsed.layouts || [initialLayout],
            selectedComponents: [],
            isEditing: false,
            refreshStatus: {},
          };
        } catch (e) {
          console.error('Failed to parse stored layout:', e);
        }
      }
    }

    return {
      activeLayout: initialLayout,
      layouts: [initialLayout],
      selectedComponents: [],
      isEditing: false,
      refreshStatus: {},
    };
  });

  // Persist to localStorage when state changes
  useEffect(() => {
    if (persistToLocalStorage && typeof window !== 'undefined') {
      const toStore = {
        activeLayout: state.activeLayout,
        layouts: state.layouts,
      };
      localStorage.setItem(storageKey, JSON.stringify(toStore));
    }
  }, [state.activeLayout, state.layouts, persistToLocalStorage, storageKey]);

  const addComponent = useCallback((component: DashboardComponent) => {
    setState((prev) => {
      if (!prev.activeLayout) return prev;

      const newComponent = {
        ...component,
        id: component.id || `component-${Date.now()}`,
        visible: component.visible !== false,
      };

      const updatedLayout = {
        ...prev.activeLayout,
        components: [...prev.activeLayout.components, newComponent],
      };

      return {
        ...prev,
        activeLayout: updatedLayout,
        layouts: prev.layouts.map((l) => (l.id === updatedLayout.id ? updatedLayout : l)),
      };
    });
  }, []);

  const removeComponent = useCallback((componentId: string) => {
    setState((prev) => {
      if (!prev.activeLayout) return prev;

      const updatedLayout = {
        ...prev.activeLayout,
        components: prev.activeLayout.components.filter((c) => c.id !== componentId),
      };

      return {
        ...prev,
        activeLayout: updatedLayout,
        layouts: prev.layouts.map((l) => (l.id === updatedLayout.id ? updatedLayout : l)),
      };
    });
  }, []);

  const updateComponent = useCallback(
    (componentId: string, updates: Partial<DashboardComponent>) => {
      setState((prev) => {
        if (!prev.activeLayout) return prev;

        const updatedLayout = {
          ...prev.activeLayout,
          components: prev.activeLayout.components.map((c) =>
            c.id === componentId ? { ...c, ...updates } : c
          ),
        };

        return {
          ...prev,
          activeLayout: updatedLayout,
          layouts: prev.layouts.map((l) => (l.id === updatedLayout.id ? updatedLayout : l)),
        };
      });
    },
    []
  );

  const updateLayout = useCallback((newLayout: GridItemLayout[]) => {
    setState((prev) => {
      if (!prev.activeLayout) return prev;

      const layoutMap = new Map(newLayout.map((item) => [item.i, item]));

      const updatedLayout = {
        ...prev.activeLayout,
        components: prev.activeLayout.components.map((component) => {
          const layoutItem = layoutMap.get(component.id);
          if (layoutItem) {
            return {
              ...component,
              layout: layoutItem,
            };
          }
          return component;
        }),
      };

      return {
        ...prev,
        activeLayout: updatedLayout,
        layouts: prev.layouts.map((l) => (l.id === updatedLayout.id ? updatedLayout : l)),
      };
    });
  }, []);

  const resetLayout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeLayout: initialLayout,
      layouts: prev.layouts.map((l) => (l.id === initialLayout.id ? initialLayout : l)),
    }));
  }, [initialLayout]);

  const toggleEditMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEditing: !prev.isEditing,
    }));
  }, []);

  const selectLayout = useCallback((layoutId: string) => {
    setState((prev) => {
      const layout = prev.layouts.find((l) => l.id === layoutId);
      if (!layout) return prev;

      return {
        ...prev,
        activeLayout: layout,
      };
    });
  }, []);

  const createLayout = useCallback((layout: DashboardLayout) => {
    setState((prev) => ({
      ...prev,
      layouts: [...prev.layouts, layout],
      activeLayout: layout,
    }));
  }, []);

  const deleteLayout = useCallback((layoutId: string) => {
    setState((prev) => {
      const filteredLayouts = prev.layouts.filter((l) => l.id !== layoutId);
      const newActiveLayout =
        prev.activeLayout?.id === layoutId
          ? filteredLayouts[0] || DEFAULT_LAYOUT
          : prev.activeLayout;

      return {
        ...prev,
        layouts: filteredLayouts.length > 0 ? filteredLayouts : [DEFAULT_LAYOUT],
        activeLayout: newActiveLayout,
      };
    });
  }, []);

  return {
    ...state,
    addComponent,
    removeComponent,
    updateComponent,
    updateLayout,
    resetLayout,
    toggleEditMode,
    selectLayout,
    createLayout,
    deleteLayout,
  };
}

// Preset dashboard layouts for common use cases
export const presetLayouts: Record<string, DashboardLayout> = {
  financial: {
    id: 'financial',
    name: 'Financial Overview',
    description: 'Focus on revenue, collections, and financial KPIs',
    components: [],
    gridCols: 4,
    rowHeight: 100,
    compactType: 'vertical',
    preventCollision: false,
    isResizable: true,
    isDraggable: true,
    margin: [10, 10],
    containerPadding: [20, 20],
    useCSSTransforms: true,
  },
  clinical: {
    id: 'clinical',
    name: 'Clinical Dashboard',
    description: 'Patient appointments, treatments, and provider metrics',
    components: [],
    gridCols: 3,
    rowHeight: 120,
    compactType: 'vertical',
    preventCollision: false,
    isResizable: true,
    isDraggable: true,
    margin: [10, 10],
    containerPadding: [20, 20],
    useCSSTransforms: true,
  },
  executive: {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level KPIs and trend analysis',
    components: [],
    gridCols: 4,
    rowHeight: 100,
    compactType: 'vertical',
    preventCollision: false,
    isResizable: false,
    isDraggable: false,
    margin: [15, 15],
    containerPadding: [30, 30],
    useCSSTransforms: true,
  },
};
