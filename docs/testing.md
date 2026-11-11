# Testing stack

The widget is on React 17, so the testing stack is pinned to React-17-compatible
versions. The versions are exact (no `^`) in `package.json`.

| Package | Version | Why |
| --- | --- | --- |
| `vitest` | 4.1.12 | Vitest 5 requires Node `^22.12`, `^24`, or `>=26`; this repo currently runs Node 25. |
| `jsdom` | 27.4.0 | Supports Node >=24 and works with Vitest 4. |
| `@testing-library/react` | 12.1.5 | v13+ requires React 18. |
| `@testing-library/dom` | 8.20.1 | Peer dependency of RTL 12. |
| `@testing-library/user-event` | 14.6.1 | Works with RTL 12's DOM version. |
| `@testing-library/jest-dom` | 6.0.1 | Later 6.x versions require `@testing-library/dom >=10`, which conflicts with RTL 12. |
| `msw` | 2.15.0 | Network-level mocking for target lists and submissions. |

## When React is upgraded

Update these together, not individually:

| React | `@testing-library/react` | `@testing-library/dom` | `@testing-library/jest-dom` |
| --- | --- | --- | --- |
| 17 (current) | 12.1.5 | 8.20.1 | 6.0.1 |
| 18 | 14.x | 9.x or 10.x | match the newer DOM peer |
| 19 | 16.x | 10.x | match the newer DOM peer |

React 18+ also changes test assumptions:

- use RTL's `render` instead of `ReactDOM.render`
- expect StrictMode to run effects twice
- use RTL async queries rather than hand-written `act`
