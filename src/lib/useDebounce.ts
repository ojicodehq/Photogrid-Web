import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Renvoie `value` débouncée après `delay` ms.
 * Utile pour ne déclencher des side-effects qu'après que le user
 * ait arrêté de bouger un slider.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

/**
 * Wrappe `callback` pour qu'il ne soit invoqué qu'après un silence
 * de `delay` ms entre les appels. Cleanup auto au démontage.
 */
export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  ) as T;

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return debounced;
}

/**
 * État local avec callback débouncé sur changement.
 * Pattern : feedback visuel instantané (renvoyé en `[0]`), mise à jour
 * du store seulement après silence (`onDebouncedChange` invoqué).
 *
 * Utilisé par les sliders du LayoutConfigPanel : le pouce se déplace
 * en temps réel sans throttler chaque update jusqu'au store + Zustand.
 */
export function useDebouncedState<T>(
  initialValue: T,
  onDebouncedChange: (value: T) => void,
  delay = 250,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);
  const callbackRef = useRef(onDebouncedChange);

  // Garder la callback à jour sans déclencher l'effet ci-dessous
  useEffect(() => {
    callbackRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  const previousDebouncedRef = useRef<T>(initialValue);
  useEffect(() => {
    if (debouncedValue !== previousDebouncedRef.current) {
      previousDebouncedRef.current = debouncedValue;
      callbackRef.current(debouncedValue);
    }
  }, [debouncedValue]);

  return [value, setValue];
}
