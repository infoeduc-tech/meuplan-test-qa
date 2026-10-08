// Testes unitários de exemplo: chamam as funções de src/dominio.js diretamente.
// Rode com:  npm run test:unit   (não precisa instalar nada além do Node)
//
// Todos estes testes passam. Use-os como modelo para escrever os seus.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  autenticar, montarPlano, validarFormularioPlano, aplicarCupom, novaCompra,
  precoDoPlano, dinheiro, iniciais, dadosIniciais
} from '../../src/dominio.js';

const { usuarios } = dadosIniciais();

test('autenticar: aceita a conta de teste com a senha correta', () => {
  const u = autenticar(usuarios, 'professor@meuplan.test', 'Plan@2026');
  assert.equal(u.nome, 'Ana Ribeiro');
});

test('autenticar: recusa senha errada', () => {
  assert.equal(autenticar(usuarios, 'professor@meuplan.test', 'senha-errada'), null);
});

test('montarPlano: cria uma aula para cada aula pedida', () => {
  const plano = montarPlano({ tema: 'frações', disciplina: 'Matemática', etapa: '6º ano EF', nAulas: 3, duracao: 60, objetivos: '', metodos: [] });
  assert.equal(plano.aulas.length, 3);
  assert.match(plano.aulas[0].titulo, /^Aula 1/);
});

test('validarFormularioPlano: bloqueia mais de 10 aulas', () => {
  const erro = validarFormularioPlano({ tema: 'frações', aulasTexto: '11', nAulas: 11, duracao: 50 });
  assert.equal(erro, 'O plano pode ter no máximo 10 aulas.');
});

test('validarFormularioPlano: aceita um formulário completo', () => {
  assert.equal(validarFormularioPlano({ tema: 'frações', aulasTexto: '2', nAulas: 2, duracao: 50 }), null);
});

test('aplicarCupom: recusa cupom que não existe', () => {
  const resultado = aplicarCupom(novaCompra('pro', 'mensal'), 'CUPOMFALSO');
  assert.equal(resultado.ok, false);
  assert.equal(resultado.mensagem, 'Cupom inválido ou expirado.');
});

test('aplicarCupom: PROFESSOR10 dá 10% de desconto no Pro mensal', () => {
  const resultado = aplicarCupom(novaCompra('pro', 'mensal'), 'PROFESSOR10');
  assert.equal(resultado.compra.total, 26.91);
});

test('precoDoPlano: Pro anual custa 10 mensalidades', () => {
  assert.equal(precoDoPlano('pro', 'anual'), 299);
});

test('dinheiro: formata em reais', () => {
  assert.match(dinheiro(29.9), /R\$\s29,90/);
});

test('iniciais: usa as duas primeiras palavras do nome', () => {
  assert.equal(iniciais('Ana Ribeiro Souza'), 'AR');
});
