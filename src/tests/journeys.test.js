import React from "react";
import ReactDOM from "react-dom";
import Widget from "../components/Widget";

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

journeys.forEach((journey) => {
  it("renders", () => {
    const div = document.createElement("div");
    document.body.append(div);
    div.id = "proca";
    ReactDOM.render(<Widget selector="#proca" journey={journey} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
