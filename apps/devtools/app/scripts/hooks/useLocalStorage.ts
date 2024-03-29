import { useCallback, useEffect, useState } from 'react';

export const useLocalStorage = <Value extends any>(
  key: string,
  initialValue: Value,
): [Value, (value: Value) => void] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const stateInitializer = useCallback(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      return initialValue;
    }
  }, [key]);
  const [storedValue, setStoredValue] = useState(stateInitializer);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: Value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  // Update state based on key change
  useEffect(() => {
    const currentState = stateInitializer();
    setStoredValue(currentState);
  }, [key]);

  return [storedValue, setValue];
};
