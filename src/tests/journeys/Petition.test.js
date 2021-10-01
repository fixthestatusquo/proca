import React from "react";
import ReactDOM from "react-dom";
import Widget from "../../components/Widget";
import { render, fireEvent, screen } from "@testing-library/react";

jest.mock("../../actionPage", () => {
  const originalModule = jest.requireActual("../../actionPage");
  const Register = jest.requireActual("../../components/Register");
  const Share = jest.requireActual("../../components/Share");
  return {
    __esModule: true,
    ...originalModule,
    steps: { Register, Share },
  };
});

jest.mock("react-ipgeolocation", () => {
  return {
    useGeolocation: () => {
      return { country: "es", error: false, isLoading: false };
    },
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
        <Widget {...CONFIG} journey={["Petition"]} />
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
