import React from "react";
import ReactDOM from "react-dom";
import Widget from "../components/Widget";

it("renders", () => {
  const div = document.createElement("div");
  document.body.append(div);
  div.id = "proca";
  ReactDOM.render(<Widget selector="#proca" journey={["Petition"]} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
