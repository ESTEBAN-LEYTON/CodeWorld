import { defineConfig, devices } from '@playwright/test'

// Levanta la API contra la base de pruebas y el build de producción del frontend (con service worker).
const API = 3100
const WEB = 4173

export default defineConfig({
  testDir: './pruebas',
  // Comparten la base de datos, y el rendimiento se mide sin otros navegadores compitiendo.
  workers: 1,
  timeout: 60_000,
  reporter: [['list'], ['json', { outputFile: 'resultados/resultados.json' }]],
  outputDir: 'resultados/artefactos',
  use: {
    baseURL: `http://localhost:${WEB}`,
    locale: 'es-CL',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'computador', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
    { name: 'tableta', use: { ...devices['Galaxy Tab S9'] } },
  ],
  webServer: [
    {
      command: 'npx tsx src/test/servidor-e2e.ts',
      cwd: '../backend',
      env: { PORT: String(API) },
      url: `http://localhost:${API}/api/health`,
      reuseExistingServer: false,
    },
    {
      command: `npm run build && npx vite preview --port ${WEB} --strictPort`,
      cwd: '../frontend',
      env: { API_PROXY: `http://localhost:${API}` },
      url: `http://localhost:${WEB}`,
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
})
