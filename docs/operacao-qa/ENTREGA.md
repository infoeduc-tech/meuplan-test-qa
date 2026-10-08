# Operação QA · Como entregar

Cada squad trabalha no **próprio repositório privado**, criado a partir do projeto Meu Plan, e envia **um único link** na tarefa da turma.

## Passo a passo

1. **Criar o repositório da squad.** O QA Lead abre [github.com/infoeduc-tech/meuplan-test-qa](https://github.com/infoeduc-tech/meuplan-test-qa), clica em **Use this template › Create a new repository**, dá o nome `operacao-qa-<nome-da-squad>` e marca **Private**.
2. **Convidar.** No repositório novo, em **Settings › Collaborators › Add people**, convidar os integrantes da squad e o instrutor. O usuário do instrutor no GitHub será informado na turma.
3. **Organizar.** Trabalhar no próprio repositório seguindo a estrutura abaixo. Bugs vão nas **Issues**, pelo formulário *Relatar bug*.
4. **Enviar.** O QA Lead envia na tarefa da turma: nome da squad, integrantes e o link do repositório. Um envio por squad.

O repositório privado garante que só a squad e o instrutor vejam os bugs encontrados. Quem fizer *fork* deixa o trabalho público e visível para as outras squads.

## Estrutura do repositório

O código do Meu Plan já vem no repositório. Acrescentem a pasta `entrega/` com os arquivos abaixo.

| Onde | O que | Missão |
| --- | --- | --- |
| `entrega/README.md` | Nome da squad, integrantes, papéis e o veredito Go/No-Go em uma frase | Todas |
| `entrega/casos-de-teste.csv` | Casos de teste executados, com status (modelo em [`docs/modelos/`](../modelos/casos-de-teste.csv)) | 01 |
| **Issues** do repositório | Um bug por issue, pelo formulário *Relatar bug*, com evidência | 02 |
| `entrega/relatorio-ux.pdf` | Relatório de UX de 1 a 2 páginas | 03 |
| `tests/` e `entrega/automacao.md` | Script de automação e link do vídeo dele rodando | 04 |
| `entrega/pitch.pdf` | Slides do pitch | 05 |

## Prazo e regras

- **Data de entrega:** a definir. Será informada na turma.
- Vale o que estiver no repositório até o prazo. Commits e issues criados depois não são considerados.
- O repositório fica **privado** até o fim da avaliação. Não compartilhem bugs entre squads: falhas que só a sua squad encontrou valem o dobro.
- Sem conta no GitHub? Usem uma pasta no Google Drive ou no OneDrive, com a mesma estrutura, compartilhada **somente** com o instrutor (nunca “qualquer pessoa com o link”). Os bugs vão numa planilha com os mesmos campos do formulário.
