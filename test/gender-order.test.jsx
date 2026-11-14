import Gender from "@components/field/Gender";
import { init as initLayout } from "@hooks/useLayout";
import { render } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

initLayout({});

vi.mock("@hooks/useConfig", () => ({
  useCampaignConfig: () => ({ lang: "en" }),
}));

// locale keys in alphabetical order, which is not the order we want to display
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, o) =>
      o?.returnObjects
        ? {
            female: "Female",
            male: "Male",
            na: "Prefer not to say",
            trans: "Non-binary",
          }
        : o?.defaultValue || k,
  }),
}));

const Harness = ({ required }) => {
  const form = useForm({ defaultValues: { gender: "" } });
  return <Gender form={form} required={required} />;
};

const values = () =>
  Array.from(document.querySelectorAll("option")).map(o => o.value);

describe("Gender order", () => {
  it("follows the symbol map, blank first when required", () => {
    render(<Harness required />);
    expect(values()).toEqual(["", "female", "male", "trans", "na"]);
  });

  it("keeps the same order when not required", () => {
    render(<Harness />);
    expect(values()).toEqual(["", "female", "male", "trans", "na"]);
  });
});
