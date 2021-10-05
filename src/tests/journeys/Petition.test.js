import React from "react";
import Widget from "../../components/Widget";
import { render, fireEvent, screen } from "@testing-library/react";

jest.mock("../../actionPage", () => {
  const originalModule = jest.requireActual("../../actionPage");
  const Register = jest.requireActual("../../components/Register").default;
  const Share = jest.requireActual("../../components/Share").default;

  return {
    __esModule: true,
    ...originalModule,
    config: {
      actionpage: 42,
      organisation: "Fix The Status Quo",
      lang: "en",
      filename: "destroy-earth.Vogons",
      lead: { name: "ftsq", title: "Fix The Status Quo" },
      campaign: {
        title: "The Hitchhiker's Guide to the Galaxy",
        name: "do-not-panic",
      },
      journey: ["Register", "Share"],
      layout: {},
      component: {},
      locales: { "campaign:": { description: "1. Overthrow capitalism" } },
    },
    steps: { Register: Register, Share: Share },
  };
});

jest.mock("react-ipgeolocation", () => {
  return () => {
    return { country: "ES", error: false, isLoading: false };
  };
});

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

describe("Journeys", () => {
  it("renders petition journey", () => {
    const div = document.createElement("div");
    document.body.append(div);
    div.id = "proca";

    render(
      <div>
        <Widget {...CONFIG} journey={["Register", "Share"]} />
      </div>
    );

    const nameInput = screen.getByRole("input", { name: "firstname" });
    const emailInput = screen.getByRole("input", { name: "email" });
    const signUpButton = screen.getByRole("button", {
      name: "Añade mi nombre",
    });
    const optOutOption = screen.getByRole("input", {
      name: "privacy",
      value: "opt-out",
    });

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: "Hari" } });
    fireEvent.change(emailInput, { target: { value: "Seldon" } });
    fireEvent.click(signUpButton);
    fireEvent.change(optOutOption);
  });
});
