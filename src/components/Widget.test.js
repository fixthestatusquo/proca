import React from "react";
import { render, screen } from "@testing-library/react";
// 'import Widget from "./Widget";

jest.mock("react-ipgeolocation", () => {
  return () => {
    return { country: "ES", error: false, isLoading: false };
  };
});

describe("Widget", () => {
  it.skip("should show alert if doesn't receive configuration", () => {
    const div = document.createElement("div");
    document.body.append(div);
    div.id = "proca";

    const CONFIG = {
      selector: "#proca",
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

    render(<div>{/* <Widget {...CONFIG} journey={["Petition"]} /> */}</div>);
    expect(screen.getByText("Configuration problem")).toBeInTheDocument();
  });
});
