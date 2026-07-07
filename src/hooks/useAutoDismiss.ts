import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoDismissOptions {
  active: boolean;
  delayMs?: number;
  fadeMs?: number;
  onDismiss: () => void;
}

const DEFAULT_DELAY_MS = 4000;
const DEFAULT_FADE_MS = 400;

export function useAutoDismiss({
  active,
  delayMs = DEFAULT_DELAY_MS,
  fadeMs = DEFAULT_FADE_MS,
  onDismiss,
}: UseAutoDismissOptions) {
  const [exiting, setExiting] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const dismissNow = useCallback(() => {
    setExiting(true);
    window.setTimeout(() => {
      setExiting(false);
      onDismissRef.current();
    }, fadeMs);
  }, [fadeMs]);

  useEffect(() => {
    if (!active) {
      setExiting(false);
      return;
    }

    const timer = window.setTimeout(dismissNow, delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs, dismissNow]);

  return { exiting, dismissNow };
}
