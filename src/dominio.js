/**
 * Meu Plan · regras de negócio
 *
 * Funções puras: recebem dados e devolvem dados, sem tocar na tela nem no
 * armazenamento. Por isso podem ser testadas diretamente com `node --test`.
 * A interface (src/app.js) importa tudo daqui.
 */

export const VERSAO = '2.4.1';
export const LIMITE_GRATIS = 5;

export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const DISCIPLINAS = ['Matemática', 'Língua Portuguesa', 'Ciências', 'História', 'Geografia', 'Inglês', 'Artes', 'Educação Física'];
export const ETAPAS = ['Educação Infantil', '1º ano EF', '2º ano EF', '3º ano EF', '4º ano EF', '5º ano EF', '6º ano EF', '7º ano EF', '8º ano EF', '9º ano EF', '1ª série EM', '2ª série EM', '3ª série EM', 'Ensino Superior'];
export const METODOS = ['Aula expositiva dialogada', 'Gamificação', 'Sala de aula invertida', 'Aprendizagem baseada em projetos'];
export const AVALIACOES = ['Observação e registro', 'Rubrica de participação', 'Atividade escrita', 'Autoavaliação'];
export const PERFIS = ['Educação Infantil', 'Ensino Fundamental', 'Ensino Médio', 'Ensino Superior'];

/** Opções do filtro de Meus planos: [valor, rótulo exibido]. */
export const FILTROS_DISCIPLINA = [
  ['Matemática', 'Matemática'],
  ['Lingua Portuguesa', 'Língua Portuguesa'],
  ['Ciências', 'Ciências'],
  ['História', 'História'],
  ['Geografia', 'Geografia'],
  ['Inglês', 'Inglês'],
  ['Artes', 'Artes'],
  ['Educação Física', 'Educação Física']
];

export const NOMES_PLANO = { free: 'Gratuito', pro: 'Pro', escola: 'Escola' };
export const PRECOS = { pro: { mensal: 29.9, anual: 299 }, escola: { mensal: 199, anual: 2388 } };
export const CUPONS = { PROFESSOR10: 0.10, VOLTAAULAS: 0.15 };

const ETAPAS_AULA = [
  ['Acolhida e problematização', 0.10],
  ['Exploração do conteúdo', 0.35],
  ['Prática orientada', 0.40],
  ['Síntese e fechamento', 0.15]
];
const ABERTURAS = ['Primeiro contato', 'Aprofundamento', 'Aplicação', 'Revisão', 'Consolidação'];
const ATIVIDADES = [
  (t) => `Roda de conversa sobre ${t}: os estudantes contam o que já sabem e registram perguntas que serão retomadas ao longo da aula.`,
  (t) => `Investigação em duplas: cada dupla recebe uma situação-problema envolvendo ${t} e anota hipóteses em um quadro coletivo.`,
  (t) => `Estações de aprendizagem com três desafios curtos sobre ${t}. Os grupos trocam de estação a cada 10 minutos.`,
  (t) => `Produção individual: cada estudante cria um pequeno material explicando ${t} para um colega de outra turma.`,
  (t) => `Jogo de perguntas e respostas sobre ${t}, com pontuação por equipe e revisão comentada dos erros mais comuns.`
];
const MATERIAIS = {
  'Matemática': ['Material dourado ou recortes em papel', 'Folha de exercícios impressa'],
  'Língua Portuguesa': ['Textos impressos para leitura', 'Dicionários'],
  'Ciências': ['Imagens e vídeos curtos', 'Materiais simples para experimento'],
  'História': ['Linha do tempo em cartolina', 'Fontes históricas impressas'],
  'Geografia': ['Mapas e atlas', 'Imagens de satélite'],
  'Inglês': ['Cartões de vocabulário', 'Áudio de apoio'],
  'Artes': ['Papéis coloridos, tesoura e cola', 'Reproduções de obras'],
  'Educação Física': ['Cones e bolas', 'Apito e cronômetro']
};

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

export function gerarId() {
  return Math.random().toString(36).slice(2, 10);
}

function doisDigitos(n) {
  return String(n).padStart(2, '0');
}

/** Data no formato dd/mm/aaaa. */
export function formatarData(iso) {
  const d = new Date(iso);
  return doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth()) + '/' + d.getFullYear();
}

