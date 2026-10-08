/**
 * Meu Plan · interface
 *
 * Desenha as telas, responde a cliques e formulários e guarda os dados no
 * navegador (localStorage). As regras de negócio ficam em ./dominio.js.
 *
 * Mapa rápido:
 *   estado e armazenamento ...... carregar(), salvar(), eu()
 *   navegação ................... ir(tela, argumento)
 *   telas ....................... telaLogin(), telaPlanos(), telaNovo() ...
 *   eventos ..................... cliques (data-act), input, change, submit
 */
import {
  VERSAO, LIMITE_GRATIS, MESES, DISCIPLINAS, ETAPAS, METODOS, AVALIACOES, PERFIS, FILTROS_DISCIPLINA, NOMES_PLANO,
  gerarId, formatarData, dinheiro, iniciais, ehEmailValido,
  autenticar, validarCadastro, validarFormularioPlano, montarPlano,
  planosDoUsuario, contarPlanosNoMes, podeCriarPlano, filtrarPlanos, duplicarPlano, textoExportado,
  precoDoPlano, novaCompra, aplicarCupom, dadosIniciais
} from './dominio.js';

const CHAVE = 'meuplan.demo.v2';
const TEMPO_GERACAO_MS = 5000;
const TELAS_PROTEGIDAS = ['novo', 'previa', 'plano', 'editar', 'assinatura', 'checkout', 'perfil'];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------------------------ */
/* Estado e armazenamento                                              */
/* ------------------------------------------------------------------ */

function carregar() {
  try { const s = localStorage.getItem(CHAVE); if (s) return JSON.parse(s); } catch (e) { /* navegador sem armazenamento */ }
  return dadosIniciais();
}
function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) { /* segue sem salvar */ }
}

let db = carregar();
let ultimoUsuario = null;
let tela = 'login';
let arg = null;
let rascunho = null;
let previa = null;
let compra = null;
let periodo = 'mensal';
let busca = '';
let filtro = '';
let aoFecharModal = null;

function eu() {
  if (!db.sessao) return null;
  return db.usuarios.find((u) => u.email === db.sessao) || null;
}

if (eu()) { ultimoUsuario = eu(); tela = 'planos'; }

/* ------------------------------------------------------------------ */
/* Navegação, avisos e janelas                                         */
/* ------------------------------------------------------------------ */

function ir(destino, argumento) {
  if (TELAS_PROTEGIDAS.includes(destino) && !eu()) { destino = 'login'; argumento = null; }
  if (destino === 'novo' && !podeCriarPlano(db.planos, eu())) { avisoLimite(); return; }
  tela = destino;
  arg = argumento === undefined ? null : argumento;
  render();
  window.scrollTo(0, 0);
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 2800);
}

function abrirModal(html, opcoes = {}) {
  aoFecharModal = opcoes.aoFechar || null;
  $('#camada').innerHTML = `<div class="fundo" data-act="modal-fundo"><div class="modal${opcoes.largo ? ' largo' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
  const foco = $('#camada [data-foco]') || $('#camada button');
  if (foco) foco.focus();
}
function fecharModal() {
  $('#camada').innerHTML = '';
  const cb = aoFecharModal;
  aoFecharModal = null;
  if (cb) cb();
}
function esconderModal() {
  aoFecharModal = null;
  $('#camada').innerHTML = '';
}

function avisoLimite() {
  abrirModal(`<h2>Limite do plano gratuito</h2><p>Você já usou os ${LIMITE_GRATIS} planejamentos gratuitos deste mês. Assine o Pro para criar planos ilimitados.</p>
    <div class="botoes"><button class="btn btn-ghost" data-act="modal-cancelar">Agora não</button><button class="btn btn-primary" data-act="ver-assinatura">Ver planos de assinatura</button></div>`);
}

/* ------------------------------------------------------------------ */
/* Topo                                                                */
/* ------------------------------------------------------------------ */

function renderTopo() {
  const u = tela === 'planos' ? (eu() || ultimoUsuario) : eu();
  const marca = `<button class="logo" data-act="inicio" aria-label="Meu Plan, ir para Meus planos">
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><rect x="1" y="3" width="34" height="26" rx="5" fill="var(--brand)"/><rect x="11" y="29" width="14" height="4" rx="2" fill="var(--brand)"/><path d="M9 16.5l5 5 13-11" fill="none" stroke="var(--chalk)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span class="logo-nome">Meu Plan</span><span class="logo-tag">Test QA</span></button>`;
  let nav = '';
  if (u) {
    const itens = [['planos', 'Meus planos'], ['novo', 'Novo plano'], ['assinatura', 'Assinatura'], ['perfil', 'Perfil']];
    nav = '<nav class="nav" aria-label="Principal">' + itens.map(([alvo, rotulo]) => {
      const atual = tela === alvo || (alvo === 'assinatura' && tela === 'checkout') || (alvo === 'novo' && tela === 'previa');
      return `<button data-act="nav" data-alvo="${alvo}"${atual ? ' aria-current="page"' : ''}>${rotulo}</button>`;
    }).join('') + `<span class="avatar" title="${esc(u.nome)}">${esc(iniciais(u.nome))}</span><button data-act="sair">Sair</button></nav>`;
  }
  $('#topo').innerHTML = `<div class="wrap">${marca}${nav}</div>`;
}

