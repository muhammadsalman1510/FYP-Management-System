import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

// This hook reads and sets the color mode (light or dark)
// It stores the preference in localStorage so it persists after refresh
// It applies 'dark' class to <html> element which CSS can use
const useColorMode = () => {
  const [colorMode, setColorMode] = useLocalStorage('color-theme', 'light');

  useEffect(() => {
    const htmlElement = document.querySelector('html');
    if (!htmlElement) return;

    if (colorMode === 'dark') {
      // Add dark class to html element
      htmlElement.classList.add('dark');
      // Apply dark background to body
      document.body.style.backgroundColor = '#1a222c';
      document.body.style.color = '#adb7be';
    } else {
      // Remove dark class from html element
      htmlElement.classList.remove('dark');
      // Restore light background
      document.body.style.backgroundColor = '#f1f5f9';
      document.body.style.color = '#64748b';
    }
  }, [colorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;