// Configuração dos testes de ponta a ponta (Playwright).
// O próprio Playwright sobe o servidor local antes de rodar os testes.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'pt-BR',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'computador', use: { ...devices['Desktop Chrome'] } }
    // Para rodar os mesmos testes simulando um celular, descomente a linha abaixo:
    // , { name: 'celular', use: { ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI
  }
});
