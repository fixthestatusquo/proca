import { useLayoutEffect, useState } from "react";

const useElementSize = selector => {
  //changes everytime the element changes
  const [size, _setSize] = useState({ width: 333, height: 333 }); // easier to debug than 0

  const setSize = state => {
    _setSize(prev => {
      if (prev.width === state.width && prev.height === state.height)
        return prev; // do not update
      return state;
    });
  };
  useLayoutEffect(() => {
    const el = document.querySelector(selector);
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentBoxSize && entry.contentBoxSize.length) {
          setSize(entry.contentBoxSize[0]);
          return;
        }
        setSize(entry.contentRect);
      }
    });
    resizeObserver.observe(el);
  }, [selector]);
  return size;
};

function useElementWidth(selector) {
  // changes only when the window size changes
  const delay = 250; // debounce delay

  const [size, setSize] = useState(0);
  useLayoutEffect(() => {
    let timeout = false;
    const el = document.querySelector(selector);
    function updateSize() {
      if (!el) return;
      setSize(el.scrollWidth);
    }

    function debouncedUpdateSize() {
      clearTimeout(timeout);
      timeout = setTimeout(updateSize, delay);
    }

    window.addEventListener("resize", debouncedUpdateSize);
    updateSize();
    return () => window.removeEventListener("resize", debouncedUpdateSize);
  }, [selector]);
  return size;
}

function useCompactLayout(selector, _maxWidth) {
  const [compact, setCompact] = useState(true);
  const width = useElementWidth(selector || "#proca-register");
  const maxWidth = _maxWidth || 380;
  if ((compact && width > maxWidth) || (!compact && width <= maxWidth))
    setCompact(width <= maxWidth);
  return compact;
}

export { useElementWidth, useElementSize, useCompactLayout };
export default useElementWidth;
