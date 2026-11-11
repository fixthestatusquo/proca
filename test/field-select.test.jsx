import Gender from "@components/field/Gender";
import Select from "@components/field/Select";
import TextField from "@components/field/TextField";
import { init as initLayout } from "@hooks/useLayout";
import { fireEvent, render } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

initLayout({});

vi.mock("@hooks/useConfig", () => ({
  useCampaignConfig: () => ({ lang: "en" }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    // real i18next throws when exists() gets an object, Select relies on that
    i18n: {
      exists: () => {
        throw new TypeError("keys.forEach is not a function");
      },
    },
    // mimics i18next: missing keys return the key, unless defaultValue is given
    t: (k, o) => (o?.returnObjects && o.defaultValue) || k,
  }),
}));

const options = {
  female: "♀ Female",
  male: "♂ Male",
  na: "– Prefer not to say",
  trans: "⚧ Trans",
};

const Harness = ({ short }) => {
  const form = useForm();
  return (
    <Select
      form={form}
      name="gender"
      label="⚤"
      select="key"
      options={options}
      short={short}
    />
  );
};

const texts = () =>
  Array.from(document.querySelectorAll("option")).map((o) => o.textContent);
const selectedText = () => document.querySelector("select").selectedOptions[0]
  ?.textContent;

describe("Select short labels", () => {
  it("keeps the full text when no short map is given", () => {
    render(<Harness />);
    expect(texts().filter(Boolean).sort()).toEqual(
      Object.values(options).sort()
    );
    fireEvent.change(document.querySelector("select"), {
      target: { value: "female" },
    });
    expect(selectedText()).toBe("♀ Female");
  });

  it("shows the short text closed and the long text in the list", () => {
    render(<Harness short={{ female: "♀", male: "♂" }} />);
    const el = document.querySelector("select");
    fireEvent.change(el, { target: { value: "female" } });
    expect(selectedText()).toBe("♀");
    fireEvent.mouseDown(el);
    expect(texts()).toEqual(expect.arrayContaining(["♀ Female", "♂ Male"]));
    fireEvent.blur(el);
    expect(selectedText()).toBe("♀");
  });

  it("restores the full text when the short map goes away", () => {
    const { rerender } = render(<Harness short={{ female: "♀" }} />);
    const el = document.querySelector("select");
    fireEvent.change(el, { target: { value: "female" } });
    expect(selectedText()).toBe("♀");
    rerender(<Harness />);
    expect(texts().filter(Boolean).sort()).toEqual(
      Object.values(options).sort()
    );
    expect(selectedText()).toBe("♀ Female");
  });
});

describe("Gender", () => {
  it("still lists the options when the locale lacks the gender key", () => {
    const Form = () => {
      const form = useForm();
      return <Gender form={form} />;
    };
    render(<Form />);
    expect(texts().filter(Boolean).sort()).toEqual(
      Object.values(options).sort()
    );
  });
});

describe("TextField", () => {
  it("calls the caller's onBlur after the react-hook-form one", () => {
    const onBlur = vi.fn();
    const Form = () => {
      const form = useForm();
      return <TextField form={form} name="surname" label="surname" onBlur={onBlur} />;
    };
    render(<Form />);
    fireEvent.blur(document.querySelector("input"));
    expect(onBlur).toHaveBeenCalled();
  });
});
