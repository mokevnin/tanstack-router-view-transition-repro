import { expect, test } from '@playwright/test'

// Playwright reports a promise rejection nobody handled as a `pageerror`.
function collectPageErrors(page) {
  const errors = []
  page.on('pageerror', (error) => errors.push(`${error.name}: ${error.message}`))
  return errors
}

test('pressing the quick-succession button leaves no unhandled rejection', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/')

  await page.getByRole('button', { name: 'Navigate A, B, A, B right away' }).click()
  await expect(page).toHaveURL(/\/b$/)
  await page.waitForTimeout(1000)

  // Fails: ["AbortError: Transition was skipped. New ViewTransition started", ...]
  expect(errors).toEqual([])
})

test('clicking the links with no pause between clicks leaves no unhandled rejection', async ({
  page,
}) => {
  const errors = collectPageErrors(page)
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'B' })).toBeVisible()

  // Same-task clicks, as a double click or a redirect chain would produce.
  await page.evaluate(async () => {
    const [a, b] = document.querySelectorAll('nav a')
    for (const link of [a, b, a, b]) {
      link.click()
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  })
  await expect(page).toHaveURL(/\/b$/)
  await page.waitForTimeout(1000)

  // Fails with the same AbortError.
  expect(errors).toEqual([])
})

// The control: with a pause of a few frames between the clicks the transition is not skipped
// before its first frame, so nothing is rejected. This one passes.
test('clicking the links with 120 ms between clicks leaves no unhandled rejection', async ({
  page,
}) => {
  const errors = collectPageErrors(page)
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'B' })).toBeVisible()

  await page.evaluate(async () => {
    const [a, b] = document.querySelectorAll('nav a')
    for (const link of [a, b, a, b]) {
      link.click()
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
  })
  await expect(page).toHaveURL(/\/b$/)
  await page.waitForTimeout(1000)

  expect(errors).toEqual([])
})
