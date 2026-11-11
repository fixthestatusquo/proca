import { describe, expect, it } from "vitest";

import { prepareCustomFields } from "@components/bespoke/gde/src";

describe("gde custom fields", () => {
  it("drops the phone code when no phone is given", () => {
    const data = prepareCustomFields({
      email: "a@b.c",
      promocode: "base",
      promocodephone: "phone",
    });
    expect(data).toEqual({ email: "a@b.c", promocode: "base" });
  });

  it("uses the phone code as the promocode when a phone is given", () => {
    const data = prepareCustomFields({
      phone: "+491234",
      promocode: "base",
      promocodephone: "phone",
    });
    expect(data).toEqual({ phone: "+491234", promocode: "phone" });
  });

  it("still drops the historical spellings", () => {
    const data = prepareCustomFields({
      phone: "+491234",
      promocode: "base",
      promocodePhone: "phone",
    });
    expect(data).toEqual({ phone: "+491234", promocode: "phone" });
  });

  it("keeps the promocode when there is no phone code", () => {
    const data = prepareCustomFields({ phone: "+491234", promocode: "base" });
    expect(data).toEqual({ phone: "+491234", promocode: "base" });
  });
});
