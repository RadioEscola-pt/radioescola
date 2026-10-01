import type { CategoryId } from '@/lib/config/categories';

/**
 * A categoria mais baixa que precisa de cada secção dos guias.
 *
 * Serve para dobrar, por leitor, o que o exame dele não pede: um candidato de
 * categoria 3 não tem de se preocupar com as classes de amplificação nem com a
 * dispersão boreal, e hoje lê-as sem saber que não precisa.
 *
 * `null` quer dizer «sem matéria de exame»: introduções, blocos de perguntas do
 * próprio guia, logística do exame. Nunca se dobra, porque não pertence a
 * nível nenhum.
 *
 * Como foi apurado (2026-09-25): cruzando duas fontes por secção, o Anexo 1 da
 * ANACOM (`docs/referencias/`), que marca a categoria de cada uma das suas 296
 * alíneas, e o banco de perguntas, que prova o que é mesmo perguntado a cada
 * nível. Onde discordam ganha o banco, porque uma pergunta numa prova de
 * categoria 3 é matéria de categoria 3 independentemente da tabela. A regra é o
 * **mínimo**: uma secção com um facto de categoria 3 e um refinamento de
 * categoria 1 fica em 3, porque o candidato de 3 tem de a ler.
 *
 * As chamadas discutíveis, e quem as decidiu, estão em
 * `docs/referencias/README.md`.
 *
 * A ordem do array é a ordem das secções `##` no ficheiro, e é por ela que se
 * casam os dados com a página; `__tests__` falha se divergirem.
 */
export interface GuideSection {
  /** O título `##`, tal como está no MDX. Serve de verificação, não de chave. */
  heading: string;
  /** Categoria mais baixa que precisa desta secção, ou null se não é matéria. */
  min: CategoryId | null;
}

