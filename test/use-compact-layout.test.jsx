import { useCompactLayout } from "@hooks/useElementWidth";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

let trigger;
globalThis.ResizeObserver = class {
  constructor(callback) {
    trigger = callback;
  }
  observe() {}
  disconnect() {}
};

const Probe = () => {
  const compact = useCompactLayout("#proca-register", 380);
  return <span>{compact ? "compact" : "wide"}</span>;
};

describe("useCompactLayout", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="proca-register"></div>';
  });

  it("follows the container width, not the window", () => {
    const { container } = render(<Probe />);
    expect(container.textContent).toBe("compact");

    act(() => trigger([{ contentRect: { width: 600 } }]));
    expect(container.textContent).toBe("wide");

    act(() => trigger([{ contentRect: { width: 300 } }]));
    expect(container.textContent).toBe("compact");
  });
});