/* ------------------------------------------------------------------ */
/* Telas                                                               */
/* ------------------------------------------------------------------ */

function opcoes(lista, selecionada) {
  return lista.map((o) => `<option${o === selecionada ? ' selected' : ''}>${esc(o)}</option>`).join('');
}

function telaLogin() {
  return `<div class="wrap entrada">
    <section class="hero"><span class="eyebrow">Planejamento com IA para professores</span>
      <h1>Seu planejamento de aula pronto em segundos.</h1>
      <p class="lead">Informe disciplina, turma e tema. O Meu Plan monta objetivos, cronograma de cada aula, materiais e avaliação. Você revisa, ajusta e salva.</p>
      <div class="mini" aria-label="Exemplo de cronograma"><strong>Exemplo · Frações no cotidiano · 6º ano</strong>
        <div class="linha"><span>Acolhida e problematização</span><span>5 min</span></div>
        <div class="linha"><span>Exploração do conteúdo</span><span>18 min</span></div>
        <div class="linha"><span>Prática orientada</span><span>20 min</span></div>
        <div class="linha"><span>Síntese e fechamento</span><span>8 min</span></div></div></section>
    <section class="card stack"><div class="stack" style="gap:6px"><h2>Entrar</h2><p class="sub">Acesse seus planejamentos.</p></div>
      <form id="form-login" class="stack" novalidate>
        <div class="campo"><label for="l-email">E-mail</label><input id="l-email" type="email" autocomplete="username" data-foco></div>
        <div class="campo"><label for="l-senha">Senha</label><input id="l-senha" type="password" autocomplete="current-password"></div>
        <div id="l-erro" class="erro" role="alert" hidden></div>
        <button class="btn btn-primary" type="submit">Entrar</button></form>
      <p>Ainda não tem conta? <button class="link" data-act="ir" data-alvo="cadastro">Criar conta grátis</button></p>
      <div class="contas"><strong>Contas de teste</strong>
        <span><code>professor@meuplan.test</code> · senha <code>Plan@2026</code> · plano Gratuito</span>
        <span><code>pro@meuplan.test</code> · senha <code>Plan@2026</code> · plano Pro</span></div>
    </section></div>`;
}

function telaCadastro() {
  return `<div class="wrap" style="max-width:640px"><section class="card stack"><div class="stack" style="gap:6px"><h2>Criar conta</h2><p class="sub">Comece grátis com ${LIMITE_GRATIS} planejamentos por mês.</p></div>
    <form id="form-cadastro" class="stack" novalidate>
      <div class="campo"><label for="c-nome">Nome completo</label><input id="c-nome" type="text" autocomplete="name"></div>
      <div class="campo"><label for="c-email">E-mail</label><input id="c-email" type="email" autocomplete="email"></div>
      <div class="campo"><label for="c-perfil">Onde você leciona</label><select id="c-perfil">${opcoes(PERFIS, PERFIS[1])}</select></div>
      <div class="grade"><div class="campo"><label for="c-senha">Senha</label><input id="c-senha" type="password" autocomplete="new-password"><span class="dica">Mínimo de 8 caracteres, com pelo menos um número.</span></div>
        <div class="campo"><label for="c-senha2">Confirmar senha</label><input id="c-senha2" type="password" autocomplete="new-password"></div></div>
      <label class="check" style="border-radius:10px"><input id="c-termos" type="checkbox"> Li e aceito os termos de uso</label>
      <div id="c-erro" class="erro" role="alert" hidden></div>
      <div class="barra-acoes"><button class="btn btn-primary" type="submit">Criar conta</button><button class="btn btn-ghost" type="button" data-act="ir" data-alvo="login">Já tenho conta</button></div>
    </form></section></div>`;
}

