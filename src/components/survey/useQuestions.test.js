import { localizeConfigQuestions } from "@components/survey/useQuestions";
import { describe, expect, it } from "vitest";

const config = fields => ({ component: { consultation: { fields } } });

describe("localizeConfigQuestions", () => {
  it("keeps the whole question definition from the config", () => {
    const [q] = localizeConfigQuestions(
      config([
        {
          id: 7,
          type: "MultipleChoiceQuestion",
          title: "Pick two",
          maxChoices: 2,
          help: "a hint",
          margin: 1,
          required: true,
          possibleAnswers: [
            { id: 1, text: "A", dependentElementsString: "2;3" },
            { id: 2, text: "B" },
          ],
        },
      ])
    );

    expect(q).toEqual({
      id: 7,
      type: "MultipleChoiceQuestion",
      title: "Pick two",
      maxChoices: 2,
      help: "a hint",
      margin: 1,
      required: true,
      attributeName: "7",
      possibleAnswers: [
        { id: 1, text: "A", dependentElementsString: "2;3" },
        { id: 2, text: "B" },
      ],
    });
  });

  it("returns nothing without config fields", () => {
    expect(
      localizeConfigQuestions({ component: { consultation: {} } })
    ).toEqual([]);
    expect(localizeConfigQuestions({})).toEqual([]);
  });
});
