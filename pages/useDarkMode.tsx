import { useState, useEffect } from 'react';

type UseDarkModeReturnType = [
  darkMode: boolean,
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>,
];

const useDarkMode = (): UseDarkModeReturnType => {
  const [darkMode, setDarkMode] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    }
  }, [hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }
  }, [darkMode, hasMounted]);

  return [darkMode, setDarkMode];
};

export default useDarkMode;