function telaPlanos() {
  const u = eu() || ultimoUsuario;
  if (!u) { tela = 'login'; return telaLogin(); }
  let uso;
  if (u.plano === 'free') {
    const n = contarPlanosNoMes(db.planos, u);
    uso = `<section class="card uso"><div class="cab"><strong>Plano Gratuito</strong><span class="meta" id="uso-texto">${n} de ${LIMITE_GRATIS} planejamentos usados em ${MESES[new Date().getMonth()]}</span></div>
      <div class="barra" role="progressbar" aria-label="Uso do plano gratuito" aria-valuemin="0" aria-valuemax="${LIMITE_GRATIS}" aria-valuenow="${n}"><span style="width:${Math.min(100, n / LIMITE_GRATIS * 100)}%"></span></div>
      <p class="dica">Precisa de mais? <button class="link" data-act="nav" data-alvo="assinatura">Conheça o plano Pro</button></p></section>`;
  } else {
    uso = `<section class="card uso"><strong>Plano ${NOMES_PLANO[u.plano]}</strong><span class="meta" id="uso-texto">Planejamentos ilimitados</span></section>`;
  }
  return `<div class="wrap stack">
    <div class="cab"><div class="stack" style="gap:4px"><span class="eyebrow">Olá, ${esc(u.nome.split(' ')[0])}</span><h1>Meus planos</h1></div>
      <button class="btn btn-primary" data-act="nav" data-alvo="novo">Novo plano</button></div>${uso}
    <div class="ferramentas"><div class="campo"><label for="busca">Buscar pelo título</label><input id="busca" type="search" value="${esc(busca)}" placeholder="Ex.: Frações"></div>
      <div class="campo"><label for="filtro">Disciplina</label><select id="filtro"><option value="">Todas</option>${FILTROS_DISCIPLINA.map(([valor, rotulo]) => `<option value="${valor}"${filtro === valor ? ' selected' : ''}>${rotulo}</option>`).join('')}</select></div></div>
    <div id="lista" class="lista" aria-live="polite"></div></div>`;
}

function renderLista() {
  const u = eu() || ultimoUsuario;
  const alvo = $('#lista');
  if (!alvo || !u) return;
  const meus = planosDoUsuario(db.planos, u);
  const itens = filtrarPlanos(meus, busca, filtro);
  if (!itens.length) {
    alvo.innerHTML = `<div class="card vazio" style="grid-column:1/-1">${meus.length ? 'Nenhum plano encontrado com esses filtros.' : 'Você ainda não tem planos. Crie o primeiro em “Novo plano”.'}</div>`;
    return;
  }
  alvo.innerHTML = itens.map((p) => `<article class="card plano" data-plano="${p.id}"><div class="chips"><span class="chip">${esc(p.disciplina)}</span><span class="chip">${esc(p.etapa)}</span></div>
    <h3>${esc(p.titulo)}</h3><p class="meta">${p.aulas.length}${p.aulas.length === 1 ? ' aula' : ' aulas'} · ${p.duracao} min cada<br>Criado em ${formatarData(p.criadoEm)}</p>
    <div class="acoes"><button class="btn btn-primary btn-sm" data-act="abrir" data-id="${p.id}">Abrir</button>
      <button class="btn btn-ghost btn-sm" data-act="duplicar" data-id="${p.id}">Duplicar</button>
      <button class="btn btn-ghost btn-sm" data-act="excluir" data-id="${p.id}">Excluir</button></div></article>`).join('');
}

function telaNovo() {
  const r = rascunho || { titulo: '', disciplina: 'Matemática', etapa: '6º ano EF', tema: '', nAulas: 2, aulasTexto: '2', duracao: 50, objetivos: '', metodos: [], avaliacao: AVALIACOES[0] };
  return `<div class="wrap stack" style="max-width:860px"><div class="stack" style="gap:4px"><span class="eyebrow">Novo planejamento</span><h1>O que você vai ensinar?</h1>
    <p class="sub">Preencha os dados da turma. A IA monta o plano e você revisa antes de salvar.</p></div>
    <form id="form-novo" class="card stack" novalidate><div class="grade">
      <div class="campo full"><label for="f-titulo">Título do plano</label><input id="f-titulo" type="text" value="${esc(r.titulo || '')}" placeholder="Ex.: Frações no cotidiano"></div>
      <div class="campo"><label for="f-disciplina">Disciplina</label><select id="f-disciplina">${opcoes(DISCIPLINAS, r.disciplina)}</select></div>
      <div class="campo"><label for="f-etapa">Etapa / ano</label><select id="f-etapa">${opcoes(ETAPAS, r.etapa)}</select></div>
      <div class="campo full"><label for="f-tema">Tema da aula</label><input id="f-tema" type="text" value="${esc(r.tema)}" placeholder="Ex.: frações equivalentes"></div>
      <div class="campo"><label for="f-aulas">Número de aulas</label><input id="f-aulas" type="number" min="1" max="10" value="${esc(r.aulasTexto ?? r.nAulas)}"><span class="dica">De 1 a 10 aulas.</span></div>
      <div class="campo"><label for="f-duracao">Duração de cada aula (minutos)</label><input id="f-duracao" type="number" min="30" max="120" step="5" value="${esc(Number.isNaN(r.duracao) ? '' : r.duracao)}"><span class="dica">De 30 a 120 minutos.</span></div>
      <div class="campo full"><label for="f-obj">Objetivos de aprendizagem</label><textarea id="f-obj" maxlength="480" placeholder="Um objetivo por linha. Ex.: Comparar frações com denominadores diferentes.">${esc(r.objetivos)}</textarea>
        <span class="contador" id="obj-cont">${r.objetivos.length}/500</span></div>
      <div class="campo full"><span class="rotulo">Metodologias</span><div class="checks">${METODOS.map((m, i) => `<label class="check"><input type="checkbox" name="metodo" id="m-${i}" value="${esc(m)}"${r.metodos.includes(m) ? ' checked' : ''}> ${esc(m)}</label>`).join('')}</div></div>
      <div class="campo"><label for="f-aval">Avaliação</label><select id="f-aval">${opcoes(AVALIACOES, r.avaliacao)}</select></div>
    </div><div id="f-erro" class="erro" role="alert" hidden></div>
    <div class="acoes-form"><button class="btn btn-ghost" type="button" data-act="limpar">Limpar formulário</button>
      <button class="btn btn-ghost" type="button" data-act="exemplo">Preencher exemplo</button>
      <button class="btn btn-primary" type="submit">Gerar com IA</button></div></form></div>`;
}

