import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Petition from "@components/Petition";
import Share from "@components/Share";
import { journeyConfig } from "../fixtures/journey.js";

import Widget from "@components/Widget";

describe("Share journey", () => {
  it("loads the Share component for a Share-only journey", async () => {
    document.body.innerHTML =
      '<div id="proca"></div><div class="test-widget"></div>';

    render(
      <Widget
        selector=".test-widget"
        journey={["Share"]}
        steps={{ Petition, Share }}
        {...journeyConfig(["Share"])}
      />
    );

    expect(await screen.findByText("Share now")).toBeInTheDocument();
    expect(screen.getByText("Tell others about it")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Sign now/i })
    ).not.toBeInTheDocument();
  });
});
