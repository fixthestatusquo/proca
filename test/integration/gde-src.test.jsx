import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@hooks/useInteraction", () => ({ default: () => {} }));

import Src from "@components/bespoke/gde/src";
import Widget from "@components/Widget";
import { configStore } from "@hooks/useConfig";
import { journeyConfig } from "../fixtures/journey.js";

const sync = () => configStore.getState().campaignConfig.component.sync;

const renderSrc = () =>
  render(
    <Widget
      selector=".test-widget"
      journey={["gde_src"]}
      steps={{ gde_src: Src }}
      {...journeyConfig(["gde_src"])}
    />
  );

describe("gde src", () => {
  it("reads the promocode from the data-* attributes", async () => {
    window.history.replaceState({}, "", "/");
    document.body.innerHTML =
      '<div id="proca"></div><div class="test-widget" data-promocode="hallo" data-promocode-phone="moin" data-bannerid="42"></div>';
    renderSrc();
    await waitFor(() => expect(sync()).toBeDefined());
    expect(sync().promoCode).toEqual({ default: "hallo", phone: "moin" });
    expect(sync().bannerId).toBe("42");
  });

  it("lets ?src= win over the data-* attributes", async () => {
    window.history.replaceState({}, "", "/?src=abc-def-ghj");
    document.body.innerHTML =
      '<div id="proca"></div><div class="test-widget" data-promocode="hallo" data-promocode-phone="moin" data-bannerid="42"></div>';
    renderSrc();
    await waitFor(() => expect(sync()).toBeDefined());
    // not dxid encoded, so the raw values are kept
    expect(sync().promoCode).toEqual({ default: "abc", phone: "def" });
    expect(sync().bannerId).toBe("ghj");
  });
});
