# Operação QA · Enunciado do desafio

Qualidade de Software · desafio em grupo · [slides da apresentação](operacao-qa-slides.pdf)

## Briefing

Sua squad foi contratada para testar o **Meu Plan**, uma startup que gera planejamentos de aula para professores. O lançamento está marcado para a próxima aula, e a CEO quer uma resposta: **Go ou No-Go?**

Em uma semana, vocês vão descobrir o que funciona, o que quebra e o que confunde o usuário. No fim, defendem um veredito com evidências.

- **App:** [infoeduc-tech.github.io/meuplan-test-qa](https://infoeduc-tech.github.io/meuplan-test-qa/)
- **Código e guia de testes:** [github.com/infoeduc-tech/meuplan-test-qa](https://github.com/infoeduc-tech/meuplan-test-qa)
- **Contas de teste:** `professor@meuplan.test` (plano Gratuito) e `pro@meuplan.test` (plano Pro), ambas com a senha `Plan@2026`

## Regras do jogo

Squads de 4 a 5 pessoas, uma semana de prazo, entrega e pitch ao vivo na próxima aula online.

| Papel | Responde por |
| --- | --- |
| QA Lead | Organiza o board, cuida dos prazos e conduz o pitch |
| Analista de Testes | Plano e casos de teste |
| Bug Hunter | Sessões exploratórias e bug reports |
| UX Researcher | Avaliação heurística e teste com usuários |
| Automation Engineer | Testes automatizados |

Todo mundo testa; o papel define quem responde por cada entrega. Squad de 4 acumula um papel.

1. **Teste caixa-preta.** Use o app como um usuário. Ler o código-fonte para achar bugs não vale nesta fase.
2. **Só dados fictícios.** Nunca digite e-mails, documentos ou senhas reais.
3. **Recomece quando precisar** com *Restaurar dados de demonstração*, no rodapé do app.
4. **Bug só conta com evidência:** passos que outra pessoa consiga reproduzir.

## As cinco missões

As missões seguem o ciclo real de QA e somam 100 pontos.

| Missão | O que fazer | Meta mínima | Pontos |
| --- | --- | --- | --- |
| 01 Reconhecimento e plano | Mapear as funcionalidades, escolher 3 fluxos críticos e justificar pelo risco. Escrever casos de teste com partição de equivalência e valor limite. | 15 casos, pelo menos 3 negativos | 20 |
| 02 Caça aos bugs | Sessões exploratórias de 30 minutos guiadas por uma missão curta: *explorar [área] usando [técnica] para descobrir [risco]*. Registrar cada falha como issue. | 8 bugs com evidência | 25 |
| 03 Raio-X de UX | Avaliar os fluxos com as 10 heurísticas de Nielsen e observar 2 pessoas de fora do curso usando o app, pensando em voz alta. | 3 problemas de usabilidade, cada um com heurística e sugestão | 15 |
| 04 Automação | Nível 1: gravar um fluxo com `npx playwright codegen` ou Selenium IDE e acrescentar uma verificação. Nível 2 (bônus): 3 ou mais testes no repositório rodando no GitHub Actions. | Nível 1 funcionando, com vídeo | 15 + até 10 de bônus |
| 05 Pitch Go/No-Go | 7 minutos para a CEO: riscos, números, top 3 bugs ao vivo, achados de UX, automação rodando e o veredito. Depois, 3 minutos de perguntas. | Todos da squad falam | 25 |

O guia [Como estudar o código e rodar os testes](../COMO-TESTAR.md) explica a instalação e traz exemplos de testes prontos para a Missão 04.

## Modelos

Use estes formatos para que qualquer pessoa reproduza o que vocês encontraram. A planilha pronta está em [docs/modelos/casos-de-teste.csv](../modelos/casos-de-teste.csv) e abre no Excel ou no Google Planilhas.

**Caso de teste**

| ID | Técnica | Pré-condição | Passos | Dados | Resultado esperado | Status |
| --- | --- | --- | --- | --- | --- | --- |
| CT-02 | Caso negativo | Estar na tela de login | 1. Digitar e-mail correto e senha errada 2. Clicar em Entrar | professor@meuplan.test / errada123 | Mensagem “E-mail ou senha incorretos.” e continua no login | Passou |

**Bug report** (o repositório tem este formulário em *Issues › New issue › Relatar bug*)

```
Resumo: Busca não encontra plano quando digito em minúsculas
Onde: Meus planos
Passos:
1. Entrar com professor@meuplan.test
2. ...
Resultado esperado: ...
Resultado obtido: ...
Severidade: Média · Prioridade: Alta
Evidência: print ou GIF anexado
Ambiente: Chrome 130 · Windows 11 · computador · versão 2.4.1
```

Severidade mede o impacto técnico; prioridade mede a urgência para o negócio. Um bug pode ter severidade baixa e prioridade alta, como um erro de texto na tela de pagamento.

## Entrega

Cada squad entrega um **repositório privado**, criado a partir deste modelo, e o QA Lead envia o link na tarefa da turma. **Data de entrega: a definir**, será informada na turma. O passo a passo está em [Como entregar](ENTREGA.md).

- [ ] README com o nome da squad, integrantes e papéis
- [ ] Planilha de casos de teste executados, com status
- [ ] Bugs como issues no repositório da squad (ou numa planilha), cada um com evidência
- [ ] Relatório de UX de 1 a 2 páginas
- [ ] Automação: o script e um vídeo curto dele rodando
- [ ] Slides do pitch, com o veredito Go/No-Go

## Avaliação

O Meu Plan tem falhas escondidas de propósito, e encontrar as raras vale mais. A lista completa só será revelada ao vivo na aula de entrega.

| Missão | O que conta | Pontos |
| --- | --- | --- |
| 01 Plano de testes | Fluxos justificados por risco; casos claros, reproduzíveis e com negativos | 20 |
| 02 Caça aos bugs | Até 15 pela pontuação da caça, proporcional à melhor squad, e até 10 pela qualidade dos reports | 25 |
| 03 Raio-X de UX | Heurísticas bem aplicadas e teste com pessoas reais | 15 |
| 04 Automação | Nível 1 funcionando, com verificação | 15 |
| 05 Pitch | Clareza, tempo, todos falam, veredito sustentado por dados | 25 |
| Bônus | Nível 2 de automação com GitHub Actions | até +10 |

**Como funciona a pontuação da caça:** cada falha vale 5, 10 ou 20 pontos, conforme a dificuldade. Falha que só a sua squad encontrou vale o dobro; encontrada por duas squads, vale 1,5 vez. Falha real fora da lista do instrutor, que ele consiga reproduzir, vale +10. Report sem passos reproduzíveis não pontua.

**Conquistas da aula de entrega**

| Conquista | Para quem |
| --- | --- |
| Bug Sniper | A falha mais grave encontrada |
| Olho de Lince | A falha mais sutil ou bizarra |
| Detetive de UX | O achado de usabilidade mais revelador |
| Robô Mestre | A melhor automação |
| Pitch de Ouro | Voto da turma (ninguém vota na própria squad) |

## Cronograma sugerido

| Dia | Foco | Sai do forno |
| --- | --- | --- |
| Hoje | Formar a squad e dividir papéis | Repositório privado da squad criado, papéis no README |
| Dia 2 | Reconhecimento e plano | 3 fluxos críticos e casos de teste |
| Dia 3 | Executar os casos | Planilha com status preenchido |
| Dia 4 | Sessões exploratórias | Bugs registrados com evidência |
| Dia 5 | UX e automação | Relatório de UX e script gravado |
| Dia 6 | Consolidar e decidir | Veredito Go/No-Go e slides |
| Dia 7 | Ensaiar o pitch | Link enviado antes da aula |

## Dúvidas frequentes

**Posso perguntar ao professor se algo é bug?** Não. A squad decide com base em evidência, como num time real.

**Encontramos algo estranho fora dos fluxos que escolhemos. Vale?** Vale. Registre com passos e evidência.

**Os dados do app sumiram ou ficaram bagunçados.** Eles ficam só no seu navegador. Use *Restaurar dados de demonstração*, no rodapé.

**Preciso programar?** Para a nota, não: o nível 1 de automação grava o código para você. Quem quiser ir além tem o guia de testes no repositório.
