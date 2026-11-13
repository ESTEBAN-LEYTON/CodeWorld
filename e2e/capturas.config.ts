import { defineConfig } from '@playwright/test'
import base from './playwright.config'

// Genera las capturas del informe en docs/capturas: npx playwright test --config capturas.config.ts
export default defineConfig({
  ...base,
  testDir: './capturas',
  projects: [{ name: 'capturas' }],
  reporter: 'list',
})
