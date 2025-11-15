import '@testing-library/jest-dom/vitest';
import React from 'react';

// Make React available globally for JSX
global.React = React;

// Mock window.matchMedia for react-slick and responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});