function blocoAulas(p, editavel) {
  return p.aulas.map((a, i) => `<section class="aula"><h3>${esc(a.titulo)}</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>Etapa</th><th class="num">Minutos</th></tr></thead><tbody>
    ${a.etapas.map((e) => `<tr><td>${esc(e.nome)}</td><td class="num">${e.min}</td></tr>`).join('')}
    </tbody><tfoot><tr><td>Total da aula</td><td class="num">${p.duracao} min</td></tr></tfoot></table></div>
    ${editavel ? `<p class="dica">Clique no texto abaixo para ajustar a atividade.</p><p class="editavel" contenteditable="true" data-aula="${i}">${esc(a.atividade)}</p>` : `<p>${esc(a.atividade)}</p>`}</section>`).join('');
}

function corpoPlano(p, editavel) {
  const lista = (itens) => '<ul>' + itens.map((o) => `<li>${esc(o)}</li>`).join('') + '</ul>';
  return `<div class="doc">
    <div class="chips"><span class="chip">${esc(p.disciplina)}</span><span class="chip">${esc(p.etapa)}</span><span class="chip">${p.aulas.length}${p.aulas.length === 1 ? ' aula' : ' aulas'} de ${p.duracao} min</span></div>
    <div class="secao"><h3>Objetivos</h3>${lista(p.objetivos)}</div>
    <div class="secao"><h3>Habilidades trabalhadas</h3>${lista(p.habilidades)}</div>
    <div class="secao"><h3>Sequência de aulas</h3>${blocoAulas(p, editavel)}</div>
    <div class="secao"><h3>Materiais</h3>${lista(p.materiais)}</div>
    <div class="secao"><h3>Avaliação</h3><p>${esc(p.avaliacao)}${p.metodos.length ? ' · Metodologias: ' + esc(p.metodos.join(', ')) : ''}</p></div></div>`;
}

function telaPrevia() {
  if (!previa) { tela = 'novo'; return telaNovo(); }
  return `<div class="wrap stack" style="max-width:860px"><div class="stack" style="gap:4px"><span class="eyebrow">Plano gerado pela IA</span><h1>${esc(rascunho.titulo || '')}</h1>
    <p class="sub">Tema: ${esc(previa.tema)}. Revise e ajuste antes de salvar.</p></div>
    <div class="card">${corpoPlano(previa, true)}</div>
    <div class="barra-acoes"><button class="btn btn-primary" data-act="salvar-plano">Salvar plano</button>
      <button class="btn btn-ghost" data-act="regenerar">Regenerar</button>
      <button class="btn btn-ghost" data-act="voltar-form">Voltar ao formulário</button></div></div>`;
}

function planoAtual() {
  const u = eu();
  return db.planos.find((p) => p.id === arg && u && p.dono === u.id);
}

