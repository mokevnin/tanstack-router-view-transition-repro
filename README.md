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

Versions: `@tanstack/react-router` 1.170.45, Chrome 155.
