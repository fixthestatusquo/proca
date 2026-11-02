import { describe, expect, it } from "vitest";
import { get } from "./object.js";

describe("get", () => {
  const object = { a: { b: { c: 42 } }, "ns:key": { value: "ok" } };

  it("reads a nested path", () => {
    expect(get(object, "a.b.c")).toBe(42);
  });

  it("returns undefined for a missing path", () => {
    expect(get(object, "a.missing.c")).toBeUndefined();
  });

  it("returns the default value when the path is missing", () => {
    expect(get(object, "a.missing.c", "fallback")).toBe("fallback");
  });

  it("supports keys containing colons", () => {
    expect(get(object, "ns:key.value")).toBe("ok");
  });
});
