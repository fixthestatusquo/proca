import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Petition from "@components/Petition";
import Share from "@components/Share";
import { journeyConfig } from "../fixtures/journey.js";

import Widget from "@components/Widget";

describe("Petition journey", () => {
  it("loads the Petition component for a Petition-only journey", async () => {
    document.body.innerHTML =
      '<div id="proca"></div><div class="test-widget"></div>';

    render(
      <Widget
        selector=".test-widget"
        journey={["Petition"]}
        steps={{ Petition, Share }}
        {...journeyConfig(["Petition"])}
      />
    );

    expect(
      await screen.findByRole("button", { name: /Sign now/i })
    ).toBeInTheDocument();
    expect(screen.queryByText("Share now")).not.toBeInTheDocument();
  });
});
