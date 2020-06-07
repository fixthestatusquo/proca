import { useLayoutEffect, useState } from 'react';

function useElementSize(selector) {
  const delay = 250; // debounce delay
  let timeout = false;

  const [size, setSize] = useState(0);
  useLayoutEffect(() => {
    const el = document.querySelector(selector);
    function updateSize() {
      if (!el) return;
      setSize(el.scrollWidth);
    }

    function debouncedUpdateSize () {
     clearTimeout(timeout);
     timeout = setTimeout(updateSize, delay);
    }

    window.addEventListener('resize', debouncedUpdateSize);
    updateSize();
    return () => window.removeEventListener('resize', debouncedUpdateSize);
  }, []);
  return size;
}



export default useElementSize;
