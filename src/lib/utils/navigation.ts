'use client';

import type { NavigationState } from '@/lib/types/navigation';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'dashboard-navigation-state';

export function useNavigationState() {
  const [state, setState] = useState<NavigationState>({
    isSidebarCollapsed: false,
    activeItem: null,
    expandedSections: [],
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(parsed);
      } catch (error) {
        console.error('Failed to parse navigation state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSidebarCollapsed: !prev.isSidebarCollapsed,
    }));
  }, []);

  const setActiveItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      activeItem: itemId,
    }));
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setState((prev) => ({
      ...prev,
      expandedSections: prev.expandedSections.includes(sectionId)
        ? prev.expandedSections.filter((id) => id !== sectionId)
        : [...prev.expandedSections, sectionId],
    }));
  }, []);

  return {
    ...state,
    toggleSidebar,
    setActiveItem,
    toggleSection,
  };
}
