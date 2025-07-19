import '@testing-library/jest-dom';

interface MediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
  addListener: (callback: (e: MediaQueryListEvent) => void) => void;
  removeListener: (callback: (e: MediaQueryListEvent) => void) => void;
  addEventListener: (type: string, callback: (e: MediaQueryListEvent) => void) => void;
  removeEventListener: (type: string, callback: (e: MediaQueryListEvent) => void) => void;
  dispatchEvent: (event: Event) => boolean;
}

const createVoidMockFunction = () => {
  return function mockFunction() {
    // Do nothing
  };
};

const createBooleanMockFunction = () => {
  return function mockFunction() {
    return true;
  };
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: function mockMatchMedia(query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: createVoidMockFunction(),
      removeListener: createVoidMockFunction(),
      addEventListener: createVoidMockFunction(),
      removeEventListener: createVoidMockFunction(),
      dispatchEvent: createBooleanMockFunction(),
    };
  },
}); 