export const GUIDE_SECTIONS: Record<string, GuideSection[]> = {
  'teoria-electrica-e-radio': [
    { heading: '1.1 Condutividade', min: '3' },
    { heading: '1.2 Fontes de electricidade', min: '2' },
    { heading: '1.3 Ondas de rádio', min: '3' },
    { heading: '1.4 Sinais áudio e digitais', min: '2' },
    { heading: '1.5 Sinais modulados', min: '3' },
    { heading: '1.6 Potência', min: '2' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'corrente-alternada': [
    { heading: 'O que representa cada número', min: '3' },
    { heading: 'Valor eficaz: porque importa', min: '3' },
    { heading: 'Período e frequência', min: '3' },
    { heading: 'Exemplos com números', min: '3' },
    { heading: 'Resumo das relações', min: '3' },
  ],
  'campo-electromagnetico': [
    { heading: 'As ondas de rádio como ondas electromagnéticas', min: '3' },
    { heading: 'A velocidade de propagação e a sua relação com a frequência e comprimento de onda', min: '3' },
    { heading: 'Polarização (CAT2)', min: '2' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'modulacao-am': [
    { heading: '1. Modular: portadora, sinal modulante, sinal modulado', min: '2' },
    { heading: '2. O espectro de um sinal AM', min: '2' },
    { heading: '3. A informação está nas bandas laterais', min: '2' },
    { heading: '4. Profundidade de modulação e sobremodulação', min: '2' },
    { heading: '5. Classes de emissão da UIT', min: '3' },
    { heading: '6. Modulação por impulsos', min: '1' },
    { heading: '7. AM, SSB e FM lado a lado', min: '3' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'banda-lateral-unica': [
    { heading: '1. O que se suprime, e o que isso poupa', min: '2' },
    { heading: '2. Largura de banda, espectro e ruído', min: '2' },
    { heading: '3. Banda lateral superior ou inferior: a convenção por faixa', min: '3' },
    { heading: '4. Como se gera um sinal de banda lateral única', min: '2' },
    { heading: '5. Como se recebe', min: '2' },
    { heading: '6. Telegrafia (CW)', min: '3' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'modulacao-de-frequencia': [
    { heading: '1. Modulação angular: o que varia, e o que fica constante', min: '2' },
    { heading: '2. Desvio de frequência', min: '2' },
    { heading: '3. Índice de modulação', min: '2' },
    { heading: '4. Largura de banda ocupada: a regra de Carson', min: '2' },
    { heading: '5. Porque é que a FM resiste ao ruído', min: '2' },
    { heading: '6. Porque não se usa FM em fonia abaixo dos 29,5 MHz', min: '2' },
    { heading: '7. FSK e PSK: as versões digitais', min: '1' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'processamento-digital-de-sinal': [
    { heading: '1. Porque se processa em digital', min: '1' },
    { heading: '2. A conversão analógica/digital', min: '1' },
    { heading: '3. Sinais e sistemas em tempo discreto', min: '1' },
    { heading: '4. Filtros digitais: FIR e IIR', min: '1' },
    { heading: '5. Reconstrução: a volta ao analógico', min: '1' },
    { heading: '6. O DSP no rádio real', min: '3' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'componentes': [
    { heading: '2.1 Resistência', min: '3' },
    { heading: '2.2 Condensador', min: '2' },
    { heading: '2.3 Bobina', min: '2' },
    { heading: '2.4 Transformadores: aplicação e utilização', min: '2' },
    { heading: '2.5 Díodo', min: '2' },
    { heading: '2.6 Transístor', min: '2' },
    { heading: '2.7 Circuitos sintonizados', min: '2' },
    { heading: '2.8 Válvulas termoiónicas', min: '2' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'transistores': [
    { heading: '1. Transístor de Junção Bipolar (BJT)', min: '2' },
    { heading: '2. Modos de Funcionamento do BJT', min: '2' },
    { heading: '3. Transístores de Efeito de Campo (FET e MOSFET)', min: '1' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'codigo-de-cores': [
    { heading: 'Como funciona o código de cores', min: '3' },
  ],
  'leis-de-kirchhoff': [
    { heading: '1. Duas leis, e só duas', min: '1' },
    { heading: '2. A lei dos nós (lei das correntes)', min: '2' },
    { heading: '3. A lei das malhas (lei das tensões)', min: '2' },
    { heading: '4. Aplicar as leis a problemas de exame', min: '2' },
    { heading: '5. Donde vêm as regras de associação', min: '2' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'circuitos': [
    { heading: '3.1 Filtros', min: '3' },
    { heading: '3.2 Circuitos sintonizados', min: '2' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'circuitos-rl-rc': [
    { heading: '1. O Triângulo de Impedâncias', min: '2' },
    { heading: '2. Quedas de Tensão Fasoriais', min: '1' },
    { heading: '3. Constantes de Tempo ($\\tau$) e Transitórios', min: null },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'ressonancia-e-fator-q': [
    { heading: 'Vídeo-Aula: Reatâncias e Ressonância', min: '1' },
    { heading: '1. Reatância Indutiva ($X_L$) e Capacitiva ($X_C$)', min: '1' },
    { heading: '2. Frequência de Ressonância ($f_0$)', min: '2' },
    { heading: '3. Fator de Mérito ou Qualidade ($Q$) e Largura de Banda', min: '1' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'amplificadores-e-classes': [
    { heading: '1. Ganho: o que se mede e como se exprime', min: '2' },
    { heading: '2. Polarização e ponto de funcionamento em repouso', min: '2' },
    { heading: '3. As quatro classes', min: '1' },
    { heading: '4. Rendimento, calor e o compromisso', min: '2' },
    { heading: '5. As classes na cadeia de um emissor e de um recetor', min: '2' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'amplificadores-operacionais': [
    { heading: '1. O Modelo do Amplificador Operacional Ideal', min: '1' },
    { heading: '2. Configurações Fundamentais', min: '1' },
    { heading: 'Resumo das Fórmulas de Ganho', min: '1' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'distorcao-e-intermodulacao': [
    { heading: '1. Linear e não linear', min: '2' },
    { heading: '2. Distorção harmónica: um sinal, múltiplos inteiros', min: '3' },
    { heading: '3. Intermodulação: dois sinais, produtos ao lado do sinal útil', min: '1' },
    { heading: '4. Na emissão: excitação a mais, ALC e splatter', min: '3' },
    { heading: '5. Na receção: bloqueio, transmodulação e gama dinâmica', min: '1' },
    { heading: '6. Quadro-resumo', min: '3' },
    { heading: '7. O que fazer na prática', min: '2' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'malha-de-captura-de-fase': [
    { heading: '1. O que é uma malha de captura de fase', min: '1' },
    { heading: '2. Os blocos da malha', min: '2' },
    { heading: '3. Engate, gama de captura e gama de manutenção', min: '1' },
    { heading: '4. Síntese de frequências com divisor programável', min: '1' },
    { heading: '5. O oscilador de referência e o ruído de fase', min: '1' },
    { heading: '6. A PLL no emissor e no recetor', min: '2' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'baterias-e-alimentacao': [
    { heading: '1. Capacidade de uma Bateria (Ampere-Hora — $Ah$)', min: '2' },
    { heading: '2. Tipos e Químicas de Baterias', min: '2' },
    { heading: '3. Fontes de Alimentação: Lineares vs Comutadas (Chaveadas)', min: '2' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'recetores': [
    { heading: '4.1 Tipos de receptor', min: '2' },
    { heading: '4.2 Diagramas de blocos por modo', min: '2' },
    { heading: '4.3 Função de cada andar', min: '3' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'emissores': [
    { heading: '5.1 Diagramas de blocos por modo', min: '3' },
    { heading: '5.2 Função de cada andar', min: '3' },
    { heading: '5.3 Características do emissor', min: '3' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'antenas': [
    { heading: '6.1 Tipos de antena', min: '3' },
    { heading: '6.2 Métodos de alimentação da antena', min: '3' },
    { heading: '6.3 Adaptação de impedância', min: '3' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'propagacao': [
    { heading: '7.1 Bandas HF, VHF e UHF', min: '3' },
    { heading: '7.2 A ionosfera e a propagação em HF', min: '3' },
    { heading: '7.3 Desvanecimento (fading)', min: '2' },
    { heading: '7.4 Troposfera e propagação em VHF/UHF', min: '2' },
    { heading: '7.5 Ciclo solar', min: '2' },
    { heading: '7.6 Dispersão boreal e dispersão em meteoritos', min: '1' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'medidas': [
    { heading: '8.1 Grandezas a medir', min: '2' },
    { heading: '8.2 Instrumentos de medida', min: '3' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'figuras-de-lissajous': [
    { heading: 'Como ler a figura', min: '1' },
  ],
  'interferencias': [
    { heading: '9.1 Onde ocorre a interferência', min: '3' },
    { heading: '9.2 Causas da interferência', min: '3' },
    { heading: '9.3 Medidas contra a interferência', min: '3' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'seguranca': [
    { heading: '10.1 O corpo humano', min: '3' },
    { heading: '10.2 Rede eléctrica', min: '3' },
    { heading: '10.3 Perigos', min: '3' },
    { heading: '10.4 Trovoadas', min: '3' },
    { heading: 'Perguntas e respostas', min: null },
  ],
  'codigo-q': [
    { heading: 'Os códigos que saem no exame', min: '3' },
    { heading: 'Tabela completa', min: '3' },
  ],
  'abreviaturas-de-operacao': [
    { heading: 'Essenciais para os exames', min: '3' },
  ],
  'prefixos-ic': [
    { heading: 'Como ler o prefixo', min: '3' },
    { heading: 'Legenda', min: '3' },
    { heading: 'Lista dos prefixos de indicativos de chamada consignados às estações de amador ao abrigo de anteriores legislações', min: '3' },
  ],
  'modos-digitais-e-fec': [
    { heading: '1. Principais Modos Digitais de Amador', min: '1' },
    { heading: '2. Deteção e Correção de Erros', min: '1' },
    { heading: 'Comparação: ARQ vs FEC', min: '1' },
    { heading: 'Perguntas e respostas', min: '1' },
  ],
  'definicoes': [
    { heading: 'Potência e antenas', min: '3' },
    { heading: 'Propagação', min: '1' },
    { heading: 'Frequência e largura de faixa', min: '2' },
    { heading: 'Emissão e radiação', min: '3' },
    { heading: 'Modos de exploração', min: null },
    { heading: 'Estações e serviços', min: '3' },
  ],
  'entidades': [
    { heading: 'UIT, União Internacional de Telecomunicações', min: '3' },
    { heading: 'IARU, International Amateur Radio Union', min: '3' },
    { heading: 'CEPT, Conferência Europeia das Administrações de Correios e Telecomunicações', min: '3' },
    { heading: 'ANACOM, Autoridade Nacional de Comunicações', min: '3' },
    { heading: 'Em resumo', min: '3' },
  ],
  'getting-started': [
    { heading: 'O que é ser radioamador', min: null },
    { heading: 'As três categorias', min: null },
    { heading: 'Como estudar com esta aplicação', min: null },
    { heading: 'O exame da ANACOM', min: null },
    { heading: 'Depois de seres aprovado', min: null },
    { heading: 'Dicas de estudo', min: null },
  ],
  'marcar-exame-anacom': [
    { heading: '1. Documentos e Requisitos Necessários', min: null },
    { heading: '2. Passo a Passo no Portal da ANACOM', min: null },
    { heading: '3. Estrutura e Regras no Dia da Prova', min: null },
    { heading: '4. O que acontece depois do exame?', min: '3' },
  ],
  'alfabeto-fonetico': [],
  'formulario': [],
};

/** As categorias, da mais baixa para a mais alta, que é como elas crescem. */
const ORDEM: CategoryId[] = ['3', '2', '1'];

/**
 * Se um leitor desta categoria precisa desta secção. Cumulativo para cima: quem
 * faz a categoria 1 é examinado em tudo o que a 3 e a 2 exigem.
 */
export function sectionNeededFor(min: CategoryId | null, reader: CategoryId): boolean {
  if (!min) return true;
  return ORDEM.indexOf(min) <= ORDEM.indexOf(reader);
}
