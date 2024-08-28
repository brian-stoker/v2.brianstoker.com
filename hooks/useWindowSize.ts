import { useCallback, useState } from 'react';
import useEventListener from './useEventListener';

const isBrowser = typeof document !== 'undefined';

export function useWindowWidth(): number | null {
  const [windowWidth, setWindowWidth] = useState(isBrowser ? window.innerWidth : null);

  const getWindowWidth = useCallback(() => setWindowWidth(window.innerWidth), []);

  useEventListener(isBrowser ? window : null, 'resize', getWindowWidth);

  return windowWidth;
}

export function useWindowHeight(): number | null {
  const [windowHeight, setWindowHeight] = useState(isBrowser ? window.innerWidth : null);

  const getWindowHeight = useCallback(() => setWindowHeight(window.innerHeight), []);

  useEventListener(isBrowser ? window : null, 'resize', getWindowHeight);

  return windowHeight;
}

export default function useWindowSize(): { width: number | null, height: number | null} {
  return { width: useWindowWidth(), height: useWindowHeight()};
}