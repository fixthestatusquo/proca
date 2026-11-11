import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@hooks/useInteraction", () => ({ default: () => {} }));

import Src from "@components/bespoke/gde/src";
import Widget from "@components/Widget";
import { configStore } from "@hooks/useConfig";
import { journeyConfig } from "../fixtures/journey.js";

const sync = () => configStore.getState().campaignConfig.component.sync;

// the page calls proca.Widget() itself, so no data prop reaches the component.
// single test: initDataState only builds the form data store once per page
describe("data-* on the script tag and on the .proca-widget div", () => {
  it("merges both, the div winning", async () => {
    window.history.replaceState({}, "", "/");
    document.body.innerHTML =
      '<div id="proca" class="proca-widget"></div>' +
      '<div class="test-widget" data-promocode="fromdiv"></div>';
    // jsdom drops <script> from innerHTML
    const script = document.createElement("script");
    script.id = "proca";
    script.dataset.bannerid = "fromscript";
    document.body.appendChild(script);
    window.drupalSettings = { user: { uid: 1234 } }; // enables the debug block
    render(
      <Widget
        selector=".test-widget"
        journey={["gde_src"]}
        steps={{ gde_src: Src }}
        data={{}}
        {...journeyConfig(["gde_src"])}
      />
    );
    await waitFor(() => expect(sync()).toBeDefined());
    // the div value reaches sync() through the form data only
    expect(sync().promoCode).toEqual({ default: "fromdiv" });
    // the script-only attribute is still there
    expect(sync().bannerId).toBe("fromscript");
    // the debug block in gde/src.js is shown (test mode) and lists the values
    await waitFor(() => expect(document.body.textContent).toContain("promocode"));
    expect(document.body.textContent).toContain("fromdiv");
  });
});