function telaPlano() {
  const p = planoAtual();
  if (!p) { tela = 'planos'; return telaPlanos(); }
  return `<div class="wrap stack" style="max-width:860px"><div class="cab"><div class="stack" style="gap:4px"><span class="eyebrow">Criado em ${formatarData(p.criadoEm)}</span><h1>${esc(p.titulo)}</h1><p class="sub">Tema: ${esc(p.tema)}</p></div>
    <button class="btn btn-ghost btn-sm" data-act="nav" data-alvo="planos">Voltar para Meus planos</button></div>
    <div class="barra-acoes"><button class="btn btn-primary" data-act="editar" data-id="${p.id}">Editar</button>
      <button class="btn btn-ghost" data-act="duplicar" data-id="${p.id}">Duplicar</button>
      <button class="btn btn-ghost" data-act="exportar" data-id="${p.id}">Exportar texto</button>
      <button class="btn btn-ghost" data-act="excluir" data-id="${p.id}">Excluir</button></div>
    <div class="card">${corpoPlano(p, false)}</div></div>`;
}

function telaEditar() {
  const p = planoAtual();
  if (!p) { tela = 'planos'; return telaPlanos(); }
  return `<div class="wrap stack" style="max-width:860px"><div class="stack" style="gap:4px"><span class="eyebrow">Editar plano</span><h1>${esc(p.titulo)}</h1></div>
    <form id="form-editar" class="card stack" novalidate>
      <div class="campo"><label for="e-titulo">Título do plano</label><input id="e-titulo" type="text" value="${esc(p.titulo === undefined ? '' : p.titulo)}"></div>
      <div class="campo"><label for="e-tema">Tema</label><input id="e-tema" type="text" value="${esc(p.tema)}"></div>
      ${p.aulas.map((a, i) => `<div class="campo"><label for="e-aula-${i}">${esc(a.titulo)} · atividade</label><textarea id="e-aula-${i}" data-aula="${i}">${esc(a.atividade)}</textarea></div>`).join('')}
      <div class="barra-acoes"><button class="btn btn-secondary" type="submit">Gravar alterações</button><button class="btn btn-ghost" type="button" data-act="abrir" data-id="${p.id}">Cancelar</button></div>
    </form></div>`;
}

function telaAssinatura() {
  const u = eu();
  const cartao = (chave, nome, desc, itens) => {
    let valor, nota;
    if (chave === 'free') { valor = dinheiro(0); nota = 'para sempre'; } else { valor = dinheiro(precoDoPlano(chave, periodo)); nota = periodo === 'mensal' ? 'por mês' : 'por ano · 2 meses grátis'; }
    const atual = u.plano === chave;
    let botao;
    if (atual) botao = '<button class="btn btn-ghost" disabled>Seu plano atual</button>';
    else if (chave === 'free') botao = '<button class="btn btn-ghost" disabled>Incluído</button>';
    else botao = `<button class="btn btn-primary" data-act="assinar" data-plano="${chave}">Assinar ${nome}</button>`;
    return `<article class="card preco${chave === 'pro' ? ' destaque' : ''}" data-cartao="${chave}"><div class="stack" style="gap:4px"><h2>${nome}</h2><p class="sub">${desc}</p></div>
      <div><span class="valor">${valor}</span><p class="meta">${nota}</p></div><ul>${itens.map((i) => `<li>${i}</li>`).join('')}</ul>${botao}</article>`;
  };
  return `<div class="wrap stack"><div class="cab"><div class="stack" style="gap:4px"><span class="eyebrow">Assinatura</span><h1>Escolha seu plano</h1><p class="sub">Seu plano atual: ${NOMES_PLANO[u.plano]}.</p></div>
    <div class="periodo" role="group" aria-label="Período de cobrança"><button data-act="periodo" data-p="mensal" aria-pressed="${periodo === 'mensal'}">Mensal</button><button data-act="periodo" data-p="anual" aria-pressed="${periodo === 'anual'}">Anual</button></div></div>
    <div class="promo"><strong>Cupons para professores</strong><span><b>PROFESSOR10</b> · 10% de desconto em qualquer plano pago.</span><span><b>VOLTAAULAS</b> · 15% de desconto · promoção encerrada em 31/08.</span></div>
    <div class="precos">
      ${cartao('free', 'Gratuito', 'Para experimentar.', [LIMITE_GRATIS + ' planejamentos por mês', 'Exportação em texto', 'Suporte pela central de ajuda'])}
      ${cartao('pro', 'Pro', 'Para quem planeja toda semana.', ['Planejamentos ilimitados', 'Regenerar quantas vezes quiser', 'Modelos por etapa de ensino'])}
      ${cartao('escola', 'Escola', 'Para equipes pedagógicas.', ['Até 30 professores', 'Painel da coordenação', 'Biblioteca compartilhada de planos'])}
    </div></div>`;
}

