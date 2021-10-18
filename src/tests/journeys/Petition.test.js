import React from "react";
import Widget from "../../components/Widget";
import { render, screen, act } from "@testing-library/react";

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
    return { country: "US", error: false, isLoading: false };
  };
});
jest.mock("../../hooks/useData.js", () => {
  return {
    initDataState: jest.fn(() => true),
    useData: () => {
      return { data: { comment: "", country: "US" }, setData: jest.fn };
    },
    default: () => {
      return { data: { comment: "", country: "US" }, setData: jest.fn };
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
  journey: ["Register", "Share"],
};

describe("Journeys", () => {
  it("renders petition journey", () => {
    const div = document.createElement("div");
    document.body.append(div);
    div.id = "proca";

    let emailInput;
    let nameInput;
    act(() => {
      render(
        <div>
          <Widget {...CONFIG} />
        </div>
      );
      emailInput = screen.getByRole("textbox", { name: "Email" });
      nameInput = screen.getByRole("textbox", { name: "First name" });
    });

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
  });
});
