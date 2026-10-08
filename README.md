# Meu Plan Test QA

Ambiente de treinamento em **Qualidade de Software**. O Meu Plan é uma startup fictícia que gera planejamentos de aula para professores. A aplicação foi construída para ser testada: contém falhas propositais que estudantes, equipes e candidatos precisam encontrar, documentar e defender.

**Acesse:** https://infoeduc-tech.github.io/meuplan-test-qa/

**Contatos:** tecnologia@infoeduc.com.br e emanuelpaivafelix@gmail.com

Desenvolvido por **InfoEduc Tech**.

## Para que serve

- Desafios em grupo de disciplinas de Qualidade de Software e Testes.
- Dinâmicas com equipes de produto e desenvolvimento.
- Etapas práticas em processos de seleção para QA.
- Estudo de testes automatizados: unitários e de ponta a ponta, com execução no GitHub Actions.

## Usar no navegador

Abra o endereço acima no computador ou no celular. Não é preciso instalar nada.

Contas de teste:

| E-mail | Senha | Plano |
|---|---|---|
| `professor@meuplan.test` | `Plan@2026` | Gratuito |
| `pro@meuplan.test` | `Plan@2026` | Pro |

Também é possível criar contas novas pela tela de cadastro.

Os dados ficam salvos apenas no navegador de quem está testando. Para voltar ao estado inicial, use **Restaurar dados de demonstração**, no rodapé.

## O que dá para testar

- Cadastro e login
- Criação de planejamentos (formulário, geração e revisão)
- Meus planos: busca, filtro, abrir, editar, duplicar, excluir e exportar
- Limite do plano gratuito
- Assinatura: planos, período mensal e anual, cupons e confirmação
- Perfil
- Uso em telas de celular

## Regras para quem testa

1. Use somente dados fictícios. Não digite e-mails, documentos ou senhas reais.
2. Descreva cada falha com passos para reproduzir, resultado esperado, resultado obtido, severidade e evidência (print ou vídeo). Use o formulário em **Issues › New issue › Relatar bug**.
3. Em atividades de teste caixa-preta, use a aplicação como um usuário usaria e só abra o código depois da fase de exploração.

## Rodar no computador e escrever testes

Requer Node.js 22 ou mais novo.

```bash
npm install
npx playwright install chromium
npm start            # app em http://localhost:4173
npm run test:unit    # testes unitários
npm run test:e2e     # testes de ponta a ponta
```

O passo a passo completo, com a organização do código e modelos de teste, está em [docs/COMO-TESTAR.md](docs/COMO-TESTAR.md). Um modelo de planilha de casos de teste está em [docs/modelos/casos-de-teste.csv](docs/modelos/casos-de-teste.csv).

## Estrutura

```
index.html              estrutura da página
assets/estilos.css      aparência
src/dominio.js          regras de negócio (funções puras)
src/app.js              telas e interações
scripts/servidor.js     servidor local, sem dependências
tests/unit/             testes unitários de exemplo (node:test)
tests/e2e/              testes de ponta a ponta de exemplo (Playwright)
docs/                   guia de estudo e modelos
.github/                formulário de bug e testes automáticos
```

## Versão

2.4.1
