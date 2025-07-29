# Consultation form architecture

EU consultation-like form supports different question types, user roles (citizen, expert, etc.), and localized content.

---

## 🔧 JSON Configuration (Campaign-Level)

Campaign includes a JSON config like:

```json
"config": {
  "component": {
    "consultation": {
        "steps": {
        "citizen": { "questions": ["id1", "id2", ...] },
        "expert": { "questions": ["id1", "id2", ...] },
        "you": { "questions": ["id1", "id2",] }
      }
    }
  }
}
```

---

## 📦 Blueprint JSON (Survey Definition)

Hosted at:

```
https://static.proca.app/survey/<campaign>/<lang>.json
```

Each entry looks like:

```json
{
  "id": 153168224,
  "type": "SingleChoiceQuestion",
  "title": "How should EU regulate housing?",
  "possibleAnswers": [...]
  ...
}
```

- **Type**: One of `FreeTextQuestion`, `SingleChoiceQuestion`, `MultipleChoiceQuestion`, `AIAssistedQuestion`, etc.
- **Dependencies**: `possibleAnswers[*].dependentElementsString` = semicolon-separated list of child question IDs.

---

## 🧩 Key React Components

### `useConsultJson(name, lang)`

Fetches the blueprint JSON and generates **attributeName** for each field as stingified ID.

### `<Survey />`

Renders a list of questions based on a provided list of question IDs in campaign config.

```jsx
<Survey form={form} handleNext={handleNext} questions={questions} ids={qids} />
```

### `<Questions />`

Switch component that maps JSON types to field components:

- `TextField`, `AITextField`
- `SingleSelect`, `MultiSelectCheckbox`
- `Typography` for `Text`/`Section`
- Supports dependent questions

### `<AboutYou />`

A sample use-case, rendering the “you” step of the form:

- Includes name + address fields
- Appends relevant questions using `<SurveyStep />`

### `Register`

The final step of the consultation flow (`submit`) uses the standard `<Register />` component from Proca’s form ecosystem to collect final contact info

---

## ✅ Supported Question Types

| Type                     | Component             | Notes                |
| ------------------------ | --------------------- | -------------------- |
| `FreeTextQuestion`       | `TextField`           | Multi-line if long   |
| `AIAssistedQuestion`     | `AITextField`         | AI-assisted input    |
| `SingleChoiceQuestion`   | `SingleSelect`        | Radio                |
| `MultipleChoiceQuestion` | `MultiSelectCheckbox` | Optional max choices |
| `Section`, `Text`        | `Typography`          | Headings or info     |
| `Upload`                 | _Not yet implemented_ | Logs warning         |

---

## 🧠 Dependencies

- Answers can trigger follow-up questions using `dependentElementsString`.

---

## 📌 Known gaps

- `Upload` question type not implemented
- Required field not solved
