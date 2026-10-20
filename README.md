# TanStack Router: a skipped view transition throws an unhandled AbortError

Reproduction for https://github.com/TanStack/router/issues/8776 (no test runner involved).

    npm install
    npm run dev

Open the page in Chrome and press **Navigate A, B, A, B right away**. The counter under the links
goes up and the console shows
`Uncaught (in promise) AbortError: Transition was skipped. New ViewTransition started`.

Clicking the "A" and "B" links by hand does it only when two clicks land within about one frame
(measured: gaps of 0, 5 and 16 ms fail, 40 ms and more do not).

The router only awaits `updateCallbackDone` of the transition `document.startViewTransition()`
returns; the transition's `ready` promise is left without a handler. Wrapping
`document.startViewTransition` so the result gets `t.ready.catch(() => {})` and
`t.finished.catch(() => {})` makes the error go away.

## Tests

    npm test

Playwright drives the app in the installed Chrome (`channel: 'chrome'` in `playwright.config.js`;
to use Playwright's own Chromium, run `npx playwright install chromium` and remove `channel`) and
treats an unhandled promise rejection as a failure:

| test | result |
|---|---|
| the button that navigates A, B, A, B in quick succession | fails: `AbortError: Transition was skipped. New ViewTransition started` |
| link clicks with no pause between them | fails: the same `AbortError` |
| link clicks 120 ms apart (control) | passes |

Versions: `@tanstack/react-router` 1.170.45, Chrome 155.