/** Valor em reais, por exemplo "R$ 29,90". */
export function dinheiro(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Iniciais para o avatar: "Ana Ribeiro" → "AR". */
export function iniciais(nome) {
  return String(nome || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export function ehEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* ------------------------------------------------------------------ */
/* Contas                                                              */
/* ------------------------------------------------------------------ */

/** Devolve o usuário quando e-mail e senha conferem; senão, null. */
export function autenticar(usuarios, email, senha) {
  const usuario = usuarios.find((u) => u.email === email.trim());
  if (!usuario || usuario.senha !== senha) return null;
  return usuario;
}

/**
 * Valida o formulário de cadastro.
 * @param {{nome:string,email:string,senha:string,confirmacao:string,aceitouTermos:boolean}} dados
 * @returns {string|null} mensagem de erro ou null quando está tudo certo
 */
export function validarCadastro(dados, usuarios) {
  if (!dados.nome.trim()) return 'Informe seu nome.';
  if (!ehEmailValido(dados.email.trim())) return 'Informe um e-mail válido, como nome@escola.com.';
  if (usuarios.some((u) => u.email.toLowerCase() === dados.email.trim().toLowerCase())) return 'Já existe uma conta com este e-mail.';
  if (dados.senha.length < 8 || !/\d/.test(dados.senha)) return 'A senha precisa ter pelo menos 8 caracteres e um número.';
  if (!dados.aceitouTermos) return 'Para continuar, aceite os termos de uso.';
  return null;
}

/* ------------------------------------------------------------------ */
/* Planejamentos                                                       */
/* ------------------------------------------------------------------ */

/**
 * Valida o formulário de novo plano.
 * @returns {string|null} mensagem de erro ou null
 */
export function validarFormularioPlano(f) {
  if (!f.tema) return 'Erro 422: payload inválido (campo "topic" ausente).';
  if (f.aulasTexto === '' || Number.isNaN(f.nAulas)) return 'Informe o número de aulas.';
  if (f.nAulas > 10) return 'O plano pode ter no máximo 10 aulas.';
  if (Number.isNaN(f.duracao) || f.duracao < 30 || f.duracao > 120) return 'A duração de cada aula deve ficar entre 30 e 120 minutos.';
  return null;
}

/**
 * Monta o planejamento a partir do formulário. `variante` muda as
 * atividades sugeridas (usado pelo botão Regenerar).
 */
export function montarPlano(f, variante = 0) {
  const tema = f.tema;
  const aulas = [];
  for (let i = 0; i < f.nAulas; i++) {
    const etapas = ETAPAS_AULA.map(([nome, fracao]) => ({ nome, min: Math.ceil(f.duracao * fracao) }));
    let idx = (i + variante) % ATIVIDADES.length;
    if (f.metodos && f.metodos.includes('Gamificação') && i === f.nAulas - 1) idx = 4;
    aulas.push({
      titulo: `Aula ${i + 1} · ${ABERTURAS[(i + variante) % ABERTURAS.length]}: ${tema}`,
      etapas,
      atividade: ATIVIDADES[idx](tema)
    });
  }
  let objetivos = (f.objetivos || '').split('\n').map((s) => s.trim()).filter(Boolean);
  if (!objetivos.length) objetivos = [`Explicar ${tema} com as próprias palavras.`, `Resolver situações-problema que envolvam ${tema}.`];
  return {
    titulo: f.titulo,
    disciplina: f.disciplina,
    etapa: f.etapa,
    tema,
    nAulas: f.nAulas,
    duracao: f.duracao,
    metodos: (f.metodos || []).slice(),
    avaliacao: f.avaliacao,
    objetivos,
    habilidades: [
      `Compreender os conceitos centrais do tema: ${tema}.`,
      `Relacionar ${tema} a situações do cotidiano.`,
      'Comunicar ideias com clareza, oralmente e por escrito.'
    ],
    aulas,
    materiais: (MATERIAIS[f.disciplina] || []).concat(['Quadro e giz ou pincel', 'Projetor (opcional)']),
    variante
  };
}

export function planosDoUsuario(planos, usuario) {
  return planos.filter((p) => p.dono === usuario.id);
}

/** Quantos planos o usuário criou no mês de `hoje`. */
export function contarPlanosNoMes(planos, usuario, hoje = new Date()) {
  return planosDoUsuario(planos, usuario).filter((p) => {
    const d = new Date(p.criadoEm);
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  }).length;
}

/** O plano Gratuito permite até LIMITE_GRATIS planejamentos por mês. */
export function podeCriarPlano(planos, usuario, hoje = new Date()) {
  return usuario.plano !== 'free' || contarPlanosNoMes(planos, usuario, hoje) <= LIMITE_GRATIS;
}

/** Busca pelo título e filtra pela disciplina (valor vazio = todas). */
export function filtrarPlanos(planos, busca, disciplina) {
  return planos.filter((p) => String(p.titulo).indexOf(busca) >= 0 && (!disciplina || p.disciplina === disciplina));
}

/** Cria uma cópia do plano com novo id, título "(cópia)" e data atual. */
export function duplicarPlano(plano, novoId, agora = new Date()) {
  return Object.assign({}, plano, { id: novoId, titulo: plano.titulo + ' (cópia)', criadoEm: agora.toISOString() });
}

/** Texto simples do plano, para copiar e colar. */
export function textoExportado(p) {
  const linhas = [];
  linhas.push('PLANO DE AULA: ' + p.titulo);
  linhas.push('Disciplina: ' + p.disciplina + ' | Etapa: ' + p.etapa + ' | Tema: ' + p.tema);
  linhas.push(p.aulas.length + ' aulas de ' + p.duracao + ' minutos');
  linhas.push('');
  linhas.push('OBJETIVOS');
  p.objetivos.forEach((o) => linhas.push('- ' + o));
  linhas.push('');
  linhas.push('SEQUÊNCIA DE AULAS');
  for (let i = 0; i < p.aulas.length - 1; i++) {
    const a = p.aulas[i];
    linhas.push('');
    linhas.push(a.titulo);
    a.etapas.forEach((e) => linhas.push('  ' + e.nome + ': ' + e.min + ' min'));
    linhas.push('  Atividade: ' + a.atividade);
  }
  linhas.push('');
  linhas.push('MATERIAIS');
  p.materiais.forEach((m) => linhas.push('- ' + m));
  linhas.push('');
  linhas.push('AVALIAÇÃO: ' + p.avaliacao);
  linhas.push('');
  linhas.push('Gerado por Meu Plan · InfoEduc Tech');
  return linhas.join('\n');
}

/* ------------------------------------------------------------------ */
/* Assinatura                                                          */
/* ------------------------------------------------------------------ */

export function precoDoPlano(plano, periodo) {
  return PRECOS[plano][periodo];
}

export function novaCompra(plano, periodo) {
  const preco = precoDoPlano(plano, periodo);
  return { plano, periodo, subtotal: preco, total: preco, cupom: null };
}

/**
 * Aplica um cupom à compra.
 * @returns {{ok:true, compra:object} | {ok:false, mensagem:string}}
 */
export function aplicarCupom(compra, codigo) {
  const cod = String(codigo || '').trim().toUpperCase();
  if (!cod) return { ok: false, mensagem: 'Digite um cupom.' };
  if (!Object.prototype.hasOwnProperty.call(CUPONS, cod)) return { ok: false, mensagem: 'Cupom inválido ou expirado.' };
  const total = Math.round(compra.total * (1 - CUPONS[cod]) * 100) / 100;
  return { ok: true, compra: Object.assign({}, compra, { total, cupom: cod }) };
}

/* ------------------------------------------------------------------ */
/* Dados de demonstração                                               */
/* ------------------------------------------------------------------ */

/** Contas e planos de exemplo, com datas no mês atual. */
export function dadosIniciais(hoje = new Date(), novoId = gerarId) {
  const dia = (k) => new Date(hoje.getFullYear(), hoje.getMonth(), Math.max(1, hoje.getDate() - k), 10, 0).toISOString();
  const criar = (dono, f, k) => Object.assign(montarPlano(f, k % 3), { id: novoId(), dono, criadoEm: dia(k) });
  return {
    usuarios: [
      { id: 'u1', nome: 'Ana Ribeiro', email: 'professor@meuplan.test', senha: 'Plan@2026', perfil: 'Ensino Fundamental', escola: 'Escola Municipal Rio Claro', disciplina: 'Matemática', plano: 'free', notificacoes: true },
      { id: 'u2', nome: 'Carlos Menezes', email: 'pro@meuplan.test', senha: 'Plan@2026', perfil: 'Ensino Médio', escola: 'Colégio Horizonte', disciplina: 'História', plano: 'pro', notificacoes: false }
    ],
    planos: [
      criar('u1', { titulo: 'Frações no cotidiano', disciplina: 'Matemática', etapa: '6º ano EF', tema: 'frações', nAulas: 3, duracao: 50, objetivos: 'Reconhecer frações em situações do dia a dia.\nComparar frações com o mesmo denominador.', metodos: ['Gamificação'], avaliacao: 'Atividade escrita' }, 1),
      criar('u1', { titulo: 'Gêneros textuais: a crônica', disciplina: 'Língua Portuguesa', etapa: '8º ano EF', tema: 'a crônica', nAulas: 2, duracao: 50, objetivos: 'Identificar características da crônica.\nProduzir uma crônica curta.', metodos: ['Aula expositiva dialogada'], avaliacao: 'Rubrica de participação' }, 3),
      criar('u1', { titulo: 'Ciclo da água', disciplina: 'Ciências', etapa: '5º ano EF', tema: 'o ciclo da água', nAulas: 2, duracao: 45, objetivos: '', metodos: ['Aprendizagem baseada em projetos'], avaliacao: 'Observação e registro' }, 5),
      criar('u2', { titulo: 'Revolução Industrial', disciplina: 'História', etapa: '2ª série EM', tema: 'a Revolução Industrial', nAulas: 4, duracao: 50, objetivos: 'Analisar mudanças no trabalho após a industrialização.', metodos: ['Sala de aula invertida'], avaliacao: 'Atividade escrita' }, 2),
      criar('u2', { titulo: 'Brasil Colônia', disciplina: 'História', etapa: '7º ano EF', tema: 'o Brasil Colônia', nAulas: 3, duracao: 60, objetivos: '', metodos: ['Aula expositiva dialogada'], avaliacao: 'Autoavaliação' }, 6)
    ],
    sessao: null
  };
}
