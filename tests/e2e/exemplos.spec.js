// Testes de ponta a ponta de exemplo: abrem o navegador e usam o app como uma pessoa.
// Rode com:  npm run test:e2e        (ou npm run test:e2e:ver para assistir)
//
// Todos estes testes passam. Use-os como modelo para escrever os seus.
import { test, expect } from '@playwright/test';

// Cada teste começa com os dados de demonstração limpos.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function entrar(page, email = 'professor@meuplan.test', senha = 'Plan@2026') {
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('login com a conta de teste abre Meus planos', async ({ page }) => {
  await entrar(page);
  await expect(page.getByRole('heading', { name: 'Meus planos' })).toBeVisible();
  await expect(page.locator('#lista .plano')).toHaveCount(3);
});

test('login com senha errada mostra mensagem de erro', async ({ page }) => {
  await entrar(page, 'professor@meuplan.test', 'errada123');
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.');
});

test('criar um plano completo e encontrá-lo na lista', async ({ page }) => {
  await entrar(page);
  await page.getByRole('button', { name: 'Novo plano' }).first().click();
  await page.getByLabel('Título do plano').fill('Plano criado pelo teste');
  await page.getByLabel('Tema da aula').fill('equações do 1º grau');
  await page.getByLabel('Duração de cada aula (minutos)').fill('60');
  await page.getByRole('button', { name: 'Gerar com IA' }).click();

  // A geração leva alguns segundos.
  await expect(page.getByRole('button', { name: 'Salvar plano' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Salvar plano' }).click();

  await expect(page.locator('#lista')).toContainText('Plano criado pelo teste');
});

test('a busca encontra um plano pelo título exato', async ({ page }) => {
  await entrar(page);
  await page.getByLabel('Buscar pelo título').fill('Ciclo da água');
  await expect(page.locator('#lista .plano')).toHaveCount(1);
});

test('sair volta para a tela de login', async ({ page }) => {
  await entrar(page);
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
});
