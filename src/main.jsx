import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

// Count what the browser reports as an unhandled promise rejection and show it on the page.
window.__unhandled = []
window.addEventListener('unhandledrejection', (event) => {
  window.__unhandled.push(String(event.reason))
  document.getElementById('count').textContent = String(window.__unhandled.length)
  document.getElementById('last').textContent = String(event.reason)
})

const root = createRootRoute({
  component: () => (
    <>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/a">A</Link>
        <Link to="/b">B</Link>
        <button type="button" onClick={navigateInQuickSuccession}>
          Navigate A, B, A, B right away
        </button>
      </nav>
      <p>
        unhandled rejections: <b id="count">0</b> <code id="last" />
      </p>
      <Outlet />
    </>
  ),
})
const index = createRoute({ getParentRoute: () => root, path: '/', component: () => <h1>Home</h1> })
const a = createRoute({ getParentRoute: () => root, path: '/a', component: () => <h1>Page A</h1> })
const b = createRoute({ getParentRoute: () => root, path: '/b', component: () => <h1>Page B</h1> })

// What a double click or a redirect chain does: the next navigation starts before the previous
// view transition has produced its first frame, so the browser skips it and rejects its `ready`.
// (Navigations issued in the same tick are merged by the router, hence the macrotask between them.)
async function navigateInQuickSuccession() {
  for (const to of ['/a', '/b', '/a', '/b']) {
    void router.navigate({ to })
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

const router = createRouter({
  routeTree: root.addChildren([index, a, b]),
  defaultViewTransition: true,
})

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)