function telaCheckout() {
  if (!compra) { tela = 'assinatura'; return telaAssinatura(); }
  const desconto = compra.subtotal - compra.total;
  return `<div class="wrap" style="max-width:640px"><section class="card stack"><div class="stack" style="gap:4px"><span class="eyebrow">Finalizar assinatura</span><h2>Plano ${NOMES_PLANO[compra.plano]} · ${compra.periodo === 'mensal' ? 'mensal' : 'anual'}</h2></div>
    <div class="resumo"><div class="linha"><span>Subtotal</span><span id="k-subtotal">${dinheiro(compra.subtotal)}</span></div>
      <div class="linha"><span>Desconto${compra.cupom ? ' (' + esc(compra.cupom) + ')' : ''}</span><span>− ${dinheiro(desconto)}</span></div>
      <div class="linha total"><span>Total</span><span id="k-total">${dinheiro(compra.total)}</span></div></div>
    <div class="campo"><label for="k-cupom">Cupom de desconto</label><div class="cupom"><input id="k-cupom" type="text" autocomplete="off" placeholder="Ex.: PROFESSOR10"><button class="btn btn-ghost" data-act="aplicar-cupom">Aplicar</button></div><span id="k-msg" aria-live="polite"></span></div>
    <fieldset class="campo" style="border:0;padding:0;margin:0"><legend class="rotulo">Forma de pagamento (simulada)</legend><div class="checks">
      <label class="check"><input type="radio" name="pagto" value="pix" checked> Pix</label><label class="check"><input type="radio" name="pagto" value="boleto"> Boleto</label></div>
      <span class="dica">Ambiente de treinamento: nenhum pagamento é realizado.</span></fieldset>
    <div class="barra-acoes"><button class="btn btn-primary" data-act="confirmar-compra">Confirmar assinatura</button><button class="btn btn-ghost" data-act="nav" data-alvo="assinatura">Voltar</button></div>
  </section></div>`;
}

function telaPerfil() {
  const u = eu();
  return `<div class="wrap" style="max-width:640px"><form id="form-perfil" class="card stack" novalidate><div class="stack" style="gap:4px"><span class="eyebrow">Perfil</span><h2>Seus dados</h2></div>
    <div class="campo"><label for="p-nome">Nome</label><input id="p-nome" type="text" value="${esc(u.nome)}"></div>
    <div class="campo"><label for="p-email">E-mail</label><input id="p-email" type="email" value="${esc(u.email)}"></div>
    <div class="campo"><label for="p-escola">Escola</label><input id="p-escola" type="text" value="${esc(u.escola || '')}"></div>
    <div class="campo"><label for="p-disc">Disciplina principal</label><select id="p-disc">${opcoes(DISCIPLINAS, u.disciplina)}</select></div>
    <label class="check" style="border-radius:10px"><input id="p-notif" type="checkbox"${u.notificacoes ? ' checked' : ''}> Receber dicas de planejamento por e-mail</label>
    <div id="p-erro" class="erro" role="alert" hidden></div>
    <div class="barra-acoes"><button class="btn btn-danger" type="submit">Confirmar</button></div></form></div>`;
}

const TELAS = { login: telaLogin, cadastro: telaCadastro, planos: telaPlanos, novo: telaNovo, previa: telaPrevia, plano: telaPlano, editar: telaEditar, assinatura: telaAssinatura, checkout: telaCheckout, perfil: telaPerfil };

function render() {
  const html = (TELAS[tela] || telaLogin)();
  renderTopo();
  $('#conteudo').innerHTML = html;
  if (tela === 'planos') renderLista();
}

/* ------------------------------------------------------------------ */
/* Ações                                                               */
/* ------------------------------------------------------------------ */

function lerFormNovo() {
  return {
    titulo: $('#f-titulo').value.trim(),
    disciplina: $('#f-disciplina').value,
    etapa: $('#f-etapa').value,
    tema: $('#f-tema').value.trim(),
    aulasTexto: $('#f-aulas').value,
    nAulas: parseInt($('#f-aulas').value, 10),
    duracao: parseInt($('#f-duracao').value, 10),
    objetivos: $('#f-obj').value,
    metodos: $$('input[name=metodo]:checked').map((c) => c.value),
    avaliacao: $('#f-aval').value
  };
}

function mostrarErro(seletor, msg) {
  const e = $(seletor);
  e.textContent = msg;
  e.hidden = false;
}

function gerar(f, variante) {
  $('#camada').innerHTML = '<div class="carregando" aria-busy="true"><div class="giro"></div></div>';
  setTimeout(() => {
    $('#camada').innerHTML = '';
    previa = montarPlano(f, variante);
    ir('previa');
  }, TEMPO_GERACAO_MS);
}

