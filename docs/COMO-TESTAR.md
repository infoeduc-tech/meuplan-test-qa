# Como estudar o código e rodar os testes

Este guia é para quem quer ir além dos testes manuais: entender como o Meu Plan funciona por dentro, rodar a aplicação no próprio computador e escrever testes automatizados.

> **Desafio caixa-preta?** Se a sua atividade for de teste caixa-preta, termine a fase de exploração antes de abrir o código. Depois, este guia ajuda a transformar cada bug encontrado em um teste automatizado.

## 1. O que você precisa

| Ferramenta | Para quê | Onde baixar |
|---|---|---|
| Node.js 22 ou mais novo | rodar o app e os testes | https://nodejs.org (versão LTS) |
| Git | baixar e versionar o código | https://git-scm.com |
| Um editor de código | ler e escrever testes | VS Code: https://code.visualstudio.com |

Para conferir a instalação, abra o terminal e rode `node -v` e `git --version`.

## 2. Baixar o projeto

O jeito mais simples é fazer um **fork**: no GitHub, clique em **Fork** no repositório do Meu Plan. Assim você ganha uma cópia sua, onde pode criar testes e abrir issues à vontade.

```bash
git clone https://github.com/SEU-USUARIO/meuplan-test-qa.git
cd meuplan-test-qa
npm install
npx playwright install chromium
```

`npm install` baixa o Playwright, e o segundo comando baixa o navegador que ele controla. Isso é feito uma vez só.

## 3. Rodar o app no seu computador

```bash
npm start
```

Abra http://localhost:4173. Para parar, use `Ctrl+C` no terminal.

O app precisa desse servidor porque usa módulos JavaScript (`import`/`export`). Abrir o `index.html` direto do disco não funciona.

## 4. Como o código está organizado

```
index.html              estrutura da página (topo, conteúdo, rodapé)
assets/estilos.css      cores, fontes e layout
src/dominio.js          regras de negócio: validações, cálculos, cupons, limites
src/app.js              interface: telas, cliques, formulários e armazenamento
scripts/servidor.js     servidor local usado pelo npm start e pelos testes
tests/unit/             testes unitários (funções de src/dominio.js)
tests/e2e/              testes de ponta a ponta (navegador de verdade)
docs/modelos/           modelo de planilha de casos de teste
.github/                modelo de issue de bug e testes automáticos no GitHub
```

Comece por `src/dominio.js`. As funções de lá recebem dados e devolvem dados, sem tela no meio, por isso são as mais fáceis de entender e de testar.

Os dados do app ficam no `localStorage` do navegador, na chave `meuplan.demo.v2`. Você pode inspecioná-los pelas ferramentas do desenvolvedor (F12 › Application › Local Storage).

## 5. Rodar os testes

| Comando | O que faz |
|---|---|
| `npm run test:unit` | roda os testes unitários (menos de 1 segundo) |
| `npm run test:e2e` | sobe o app e roda os testes de navegador |
| `npm run test:e2e:ver` | mesma coisa, mostrando o navegador na tela |
| `npm run relatorio` | abre o relatório do último `test:e2e`, com prints e vídeos das falhas |
| `npm test` | roda tudo |

Os testes que vêm no projeto são **exemplos que passam**. Use-os como modelo.

## 6. Escrever um teste unitário

Crie um arquivo em `tests/unit/` terminando em `.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarPlano } from '../../src/dominio.js';

test('montarPlano: o tema aparece no título da primeira aula', () => {
  const plano = montarPlano({ tema: 'frações', disciplina: 'Matemática', nAulas: 1, duracao: 50, metodos: [] });
  assert.match(plano.aulas[0].titulo, /frações/);
});
```

Um teste tem três partes: **prepara** os dados, **executa** a função e **verifica** o resultado com `assert`.

## 7. Escrever um teste de ponta a ponta

Crie um arquivo em `tests/e2e/` terminando em `.spec.js`. Veja `tests/e2e/exemplos.spec.js`: ele entra no app, clica, preenche e confere o que aparece na tela.

Para não escrever tudo à mão, grave os passos:

```bash
npm start
# em outro terminal:
npx playwright codegen http://localhost:4173
```

Abre um navegador. Tudo o que você fizer nele vira código na janela ao lado. Copie para o seu arquivo e acrescente as verificações com `expect`.

Prefira localizar elementos como uma pessoa enxerga a tela: `getByRole('button', { name: 'Entrar' })`, `getByLabel('E-mail')`. Esses testes quebram menos quando o layout muda.

Para testar como celular, descomente o projeto `celular` em `playwright.config.js`.

## 8. Um teste que falha é uma evidência

Quando você encontrar um bug, escreva um teste que descreve o **comportamento correto**. Enquanto o bug existir, o teste fica vermelho. É a prova automática do problema, e um ótimo anexo para o seu bug report.

Se a atividade incluir correção:

1. Crie uma branch: `git switch -c corrige-busca`.
2. Escreva o teste que falha.
3. Corrija o código até o teste passar.
4. Rode `npm test` para garantir que nada mais quebrou.
5. Abra um pull request no seu fork.

## 9. Testes automáticos no GitHub

O arquivo `.github/workflows/testes.yml` roda os testes a cada push. No seu fork, abra a aba **Actions** e clique em **Enable workflows** na primeira vez. O resultado aparece com ✓ ou ✗ ao lado de cada commit, e o relatório do Playwright fica para download na execução.

## 10. Relatar bugs no GitHub

O repositório tem um formulário de bug pronto: **Issues › New issue › Relatar bug**. Ele pede passos, resultado esperado e obtido, severidade, prioridade, evidência e ambiente.

## Problemas comuns

| Mensagem | Solução |
|---|---|
| `node: command not found` | Instale o Node.js e abra um terminal novo. |
| `Executable doesn't exist` (Playwright) | Rode `npx playwright install chromium`. |
| `EADDRINUSE` ou porta 4173 em uso | Feche o outro `npm start` (`Ctrl+C`) e tente de novo. |
| Página em branco ao abrir o `index.html` | Use `npm start` e acesse pelo endereço `http://localhost:4173`. |
| Os dados ficaram bagunçados | Clique em **Restaurar dados de demonstração**, no rodapé. |
