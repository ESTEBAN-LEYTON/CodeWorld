import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: ['./src/test/preparar-db.ts'],
    // Las pruebas de integración comparten una sola base de datos.
    fileParallelism: false,
  },
})
