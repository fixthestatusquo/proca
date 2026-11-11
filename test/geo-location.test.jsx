import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useGeoLocation from "react-ipgeolocation";

const Probe = ({ country }) => {
  const { country: found } = useGeoLocation({ api: "/geo", country });
  return <span>{found}</span>;
};

describe("useGeoLocation", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses the country from the api", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ country: "BE" }),
    }));
    const { container } = render(<Probe />);
    await vi.waitFor(() => expect(container.textContent).toBe("BE"));
  });

  it("does not set state when the fetch resolves after unmount", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    let resolve;
    globalThis.fetch = vi.fn(
      () =>
        new Promise(r => {
          resolve = r;
        })
    );
    const { unmount } = render(<Probe />);
    unmount();
    resolve({ ok: true, json: async () => ({ country: "BE" }) });
    await new Promise(r => setTimeout(r, 0));
    expect(error).not.toHaveBeenCalled();
  });
});
