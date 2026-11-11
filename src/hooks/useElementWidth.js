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
        if (entry.contentBoxSize?.length) {
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

// compact when the container (not the window) is narrow: the widget can sit in a panel or iframe
function useCompactLayout(selector, _maxWidth) {
  const [width, setWidth] = useState(0);
  const maxWidth = _maxWidth || 380;
  useLayoutEffect(() => {
    const el = document.querySelector(selector || "#proca-register");
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selector]);
  return width <= maxWidth; // 0 before the first measure: keep the compact default
}

export { useElementWidth, useElementSize, useCompactLayout };
export default useElementWidth;