function duplicar(id) {
  const u = eu();
  const p = db.planos.find((x) => x.id === id);
  if (!p) return;
  if (!podeCriarPlano(db.planos, u)) { avisoLimite(); return; }
  db.planos.unshift(duplicarPlano(p, gerarId()));
  salvar();
  toast('Plano duplicado');
  ir('planos');
}

function excluir(id) {
  const p = db.planos.find((x) => x.id === id);
  if (!p) return;
  abrirModal(`<h2>Excluir plano?</h2><p>“${esc(p.titulo)}” será removido de Meus planos. Esta ação não pode ser desfeita.</p>
    <div class="botoes"><button class="btn btn-ghost" data-act="modal-fechar" data-foco>Cancelar</button><button class="btn btn-danger" data-act="modal-fechar">Excluir</button></div>`, {
    aoFechar: () => {
      db.planos = db.planos.filter((x) => x.id !== id);
      salvar();
      toast('Plano excluído');
      ir('planos');
    }
  });
}

function exportar(id) {
  const p = planoAtual() || db.planos.find((x) => x.id === id);
  if (!p) return;
  abrirModal(`<h2>Exportar como texto</h2><p class="sub">Copie o texto e cole no seu editor ou no diário de classe.</p>
    <textarea id="x-texto" readonly aria-label="Texto do plano">${esc(textoExportado(p))}</textarea>
    <div class="botoes"><button class="btn btn-ghost" data-act="modal-cancelar">Fechar</button><button class="btn btn-primary" data-act="copiar" data-foco>Copiar texto</button></div>`, { largo: true });
}

function copiarExportacao() {
  const area = $('#x-texto');
  const ok = () => toast('Texto copiado');
  const falha = () => { area.focus(); area.select(); toast('Selecionamos o texto. Use Ctrl+C para copiar.'); };
  try { navigator.clipboard.writeText(area.value).then(ok, falha); } catch (e) { falha(); }
}

function salvarPrevia() {
  const u = eu();
  $$('[data-aula]').forEach((el) => { previa.aulas[+el.getAttribute('data-aula')].atividade = el.textContent.trim(); });
  previa.id = gerarId();
  previa.dono = u.id;
  previa.titulo = rascunho.titulo || undefined;
  previa.criadoEm = new Date().toISOString();
  db.planos.unshift(previa);
  salvar();
  previa = null;
  rascunho = null;
  toast('Plano salvo em Meus planos');
  ir('planos');
}

function aplicarCupomNaTela() {
  const resultado = aplicarCupom(compra, $('#k-cupom').value);
  if (!resultado.ok) {
    $('#k-msg').className = 'msg-erro';
    $('#k-msg').textContent = resultado.mensagem;
    return;
  }
  compra = resultado.compra;
  render();
  $('#k-msg').className = 'msg-ok';
  $('#k-msg').textContent = `Cupom ${compra.cupom} aplicado.`;
}

function restaurarDados() {
  esconderModal();
  db = dadosIniciais();
  salvar();
  ultimoUsuario = null; previa = null; rascunho = null; compra = null; busca = ''; filtro = '';
  toast('Dados de demonstração restaurados');
  ir('login');
}

/* ------------------------------------------------------------------ */
/* Eventos                                                             */
/* ------------------------------------------------------------------ */

const ACOES = {
  'inicio': () => ir('planos'),
  'nav': (t) => ir(t.getAttribute('data-alvo')),
  'ir': (t) => ir(t.getAttribute('data-alvo')),
  'sair': () => {
    db.sessao = null; salvar(); previa = null; rascunho = null; compra = null;
    toast('Você saiu da sua conta.');
    ir('login');
  },
  'abrir': (t) => ir('plano', t.getAttribute('data-id')),
  'editar': (t) => ir('editar', t.getAttribute('data-id')),
  'duplicar': (t) => duplicar(t.getAttribute('data-id')),
  'excluir': (t) => excluir(t.getAttribute('data-id')),
  'exportar': (t) => exportar(t.getAttribute('data-id')),
  'copiar': copiarExportacao,
  'modal-fundo': fecharModal,
  'modal-fechar': fecharModal,
  'modal-cancelar': esconderModal,
  'ver-assinatura': () => { esconderModal(); ir('assinatura'); },
  'limpar': () => { rascunho = null; render(); },
  'exemplo': () => {
    rascunho = { titulo: 'Sistema Solar em escala', disciplina: 'Ciências', etapa: '6º ano EF', tema: 'o Sistema Solar', nAulas: 2, aulasTexto: '2', duracao: 50, objetivos: 'Comparar o tamanho dos planetas usando escalas.\nDescrever a ordem dos planetas a partir do Sol.', metodos: ['Aprendizagem baseada em projetos'], avaliacao: 'Rubrica de participação' };
    render();
  },
  'salvar-plano': salvarPrevia,
  'regenerar': () => gerar(rascunho, (previa.variante || 0) + 1),
  'voltar-form': () => { previa = null; ir('novo'); },
  'periodo': (t) => { periodo = t.getAttribute('data-p'); render(); },
  'assinar': (t) => { compra = novaCompra(t.getAttribute('data-plano'), periodo); ir('checkout'); },
  'aplicar-cupom': aplicarCupomNaTela,
  'confirmar-compra': () => {
    eu().plano = compra.plano;
    salvar();
    toast(`Assinatura ${NOMES_PLANO[compra.plano]} confirmada. Bom planejamento!`);
    compra = null;
    ir('planos');
  },
  'reset': () => abrirModal(`<h2>Restaurar dados de demonstração?</h2><p>Contas criadas, planos e assinaturas feitas neste navegador voltam ao estado inicial.</p>
    <div class="botoes"><button class="btn btn-ghost" data-act="modal-cancelar" data-foco>Cancelar</button><button class="btn btn-primary" data-act="reset-ok">Restaurar</button></div>`),
  'reset-ok': restaurarDados
};

