import React from "react";
import ReactDOM from "react-dom";
import Widget from "../components/Widget";
import { render } from "@testing-library/react";
import Register from "../components/Register";
import Share from "../components/Share";

jest.doMock("../actionPage", () => {
  const originalModule = jest.requireActual("../actionPage");
  return {
    __esModule: true,
    ...originalModule,
    steps: { Register, Share },
  };
});

// XXX: how can we dynamically find journeys?
const journeys = [
  ["IDontExists"],
  ["Petition"],
  ["Amounts"],
  ["donate/Tab"],
  ["Share"],
  ["ECI"],
  ["Email"],
  ["Petition", "Share"],
  ["Amounts", "donate/Tab"],
];

const CONFIG = {
  actionpage: 42,
  organisation: "Test Organisation",
  lang: "en",
  filename: "filename/en",
  lead: {
    name: "cfo",
    title: "Test Organisation",
  },
  campaign: {
    title: "test-campaign",
    name: "test-campaign",
  },
  locales: {},
  actionPage: 42,
};

describe("Journeys", () => {
  it.each(["Petition"])("renders %s", (journey) => {
    const actionPage = require("../actionPage");
    const div = document.createElement("div");
    document.body.append(div);
    div.id = "proca";

    render(
      <div>
        <Widget selector="#proca" {...CONFIG} journey={[journey]} />
      </div>
    );
  });
});
