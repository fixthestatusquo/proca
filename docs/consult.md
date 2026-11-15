# 🗳️ Consultation

Dynamic React component that replicates the **European Commission’s public consultation forms** — allowing organizations to collect responses through a customizable, embeddable form.

It provides an adaptable, configurable survey experience with registration and optional AI-assisted input fields.

## ⚙️ Overview

Dynamically renders fully modular survey based on configuration and remote JSON schemas, enabling:

- **Customizable form questions** — include/exclude questions or sections per campaign
- **Overridden text and translations**
- **Pre-filled or pre-checked answers**
- **AI-assisted fields** (via `snowflaike.proca.app` endpoint)
- **Step-based navigation** (Survey → Register)

---

## 🚀 How It Works

### 1. Configuration

Each campaign defines its widget configuration under:

```json
{
  "component": {
    "consultation": {
      "name": "green-deal-survey",
      "steps": {
        "citizen": {
          "questions": [153167796, 153168305, 153168311]
        }
      },
      "default": {
        "country": "DE"
      },
      "selection": [153167796, 153168305]
    }
  }
}
```

Only elements from the configured questions list will be rendered.
Required fields from the original EU consultation form must either be included or have a predefined default value.

The widget combines:

- **Local config questions** (from campaign config)
- **Remote JSON questions** (fetched from `https://static.proca.app/survey/{name}/{lang}.json`)

### 2. Data Loading (`useQuestions`)

`useQuestions`:

- Fetches the remote JSON schema of questions
- Merges it with campaign-defined overrides (titles, required flags, margins, translations)
- Supports disabling remote fetch via `config.component.consultation.remote = false`

### 3. Config-only questions (`survey/Index`)

When the questions live entirely in the campaign config, import `survey/Index` instead of `survey/Main`. It renders `component.consultation.fields` and never fetches, so no `remote` flag is needed.

```json
{
  "import": ["survey/Index"],
  "component": {
    "consultation": {
      "fields": [
        {
          "id": "why",
          "type": "MultipleChoiceQuestion",
          "title": "Why?",
          "maxChoices": 2,
          "required": true,
          "possibleAnswers": [
            { "id": 1, "text": "Because", "dependentElementsString": "2" }
          ]
        },
        { "id": 2, "type": "FreeTextQuestion", "title": "Tell us more" }
      ]
    },
    "register": { "custom": { "bottom": ["survey_Index"] } }
  }
}
```

Every property of a field is passed through unchanged (same schema as the remote JSON). Only `title` and `possibleAnswers[].text` are looked up in `campaign:fields.<id>`, and `attributeName` defaults to `String(id)`.

### 4. Steps

- **Step 0 – Survey:** renders dynamic questions via `<SurveyStep />` (citizen questions only)
- **Step 1 – Register:** wraps the registration form

#### 4.1 Injecting custom survey fields on the Register step

Allows adding extra fields to the registration step by specifying question ID(s) in `config.component.consultation.selection` array. To render those questions, in the campaign config add:

```json
"register": {
  "custom": {
    "top": ["survey_Main"]
  },
  "import": ["survey/Main"]
}
```

---

## 🧠 Question Rendering

The `Questions` component renders questions defined by ID list, using a flexible schema from the JSON definition.

Supported `type` values and components:

| Type                        | Component               | Description                         |
| --------------------------- | ----------------------- | ----------------------------------- |
| `FreeTextQuestion`          | `<TextField>`           | Plain text input                    |
| `SnowflakeAssistedQuestion` | `<SnowflakeTextField>`  | AI-assisted field via Snowflake API |
| `AIAssistedQuestion`        | `<AITextField>`         | GPT-based text suggestion           |
| `SingleChoiceQuestion`      | `<SingleSelect>`        | Radio buttons (single choice)       |
| `MultipleChoiceQuestion`    | `<MultiSelectCheckbox>` | Checkbox group (multi choice)       |
| `Section`                   | Typography heading      |                                     |
| `Text`                      | Informational paragraph |                                     |
| `Upload`                    | Not yet implemented     |                                     |

Each question supports:

- `required`
- `maxCharacters`
- `possibleAnswers` (with `dependentElementsString`)
- `margin` override
- `attributeName` (used as form field key)

---

## 💡 Dependent Questions

Some questions trigger sub-questions based on selected answers.

```js
"possibleAnswers": [
  {
    "id": 1,
    "text": "Yes",
    "dependentElementsString": "2;3"
  },
  {
    "id": 4,
    "text": "No"
  }
]
```

When "Yes" is selected, questions `2` and `3` are dynamically rendered as dependent fields.

---

## Translations

To default answers in multiple languages, put `multilingual: fallback` in `component.consultation`.
Animalconsult example:

```js
"component": {
     "consultation": {
                  "160002721": {
            "multilingual": "Fish and fish products"
          }
     }
}
```

and add translations under `campaign: survey.id` in locales:

```js
"de": {
        "campaign:": {
          "survey": {
            "160002721": "Fisch und Fischprodukte"
          }
        }
}
```

## 🧱 Extensibility

- Add new question types in `Questions.jsx`

---