document.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-act]');
  if (!t) return;
  const act = t.getAttribute('data-act');
  if (act === 'modal-fundo' && ev.target !== t) return;
  if (ACOES[act]) ACOES[act](t);
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && $('#camada .fundo')) esconderModal();
});

document.addEventListener('input', (ev) => {
  if (ev.target.id === 'busca') { busca = ev.target.value; renderLista(); }
  if (ev.target.id === 'f-obj') $('#obj-cont').textContent = ev.target.value.length + '/500';
});

document.addEventListener('change', (ev) => {
  if (ev.target.id === 'filtro') { filtro = ev.target.value; renderLista(); }
});

const FORMULARIOS = {
  'form-login': () => {
    const email = $('#l-email').value.trim();
    const senha = $('#l-senha').value;
    if (!email || !senha) return mostrarErro('#l-erro', 'Preencha e-mail e senha.');
    const u = autenticar(db.usuarios, email, senha);
    if (!u) return mostrarErro('#l-erro', 'E-mail ou senha incorretos.');
    db.sessao = u.email; ultimoUsuario = u; salvar();
    ir('planos');
  },
  'form-cadastro': () => {
    const dados = {
      nome: $('#c-nome').value, email: $('#c-email').value, senha: $('#c-senha').value,
      confirmacao: $('#c-senha2').value, aceitouTermos: $('#c-termos').checked
    };
    const erro = validarCadastro(dados, db.usuarios);
    if (erro) return mostrarErro('#c-erro', erro);
    const novo = { id: gerarId(), nome: dados.nome.trim(), email: dados.email.trim(), senha: dados.senha, perfil: $('#c-perfil').value, escola: '', disciplina: DISCIPLINAS[0], plano: 'free', notificacoes: true };
    db.usuarios.push(novo); db.sessao = novo.email; ultimoUsuario = novo; salvar();
    toast('Conta criada. Boas-vindas ao Meu Plan!');
    ir('planos');
  },
  'form-novo': () => {
    const f = lerFormNovo();
    rascunho = f;
    const erro = validarFormularioPlano(f);
    if (erro) return mostrarErro('#f-erro', erro);
    gerar(f, 0);
  },
  'form-editar': () => {
    const p = planoAtual();
    p.titulo = $('#e-titulo').value.trim() || undefined;
    p.tema = $('#e-tema').value.trim() || p.tema;
    $$('textarea[data-aula]').forEach((el) => { p.aulas[+el.getAttribute('data-aula')].atividade = el.value.trim(); });
    salvar();
    toast('Alterações gravadas');
    ir('plano', p.id);
  },
  'form-perfil': () => {
    const u = eu();
    const novoEmail = $('#p-email').value.trim();
    if (!$('#p-nome').value.trim()) return mostrarErro('#p-erro', 'Informe seu nome.');
    if (!ehEmailValido(novoEmail)) return mostrarErro('#p-erro', 'Informe um e-mail válido.');
    if (db.usuarios.some((x) => x !== u && x.email.toLowerCase() === novoEmail.toLowerCase())) return mostrarErro('#p-erro', 'Já existe uma conta com este e-mail.');
    u.nome = $('#p-nome').value.trim(); u.email = novoEmail; u.escola = $('#p-escola').value.trim();
    u.disciplina = $('#p-disc').value; u.notificacoes = $('#p-notif').checked;
    db.sessao = novoEmail; ultimoUsuario = u; salvar();
    toast('Perfil atualizado');
    render();
  }
};

document.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const tratar = FORMULARIOS[ev.target.id];
  if (tratar) tratar();
});

document.querySelector('#versao').textContent = VERSAO;
render();
