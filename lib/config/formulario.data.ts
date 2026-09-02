/**
 * The formulary content: 151 expressions and 59 reference tables across 14 sections.
 *
 * Derived from `content/questions/**` rather than from a textbook: every entry
 * carries the bank refs that require it, and an entry that could not be tied to
 * a real question was dropped. That rule is what keeps this page a study aid for
 * *these* exams instead of a general radio cheat-sheet, so keep it when editing.
 *
 * `categorias` is derived from `refs` — an entry belongs to the categories of
 * the questions that need it, and the badge on the card is a promise the refs
 * below it have to keep. `__tests__/unit/test-formulario.test.ts` enforces that,
 * along with anchor uniqueness and KaTeX validity.
 *
 * Section order is pedagogical (electrical basics first, propagation and
 * measurement last), not alphabetical. `key` is the anchor id and is unique
 * across the whole file, not just within a section.
 *
 * Types and the ref helpers live in `./formulario`.
 */
import type { FormulaSection } from './formulario';

export const FORMULARIO: FormulaSection[] = [
  {
    "id": "bases-electricas",
    "titulo": "Bases eléctricas e lei de Ohm",
    "intro": "A aritmética de circuitos que sustenta as três provas: lei de Ohm, associação de resistências, leis de Kirchhoff, potência e energia. Notação uniforme — $U$ para tensão, $I$ para corrente, $R$ para resistência — e vírgula decimal, como nos enunciados da ANACOM.",
    "formulas": [
      {
        "key": "lei-de-ohm",
        "nome": "Lei de Ohm",
        "latex": "U = R \\cdot I",
        "variantes": [
          "R = \\frac{U}{I}",
          "I = \\frac{U}{R}"
        ],
        "variaveis": [
          {
            "simbolo": "U",
            "significado": "tensão (diferença de potencial); os enunciados escrevem-na V",
            "unidade": "V (volt)"
          },
          {
            "simbolo": "R",
            "significado": "resistência",
            "unidade": "Ω (ohm)"
          },
          {
            "simbolo": "I",
            "significado": "intensidade de corrente",
            "unidade": "A (ampere)"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#180",
          "cat2#1",
          "cat1#242",
          "cat3#178",
          "cat2#18",
          "cat2#418"
        ],
        "notas": "$R = U \\times I$ NÃO é lei de Ohm — o produto $U \\times I$ é a potência, e é essa a armadilha de cat3#180. Como $U$ e $I$ são proporcionais, a característica corrente/tensão de uma resistência é uma reta (cat2#418); em curto-circuito $R \\to 0$ e, teoricamente, $I \\to \\infty$ (cat2#18). Na cat1 entra como passo intermédio: em cat1#242 calcula-se $I = U/R$ antes de chegar à potência."
      },
      {
        "key": "resistencia-serie-queda-de-tensao",
        "nome": "Resistência em série para baixar a tensão",
        "latex": "R = \\frac{U_{\\text{fonte}} - U_{\\text{carga}}}{I}",
        "variantes": [
          "U_{\\text{carga}} = U_{\\text{fonte}} - R \\cdot I"
        ],
        "variaveis": [
          {
            "simbolo": "R",
            "significado": "resistência a colocar em série com a carga",
            "unidade": "Ω"
          },
          {
            "simbolo": "U_{\\text{fonte}}",
            "significado": "tensão disponível da fonte",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\text{carga}}",
            "significado": "tensão pretendida na carga",
            "unidade": "V"
          },
          {
            "simbolo": "I",
            "significado": "corrente exigida pela carga",
            "unidade": "A"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#2",
          "cat2#3"
        ],
        "notas": "Aplicar a lei de Ohm à queda que a resistência tem de absorver ($300 - 60 = 240$ V), nunca à tensão da fonte nem à da carga. Com 0,8 A dá 300 Ω (cat2#2); com 0,2 A dá 1,2 kΩ (cat2#3). As duas perguntas partilham as mesmas quatro opções e só diferem na corrente — e em cat2#3 o distrator 300 Ω é exactamente $60/0,2$, o resultado de dividir a tensão da carga em vez da queda."
      },
      {
        "key": "lei-dos-nos",
        "nome": "Lei dos nós de Kirchhoff (1.ª lei, lei das correntes)",
        "latex": "\\sum I_{\\text{entra}} = \\sum I_{\\text{sai}} \\qquad I_{\\text{total}} = I_1 + I_2 + \\cdots + I_n",
        "variantes": [
          "\\sum_k I_k = 0 \\quad \\text{(soma algébrica, com sinais)}"
        ],
        "variaveis": [
          {
            "simbolo": "I_{\\text{total}}",
            "significado": "corrente que chega ao nó (corrente na fonte, num circuito paralelo)",
            "unidade": "A"
          },
          {
            "simbolo": "I_1 \\dots I_n",
            "significado": "correntes nos ramos que partem do nó",
            "unidade": "A"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#327",
          "cat1#293",
          "cat1#294",
          "cat1#295",
          "cat1#3",
          "cat1#4"
        ],
        "notas": "Mnemónica: nó → correntes, e por isso a lei dos nós também se chama lei das correntes (cat1#295, cat1#3). A soma algébrica das correntes num nó é igual a zero — nem maior, nem menor (cat1#294). Num circuito em paralelo a corrente total é a SOMA das correntes dos ramos, nunca a média nem um valor que diminua ao acrescentar ramos (cat1#4, cat2#327)."
      },
      {
        "key": "lei-das-malhas",
        "nome": "Lei das malhas de Kirchhoff (2.ª lei, lei das tensões)",
        "latex": "\\sum_{\\text{malha}} U = 0 \\qquad U_{\\text{aplicada}} = U_1 + U_2 + \\cdots + U_n",
        "variantes": [
          "\\sum E = \\sum R \\cdot I"
        ],
        "variaveis": [
          {
            "simbolo": "U_{\\text{aplicada}}",
            "significado": "tensão aplicada ao conjunto em série",
            "unidade": "V"
          },
          {
            "simbolo": "U_1 \\dots U_n",
            "significado": "queda de tensão em cada elemento percorrido, com sinal",
            "unidade": "V"
          },
          {
            "simbolo": "E",
            "significado": "força electromotriz das fontes da malha",
            "unidade": "V"
          },
          {
            "simbolo": "R",
            "significado": "resistência de cada elemento da malha",
            "unidade": "Ω"
          },
          {
            "simbolo": "I",
            "significado": "corrente que percorre a malha",
            "unidade": "A"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#4",
          "cat1#1",
          "cat1#2",
          "cat1#296",
          "cat2#5",
          "cat2#6"
        ],
        "notas": "Mnemónica: malha → tensões (cat1#2). As leis de Kirchhoff são DUAS, a dos nós e a das malhas — não três, e não existe «lei das redes» nem «lei das fontes» (cat1#1, cat1#293). Em série as quedas somam-se: $50 - 25 - 10 - 13 = 2$ V (cat2#4) e $9,2 + 12,5 + 10 + 3,4 = 35,1$ V (cat2#6)."
      },
      {
        "key": "potencia-eletrica",
        "nome": "Potência eléctrica (lei de Joule)",
        "latex": "P = U \\cdot I = R \\cdot I^{2} = \\frac{U^{2}}{R}",
        "variantes": [
          "U = \\sqrt{P \\cdot R}",
          "I = \\sqrt{\\frac{P}{R}}",
          "I = \\frac{P}{U}",
          "R = \\frac{U^{2}}{P}"
        ],
        "variaveis": [
          {
            "simbolo": "P",
            "significado": "potência dissipada (em calor, numa resistência)",
            "unidade": "W (watt)"
          },
          {
            "simbolo": "U",
            "significado": "tensão aos terminais (valor eficaz, em corrente alternada)",
            "unidade": "V"
          },
          {
            "simbolo": "I",
            "significado": "corrente que a atravessa (valor eficaz, em corrente alternada)",
            "unidade": "A"
          },
          {
            "simbolo": "R",
            "significado": "resistência da carga",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#179",
          "cat2#86",
          "cat1#242",
          "cat3#182",
          "cat3#180",
          "cat2#377"
        ],
        "notas": "A dependência é quadrática: se a corrente duplicar, a potência dissipada quadruplica (cat3#179). A potência exprime-se em watt, nunca em joule (cat3#182). Em AC usam-se sempre valores eficazes — 2 A eficazes em 10 Ω dão $10 \\times 2^{2} = 40$ W e não $10 \\times 2 = 20$ W (cat2#86); a forma $U = \\sqrt{P \\cdot R}$ resolve a carga fictícia de 50 Ω a dissipar 1200 W, $\\sqrt{60\\,000} \\approx 245$ V (cat2#377)."
      },
      {
        "key": "energia-eletrica",
        "nome": "Energia eléctrica (watt contra joule)",
        "latex": "W = P \\cdot t \\qquad P = \\frac{W}{t} \\qquad 1\\ \\text{W} = 1\\ \\text{J/s}",
        "variantes": [
          "1\\ \\text{W}\\cdot\\text{h} = 3600\\ \\text{J}"
        ],
        "variaveis": [
          {
            "simbolo": "W",
            "significado": "energia consumida (também escrita E nos enunciados)",
            "unidade": "J (joule) ou W·h"
          },
          {
            "simbolo": "P",
            "significado": "potência, ou seja o ritmo a que a energia é gasta",
            "unidade": "W (watt)"
          },
          {
            "simbolo": "t",
            "significado": "tempo (em segundos, para obter joules)",
            "unidade": "s"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#15",
          "cat2#272",
          "cat2#321"
        ],
        "notas": "É o PRODUTO da potência pelo tempo, nunca o quociente (cat2#272 e cat2#321 são a mesma pergunta, uma com o símbolo E e outra com o símbolo W). Para dar joules o tempo tem de estar em segundos: 1 W durante uma hora são $1 \\times 3600 = 3600$ J (cat2#15). O joule diz quanta energia, o watt diz a que ritmo."
      },
      {
        "key": "autonomia-de-bateria",
        "nome": "Autonomia a partir da capacidade da bateria",
        "latex": "t = \\frac{Q}{I}",
        "variantes": [
          "Q = I \\cdot t"
        ],
        "variaveis": [
          {
            "simbolo": "t",
            "significado": "tempo teórico de funcionamento",
            "unidade": "h (hora)"
          },
          {
            "simbolo": "Q",
            "significado": "capacidade da bateria",
            "unidade": "A·h (ampere-hora)"
          },
          {
            "simbolo": "I",
            "significado": "corrente constante consumida",
            "unidade": "A"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#7",
          "cat2#8"
        ],
        "notas": "A capacidade exprime-se em A·h (um produto), nunca em A/h — é o distrator clássico e está presente em cat2#7. 20 A·h a debitar 2 A dão $20/2 = 10$ horas (cat2#8); é uma previsão teórica, na prática a autonomia é menor."
      },
      {
        "key": "gerador-real",
        "nome": "Tensão aos terminais de um gerador real",
        "latex": "U = E - r_i \\cdot I",
        "variantes": [
          "E = U + r_i \\cdot I",
          "r_i = \\frac{E - U}{I}"
        ],
        "variaveis": [
          {
            "simbolo": "U",
            "significado": "tensão disponível aos bornes do gerador em carga",
            "unidade": "V"
          },
          {
            "simbolo": "E",
            "significado": "força electromotriz (f.e.m.) do gerador",
            "unidade": "V"
          },
          {
            "simbolo": "r_i",
            "significado": "resistência interna do gerador",
            "unidade": "Ω"
          },
          {
            "simbolo": "I",
            "significado": "corrente debitada",
            "unidade": "A"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#16",
          "cat2#17",
          "cat2#325"
        ],
        "notas": "A queda de tensão dá-se dentro do próprio gerador e SUBTRAI-SE à f.e.m.: $100 - 10 \\times 0,5 = 95$ V (cat2#16) e $100 - 40 \\times 0,25 = 90$ V (cat2#17). Uma fonte ideal tem $r_i = 0$; numa fonte real a tensão baixa assim que se lhe pede corrente, e fontes em série somam as f.e.m. — em cat2#325 as três afirmações estão correctas."
      },
      {
        "key": "potencia-ativa-fator-de-potencia",
        "nome": "Potência activa e fator de potência",
        "latex": "P = S \\cdot \\cos\\varphi = U \\cdot I \\cdot \\cos\\varphi",
        "variantes": [
          "\\cos\\varphi = \\frac{P}{S}"
        ],
        "variaveis": [
          {
            "simbolo": "P",
            "significado": "potência activa, a que é realmente consumida",
            "unidade": "W"
          },
          {
            "simbolo": "S",
            "significado": "potência aparente, $S = U \\cdot I$",
            "unidade": "VA (volt-ampere)"
          },
          {
            "simbolo": "U",
            "significado": "tensão eficaz",
            "unidade": "V"
          },
          {
            "simbolo": "I",
            "significado": "corrente eficaz",
            "unidade": "A"
          },
          {
            "simbolo": "\\cos\\varphi",
            "significado": "fator de potência, entre 0 e 1",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#384",
          "cat2#383"
        ],
        "notas": "MULTIPLICA-SE a potência aparente pelo fator de potência; dividir é precisamente o erro que os distratores exploram (cat2#383). Com 100 V, 4 A e fator 0,2: $P = 100 \\times 4 \\times 0,2 = 80$ W. Os 400 VA são a potência aparente, e é esse o distrator de quem se esqueceu do fator (cat2#384)."
      },
      {
        "key": "triangulo-das-potencias",
        "nome": "Potência aparente, activa e reactiva",
        "latex": "S = U \\cdot I \\qquad Q = S \\cdot \\text{sen}\\,\\varphi \\qquad S^{2} = P^{2} + Q^{2}",
        "variantes": [
          "Q = \\sqrt{S^{2} - P^{2}}"
        ],
        "variaveis": [
          {
            "simbolo": "S",
            "significado": "potência aparente",
            "unidade": "VA"
          },
          {
            "simbolo": "P",
            "significado": "potência activa (dissipada, útil)",
            "unidade": "W"
          },
          {
            "simbolo": "Q",
            "significado": "potência reactiva, trocada com bobinas e condensadores",
            "unidade": "var"
          },
          {
            "simbolo": "\\varphi",
            "significado": "desfasamento entre a tensão e a corrente",
            "unidade": "° ou rad"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#382",
          "cat2#383"
        ],
        "notas": "A energia «fora de fase e não produtiva» associada a bobinas e condensadores é a potência REACTIVA, em var (cat2#382) — não «efetiva» nem «de pico da envolvente». Só a resistência dissipa potência activa; $X_L$ e $X_C$ armazenam e devolvem a energia, daí o desfasamento. Não confundir com a potência aparente radiada (p.a.r.) das antenas: apesar do nome, nada tem que ver com este triângulo."
      }
    ],
    "tabelas": [
      {
        "key": "unidades-si-grandezas",
        "nome": "Unidades das grandezas eléctricas",
        "colunas": [
          "Grandeza",
          "Unidade",
          "Símbolo"
        ],
        "linhas": [
          [
            "Tensão / f.e.m.",
            "volt",
            "V"
          ],
          [
            "Corrente",
            "ampere",
            "A"
          ],
          [
            "Resistência, reactância, impedância",
            "ohm",
            "Ω"
          ],
          [
            "Potência (activa)",
            "watt",
            "W"
          ],
          [
            "Potência aparente",
            "volt-ampere",
            "VA"
          ],
          [
            "Potência reactiva",
            "volt-ampere reactivo",
            "var"
          ],
          [
            "Energia",
            "joule",
            "J (= W·s)"
          ],
          [
            "Capacidade",
            "farad",
            "F"
          ],
          [
            "Coeficiente de auto-indução",
            "henry",
            "H"
          ],
          [
            "Frequência",
            "hertz",
            "Hz"
          ],
          [
            "Período",
            "segundo",
            "s"
          ],
          [
            "Comprimento de onda",
            "metro",
            "m"
          ],
          [
            "Capacidade de uma bateria",
            "ampere-hora",
            "A·h"
          ],
          [
            "Intensidade de campo eléctrico",
            "volt por metro",
            "V/m"
          ],
          [
            "Intensidade de campo magnético",
            "ampere por metro",
            "A/m"
          ]
        ],
        "notas": [
          "O joule é o distrator permanente nas perguntas de unidades da cat3 (aparece como opção em cat3#182, cat3#183, cat3#184 e cat3#185). A impedância mede-se em ohm, tal como a resistência e a reactância (cat3#186). Entre farad, henry e hertz vale a pena fixar a ordem: capacidade / auto-indução / frequência (cat2#37, cat2#38)."
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#183",
          "cat2#37",
          "cat3#184",
          "cat3#185",
          "cat3#186",
          "cat2#38"
        ]
      },
      {
        "key": "baterias-valores-de-referencia",
        "nome": "Baterias: valores de referência",
        "colunas": [],
        "linhas": [],
        "notas": [
          "Bateria de automóvel: 12 V nominais; duas em série dão 24 V (cat2#9).",
          "Chumbo-ácido: 2 V por elemento (uma bateria de 12 V tem 6 elementos; ≈ 13,8 V em flutuação). Tensão mínima de descarga ≈ 10,5 V para maximizar a vida útil (cat2#13).",
          "Capacidade em A·h; autonomia teórica = capacidade ÷ corrente.",
          "Recarregáveis: chumbo-ácido, níquel-cádmio (NiCd), hidreto metálico de níquel (NiMH), lítio (cat2#14).",
          "Não recarregáveis (células primárias): carbono-zinco, óxido de prata, mercúrio — recarregar uma célula primária nunca é aceitável (cat2#328).",
          "A baixa resistência interna das NiCd é o que permite elevadas correntes de descarga (cat2#12).",
          "É ao carregar que uma bateria de chumbo-ácido liberta hidrogénio explosivo — não ao descarregar, nem armazenada. Carregar em local ventilado, sem faíscas."
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#7",
          "cat2#9",
          "cat2#13",
          "cat2#14",
          "cat2#328",
          "cat2#12"
        ]
      },
      {
        "key": "instalacao-eletrica-e-fusiveis",
        "nome": "Instalação eléctrica: cores, fusíveis e correntes perigosas",
        "colunas": [
          "Cor do condutor",
          "Função"
        ],
        "linhas": [
          [
            "Verde e amarelo",
            "Terra (proteção)"
          ],
          [
            "Azul",
            "Neutro"
          ],
          [
            "Castanho (ou preto/cinzento)",
            "Fase"
          ]
        ],
        "notas": [
          "Fusível: interrompe a energia em caso de sobrecarga ou curto-circuito, protegendo o equipamento e a instalação (cat2#287) — o calibre sai de $I = P/U$. Não protege pessoas contra choques: isso é função do condutor de terra e do interruptor diferencial (tipicamente 30 mA).",
          "Corrente pelo corpo humano (ordens de grandeza): ≈ 1 mA limiar de perceção; ≈ 10 mA contração muscular, deixando de se conseguir largar o condutor; algumas dezenas de mA já são perigosas — é aí que atua o diferencial de 30 mA — e valores acima disso podem provocar fibrilhação ventricular. É lei de Ohm aplicada ao corpo: mãos molhadas baixam $R$, logo $I$ sobe e uma tensão inofensiva passa a perigosa (cat3#164). Condutores à vista acumulam os dois riscos, choque eléctrico e curto-circuito (cat3#110)."
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#164",
          "cat2#287",
          "cat2#247",
          "cat2#269",
          "cat3#110"
        ]
      }
    ]
  },
  {
    "id": "associacao-componentes",
    "titulo": "Associação de componentes, unidades e código de cores",
    "intro": "Como se combinam resistências, condensadores, bobinas e fontes ligadas em série ou em paralelo, e como se lê o valor de um componente — código de cores das resistências e conversão de prefixos SI. É o bloco de contas mais repetido das provas: quase todos os distratores nascem de trocar a regra da série com a do paralelo ou de errar um prefixo por mil.",
    "formulas": [
      {
        "key": "conversao-de-prefixos",
        "nome": "Conversão de prefixos SI",
        "latex": "X_{\\text{novo}} = X_{\\text{antigo}} \\times 10^{\\,e_{\\text{antigo}} - e_{\\text{novo}}}",
        "variantes": [
          "1\\ \\text{MHz} = 10^{3}\\ \\text{kHz} = 10^{6}\\ \\text{Hz}",
          "1\\ \\mu\\text{F} = 10^{3}\\ \\text{nF} = 10^{6}\\ \\text{pF}",
          "1\\ \\text{mH} = 10^{-3}\\ \\text{H}\\quad\\text{e}\\quad 1\\ \\mu\\text{H} = 10^{-6}\\ \\text{H}"
        ],
        "variaveis": [
          {
            "simbolo": "X",
            "significado": "valor numérico da grandeza",
            "unidade": "a mesma grandeza, prefixo diferente"
          },
          {
            "simbolo": "e",
            "significado": "expoente do prefixo (p = −12, n = −9, µ = −6, m = −3, k = +3, M = +6, G = +9)",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#39",
          "cat1#71",
          "cat2#42",
          "cat2#103",
          "cat2#111",
          "cat2#397"
        ],
        "notas": "Subir um degrau de mil (µ→m, m→unidade, k→M) desloca a vírgula três casas para a esquerda; descer, três para a direita. Antes de substituir em qualquer fórmula, passar tudo a unidades de base (H, F, Hz, Ω) — o erro de mil ou de um milhão é o distrator mais frequente do banco (3,33 mH vs. 3,33 H em cat1#71, 33,3 µF vs. 0,33 µF em cat1#73)."
      },
      {
        "key": "codigo-de-cores-resistencias",
        "nome": "Valor de uma resistência pelo código de cores",
        "latex": "R = (10\\,d_{1} + d_{2}) \\times 10^{m}",
        "variantes": [
          "R = \\overline{d_1 d_2}\\ \\text{seguido de}\\ m\\ \\text{zeros}"
        ],
        "variaveis": [
          {
            "simbolo": "d_1",
            "significado": "algarismo da 1.ª risca",
            "unidade": "0 a 9"
          },
          {
            "simbolo": "d_2",
            "significado": "algarismo da 2.ª risca",
            "unidade": "0 a 9"
          },
          {
            "simbolo": "m",
            "significado": "expoente do multiplicador da 3.ª risca (número de zeros a acrescentar)",
            "unidade": "adimensional"
          },
          {
            "simbolo": "R",
            "significado": "valor da resistência",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "3"
        ],
        "refs": [
          "cat3#195",
          "cat3#196",
          "cat3#197"
        ],
        "notas": "A 4.ª risca (dourada ou prateada, mais afastada) é só a tolerância e nunca entra no valor. As opções distinguem-se quase sempre pelo número de zeros — 220 vs. 2200 (cat3#196), 2000 vs. 20000 (cat3#197) — por isso conte as riscas a partir da extremidade oposta à tolerância."
      },
      {
        "key": "resistencias-em-serie",
        "nome": "Resistências em série",
        "latex": "R_{\\text{eq}} = R_{1} + R_{2} + \\cdots + R_{n}",
        "variantes": [
          "n\\ \\text{resistências iguais:}\\quad R_{\\text{eq}} = n\\,R"
        ],
        "variaveis": [
          {
            "simbolo": "R_{\\text{eq}}",
            "significado": "resistência equivalente do conjunto",
            "unidade": "Ω"
          },
          {
            "simbolo": "R_1 \\ldots R_n",
            "significado": "resistências associadas",
            "unidade": "Ω"
          },
          {
            "simbolo": "n",
            "significado": "número de resistências iguais",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#92",
          "cat2#94",
          "cat2#96",
          "cat2#273",
          "cat2#390",
          "cat2#395"
        ],
        "notas": "Em série a resistência aumenta sempre — é isso que cat2#395 pergunta: para aumentar a resistência acrescenta-se uma resistência em série, nunca em paralelo. Nas perguntas invertidas («que associação dá 200 Ω? e 1 kΩ?») teste cada opção com esta fórmula e com a do paralelo: 100 + 80 + 20 = 200 Ω (cat2#94); 5 × 200 Ω em série = 1 kΩ (cat2#96)."
      },
      {
        "key": "resistencias-em-paralelo",
        "nome": "Resistências em paralelo",
        "latex": "\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_{1}} + \\frac{1}{R_{2}} + \\cdots + \\frac{1}{R_{n}}",
        "variantes": [
          "\\text{duas resistências:}\\quad R_{\\text{eq}} = \\frac{R_{1}\\,R_{2}}{R_{1} + R_{2}}",
          "n\\ \\text{resistências iguais:}\\quad R_{\\text{eq}} = \\frac{R}{n}"
        ],
        "variaveis": [
          {
            "simbolo": "R_{\\text{eq}}",
            "significado": "resistência equivalente do conjunto",
            "unidade": "Ω"
          },
          {
            "simbolo": "R_1 \\ldots R_n",
            "significado": "resistências associadas",
            "unidade": "Ω"
          },
          {
            "simbolo": "n",
            "significado": "número de resistências iguais",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#394",
          "cat2#99",
          "cat2#100",
          "cat2#307",
          "cat2#95",
          "cat2#97"
        ],
        "notas": "Não esquecer de inverter no fim: em cat2#394 (10 ∥ 20 ∥ 50) a soma dos inversos dá 0,17 S (siemens, Ω⁻¹) e a resposta é 1/0,17 ≈ 5,9 Ω — a opção «0,17 ohms» está lá para apanhar quem pára a meio. O equivalente em paralelo é sempre menor do que a menor das resistências, o que elimina metade das opções à vista. Duas iguais dão sempre metade (cat2#99; 66 ∥ 66 = 33 Ω em cat2#307) e a metade seguinte aparece nas opções (16,5 Ω)."
      },
      {
        "key": "fontes-em-serie",
        "nome": "Fontes de tensão em série",
        "latex": "E_{\\text{total}} = E_{1} + E_{2} + \\cdots + E_{n}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "E_{\\text{total}}",
            "significado": "força eletromotriz do conjunto",
            "unidade": "V"
          },
          {
            "simbolo": "E_1 \\ldots E_n",
            "significado": "f.e.m. de cada fonte",
            "unidade": "V"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#9",
          "cat2#10",
          "cat2#325"
        ],
        "notas": "Em série somam-se as tensões e a capacidade em A·h mantém-se; em paralelo mantém-se a tensão e somam-se os A·h. Em cat2#10 nunca se diz «12 V» — é preciso saber que uma bateria de automóvel é de 12 V, logo duas em série dão 24 V. Em cat2#325 esta regra é uma das três afirmações verdadeiras."
      },
      {
        "key": "condensadores-em-paralelo",
        "nome": "Condensadores em paralelo",
        "latex": "C_{\\text{eq}} = C_{1} + C_{2} + \\cdots + C_{n}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "C_{\\text{eq}}",
            "significado": "capacidade equivalente",
            "unidade": "F"
          },
          {
            "simbolo": "C_1 \\ldots C_n",
            "significado": "capacidades associadas",
            "unidade": "F"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#104",
          "cat1#70"
        ],
        "notas": "Os condensadores seguem a regra inversa das resistências: em paralelo somam-se. Verificação rápida — o resultado é sempre maior do que a maior das capacidades (5000 + 5000 + 750 = 10750 pF). Trocar esta regra com a da série é o erro clássico: em cat1#70 o distrator 576,9 pF é exatamente quem aplicou a fórmula da série."
      },
      {
        "key": "condensadores-em-serie",
        "nome": "Condensadores em série",
        "latex": "\\frac{1}{C_{\\text{eq}}} = \\frac{1}{C_{1}} + \\frac{1}{C_{2}} + \\cdots + \\frac{1}{C_{n}}",
        "variantes": [
          "\\text{dois condensadores:}\\quad C_{\\text{eq}} = \\frac{C_{1}\\,C_{2}}{C_{1} + C_{2}}",
          "n\\ \\text{condensadores iguais:}\\quad C_{\\text{eq}} = \\frac{C}{n}"
        ],
        "variaveis": [
          {
            "simbolo": "C_{\\text{eq}}",
            "significado": "capacidade equivalente",
            "unidade": "F"
          },
          {
            "simbolo": "C_1 \\ldots C_n",
            "significado": "capacidades associadas",
            "unidade": "F"
          },
          {
            "simbolo": "n",
            "significado": "número de condensadores iguais",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#72",
          "cat1#73"
        ],
        "notas": "Em série o resultado é sempre menor do que a menor das capacidades: 20 µF com 50 µF dão 14,3 µF (cat1#72); três de 100 µF dão 33,3 µF (cat1#73). Atenção ao prefixo na resposta — 33,3 µF e não 0,33 µF, que é o distrator."
      },
      {
        "key": "bobinas-em-serie",
        "nome": "Bobinas em série",
        "latex": "L_{\\text{eq}} = L_{1} + L_{2} + \\cdots + L_{n}",
        "variantes": [
          "n\\ \\text{bobinas iguais:}\\quad L_{\\text{eq}} = n\\,L"
        ],
        "variaveis": [
          {
            "simbolo": "L_{\\text{eq}}",
            "significado": "indutância equivalente",
            "unidade": "H"
          },
          {
            "simbolo": "L_1 \\ldots L_n",
            "significado": "indutâncias associadas",
            "unidade": "H"
          },
          {
            "simbolo": "n",
            "significado": "número de bobinas iguais",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#373",
          "cat1#74"
        ],
        "notas": "As bobinas comportam-se como as resistências (somam-se em série): 20 + 50 = 70 mH (cat1#373) — repare que 14,3 mH, o resultado da regra do paralelo, está lá como distrator. Para aumentar a indutância de um circuito acrescenta-se uma bobina em série (cat1#74). Só é válido se não houver acoplamento mútuo entre as bobinas."
      },
      {
        "key": "bobinas-em-paralelo",
        "nome": "Bobinas em paralelo",
        "latex": "\\frac{1}{L_{\\text{eq}}} = \\frac{1}{L_{1}} + \\frac{1}{L_{2}} + \\cdots + \\frac{1}{L_{n}}",
        "variantes": [
          "n\\ \\text{bobinas iguais:}\\quad L_{\\text{eq}} = \\frac{L}{n}"
        ],
        "variaveis": [
          {
            "simbolo": "L_{\\text{eq}}",
            "significado": "indutância equivalente",
            "unidade": "H"
          },
          {
            "simbolo": "L_1 \\ldots L_n",
            "significado": "indutâncias associadas",
            "unidade": "H"
          },
          {
            "simbolo": "n",
            "significado": "número de bobinas iguais",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#71",
          "cat1#74"
        ],
        "notas": "O resultado é sempre inferior à menor das indutâncias, logo uma bobina em paralelo diminui a indutância — é a opção errada de cat1#74. Três de 10 mH dão 3,33 mH (cat1#71) — repare no prefixo: 3,33 mH e não 3,33 H."
      },
      {
        "key": "divisor-de-tensao",
        "nome": "Divisor de tensão resistivo",
        "latex": "U_{\\text{saída}} = U_{\\text{entrada}} \\cdot \\frac{R_{2}}{R_{1} + R_{2}}",
        "variantes": [
          "R_1 = R_2 \\Rightarrow U_{\\text{saída}} = \\frac{U_{\\text{entrada}}}{2}\\ \\Rightarrow\\ 6\\ \\text{dB de atenuação}",
          "\\text{polarização fixa de base:}\\quad U_{B} = U_{CC}\\,\\frac{R_{2}}{R_{1} + R_{2}}"
        ],
        "variaveis": [
          {
            "simbolo": "U_{\\text{entrada}}",
            "significado": "tensão aplicada ao conjunto das duas resistências",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\text{saída}}",
            "significado": "tensão no ponto de junção (aos terminais de R2)",
            "unidade": "V"
          },
          {
            "simbolo": "R_1",
            "significado": "resistência superior (do lado da entrada)",
            "unidade": "Ω"
          },
          {
            "simbolo": "R_2",
            "significado": "resistência inferior (a que liga à massa)",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#385",
          "cat1#114",
          "cat1#115"
        ],
        "notas": "Só conta a razão entre as resistências, não o seu valor: no atenuador de duas resistências iguais com saída no ponto médio (cat2#385, duas de 100 Ω) a tensão fica a metade, e como é tensão usa-se 20·log(0,5) = −6 dB, ou seja 6 dB de atenuação — nunca 3 dB, que seria a resposta se se tratasse de potência. Duas resistências entre a alimentação e a massa com a base no ponto médio são «polarização fixa» (a tensão da base não depende do β) — não confundir com a polarização própria, que é a resistência de emissor, e que é o distrator de cat1#115."
      },
      {
        "key": "capacidade-condensador-plano",
        "nome": "Capacidade de um condensador plano",
        "latex": "C = \\frac{\\varepsilon_{0}\\,\\varepsilon_{r}\\,A}{d}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "C",
            "significado": "capacidade",
            "unidade": "F"
          },
          {
            "simbolo": "\\varepsilon_0",
            "significado": "permitividade do vazio (8,85 × 10⁻¹²)",
            "unidade": "F/m"
          },
          {
            "simbolo": "\\varepsilon_r",
            "significado": "constante dieléctrica do isolante",
            "unidade": "adimensional"
          },
          {
            "simbolo": "A",
            "significado": "área das armaduras (superfícies metálicas em frente uma da outra)",
            "unidade": "m²"
          },
          {
            "simbolo": "d",
            "significado": "afastamento entre as armaduras",
            "unidade": "m"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#329",
          "cat1#330",
          "cat1#331",
          "cat1#332"
        ],
        "notas": "Nunca se pede o valor, pede-se o sentido de variação: a capacidade aumenta se A aumentar ou εr aumentar (numerador) e se d diminuir (denominador). Há quatro versões da mesma pergunta com distratores diferentes — «todas as respostas estão corretas» só é a resposta quando as três opções apontam no sentido certo (cat1#329); nas outras três há sempre pelo menos uma invertida."
      }
    ],
    "tabelas": [
      {
        "key": "tabela-codigo-de-cores",
        "nome": "Código de cores das resistências",
        "colunas": [
          "Cor",
          "Algarismo (1.ª e 2.ª riscas)",
          "Multiplicador (3.ª risca)"
        ],
        "linhas": [
          [
            "Preto",
            "0",
            "×1"
          ],
          [
            "Castanho",
            "1",
            "×10"
          ],
          [
            "Vermelho",
            "2",
            "×100"
          ],
          [
            "Laranja",
            "3",
            "×1 000"
          ],
          [
            "Amarelo",
            "4",
            "×10 000"
          ],
          [
            "Verde",
            "5",
            "×100 000"
          ],
          [
            "Azul",
            "6",
            "×1 000 000"
          ],
          [
            "Violeta",
            "7",
            "×10 000 000"
          ],
          [
            "Cinzento",
            "8",
            "×100 000 000"
          ],
          [
            "Branco",
            "9",
            "×1 000 000 000"
          ],
          [
            "Dourado",
            "—",
            "×0,1"
          ],
          [
            "Prateado",
            "—",
            "×0,01"
          ]
        ],
        "notas": [
          "O dourado e o prateado só valem como multiplicador na 3.ª risca (resistências abaixo de 10 Ω). Na 4.ª risca, mais afastada das outras, são tolerância: dourado = 5 %, prateado = 10 % — e a tolerância nunca entra no valor.",
          "Casos que caem na prova: vermelho-vermelho-castanho = 220 Ω (cat3#196); vermelho-preto-vermelho = 2 000 Ω = 2 kΩ (cat3#197); castanho-preto-amarelo = 100 000 Ω = 100 kΩ (cat3#195)."
        ],
        "categorias": [
          "3"
        ],
        "refs": [
          "cat3#195",
          "cat3#196",
          "cat3#197"
        ]
      },
      {
        "key": "prefixos-si",
        "nome": "Prefixos SI e conversões exigidas nas provas",
        "colunas": [
          "Prefixo",
          "Símbolo",
          "Fator"
        ],
        "linhas": [
          [
            "giga",
            "G",
            "$10^{9}$"
          ],
          [
            "mega",
            "M",
            "$10^{6}$"
          ],
          [
            "quilo",
            "k",
            "$10^{3}$"
          ],
          [
            "(sem prefixo)",
            "—",
            "$1$"
          ],
          [
            "mili",
            "m",
            "$10^{-3}$"
          ],
          [
            "micro",
            "µ",
            "$10^{-6}$"
          ],
          [
            "nano",
            "n",
            "$10^{-9}$"
          ],
          [
            "pico",
            "p",
            "$10^{-12}$"
          ]
        ],
        "notas": [
          "Conversões que aparecem literalmente no banco:",
          "7,54 MHz = 7 540 kHz · 433,010 MHz = 433 010 000 Hz · 900 kHz = 900 000 Hz · 9 300 MHz = 9,3 GHz · 1 MHz = 1 000 kHz",
          "0,01 µF = 10 000 pF · 470 pF = 0,000 47 µF",
          "1 mH = 0,001 H · 1 µH = 0,000 001 H",
          "1 ppm = $10^{-6}$ = 1 Hz por MHz — em cat1#244, ±0,1 ppm a 146,52 MHz dá 146,52 × 0,1 = 14,652 Hz",
          "Regra de ouro: um degrau de mil (µ→m, m→unidade, k→M) desloca a vírgula três casas. Escrita pt-PT: vírgula decimal (0,707 e não 0.707)."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#39",
          "cat1#244",
          "cat2#40",
          "cat2#42",
          "cat2#103",
          "cat2#397"
        ]
      },
      {
        "key": "regras-serie-paralelo",
        "nome": "Série ou paralelo: qual soma e qual divide",
        "colunas": [
          "Componente",
          "Em série",
          "Em paralelo",
          "Verificação rápida"
        ],
        "linhas": [
          [
            "Resistência $R$",
            "soma-se",
            "soma dos inversos",
            "paralelo < a menor; série > a maior"
          ],
          [
            "Bobina $L$",
            "soma-se",
            "soma dos inversos",
            "igual às resistências (sem acoplamento mútuo)"
          ],
          [
            "Condensador $C$",
            "soma dos inversos",
            "soma-se",
            "ao contrário das resistências"
          ],
          [
            "Fonte (f.e.m. $E$)",
            "as tensões somam-se",
            "a tensão mantém-se",
            "em paralelo somam-se os A·h"
          ]
        ],
        "notas": [
          "Para aumentar $R$ ou $L$: acrescentar em série. Para diminuir: acrescentar em paralelo.",
          "Para aumentar $C$: acrescentar em paralelo. Para diminuir: em série.",
          "Dois elementos iguais no lado «soma dos inversos» dão sempre metade do valor de cada um; $n$ iguais dão $1/n$."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#395",
          "cat1#74",
          "cat2#99",
          "cat2#104",
          "cat1#70",
          "cat1#71"
        ]
      }
    ]
  },
  {
    "id": "corrente-alternada",
    "titulo": "Corrente alternada, sinais e comprimento de onda",
    "intro": "Como se descreve um sinal alternado — período, frequência, valores de pico, pico a pico, eficaz e médio — e como se passa da frequência ao comprimento de onda. É a base de cálculo mais repetida nas três categorias, quase sempre com as mesmas quatro opções na prova.",
    "formulas": [
      {
        "key": "periodo-frequencia",
        "nome": "Período e frequência",
        "latex": "f = \\frac{1}{T} \\qquad T = \\frac{1}{f} \\qquad \\omega = 2\\pi f = \\frac{2\\pi}{T}",
        "variantes": [
          "T = \\frac{1}{f}",
          "f = \\frac{1}{T}",
          "\\omega = 2\\pi f"
        ],
        "variaveis": [
          {
            "simbolo": "f",
            "significado": "frequência (ciclos por segundo)",
            "unidade": "Hz"
          },
          {
            "simbolo": "T",
            "significado": "período (duração de um ciclo completo)",
            "unidade": "s"
          },
          {
            "simbolo": "\\omega",
            "significado": "frequência angular (pulsação)",
            "unidade": "rad/s"
          }
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#207",
          "cat2#43",
          "cat2#50",
          "cat2#46",
          "cat2#48",
          "cat3#198"
        ],
        "notas": "Cuidado com o zero a menos: 50 Hz dão $T = 1/50 = 0{,}02$ s e não 0,2 s (cat2#50). Se a frequência duplica, o período passa a metade (cat2#46). O período exprime-se em segundos, a frequência em hertz — nunca ao contrário. A pulsação $\\omega = 2\\pi f$ não é pedida em nenhuma pergunta desta secção: só é necessária nas fórmulas de reactância e de ressonância. Atalhos: 1 ms → 1 kHz, 1 µs → 1 MHz, 10 ns → 100 MHz."
      },
      {
        "key": "valor-pico-a-pico",
        "nome": "Valor de pico e valor pico a pico",
        "latex": "U_{\\text{pp}} = 2\\,U_{\\text{p}} = |{+U_{\\text{p}}}| + |{-U_{\\text{p}}}|",
        "variantes": [
          "U_{\\mathrm{p}} = \\frac{U_{\\mathrm{pp}}}{2}"
        ],
        "variaveis": [
          {
            "simbolo": "U_{\\mathrm{p}}",
            "significado": "valor de pico ou amplitude (do zero ao máximo)",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\mathrm{pp}}",
            "significado": "valor pico a pico (do mínimo ao máximo)",
            "unidade": "V"
          },
          {
            "simbolo": "+U_m,\\ -U_m",
            "significado": "máximo positivo e máximo negativo da onda",
            "unidade": "V"
          }
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#203",
          "cat2#335",
          "cat3#202",
          "cat3#199",
          "cat2#47"
        ],
        "notas": "Com $+U_m = 1$ V o pico é 1 V e o pico a pico é 2 V (cat3#203, cat3#202). A armadilha é sempre a mesma: em cat2#47 pede-se o pico (48 V) e os 96 V pico a pico estão lá como distrator; em cat2#335 pede-se o pico a pico (184 V) e os 92 V são apenas o pico. Ler duas vezes se o enunciado diz «pico» ou «pico a pico»."
      },
      {
        "key": "valor-eficaz-sinusoide",
        "nome": "Valor eficaz (RMS) de uma sinusoide",
        "latex": "U_{\\text{ef}} = \\frac{U_{\\text{p}}}{\\sqrt{2}} \\approx 0{,}707\\,U_{\\text{p}} \\qquad U_{\\text{p}} = \\sqrt{2}\\,U_{\\text{ef}} \\approx 1{,}414\\,U_{\\text{ef}}",
        "variantes": [
          "U_{\\mathrm{ef}} = \\frac{U_{\\mathrm{pp}}}{2\\sqrt{2}} \\approx 0{,}354\\,U_{\\mathrm{pp}}",
          "U_{\\mathrm{pp}} = 2\\sqrt{2}\\,U_{\\mathrm{ef}} \\approx 2{,}828\\,U_{\\mathrm{ef}}",
          "U_{\\mathrm{p}} = \\sqrt{2}\\,U_{\\mathrm{ef}}"
        ],
        "variaveis": [
          {
            "simbolo": "U_{\\mathrm{ef}}",
            "significado": "valor eficaz ou RMS (o que o voltímetro CA indica)",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\mathrm{p}}",
            "significado": "valor de pico (amplitude)",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\mathrm{pp}}",
            "significado": "valor pico a pico (o que se lê no osciloscópio)",
            "unidade": "V"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#204",
          "cat2#45",
          "cat1#242",
          "cat2#47",
          "cat2#335",
          "cat2#338"
        ],
        "notas": "O sentido da operação é a única dificuldade: do pico para o eficaz **divide-se** por $\\sqrt{2}$, do eficaz para o pico **multiplica-se**. 1 V de pico → 0,707 V eficazes (cat3#204, cat2#45); 34 V eficazes → 48 V de pico (cat2#47); 65 V eficazes → 184 V pico a pico (cat2#335). Só vale para a sinusoide — numa onda quadrada simétrica $U_{\\mathrm{ef}} = U_{\\mathrm{p}}$. Definição física (cat2#338): é a tensão contínua que aquece a mesma resistência do mesmo modo; são os 230 V da tomada, cujo pico real é ≈ 325 V."
      },
      {
        "key": "valor-medio-sinusoide",
        "nome": "Valor médio de uma sinusoide",
        "latex": "U_{\\mathrm{med}} = 0 \\quad \\text{(ao longo de um ciclo completo)}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "U_{\\mathrm{med}}",
            "significado": "valor médio num ciclo completo",
            "unidade": "V"
          }
        ],
        "categorias": [
          "3"
        ],
        "refs": [
          "cat3#206"
        ],
        "notas": "As duas semi-ondas são iguais e de sinal contrário, por isso anulam-se: um voltímetro de corrente contínua ligado a uma sinusoide pura marca 0 V (cat3#206). É o distrator «0 Volt» que aparece em toda a família cat3#202–cat3#206 — não confundir com o valor eficaz, que é 0,707 × pico e nunca zero. O fator 0,637 que aparece nos manuais é a média ao longo de **meia onda** — o mesmo que a média de uma sinusoide retificada em **onda completa**. Uma retificação de **meia onda** dá 0,318 na média do ciclo completo. Nenhum dos dois é o que a prova pergunta."
      },
      {
        "key": "comprimento-de-onda",
        "nome": "Comprimento de onda",
        "latex": "\\lambda = \\frac{c}{f} \\qquad \\lambda\\ [\\mathrm{m}] = \\frac{300}{f\\ [\\mathrm{MHz}]}",
        "variantes": [
          "f\\ [\\mathrm{MHz}] = \\frac{300}{\\lambda\\ [\\mathrm{m}]}",
          "\\lambda\\ [\\mathrm{m}] = \\frac{300\\,000}{f\\ [\\mathrm{kHz}]}"
        ],
        "variaveis": [
          {
            "simbolo": "\\lambda",
            "significado": "comprimento de onda",
            "unidade": "m"
          },
          {
            "simbolo": "c",
            "significado": "velocidade de propagação no vazio, $3 \\times 10^8$ m/s = 300 000 km/s",
            "unidade": "m/s"
          },
          {
            "simbolo": "f",
            "significado": "frequência (em MHz na forma prática)",
            "unidade": "Hz ou MHz"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#187",
          "cat2#33",
          "cat1#186",
          "cat2#32",
          "cat2#34",
          "cat2#420"
        ],
        "notas": "A forma prática 300/f(MHz) resolve tudo de cabeça: 300/25 = 12 m (cat2#33), 300/14,117 ≈ 21,25 MHz (cat2#32), 300/10 = 30 MHz (cat2#34). Atenção às unidades: na forma prática a frequência entra em **MHz** e o resultado sai em **metros**; com c em m/s a frequência tem de entrar em Hz. O comprimento de onda exprime-se em metros, nunca em hertz nem em metros por segundo (cat3#187, cat2#420). Dentro de um cabo a onda é mais curta: multiplica-se $\\lambda$ pelo fator de velocidade (≈ 0,66 no coaxial comum)."
      },
      {
        "key": "potencia-a-partir-de-tensoes-ac",
        "nome": "Potência a partir dos valores de pico e pico a pico",
        "latex": "P = \\frac{U_{\\text{ef}}^{2}}{R} = \\frac{U_{\\text{p}}^{2}}{2R} = \\frac{U_{\\text{pp}}^{2}}{8R}",
        "variantes": [
          "P = \\frac{U_{\\mathrm{p}}^2}{2R}",
          "P = \\frac{U_{\\mathrm{pp}}^2}{8R}"
        ],
        "variaveis": [
          {
            "simbolo": "P",
            "significado": "potência média numa carga resistiva",
            "unidade": "W"
          },
          {
            "simbolo": "U_{\\mathrm{ef}}",
            "significado": "tensão eficaz aos terminais da carga",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\mathrm{p}},\\ U_{\\mathrm{pp}}",
            "significado": "tensão de pico e pico a pico observadas no osciloscópio",
            "unidade": "V"
          },
          {
            "simbolo": "R",
            "significado": "resistência da carga (carga fictícia)",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#375",
          "cat1#242",
          "cat2#380"
        ],
        "notas": "Nunca meter valores de pico na fórmula da potência sem os converter: 30 V de pico em 50 Ω dão 9 W e não 18 W (cat1#242) — 18 W é $U_{\\mathrm{p}}^2/R$, o erro de esquecer o 2. Como o osciloscópio lê pico a pico, o atalho é $U_{\\mathrm{pp}}^2/(8R)$: 200 V pico a pico em 50 Ω → 100 W (cat2#375); 500 V pico a pico em 50 Ω → 625 W (cat2#380). Estas duas pedem a **PEP** (potência de pico envolvente); a mesma conta serve porque se trata de uma portadora não modulada, em que a PEP iguala a potência média. Com voz em SSB deixaria de ser verdade."
      },
      {
        "key": "onda-quadrada-eficaz-e-harmonicas",
        "nome": "Onda quadrada: valor eficaz e conteúdo harmónico",
        "latex": "U_{\\text{ef}} = U_{\\text{p}} \\qquad u(t) = \\frac{4U_{\\text{p}}}{\\pi}\\left(\\text{sen}\\,\\omega t + \\frac{1}{3}\\,\\text{sen}\\,3\\omega t + \\frac{1}{5}\\,\\text{sen}\\,5\\omega t + \\cdots\\right)",
        "variantes": [
          "U_{\\mathrm{ef}} = U_{\\mathrm{p}} = \\frac{U_{\\mathrm{pp}}}{2}"
        ],
        "variaveis": [
          {
            "simbolo": "U_{\\mathrm{ef}}",
            "significado": "valor eficaz verdadeiro da onda quadrada simétrica",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\mathrm{p}}",
            "significado": "amplitude (metade do valor pico a pico)",
            "unidade": "V"
          },
          {
            "simbolo": "\\omega",
            "significado": "pulsação da fundamental, $2\\pi f$",
            "unidade": "rad/s"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#343",
          "cat1#246",
          "cat2#344",
          "cat2#49",
          "cat2#342",
          "cat1#150"
        ],
        "notas": "Uma onda quadrada é uma soma de sinusoides — fundamental mais harmónicas **ímpares** de frequência mais alta, com amplitude $1/n$; dizer que «só tem a fundamental» é a opção falsa de cat2#343 e cat2#344. Um sinal periódico qualquer decompõe-se assim (cat1#150). A fundamental sozinha vale $(4/\\pi)/\\sqrt{2} \\approx 0{,}90$ do eficaz verdadeiro, logo um medidor de banda estreita erra ≈ 10 % — em cat1#246, para uma quadrada de 10 MHz escolhe-se o aparelho de 100 MHz, o único que apanha as harmónicas de 30, 50, 70 e 90 MHz. E o fator 0,707 **não** se aplica aqui: numa quadrada simétrica o eficaz iguala a amplitude."
      },
      {
        "key": "efeito-pelicular",
        "nome": "Efeito pelicular: profundidade de penetração",
        "latex": "\\delta = \\sqrt{\\frac{\\rho}{\\pi f \\mu}} \\qquad \\delta \\propto \\frac{1}{\\sqrt{f}}",
        "variantes": [
          "R_{\\mathrm{RF}} \\propto \\sqrt{f}"
        ],
        "variaveis": [
          {
            "simbolo": "\\delta",
            "significado": "profundidade de penetração (espessura útil de condução)",
            "unidade": "m"
          },
          {
            "simbolo": "\\rho",
            "significado": "resistividade do condutor",
            "unidade": "Ω·m"
          },
          {
            "simbolo": "f",
            "significado": "frequência",
            "unidade": "Hz"
          },
          {
            "simbolo": "\\mu",
            "significado": "permeabilidade magnética do material",
            "unidade": "H/m"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#279"
        ],
        "notas": "Em corrente contínua a corrente ocupa toda a secção; em RF concentra-se numa camada superficial de espessura $\\delta$, que diminui com a raiz da frequência — a secção útil encolhe e a resistência **aumenta** (cat1#279). Nada tem a ver com não linearidade dos condutores nem com o isolamento passar a conduzir, que são os distratores. É a razão prática do condutor tubular, prateado ou do fio de Litz."
      }
    ],
    "tabelas": [
      {
        "key": "leitura-figura-sinusoide",
        "nome": "A figura da sinusoide da ANACOM: o que é cada seta",
        "colunas": [
          "Seta",
          "O que representa",
          "Valor se $+U_m = 1$ V"
        ],
        "linhas": [
          [
            "1",
            "valor de pico (zero → máximo)",
            "1 V"
          ],
          [
            "2",
            "valor pico a pico (mínimo → máximo)",
            "2 V"
          ],
          [
            "3",
            "valor eficaz",
            "0,707 V"
          ],
          [
            "4",
            "período (única seta horizontal, no eixo do tempo)",
            "—"
          ]
        ],
        "notas": [
          "Nas provas de categoria 3 a mesma figura repete-se com a numeração sempre igual:",
          "Há duas famílias de perguntas sobre esta figura: as que apontam uma seta e perguntam o que ela representa (cat3#198 a cat3#201 e cat3#205) e as que dão $+U_m = 1$ V e pedem o valor (cat3#202 a cat3#204 e cat3#206). A coluna da direita resolve as segundas.",
          "Regra de eliminação: se a seta está deitada sobre o eixo do tempo, a resposta é o período; se está de pé mas não chega ao máximo, é o valor eficaz.",
          "Aviso: em cat3#204 a figura é uma variante em que a amplitude está marcada A e não $+U_m$ — é a mesma grandeza, o valor de pico."
        ],
        "categorias": [
          "3"
        ],
        "refs": [
          "cat3#198",
          "cat3#199",
          "cat3#200",
          "cat3#201",
          "cat3#205",
          "cat3#203"
        ]
      },
      {
        "key": "fatores-da-sinusoide",
        "nome": "Fatores de conversão de uma sinusoide",
        "colunas": [
          "Conversão",
          "Fator"
        ],
        "linhas": [
          [
            "pico → eficaz",
            "× 0,707 ($1/\\sqrt{2}$)"
          ],
          [
            "eficaz → pico",
            "× 1,414 ($\\sqrt{2}$)"
          ],
          [
            "pico → pico a pico",
            "× 2"
          ],
          [
            "pico a pico → pico",
            "÷ 2"
          ],
          [
            "eficaz → pico a pico",
            "× 2,828"
          ],
          [
            "pico a pico → eficaz",
            "÷ 2,828 (× 0,354)"
          ],
          [
            "média num ciclo completo",
            "0"
          ]
        ],
        "notas": [
          "O voltímetro CA indica sempre o valor eficaz; o osciloscópio lê-se em pico a pico. Os números 0,707 / 0 / 1 / 2 aparecem como opções em quase todas estas perguntas, precisamente para apanhar quem escolhe o fator errado ou pára a meio do cálculo.",
          "Todos estes fatores valem só para a sinusoide. Numa onda quadrada simétrica o eficaz é igual ao pico."
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#204",
          "cat2#45",
          "cat1#242",
          "cat3#202",
          "cat2#47",
          "cat2#335"
        ]
      },
      {
        "key": "gamas-do-espectro",
        "nome": "Gamas do espectro e designação por comprimento de onda",
        "colunas": [
          "Sigla",
          "Frequências",
          "$\\lambda$",
          "Designação"
        ],
        "linhas": [
          [
            "LF",
            "30 – 300 kHz",
            "10 – 1 km",
            "quilométricas"
          ],
          [
            "MF",
            "300 kHz – 3 MHz",
            "1 km – 100 m",
            "hectométricas / onda média"
          ],
          [
            "HF",
            "3 – 30 MHz",
            "100 – 10 m",
            "decamétricas / onda curta"
          ],
          [
            "VHF",
            "30 – 300 MHz",
            "10 – 1 m",
            "métricas"
          ],
          [
            "UHF",
            "300 MHz – 3 GHz",
            "1 m – 10 cm",
            "decimétricas"
          ],
          [
            "SHF",
            "3 – 30 GHz",
            "10 – 1 cm",
            "centimétricas"
          ]
        ],
        "notas": [
          "Métricas = VHF (cat3#114), decimétricas = UHF (cat3#115), centimétricas = SHF (cat3#116). Cada gama vai de $\\lambda$ a $\\lambda/10$, e o nome diz a unidade em que se mede o comprimento de onda.",
          "HF é refletida pela ionosfera → longa distância, DX (cat3#112); VHF/UHF/SHF atravessam-na → linha de vista e satélites (cat2#407); as parabólicas só são práticas em SHF (cat1#183). Truque de eliminação: qualquer frequência abaixo de 30 MHz (28,0–29,7 MHz, por exemplo) é HF e nunca pode figurar numa lista de sub-faixas de VHF."
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#114",
          "cat2#407",
          "cat1#183",
          "cat3#115",
          "cat3#116",
          "cat3#112"
        ]
      },
      {
        "key": "bandas-de-amador-vs-lambda",
        "nome": "Bandas de amador ↔ comprimento de onda ↔ dipolo",
        "colunas": [
          "Banda",
          "Frequência",
          "$\\lambda \\approx 300/f$",
          "Dipolo $\\lambda/2$"
        ],
        "linhas": [
          [
            "160 m",
            "1,8 MHz",
            "≈ 167 m",
            "≈ 83 m"
          ],
          [
            "80 m",
            "3,5 – 3,8 MHz",
            "≈ 80 m",
            "≈ 40 m"
          ],
          [
            "40 m",
            "7,0 – 7,2 MHz",
            "≈ 42 m",
            "≈ 21 m"
          ],
          [
            "20 m",
            "14,0 – 14,35 MHz",
            "≈ 21 m",
            "≈ 10,5 m"
          ],
          [
            "15 m",
            "21,0 – 21,45 MHz",
            "≈ 14 m",
            "≈ 7 m"
          ],
          [
            "10 m",
            "28 – 29,7 MHz",
            "≈ 10 m",
            "≈ 5 m"
          ],
          [
            "6 m",
            "50 MHz",
            "≈ 6 m",
            "≈ 3 m"
          ],
          [
            "2 m",
            "144 – 146 MHz",
            "≈ 2 m",
            "≈ 1 m"
          ]
        ],
        "notas": [
          "O nome da banda é o comprimento de onda, logo o dipolo de meia onda mede metade desse número: reconhecer que 3,55 MHz é a banda dos 80 m responde de imediato «40 m» (cat1#185); 14,2 MHz → 300/14,2 ≈ 21 m → 10,5 m (cat1#186).",
          "O comprimento físico real é ≈ 0,95 do valor teórico (efeito das extremidades e espessura do condutor), o que dá a forma prática $\\ell \\approx 143/f\\ [\\mathrm{MHz}]$ em vez de $150/f$. Nestas duas perguntas a diferença não chega para trocar a opção certa (143/14,2 ≈ 10,1 m continua a apontar para os 10,5 m), mas é a fórmula a usar quando se corta arame a sério."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#32",
          "cat1#185",
          "cat1#186",
          "cat2#33"
        ]
      },
      {
        "key": "espectro-audio-e-voz",
        "nome": "Sinais de áudio e voz humana",
        "colunas": [],
        "linhas": [],
        "notas": [
          "A voz humana é um conjunto de ondas acústicas — nunca eletromagnéticas: é essa a afirmação incorreta de cat2#302 e cat2#341.",
          "A sua forma de onda é irregular, não sinusoidal, logarítmica nem trapezoidal (cat2#345).",
          "As frequências da voz raramente ultrapassam os 15 kHz (é uma das opções verdadeiras de cat2#302).",
          "Nas radiocomunicações limita-se o áudio a ≈ 300 – 3000 Hz, pelo que se usa $f_m = 3$ kHz nos cálculos de largura de faixa.",
          "O microfone converte som em sinal elétrico (cat2#53); o auscultador faz o inverso."
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#302",
          "cat2#341",
          "cat2#345",
          "cat2#53"
        ]
      }
    ]
  },
  {
    "id": "transformadores-magnetismo",
    "titulo": "Magnetismo e transformadores",
    "intro": "Campos elétrico e magnético, indutância de bobinas e núcleos, indução mútua e as relações do transformador (tensões, correntes, potência e impedâncias). Notação uniforme: $U$ para tensão, $I$ para corrente, $N$ para espiras, $\\ell$ para comprimento, índices $p$ (primário) e $s$ (secundário). Atenção: $E$ está reservado para a intensidade do campo elétrico e $e$ para a força eletromotriz induzida — nenhum dos dois designa aqui uma tensão contínua $U$.",
    "formulas": [
      {
        "key": "campo-eletrico",
        "nome": "Intensidade do campo elétrico",
        "latex": "E = \\frac{U}{d}",
        "variantes": [
          "U = E\\,d",
          "d = \\frac{U}{E}"
        ],
        "variaveis": [
          {
            "simbolo": "E",
            "significado": "intensidade do campo elétrico",
            "unidade": "V/m"
          },
          {
            "simbolo": "U",
            "significado": "diferença de potencial",
            "unidade": "V"
          },
          {
            "simbolo": "d",
            "significado": "distância entre os pontos",
            "unidade": "m"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#20"
        ],
        "notas": "A unidade sai da própria fórmula: volt por metro (no SI vale o equivalente newton por coulomb). O campo elétrico é criado por cargas elétricas, mesmo paradas; o campo magnético exige cargas em movimento."
      },
      {
        "key": "lei-do-inverso-do-quadrado",
        "nome": "Lei do inverso do quadrado",
        "latex": "E \\propto \\frac{1}{d^{2}} \\quad \\text{(carga pontual)} \\qquad S \\propto \\frac{1}{d^{2}} \\;,\\quad E \\propto \\frac{1}{d} \\quad \\text{(onda radiada)}",
        "variantes": [
          "E_{2} = E_{1}\\left(\\frac{d_{1}}{d_{2}}\\right)^{2} \\quad \\text{(carga pontual)}",
          "S = \\frac{P}{4\\pi d^{2}} \\quad \\text{(fonte isotrópica)}"
        ],
        "variaveis": [
          {
            "simbolo": "E",
            "significado": "intensidade do campo elétrico",
            "unidade": "V/m"
          },
          {
            "simbolo": "S",
            "significado": "densidade de potência (potência por unidade de área)",
            "unidade": "W/m²"
          },
          {
            "simbolo": "P",
            "significado": "potência radiada pela fonte",
            "unidade": "W"
          },
          {
            "simbolo": "d",
            "significado": "distância à fonte",
            "unidade": "m"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#22",
          "cat2#330"
        ],
        "notas": "No exame a resposta é sempre «decresce com o QUADRADO da distância»: ao duplicar a distância, o valor cai para 1/4. Os distratores «cresce/decresce com a raiz quadrada» existem só para testar se se lê a palavra certa. Rigor a reter para não confundir grandezas: é exatamente $1/d^{2}$ para o campo de uma carga pontual (lei de Coulomb) e para a densidade de potência de uma onda radiada; a intensidade do campo elétrico de uma onda radiada, essa, decresce com $1/d$ — mas é a densidade de potência que o «quadrado» descreve."
      },
      {
        "key": "campo-magnetico",
        "nome": "Intensidade do campo magnético",
        "latex": "H = \\frac{N\\,I}{\\ell}",
        "variantes": [
          "H \\propto I",
          "N\\,I = H\\,\\ell",
          "H = \\frac{I}{2\\pi r} \\quad \\text{(condutor retilíneo)}"
        ],
        "variaveis": [
          {
            "simbolo": "H",
            "significado": "intensidade do campo magnético",
            "unidade": "A/m"
          },
          {
            "simbolo": "N",
            "significado": "número de espiras (num condutor retilíneo, $N = 1$)",
            "unidade": "espiras"
          },
          {
            "simbolo": "I",
            "significado": "corrente no condutor",
            "unidade": "A"
          },
          {
            "simbolo": "\\ell",
            "significado": "comprimento do percurso magnético fechado (numa bobina, o comprimento do enrolamento; à volta de um fio, a circunferência $2\\pi r$)",
            "unidade": "m"
          },
          {
            "simbolo": "r",
            "significado": "distância ao eixo do condutor",
            "unidade": "m"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#23",
          "cat2#25",
          "cat2#28"
        ],
        "notas": "A unidade — ampere por metro — já diz o essencial: o que determina a força do campo é a INTENSIDADE DA CORRENTE, não o diâmetro do condutor nem a sua resistência (distratores fixos: «resistência a dividir pela corrente», «razão entre corrente e resistência»). O produto $N\\,I$ é a força magnetomotriz. As duas formas são a mesma lei de Ampère: com $N = 1$ e $\\ell = 2\\pi r$, $H = N I/\\ell$ dá exatamente $I/(2\\pi r)$."
      },
      {
        "key": "indutancia-de-um-solenoide",
        "nome": "Indutância de uma bobina cilíndrica (solenoide)",
        "latex": "L = \\frac{\\mu\\,N^{2}\\,A}{\\ell} = \\frac{\\mu_{0}\\,\\mu_{r}\\,N^{2}\\,A}{\\ell}",
        "variantes": [
          "N = \\sqrt{\\frac{L\\,\\ell}{\\mu\\,A}}",
          "\\mu_{r} = \\frac{L\\,\\ell}{\\mu_{0}\\,N^{2}\\,A}"
        ],
        "variaveis": [
          {
            "simbolo": "L",
            "significado": "coeficiente de auto-indução",
            "unidade": "H"
          },
          {
            "simbolo": "\\mu",
            "significado": "permeabilidade magnética do núcleo, $\\mu_{0}\\mu_{r}$",
            "unidade": "H/m"
          },
          {
            "simbolo": "\\mu_{r}",
            "significado": "permeabilidade relativa do material do núcleo",
            "unidade": "adimensional"
          },
          {
            "simbolo": "N",
            "significado": "número de espiras",
            "unidade": "espiras"
          },
          {
            "simbolo": "A",
            "significado": "área da secção da bobina",
            "unidade": "m²"
          },
          {
            "simbolo": "\\ell",
            "significado": "comprimento do enrolamento",
            "unidade": "m"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#40",
          "cat1#41",
          "cat1#398"
        ],
        "notas": "Dependência QUADRÁTICA em $N$: duplicar as espiras quadruplica $L$. O que o núcleo aporta é a PERMEABILIDADE MAGNÉTICA — não a «permeabilidade elétrica», não a constante dielétrica, não a resistência nem a capacidade (são todos distratores). A resistência do fio e a capacidade entre espiras são parasitas: afetam o Q e a auto-ressonância, não o valor de $L$. As unidades fecham: $\\mathrm{(H/m)} \\times \\mathrm{m^{2}} / \\mathrm{m} = \\mathrm{H}$."
      },
      {
        "key": "indutancia-toroide-fator-al",
        "nome": "Indutância de um toróide pelo fator $A_L$",
        "latex": "L = A_{L}\\,N^{2}",
        "variantes": [
          "N = \\sqrt{\\frac{L}{A_{L}}}",
          "A_{L} = \\frac{L}{N^{2}}"
        ],
        "variaveis": [
          {
            "simbolo": "L",
            "significado": "indutância obtida",
            "unidade": "nH (com $A_L$ em nH/espira²)"
          },
          {
            "simbolo": "A_{L}",
            "significado": "fator de indutância do núcleo, publicado pelo fabricante (resume permeabilidade e geometria)",
            "unidade": "nH/espira²"
          },
          {
            "simbolo": "N",
            "significado": "número de espiras",
            "unidade": "espiras"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#342",
          "cat1#345",
          "cat1#36"
        ],
        "notas": "É a forma prática da fórmula do solenoide para toróides: $A_L$ absorve $\\mu$, a área da secção e o comprimento médio do percurso magnético, restando a dependência em $N^{2}$. Como $N$ varia com a RAIZ de $L$, um $A_L$ cem vezes maior (ferrite) pede dez vezes menos espiras para a mesma indutância. E se $\\mu$ — logo $A_L$ — for estável com a temperatura, $L$ é estável: é a razão para usar ferro pulverizado em circuitos sintonizados. Confirmar sempre a unidade do catálogo: alguns fabricantes publicam $A_L$ em mH por 1000 espiras."
      },
      {
        "key": "indutancia-mutua",
        "nome": "Indutância mútua e coeficiente de acoplamento",
        "latex": "M = k\\,\\sqrt{L_{1}\\,L_{2}}\\,,\\qquad 0 \\le k \\le 1",
        "variantes": [
          "k = \\frac{M}{\\sqrt{L_{1}\\,L_{2}}}"
        ],
        "variaveis": [
          {
            "simbolo": "M",
            "significado": "indutância mútua entre as duas bobinas",
            "unidade": "H"
          },
          {
            "simbolo": "k",
            "significado": "coeficiente de acoplamento (0 = sem acoplamento, 1 = acoplamento total)",
            "unidade": "adimensional"
          },
          {
            "simbolo": "L_{1},\\ L_{2}",
            "significado": "indutâncias próprias de cada bobina",
            "unidade": "H"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#39",
          "cat1#339",
          "cat1#340"
        ],
        "notas": "O fluxo captado varia com o cosseno do ângulo entre os eixos: eixos PERPENDICULARES entre si dão $k \\approx 0$, ou seja indutância mútua MÍNIMA; eixos alinhados dão acoplamento máximo (é a geometria do transformador). Cuidado com o distrator «eixos em paralelo entre si» — dois eixos paralelos continuam alinhados na mesma direção, logo acoplam. Fechar as duas bobinas na MESMA blindagem também não separa nada, seja qual for a orientação. Minimiza-se $M$ para reduzir ou eliminar o acoplamento indesejado."
      },
      {
        "key": "lei-de-faraday",
        "nome": "Lei da indução de Faraday-Lenz",
        "latex": "e = -N\\,\\frac{d\\Phi}{dt}",
        "variantes": [
          "e_{2} = -M\\,\\frac{di_{1}}{dt}",
          "e = -L\\,\\frac{di}{dt}"
        ],
        "variaveis": [
          {
            "simbolo": "e",
            "significado": "força eletromotriz induzida",
            "unidade": "V"
          },
          {
            "simbolo": "N",
            "significado": "número de espiras",
            "unidade": "espiras"
          },
          {
            "simbolo": "d\\Phi/dt",
            "significado": "taxa de variação do fluxo magnético",
            "unidade": "Wb/s (= V)"
          },
          {
            "simbolo": "M",
            "significado": "indutância mútua entre os enrolamentos",
            "unidade": "H"
          },
          {
            "simbolo": "di_{1}/dt",
            "significado": "taxa de variação da corrente no primário",
            "unidade": "A/s"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#117",
          "cat1#44",
          "cat1#348",
          "cat1#378"
        ],
        "notas": "O mecanismo que gera tensão no secundário chama-se INDUTÂNCIA MÚTUA — nunca «acoplamento capacitivo», «corrente dielétrica» ou «capacidade mútua». Consequência prática: com corrente contínua constante $d\\Phi/dt = 0$ e não há tensão no secundário; o transformador exige tensão alternada. O sinal negativo é a lei de Lenz. As unidades fecham: 1 Wb/s = 1 V e 1 H·A/s = 1 V."
      },
      {
        "key": "transformador-tensoes",
        "nome": "Transformador: relação de tensões",
        "latex": "\\frac{U_{s}}{U_{p}} = \\frac{N_{s}}{N_{p}}",
        "variantes": [
          "U_{s} = U_{p}\\,\\frac{N_{s}}{N_{p}}",
          "N_{s} = N_{p}\\,\\frac{U_{s}}{U_{p}}"
        ],
        "variaveis": [
          {
            "simbolo": "U_{p},\\ U_{s}",
            "significado": "tensões no primário e no secundário",
            "unidade": "V"
          },
          {
            "simbolo": "N_{p},\\ N_{s}",
            "significado": "número de espiras do primário e do secundário",
            "unidade": "espiras"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#47",
          "cat1#351",
          "cat1#48"
        ],
        "notas": "As tensões são DIRETAMENTE proporcionais às espiras: $120 \\times 500/2250 \\approx 26{,}7$ V; $200 \\times 100/1000 = 20$ V. Teste de coerência que elimina metade das opções: menos espiras no secundário obriga a tensão inferior à de entrada. Distratores clássicos: inverter a razão ($120 \\times 2250/500 = 540$ V) e aplicar o QUADRADO da razão (5,9 V — o quadrado é só para impedâncias)."
      },
      {
        "key": "transformador-correntes",
        "nome": "Transformador: relação de correntes",
        "latex": "\\frac{I_{p}}{I_{s}} = \\frac{N_{s}}{N_{p}}",
        "variantes": [
          "N_{p}\\,I_{p} = N_{s}\\,I_{s}",
          "I_{s} = I_{p}\\,\\frac{N_{p}}{N_{s}}"
        ],
        "variaveis": [
          {
            "simbolo": "I_{p},\\ I_{s}",
            "significado": "correntes no primário e no secundário",
            "unidade": "A"
          },
          {
            "simbolo": "N_{p},\\ N_{s}",
            "significado": "número de espiras do primário e do secundário",
            "unidade": "espiras"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#46"
        ],
        "notas": "Aqui está a armadilha: as correntes são INVERSAMENTE proporcionais às espiras, ao contrário das tensões. Com 100 espiras a 10 A no primário e 1000 no secundário, $I_{s} = 10 \\times 100/1000 = 1$ A — aplicar a proporção direta daria 100 A, o distrator mais tentador. Regra a fixar: mais espiras significa mais tensão e MENOS corrente, nunca as duas a subir."
      },
      {
        "key": "transformador-potencia",
        "nome": "Transformador ideal: conservação da potência",
        "latex": "P_{p} = P_{s} \\quad \\Rightarrow \\quad U_{p}\\,I_{p} = U_{s}\\,I_{s}",
        "variantes": [
          "I_{s} = \\frac{U_{p}\\,I_{p}}{U_{s}}"
        ],
        "variaveis": [
          {
            "simbolo": "P_{p},\\ P_{s}",
            "significado": "potência no primário e no secundário",
            "unidade": "W"
          },
          {
            "simbolo": "U_{p},\\ U_{s}",
            "significado": "tensões no primário e no secundário",
            "unidade": "V"
          },
          {
            "simbolo": "I_{p},\\ I_{s}",
            "significado": "correntes no primário e no secundário",
            "unidade": "A"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#42",
          "cat1#46"
        ],
        "notas": "É a raiz das duas relações anteriores: o transformador transforma tensões e correntes, nunca cria potência. Num transformador REAL há perdas no cobre (efeito de Joule) e no núcleo (histerese e correntes de Foucault), logo $P_{s} < P_{p}$ — mas a pergunta refere o caso IDEAL, e $P_{s} > P_{p}$ violaria sempre a conservação de energia."
      },
      {
        "key": "transformador-impedancias",
        "nome": "Transformador: relação de impedâncias",
        "latex": "\\frac{Z_{p}}{Z_{s}} = \\left(\\frac{N_{p}}{N_{s}}\\right)^{2}",
        "variantes": [
          "\\frac{N_{p}}{N_{s}} = \\sqrt{\\frac{Z_{p}}{Z_{s}}}",
          "Z_{p} = Z_{s}\\left(\\frac{N_{p}}{N_{s}}\\right)^{2}"
        ],
        "variaveis": [
          {
            "simbolo": "Z_{p},\\ Z_{s}",
            "significado": "impedâncias vistas do primário e do secundário",
            "unidade": "Ω"
          },
          {
            "simbolo": "N_{p},\\ N_{s}",
            "significado": "número de espiras do primário e do secundário",
            "unidade": "espiras"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#49"
        ],
        "notas": "A impedância transforma-se com o QUADRADO da relação de espiras — daí a raiz quadrada ao resolver em ordem às espiras. Um balun 4:1 em impedância é 2:1 em espiras (200 Ω → 50 Ω). Para adaptar 15 Ω a 50 Ω, $N_{p}/N_{s} = \\sqrt{15/50} \\approx 0{,}55$: o SECUNDÁRIO leva mais espiras. Regra geral: o lado de impedância mais alta é sempre o de mais espiras."
      }
    ],
    "tabelas": [
      {
        "key": "grandezas-e-unidades-do-magnetismo",
        "nome": "Grandezas, unidades e permeabilidades",
        "colunas": [
          "Grandeza",
          "Símbolo",
          "Unidade"
        ],
        "linhas": [
          [
            "Coeficiente de auto-indução",
            "$L$",
            "henry (H)"
          ],
          [
            "Indutância mútua",
            "$M$",
            "henry (H)"
          ],
          [
            "Fluxo magnético",
            "$\\Phi$",
            "weber (Wb)"
          ],
          [
            "Densidade de fluxo (indução)",
            "$B$",
            "tesla (T)"
          ],
          [
            "Intensidade do campo magnético",
            "$H$",
            "ampere por metro (A/m)"
          ],
          [
            "Intensidade do campo elétrico",
            "$E$",
            "volt por metro (V/m)"
          ],
          [
            "Permeabilidade",
            "$\\mu$",
            "henry por metro (H/m)"
          ],
          [
            "Fator de indutância do núcleo",
            "$A_L$",
            "nH/espira²"
          ]
        ],
        "notas": [
          "A unidade do coeficiente de auto-indução é o henry — não o farad (capacidade), não o hertz (frequência), não o volt.",
          "A unidade da intensidade do campo elétrico é o volt por metro e a do campo magnético o ampere por metro — trocá-las é o distrator mais frequente destas perguntas. O watt e o volt sozinhos nunca são resposta.",
          "$B = \\mu H$, com $\\mu = \\mu_{0}\\,\\mu_{r}$, $\\mu_{0} = 4\\pi \\times 10^{-7}$ H/m $\\approx 1{,}257 \\times 10^{-6}$ H/m e $\\mu_{r}$ adimensional.",
          "Valores típicos de $\\mu_{r}$: ar $\\approx 1$; ferro pulverizado $\\approx$ 2 a 90; ferrite de algumas dezenas a vários milhares."
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#38",
          "cat2#20",
          "cat2#23"
        ]
      },
      {
        "key": "linhas-de-campo",
        "nome": "Geometria e sentido das linhas de campo",
        "colunas": [],
        "linhas": [],
        "notas": [
          "Campo magnético",
          "As linhas de campo de um condutor percorrido por corrente formam círculos concêntricos em redor do condutor — não são perpendiculares a ele, nem omnidirecionais.",
          "Uma corrente num condutor cria sempre um campo magnético à sua volta, sem precisar de mais nada.",
          "O sentido dá-se pela regra da mão: mão esquerda quando se raciocina com o fluxo de eletrões, mão direita com o sentido convencional da corrente. Em qualquer das duas o polegar aponta o sentido do movimento das cargas considerado e os dedos fecham no sentido do campo.",
          "Uma bússola reage apenas a campos magnéticos (não a campos elétricos nem a tensões aplicadas).",
          "Campo elétrico",
          "Uma carga elétrica parada cria à sua volta um campo elétrico (não magnético, não uma corrente).",
          "As linhas de força nunca se intersectam, por cada ponto passa só uma linha, e o potencial decresce ao longo e no sentido das linhas — nestas perguntas as três afirmações são verdadeiras em simultâneo, logo a resposta é «todas as anteriores»."
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#31",
          "cat2#285",
          "cat2#27",
          "cat2#315",
          "cat2#331",
          "cat2#329"
        ]
      },
      {
        "key": "transformador-o-que-muda",
        "nome": "Transformador: o que muda e o que não muda",
        "colunas": [
          "Transforma-se",
          "Mantém-se"
        ],
        "linhas": [
          [
            "tensão ($\\propto N$)",
            "frequência — a do secundário é igual à do primário"
          ],
          [
            "corrente ($\\propto 1/N$)",
            "potência (no caso ideal)"
          ],
          [
            "impedância ($\\propto N^{2}$)",
            "forma de onda"
          ]
        ],
        "notas": [
          "Só funciona em corrente alternada. Em contínua o enrolamento é apenas um fio: comporta-se como curto-circuito ou resistência, e não há tensão no secundário. Daí que a afirmação verdadeira seja sempre a que fala em transformar tensões e correntes alternadas; a variante com «contínuas» é falsa.",
          "Além de tensões e correntes, o transformador serve também para transformação de impedâncias.",
          "A fonte de energia liga-se ao primário; a carga ao secundário. Em vazio, o secundário apresenta tensão alternada (nunca contínua nem retificada).",
          "Um transformador não faz conversão de frequência. Para passar de 2610 kHz a 145 kHz é preciso um misturador com um oscilador de 2465 kHz, nunca uma relação de espiras.",
          "Os dois enrolamentos estão separados galvanicamente, acoplados só pelo fluxo magnético.",
          "Em vazio circula no primário uma pequena corrente de magnetização, que cria o fluxo no núcleo.",
          "Em carga, num transformador real, a tensão do secundário baixa ligeiramente e há aquecimento — quando o enunciado junta estas afirmações, a resposta costuma ser «todas estão corretas».",
          "A saturação do núcleo num transformador de adaptação de impedâncias produz harmónicos e distorção."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#112",
          "cat1#350",
          "cat2#116",
          "cat2#411",
          "cat2#115",
          "cat2#59"
        ]
      },
      {
        "key": "nucleos-magneticos",
        "nome": "Núcleos: toróide, ferrite e ferro pulverizado",
        "colunas": [
          "Material",
          "$\\mu_r$",
          "Estabilidade com a temperatura",
          "Consequência prática"
        ],
        "linhas": [
          [
            "Ferro pulverizado",
            "baixa (≈ 2 a 90)",
            "alta",
            "$L$ previsível — circuitos sintonizados"
          ],
          [
            "Ferrite",
            "alta (dezenas a milhares)",
            "menor",
            "menos espiras para a mesma $L$ — bobinas de choque, baluns, grandes indutâncias"
          ]
        ],
        "notas": [
          "Porque se usa o toróide — o circuito magnético é fechado, sem extremidades nem entreferro, pelo que quase todo o fluxo circula dentro do núcleo. Daí decorrem, em simultâneo (é por isso que «todas as opções são válidas» costuma ser a resposta):",
          "contém a maior parte do campo no material do núcleo: quase não radia para os componentes vizinhos nem capta campos externos, dispensando muitas vezes blindagem;",
          "dá mais indutância por espira do que um núcleo solenoidal (barra reta), cujo circuito magnético se fecha pelo ar;",
          "a mistura («mix») pode ser escolhida para otimizar permeabilidade e perdas numa gama de frequências específica;",
          "tende a apresentar Q elevado. A histerese depende do MATERIAL, não da forma do núcleo — «maior histerese» e «menor Q» são distratores."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#338",
          "cat1#344",
          "cat1#345",
          "cat1#36",
          "cat1#342"
        ]
      },
      {
        "key": "polarizacao-onda-eletromagnetica",
        "nome": "Polarização de uma onda eletromagnética",
        "colunas": [
          "Campo magnético",
          "Campo elétrico",
          "Polarização"
        ],
        "linhas": [
          [
            "paralelo à superfície da Terra (horizontal)",
            "vertical",
            "vertical"
          ],
          [
            "perpendicular à superfície da Terra (vertical)",
            "horizontal",
            "horizontal"
          ]
        ],
        "notas": [
          "Numa onda plana o campo elétrico, o campo magnético e a direção de propagação são mutuamente perpendiculares, e a polarização é definida pela direção do campo ELÉTRICO — nunca pelo magnético.",
          "Armadilha: quando o enunciado dá o campo magnético, a resposta é a orientação oposta à que ele indica. As opções «circular» e «elíptica» resultam da composição de duas componentes desfasadas e não são resposta neste tipo de pergunta."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#204",
          "cat1#385"
        ]
      }
    ]
  },
  {
    "id": "reactancia-ressonancia",
    "titulo": "Reactâncias, impedância, ressonância e filtros",
    "intro": "Como o condensador e a bobina se opõem à corrente alternada, como essa oposição se combina com a resistência para dar a impedância e o que acontece à frequência em que as duas reactâncias se anulam. Daqui saem os cálculos de ressonância e de largura de banda da categoria 1 e quase todas as respostas sobre filtros, choques de RF e condensadores de desacoplamento.",
    "formulas": [
      {
        "key": "reactancia-capacitiva",
        "nome": "Reactância capacitiva",
        "latex": "X_C = \\frac{1}{2\\pi f C} = \\frac{1}{\\omega C}",
        "variantes": [
          "C = \\frac{1}{2\\pi f X_C}",
          "f = \\frac{1}{2\\pi C X_C}"
        ],
        "variaveis": [
          {
            "simbolo": "X_C",
            "significado": "reactância capacitiva (oposição do condensador à corrente alternada)",
            "unidade": "Ω"
          },
          {
            "simbolo": "f",
            "significado": "frequência",
            "unidade": "Hz"
          },
          {
            "simbolo": "C",
            "significado": "capacidade",
            "unidade": "F"
          },
          {
            "simbolo": "\\omega",
            "significado": "frequência angular, $\\omega = 2\\pi f$",
            "unidade": "rad/s"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#107",
          "cat1#33",
          "cat1#34",
          "cat1#327",
          "cat1#333",
          "cat2#310"
        ],
        "notas": "f e C estão no denominador: mais frequência ou mais capacidade, menos reactância; em contínua (f = 0) $X_C$ é infinita e o condensador é um circuito aberto. Não depende da amplitude do sinal — é o distrator repetido em cat1#33 e cat1#327."
      },
      {
        "key": "reactancia-indutiva",
        "nome": "Reactância indutiva",
        "latex": "X_L = 2\\pi f L = \\omega L",
        "variantes": [
          "L = \\frac{X_L}{2\\pi f}",
          "f = \\frac{X_L}{2\\pi L}"
        ],
        "variaveis": [
          {
            "simbolo": "X_L",
            "significado": "reactância indutiva (oposição da bobina à corrente alternada)",
            "unidade": "Ω"
          },
          {
            "simbolo": "f",
            "significado": "frequência",
            "unidade": "Hz"
          },
          {
            "simbolo": "L",
            "significado": "indutância (coeficiente de auto-indução)",
            "unidade": "H"
          },
          {
            "simbolo": "\\omega",
            "significado": "frequência angular, $\\omega = 2\\pi f$",
            "unidade": "rad/s"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#108",
          "cat1#37",
          "cat1#35",
          "cat1#335",
          "cat1#334",
          "cat2#297"
        ],
        "notas": "f e L estão no numerador, ao contrário do condensador: $X_L$ cresce com a frequência e em contínua (f = 0) a bobina ideal é um curto-circuito, ficando só a resistência do fio. Também aqui a amplitude não entra."
      },
      {
        "key": "relacoes-tensao-corrente",
        "nome": "Relações tensão-corrente e desfasamento em R, L e C",
        "latex": "u = R\\,i \\;\\Rightarrow\\; \\varphi = 0^\\circ \\qquad u = L\\,\\frac{di}{dt} \\;\\Rightarrow\\; \\varphi = 90^\\circ\\ (u\\ \\text{adianta}) \\qquad i = C\\,\\frac{du}{dt} \\;\\Rightarrow\\; \\varphi = 90^\\circ\\ (i\\ \\text{adianta})",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "u",
            "significado": "tensão instantânea aos terminais",
            "unidade": "V"
          },
          {
            "simbolo": "i",
            "significado": "corrente instantânea",
            "unidade": "A"
          },
          {
            "simbolo": "R",
            "significado": "resistência",
            "unidade": "Ω"
          },
          {
            "simbolo": "L",
            "significado": "indutância",
            "unidade": "H"
          },
          {
            "simbolo": "C",
            "significado": "capacidade",
            "unidade": "F"
          },
          {
            "simbolo": "\\varphi",
            "significado": "desfasamento entre tensão e corrente",
            "unidade": "°"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#102",
          "cat1#15",
          "cat1#16",
          "cat1#328",
          "cat1#341",
          "cat1#304"
        ],
        "notas": "Mnemónica CIVIL: no Condensador a corrente (I) vem antes da tensão (V), na bobina (L) é a tensão que vem primeiro. A resposta é sempre 90°, nunca 270°, e um elemento passivo ideal nunca dá 180°; só o circuito puramente resistivo está em fase."
      },
      {
        "key": "impedancia-modulo",
        "nome": "Módulo da impedância e reactância total",
        "latex": "Z = \\sqrt{R^2 + X^2} \\qquad X = X_L - X_C",
        "variantes": [
          "X = 0 \\;\\Rightarrow\\; Z = R"
        ],
        "variaveis": [
          {
            "simbolo": "Z",
            "significado": "módulo da impedância",
            "unidade": "Ω"
          },
          {
            "simbolo": "R",
            "significado": "resistência (parte que dissipa energia)",
            "unidade": "Ω"
          },
          {
            "simbolo": "X",
            "significado": "reactância total (indutiva menos capacitiva)",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#91",
          "cat1#95",
          "cat1#336"
        ],
        "notas": "A impedância e a reactância medem-se ambas em ohm, tal como a resistência (o farad é capacidade, o siemens condutância, o ampere corrente) — é o que cat1#336 e cat3#186 perguntam. Somam-se os quadrados, nunca os valores directos: 30 Ω com 40 Ω dá 50 Ω, não 70 Ω. Nenhuma pergunta do banco pede ainda um cálculo numérico de Z; o que sai é o caso $X = 0$, a ressonância."
      },
      {
        "key": "condicao-de-ressonancia",
        "nome": "Condição de ressonância",
        "latex": "X_L = X_C \\quad \\Rightarrow \\quad 2\\pi f_0 L = \\frac{1}{2\\pi f_0 C}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "X_L",
            "significado": "reactância indutiva",
            "unidade": "Ω"
          },
          {
            "simbolo": "X_C",
            "significado": "reactância capacitiva",
            "unidade": "Ω"
          },
          {
            "simbolo": "f_0",
            "significado": "frequência de ressonância",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#94",
          "cat1#93",
          "cat1#91",
          "cat1#95"
        ],
        "notas": "É a definição de ressonância: as reactâncias cancelam-se, o circuito fica puramente resistivo e a tensão e a corrente ficam em fase. Resolver esta igualdade em $f_0$ é o que dá a fórmula de Thomson."
      },
      {
        "key": "frequencia-de-ressonancia",
        "nome": "Frequência de ressonância (fórmula de Thomson)",
        "latex": "f_0 = \\frac{1}{2\\pi\\sqrt{L\\,C}}",
        "variantes": [
          "L = \\frac{1}{4\\pi^2 f_0^2 C}",
          "C = \\frac{1}{4\\pi^2 f_0^2 L}",
          "f_0\\,[\\text{MHz}] = \\frac{159{,}2}{\\sqrt{L\\,[\\mu\\text{H}] \\times C\\,[\\text{pF}]}}"
        ],
        "variaveis": [
          {
            "simbolo": "f_0",
            "significado": "frequência de ressonância",
            "unidade": "Hz"
          },
          {
            "simbolo": "L",
            "significado": "indutância do circuito",
            "unidade": "H"
          },
          {
            "simbolo": "C",
            "significado": "capacidade do circuito",
            "unidade": "F"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#83",
          "cat1#84",
          "cat1#85",
          "cat1#86",
          "cat1#128"
        ],
        "notas": "É a mesma fórmula em série e em paralelo, e R não entra: a resistência dada no enunciado (22 Ω, 56 Ω, 47 Ω, 33 Ω) está lá só para distrair. Esquecer o $2\\pi$ dá um valor 6,28 vezes maior, que costuma estar entre as opções (11,18 MHz em vez de 1,78 MHz na cat1#84)."
      },
      {
        "key": "impedancia-na-ressonancia",
        "nome": "Impedância na ressonância: série e paralelo",
        "latex": "\\text{série:}\\; Z_{\\min} = R_s \\qquad\\qquad \\text{paralelo:}\\; Y = \\frac{1}{R_p} \\;\\Rightarrow\\; Z_{\\max} = R_p",
        "variantes": [
          "Y = \\frac{1}{R_p} + j\\left(\\omega C - \\frac{1}{\\omega L}\\right) \\qquad Z_{\\max} \\approx \\frac{L}{r\\,C} = Q\\,X_L \\;\\; (\\text{tanque real, perdas } r \\text{ em série})"
        ],
        "variaveis": [
          {
            "simbolo": "Z",
            "significado": "impedância vista aos terminais",
            "unidade": "Ω"
          },
          {
            "simbolo": "Y",
            "significado": "admitância do circuito paralelo",
            "unidade": "S"
          },
          {
            "simbolo": "R_s",
            "significado": "resistência de perdas em SÉRIE no circuito série",
            "unidade": "Ω"
          },
          {
            "simbolo": "R_p",
            "significado": "resistência equivalente em PARALELO no circuito paralelo — não é a mesma resistência que $R_s$",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#91",
          "cat1#95",
          "cat1#93"
        ],
        "notas": "Em série a impedância é mínima e igual a $R_s$ (corrente máxima); em paralelo somam-se as admitâncias, pelo que é máxima e igual a $R_p$. Em ambos a fase é 0° — a diferença está em ser mínimo ou máximo. Cuidado: $R_s$ e $R_p$ NÃO são a mesma resistência. Num tanque real, feito de uma bobina com perdas $r$ em série, a impedância na ressonância é $L/(rC) = Q\\,X_L$, muito maior do que $r$ — usar aí a resistência da bobina dá um valor completamente errado."
      },
      {
        "key": "fator-q-de-uma-bobina",
        "nome": "Fator de qualidade de uma bobina",
        "latex": "Q = \\frac{X_L}{R} = \\frac{2\\pi f L}{R}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "Q",
            "significado": "fator de qualidade",
            "unidade": "adimensional"
          },
          {
            "simbolo": "X_L",
            "significado": "reactância indutiva",
            "unidade": "Ω"
          },
          {
            "simbolo": "R",
            "significado": "resistência de perdas em série",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#38"
        ],
        "notas": "R está no denominador: quanto menor a resistência parasita, maior o Q. Em RF essa resistência não é só a do fio em contínua — junta-se o efeito pelicular e as perdas no núcleo."
      },
      {
        "key": "q-e-largura-de-banda",
        "nome": "Fator de qualidade e largura de banda (seletividade)",
        "latex": "Q = \\frac{f_0}{B} \\qquad \\Rightarrow \\qquad B = \\frac{f_0}{Q}",
        "variantes": [
          "f_0 = Q\\,B"
        ],
        "variaveis": [
          {
            "simbolo": "Q",
            "significado": "fator de qualidade do circuito ressonante",
            "unidade": "adimensional"
          },
          {
            "simbolo": "f_0",
            "significado": "frequência de ressonância",
            "unidade": "Hz"
          },
          {
            "simbolo": "B",
            "significado": "largura de banda a −3 dB (pontos de meia potência)",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#81",
          "cat1#82",
          "cat1#88",
          "cat1#90",
          "cat1#174",
          "cat1#113"
        ],
        "notas": "Divide-se sempre em hertz e converte-se no fim: 7,1 MHz com Q = 150 dá 47,33 kHz (cat1#81) e 3,7 MHz com Q = 118 dá 31,36 kHz (cat1#82) — multiplicar em vez de dividir é o distrator. Q alto e banda estreita são a mesma propriedade vista dos dois lados; um cristal de quartzo tem $Q \\sim 10^4$ a $10^5$ contra $\\sim 10^2$ de um LC, por isso o filtro a cristal é muito mais seletivo."
      },
      {
        "key": "compensacao-da-reactancia",
        "nome": "Impedância complexa e cancelamento da reactância",
        "latex": "Z = R + jX \\qquad \\Rightarrow \\qquad Z' = R \\;\\; \\text{ao acrescentar} \\;\\; -jX",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "Z",
            "significado": "impedância complexa",
            "unidade": "Ω"
          },
          {
            "simbolo": "R",
            "significado": "componente resistiva",
            "unidade": "Ω"
          },
          {
            "simbolo": "X",
            "significado": "componente reactiva (positiva se indutiva, negativa se capacitiva)",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#250",
          "cat1#346",
          "cat1#92"
        ],
        "notas": "Torna-se resistiva anulando a parte reactiva: uma bobina cancela uma reactância capacitiva e um condensador cancela uma indutiva — é o que faz o condensador em série de uma adaptação em gama (cat1#92) e o acoplador de antena. A parte resistiva não muda assim; isso exige um transformador de impedâncias."
      },
      {
        "key": "auto-ressonancia-dos-componentes-reais",
        "nome": "Auto-ressonância dos componentes reais",
        "latex": "f_{\\text{auto}} = \\frac{1}{2\\pi\\sqrt{L\\,C_p}}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "f_{\\text{auto}}",
            "significado": "frequência de auto-ressonância",
            "unidade": "Hz"
          },
          {
            "simbolo": "L",
            "significado": "indutância própria do componente",
            "unidade": "H"
          },
          {
            "simbolo": "C_p",
            "significado": "capacidade parasita (entre espiras, entre terminais)",
            "unidade": "F"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#76",
          "cat1#77",
          "cat1#75",
          "cat1#337"
        ],
        "notas": "As capacidades entre espiras formam um LC paralelo não intencional: a bobina adquire ressonância própria (cat1#77) e acima dela comporta-se como condensador. Os efeitos parasitas só se notam nas frequências mais altas, e valem nos dois sentidos — o condensador real modela-se por C, L e R (cat1#75) e uma resistência bobinada a fio traz indutância que dessintoniza um circuito ressonante."
      },
      {
        "key": "ondulacao-do-filtro-capacitivo",
        "nome": "Ondulação à saída de um filtro por condensador",
        "latex": "\\Delta U \\approx \\frac{I}{f\\,C}",
        "variantes": [
          "C \\approx \\frac{I}{f\\,\\Delta U}"
        ],
        "variaveis": [
          {
            "simbolo": "\\Delta U",
            "significado": "ondulação pico-a-pico à saída do retificador",
            "unidade": "V"
          },
          {
            "simbolo": "I",
            "significado": "corrente na carga",
            "unidade": "A"
          },
          {
            "simbolo": "f",
            "significado": "frequência da ondulação",
            "unidade": "Hz"
          },
          {
            "simbolo": "C",
            "significado": "capacidade do condensador de filtragem",
            "unidade": "F"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#299",
          "cat1#105"
        ],
        "notas": "f é a frequência da ondulação, não a da rede: 50 Hz em meia onda, 100 Hz em onda completa a partir dos 50 Hz. Alisar 1 A a 100 Hz com 1 V de ondulação exige $C = 1/(100 \\times 1) = 0{,}01$ F, ou seja 10 000 µF — só o condensador eletrolítico dá tanta capacidade, os cerâmicos e de mica ficam nos pF/nF."
      }
    ],
    "tabelas": [
      {
        "key": "desfasamentos-r-l-c",
        "nome": "Desfasamento tensão-corrente nos elementos ideais",
        "colunas": [
          "Elemento ideal",
          "Relação",
          "Desfasamento $\\varphi$"
        ],
        "linhas": [
          [
            "Resistência",
            "$u = R\\,i$",
            "0° — em fase"
          ],
          [
            "Bobina",
            "$u = L\\,\\frac{di}{dt}$",
            "90° — a corrente atrasa"
          ],
          [
            "Condensador",
            "$i = C\\,\\frac{du}{dt}$",
            "90° — a corrente adianta"
          ],
          [
            "Circuito ressonante, em ressonância",
            "$X_L = X_C$",
            "0° — em fase"
          ]
        ],
        "notas": [
          "Duas mnemónicas para o mesmo: CIVIL (em C o I vem antes do V; em L o V vem antes do I) e «ELI the ICE man».",
          "Regras de exclusão que aparecem sempre nas opções: 270° nunca é resposta (o desfasamento exprime-se pelo menor ângulo, logo 90°) e 180° não ocorre em nenhum elemento passivo ideal. É deste desfasamento que resulta a potência reactiva: a bobina e o condensador devolvem a energia à fonte em vez de a dissiparem."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#102",
          "cat1#328",
          "cat1#341",
          "cat1#15",
          "cat1#93",
          "cat2#382"
        ]
      },
      {
        "key": "comportamento-em-continua-e-em-rf",
        "nome": "O que fazem C e L em contínua e em RF",
        "colunas": [
          "Componente",
          "Contínua ($f = 0$)",
          "Radiofrequência ($f$ alta)"
        ],
        "linhas": [
          [
            "Condensador",
            "$X_C \\to \\infty$ → circuito aberto, bloqueia a DC",
            "$X_C \\to 0$ → curto-circuito para a RF"
          ],
          [
            "Bobina",
            "$X_L = 0$ → curto-circuito (fica só a resistência do fio)",
            "$X_L$ grande → bloqueia a RF"
          ]
        ],
        "notas": [
          "Daí a montagem certa de cada um:",
          "Condensador em paralelo / à massa (bypass, desacoplamento): escoa a RF e não perturba a DC nem o áudio.",
          "Bobina em série (choque de RF, ferrite no cabo): trava a RF e deixa passar a DC e os 50 Hz da rede.",
          "Um condensador em série com a alimentação corta a própria DC — é por isso que essas opções estão sempre erradas (cat3#56, cat3#59)."
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#56",
          "cat2#107",
          "cat2#108",
          "cat2#297",
          "cat2#310",
          "cat3#59"
        ]
      },
      {
        "key": "filtros-lc-topologia-e-resposta",
        "nome": "Filtros LC: topologia, resposta e onde aparecem",
        "colunas": [
          "Topologia",
          "Resposta",
          "Onde aparece"
        ],
        "linhas": [
          [
            "L em série + C em paralelo (para a massa)",
            "passa-baixo",
            "célula elementar em L"
          ],
          [
            "Rede PI: C em paralelo à entrada, C em paralelo à saída e L em série entre os dois",
            "passa-baixo, e transforma impedâncias",
            "saída do amplificador de potência"
          ],
          [
            "Rede T: C em série + L em derivação (shunt)",
            "passa-alto, e transforma impedâncias",
            "redes de acoplamento"
          ],
          [
            "LC sintonizado (série ou paralelo)",
            "passa-banda",
            "amplificadores sintonizados, filtros de FI"
          ],
          [
            "LC sintonizado a rejeitar $f_0$",
            "rejeita-banda (notch)",
            "supressão de uma frequência isolada"
          ]
        ],
        "notas": [
          "Regras associadas:",
          "As harmónicas estão sempre acima da fundamental, logo o filtro anti-harmónicas é passa-baixo e vai a seguir ao andar de saída do emissor.",
          "Espúrias acima e abaixo da frequência nominal pedem passa-banda, não passa-baixo.",
          "A impedância do filtro deve ser relativamente idêntica à da linha a que se liga — nem substancialmente mais alta, nem mais baixa, nem o dobro."
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#63",
          "cat2#142",
          "cat1#89",
          "cat1#397",
          "cat2#207",
          "cat3#64"
        ]
      },
      {
        "key": "ordens-de-grandeza-das-reactancias",
        "nome": "Ordens de grandeza de $X_C$ e $X_L$",
        "colunas": [
          "",
          "1 kHz",
          "1 MHz",
          "14 MHz"
        ],
        "linhas": [
          [
            "$X_C$ de 100 nF",
            "1,6 kΩ",
            "1,6 Ω",
            "0,11 Ω"
          ],
          [
            "$X_C$ de 10 nF",
            "15,9 kΩ",
            "15,9 Ω",
            "1,1 Ω"
          ],
          [
            "$X_L$ de 1 µH",
            "6,3 mΩ",
            "6,3 Ω",
            "88 Ω"
          ],
          [
            "$X_L$ de 1 mH",
            "6,3 Ω",
            "6,3 kΩ",
            "88 kΩ"
          ]
        ],
        "notas": [
          "Valores redondos para confirmar de cabeça se uma resposta é plausível:",
          "Ler as linhas ao contrário uma da outra é o essencial: um condensador de 10 nF ligado à massa apresenta 15,9 kΩ ao áudio de 1 kHz (que passa intacto) e 1,1 Ω a 14 MHz (RF, que é escoada); uma bobina faria exactamente o oposto."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#310",
          "cat1#33",
          "cat1#34"
        ]
      },
      {
        "key": "unidades-na-formula-de-ressonancia",
        "nome": "Unidades e atalho para a frequência de ressonância",
        "colunas": [
          "Prefixo",
          "p",
          "n",
          "µ",
          "m",
          "k",
          "M"
        ],
        "linhas": [
          [
            "Fator",
            "$10^{-12}$",
            "$10^{-9}$",
            "$10^{-6}$",
            "$10^{-3}$",
            "$10^{3}$",
            "$10^{6}$"
          ]
        ],
        "notas": [
          "Na fórmula $f_0 = \\dfrac{1}{2\\pi\\sqrt{LC}}$, L vem em henry e C em farad — converter antes de calcular:",
          "Exemplos: $0{,}05\\ \\text{mH} = 50\\ \\mu\\text{H} = 5 \\times 10^{-5}\\ \\text{H}$; $40\\ \\text{pF} = 4 \\times 10^{-11}\\ \\text{F}$.",
          "Atalho de exame (evita todas as potências de dez):",
          "$f_0\\,[\\text{MHz}] = \\frac{159{,}2}{\\sqrt{L\\,[\\mu\\text{H}] \\times C\\,[\\text{pF}]}}$",
          "Com 50 µH e 40 pF: $\\sqrt{2000} = 44{,}7$ e $159{,}2 / 44{,}7 = 3{,}56$ MHz (cat1#83). Com µH e pF o resultado sai sempre em MHz, o que elimina de imediato as opções em kHz."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#83",
          "cat1#84",
          "cat1#85",
          "cat1#86"
        ]
      }
    ]
  },
  {
    "id": "semicondutores-amplificadores",
    "titulo": "Semicondutores, amplificadores e alimentação",
    "intro": "Contas e regras dos dispositivos ativos: díodos e retificação, ganho de corrente do transístor bipolar, polarização, montagens e classes de amplificação, e os amplificadores operacionais. Os cálculos numéricos concentram-se em β (cat 2) e no ganho do AMPOP (cat 1); o resto sai como reconhecimento de circuito e de figura.",
    "formulas": [
      {
        "key": "queda-direta-do-diodo",
        "nome": "Queda de tensão direta de um díodo",
        "latex": "U_F \\approx 0{,}7\\ \\text{V (Si)}, \\quad U_F \\approx 0{,}3\\ \\text{V (Ge)}, \\quad U_{\\text{total}} = n \\times U_F",
        "variantes": [
          "U_{\\text{total}} = 2 \\times U_F \\approx 1{,}4\\ \\text{V} \\quad (\\text{dois díodos de Si em série})",
          "U_{BE} \\approx 0{,}7\\ \\text{V} \\quad (\\text{a mesma junção, na base do transístor})"
        ],
        "variaveis": [
          {
            "simbolo": "U_F",
            "significado": "queda de tensão em condução direta de cada díodo",
            "unidade": "V"
          },
          {
            "simbolo": "n",
            "significado": "número de díodos em série",
            "unidade": "—"
          },
          {
            "simbolo": "U_{\\text{total}}",
            "significado": "queda total do conjunto em condução",
            "unidade": "V"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#127",
          "cat1#78"
        ],
        "notas": "Em série as tensões somam-se: dois díodos de silício dão ≈ 1,4 V, o DOBRO de cada um (cat1#78), nunca metade. Os valores fixos de 12,5 V ou 25 V das opções erradas evocam tensões de Zener, que é condução INVERSA. Si e Ge caem ambos entre 0 V e 1 V, que é a resposta pedida em cat2#127."
      },
      {
        "key": "tensao-inversa-de-pico-no-diodo",
        "nome": "Tensão inversa máxima (PIV) num díodo retificador",
        "latex": "U_{\\text{inv,máx}} \\approx U_{\\text{pico}} = \\sqrt{2} \\times U_{\\text{ef}} \\approx 1{,}414 \\times U_{\\text{ef}}",
        "variantes": [
          "U_{\\text{ef}} = U_{\\text{pico}} / \\sqrt{2} \\approx 0{,}707 \\times U_{\\text{pico}}"
        ],
        "variaveis": [
          {
            "simbolo": "U_{\\text{inv,máx}}",
            "significado": "tensão inversa de pico aplicada ao díodo bloqueado (PIV)",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\text{ef}}",
            "significado": "tensão eficaz do secundário ou da fonte AC",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\text{pico}}",
            "significado": "valor de pico da tensão alternada",
            "unidade": "V"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#124"
        ],
        "notas": "O díodo bloqueado fica sujeito ao valor de PICO, não ao eficaz: 100 V eficazes dão ≈ 141 V (cat2#124). O distrator 70 V é ter dividido por √2 em vez de multiplicar; 100 V é confundir eficaz com pico. Nota de rigor: isto vale para a ponte e para a meia onda sem filtragem — numa meia onda com condensador de filtragem o díodo chega a ver ≈ 2 × U_pico, mas o exame não pede esse caso."
      },
      {
        "key": "ganho-de-corrente-do-transistor",
        "nome": "Ganho de corrente do transístor bipolar (β)",
        "latex": "\\beta = h_{FE} = \\frac{I_C}{I_B}, \\quad \\beta_{ac} = h_{fe} = \\frac{\\Delta I_C}{\\Delta I_B}, \\quad \\alpha = \\frac{I_C}{I_E}, \\quad \\beta = \\frac{\\alpha}{1 - \\alpha}",
        "variantes": [
          "I_C = \\beta \\times I_B",
          "I_B = I_C / \\beta",
          "I_E = I_C + I_B"
        ],
        "variaveis": [
          {
            "simbolo": "\\beta",
            "significado": "ganho de corrente em emissor comum (h_FE em contínuo, h_fe em sinal; valores muito próximos)",
            "unidade": "—"
          },
          {
            "simbolo": "I_C",
            "significado": "corrente de coletor (a que circula entre coletor e emissor)",
            "unidade": "A (mA)"
          },
          {
            "simbolo": "I_B",
            "significado": "corrente de base (a que circula entre base e emissor)",
            "unidade": "A (mA ou µA)"
          },
          {
            "simbolo": "\\alpha",
            "significado": "ganho de corrente em base comum, próximo de 1",
            "unidade": "—"
          },
          {
            "simbolo": "I_E",
            "significado": "corrente de emissor",
            "unidade": "A"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#152",
          "cat1#58",
          "cat2#155",
          "cat2#156",
          "cat2#154"
        ],
        "notas": "Divisão simples, mas é obrigatório pôr as duas correntes na mesma escala: 45 mA / 1,5 mA = 30 (cat2#152); 8 mA = 8000 µA, /400 µA = 20 (cat2#155); 80 mA = 80 000 µA, /400 µA = 200 (cat2#156). No sentido inverso, 20 mA × 40 = 800 mA = 0,8 A (cat2#154) — a resposta vem em ampere e apanha quem procura «800 mA». β é ganho de CORRENTE: não confundir com a frequência em que o ganho cai para 1 (f_T) nem com a tensão de rutura da junção base-coletor, ambas distratores da cat1#58."
      },
      {
        "key": "polarizacao-fixa-por-divisor",
        "nome": "Polarização fixa da base por divisor de tensão",
        "latex": "U_B = U_{CC} \\times \\frac{R_2}{R_1 + R_2}, \\quad U_E = U_B - U_{BE}, \\quad U_{BE} \\approx 0{,}7\\ \\text{V}",
        "variantes": [
          "I_C \\approx I_E = U_E / R_E"
        ],
        "variaveis": [
          {
            "simbolo": "U_B",
            "significado": "tensão da base em relação à massa",
            "unidade": "V"
          },
          {
            "simbolo": "U_{CC}",
            "significado": "tensão de alimentação do andar",
            "unidade": "V"
          },
          {
            "simbolo": "R_1, R_2",
            "significado": "resistências do divisor (R1 da base para a alimentação, R2 da base para a massa)",
            "unidade": "Ω"
          },
          {
            "simbolo": "U_{BE}",
            "significado": "queda base-emissor em condução",
            "unidade": "V"
          },
          {
            "simbolo": "U_E",
            "significado": "tensão do emissor em relação à massa",
            "unidade": "V"
          },
          {
            "simbolo": "R_E",
            "significado": "resistência de emissor (entre o emissor e a massa)",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#114",
          "cat1#115"
        ],
        "notas": "Nas figuras, duas resistências entre a alimentação e a massa com a base ligada ao ponto médio são, na terminologia do exame, POLARIZAÇÃO FIXA — não resistências de carga, não realimentação, não filtragem (cat1#114), nem polarização própria (cat1#115). O divisor é dimensionado para que a sua corrente seja muito maior do que I_B, e é por isso que U_B fica praticamente independente do transístor."
      },
      {
        "key": "ganho-do-ampop",
        "nome": "Ganho de tensão do amplificador operacional",
        "latex": "\\text{inversor: } A_u = -\\frac{R_2}{R_1}, \\quad \\text{não inversor: } A_u = 1 + \\frac{R_2}{R_1}",
        "variantes": [
          "|A_u| = R_2/R_1 \\quad (\\text{montagem inversora})",
          "U_{\\text{saída}} = -\\frac{R_2}{R_1} \\times U_{\\text{entrada}}",
          "\\text{seguidor de tensão: } A_u = 1"
        ],
        "variaveis": [
          {
            "simbolo": "A_u",
            "significado": "ganho de tensão em malha fechada",
            "unidade": "—"
          },
          {
            "simbolo": "R_2",
            "significado": "resistência de realimentação (aparece como R_F em algumas figuras), entre a saída e a entrada inversora",
            "unidade": "Ω"
          },
          {
            "simbolo": "R_1",
            "significado": "resistência de entrada (inversor) ou entre a entrada «−» e a massa (não inversor)",
            "unidade": "Ω"
          },
          {
            "simbolo": "U_{\\text{entrada}}, U_{\\text{saída}}",
            "significado": "tensões de entrada e de saída do andar",
            "unidade": "V"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#67",
          "cat1#364",
          "cat1#365"
        ],
        "notas": "Ler a figura primeiro: sinal a entrar por R1 na entrada «−», com a «+» à massa, é INVERSOR (usa-se R2/R1); sinal a entrar pela «+» é não inversor (1 + R2/R1). Contas do exame: cat1#364, 68000/1800 ≈ 38; cat1#365, 47000/3300 ≈ 14; cat1#67, 10000/1000 = 10, logo 10 × 0,23 = 2,3 V. Os distratores são sempre os mesmos três: o dobro da razão (76, 28), a razão invertida (0,03, 0,07) e o ganho unitário. Atenção à cat1#67: o circuito é inversor mas a opção dada como certa é +2,3 V — o sinal «−» da fórmula é inversão de fase de 180°, e o exame pede o módulo. Como 1 + R2/R1 difere de R2/R1 apenas de uma unidade, nenhuma opção deste exame distingue as duas montagens pelo valor."
      },
      {
        "key": "massa-virtual-do-ampop",
        "nome": "Massa virtual e corrente de realimentação no AMPOP",
        "latex": "U_- \\approx U_+ = 0, \\quad I = \\frac{U_{\\text{entrada}}}{R_1} = -\\frac{U_{\\text{saída}}}{R_2}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "U_-, U_+",
            "significado": "potenciais das entradas inversora e não inversora",
            "unidade": "V"
          },
          {
            "simbolo": "I",
            "significado": "corrente que atravessa R1 e, integralmente, R2",
            "unidade": "A"
          },
          {
            "simbolo": "R_1, R_2",
            "significado": "resistências de entrada e de realimentação",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#69",
          "cat1#367",
          "cat1#368",
          "cat1#364"
        ],
        "notas": "É a dedução do ganho do inversor e explica os parâmetros do AMPOP: a impedância de ENTRADA é muito alta (cat1#69, cat1#367), pelo que nenhuma corrente entra pelos terminais e toda a corrente de R1 passa por R2; a impedância de SAÍDA é muito baixa (cat1#368). Não trocar as duas: as opções «100 ohm» e «1000 ohm» aparecem nas três perguntas e estão sempre erradas."
      },
      {
        "key": "produto-ganho-largura-de-banda",
        "nome": "Ganho do AMPOP em função da frequência (GBW)",
        "latex": "\\text{ideal: } A_u \\ \\text{constante}, \\quad B \\to \\infty; \\qquad \\text{real: } A_u \\times B \\approx \\text{GBW} \\ (20\\ \\text{dB/década})",
        "variantes": [
          "B \\approx \\text{GBW} / A_u"
        ],
        "variaveis": [
          {
            "simbolo": "A_u",
            "significado": "ganho de tensão em malha fechada",
            "unidade": "—"
          },
          {
            "simbolo": "B",
            "significado": "largura de banda resultante",
            "unidade": "Hz"
          },
          {
            "simbolo": "\\text{GBW}",
            "significado": "produto ganho × largura de banda do AMPOP real",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#65",
          "cat1#363",
          "cat1#131"
        ],
        "notas": "Armadilha do exame: no AMPOP IDEAL o ganho NÃO varia com a frequência (largura de banda infinita) — é essa a resposta de cat1#65 e cat1#363, e não «diminui linearmente» nem «diminui logaritmicamente». No AMPOP real o ganho em malha aberta cai a 20 dB/década a partir de alguns hertz, e é essa limitação de resposta em frequência que impede os osciladores RC ativos acima de ~1 MHz (cat1#131) — não as parasitas das resistências nem dos condensadores. Nenhuma pergunta do banco manda calcular o GBW: fica como justificação, não como conta."
      },
      {
        "key": "efeito-de-miller",
        "nome": "Efeito de Miller (capacidade grelha-placa)",
        "latex": "C_{\\text{entrada}} \\approx C_{gp} \\times (1 + |A_u|)",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "C_{\\text{entrada}}",
            "significado": "capacidade de entrada aparente vista pelo sinal",
            "unidade": "F"
          },
          {
            "simbolo": "C_{gp}",
            "significado": "capacidade entre a grelha de comando e a placa (alguns pF num tríodo)",
            "unidade": "F"
          },
          {
            "simbolo": "A_u",
            "significado": "ganho de tensão do andar",
            "unidade": "—"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#64"
        ],
        "notas": "Não é pedida nenhuma conta; serve para justificar a grelha de blindagem do tétrodo, cuja função principal é REDUZIR a capacidade grelha-placa (cat1#64), cortando o caminho de realimentação que, multiplicado pelo ganho, torna o andar instável em RF. «Melhor resposta em alta frequência» é a consequência, não a função — e é a opção errada."
      }
    ],
    "tabelas": [
      {
        "key": "diodos-quedas-zener-e-limites",
        "nome": "Díodos: quedas, Zener e limites nominais",
        "colunas": [
          "Material",
          "Queda direta $U_F$"
        ],
        "linhas": [
          [
            "Germânio (Ge)",
            "≈ 0,3 V"
          ],
          [
            "Silício (Si)",
            "≈ 0,7 V (0,6 a 0,7 V)"
          ]
        ],
        "notas": [
          "Ambos caem entre 0 V e 1 V, que é a resposta pedida em cat2#127. Em série somam-se: dois de silício ≈ 1,4 V (cat1#78).",
          "Tensão de Zener: valor de tensão inversa que provoca um aumento significativo da corrente inversa (cat2#120). Na zona de disrupção o Zener mantém a tensão constante apesar de a corrente variar (cat2#121) — daí servir de regulador. No símbolo, a barra do cátodo é dobrada nas pontas, em «Z» (cat2#125).",
          "Para bloquear a corrente, o positivo do circuito liga-se ao cátodo (cat2#301) — é polarização inversa.",
          "Limites nominais que nunca se excedem: tensão de pico inversa (PIV) e corrente direta (cat1#353 diz média*, cat1#357 diz *máxima — a mesma ideia com duas redações). Um limite para o semiciclo em que o díodo bloqueia, outro para o semiciclo em que conduz. Capacidade de junção, corrente inversa máxima e reactância capacitiva não são critérios de dimensionamento.",
          "O que impõe o limite de corrente é a dissipação na junção, $P \\approx U_F \\times I_F$ — nenhuma pergunta do banco a manda calcular."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#127",
          "cat1#78",
          "cat2#120",
          "cat2#121",
          "cat2#125",
          "cat2#301"
        ]
      },
      {
        "key": "retificacao-e-fonte-linear",
        "nome": "Retificação: número de díodos e cadeia da fonte linear",
        "colunas": [
          "Montagem",
          "Díodos",
          "Observações"
        ],
        "linhas": [
          [
            "Meia onda",
            "1",
            "um só díodo em série (cat2#146, cat2#147); má filtragem"
          ],
          [
            "Onda completa com tomada central",
            "2",
            "exige secundário com ponto médio (cat2#148)"
          ],
          [
            "Ponte retificadora",
            "4",
            "onda completa sem tomada central (cat2#149)"
          ]
        ],
        "notas": [
          "Ordem dos blocos numa fonte linear: transformador → retificação → condensador eletrolítico de filtragem → estabilizador. Uma fonte não comutada alimentada pela rede tem obrigatoriamente circuito de retificação, mas não obrigatoriamente uma ponte (cat2#283).",
          "O condensador de filtragem é eletrolítico, de elevada capacidade, e filtra o sinal que vem do retificador (cat2#299, cat1#105).",
          "A resistência de drenagem descarrega esse condensador depois de desligar — é um fator de segurança (cat2#151, cat1#104).",
          "A fonte comutada, por trabalhar a frequências elevadas, permite componentes mais pequenos (cat2#187, cat1#96); a sua principal desvantagem é gerar mais ruído eletromagnético (cat1#103)."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#147",
          "cat1#105",
          "cat2#148",
          "cat2#149",
          "cat2#146",
          "cat2#283"
        ]
      },
      {
        "key": "montagens-do-transistor",
        "nome": "As três montagens do transístor bipolar",
        "colunas": [
          "Montagem",
          "Entrada",
          "Saída",
          "Características"
        ],
        "linhas": [
          [
            "Emissor comum",
            "base-emissor",
            "coletor-emissor",
            "ganho de tensão e de corrente (maior ganho de potência); impedâncias médias; inverte a fase 180°"
          ],
          [
            "Coletor comum (seguidor de emissor)",
            "base-coletor",
            "emissor-coletor",
            "ganho de tensão ≈ 1 (o de corrente é elevado); impedância de entrada elevada; impedância de saída baixa"
          ],
          [
            "Base comum",
            "emissor-base",
            "coletor-base",
            "impedância de entrada baixa e de saída alta; bom isolamento saída-entrada; usada em altas frequências"
          ]
        ],
        "notas": [
          "O nome da montagem vem do terminal comum à entrada e à saída (em AC).",
          "Na cat1#62 a descrição certa do emissor comum é «emissor à massa (em AC), entrada entre base e emissor, saída entre coletor e emissor».",
          "Devidamente polarizado na zona ativa, o emissor comum inverte e amplifica o sinal (cat2#139); a figura da cat1#116 é um emissor comum.",
          "Na cat1#63 a resposta é «todas as anteriores», porque o seguidor de emissor reúne as três características ao mesmo tempo.",
          "Amplificadores sintonizados: carga em circuito ressonante LC, logo resposta passa-banda (cat1#117) e sinais de banda estreita (cat1#113); a largura vem de $B = f_0/Q$."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#139",
          "cat1#62",
          "cat1#63",
          "cat1#116",
          "cat1#113",
          "cat1#117"
        ]
      },
      {
        "key": "bipolar-fet-e-logica",
        "nome": "Bipolar contra FET (e CMOS contra TTL)",
        "colunas": [
          "",
          "Bipolar (BJT)",
          "FET / MOSFET"
        ],
        "linhas": [
          [
            "Terminais",
            "base, coletor, emissor",
            "porta, dreno, fonte"
          ],
          [
            "Controlado por",
            "corrente ($I_C = \\beta I_B$)",
            "tensão (porta isolada ou inversamente polarizada)"
          ],
          [
            "Impedância de entrada DC",
            "baixa (ordem dos kΩ)",
            "muito elevada (MΩ a TΩ)"
          ]
        ],
        "notas": [
          "A diferença é estrutural e não depende do valor da tensão da fonte de alimentação (opção errada da cat1#60).",
          "No MOSFET a porta está separada do canal por uma camada fina isolante de óxido (cat1#55); por isso leva díodos Zener de proteção, para o isolamento não ser perfurado por descargas estáticas ou tensões excessivas (cat1#56).",
          "CMOS = Complementary Metal-Oxide Semiconductor (cat1#59). Vantagem sobre o TTL: baixo consumo (um dos transístores do par está sempre ao corte; só gasta a comutar) — cat1#61. Atenção: é mais vulnerável a descargas estáticas, não «imune», que é o distrator."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#60",
          "cat1#55",
          "cat1#56",
          "cat1#61",
          "cat1#59"
        ]
      },
      {
        "key": "valvulas-numero-de-elementos",
        "nome": "Válvulas: número de elementos",
        "colunas": [
          "Válvula",
          "Elementos",
          "Constituição"
        ],
        "linhas": [
          [
            "Díodo",
            "2",
            "ânodo + cátodo — usada como retificador (cat2#405)"
          ],
          [
            "Tríodo",
            "3",
            "+ 1 grelha"
          ],
          [
            "Tétrodo",
            "4",
            "ânodo, cátodo e duas grelhas (cat2#140)"
          ],
          [
            "Pêntodo",
            "5",
            "ânodo, cátodo e três grelhas (cat2#318)"
          ]
        ],
        "notas": [
          "O prefixo grego dá diretamente o número (di-, tri-, tetra-, penta-). A segunda grelha do tétrodo é a grelha de blindagem, que reduz a capacidade grelha-placa (cat1#64, ver efeito de Miller). As válvulas perderam terreno para os semicondutores sobretudo pelo menor tamanho dos dispositivos de estado sólido (cat2#286) — e não por falta de linearidade em áudio nem por serem perigosas."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#140",
          "cat1#64",
          "cat2#318",
          "cat2#405",
          "cat2#286"
        ]
      }
    ]
  },
  {
    "id": "decibel",
    "titulo": "Decibel e níveis de sinal",
    "intro": "O decibel exprime **razões** entre duas grandezas numa escala logarítmica: factor 10 para potências, factor 20 para amplitudes (tensão, corrente, campo). Esta secção reúne as conversões, os níveis absolutos (dBm, dBW, unidades S) e as aplicações que o exame pede — cascatas, atenuações de linha, pontos de meia potência e efectividade de blindagem.",
    "formulas": [
      {
        "key": "db-potencia",
        "nome": "Decibel de uma razão de potências",
        "latex": "A_{\\mathrm{dB}} = 10 \\log_{10}\\left(\\frac{P_2}{P_1}\\right)",
        "variantes": [
          "\\frac{P_2}{P_1} = 10^{A_{\\mathrm{dB}}/10}",
          "P_2 = P_1 \\times 10^{A_{\\mathrm{dB}}/10}"
        ],
        "variaveis": [
          {
            "simbolo": "A_{\\mathrm{dB}}",
            "significado": "nível, ganho ou atenuação (negativo se houver perda)",
            "unidade": "dB"
          },
          {
            "simbolo": "P_1",
            "significado": "potência de referência (entrada)",
            "unidade": "W"
          },
          {
            "simbolo": "P_2",
            "significado": "potência a comparar (saída)",
            "unidade": "W"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#90",
          "cat1#157",
          "cat2#374",
          "cat2#87",
          "cat2#404"
        ],
        "notas": "Potência usa 10, nunca 20. «20 dB» não são «20 vezes»: são 100 vezes (20 vezes ficam por ≈ 13 dB) — é o distractor sistemático. Sinal negativo = atenuação."
      },
      {
        "key": "db-tensao",
        "nome": "Decibel de uma razão de tensões (ou de amplitudes)",
        "latex": "A_{\\mathrm{dB}} = 20 \\log_{10}\\left(\\frac{U_2}{U_1}\\right)",
        "variantes": [
          "\\frac{U_2}{U_1} = 10^{A_{\\mathrm{dB}}/20}",
          "A_u = \\frac{U_{2}}{U_{1}} \\quad \\text{(ganho de tensão, razão linear)}"
        ],
        "variaveis": [
          {
            "simbolo": "A_{\\mathrm{dB}}",
            "significado": "ganho ou atenuação",
            "unidade": "dB"
          },
          {
            "simbolo": "U_1",
            "significado": "tensão de entrada",
            "unidade": "V"
          },
          {
            "simbolo": "U_2",
            "significado": "tensão de saída",
            "unidade": "V"
          },
          {
            "simbolo": "A_u",
            "significado": "ganho de tensão em razão linear",
            "unidade": "—"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#88",
          "cat2#386",
          "cat2#385"
        ],
        "notas": "Factor 20 porque a potência varia com o quadrado da amplitude. Aplica-se a tensão, corrente e intensidade de campo. Dobrar a tensão são 6 dB (não 3 dB); metade da tensão são −6 dB. Só é rigorosamente equivalente aos 10 log se a impedância for a mesma à entrada e à saída."
      },
      {
        "key": "db-cascata",
        "nome": "Ganhos e atenuações em cascata",
        "latex": "G_{\\mathrm{total}} = G_1 + G_2 + \\cdots - A_1 - A_2 - \\cdots \\quad [\\mathrm{dB}]",
        "variantes": [
          "\\frac{P_{\\text{saída}}}{P_{\\text{entrada}}} = g_1 \\times g_2 \\times \\cdots \\quad \\text{(razões lineares)}"
        ],
        "variaveis": [
          {
            "simbolo": "G_{\\mathrm{total}}",
            "significado": "ganho do conjunto",
            "unidade": "dB"
          },
          {
            "simbolo": "G_i",
            "significado": "ganho de cada andar",
            "unidade": "dB"
          },
          {
            "simbolo": "A_i",
            "significado": "atenuação de cada andar (atenuador, linha, filtro)",
            "unidade": "dB"
          },
          {
            "simbolo": "g_i",
            "significado": "ganho de cada andar em razão linear",
            "unidade": "—"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#91",
          "cat2#387",
          "cat2#388",
          "cat2#389",
          "cat2#87"
        ],
        "notas": "Em dB somam-se, em razão linear multiplicam-se — a opção errada é sempre o produto. O resultado pode ser negativo: 20 dB de ganho seguidos de um atenuador de 30 dB dão −10 dB (atenuação líquida)."
      },
      {
        "key": "perda-percentual",
        "nome": "Percentagem de potência perdida a partir dos dB",
        "latex": "\\text{perda}\\,[\\%] = \\left(1 - 10^{-A_{\\mathrm{dB}}/10}\\right) \\times 100",
        "variantes": [
          "\\frac{P_{\\text{saída}}}{P_{\\text{entrada}}} = 10^{-A_{\\mathrm{dB}}/10}"
        ],
        "variaveis": [
          {
            "simbolo": "A_{\\mathrm{dB}}",
            "significado": "atenuação (valor positivo)",
            "unidade": "dB"
          },
          {
            "simbolo": "P_{\\text{saída}}/P_{\\text{entrada}}",
            "significado": "fracção de potência que sobrevive",
            "unidade": "—"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#379"
        ],
        "notas": "Vale a pena decorar: 1 dB de perda ≈ 20,6 % da potência perdida (o exame arredonda a opção para 20,5 %); 3 dB ≈ 50 %; 0,5 dB ≈ 10,9 %. As opções do exame são todas percentagens vizinhas — 10,9 % é precisamente a perda de 0,5 dB — logo não há como adivinhar."
      },
      {
        "key": "niveis-absolutos-dbm-dbw",
        "nome": "Níveis absolutos: dBW e dBm",
        "latex": "P_{\\mathrm{dBW}} = 10 \\log_{10}\\left(\\frac{P}{1\\ \\mathrm{W}}\\right) \\qquad P_{\\mathrm{dBm}} = 10 \\log_{10}\\left(\\frac{P}{1\\ \\mathrm{mW}}\\right)",
        "variantes": [
          "P_{\\mathrm{dBm}} = P_{\\mathrm{dBW}} + 30",
          "P = 10^{P_{\\mathrm{dBW}}/10}\\ \\mathrm{W}",
          "\\text{p.i.r.e.}_{\\mathrm{dBW}} = P_{\\mathrm{dBW}} - A_{\\mathrm{linha}} + G_{\\mathrm{dBi}}",
          "\\text{p.a.r.}_{\\mathrm{dBW}} = P_{\\mathrm{dBW}} - A_{\\mathrm{linha}} + G_{\\mathrm{dBd}}"
        ],
        "variaveis": [
          {
            "simbolo": "P",
            "significado": "potência absoluta",
            "unidade": "W ou mW"
          },
          {
            "simbolo": "P_{\\mathrm{dBW}}",
            "significado": "nível referido a 1 W",
            "unidade": "dBW"
          },
          {
            "simbolo": "P_{\\mathrm{dBm}}",
            "significado": "nível referido a 1 mW",
            "unidade": "dBm"
          },
          {
            "simbolo": "G_{\\mathrm{dBi}}",
            "significado": "ganho da antena face à isotrópica (entra na p.i.r.e.)",
            "unidade": "dBi"
          },
          {
            "simbolo": "G_{\\mathrm{dBd}}",
            "significado": "ganho da antena face ao dipolo de meia onda (entra na p.a.r.)",
            "unidade": "dBd"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#199",
          "cat2#201",
          "cat2#202"
        ],
        "notas": "dBW e dBm são níveis absolutos, não razões: 0 dBW = 1 W, 0 dBm = 1 mW, +30 dBm = 1 W. Num balanço só se somam dB com dB — 10 dBW numa antena de 20 dBi dão 30 dBW (e não 30 W nem 200 dBW): a resposta pedida em dBW nunca é o mesmo número em W. A p.i.r.e. usa o ganho em dBi e a p.a.r. usa o ganho em dBd; para passar de uma para a outra, $G_{\\mathrm{dBi}} = G_{\\mathrm{dBd}} + 2{,}15$."
      },
      {
        "key": "unidades-s",
        "nome": "Unidades S do medidor de sinal",
        "latex": "\\Delta A_{\\mathrm{dB}} = 6 \\times \\Delta S \\qquad \\frac{P_2}{P_1} = 4^{\\,\\Delta S}",
        "variantes": [
          "\\text{S9} + x\\ \\mathrm{dB}: \\quad \\frac{P}{P_{\\mathrm{S9}}} = 10^{x/10}"
        ],
        "variaveis": [
          {
            "simbolo": "\\Delta S",
            "significado": "variação de pontos S",
            "unidade": "unidades S"
          },
          {
            "simbolo": "\\Delta A_{\\mathrm{dB}}",
            "significado": "variação correspondente em decibel",
            "unidade": "dB"
          },
          {
            "simbolo": "P_2/P_1",
            "significado": "variação correspondente de potência",
            "unidade": "—"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#169",
          "cat1#157",
          "cat2#170",
          "cat2#173",
          "cat1#156"
        ],
        "notas": "1 unidade S = 6 dB = 4 vezes em potência (não 2 nem 6 vezes) = 2 vezes em tensão. Acima de S9 a escala deixa de ter unidades S e está graduada em dB: S9+20 dB é 100 vezes mais forte que S9. O medidor S está no receptor e mede a intensidade do sinal recebido — não a potência do emissor, nem impedância, nem condutância."
      },
      {
        "key": "meia-potencia-3db",
        "nome": "Pontos de meia potência (−3 dB)",
        "latex": "P_{-3\\,\\mathrm{dB}} = \\frac{P_{\\max}}{2} \\qquad U_{-3\\,\\mathrm{dB}} = \\frac{U_{\\max}}{\\sqrt{2}} \\approx 0{,}707\\,U_{\\max}",
        "variantes": [
          "B = f_{2} - f_{1} \\quad \\text{(entre os dois pontos a } -3\\ \\mathrm{dB})"
        ],
        "variaveis": [
          {
            "simbolo": "P_{\\max}",
            "significado": "potência no máximo da resposta",
            "unidade": "W"
          },
          {
            "simbolo": "U_{\\max}",
            "significado": "tensão no máximo da resposta",
            "unidade": "V"
          },
          {
            "simbolo": "f_1, f_2",
            "significado": "frequências inferior e superior a −3 dB",
            "unidade": "Hz"
          },
          {
            "simbolo": "B",
            "significado": "largura de banda",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#81",
          "cat1#82",
          "cat1#88",
          "cat1#396"
        ],
        "notas": "−3 dB é metade da potência, mas 0,707 da tensão. A largura de banda mede-se ENTRE os dois pontos, um de cada lado de $f_r$ — dar apenas a distância de $f_r$ a um deles (metade do valor) é o distractor sistemático. O mesmo vale para a largura de feixe de uma antena: é o ângulo total do lóbulo, não a meia-abertura."
      }
    ],
    "tabelas": [
      {
        "key": "tabela-db-razao",
        "nome": "Tabela dB ↔ razão (a saber de cor)",
        "colunas": [
          "dB",
          "Razão de potência",
          "Razão de tensão"
        ],
        "linhas": [
          [
            "0 dB",
            "1×",
            "1×"
          ],
          [
            "1 dB",
            "1,26×",
            "1,12×"
          ],
          [
            "2 dB",
            "1,58×",
            "1,26×"
          ],
          [
            "3 dB",
            "2×",
            "1,41×"
          ],
          [
            "6 dB",
            "4×",
            "2×"
          ],
          [
            "10 dB",
            "10×",
            "3,16×"
          ],
          [
            "12 dB",
            "16×",
            "4×"
          ],
          [
            "14 dB",
            "25×",
            "5×"
          ],
          [
            "14,1 dB",
            "≈ 25,7×",
            "≈ 5,1×"
          ],
          [
            "20 dB",
            "100×",
            "10×"
          ],
          [
            "30 dB",
            "1000×",
            "31,6×"
          ],
          [
            "40 dB",
            "10 000×",
            "100×"
          ]
        ],
        "notas": [
          "Valores negativos invertem: −3 dB = metade, −6 dB = um quarto, −10 dB = um décimo, −20 dB = um centésimo."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#404",
          "cat1#157",
          "cat2#374",
          "cat2#87",
          "cat2#386",
          "cat2#90"
        ]
      },
      {
        "key": "referencias-absolutas",
        "nome": "Sufixos: a que se refere cada dB",
        "colunas": [
          "Unidade",
          "Referência",
          "Exemplos"
        ],
        "linhas": [
          [
            "dB",
            "razão pura, sem referência",
            "ganho, atenuação, F/B"
          ],
          [
            "dBW",
            "1 W",
            "0 dBW = 1 W; 20 dBW = 100 W; 30 dBW = 1 kW"
          ],
          [
            "dBm",
            "1 mW",
            "0 dBm = 1 mW; +30 dBm = 1 W; −30 dBm = 1 µW"
          ],
          [
            "dBµV",
            "1 µV",
            "níveis à entrada de receptores e em CEM"
          ],
          [
            "dBi",
            "antena isotrópica",
            "ganho de antena; é o que entra na p.i.r.e."
          ],
          [
            "dBd",
            "dipolo de meia onda",
            "ganho de antena; é o que entra na p.a.r."
          ],
          [
            "dBc",
            "portadora",
            "−30 dBc = 1000× abaixo da portadora"
          ],
          [
            "dBc/Hz",
            "portadora, por Hz de banda",
            "ruído de fase"
          ]
        ],
        "notas": [
          "Regras: $P_{\\mathrm{dBm}} = P_{\\mathrm{dBW}} + 30$ e $G_{\\mathrm{dBi}} = G_{\\mathrm{dBd}} + 2{,}15$. Num balanço somam-se dB com dB; o resultado em dBW não é o mesmo número em W."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#199",
          "cat1#180",
          "cat2#201",
          "cat2#202"
        ]
      },
      {
        "key": "unidades-s-tabela",
        "nome": "Unidades S ↔ dB ↔ potência",
        "colunas": [
          "Leitura",
          "Relativo a S9",
          "Razão de potência"
        ],
        "linhas": [
          [
            "S7",
            "−12 dB",
            "1/16"
          ],
          [
            "S8",
            "−6 dB",
            "1/4"
          ],
          [
            "S9",
            "0 dB",
            "1"
          ],
          [
            "S9 + 10 dB",
            "+10 dB",
            "10×"
          ],
          [
            "S9 + 20 dB",
            "+20 dB",
            "100×"
          ],
          [
            "S9 + 40 dB",
            "+40 dB",
            "10 000×"
          ]
        ],
        "notas": [
          "1 unidade S = 6 dB = 4× em potência (= 2× em tensão).",
          "Acima de S9 a escala está graduada directamente em dB.",
          "O medidor S vive no receptor e mede a intensidade do sinal recebido."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#169",
          "cat1#157",
          "cat2#170",
          "cat2#173",
          "cat1#156"
        ]
      },
      {
        "key": "perdas-em-percentagem",
        "nome": "Atenuação ↔ percentagem de potência perdida",
        "colunas": [
          "Atenuação",
          "Potência que resta",
          "Perdida"
        ],
        "linhas": [
          [
            "0,5 dB",
            "89,1 %",
            "10,9 %"
          ],
          [
            "1 dB",
            "79,4 %",
            "20,6 % (o exame arredonda para 20,5 %)"
          ],
          [
            "1,5 dB",
            "70,8 %",
            "29,2 %"
          ],
          [
            "2 dB",
            "63,1 %",
            "36,9 %"
          ],
          [
            "3 dB",
            "50 %",
            "50 %"
          ],
          [
            "6 dB",
            "25 %",
            "75 %"
          ],
          [
            "10 dB",
            "10 %",
            "90 %"
          ]
        ],
        "notas": [
          "Um mero 1 dB de perda na linha já deita fora um quinto da potência — é por isso que as perguntas de cabo insistem neste valor. Cuidado com o distractor 10,9 %: é a perda de 0,5 dB, não a de 1 dB."
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#379",
          "cat2#211"
        ]
      },
      {
        "key": "regras-de-ouro",
        "nome": "Regras de ouro e armadilhas do decibel",
        "colunas": [],
        "linhas": [],
        "notas": [
          "Os dB somam-se, as razões multiplicam-se. 13 dB = 10 dB + 3 dB = 10 × 2 = 20×; 9 dB = 3+3+3 = 8×.",
          "10 para potência, 20 para amplitude (tensão, corrente, campo). Dobrar a tensão são 6 dB; dobrar a potência são 3 dB.",
          "«20 dB» não são «20 vezes» — são 100×. Uma razão de 20 corresponde a ≈ 13 dB.",
          "Negativo = atenuação. Um atenuador entra na soma com sinal menos.",
          "dB é razão; dBm/dBW/dBµV são níveis. Não se pode responder «30 W» a uma pergunta cuja conta deu 30 dBW.",
          "−3 dB = metade da potência = 0,707 da tensão: define larguras de banda e larguras de feixe.",
          "Ganho de parabólica ∝ $f^{2}$: duplicar a frequência dá $10\\log 4 = 6$ dB (não 3 dB).",
          "Desalinhamento de polarização de 45° custa ≈ 3 dB; polarizações cruzadas (90°) custam 20 dB ou mais — na prática a ligação fica pelo menos cem vezes mais fraca."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#91",
          "cat1#189",
          "cat2#87",
          "cat1#203",
          "cat2#217"
        ]
      }
    ]
  },
  {
    "id": "emissores-modulacao",
    "titulo": "Emissores, modulação e osciladores",
    "intro": "Como se calcula o espetro e a largura de faixa de uma emissão (AM, SSB, FM), a potência à saída de um emissor (PEP, rendimento, potência dissipada) e a frequência dos osciladores e sintetizadores que a geram. Símbolo $U$ para tensões, $f$ para frequências e $P$ para potências.",
    "formulas": [
      {
        "key": "harmonicas-e-multiplicacao",
        "nome": "Harmónicas e multiplicação de frequência",
        "latex": "f_n = n \\cdot f_0 \\qquad \\Delta f_n = n \\cdot \\Delta f_0",
        "variantes": [
          "n = \\dfrac{f_n}{f_0}",
          "\\beta_n = n \\cdot \\beta_0"
        ],
        "variaveis": [
          {
            "simbolo": "f_0",
            "significado": "frequência fundamental (portadora à entrada do multiplicador)",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_n",
            "significado": "frequência da harmónica de ordem n",
            "unidade": "Hz"
          },
          {
            "simbolo": "n",
            "significado": "ordem da harmónica ou factor de multiplicação (2, 3, 4, …)",
            "unidade": "—"
          },
          {
            "simbolo": "\\Delta f_0",
            "significado": "desvio de frequência antes da multiplicação",
            "unidade": "Hz"
          },
          {
            "simbolo": "\\Delta f_n",
            "significado": "desvio de frequência depois da multiplicação",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#63",
          "cat2#56",
          "cat1#150",
          "cat2#294",
          "cat2#343"
        ],
        "notas": "Um multiplicador de frequência multiplica pelo mesmo factor a portadora e o desvio de FM: ±5 kHz na fundamental dão ±10 kHz na 2.ª harmónica. A frequência modulante NÃO é multiplicada, pelo que o índice $\\beta$ também fica multiplicado por $n$. As harmónicas estão sempre ACIMA da fundamental — por isso o filtro que as corta é passa-baixo, nunca passa-alto."
      },
      {
        "key": "frequencias-laterais-am",
        "nome": "Frequências das bandas laterais em AM",
        "latex": "f_{\\text{lateral}} = f_p \\pm f_m",
        "variantes": [
          "f_m = |f_{\\text{lateral}} - f_p|"
        ],
        "variaveis": [
          {
            "simbolo": "f_p",
            "significado": "frequência da portadora",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_m",
            "significado": "frequência do sinal modulante (áudio)",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{lateral}}",
            "significado": "frequência de cada banda lateral",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#60",
          "cat1#167",
          "cat2#65",
          "cat2#67",
          "cat2#360",
          "cat1#169"
        ],
        "notas": "Uma emissão em AM transmite portadora e DUAS bandas laterais — são duas, não três nem quatro. Modular é transladar o sinal da banda base para junto da portadora; em SSB transmite-se apenas uma das laterais, com portadora completa, reduzida ou suprimida."
      },
      {
        "key": "largura-de-faixa-am-ssb",
        "nome": "Largura de faixa em AM e em SSB",
        "latex": "B_{\\text{AM}} = 2\\,f_{m(\\max)} \\qquad B_{\\text{SSB}} = f_{m(\\max)} = \\frac{B_{\\text{AM}}}{2}",
        "variantes": [
          "f_{m(\\max)} = \\dfrac{B_{\\text{AM}}}{2}"
        ],
        "variaveis": [
          {
            "simbolo": "B_{\\text{AM}}",
            "significado": "largura de faixa necessária em AM de dupla faixa lateral",
            "unidade": "Hz"
          },
          {
            "simbolo": "B_{\\text{SSB}}",
            "significado": "largura de faixa necessária em banda lateral única",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{m(\\max)}",
            "significado": "frequência máxima do sinal modulante",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#354",
          "cat2#81",
          "cat2#80",
          "cat2#363",
          "cat2#189",
          "cat2#366"
        ],
        "notas": "Áudio até 3 kHz dá 6 kHz em AM de dupla faixa lateral e cerca de 3 kHz (2,4 a 3 kHz na prática) em SSB — daí a SSB ser, entre as emissões de fonia, a de menor largura de banda. Sobremodular não aumenta o alcance: distorce e ALARGA a faixa ocupada, interferindo nos canais adjacentes."
      },
      {
        "key": "indice-de-modulacao-am",
        "nome": "Índice (percentagem) de modulação em AM",
        "latex": "m = \\frac{U_{\\max} - U_{\\min}}{U_{\\max} + U_{\\min}} \\qquad m_{\\%} = 100\\,m",
        "variantes": [
          "U_{\\max} = U_p\\,(1 + m)",
          "U_{\\min} = U_p\\,(1 - m)",
          "m = \\dfrac{U_m}{U_p}"
        ],
        "variaveis": [
          {
            "simbolo": "m",
            "significado": "índice de modulação em amplitude",
            "unidade": "—"
          },
          {
            "simbolo": "m_{\\%}",
            "significado": "percentagem de modulação",
            "unidade": "%"
          },
          {
            "simbolo": "U_{\\max}",
            "significado": "amplitude máxima da envolvente",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\min}",
            "significado": "amplitude mínima da envolvente",
            "unidade": "V"
          },
          {
            "simbolo": "U_p",
            "significado": "amplitude da portadora não modulada",
            "unidade": "V"
          },
          {
            "simbolo": "U_m",
            "significado": "amplitude do sinal modulante",
            "unidade": "V"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#348",
          "cat1#278",
          "cat2#355",
          "cat2#63",
          "cat2#349"
        ],
        "notas": "Deve usar-se a maior percentagem possível SEM exceder 100 % ($m \\le 1$): acima disso há sobremodulação — distorção e maior largura de faixa, logo interferência nos canais adjacentes. O índice é adimensional; só a percentagem leva o símbolo %."
      },
      {
        "key": "potencia-am",
        "nome": "Repartição da potência num sinal AM",
        "latex": "P_T = P_p\\left(1 + \\frac{m^2}{2}\\right) \\qquad P_{\\text{cada lateral}} = \\frac{m^2}{4}\\,P_p",
        "variantes": [
          "P_{\\text{ambas as laterais}} = \\dfrac{m^2}{2}\\,P_p",
          "\\dfrac{P_p}{P_T} = \\dfrac{1}{1 + m^2/2}"
        ],
        "variaveis": [
          {
            "simbolo": "P_T",
            "significado": "potência total emitida",
            "unidade": "W"
          },
          {
            "simbolo": "P_p",
            "significado": "potência da portadora",
            "unidade": "W"
          },
          {
            "simbolo": "m",
            "significado": "índice de modulação",
            "unidade": "—"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#64",
          "cat2#71",
          "cat2#279",
          "cat2#280",
          "cat2#358"
        ],
        "notas": "Mesmo com m = 1 (100 %) fica $P_T = 1{,}5\\,P_p$: a portadora leva 2/3 da potência total e cada banda lateral apenas 1/6 (as duas juntas, 1/3). É por isso que em AM a maior parte da potência vai na portadora, e que suprimi-la (SSB) permite pôr toda a potência na banda lateral útil."
      },
      {
        "key": "indice-de-modulacao-fm",
        "nome": "Índice de modulação em FM (razão de desvio)",
        "latex": "\\beta = \\frac{\\Delta f}{f_m}",
        "variantes": [
          "\\Delta f = \\beta \\cdot f_m",
          "f_m = \\dfrac{\\Delta f}{\\beta}"
        ],
        "variaveis": [
          {
            "simbolo": "\\beta",
            "significado": "índice de modulação (razão de desvio, quando se usam os valores máximos)",
            "unidade": "—"
          },
          {
            "simbolo": "\\Delta f",
            "significado": "desvio máximo de frequência da portadora",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_m",
            "significado": "frequência máxima do sinal modulante",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#83",
          "cat1#168",
          "cat2#85",
          "cat2#369",
          "cat2#370",
          "cat2#55"
        ],
        "notas": "«Razão de desvio» é o mesmo que índice de modulação, calculado com os valores máximos. É ADIMENSIONAL — nunca se exprime em hertz. 5 kHz / 3 kHz = 1,67; 6 / 2 = 3; 7,5 / 3,5 = 2,14. Os distratores habituais são o produto (15) e o quociente invertido (0,6). Pôr as duas frequências no mesmo prefixo antes de dividir."
      },
      {
        "key": "percentagem-de-modulacao-fm",
        "nome": "Percentagem de modulação em FM",
        "latex": "\\%M = \\frac{\\Delta f_{\\text{inst}}}{\\Delta f_{\\max}} \\times 100\\,\\%",
        "variantes": [
          "\\Delta f_{\\text{inst}} = \\dfrac{\\%M}{100} \\times \\Delta f_{\\max}"
        ],
        "variaveis": [
          {
            "simbolo": "\\%M",
            "significado": "percentagem de modulação",
            "unidade": "%"
          },
          {
            "simbolo": "\\Delta f_{\\text{inst}}",
            "significado": "desvio de frequência num dado instante",
            "unidade": "Hz"
          },
          {
            "simbolo": "\\Delta f_{\\max}",
            "significado": "desvio máximo definido para o sistema",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#346",
          "cat2#319",
          "cat2#320"
        ],
        "notas": "Não confundir com o índice de modulação: aqui divide-se o desvio instantâneo pelo desvio máximo permitido (3 kHz em 15 kHz = 0,2, ou seja 20 % — atenção, a prova dá a resposta na forma decimal 0,2). Depende da AMPLITUDE da tensão modulante, não da sua frequência."
      },
      {
        "key": "regra-de-carson",
        "nome": "Largura de faixa em FM (regra de Carson)",
        "latex": "B = 2\\,(\\Delta f + f_{m(\\max)}) = 2\\,f_{m(\\max)}\\,(\\beta + 1)",
        "variantes": [
          "\\Delta f = \\dfrac{B}{2} - f_{m(\\max)}",
          "f_{m(\\max)} = \\dfrac{B}{2} - \\Delta f"
        ],
        "variaveis": [
          {
            "simbolo": "B",
            "significado": "largura de faixa total ocupada",
            "unidade": "Hz"
          },
          {
            "simbolo": "\\Delta f",
            "significado": "desvio máximo de frequência",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{m(\\max)}",
            "significado": "frequência máxima do sinal modulante",
            "unidade": "Hz"
          },
          {
            "simbolo": "\\beta",
            "significado": "índice de modulação",
            "unidade": "—"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#54",
          "cat1#176",
          "cat2#68",
          "cat2#191",
          "cat1#177"
        ],
        "notas": "Duplica-se a SOMA: 25 + 3 → 56 kHz; 3 + 2,5 → 11 kHz. Distratores clássicos no caso 3 + 2,5: somar sem duplicar (5,5 kHz) ou duplicar apenas a frequência modulante, $3 + 2\\times2{,}5$ (8 kHz). Com Δf = 5 kHz e f_m = 3 kHz saem os 16 kHz que cabem num canal de 25 kHz — e é esta largura que impede a FM de fonia abaixo dos 29,5 MHz."
      },
      {
        "key": "modulacao-angular-fm-pm",
        "nome": "Modulação angular: frequência instantânea (FM e PM)",
        "latex": "f_i(t) = f_p + \\frac{1}{2\\pi}\\,\\frac{d\\varphi(t)}{dt}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "f_i",
            "significado": "frequência instantânea da portadora modulada",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_p",
            "significado": "frequência da portadora não modulada",
            "unidade": "Hz"
          },
          {
            "simbolo": "\\varphi(t)",
            "significado": "desvio de fase imposto pelo sinal modulante",
            "unidade": "rad"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#62",
          "cat1#399",
          "cat1#172",
          "cat2#368",
          "cat2#61",
          "cat2#181"
        ],
        "notas": "FM e PM são ambas modulação ANGULAR e só diferem no que varia linearmente com o modulante: a frequência (FM) ou o ângulo/fase (PM). Em FM o desvio é proporcional à amplitude instantânea do modulante; o índice de uma emissão em PM não depende da frequência da portadora. Desvio de frequência é o afastamento máximo devido à modulação, não a tolerância regulamentar."
      },
      {
        "key": "pep-a-partir-da-tensao",
        "nome": "Potência de pico da envolvente (PEP) medida no osciloscópio",
        "latex": "\\mathrm{PEP} = \\frac{U_{\\text{ef}}^{\\,2}}{R} = \\frac{U_p^{\\,2}}{2R} = \\frac{(U_{pp}/2)^{2}}{2R}",
        "variantes": [
          "U_p = \\sqrt{2\\,R\\,\\mathrm{PEP}}",
          "U_{pp} = 2\\,U_p",
          "U_{\\text{ef}} = \\dfrac{U_p}{\\sqrt{2}}"
        ],
        "variaveis": [
          {
            "simbolo": "\\mathrm{PEP}",
            "significado": "potência de pico da envolvente",
            "unidade": "W"
          },
          {
            "simbolo": "U_p",
            "significado": "tensão de pico sobre a carga",
            "unidade": "V"
          },
          {
            "simbolo": "U_{pp}",
            "significado": "tensão pico a pico lida no osciloscópio",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\text{ef}}",
            "significado": "tensão eficaz no pico da envolvente",
            "unidade": "V"
          },
          {
            "simbolo": "R",
            "significado": "resistência da carga (carga fictícia)",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#375",
          "cat2#380",
          "cat2#159"
        ],
        "notas": "O osciloscópio lê PICO A PICO: 200 V_pp em 50 Ω dão U_p = 100 V e PEP = 100²/(2×50) = 100 W; 500 V_pp dão 625 W. A PEP é uma potência eficaz calculada no pico da envolvente — daí o 2 no denominador. Esquecer de dividir por dois antes de elevar ao quadrado quadruplica o resultado (400 W em vez de 100 W) — é o erro que os distratores esperam."
      },
      {
        "key": "pep-e-potencia-media",
        "nome": "Relação entre PEP e potência média",
        "latex": "\\frac{\\mathrm{PEP}}{P_{\\text{média}}} \\approx 2{,}5 \\ \\ (\\text{voz em SSB}) \\qquad \\frac{\\mathrm{PEP}}{P_{\\text{média}}} = 1 \\ \\ (\\text{portadora não modulada})",
        "variantes": [
          "P_{\\text{média}} \\approx \\dfrac{\\mathrm{PEP}}{2{,}5}"
        ],
        "variaveis": [
          {
            "simbolo": "\\mathrm{PEP}",
            "significado": "potência de pico da envolvente",
            "unidade": "W"
          },
          {
            "simbolo": "P_{\\text{média}}",
            "significado": "potência média indicada por um wattímetro comum",
            "unidade": "W"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#376",
          "cat1#122",
          "cat2#381",
          "cat2#233",
          "cat2#264",
          "cat1#267"
        ],
        "notas": "Numa portadora não modulada PEP e potência média coincidem: 1060 W médios são 1060 W PEP (distratores: 530 W e 2120 W). Em fonia SSB a razão típica é de 2,5 para 1. Os limites do QNAF são sempre em PEP — 1500 W na categoria 1, 200 W na categoria 2 — pelo que a monitorização exige wattímetro de leitura de pico."
      },
      {
        "key": "rendimento-do-amplificador",
        "nome": "Rendimento e potência dissipada num amplificador",
        "latex": "\\eta = \\frac{P_{\\text{saída}}}{P_{\\text{alim}} + P_{\\text{entrada}}} \\qquad \\eta\\,[\\%] = 100\\,\\eta \\qquad P_{\\text{dissipada}} = (P_{\\text{alim}} + P_{\\text{entrada}}) - P_{\\text{saída}}",
        "variantes": [
          "P_{\\text{alim}} + P_{\\text{entrada}} = \\dfrac{P_{\\text{saída}}}{\\eta}",
          "\\eta \\approx \\dfrac{P_{\\text{saída}}}{P_{\\text{alim}}} \\ \\ (P_{\\text{entrada}} \\ll P_{\\text{alim}})"
        ],
        "variaveis": [
          {
            "simbolo": "\\eta",
            "significado": "rendimento do andar amplificador (razão, não percentagem)",
            "unidade": "—"
          },
          {
            "simbolo": "P_{\\text{saída}}",
            "significado": "potência de RF à saída",
            "unidade": "W"
          },
          {
            "simbolo": "P_{\\text{alim}}",
            "significado": "potência fornecida pela alimentação (corrente contínua)",
            "unidade": "W"
          },
          {
            "simbolo": "P_{\\text{entrada}}",
            "significado": "potência de RF de excitação à entrada",
            "unidade": "W"
          },
          {
            "simbolo": "P_{\\text{dissipada}}",
            "significado": "potência convertida em calor no andar",
            "unidade": "W"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#190",
          "cat1#179",
          "cat1#182",
          "cat1#178",
          "cat1#109"
        ],
        "notas": "Tudo o que entra (alimentação + excitação) e não sai em RF é DISSIPADO EM CALOR — não é radiado pela antena nem perdido na linha. Na prática a excitação é muito menor do que a alimentação e costuma desprezar-se, ficando $\\eta \\approx P_{\\text{saída}}/P_{\\text{alim}}$. Linearidade e rendimento são grandezas opostas: a classe A tem baixa distorção e mau rendimento, a classe C o inverso."
      },
      {
        "key": "criterio-de-barkhausen",
        "nome": "Condição de oscilação (critério de Barkhausen)",
        "latex": "|A \\cdot F| \\ge 1 \\qquad \\varphi_{\\text{malha}} = 0^\\circ \\ (\\text{ou } k \\times 360^\\circ)",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "A",
            "significado": "ganho do amplificador",
            "unidade": "—"
          },
          {
            "simbolo": "F",
            "significado": "fracção do sinal devolvida pela rede de realimentação",
            "unidade": "—"
          },
          {
            "simbolo": "\\varphi_{\\text{malha}}",
            "significado": "desfasagem total ao longo da malha",
            "unidade": "°"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#126",
          "cat1#129",
          "cat1#130",
          "cat1#132"
        ],
        "notas": "É a forma quantitativa de «amplificador + realimentação POSITIVA»: um oscilador gera um sinal periódico sem qualquer sinal externo aplicado, porque devolve à entrada, em fase, ganho de malha suficiente. Com realimentação negativa nunca oscila. O filtro colocado na malha (LC, cristal ou rede RC) é o que escolhe a frequência."
      },
      {
        "key": "sintetizador-pll",
        "nome": "Sintetizador com malha de captura de fase (PLL)",
        "latex": "f_{\\text{saída}} = N \\times f_{\\text{ref}}",
        "variantes": [
          "N = \\dfrac{f_{\\text{saída}}}{f_{\\text{ref}}}",
          "f_{\\text{ref}} = \\dfrac{f_{\\text{saída}}}{N}"
        ],
        "variaveis": [
          {
            "simbolo": "f_{\\text{saída}}",
            "significado": "frequência do VCO (saída do sintetizador)",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{ref}}",
            "significado": "frequência do oscilador de referência (a cristal)",
            "unidade": "Hz"
          },
          {
            "simbolo": "N",
            "significado": "razão do divisor programável na malha de realimentação",
            "unidade": "—"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#421",
          "cat1#152",
          "cat1#380",
          "cat1#140",
          "cat1#275",
          "cat2#180"
        ],
        "notas": "A frequência de referência define também o passo de sintonia: com 12,5 kHz de referência e N = 11 600 saem 145 MHz. A estabilidade e o ruído de fase da saída são os do cristal de referência — daí exigir-se uma referência estável. Ver a tabela dos blocos da PLL."
      },
      {
        "key": "pre-enfase-de-enfase",
        "nome": "Constante de tempo de pré-ênfase e de-ênfase (FM)",
        "latex": "\\tau = R\\,C \\qquad f_c = \\frac{1}{2\\pi\\tau}",
        "variantes": [
          "C = \\dfrac{\\tau}{R}",
          "\\tau = \\dfrac{1}{2\\pi f_c}"
        ],
        "variaveis": [
          {
            "simbolo": "\\tau",
            "significado": "constante de tempo da rede RC",
            "unidade": "s"
          },
          {
            "simbolo": "R",
            "significado": "resistência da rede",
            "unidade": "Ω"
          },
          {
            "simbolo": "C",
            "significado": "capacidade do condensador",
            "unidade": "F"
          },
          {
            "simbolo": "f_c",
            "significado": "frequência de corte da rede",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#164"
        ],
        "notas": "τ = 50 µs na Europa (75 µs nos EUA), o que dá $f_c = 1/(2\\pi \\times 50\\ \\mu\\text{s}) \\approx 3{,}2$ kHz. A pré-ênfase realça os agudos no emissor; a de-ênfase, um passa-baixo RC com a MESMA constante, atenua-os no recetor. A palavra «restabelecer» numa pergunta aponta sempre para a de-ênfase."
      }
    ],
    "tabelas": [
      {
        "key": "classes-de-amplificacao",
        "nome": "Classes de amplificação: ângulo de condução, linearidade e rendimento",
        "colunas": [
          "Classe",
          "Ângulo de condução",
          "Distorção harmónica",
          "Rendimento",
          "Uso típico"
        ],
        "linhas": [
          [
            "A",
            "360° (conduz todo o período)",
            "Muito baixa — melhor linearidade",
            "~25 % com carga resistiva, 50 % é o máximo teórico",
            "Pequeno sinal, andares excitadores"
          ],
          [
            "AB",
            "entre 180° e 360° (mais de meio período)",
            "Baixa",
            "50–60 %",
            "Andares finais de SSB"
          ],
          [
            "B",
            "180° (meio período)",
            "Média",
            "~78,5 % teórico",
            "Montagens em contrafase (*push-pull*)"
          ],
          [
            "C",
            "< 180° (menos de meio período)",
            "Elevada",
            "> 75 %",
            "Andares finais de FM e CW"
          ]
        ],
        "notas": [
          "Linearidade e rendimento são opostos. A vantagem da classe A é a baixa distorção harmónica e a desvantagem o baixo rendimento; na classe C é exactamente ao contrário. A classe C só serve para modulações de envolvente constante (FM, CW) — nunca para SSB — e obriga a filtro ou circuito sintonizado à saída para eliminar as harmónicas.",
          "Uma montagem em contrafase (*push-pull*) cancela as harmónicas PARES. Estrutura simplificada de um andar final: malha de adaptação de entrada → transístores de amplificação → malha de adaptação de saída (o VCO e a PLL pertencem ao sintetizador, não ao amplificador)."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#108",
          "cat1#107",
          "cat1#390",
          "cat1#178",
          "cat1#179",
          "cat1#175"
        ]
      },
      {
        "key": "tipos-de-oscilador",
        "nome": "Tipos de oscilador: realimentação e o que fixa a frequência",
        "colunas": [
          "Oscilador",
          "Realimentação positiva feita por",
          "Frequência determinada por"
        ],
        "linhas": [
          [
            "Hartley",
            "divisor indutivo (bobina com tomada)",
            "$L$ e $C$ do tanque"
          ],
          [
            "Colpitts",
            "divisor capacitivo (dois condensadores)",
            "$L$ e a capacidade série dos dois condensadores"
          ],
          [
            "A cristal",
            "ressoador de quartzo",
            "corte do cristal — máxima estabilidade"
          ],
          [
            "VFO",
            "rede $LC$ com elemento variável",
            "condensador ou bobina variáveis"
          ],
          [
            "VCO",
            "varicap polarizado pela tensão de controlo",
            "tensão aplicada ao varicap"
          ]
        ],
        "notas": [
          "Decorar o par: Hartley = indutivo, Colpitts = capacitivo. VCO é «oscilador controlado por tensão» (não por frequência, nem por luz) e VFO é «oscilador de frequência variável». A vantagem de um emissor controlado a cristal é a estabilidade da frequência de saída; a do VFO é a facilidade de mudar de frequência."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#186",
          "cat1#133",
          "cat1#134",
          "cat1#128",
          "cat1#138",
          "cat2#188"
        ]
      },
      {
        "key": "blocos-da-pll",
        "nome": "Blocos de uma malha de captura de fase (PLL)",
        "colunas": [],
        "linhas": [],
        "notas": [
          "A cadeia é sempre esta, e por esta ordem:",
          "comparador (detetor) de fase → filtro passa-baixo → VCO → divisor programável por $N$ → volta ao comparador",
          "o comparador mede a diferença de fase entre a referência e o sinal realimentado e gera uma tensão de erro;",
          "o filtro passa-baixo suaviza essa tensão;",
          "o VCO corrige a frequência até anular o erro, ficando $f_{\\text{saída}} = N \\times f_{\\text{ref}}$.",
          "Não faz parte de uma PLL: o detetor de envolvente. Uma PLL com VCO onde entra o sinal modulante é um modulador de frequência.",
          "Gama de captura: gama de FREQUÊNCIAS de entrada em que uma malha desbloqueada consegue engatar (fechar o circuito); é limitada pelo filtro e é sempre igual ou mais estreita do que a gama de manutenção. Não se define em tensão, nem em impedância, nem em tempo.",
          "DDS é outra coisa: referência + NCO + conversor digital-analógico + filtro passa-baixo — sem comparador de fase e sem VCO."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#421",
          "cat1#152",
          "cat1#380",
          "cat1#141",
          "cat1#276",
          "cat1#140"
        ]
      },
      {
        "key": "fm-valores-normalizados",
        "nome": "FM: valores normalizados a decorar",
        "colunas": [
          "Grandeza",
          "Valor"
        ],
        "linhas": [
          [
            "Fronteira banda estreita / banda larga",
            "$\\beta \\approx 1$"
          ],
          [
            "Radiodifusão FM",
            "$\\Delta f = 75$ kHz, $f_m$ até 15 kHz $\\Rightarrow \\beta = 5$"
          ],
          [
            "Canal de VHF/UHF de 25 kHz",
            "$\\Delta f = 5$ kHz, $f_m = 3$ kHz $\\Rightarrow B = 16$ kHz"
          ],
          [
            "Pré-ênfase / de-ênfase (Europa, CCIR)",
            "$\\tau = 50\\ \\mu$s"
          ],
          [
            "Pré-ênfase / de-ênfase (EUA)",
            "$\\tau = 75\\ \\mu$s"
          ]
        ],
        "notas": [
          "Banda estreita (NBFM): $\\beta$ bem abaixo de 1, um só par de bandas laterais significativas, $B \\approx 2 f_m$ (como em AM). Banda larga (WBFM): $\\beta > 1$, muitos pares de laterais — em rigor, por cada frequência modulante uma emissão em FM radia um número infinito de frequências laterais.",
          "O índice de um sinal de FM de banda estreita é menor do que o de um de banda larga, e é adimensional — não se exprime em hertz. O valor «0,99» como fronteira é distrator.",
          "Pré-ênfase (emissor) e de-ênfase (recetor) usam a mesma constante de tempo e funções opostas: realçar os agudos antes e atenuá-los depois devolve resposta plana e melhora a relação sinal-ruído."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#68",
          "cat1#168",
          "cat1#164",
          "cat2#356"
        ]
      },
      {
        "key": "detetores-e-desmoduladores",
        "nome": "Que detetor serve para quê",
        "colunas": [
          "Detetor",
          "Desmodula"
        ],
        "linhas": [
          [
            "Detetor de envolvente (díodo + filtro RC)",
            "AM apenas — responde a variações de amplitude"
          ],
          [
            "Detetor de flanco (*slope*)",
            "FM (converte FM em AM num circuito dessintonizado)"
          ],
          [
            "Discriminador Foster-Seeley",
            "FM"
          ],
          [
            "Detetor de relação (*ratio detector*)",
            "FM"
          ],
          [
            "Desmodulador com PLL",
            "FM (o áudio é a tensão de controlo do VCO)"
          ],
          [
            "Detetor de produto",
            "SSB e CW — melhor relação sinal-ruído e melhor comportamento com sinais sobremodulados"
          ]
        ],
        "notas": [
          "Em FM a informação está na frequência, com amplitude constante: aplicar um detetor de envolvente a FM dá uma tensão contínua sem informação. O discriminador tem curva em «S» que passa por zero na frequência central, trabalha à frequência intermédia e é precedido de um limitador, que fixa o sinal a uma amplitude constante. Um detetor de díodo funciona por rectificação e filtragem do sinal de RF."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#178",
          "cat1#120",
          "cat1#121",
          "cat1#124",
          "cat1#125",
          "cat1#137"
        ]
      },
      {
        "key": "designacoes-de-emissao-e-banda-lateral",
        "nome": "Designações de emissão e convenção de banda lateral",
        "colunas": [
          "Designação",
          "Emissão"
        ],
        "linhas": [
          [
            "A1A",
            "Telegrafia (CW) por manipulação da portadora"
          ],
          [
            "A3E",
            "Fonia em AM (dupla faixa lateral com portadora)"
          ],
          [
            "J3E",
            "Fonia em SSB com portadora suprimida"
          ],
          [
            "F3E",
            "Fonia em FM"
          ]
        ],
        "notas": [
          "A primeira letra é o tipo de modulação da portadora (A = amplitude, J = banda lateral única com portadora suprimida, F = frequência), o algarismo do meio é a natureza do sinal e a última letra o tipo de informação (A = telegrafia para receção auditiva, E = telefonia).",
          "Convenção de banda lateral — é a prática estabelecida entre radioamadores, não uma vantagem técnica (as duas laterais são equivalentes) nem a única lateral legalmente autorizada:",
          "LSB (banda lateral inferior): 160 m, 80/75 m e 40 m — abaixo de ≈ 10 MHz;",
          "USB (banda lateral superior): 20, 17, 15, 12 e 10 m e todo o VHF e UHF.",
          "Se emissor e recetor não usarem a mesma banda lateral, a voz sai incompreensível. A banda lateral vestigial pertence à televisão analógica e a dupla ocupa o dobro do espetro sem vantagem — ambas são distratores nestas perguntas."
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#130",
          "cat2#314",
          "cat2#313",
          "cat2#165",
          "cat3#175",
          "cat3#111"
        ]
      }
    ]
  },
  {
    "id": "recetores",
    "titulo": "Recetores: frequência imagem, ruído e sensibilidade",
    "intro": "O que o super-heteródino faz com as frequências — mistura, frequência intermédia, imagem e produtos de intermodulação — e o que limita a receção de sinais fracos: ruído térmico, fator de ruído e sensibilidade. As contas de exame são quase todas somas e diferenças de frequências, com a armadilha do prefixo a decidir a resposta.",
    "formulas": [
      {
        "key": "produtos-de-mistura",
        "nome": "Produtos de mistura (heterodinagem)",
        "latex": "f_{\\text{saída}} = f_1 + f_2 \\quad \\text{e} \\quad f_{\\text{saída}} = |\\,f_1 - f_2\\,|",
        "variantes": [
          "f_{\\text{saída}} = f_1 \\pm f_2",
          "f_{\\text{OL}} = f_{\\text{entrada}} \\pm f_{\\text{saída}} \\quad (\\text{acima ou abaixo do sinal})"
        ],
        "variaveis": [
          {
            "simbolo": "f_1",
            "significado": "frequência do sinal aplicado ao misturador",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_2",
            "significado": "frequência do oscilador local (ou do segundo sinal)",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{saída}}",
            "significado": "produtos de batimento à saída: a soma e a diferença",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#163",
          "cat1#127",
          "cat2#59",
          "cat2#352",
          "cat2#175"
        ],
        "notas": "Um misturador dá sempre soma E diferença ao mesmo tempo; é o filtro seguinte que escolhe uma delas. Para converter 2610 kHz em 145 kHz o oscilador é 2610 − 145 = 2465 kHz — e um transformador nunca altera a frequência. Sinal a mais à entrada tira o misturador da sua gama dinâmica e acrescenta produtos espúrios aos dois previstos."
      },
      {
        "key": "frequencia-intermedia",
        "nome": "Frequência intermédia do super-heteródino",
        "latex": "f_{\\text{FI}} = |\\,f_{\\text{RF}} - f_{\\text{OL}}\\,|",
        "variantes": [
          "f_{\\text{OL}} = f_{\\text{RF}} \\pm f_{\\text{FI}}",
          "f_{\\text{RF}} = f_{\\text{OL}} \\pm f_{\\text{FI}}"
        ],
        "variaveis": [
          {
            "simbolo": "f_{\\text{RF}}",
            "significado": "frequência do sinal recebido (sintonizado)",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{OL}}",
            "significado": "frequência do oscilador local",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{FI}}",
            "significado": "frequência intermédia",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#168",
          "cat1#161",
          "cat2#160",
          "cat2#175",
          "cat2#177"
        ],
        "notas": "Armadilha do prefixo: 14,250 MHz − 13,795 MHz = 0,455 MHz, que é 455 kHz (×1000). O oscilador local tanto pode estar acima como abaixo do sinal — a FI é o módulo da diferença."
      },
      {
        "key": "frequencia-imagem",
        "nome": "Frequência imagem",
        "latex": "f_{\\text{imagem}} = f_{\\text{RF}} \\pm 2\\,f_{\\text{FI}}",
        "variantes": [
          "|\\,f_{\\text{imagem}} - f_{\\text{RF}}\\,| = 2\\,f_{\\text{FI}}",
          "f_{\\text{imagem}} = f_{\\text{OL}} \\pm f_{\\text{FI}} \\quad (\\text{do lado oposto ao sinal útil})"
        ],
        "variaveis": [
          {
            "simbolo": "f_{\\text{imagem}}",
            "significado": "frequência indesejada que se converte para a mesma FI",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{RF}}",
            "significado": "frequência sintonizada",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{OL}}",
            "significado": "frequência do oscilador local",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{FI}}",
            "significado": "frequência intermédia",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#177",
          "cat1#161"
        ],
        "notas": "O sinal do sinal é o do oscilador: com o OL acima do sinal (f_OL = f_RF + f_FI) a imagem fica em f_RF + 2 f_FI; com o OL abaixo fica em f_RF − 2 f_FI. Fica sempre a 2×FI do sinal útil, nunca a 1×FI: com FI de 455 kHz e OL abaixo, a imagem de 14,250 MHz é 13,340 MHz. Quanto mais alta a FI, mais afastada a imagem e mais fácil de rejeitar pelo filtro de RF de entrada; a imagem rejeita-se, nunca se amplifica. O exame não pede a conta — pede que se reconheça a rejeição de imagem como figura de mérito e que não se confunda a imagem com a intermédia."
      },
      {
        "key": "batimento-do-bfo",
        "nome": "Batimento áudio do BFO (CW e SSB)",
        "latex": "f_{\\text{áudio}} = |\\,f_{\\text{FI}} - f_{\\text{BFO}}\\,|",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "f_{\\text{FI}}",
            "significado": "frequência intermédia do sinal recebido",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{BFO}}",
            "significado": "frequência do oscilador de batimento (BFO)",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{áudio}}",
            "significado": "tom audível resultante (tipicamente 600 a 800 Hz)",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#176",
          "cat2#162",
          "cat2#419"
        ],
        "notas": "Sem BFO um sinal CW — que é só a portadora ligada e desligada — não daria som nenhum. BFO não é o VFO nem o oscilador local, apesar de a explicação corrente os trocar. No recetor de conversão direta é o próprio oscilador local que faz esse papel: o exame descreve-o como o recetor de CW e SSB que dispensa andar de mistura de FI e amplificador de FI."
      },
      {
        "key": "produtos-de-intermodulacao",
        "nome": "Produtos de intermodulação e respetiva ordem",
        "latex": "f_{\\text{IM}} = m\\,f_1 \\pm n\\,f_2 \\qquad \\text{ordem} = |m| + |n|",
        "variantes": [
          "\\text{ordem 2: } f_1 + f_2 \\;\\; \\text{e} \\;\\; |\\,f_1 - f_2\\,|",
          "\\text{ordem 3: } 2f_1 \\pm f_2 \\;\\; \\text{e} \\;\\; 2f_2 \\pm f_1"
        ],
        "variaveis": [
          {
            "simbolo": "f_1, f_2",
            "significado": "frequências dos sinais aplicados ao dispositivo não linear",
            "unidade": "Hz"
          },
          {
            "simbolo": "m, n",
            "significado": "coeficientes inteiros",
            "unidade": "adimensional"
          },
          {
            "simbolo": "f_{\\text{IM}}",
            "significado": "frequência do produto de intermodulação gerado",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#394",
          "cat1#262",
          "cat1#119",
          "cat1#259",
          "cat1#163",
          "cat1#252"
        ],
        "notas": "Precisa das duas condições em simultâneo: pelo menos DUAS frequências diferentes E um dispositivo não linear (final saturado, díodo, misturador, junção corroída). A ordem é a soma dos coeficientes, não o número de frequências envolvidas — um produto de 3.ª ordem envolve pelo menos duas frequências, não obrigatoriamente três. É distorção não linear; num circuito linear não nascem frequências novas."
      },
      {
        "key": "intermodulacao-terceira-ordem",
        "nome": "Produtos de intermodulação de 3.ª ordem",
        "latex": "f_{\\text{IM3}} = 2f_1 - f_2 \\qquad \\text{e} \\qquad f_{\\text{IM3}} = 2f_2 - f_1",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "f_1, f_2",
            "significado": "frequências dos dois tons de ensaio ou dos dois emissores",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\text{IM3}}",
            "significado": "frequências dos produtos de terceira ordem",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#118",
          "cat1#119",
          "cat1#252"
        ],
        "notas": "São os mais incómodos por caírem mesmo ao lado dos sinais originais, dentro da banda de passagem, onde nenhum filtro os remove: 14,100 e 14,102 MHz dão 14,098 e 14,104 MHz. Observam-se no ensaio de dois tons com analisador de espetro; a linearidade quantifica-se pelo ponto de interceção de 3.ª ordem (IP3), tanto maior quanto melhor."
      },
      {
        "key": "potencia-de-ruido-termico",
        "nome": "Potência de ruído térmico",
        "latex": "N = k\\,T\\,B",
        "variantes": [
          "\\Delta N_{[\\text{dB}]} = 10\\log_{10}\\!\\left(\\frac{B_2}{B_1}\\right)",
          "B = \\frac{N}{k\\,T} \\qquad T = \\frac{N}{k\\,B}"
        ],
        "variaveis": [
          {
            "simbolo": "N",
            "significado": "potência de ruído disponível",
            "unidade": "W"
          },
          {
            "simbolo": "k",
            "significado": "constante de Boltzmann, 1,38 × 10⁻²³",
            "unidade": "J/K"
          },
          {
            "simbolo": "T",
            "significado": "temperatura de ruído efetiva do sistema (absoluta)",
            "unidade": "K"
          },
          {
            "simbolo": "B",
            "significado": "largura de banda efetiva do sistema",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#18",
          "cat1#19",
          "cat1#305",
          "cat1#20",
          "cat1#400"
        ],
        "notas": "N é DIRETAMENTE proporcional a T e DIRETAMENTE proporcional a B (os distratores trocam uma das duas por «inversamente»), e não contém frequência nenhuma — o ruído térmico é aleatório e de espetro plano. Baixa-se o ruído estreitando B (filtro à medida do modo: metade de B são −3 dB, um décimo são −10 dB) ou baixando T; k é a constante de Boltzmann, não «de Kelvin», «de Dirac» nem «de Lissajous»."
      },
      {
        "key": "tensao-de-ruido-termico",
        "nome": "Tensão eficaz de ruído térmico (Johnson-Nyquist)",
        "latex": "U_n = \\sqrt{4\\,k\\,T\\,B\\,R}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "U_n",
            "significado": "tensão eficaz de ruído aos terminais (também escrita $V_n$)",
            "unidade": "V"
          },
          {
            "simbolo": "k",
            "significado": "constante de Boltzmann",
            "unidade": "J/K"
          },
          {
            "simbolo": "T",
            "significado": "temperatura absoluta",
            "unidade": "K"
          },
          {
            "simbolo": "B",
            "significado": "largura de banda",
            "unidade": "Hz"
          },
          {
            "simbolo": "R",
            "significado": "parte resistiva (real) da impedância",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#400"
        ],
        "notas": "O R aqui é a componente REAL da impedância: só o que dissipa energia gera ruído térmico. Uma reactância ideal (bobina ou condensador) armazena e devolve energia, logo não gera ruído — o de uma bobina real vem da resistência do fio. Repare que N = kTB não depende de R, mas a tensão depende."
      },
      {
        "key": "fator-de-ruido",
        "nome": "Fator de ruído e figura de ruído",
        "latex": "F = \\frac{(S/N)_{\\text{entrada}}}{(S/N)_{\\text{saída}}} \\qquad NF_{[\\text{dB}]} = 10\\log_{10} F",
        "variantes": [
          "(S/N)_{\\text{entrada}} = F \\times (S/N)_{\\text{saída}}",
          "\\left(\\frac{S}{N}\\right)_{\\text{saída}} = \\frac{S}{F\\,k\\,T_0\\,B} \\quad (\\text{com } N_{\\text{entrada}} = k T_0 B,\\; T_0 = 290\\ \\mathrm{K})"
        ],
        "variaveis": [
          {
            "simbolo": "F",
            "significado": "fator de ruído (razão linear, adimensional)",
            "unidade": "—"
          },
          {
            "simbolo": "NF",
            "significado": "figura de ruído — o fator de ruído expresso em dB",
            "unidade": "dB"
          },
          {
            "simbolo": "S",
            "significado": "potência do sinal útil",
            "unidade": "W"
          },
          {
            "simbolo": "N",
            "significado": "potência de ruído",
            "unidade": "W"
          },
          {
            "simbolo": "T_0",
            "significado": "temperatura de referência à entrada (290 K por convenção)",
            "unidade": "K"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#158",
          "cat1#162",
          "cat1#216"
        ],
        "notas": "Figura de ruído = fator de ruído em dB (não em Hz, nem multiplicado pela S/N). É sempre F ≥ 1 (NF ≥ 0 dB), porque qualquer andar real acrescenta ruído próprio; aumentar F degrada por definição a relação sinal-ruído. F é normalizado e não depende de B — B entra no cálculo de N, não no de F, e amplificar mais não melhora a S/N. Como o ruído acrescentado pelos andares seguintes chega já dividido pelo ganho do primeiro, é o andar de entrada que domina o ruído de toda a cadeia: daí o pré-amplificador de baixo ruído junto à antena e o «equipamento de baixo ruído» exigido em EME."
      },
      {
        "key": "ruido-de-fase",
        "nome": "Ruído de fase (densidade em dBc/Hz)",
        "latex": "L(\\Delta f)_{[\\text{dBc/Hz}]} = 10\\log_{10}\\frac{N_{1\\,\\text{Hz}}(\\Delta f)}{P_{\\text{portadora}}}",
        "variantes": [
          "L_{\\text{saída}} = L_{\\text{ref}} + 20\\log_{10} N_{\\text{div}} \\quad (\\text{sintetizador PLL})"
        ],
        "variaveis": [
          {
            "simbolo": "L(\\Delta f)",
            "significado": "densidade espetral de ruído de fase a um afastamento Δf da portadora",
            "unidade": "dBc/Hz"
          },
          {
            "simbolo": "\\Delta f",
            "significado": "afastamento em relação à portadora (p. ex. 1 kHz, 10 kHz)",
            "unidade": "Hz"
          },
          {
            "simbolo": "N_{1\\,\\text{Hz}}",
            "significado": "potência de ruído medida em 1 Hz de largura de banda a esse afastamento",
            "unidade": "W"
          },
          {
            "simbolo": "P_{\\text{portadora}}",
            "significado": "potência da portadora",
            "unidade": "W"
          },
          {
            "simbolo": "N_{\\text{div}}",
            "significado": "fator de divisão da malha do sintetizador PLL",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#180",
          "cat1#139",
          "cat1#153"
        ],
        "notas": "dBc = dB relativos à portadora; «/Hz» = normalizado a 1 Hz de banda — exprime-se em dBc/Hz, não em dBc/V nem dBc/W. No analisador de espetro vê-se como uma «saia» de ruído concentrada dos dois lados da risca da portadora (riscas em múltiplos exatos seriam harmónicas). Numa PLL o ruído da referência sai agravado de 20·log N, e é ruído de fase — não distorção — que as variações de amplitude da referência produzem."
      },
      {
        "key": "atraso-de-grupo",
        "nome": "Atraso de grupo e linearidade de fase",
        "latex": "\\tau_g = -\\frac{d\\varphi}{d\\omega} \\qquad \\varphi(\\omega)\\ \\text{linear} \\Rightarrow \\tau_g\\ \\text{constante}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "\\tau_g",
            "significado": "atraso de grupo introduzido pelo filtro",
            "unidade": "s"
          },
          {
            "simbolo": "\\varphi",
            "significado": "fase introduzida pelo filtro",
            "unidade": "rad"
          },
          {
            "simbolo": "\\omega",
            "significado": "frequência angular, ω = 2πf",
            "unidade": "rad/s"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#80"
        ],
        "notas": "Fase linear = todas as componentes atrasadas o mesmo tempo = forma de onda intacta. Com fase não linear o atraso varia com a frequência, os símbolos espalham-se e sobrepõem-se: os modos DIGITAIS são os mais afetados, enquanto o ouvido é praticamente insensível à fase em SSB."
      }
    ],
    "tabelas": [
      {
        "key": "figuras-de-merito-do-recetor",
        "nome": "Figuras de mérito de um recetor (e a que não é)",
        "colunas": [
          "Figura de mérito",
          "O que mede"
        ],
        "linhas": [
          [
            "Sensibilidade",
            "capacidade de desmodular sinais muito fracos (depende do 1.º andar e da largura de banda)"
          ],
          [
            "Seletividade",
            "capacidade de rejeitar sinais em frequências muito próximas da banda necessária ao sinal útil (fixada pelos filtros de FI)"
          ],
          [
            "Rejeição da frequência imagem",
            "atenuação da frequência que se converteria para a mesma FI, a $2 \\times f_{\\text{FI}}$ do sinal útil"
          ],
          [
            "Gama dinâmica / IP3",
            "resistência ao bloqueio, à dessensibilização e à intermodulação"
          ]
        ],
        "notas": [
          "Quanto maior, melhor:",
          "Quanto maior, NÃO melhor: o ganho global indiscriminado (amplificar por igual sinais úteis e interferentes) — não melhora a relação sinal-ruído nem a relação sinal-interferência, e ganho a mais à entrada satura os andares seguintes e gera intermodulação. Daí o controlo automático de ganho (CAG) e a filtragem antes da amplificação principal.",
          "Não confundir sensibilidade (detetar o fraco) com seletividade (rejeitar o vizinho). A dessensibilização (ou bloqueio) é a perda de sensibilidade provocada por um sinal forte em frequência próxima, e reduz-se estreitando a largura de banda de RF — nunca aumentando o ganho de entrada.",
          "Valores de referência: $F \\ge 1$ logo $NF \\ge 0$ dB; piso de ruído térmico a 290 K = $-174$ dBm/Hz; sensibilidade típica de um recetor de comunicações: 0,2 µV para 12 dB de SINAD."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#161",
          "cat1#159",
          "cat1#160",
          "cat1#151",
          "cat1#165",
          "cat1#158"
        ]
      },
      {
        "key": "cadeia-do-super-heterodino",
        "nome": "Andares do recetor super-heteródino",
        "colunas": [
          "Andar",
          "Função",
          "Distrator clássico"
        ],
        "linhas": [
          [
            "Amplificador de RF",
            "pré-seleção; é ele que rejeita a frequência imagem",
            "«amplifica a imagem» — a imagem rejeita-se"
          ],
          [
            "Misturador",
            "combina $f_{\\text{RF}}$ com $f_{\\text{OL}}$ e produz a FI",
            "confundir com modulador balanceado (esse é do emissor)"
          ],
          [
            "Amplificador de FI",
            "amplifica a frequência intermédia",
            "«frequência imagem / identificada / de isolamento»"
          ],
          [
            "BFO",
            "bate com a FI e torna o CW audível",
            "confundir com VFO ou com o oscilador local"
          ]
        ],
        "notas": [
          "Antena → amplificador/filtro de RF → misturador (+ oscilador local) → filtro e amplificador de FI → detetor (+ BFO, em CW/SSB) → amplificador de áudio.",
          "Combinação mínima de um super-heteródino: oscilador de HF + misturador + detetor. O recetor de conversão direta recebe CW e SSB sem andar de mistura de FI nem amplificador de FI — o oscilador local trabalha à frequência do sinal e faz também o papel do BFO."
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#275",
          "cat2#160",
          "cat2#177",
          "cat2#162",
          "cat2#176"
        ]
      },
      {
        "key": "fi-e-larguras-de-banda",
        "nome": "Frequências intermédias e larguras de banda por modo",
        "colunas": [
          "FI clássica",
          "Onde aparece"
        ],
        "linhas": [
          [
            "455 kHz",
            "AM e HF (o exemplo 14,250 − 13,795 MHz)"
          ],
          [
            "10,7 MHz",
            "FM e VHF"
          ],
          [
            "9 MHz",
            "muitos transcetores SSB"
          ],
          [
            "Modo",
            "Largura de banda do filtro"
          ],
          [
            "CW",
            "~500 Hz"
          ],
          [
            "SSB (fonia)",
            "~2,4 kHz"
          ],
          [
            "AM",
            "~6 kHz"
          ],
          [
            "FM (VHF)",
            "12 a 16 kHz"
          ]
        ],
        "notas": [
          "Filtro demasiado largo: captam-se sinais indesejados e entra ruído a mais ($N = k\\,T\\,B$). Filtro demasiado estreito: corta-se o sinal útil e aparece o som de timbre (*ringing*). O filtro de FI por processamento digital de sinal (DSP) permite uma vasta gama de larguras e de formatos com o mesmo circuito."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#168",
          "cat1#79",
          "cat1#145",
          "cat1#19"
        ]
      }
    ]
  },
  {
    "id": "digital",
    "titulo": "Sinais digitais e conversão A/D",
    "intro": "Conversão analógica/digital (amostragem, quantificação e codificação) e as grandezas das comunicações digitais: débito binário, velocidade de modulação, largura de faixa e relação sinal/ruído de quantificação. Toda a matéria desta secção é exclusiva da categoria 1 — não há uma única pergunta de cat2 ou cat3 sobre estes temas.",
    "formulas": [
      {
        "key": "potencias-de-dois",
        "nome": "Níveis de quantificação e combinações de um código de n bits",
        "latex": "N = 2^{n}",
        "variantes": [
          "n = \\log_2 N",
          "M = 2^{n}"
        ],
        "variaveis": [
          {
            "simbolo": "N",
            "significado": "número de níveis discretos, ou de caracteres/símbolos distintos representáveis",
            "unidade": "—"
          },
          {
            "simbolo": "n",
            "significado": "número de bits por amostra (resolução) ou por carácter",
            "unidade": "bit"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#319",
          "cat1#280",
          "cat1#320",
          "cat1#30",
          "cat1#322"
        ],
        "notas": "Baudot (RTTY) tem 5 bits → $2^5 = 32$ combinações, insuficientes para letras e algarismos ao mesmo tempo (daí só maiúsculas e os caracteres de comutação); ASCII tem 7 bits → $2^7 = 128$, já com minúsculas — é esta a vantagem pedida em cat1#319. O 8.º bit de paridade não acrescenta caracteres: só deteta erros (cat1#320). Na quantificação, o mesmo $2^n$ conta os níveis de amplitude do conversor."
      },
      {
        "key": "teorema-da-amostragem",
        "nome": "Teorema da amostragem (Nyquist)",
        "latex": "f_s \\ge 2\\,f_{\\max}",
        "variantes": [
          "f_s \\ge 2B",
          "f_N = \\frac{f_s}{2}",
          "T_s = \\frac{1}{f_s}"
        ],
        "variaveis": [
          {
            "simbolo": "f_s",
            "significado": "frequência de amostragem do conversor A/D",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\max}",
            "significado": "frequência mais alta presente no sinal",
            "unidade": "Hz"
          },
          {
            "simbolo": "B",
            "significado": "largura de banda do sinal a amostrar (em banda base, $B = f_{\\max}$)",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_N",
            "significado": "frequência de Nyquist, limite superior da banda representável",
            "unidade": "Hz"
          },
          {
            "simbolo": "T_s",
            "significado": "período de amostragem",
            "unidade": "s"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#324",
          "cat1#31",
          "cat1#30",
          "cat1#322",
          "cat1#325"
        ],
        "notas": "O mínimo é **o dobro** — nem uma vez, nem quatro, nem dez vezes (são exactamente estes os distratores de cat1#324). Não cumprir a condição dá *aliasing* (cat1#31): as componentes acima de $f_s/2$ dobram-se para dentro da banda; é uma distorção determinística, não aleatória nem devida a não linearidades, e evita-se com um filtro passa-baixo anti-aliasing **antes** do conversor."
      },
      {
        "key": "bits-por-simbolo",
        "nome": "Débito binário e velocidade de modulação (bit rate / baud rate)",
        "latex": "D_b = V_s \\cdot \\log_2 M",
        "variantes": [
          "n = \\log_2 M = \\frac{D_b}{V_s}",
          "V_s = \\frac{D_b}{\\log_2 M}",
          "M = 2^{n}"
        ],
        "variaveis": [
          {
            "simbolo": "D_b",
            "significado": "débito binário (bit rate)",
            "unidade": "bit/s"
          },
          {
            "simbolo": "V_s",
            "significado": "velocidade de modulação (baud rate), símbolos por segundo",
            "unidade": "Bd"
          },
          {
            "simbolo": "M",
            "significado": "número de estados (símbolos) da modulação",
            "unidade": "—"
          },
          {
            "simbolo": "n",
            "significado": "número de bits por símbolo",
            "unidade": "bit/símbolo"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#28",
          "cat1#25"
        ],
        "notas": "cat1#28 é aritmética pura: 9600 bit/s ÷ 4800 Bd = 2 bits por símbolo (logo $M = 2^2 = 4$, QPSK). Só quando $M = 2$ é que bit rate = baud rate. cat1#25 pede a definição — *bit rate* é o **número de bits por segundo**; os distratores são a taxa de erros (BER), o número de inversões de fase (que é a velocidade de modulação, em baud) e a informação por bit."
      },
      {
        "key": "largura-de-banda-e-debito",
        "nome": "Largura de banda mínima em função do débito",
        "latex": "B_{\\min} = \\frac{V_s}{2}",
        "variantes": [
          "B_{\\min} = \\frac{D_b}{2} \\ \\ (M = 2)",
          "B_{\\min} = \\frac{D_b}{2\\,\\log_2 M}",
          "D_b = 2\\,B_{\\min} \\ \\ (M = 2)"
        ],
        "variaveis": [
          {
            "simbolo": "B_{\\min}",
            "significado": "largura de banda mínima teórica de Nyquist, em banda base",
            "unidade": "Hz"
          },
          {
            "simbolo": "V_s",
            "significado": "velocidade de modulação",
            "unidade": "Bd"
          },
          {
            "simbolo": "D_b",
            "significado": "débito binário",
            "unidade": "bit/s"
          },
          {
            "simbolo": "M",
            "significado": "número de estados da modulação",
            "unidade": "—"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#29"
        ],
        "notas": "A forma fundamental é $B_{\\min} = V_s/2$: só com **2 estados** ($D_b = V_s$) é que se reduz a $D_b/2$. Com $M$ estados, o mesmo débito cabe em menos banda — é para isso que serve a QPSK. O exame só pede a proporcionalidade: para um dado tipo de comunicação, **mais bit rate → mais largura de faixa**, nunca menos nem independente (cat1#29); e a largura de faixa não depende «da potência refletida pela antena», o quarto distrator. Na prática exige-se mais do que o mínimo teórico, pela forma real dos impulsos."
      },
      {
        "key": "amostragem-trem-de-impulsos",
        "nome": "Amostragem como multiplicação por um trem de impulsos",
        "latex": "u_s(t) = u(t)\\cdot\\sum_{k=-\\infty}^{+\\infty}\\delta(t - k\\,T_s)",
        "variantes": [
          "T_s = \\frac{1}{f_s}"
        ],
        "variaveis": [
          {
            "simbolo": "u(t)",
            "significado": "sinal analógico de entrada",
            "unidade": "V"
          },
          {
            "simbolo": "u_s(t)",
            "significado": "sinal amostrado (trem de impulsos de amplitude variável, PAM)",
            "unidade": "V"
          },
          {
            "simbolo": "T_s",
            "significado": "período de amostragem",
            "unidade": "s"
          },
          {
            "simbolo": "f_s",
            "significado": "frequência de amostragem",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#323"
        ],
        "notas": "É a opção certa de cat1#323 posta por palavras: o sinal é multiplicado por um trem de impulsos de **amplitude constante**, dando um trem de impulsos de amplitude variável proporcional ao sinal. É o modelo ideal (impulsos de Dirac); na prática os impulsos têm largura finita. Multiplicar no tempo é convoluir em frequência, pelo que o espetro fica replicado em torno de todos os múltiplos de $f_s$ — é daí que nasce a exigência de Nyquist."
      },
      {
        "key": "passo-e-ruido-de-quantificacao",
        "nome": "Passo e potência do ruído de quantificação",
        "latex": "q = \\frac{U_{\\mathrm{FS}}}{2^{n}}, \\qquad P_q = \\frac{q^{2}}{12}",
        "variantes": [
          "q = \\frac{U_{\\mathrm{FS}}}{N}"
        ],
        "variaveis": [
          {
            "simbolo": "q",
            "significado": "passo de quantificação (amplitude de um degrau)",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\mathrm{FS}}",
            "significado": "gama de tensão de entrada do conversor (fundo de escala)",
            "unidade": "V"
          },
          {
            "simbolo": "n",
            "significado": "número de bits do conversor",
            "unidade": "bit"
          },
          {
            "simbolo": "P_q",
            "significado": "potência do ruído de quantificação (valor quadrático médio do erro, normalizado a 1 Ω)",
            "unidade": "V²"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#325"
        ],
        "notas": "O que conta no exame não é o valor, é a consequência: esta potência depende só do fundo de escala e do número de bits — **não depende da frequência de amostragem** — e espalha-se uniformemente por toda a banda de 0 a $f_s/2$. Amostrar mais depressa espalha o mesmo ruído por banda mais larga e o filtro digital deita fora o que caiu fora da banda útil (é o raciocínio da explicação de cat1#325)."
      },
      {
        "key": "snr-de-quantificacao",
        "nome": "Relação sinal/ruído de quantificação",
        "latex": "\\mathrm{SNR}_q \\approx 6{,}02\\,n + 1{,}76 \\ \\ [\\mathrm{dB}]",
        "variantes": [
          "\\Delta\\mathrm{SNR} \\approx 6\\ \\mathrm{dB} \\ \\text{por cada bit acrescentado}"
        ],
        "variaveis": [
          {
            "simbolo": "\\mathrm{SNR}_q",
            "significado": "relação sinal/ruído de quantificação, para uma sinusoide que ocupa todo o fundo de escala",
            "unidade": "dB"
          },
          {
            "simbolo": "n",
            "significado": "número de bits do conversor",
            "unidade": "bit"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#30",
          "cat1#322",
          "cat1#325"
        ],
        "notas": "A parcela $1{,}76$ dB só vale para uma sinusoide de fundo de escala; a forma útil no exame é a regra prática: **cada bit adicional melhora a relação sinal/ruído em cerca de 6 dB** (está escrito nas explicações de cat1#30 e cat1#322), meio bit ≈ 3 dB. A quantificação é a única das três etapas em que se perde informação de forma irreversível."
      },
      {
        "key": "ganho-da-sobreamostragem",
        "nome": "Ganho de relação sinal/ruído por sobre-amostragem",
        "latex": "\\Delta \\mathrm{SNR} = 10 \\log_{10}(\\mathrm{OSR}) \\ \\ [\\mathrm{dB}], \\qquad \\mathrm{OSR} = \\frac{f_s}{2\\,f_{\\max}}",
        "variantes": [
          "\\Delta n = \\frac{\\log_2 \\mathrm{OSR}}{2} \\ \\ [\\mathrm{bit}]"
        ],
        "variaveis": [
          {
            "simbolo": "\\Delta\\mathrm{SNR}",
            "significado": "melhoria da relação sinal/ruído na banda útil",
            "unidade": "dB"
          },
          {
            "simbolo": "\\mathrm{OSR}",
            "significado": "fator de sobre-amostragem",
            "unidade": "—"
          },
          {
            "simbolo": "f_s",
            "significado": "frequência de amostragem usada",
            "unidade": "Hz"
          },
          {
            "simbolo": "f_{\\max}",
            "significado": "frequência máxima do sinal",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#325"
        ],
        "notas": "Regra prática: cada **duplicação** de $f_s$ ganha 3 dB (= meio bit); 4× ganha 6 dB (1 bit); 16× ganha 12 dB (2 bits). Aqui o fator é **10**, não 20: comparam-se potências de ruído. A vantagem da sobre-amostragem é aumentar a relação sinal/ruído — não aumenta a potência do sinal, não melhora a relação potência transmitida/recebida e até dá mais dados a tratar (são os três distratores de cat1#325)."
      }
    ],
    "tabelas": [
      {
        "key": "etapas-conversao-ad",
        "nome": "As três etapas da conversão analógica/digital",
        "colunas": [],
        "linhas": [],
        "notas": [
          "Pela ordem correta: 1) amostragem → 2) quantificação → 3) codificação.",
          "1. Amostragem — medir o sinal em instantes regularmente espaçados de $T_s = 1/f_s$, respeitando $f_s \\ge 2 f_{\\max}$. Fica discreto no tempo, contínuo em amplitude.",
          "2. Quantificação — arredondar cada amostra a um de $2^n$ níveis. Única etapa com perda irreversível de informação (erro/ruído de quantificação).",
          "3. Codificação — traduzir cada nível numa palavra binária.",
          "Termos intrusos que denunciam as opções erradas: diferenciação e integração são operações sobre sinais (circuitos RC, amplificadores operacionais) e não pertencem à conversão A/D — as três alternativas erradas de cat1#30 e cat1#322 contêm uma ou outra, pelo que se eliminam todas sem mais contas. A técnica é a *amostragem sequencial*, não «regeneração de harmónicos», «mudança de nível» ou «inversão de fase» (cat1#24, cat1#314)."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#30",
          "cat1#322",
          "cat1#24",
          "cat1#314"
        ]
      },
      {
        "key": "codigos-digitais-comprimentos",
        "nome": "Comprimento dos códigos digitais",
        "colunas": [
          "Código",
          "Bits por carácter",
          "Comprimento"
        ],
        "linhas": [
          [
            "Baudot (ITA2, RTTY)",
            "5 ($2^5 = 32$ combinações)",
            "fixo"
          ],
          [
            "ASCII",
            "7 ($2^7 = 128$); 8 com paridade",
            "fixo"
          ],
          [
            "AX.25 (packet)",
            "octetos de 8",
            "fixo"
          ],
          [
            "Código Morse",
            "variável",
            "variável"
          ]
        ],
        "notas": [
          "No Morse, E = um ponto, T = um traço, 0 = cinco traços; além disso o traço dura 3 vezes o ponto e os espaçamentos entre elementos, letras e palavras têm durações distintas. É por isso o único código de comprimento variável da lista (cat1#280, cujas outras opções são precisamente ASCII, AX25 e Baudot) e exige espaçamentos para delimitar caracteres. RTTY, Morse, PSK31 e packet são todos modos digitais (cat1#308), embora com modulações diferentes."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#280",
          "cat1#319",
          "cat1#320",
          "cat1#308"
        ]
      },
      {
        "key": "bits-por-simbolo-modulacoes",
        "nome": "Bits por símbolo das modulações digitais",
        "colunas": [
          "Modulação",
          "Estados $M$",
          "Bits/símbolo ($\\log_2 M$)"
        ],
        "linhas": [
          [
            "BPSK / FSK de 2 estados",
            "2",
            "1"
          ],
          [
            "QPSK",
            "4",
            "2"
          ],
          [
            "8-PSK",
            "8",
            "3"
          ],
          [
            "16-QAM",
            "16",
            "4"
          ],
          [
            "64-QAM",
            "64",
            "6"
          ]
        ],
        "notas": [
          "A primeira letra da sigla diz o parâmetro manipulado: ASK = amplitude (o CW ligar/desligar é o caso extremo), FSK = Frequency Shift Keying*, frequência (RTTY — cat1#21), PSK = *Phase Shift Keying*, fase (PSK31, e a única resposta certa quando se pede «modulação de fase» — cat1#173), QAM = *Quadrature Amplitude Modulation (cat1#306), amplitude e fase em simultâneo, pelo que não é modulação puramente de fase."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#28",
          "cat1#173",
          "cat1#306",
          "cat1#21"
        ]
      },
      {
        "key": "controlo-de-erros-crc-fec",
        "nome": "Controlo de erros: paridade, CRC e FEC",
        "colunas": [
          "Técnica",
          "Redundância",
          "Deteta",
          "Corrige"
        ],
        "linhas": [
          [
            "Bit de paridade",
            "1 bit por carácter",
            "número ímpar de bits errados",
            "não"
          ],
          [
            "CRC (*Cyclic Redundancy Check*)",
            "resto da divisão por um polinómio gerador",
            "sim (blocos)",
            "não — pede retransmissão (ARQ), como no AX.25"
          ],
          [
            "FEC (*Forward Error Correction*)",
            "Hamming, Reed-Solomon, convolucionais, LDPC",
            "sim",
            "sim, sem retransmissão (FT8, satélite)"
          ]
        ],
        "notas": [
          "No exame as duas siglas aparecem juntas sob deteção de erros em transmissão de dados (cat1#27, cat1#318) — é essa a opção a marcar, mesmo sabendo que o FEC vai mais longe e corrige. Não são técnicas de modulação, nem de amplificação de RF, nem de adaptação de impedâncias, que são os três distratores. A paridade é cega a um número par de erros no mesmo carácter e não indica qual o bit afetado (cat1#320)."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#27",
          "cat1#318",
          "cat1#320"
        ]
      }
    ]
  },
  {
    "id": "linhas-transmissao",
    "titulo": "Linhas de transmissão, ROE e adaptação",
    "intro": "Como a energia viaja do emissor à antena: impedância característica, fator de velocidade, atenuação, e o que acontece quando a carga não iguala a linha — reflexão, ROE e os métodos de adaptação. Símbolos uniformes em toda a secção: $Z_0$ para a impedância característica da linha, $Z_L$ para a carga, $|\\Gamma|$ para o módulo do coeficiente de reflexão, $P_d$ / $P_r$ para as potências direta e refletida.",
    "formulas": [
      {
        "key": "impedancia-definicao",
        "nome": "Impedância",
        "latex": "Z = \\frac{U}{I} \\qquad [Z] = \\Omega",
        "variantes": [
          "Z = \\sqrt{R^{2} + (X_L - X_C)^{2}} \\quad (\\text{circuito série})",
          "X_L = X_C \\;\\Rightarrow\\; Z = R \\quad (\\text{ressonância})"
        ],
        "variaveis": [
          {
            "simbolo": "Z",
            "significado": "impedância — oposição total à corrente em corrente alternada",
            "unidade": "Ω"
          },
          {
            "simbolo": "U",
            "significado": "tensão aplicada (valor eficaz)",
            "unidade": "V"
          },
          {
            "simbolo": "I",
            "significado": "corrente (valor eficaz)",
            "unidade": "A"
          },
          {
            "simbolo": "R",
            "significado": "resistência (parte que dissipa)",
            "unidade": "Ω"
          },
          {
            "simbolo": "X_L,\\ X_C",
            "significado": "reactâncias indutiva e capacitiva",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#186",
          "cat2#393",
          "cat1#91"
        ],
        "notas": "A impedância mede-se em OHM, tal como a resistência — nunca em volt, ampere ou watt (cat3#186). Não é «o inverso da resistência»: isso é a condutância, em siemens, e é distrator em cat2#393. Num RLC série em ressonância as duas reactâncias anulam-se e sobra só R (cat1#91)."
      },
      {
        "key": "adaptacao-de-impedancias",
        "nome": "Adaptação de impedâncias (máxima transferência de potência)",
        "latex": "Z_{\\text{carga}} = Z_{\\text{fonte}} \\;\\Rightarrow\\; P_{\\text{carga}} \\ \\text{máxima}",
        "variantes": [
          "Z_{\\text{saída}} = Z_{0} = Z_{\\text{antena}} = 50\\ \\Omega",
          "Z_{\\text{carga}} = Z_{\\text{fonte}}^{*} \\quad (\\text{adaptação conjugada: anular a reactância})"
        ],
        "variaveis": [
          {
            "simbolo": "Z_{\\text{carga}}",
            "significado": "impedância da carga (antena vista pela linha)",
            "unidade": "Ω"
          },
          {
            "simbolo": "Z_{\\text{fonte}}",
            "significado": "impedância interna da fonte / de saída do emissor",
            "unidade": "Ω"
          },
          {
            "simbolo": "Z_0",
            "significado": "impedância característica da linha",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#136",
          "cat2#322",
          "cat1#171",
          "cat3#167",
          "cat2#324",
          "cat2#192"
        ],
        "notas": "Quer-se a transferência de potência MÁXIMA e a ROE MÍNIMA (1:1) — «maximizar o coeficiente de onda estacionária» é distrator recorrente em cat1#171. Adaptar não aumenta o ganho do amplificador, só permite aproveitar a potência disponível; e importa também na receção, onde os sinais já são fracos (cat3#136). Saber a impedância do ponto de alimentação da antena serve exatamente para isto (cat1#191)."
      },
      {
        "key": "atenuacao-com-a-frequencia",
        "nome": "Atenuação de um cabo em função da frequência",
        "latex": "\\alpha \\propto \\sqrt{f} \\quad (\\text{efeito pelicular}) \\;\\Rightarrow\\; \\alpha \\ \\text{cresce sempre com } f",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "\\alpha",
            "significado": "atenuação por unidade de comprimento",
            "unidade": "dB/100 m"
          },
          {
            "simbolo": "f",
            "significado": "frequência do sinal transmitido",
            "unidade": "MHz"
          }
        ],
        "categorias": [
          "3",
          "1"
        ],
        "refs": [
          "cat3#166",
          "cat1#210",
          "cat1#211"
        ],
        "notas": "O exame pede só o SENTIDO: a atenuação AUMENTA de forma contínua com a frequência. «Atinge um máximo próximo dos 18 MHz» é o distrator repetido nas três versões da pergunta. Consequência prática: em VHF/UHF usa-se cabo melhor ou mais curto."
      },
      {
        "key": "atenuacao-especifica",
        "nome": "Atenuação específica de um troço de linha",
        "latex": "\\alpha = \\frac{A_{\\text{total}}}{\\ell} \\qquad A_{\\text{total}} = \\alpha \\cdot \\ell",
        "variantes": [
          "\\ell = \\frac{A_{\\text{total}}}{\\alpha}"
        ],
        "variaveis": [
          {
            "simbolo": "A_{\\text{total}}",
            "significado": "atenuação total do troço",
            "unidade": "dB"
          },
          {
            "simbolo": "\\alpha",
            "significado": "atenuação por unidade de comprimento",
            "unidade": "dB/m (ou dB/100 m)"
          },
          {
            "simbolo": "\\ell",
            "significado": "comprimento da linha",
            "unidade": "m"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#211",
          "cat2#206"
        ],
        "notas": "Os dB somam-se, logo a atenuação é linear com o comprimento — basta dividir. cat2#211: 26 dB / 200 m = 0,13 dB/m (a explicação do ficheiro escreve «6 dB» por lapso; a conta certa é com 26). A energia perdida transforma-se em calor no cabo, não em ROE nem em potência refletida (cat2#206)."
      },
      {
        "key": "impedancia-caracteristica",
        "nome": "Impedância característica da linha",
        "latex": "Z_{0} = \\sqrt{\\frac{L}{C}} \\qquad Z_{0} = \\frac{138}{\\sqrt{\\varepsilon_r}} \\log_{10}\\!\\left(\\frac{D}{d}\\right)",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "Z_0",
            "significado": "impedância característica do cabo (também dita impedância de surto)",
            "unidade": "Ω"
          },
          {
            "simbolo": "L,\\ C",
            "significado": "indutância e capacidade por unidade de comprimento",
            "unidade": "H/m, F/m"
          },
          {
            "simbolo": "\\varepsilon_r",
            "significado": "constante dielétrica (permitividade relativa) do isolante",
            "unidade": "adimensional"
          },
          {
            "simbolo": "D",
            "significado": "diâmetro interior da malha exterior",
            "unidade": "mm (qualquer unidade, desde que igual à de d — só conta a razão)"
          },
          {
            "simbolo": "d",
            "significado": "diâmetro do condutor central",
            "unidade": "mm (a mesma unidade de D)"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#208",
          "cat1#209",
          "cat2#210",
          "cat1#214"
        ],
        "notas": "O exame nunca pede o cálculo: pede as PROPRIEDADES. Depende apenas da geometria e do dielétrico — NÃO do comprimento nem da frequência — e o valor padrão amador é 50 Ω (cat2#208). O coaxial é uma linha não balanceada (assimétrica): malha à volta do dielétrico, que envolve o condutor central (cat2#210, cat1#209); as linhas de condutores paralelos são balanceadas. «Impedância de surto» é o mesmo que impedância característica, e aparece como distrator em cat1#214."
      },
      {
        "key": "roe-por-impedancias",
        "nome": "ROE a partir das impedâncias",
        "latex": "\\mathrm{ROE} = \\frac{Z_{\\text{maior}}}{Z_{\\text{menor}}} \\ge 1 \\qquad (\\text{carga puramente resistiva})",
        "variantes": [
          "\\mathrm{ROE} = \\frac{Z_L}{Z_0} \\ \\ \\text{ou} \\ \\ \\frac{Z_0}{Z_L}, \\ \\text{a que for} \\ge 1"
        ],
        "variaveis": [
          {
            "simbolo": "\\mathrm{ROE}",
            "significado": "relação de onda estacionária (SWR/VSWR), escreve-se n:1",
            "unidade": "adimensional"
          },
          {
            "simbolo": "Z_0",
            "significado": "impedância característica da linha",
            "unidade": "Ω"
          },
          {
            "simbolo": "Z_L",
            "significado": "impedância de entrada da antena (carga)",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#213",
          "cat2#205",
          "cat2#316",
          "cat2#229"
        ],
        "notas": "Divide-se SEMPRE a maior pela menor: 50 Ω / 25 Ω = 2, ou seja ROE 2:1 (cat2#213); ao contrário daria 0,5 e cair-se-ia em «1,25» ou «2,5», que são as opções erradas. A ROE nunca é inferior a 1 — «VSWR menor que 1» é sempre falso (cat2#229) — e é ela, não a impedância característica nem a constante dielétrica, o parâmetro que descreve um cabo desadaptado (cat2#205, cat2#316)."
      },
      {
        "key": "coeficiente-de-reflexao",
        "nome": "Coeficiente de reflexão e ROE",
        "latex": "\\Gamma = \\frac{Z_L - Z_0}{Z_L + Z_0} \\qquad \\mathrm{ROE} = \\frac{1 + |\\Gamma|}{1 - |\\Gamma|} \\qquad |\\Gamma| = \\frac{\\mathrm{ROE} - 1}{\\mathrm{ROE} + 1}",
        "variantes": [
          "|\\Gamma| = 0 \\Rightarrow \\mathrm{ROE} = 1{:}1 \\quad (\\text{adaptação perfeita})"
        ],
        "variaveis": [
          {
            "simbolo": "\\Gamma",
            "significado": "coeficiente de reflexão (em tensão); é negativo quando $Z_L < Z_0$, e só o módulo $|\\Gamma|$ (0 a 1) interessa à ROE",
            "unidade": "adimensional (−1 a 1)"
          },
          {
            "simbolo": "Z_L",
            "significado": "impedância da carga (antena)",
            "unidade": "Ω"
          },
          {
            "simbolo": "Z_0",
            "significado": "impedância característica da linha",
            "unidade": "Ω"
          },
          {
            "simbolo": "\\mathrm{ROE}",
            "significado": "relação de onda estacionária",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#213",
          "cat2#215"
        ],
        "notas": "É o caminho longo para cat2#213: $|\\Gamma| = |25-50|/(25+50) = 1/3$, logo ROE $= (1+1/3)/(1-1/3) = 2$. O sinal de $\\Gamma$ só indica a fase da reflexão; para a ROE usa-se o módulo. $\\Gamma = 0$ é adaptação perfeita, e é essa a definição prática de linha adaptada: potência refletida quase nula (cat2#215)."
      },
      {
        "key": "potencias-na-linha",
        "nome": "Potência direta, refletida e absorvida",
        "latex": "P_{\\text{carga}} = P_d - P_r \\qquad P_r = |\\Gamma|^{2} P_d \\qquad P_{\\text{carga}} = \\left(1 - |\\Gamma|^{2}\\right) P_d",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "P_d",
            "significado": "potência da onda direta (incidente), lida no medidor",
            "unidade": "W"
          },
          {
            "simbolo": "P_r",
            "significado": "potência da onda refletida, lida no medidor",
            "unidade": "W"
          },
          {
            "simbolo": "P_{\\text{carga}}",
            "significado": "potência efetivamente absorvida pela carga",
            "unidade": "W"
          },
          {
            "simbolo": "|\\Gamma|",
            "significado": "módulo do coeficiente de reflexão",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#215",
          "cat1#256",
          "cat2#231",
          "cat2#296",
          "cat2#209"
        ],
        "notas": "Subtrai-se, não se soma: 100 W diretos e 25 W refletidos → 75 W na carga; SOMAR as leituras (125 W) é o distrator principal de cat1#256. Vale para uma linha sem perdas. A potência refletida não desaparece: regressa ao emissor e aquece o andar de saída (cat2#209). O sintonizador de antena existe justamente para a minimizar (cat2#296), e é por isso que se quer ROE baixa (cat2#231)."
      },
      {
        "key": "roe-por-potencias",
        "nome": "ROE a partir das potências direta e refletida",
        "latex": "|\\Gamma| = \\sqrt{\\frac{P_r}{P_d}} \\qquad \\mathrm{ROE} = \\frac{1 + \\sqrt{P_r / P_d}}{1 - \\sqrt{P_r / P_d}}",
        "variantes": [
          "P_r = |\\Gamma|^{2} P_d"
        ],
        "variaveis": [
          {
            "simbolo": "P_d",
            "significado": "potência direta (do emissor para a antena)",
            "unidade": "W"
          },
          {
            "simbolo": "P_r",
            "significado": "potência refletida (que regressa da antena)",
            "unidade": "W"
          },
          {
            "simbolo": "|\\Gamma|",
            "significado": "módulo do coeficiente de reflexão",
            "unidade": "adimensional"
          },
          {
            "simbolo": "\\mathrm{ROE}",
            "significado": "relação de onda estacionária",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#417",
          "cat2#241"
        ],
        "notas": "A raiz quadrada é obrigatória: $\\Gamma$ é uma razão de amplitudes e o wattímetro lê potências. Com 25 W refletidos em 100 W diretos: $|\\Gamma| = \\sqrt{0{,}25} = 0{,}5$ → ROE 3:1. É esta a grandeza que o exame diz poder calcular-se, direta ou indiretamente, com um wattímetro direcional (cat2#417, cat2#241) — e não a relação frente-costas, nem o campo recebido."
      },
      {
        "key": "fator-de-velocidade",
        "nome": "Fator de velocidade de uma linha",
        "latex": "\\mathrm{VF} = \\frac{v}{c} = \\frac{1}{\\sqrt{\\varepsilon_r}}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "\\mathrm{VF}",
            "significado": "fator de velocidade",
            "unidade": "adimensional (0 a 1)"
          },
          {
            "simbolo": "v",
            "significado": "velocidade de propagação do sinal na linha",
            "unidade": "m/s"
          },
          {
            "simbolo": "c",
            "significado": "velocidade da luz no vazio ($3 \\times 10^{8}$ m/s)",
            "unidade": "m/s"
          },
          {
            "simbolo": "\\varepsilon_r",
            "significado": "constante dielétrica relativa do isolante",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#208",
          "cat1#214",
          "cat1#376"
        ],
        "notas": "É a RAZÃO velocidade na linha / velocidade da luz, nunca uma multiplicação (distrator em cat1#208), e nada tem que ver com a impedância característica, a impedância de surto ou a ROE (distratores em cat1#214). Como o sinal viaja mais devagar do que no ar, o comprimento físico é sempre MENOR do que o elétrico (cat1#376)."
      },
      {
        "key": "comprimento-fisico-de-um-troco",
        "nome": "Comprimento físico de um troço de linha",
        "latex": "\\ell_{\\text{físico}} = k \\lambda \\cdot \\mathrm{VF} = k \\cdot \\frac{300}{f\\,[\\mathrm{MHz}]} \\cdot \\mathrm{VF}",
        "variantes": [
          "\\ell_{\\text{físico}} = \\ell_{\\text{elétrico}} \\times \\mathrm{VF}",
          "\\frac{\\lambda}{4} \\ \\text{físico} = \\frac{75}{f\\,[\\mathrm{MHz}]} \\times \\mathrm{VF}"
        ],
        "variaveis": [
          {
            "simbolo": "\\ell_{\\text{físico}}",
            "significado": "comprimento a cortar no cabo",
            "unidade": "m"
          },
          {
            "simbolo": "k",
            "significado": "fração de comprimento de onda pretendida (¼, ½, …)",
            "unidade": "adimensional"
          },
          {
            "simbolo": "f",
            "significado": "frequência de trabalho — a fórmula 300/f só fecha com f em MHz e $\\ell$ em metros",
            "unidade": "MHz"
          },
          {
            "simbolo": "\\mathrm{VF}",
            "significado": "fator de velocidade do cabo",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#213",
          "cat1#212",
          "cat1#376"
        ],
        "notas": "MULTIPLICA-SE pelo VF, uma só vez. λ/4 a 7,2 MHz com VF 0,66: $0{,}25 \\times (300/7{,}2) \\times 0{,}66 \\approx 6{,}9$ m (cat1#213); a 14,1 MHz $\\approx 3{,}5$ m (cat1#212). As duas maneiras de errar estão nas opções: em cat1#213, esquecer o VF dá ~10,4 m e leva ao «10 m»; em cat1#212, aplicar o VF duas vezes dá $3{,}5 \\times 0{,}66 \\approx 2{,}3$ m e leva ao «2,3 m»."
      },
      {
        "key": "transformador-de-quarto-de-onda",
        "nome": "Transformador de quarto de onda",
        "latex": "Z_{0} = \\sqrt{Z_{\\text{entrada}} \\cdot Z_{\\text{carga}}} \\qquad (\\text{troço de } \\lambda/4)",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "Z_0",
            "significado": "impedância característica do troço de λ/4 necessário",
            "unidade": "Ω"
          },
          {
            "simbolo": "Z_{\\text{entrada}}",
            "significado": "impedância que se pretende apresentar à linha",
            "unidade": "Ω"
          },
          {
            "simbolo": "Z_{\\text{carga}}",
            "significado": "impedância da antena a adaptar",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#387"
        ],
        "notas": "O exame não pede a conta, pede o método: transformador, rede em Π e troço de linha de transmissão são todos dispositivos de adaptação em RF, por isso em cat1#387 a resposta é «todas as opções são válidas». A conta serve para perceber o troço: adaptar 100 Ω a 50 Ω exige $\\sqrt{100 \\times 50} \\approx 70{,}7$ Ω — na prática cabo de 75 Ω, cortado a λ/4 já com o fator de velocidade aplicado."
      },
      {
        "key": "frequencia-de-corte-do-guia-de-ondas",
        "nome": "Frequência de corte de um guia de ondas",
        "latex": "f_c = \\frac{c}{2a} \\qquad f < f_c \\Rightarrow \\text{não há propagação}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "f_c",
            "significado": "frequência de corte do modo fundamental",
            "unidade": "Hz"
          },
          {
            "simbolo": "a",
            "significado": "maior dimensão interior da secção do guia",
            "unidade": "m"
          },
          {
            "simbolo": "c",
            "significado": "velocidade da luz no vazio",
            "unidade": "m/s"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#205"
        ],
        "notas": "É a frequência ABAIXO da qual não há propagação — nunca «a máxima», que é o distrator de cat1#205. Como a maior dimensão do guia tem de exceder meio comprimento de onda, só é prático em UHF/SHF, onde substitui o coaxial por ter menos perdas."
      }
    ],
    "tabelas": [
      {
        "key": "tabela-roe",
        "nome": "ROE, coeficiente de reflexão e potência refletida",
        "colunas": [
          "ROE",
          "Coef. de reflexão",
          "Potência refletida",
          "Leitura prática"
        ],
        "linhas": [
          [
            "1,0 : 1",
            "0",
            "0 %",
            "adaptação perfeita — toda a potência vai para a antena"
          ],
          [
            "1,5 : 1",
            "0,20",
            "4 %",
            "excelente"
          ],
          [
            "2 : 1",
            "0,33",
            "11 %",
            "aceitável — é o caso 50 Ω / 25 Ω"
          ],
          [
            "3 : 1",
            "0,50",
            "25 %",
            "é o caso 100 W diretos / 25 W refletidos; muitos emissores a estado sólido já reduzem potência"
          ],
          [
            "5 : 1",
            "0,67",
            "44 %",
            "mau"
          ],
          [
            "∞ : 1",
            "1",
            "100 %",
            "circuito aberto ou curto-circuito"
          ]
        ],
        "notas": [
          "Regras de bolso: a ROE nunca é menor que 1, por isso «VSWR menor que 1» é sempre um distrator falso; ROE > 1 significa linha desadaptada. Uma ROE moderada perde muito menos potência do que se costuma temer (2:1 reflete só 11 %). Um sintonizador de antena não corrige a desadaptação *na antena*: apenas apresenta 50 Ω ao emissor, minimizando a potência refletida que este vê."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#213",
          "cat1#256",
          "cat2#229",
          "cat2#215",
          "cat2#417",
          "cat2#241"
        ]
      },
      {
        "key": "tabela-impedancias-e-vf",
        "nome": "Impedâncias e fatores de velocidade típicos",
        "colunas": [
          "Linha / dielétrico",
          "Valor típico"
        ],
        "linhas": [
          [
            "Coaxial de estação amadora (emissor → antena)",
            "50 Ω"
          ],
          [
            "Coaxial de TV, ou troço adaptador de λ/4",
            "75 Ω"
          ],
          [
            "Fita bifilar (dipolo dobrado)",
            "300 Ω"
          ],
          [
            "Linha de escada, condutores paralelos",
            "450 a 600 Ω"
          ],
          [
            "Polietileno maciço (RG-58, RG-213)",
            "VF ≈ 0,66"
          ],
          [
            "Dielétrico em espuma",
            "VF ≈ 0,80 a 0,88"
          ],
          [
            "Bifilar com muito ar",
            "VF ≈ 0,95"
          ]
        ],
        "notas": [
          "Atalhos: $\\lambda\\,[\\mathrm{m}] = 300 / f\\,[\\mathrm{MHz}]$; $\\lambda/4$ elétrico $= 75 / f\\,[\\mathrm{MHz}]$ — depois multiplicar pelo VF para obter o comprimento a cortar."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#208",
          "cat1#208",
          "cat2#192",
          "cat1#212",
          "cat1#213",
          "cat1#214"
        ]
      },
      {
        "key": "tabela-metodos-de-adaptacao",
        "nome": "Métodos de adaptação de impedâncias",
        "colunas": [
          "Método",
          "Onde entra"
        ],
        "linhas": [
          [
            "Circuito LC — rede em Π ou em T",
            "é o interior de um sintonizador (caixa de sintonia); mínimo de três componentes"
          ],
          [
            "Transformador de adaptação",
            "banda larga; usa-se para maximizar a transferência de potência"
          ],
          [
            "Troço de linha de λ/4, $Z_0 = \\sqrt{Z_{ent} \\cdot Z_{carga}}$",
            "banda estreita, exige cortar o cabo com o VF"
          ],
          [
            "Balun",
            "liga um elemento balanceado (dipolo) a um não balanceado (o coaxial)"
          ],
          [
            "Stub em curto ou em aberto",
            "anula a componente reactiva, deixando impedância resistiva"
          ]
        ],
        "notas": [
          "Não adaptam nada: reduzir ou aumentar a potência de saída (cat3#167), nem inserir um circulador. E adaptar não aumenta o ganho do amplificador (cat1#171)."
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#167",
          "cat2#296",
          "cat1#387",
          "cat1#215",
          "cat1#206",
          "cat1#209"
        ]
      }
    ]
  },
  {
    "id": "antenas",
    "titulo": "Antenas: dimensões, ganho e potência radiada",
    "intro": "Tudo o que o exame pede sobre antenas parte de duas contas: o comprimento de onda (que fixa as dimensões) e uma soma em decibéis (que fixa o ganho e a potência radiada). Reúnem-se aqui as dimensões de antenas ressonantes, as impedâncias típicas, a eficiência e o ganho, e o cálculo da p.i.r.e. e da p.a.r.",
    "formulas": [
      {
        "key": "comprimento-antena-ressonante",
        "nome": "Comprimento de um dipolo de meia onda e de uma vertical de quarto de onda",
        "latex": "L_{\\lambda/2} = \\frac{\\lambda}{2} \\approx \\frac{150}{f\\,[\\mathrm{MHz}]}\\ \\mathrm{m} \\qquad L_{\\lambda/4} = \\frac{\\lambda}{4} \\approx \\frac{75}{f\\,[\\mathrm{MHz}]}\\ \\mathrm{m}",
        "variantes": [
          "L_{\\lambda/2} \\approx \\dfrac{143}{f\\,[\\mathrm{MHz}]}\\ \\mathrm{m} \\quad (\\text{comprimento físico, com o fator } 0{,}95)",
          "L_{\\lambda/4} \\approx \\dfrac{71{,}5}{f\\,[\\mathrm{MHz}]}\\ \\mathrm{m}"
        ],
        "variaveis": [
          {
            "simbolo": "L_{\\lambda/2}",
            "significado": "comprimento total do dipolo (os dois braços somados)",
            "unidade": "m"
          },
          {
            "simbolo": "L_{\\lambda/4}",
            "significado": "altura do elemento vertical (monopolo / ground plane)",
            "unidade": "m"
          },
          {
            "simbolo": "f",
            "significado": "frequência de ressonância",
            "unidade": "MHz"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#195",
          "cat1#185",
          "cat1#186"
        ],
        "notas": "As duas formas exigem $f$ em MHz e devolvem metros. O comprimento físico é ≈ 0,95 da meia onda elétrica (efeito das extremidades e espessura do fio), daí 143 em vez de 150 — em exame a diferença raramente separa duas opções. Atalho: o dipolo mede metade do número que dá nome à banda (banda dos 80 m → 40 m). A antena encurta quando a frequência sobe (cat2#195). A vertical λ/4 é só metade do sistema radiante: a outra metade é a imagem no plano de terra."
      },
      {
        "key": "impedancia-dipolo-dobrado",
        "nome": "Impedância do dipolo dobrado",
        "latex": "Z_{\\text{dobrado}} = 4\\,Z_{\\text{simples}} \\approx 4 \\times 73 \\approx 300\\ \\Omega",
        "variantes": [
          "Z_{\\text{dobrado}} = n^{2} Z_{\\text{simples}} \\quad (n = \\text{número de condutores de igual diâmetro})"
        ],
        "variaveis": [
          {
            "simbolo": "Z_{\\text{simples}}",
            "significado": "impedância no centro de um dipolo de meia onda (≈ 73 Ω)",
            "unidade": "Ω"
          },
          {
            "simbolo": "Z_{\\text{dobrado}}",
            "significado": "impedância no ponto de alimentação do dipolo dobrado",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#188",
          "cat1#190",
          "cat1#395"
        ],
        "notas": "Quatro vezes, não vinte nem um quinto (cat1#188). É por isso que a linha bifilar normalizada é de 300 Ω e que um balun 4:1 casa o dipolo dobrado a coaxial de 75 Ω. O dipolo dobrado é um fio de um comprimento de onda fechado num «loop» muito fino, com meia onda de envergadura (cat1#395)."
      },
      {
        "key": "antena-fora-ressonancia",
        "nome": "Antena fora da ressonância: reactância no ponto de alimentação",
        "latex": "\\ell < \\frac{\\lambda}{2} \\Rightarrow Z = R - jX_C \\qquad \\ell > \\frac{\\lambda}{2} \\Rightarrow Z = R + jX_L",
        "variantes": [
          "\\ell = \\lambda/2 \\Rightarrow Z = R \\ (\\text{resistiva pura, } \\approx 73\\ \\Omega)"
        ],
        "variaveis": [
          {
            "simbolo": "\\ell",
            "significado": "comprimento físico da antena",
            "unidade": "m"
          },
          {
            "simbolo": "Z",
            "significado": "impedância no ponto de alimentação",
            "unidade": "Ω"
          },
          {
            "simbolo": "X_C",
            "significado": "reactância capacitiva (antena curta)",
            "unidade": "Ω"
          },
          {
            "simbolo": "X_L",
            "significado": "reactância indutiva (antena longa)",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#197",
          "cat1#92"
        ],
        "notas": "Regra de sinal a decorar: curta = capacitiva (compensa-se com bobina de carga em série); longa = indutiva (compensa-se com condensador em série). É exatamente o que faz o condensador da adaptação gama — cancelar a reactância indutiva da rede (cat1#92)."
      },
      {
        "key": "eficiencia-antena",
        "nome": "Eficiência (rendimento) de radiação",
        "latex": "\\eta = \\frac{P_{\\text{radiada}}}{P_{\\text{entregue}}} = \\frac{R_r}{R_r + R_p} = \\frac{R_r}{R_{\\text{total}}}",
        "variantes": [
          "R_{\\text{total}} = R_r + R_p",
          "\\eta\\,[\\%] = 100 \\times \\dfrac{R_r}{R_{\\text{total}}}"
        ],
        "variaveis": [
          {
            "simbolo": "\\eta",
            "significado": "eficiência de radiação",
            "unidade": "adimensional (0 a 1, ou %)"
          },
          {
            "simbolo": "R_r",
            "significado": "resistência de radiação",
            "unidade": "Ω"
          },
          {
            "simbolo": "R_p",
            "significado": "resistência de perdas",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#192",
          "cat1#195",
          "cat1#198",
          "cat1#200"
        ],
        "notas": "É $R_r$ sobre a resistência TOTAL, não sobre a de perdas: uma eficiência nunca passa de 1, o que elimina de imediato os distratores $R_r/R_p$ e $R_{\\text{total}}/R_p$ (cat1#195). A resistência total tem só duas parcelas, radiação e perdas (cat1#198). Numa vertical λ/4 a $R_r$ é baixa (≈ 36 Ω), pelo que as perdas no solo pesam muito — melhora-se com um bom sistema de radiais, não encurtando a antena (cat1#200)."
      },
      {
        "key": "ganho-diretividade-eficiencia",
        "nome": "Ganho, diretividade e eficiência",
        "latex": "G = \\eta \\, D",
        "variantes": [
          "\\eta = G/D",
          "\\text{antena sem perdas: } G = D"
        ],
        "variaveis": [
          {
            "simbolo": "G",
            "significado": "ganho (já descontadas as perdas)",
            "unidade": "adimensional (linear)"
          },
          {
            "simbolo": "D",
            "significado": "diretividade: concentração espacial, ignora perdas",
            "unidade": "adimensional (linear)"
          },
          {
            "simbolo": "\\eta",
            "significado": "eficiência de radiação",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#192",
          "cat1#193"
        ],
        "notas": "Três conceitos que o exame confunde de propósito: diretividade compara a intensidade no máximo com a média em todas as direções; ganho é o mesmo já com as perdas descontadas; eficiência é a razão entre potência radiada e potência entregue (cat1#192). Uma antena com ganho não cria potência — apenas a concentra."
      },
      {
        "key": "ganho-dbi-dbd",
        "nome": "Ganho em decibéis: referências dBi e dBd",
        "latex": "G_{[\\mathrm{dBi}]} = 10\\log_{10} G \\qquad G_{[\\mathrm{dBi}]} = G_{[\\mathrm{dBd}]} + 2{,}15",
        "variantes": [
          "G_{[\\mathrm{dBd}]} = G_{[\\mathrm{dBi}]} - 2{,}15",
          "G_{\\text{dipolo }\\lambda/2} \\approx 2{,}15\\ \\mathrm{dBi} = 0\\ \\mathrm{dBd}",
          "G_{\\text{isotrópica}} = 1 = 0\\ \\mathrm{dBi}"
        ],
        "variaveis": [
          {
            "simbolo": "G",
            "significado": "ganho em valor linear",
            "unidade": "adimensional"
          },
          {
            "simbolo": "G_{[\\mathrm{dBi}]}",
            "significado": "ganho referido à antena isotrópica",
            "unidade": "dBi"
          },
          {
            "simbolo": "G_{[\\mathrm{dBd}]}",
            "significado": "ganho referido ao dipolo de meia onda",
            "unidade": "dBd"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#67",
          "cat2#200",
          "cat1#199",
          "cat2#193",
          "cat2#204"
        ],
        "notas": "Potências convertem-se com o fator 10 (10 log), não 20. O mesmo ganho vale sempre mais 2,15 dB em dBi do que em dBd (cat2#200). A antena isotrópica não existe fisicamente — é só o modelo de referência, radia igualmente em todas as direções e não tem ganho em direção nenhuma (cat2#204, cat1#199)."
      },
      {
        "key": "pire-par",
        "nome": "p.i.r.e. e p.a.r. (potência radiada equivalente)",
        "latex": "\\mathrm{p.i.r.e.}\\,[\\mathrm{dBW}] = P - L + G_{[\\mathrm{dBi}]} \\qquad \\mathrm{p.a.r.}\\,[\\mathrm{dBW}] = P - L + G_{[\\mathrm{dBd}]}",
        "variantes": [
          "\\mathrm{p.a.r.}\\,[\\mathrm{W}] = P_{\\text{entregue}} \\times G_{d} \\quad (\\text{forma linear})",
          "\\mathrm{p.i.r.e.}\\,[\\mathrm{dBW}] = \\mathrm{p.a.r.}\\,[\\mathrm{dBW}] + 2{,}15"
        ],
        "variaveis": [
          {
            "simbolo": "P",
            "significado": "potência de saída do emissor",
            "unidade": "dBW"
          },
          {
            "simbolo": "L",
            "significado": "perdas da linha de transmissão até à antena",
            "unidade": "dB"
          },
          {
            "simbolo": "G_{[\\mathrm{dBi}]}",
            "significado": "ganho da antena face à isotrópica",
            "unidade": "dBi"
          },
          {
            "simbolo": "G_{[\\mathrm{dBd}]}",
            "significado": "ganho da antena face ao dipolo de meia onda",
            "unidade": "dBd"
          }
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#69",
          "cat2#199",
          "cat2#201",
          "cat2#202",
          "cat2#403",
          "cat3#67"
        ],
        "notas": "Em dB soma-se, não se multiplica: 10 dBW + 20 dBi = 30 dBW (o distrator «200 dBW» multiplicou; o «30 W» trocou a unidade — 30 dBW são 1000 W). Confirma com cat2#202: 10 dBW + 5 dBd = 15 dBW. O «i» de p.i.r.e. lembra ISOTRÓPICA; a p.a.r. é a do DIPOLO (cat3#67, cat2#403). Depende dos três fatores — potência de saída, perdas do cabo e ganho — e não só do ganho (cat3#69)."
      },
      {
        "key": "ganho-largura-feixe",
        "nome": "Ganho e largura de feixe a 3 dB",
        "latex": "G \\approx \\frac{41253}{\\theta_E \\cdot \\theta_H} \\qquad \\Rightarrow \\quad G \\text{ maior} \\Leftrightarrow \\theta \\text{ menor}",
        "variantes": [
          "\\theta_E \\cdot \\theta_H \\approx \\dfrac{41253}{G}",
          "\\text{duplicar o boom de uma Yagi (mais diretores)} \\approx +3\\ \\mathrm{dB}"
        ],
        "variaveis": [
          {
            "simbolo": "G",
            "significado": "ganho (ou diretividade) em valor linear, nunca em dB",
            "unidade": "adimensional"
          },
          {
            "simbolo": "\\theta_E",
            "significado": "largura de feixe a −3 dB no plano E (o plano que contém o campo elétrico, ou seja o eixo do dipolo)",
            "unidade": "graus"
          },
          {
            "simbolo": "\\theta_H",
            "significado": "largura de feixe a −3 dB no plano H, perpendicular ao anterior",
            "unidade": "graus"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#196",
          "cat1#194",
          "cat1#396",
          "cat2#293",
          "cat2#198"
        ],
        "notas": "O 41253 é a esfera completa em graus quadrados (4π sr), pelo que os ângulos entram em graus e G em valor linear; em exame basta o sentido inverso — mais ganho, feixe mais estreito, porque o ganho é concentração e não amplificação (cat1#194, cat2#196). Num diagrama polar, a largura a 3 dB é o ângulo TOTAL entre os dois pontos onde o lóbulo cruza o anel dos −3 dB (cat1#396). Por o diagrama ser tridimensional, representa-se em dois planos, E e H — que só coincidem com o vertical e o horizontal consoante a polarização da antena (cat2#198)."
      },
      {
        "key": "relacao-frente-costas",
        "nome": "Relação frente/costas",
        "latex": "\\frac{F}{C}\\,[\\mathrm{dB}] = 10\\log_{10}\\frac{P_{\\text{frente}}}{P_{\\text{costas}}}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "P_{\\text{frente}}",
            "significado": "potência radiada no máximo do lóbulo principal (0°)",
            "unidade": "W"
          },
          {
            "simbolo": "P_{\\text{costas}}",
            "significado": "potência radiada na direção oposta (180°)",
            "unidade": "W"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#203",
          "cat1#201",
          "cat1#207"
        ],
        "notas": "Num diagrama polar graduado em dB abaixo do máximo lê-se diretamente: lóbulo traseiro a tocar o anel dos −40 dB → 40 dB de relação frente/costas (cat1#201). Não é o número de diretores face aos refletores nem o ganho face ao dipolo — são os distratores de cat2#203. Uma Yagi típica anda pelos 15 a 25 dB, e é essa rejeição que reduz a interferência de estações ao lado ou atrás (cat1#207)."
      },
      {
        "key": "reciprocidade-antena",
        "nome": "Reciprocidade da antena (emissão ↔ receção)",
        "latex": "G_{\\text{emissão}} = G_{\\text{receção}} \\qquad Z_{\\text{emissão}} = Z_{\\text{receção}} \\qquad D_{\\text{emissão}} = D_{\\text{receção}}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "G",
            "significado": "ganho da antena",
            "unidade": "dBi"
          },
          {
            "simbolo": "Z",
            "significado": "impedância no ponto de alimentação",
            "unidade": "Ω"
          },
          {
            "simbolo": "D",
            "significado": "diretividade / diagrama de radiação",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#196"
        ],
        "notas": "Vale para qualquer antena passiva e linear: diagrama, ganho, impedância, polarização e largura de banda são iguais a emitir e a receber. É o que permite medir o diagrama com a antena a receber e usar a área efetiva (uma grandeza de receção) para raciocinar sobre a emissão."
      },
      {
        "key": "area-efetiva",
        "nome": "Área efetiva (abertura) de uma antena",
        "latex": "A_{ef} = \\frac{\\lambda^{2}}{4\\pi}\\,D \\qquad \\left(\\text{isotrópica: } A_{ef} = \\frac{\\lambda^{2}}{4\\pi}\\right)",
        "variantes": [
          "D = \\dfrac{4\\pi A_{ef}}{\\lambda^{2}}"
        ],
        "variaveis": [
          {
            "simbolo": "A_{ef}",
            "significado": "área efetiva da antena",
            "unidade": "m²"
          },
          {
            "simbolo": "\\lambda",
            "significado": "comprimento de onda",
            "unidade": "m"
          },
          {
            "simbolo": "D",
            "significado": "diretividade em valor linear (nunca em dB)",
            "unidade": "adimensional"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#193"
        ],
        "notas": "A área efetiva é DIRETAMENTE proporcional à diretividade — o fator $\\lambda^2/4\\pi$ é comum a todas as antenas à mesma frequência. Não são «numericamente iguais»: $A_{ef}$ vem em m² e $D$ é adimensional (cat1#193). Como $A_{ef}$ é proporcional a $\\lambda^2$, diminui com o quadrado da frequência — é essa a razão física por que a atenuação em espaço livre cresce com a frequência."
      },
      {
        "key": "ganho-parabolica",
        "nome": "Ganho de uma antena parabólica",
        "latex": "G = \\eta \\left(\\frac{\\pi d}{\\lambda}\\right)^{2} = \\eta \\left(\\frac{\\pi d f}{c}\\right)^{2}",
        "variantes": [
          "G_{[\\mathrm{dBi}]} = 10\\log_{10} G",
          "\\text{duplicar } f \\text{ ou } d \\Rightarrow G \\times 4 \\Rightarrow +6\\ \\mathrm{dB}"
        ],
        "variaveis": [
          {
            "simbolo": "G",
            "significado": "ganho em valor linear",
            "unidade": "adimensional"
          },
          {
            "simbolo": "\\eta",
            "significado": "rendimento de abertura, tipicamente 0,5 a 0,7",
            "unidade": "adimensional"
          },
          {
            "simbolo": "d",
            "significado": "diâmetro do refletor",
            "unidade": "m"
          },
          {
            "simbolo": "\\lambda",
            "significado": "comprimento de onda, nas mesmas unidades de d",
            "unidade": "m"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#189",
          "cat1#183"
        ],
        "notas": "O ganho varia com o QUADRADO da frequência e do diâmetro: duplicar a frequência multiplica o ganho por 4, ou seja +6 dB — não +3 dB (cat1#189). É também por isso que as parabólicas só são práticas em SHF, onde o prato mede muitos comprimentos de onda (cat1#183): a 10 GHz (λ = 3 cm), um prato de 1 m com η = 0,55 dá ≈ 38 dBi."
      },
      {
        "key": "tensao-loop-recepcao",
        "nome": "Tensão induzida num loop (quadro) de receção pequeno",
        "latex": "U = \\frac{2\\pi N A E \\cos\\theta}{\\lambda}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "U",
            "significado": "tensão induzida aos terminais do loop",
            "unidade": "V"
          },
          {
            "simbolo": "N",
            "significado": "número de espiras",
            "unidade": "adimensional"
          },
          {
            "simbolo": "A",
            "significado": "área da espira",
            "unidade": "m²"
          },
          {
            "simbolo": "E",
            "significado": "intensidade do campo elétrico incidente",
            "unidade": "V/m"
          },
          {
            "simbolo": "\\theta",
            "significado": "ângulo entre o plano do loop e a direção de chegada da onda",
            "unidade": "graus"
          },
          {
            "simbolo": "\\lambda",
            "significado": "comprimento de onda, coerente com a área (m, com A em m²)",
            "unidade": "m"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#184",
          "cat1#286"
        ],
        "notas": "$N$ e $A$ multiplicam-se: aumenta-se a tensão aumentando QUALQUER um deles — a opção que acrescenta espiras reduzindo a área é o distrator (cat1#184). O $\\cos\\theta$ dá o diagrama em oito, com dois nulos profundos: úteis em radiogoniometria, mas é esse padrão bidirecional que cria a ambiguidade de 180° (cat1#286)."
      }
    ],
    "tabelas": [
      {
        "key": "comprimentos-por-banda",
        "nome": "Comprimentos de antena por banda (memória rápida)",
        "colunas": [
          "Banda",
          "$f$ típica",
          "$\\lambda = 300/f$",
          "Dipolo $\\lambda/2$",
          "Vertical $\\lambda/4$"
        ],
        "linhas": [
          [
            "80 m",
            "3,55 MHz",
            "≈ 84,5 m",
            "≈ 42 m",
            "≈ 21 m"
          ],
          [
            "40 m",
            "7,1 MHz",
            "≈ 42 m",
            "≈ 21 m",
            "≈ 10,5 m"
          ],
          [
            "20 m",
            "14,2 MHz",
            "≈ 21,1 m",
            "≈ 10,5 m",
            "≈ 5,3 m"
          ],
          [
            "10 m",
            "28,5 MHz",
            "≈ 10,5 m",
            "≈ 5,3 m",
            "≈ 2,6 m"
          ],
          [
            "2 m",
            "145 MHz",
            "≈ 2,07 m",
            "≈ 1,03 m",
            "≈ 0,52 m"
          ],
          [
            "70 cm",
            "435 MHz",
            "≈ 0,69 m",
            "≈ 34 cm",
            "≈ 17 cm"
          ]
        ],
        "notas": [
          "Regra de bolso: o dipolo mede aproximadamente metade do número que dá nome à banda; a vertical $\\lambda/4$ mede metade do dipolo. A coluna do dipolo é a meia onda elétrica ($\\lambda/2$); com o fator prático de 0,95 fica ~5 % mais curta — é por isso que em cat1#185, a 3,55 MHz, a resposta certa é 40 m e não os 42 m da conta direta."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#195",
          "cat1#185",
          "cat1#186",
          "cat1#212"
        ]
      },
      {
        "key": "ganhos-tipicos",
        "nome": "Ganhos típicos e antenas de referência",
        "colunas": [
          "Antena",
          "Ganho"
        ],
        "linhas": [
          [
            "Isotrópica (teórica)",
            "0 dBi — referência da p.i.r.e.; sem ganho em direção nenhuma"
          ],
          [
            "Dipolo $\\lambda/2$",
            "2,15 dBi = 0 dBd — referência da p.a.r."
          ],
          [
            "Vertical $\\lambda/4$ com plano de terra",
            "≈ 0 dBd (comparável ao dipolo), omnidirecional no plano horizontal"
          ],
          [
            "Yagi de 3 elementos",
            "≈ 5 – 7 dBd (7 – 9 dBi)"
          ],
          [
            "Yagi de 5 elementos",
            "≈ 7 – 9 dBd (9 – 11 dBi)"
          ],
          [
            "Duplicar o comprimento do boom (mais diretores)",
            "+3 dB"
          ]
        ],
        "notas": [
          "A isotrópica é uma fonte pontual hipotética, sem existência física: serve só de referência. Nenhuma antena cria potência — a Yagi tem ganho porque concentra a radiação, retirando-a das restantes direções; o refletor e os diretores são elementos parasitas (não alimentados) e é a Yagi multi-elementos a mais diretiva das antenas do exame."
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#106",
          "cat2#200",
          "cat2#193",
          "cat2#204",
          "cat2#291",
          "cat2#292"
        ]
      },
      {
        "key": "impedancias-tipicas",
        "nome": "Impedâncias típicas de antenas e linhas",
        "colunas": [],
        "linhas": [],
        "notas": [
          "Dipolo de meia onda alimentado ao centro: ≈ 73 Ω (espaço livre)",
          "Dipolo dobrado (2 condutores): ≈ 300 Ω (= 4 × 73 ≈ 292)",
          "Vertical $\\lambda/4$ sobre plano de terra: ≈ 36 Ω",
          "Extremidade de um dipolo (alimentação em ponta): milhares de ohm (corrente mínima, tensão máxima)",
          "Cabo coaxial normalizado: 50 Ω (equipamento) ou 75 Ω (TV/vídeo)",
          "Linha bifilar (*twin-lead*): 300 Ω, feita para alimentar dipolos dobrados",
          "Balun 4:1 adapta os ≈ 300 Ω do dipolo dobrado aos 75 Ω do coaxial; o 1:1 apenas equilibra",
          "O coaxial é uma linha não balanceada; o dipolo de Hertz é um elemento balanceado. Ligar um ao outro sem balun cria correntes de modo comum na malha, que fazem o cabo radiar e deformam o diagrama."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#188",
          "cat1#190",
          "cat1#206",
          "cat1#209",
          "cat1#386",
          "cat1#191"
        ]
      },
      {
        "key": "carga-artificial",
        "nome": "Carga artificial (antena fictícia)",
        "colunas": [],
        "linhas": [],
        "notas": [
          "É uma resistência não indutiva de 50 Ω, dimensionada para dissipar em calor a potência do emissor.",
          "Ligada no lugar da antena apresenta ROE 1:1: o emissor «vê» uma carga perfeitamente adaptada, mas não há emissão significativa de campos eletromagnéticos.",
          "Serve para afinar o emissor, medir a potência de saída e verificar a modulação sem ocupar a frequência nem interferir — é a melhor forma de reduzir o risco de causar interferências ao testar um emissor.",
          "O que não faz: não permite emitir mais potência, não protege contra sobretensões da rede e não impede que sejamos interferidos."
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#122",
          "cat2#409",
          "cat2#378",
          "cat2#309"
        ]
      }
    ]
  },
  {
    "id": "propagacao",
    "titulo": "Propagação",
    "intro": "Como a onda sai da antena, se espalha e chega (ou não) ao destino: comprimento de onda, atenuação com a distância, horizonte e obstáculos, e o comportamento das camadas da ionosfera que abre e fecha as ligações em HF. As fórmulas de antena propriamente ditas (dipolo, ganho, p.i.r.e./p.a.r.) estão na secção Antenas.",
    "formulas": [
      {
        "key": "lei-inverso-quadrado",
        "nome": "Atenuação em espaço livre: lei do inverso do quadrado",
        "latex": "S = \\frac{P}{4\\pi d^{2}} \\qquad\\Longrightarrow\\qquad S \\propto \\frac{1}{d^{2}}",
        "variantes": [
          "P_{r} \\propto \\dfrac{1}{d^{2}}",
          "2d \\Rightarrow S/4\\ (-6\\ \\mathrm{dB}) \\qquad 3d \\Rightarrow S/9"
        ],
        "variaveis": [
          {
            "simbolo": "S",
            "significado": "densidade de potência à distância d",
            "unidade": "W/m²"
          },
          {
            "simbolo": "P",
            "significado": "potência radiada",
            "unidade": "W"
          },
          {
            "simbolo": "d",
            "significado": "distância à antena",
            "unidade": "m"
          },
          {
            "simbolo": "P_{r}",
            "significado": "potência recolhida na antena de receção",
            "unidade": "W"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#13",
          "cat2#22",
          "cat1#219",
          "cat3#137",
          "cat2#330"
        ],
        "notas": "Ao duplicar a distância o sinal fica 4 vezes mais fraco (−6 dB), não metade — a atenuação NÃO é linear. Acontece mesmo no vazio: é a energia a espalhar-se por uma esfera maior, não o ar a absorvê-la. Atenção ao rigor: quem cai com o quadrado da distância é a densidade de potência $S$; a intensidade de campo elétrico cai com $1/d$ (é $E = \\sqrt{30PG}/d$, e $S = E^{2}/120\\pi$). Nas perguntas cat2#22 e cat2#330 a opção dada como certa é mesmo «decresce com o quadrado da distância» — na prova responde pela chave, mas sabe que a relação exata para $E$ é $1/d$."
      },
      {
        "key": "atenuacao-espaco-livre",
        "nome": "Atenuação em espaço livre (FSPL) em decibéis",
        "latex": "A_{\\text{el}}\\,[\\mathrm{dB}] = 20\\log_{10}\\left(\\frac{4\\pi d}{\\lambda}\\right) = 32{,}45 + 20\\log_{10} f\\,[\\mathrm{MHz}] + 20\\log_{10} d\\,[\\mathrm{km}]",
        "variantes": [
          "L_{fs}\\,[\\mathrm{dB}] = 32{,}44 + 20\\log_{10} d\\,[\\mathrm{km}] + 20\\log_{10} f\\,[\\mathrm{MHz}]",
          "L_{fs}\\,[\\mathrm{dB}] = 92{,}44 + 20\\log_{10} d\\,[\\mathrm{km}] + 20\\log_{10} f\\,[\\mathrm{GHz}]"
        ],
        "variaveis": [
          {
            "simbolo": "L_{fs}",
            "significado": "atenuação de percurso em espaço livre",
            "unidade": "adimensional (razão) na forma linear; dB nas variantes"
          },
          {
            "simbolo": "d",
            "significado": "distância entre as duas antenas",
            "unidade": "m na forma linear; km nas formas em dB"
          },
          {
            "simbolo": "f",
            "significado": "frequência",
            "unidade": "Hz na forma linear; MHz (ou GHz) nas formas em dB"
          },
          {
            "simbolo": "\\lambda",
            "significado": "comprimento de onda",
            "unidade": "m"
          },
          {
            "simbolo": "c",
            "significado": "velocidade da luz",
            "unidade": "m/s"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#241",
          "cat1#219"
        ],
        "notas": "Fator 20, não 10: +6 dB por cada duplicação da distância OU da frequência, +20 dB por década. A potência do emissor não entra — é uma razão entre potências (cat1#241). As constantes 32,44 e 92,44 só valem com $d$ em km; misturar unidades é o erro clássico. Exemplo: 100 km a 145 MHz $\\to$ 32,44 + 40 + 43,2 ≈ 116 dB."
      },
      {
        "key": "desadaptacao-polarizacao",
        "nome": "Perda por desadaptação de polarização",
        "latex": "\\frac{P_{\\text{recebida}}}{P_{\\text{disponível}}} = \\cos^{2}\\theta \\qquad A\\,[\\mathrm{dB}] = -20\\log_{10}(\\cos\\theta)",
        "variantes": [
          "\\theta = 45^{\\circ} \\Rightarrow \\cos^{2}\\theta = 0{,}5 \\Rightarrow A = 3\\ \\mathrm{dB}",
          "\\theta = 90^{\\circ} \\Rightarrow A \\to \\infty\\ (\\text{na prática } 20\\ \\text{a } 30\\ \\mathrm{dB})"
        ],
        "variaveis": [
          {
            "simbolo": "\\theta",
            "significado": "ângulo entre a polarização da onda e a da antena",
            "unidade": "graus"
          },
          {
            "simbolo": "A",
            "significado": "perda por desadaptação",
            "unidade": "dB"
          },
          {
            "simbolo": "P_{\\text{recebida}}",
            "significado": "potência efetivamente captada",
            "unidade": "W"
          },
          {
            "simbolo": "P_{\\text{disponível}}",
            "significado": "potência que seria captada com polarizações alinhadas",
            "unidade": "W"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#217",
          "cat1#203"
        ],
        "notas": "Valores a fixar: 45° custa 3 dB; 90° (vertical a receber horizontal) é perda praticamente total — «várias dezenas de vezes mais fraca» (cat2#217), 20 a 30 dB no mundo real. Linear a receber circular custa também 3 dB. Em HF via ionosfera a polarização roda e o efeito esbate-se; em VHF/UHF em linha de vista é determinante. O nome do fenómeno (cat1#203) é «desadaptação de polarizações»."
      },
      {
        "key": "onda-terrestre-alcance",
        "nome": "Alcance da onda terrestre com a frequência",
        "latex": "f \\uparrow \\quad\\Rightarrow\\quad \\alpha_{\\text{solo}} \\uparrow \\quad\\Rightarrow\\quad d_{\\text{alcance}} \\downarrow",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "f",
            "significado": "frequência de trabalho",
            "unidade": "Hz"
          },
          {
            "simbolo": "\\alpha_{\\text{solo}}",
            "significado": "atenuação por perdas no solo",
            "unidade": "dB/km"
          },
          {
            "simbolo": "d_{\\text{alcance}}",
            "significado": "alcance útil da onda de superfície",
            "unidade": "km"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#220",
          "cat1#270"
        ],
        "notas": "Ordens de grandeza: LF/MF centenas de km, HF baixo algumas dezenas, VHF praticamente nada (cat1#220). Usa-se polarização VERTICAL (cat1#270), porque o campo horizontal é praticamente curto-circuitado pelo solo; o mar, bom condutor, atenua muito menos do que solo seco."
      },
      {
        "key": "horizonte-radio",
        "nome": "Distância ao horizonte rádio",
        "latex": "d\\,[\\mathrm{km}] \\approx 4{,}12\\sqrt{h\\,[\\mathrm{m}]} \\qquad d_{\\text{total}} \\approx 4{,}12\\left(\\sqrt{h_1} + \\sqrt{h_2}\\right)",
        "variantes": [
          "4h \\Rightarrow 2d\\quad(\\text{quadruplicar a altura duplica o alcance})"
        ],
        "variaveis": [
          {
            "simbolo": "d",
            "significado": "distância ao horizonte rádio",
            "unidade": "km"
          },
          {
            "simbolo": "h",
            "significado": "altura da antena acima do solo",
            "unidade": "m"
          },
          {
            "simbolo": "h_1, h_2",
            "significado": "alturas das antenas de emissão e de receção",
            "unidade": "m"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#224",
          "cat1#239"
        ],
        "notas": "4,12 e não 3,57: o horizonte rádio é cerca de 15 % maior que o ótico, porque a troposfera encurva a onda (modelo do raio terrestre 4/3). Atenção às unidades: $h$ em metros dá $d$ em quilómetros. Só a ALTURA das antenas o aumenta (cat1#224) — aumentar a potência não faz a onda contornar a curvatura da Terra."
      },
      {
        "key": "raio-elipsoide-fresnel",
        "nome": "Raio do primeiro elipsoide de Fresnel",
        "latex": "r\\,[\\mathrm{m}] = 17{,}3\\sqrt{\\frac{d_1 d_2}{f\\,[\\mathrm{GHz}]\\,(d_1 + d_2)}}",
        "variantes": [
          "\\text{a meio do percurso: } r_{\\max} = 8{,}66\\sqrt{\\dfrac{D\\,[\\mathrm{km}]}{f\\,[\\mathrm{GHz}]}}"
        ],
        "variaveis": [
          {
            "simbolo": "r",
            "significado": "raio do primeiro elipsoide no ponto considerado",
            "unidade": "m"
          },
          {
            "simbolo": "d_1, d_2",
            "significado": "distâncias do obstáculo a cada uma das antenas",
            "unidade": "km"
          },
          {
            "simbolo": "D = d_1 + d_2",
            "significado": "comprimento total do percurso",
            "unidade": "km"
          },
          {
            "simbolo": "f",
            "significado": "frequência",
            "unidade": "GHz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#240"
        ],
        "notas": "Regra prática: manter desobstruídos pelo menos 60 % do primeiro elipsoide; o raio é máximo a meio do percurso e cresce quando a frequência baixa. Armadilha: em cat1#240 a resposta dada como certa é que, com o elipsoide livre, a atenuação «é muito menor que a atenuação em espaço livre» — a rigor seria praticamente IGUAL à de espaço livre, mas no exame marca-se «muito menor»."
      },
      {
        "key": "frequencia-critica",
        "nome": "Frequência crítica de uma camada ionosférica",
        "latex": "f_{c}\\,[\\mathrm{Hz}] \\approx 9\\sqrt{N} \\qquad f < f_{c} \\Rightarrow \\text{onda devolvida em incidência vertical}",
        "variantes": [
          "f_{c} \\propto \\sqrt{N}",
          "f_{c}\\,[\\mathrm{MHz}] \\approx 9\\times 10^{-6}\\sqrt{N}"
        ],
        "variaveis": [
          {
            "simbolo": "f_{c}",
            "significado": "frequência crítica da camada (foE, foF2, …)",
            "unidade": "Hz"
          },
          {
            "simbolo": "N",
            "significado": "densidade de eletrões livres da camada",
            "unidade": "eletrões/m³"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#222",
          "cat1#383",
          "cat1#299",
          "cat1#9"
        ],
        "notas": "A notação é fixa: f + o (onda ordinária) + nome da camada — foE (cat1#222), foF2 (cat1#383); fcE, feE e flE são invenções dos distratores. Como $f_c \\propto \\sqrt{N}$, sobe de dia, no verão e no máximo solar; é por isso que a ionosfera só é blindagem em DETERMINADAS frequências, tipicamente até ≈ 30 MHz (cat1#299, cat1#9)."
      },
      {
        "key": "muf-lei-da-secante",
        "nome": "Frequência máxima utilizável (MUF) — lei da secante",
        "latex": "\\mathrm{MUF} = \\frac{f_{c}}{\\cos\\varphi} = f_{c}\\,\\sec\\varphi",
        "variantes": [
          "\\varphi = 0^{\\circ}\\ (\\text{incidência vertical}) \\Rightarrow \\mathrm{MUF} = f_{c}"
        ],
        "variaveis": [
          {
            "simbolo": "\\mathrm{MUF}",
            "significado": "frequência máxima utilizável no percurso",
            "unidade": "MHz"
          },
          {
            "simbolo": "f_{c}",
            "significado": "frequência crítica da camada refletora",
            "unidade": "MHz"
          },
          {
            "simbolo": "\\varphi",
            "significado": "ângulo de incidência na ionosfera, medido à vertical",
            "unidade": "graus"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#392",
          "cat1#236",
          "cat1#238"
        ],
        "notas": "MUF não é frequência crítica: quanto mais rasante a incidência (percurso mais longo, ângulo de partida baixo), maior a MUF. Abaixo da MUF a onda é devolvida à Terra (cat1#236); acima, atravessa a ionosfera e perde-se. Depende da geometria, da hora, da estação e da atividade solar — todas as opções são válidas (cat1#392). Nenhuma pergunta de cat2 usa a sigla MUF: aí examina-se só a consequência (VHF/UHF não se refletem na ionosfera — ver a tabela das faixas)."
      },
      {
        "key": "fot",
        "nome": "Frequência ótima de trabalho (FOT)",
        "latex": "\\mathrm{FOT} \\approx 0{,}85 \\times \\mathrm{MUF}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "\\mathrm{FOT}",
            "significado": "frequência ótima de trabalho",
            "unidade": "MHz"
          },
          {
            "simbolo": "\\mathrm{MUF}",
            "significado": "frequência máxima utilizável",
            "unidade": "MHz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#230",
          "cat1#231",
          "cat1#232"
        ],
        "notas": "Regra de resposta: escolher, de entre as opções, a banda de amador imediatamente ABAIXO da MUF. MUF = 22 MHz → 21 MHz (cat1#230); MUF = 16 MHz → 14 MHz (cat1#231). O 0,85 é o valor teórico da FOT e pode cair entre bandas — não o uses para descartar a banda mais próxima da MUF. Descer mais só acrescenta absorção na camada D (cat1#232)."
      },
      {
        "key": "janela-luf-muf",
        "nome": "Janela de comunicação em HF (LUF–MUF)",
        "latex": "\\mathrm{LUF} < f_{\\text{trabalho}} < \\mathrm{MUF} \\qquad \\mathrm{LUF} > \\mathrm{MUF} \\Rightarrow \\text{sem ligação}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "\\mathrm{LUF}",
            "significado": "frequência mínima utilizável (Lowest Usable Frequency)",
            "unidade": "MHz"
          },
          {
            "simbolo": "\\mathrm{MUF}",
            "significado": "frequência máxima utilizável",
            "unidade": "MHz"
          },
          {
            "simbolo": "f_{\\text{trabalho}}",
            "significado": "frequência de trabalho escolhida",
            "unidade": "MHz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#234",
          "cat1#235",
          "cat1#232"
        ],
        "notas": "Limite superior imposto pela refração (acima da MUF a onda escapa), limite inferior pela absorção na camada D. LUF = «Lowest Usable Frequency» (cat1#234). Se a LUF subir acima da MUF — perturbação ionosférica súbita — a janela fecha e não há ligação em HF nesse percurso (cat1#235)."
      },
      {
        "key": "absorcao-camada-d",
        "nome": "Absorção ionosférica (camada D)",
        "latex": "A \\propto \\frac{1}{f^{2}}",
        "variantes": [
          "2f \\Rightarrow A/4"
        ],
        "variaveis": [
          {
            "simbolo": "A",
            "significado": "absorção sofrida pela onda ao atravessar a camada D",
            "unidade": "dB"
          },
          {
            "simbolo": "f",
            "significado": "frequência de trabalho",
            "unidade": "MHz"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#218",
          "cat1#384",
          "cat1#232",
          "cat1#235"
        ],
        "notas": "Inverso do QUADRADO: duplicar a frequência reduz a absorção a um quarto. Daí a camada D castigar sobretudo abaixo de 10 MHz durante o dia (cat1#218), a absorção ser MÍNIMA junto à MUF (cat1#384) e as bandas baixas abrirem à noite. Não depende da polarização — é o distrator de cat1#384."
      },
      {
        "key": "efeito-doppler",
        "nome": "Desvio de Doppler",
        "latex": "\\Delta f = \\frac{v}{c}\\,f",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "\\Delta f",
            "significado": "desvio de frequência observado",
            "unidade": "Hz"
          },
          {
            "simbolo": "v",
            "significado": "velocidade radial do satélite em relação à estação",
            "unidade": "m/s"
          },
          {
            "simbolo": "c",
            "significado": "velocidade da luz",
            "unidade": "m/s"
          },
          {
            "simbolo": "f",
            "significado": "frequência de trabalho",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#407",
          "cat1#228"
        ],
        "notas": "$\\Delta f$ é proporcional a $f$, logo o Doppler é MAIOR em VHF/UHF do que em HF — os distratores de cat2#407 e cat1#228 afirmam o contrário. A verdadeira razão de se usar VHF/UHF para satélite é a ionosfera ser praticamente transparente a essas frequências."
      },
      {
        "key": "atenuacao-chuva-gases",
        "nome": "Atenuação por gases atmosféricos e chuva",
        "latex": "f = 10\\ \\mathrm{GHz} \\Rightarrow \\lambda = \\frac{c}{f} = 3\\ \\mathrm{cm},\\; \\text{a aproximar-se de } d_{\\text{gota}} \\quad\\Rightarrow\\quad \\text{atenuação significativa para } f > 10\\ \\mathrm{GHz}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "\\lambda",
            "significado": "comprimento de onda",
            "unidade": "m"
          },
          {
            "simbolo": "f",
            "significado": "frequência",
            "unidade": "Hz"
          },
          {
            "simbolo": "d_{\\text{gota}}",
            "significado": "diâmetro das gotas de chuva (alguns milímetros)",
            "unidade": "mm"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#221"
        ],
        "notas": "O limiar a decorar é 10 GHz (λ = 3 cm, já comparável às gotas) — é a opção certa de cat1#221. Riscas de absorção molecular: vapor de água ≈ 22 GHz, oxigénio ≈ 60 GHz. Abaixo de 1 GHz o efeito é irrelevante."
      },
      {
        "key": "perda-eme",
        "nome": "Perda de percurso numa ligação por reflexão lunar (EME)",
        "latex": "L \\propto d^{4} \\qquad \\Delta L\\,[\\mathrm{dB}] = 40\\log_{10}\\frac{d_2}{d_1}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "L",
            "significado": "perda total do percurso Terra–Lua–Terra",
            "unidade": "adimensional (ou dB)"
          },
          {
            "simbolo": "d",
            "significado": "distância Terra–Lua",
            "unidade": "km"
          },
          {
            "simbolo": "\\Delta L",
            "significado": "diferença de perda entre duas distâncias",
            "unidade": "dB"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#393"
        ],
        "notas": "Fator 40 e não 20: o sinal percorre o trajeto duas vezes. Perigeu ≈ 356 000 km, apogeu ≈ 406 000 km → $40\\log_{10}(406/356) \\approx 2$ dB a favor do perigeu (cat1#393). A fase da Lua não entra na conta."
      }
    ],
    "tabelas": [
      {
        "key": "camadas-ionosfera",
        "nome": "Camadas da ionosfera: altitude e comportamento",
        "colunas": [
          "Camada",
          "Altitude",
          "Comportamento"
        ],
        "linhas": [
          [
            "D",
            "60 – 90 km",
            "Só de dia; absorve (não reflete), sobretudo abaixo de 10 MHz; absorção $\\propto 1/f^{2}$; desaparece ao pôr do sol"
          ],
          [
            "E",
            "90 – 125 km",
            "Refrata a distâncias médias; frequência crítica foE; desaparece quase toda à noite"
          ],
          [
            "E esporádica (Es)",
            "90 – 120 km",
            "Nuvens finas e intensas de ionização (iões metálicos de meteoros + cisalhamento de ventos), mais frequentes no verão; abre 50 MHz e por vezes 144 MHz"
          ],
          [
            "F1",
            "≈ 150 – 250 km",
            "Só de dia; funde-se com a F2 à noite"
          ],
          [
            "F2",
            "250 – 400 km",
            "A mais alta e mais ionizada; principal responsável pelo DX em HF; frequência crítica foF2"
          ]
        ],
        "notas": [
          "A ionosfera estende-se de ≈ 60 a ≈ 400 km e é formada por camadas de gases ionizados pela radiação solar. De baixo para cima, a mais próxima da Terra é a D; as três habitualmente consideradas são D, E e F, e a E fica abaixo da F.",
          "A ionização muda com a hora, a estação e o ciclo solar de 11 anos — daí o desvanecimento e o desaparecimento de uma ligação de uma hora para a outra (cat2#222)."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#225",
          "cat1#218",
          "cat2#227",
          "cat2#224",
          "cat2#222",
          "cat1#217"
        ]
      },
      {
        "key": "saltos-e-zona-de-silencio",
        "nome": "Distâncias por salto, NVIS e zona de silêncio",
        "colunas": [],
        "linhas": [],
        "notas": [
          "Salto único pela camada E / Es: até ≈ 2000 km",
          "Salto único pela camada F2: ≈ 3000 a 4000 km",
          "Ângulo crítico: o maior ângulo de partida que ainda devolve a onda à Terra nas condições ionosféricas do momento; acima dele a onda escapa",
          "NVIS (*Near Vertical Incidence Skywave*): incidência quase vertical (elevação próxima de 90°), cobertura de algumas centenas de km à volta do emissor; exige frequência abaixo da frequência crítica, na prática ≈ 2 a 10 MHz, com antenas horizontais montadas baixas",
          "Zona de silêncio (*skip zone*): anel entre o limite da onda terrestre e o regresso do primeiro salto; é aí que atuam o NVIS e a dispersão (*scatter*) em HF — cuja distorção vem justamente de a energia chegar por vários percursos",
          "Quanto mais longo o percurso, mais rasante a incidência e maior a MUF (lei da secante)."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#237",
          "cat1#238",
          "cat1#282",
          "cat1#217"
        ]
      },
      {
        "key": "faixas-e-modos-de-propagacao",
        "nome": "Faixas de frequência e modo de propagação dominante",
        "colunas": [
          "Designação",
          "Gama",
          "Propagação dominante"
        ],
        "linhas": [
          [
            "MF (onda média)",
            "300 kHz – 3 MHz",
            "Onda de superfície de dia, ionosférica à noite"
          ],
          [
            "HF (onda curta)",
            "3 – 30 MHz",
            "Onda ionosférica (*sky wave*), DX mundial pela camada F"
          ],
          [
            "VHF",
            "30 – 300 MHz",
            "Linha de vista, E esporádica, ducto troposférico"
          ],
          [
            "UHF",
            "300 MHz – 3 GHz",
            "Linha de vista, reflexões urbanas, satélite"
          ]
        ],
        "notas": [
          "As comunicações a longa distância fazem-se em HF (cat3#112), e é aí que a reflexão ionosférica conta (cat3#113)",
          "É falso que a onda curta sirva apenas para linha de vista (cat3#118): é precisamente o contrário",
          "VHF/UHF não fazem DX ionosférico porque, em geral, não se refletem na ionosfera (cat2#267, cat2#268) — e é essa transparência que os torna próprios para satélite (cat1#228)",
          "Para distâncias curtas usam-se VHF e UHF"
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#112",
          "cat2#267",
          "cat1#228",
          "cat3#113",
          "cat3#118",
          "cat2#268"
        ]
      },
      {
        "key": "anomalias-e-efeitos-vhf-uhf",
        "nome": "Anomalias de propagação e efeitos na receção",
        "colunas": [],
        "linhas": [],
        "notas": [
          "Dispersão por meteoros: 28 – 148 MHz (topo de HF e VHF baixo)",
          "VHF de muito longe = quase sempre E esporádica, não reflexão no espaço nem em tempestades",
          "Ducto troposférico: inversão de temperatura, condição de propagação troposférica pouco comum, típica de VHF/UHF sobre o mar",
          "Desvanecimento (*fading*): variação no tempo do nível recebido com a potência emitida constante; típico da propagação ionosférica",
          "Multipercurso: em UHF ($\\lambda \\approx 70$ cm) basta deslocar-se uns metros para sair de um nulo — é a razão de um sinal ficar de repente fraco e distorcido",
          "Sinais de UHF propagam-se melhor no interior de edifícios e em áreas urbanas do que os de VHF: o menor comprimento de onda passa mais facilmente por portas, janelas e outras aberturas e reflete-se dentro dos espaços"
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#219",
          "cat1#233",
          "cat2#216",
          "cat2#228",
          "cat2#220",
          "cat2#218"
        ]
      }
    ]
  },
  {
    "id": "medidas-seguranca",
    "titulo": "Medidas, instrumentos e segurança",
    "intro": "Reúne o que o exame pede sobre instrumentos de medida (osciloscópio, frequencímetro, voltímetro, amperímetro, analisador espectral), sobre decibéis e campos radiados, e sobre segurança — descarga dos condensadores de filtragem, blindagem e exposição da população a campos eletromagnéticos. A notação é uniforme: $U$ para tensão, $I$ para corrente, $R$ para resistência.",
    "formulas": [
      {
        "key": "constante-de-tempo-rc",
        "nome": "Constante de tempo e descarga do condensador (resistência de drenagem)",
        "latex": "\\tau = R\\,C \\qquad u(t) = U_{0}\\,e^{-t/\\tau}",
        "variantes": [
          "t \\approx 5\\,\\tau \\ \\Rightarrow\\ u < 1\\%\\,U_{0}"
        ],
        "variaveis": [
          {
            "simbolo": "\\tau",
            "significado": "constante de tempo do circuito de descarga",
            "unidade": "s"
          },
          {
            "simbolo": "R",
            "significado": "resistência de drenagem (bleeder)",
            "unidade": "Ω"
          },
          {
            "simbolo": "C",
            "significado": "capacidade do condensador de filtragem",
            "unidade": "F"
          },
          {
            "simbolo": "U_{0}",
            "significado": "tensão inicial aos terminais do condensador",
            "unidade": "V"
          },
          {
            "simbolo": "u(t)",
            "significado": "tensão residual ao fim do tempo $t$",
            "unidade": "V"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#151",
          "cat1#104"
        ],
        "notas": "A resistência de drenagem existe para descarregar o condensador de filtragem — não é fusível, não protege de f.e.m. induzidas em bobinas nem elimina malhas de terra. Sem ela a alta tensão mantém-se minutos ou horas depois de desligar. Ao fim de $5\\tau$ resta menos de 1 % ($e^{-5} \\approx 0{,}7\\%$). Compromisso: $R$ menor descarrega mais depressa mas dissipa $U^{2}/R$ em permanência."
      },
      {
        "key": "divisor-tensao-efeito-de-carga",
        "nome": "Divisor de tensão e efeito de carga do voltímetro",
        "latex": "U_{2} = U\\,\\frac{R_{2}}{R_{1}+R_{2}} \\qquad U_{\\text{lida}} = U_{2}\\,\\frac{R_{v}}{R_{v}+R_{eq}}",
        "variantes": [
          "R_{eq} = R_{1}\\parallel R_{2} = \\dfrac{R_{1}R_{2}}{R_{1}+R_{2}}",
          "\\varepsilon = \\dfrac{R_{eq}}{R_{v}+R_{eq}} \\quad (\\text{erro relativo de carga})",
          "U_{2}' = U\\,\\dfrac{R_{2}\\parallel R_{v}}{R_{1}+\\left(R_{2}\\parallel R_{v}\\right)}"
        ],
        "variaveis": [
          {
            "simbolo": "U",
            "significado": "tensão aplicada ao divisor",
            "unidade": "V"
          },
          {
            "simbolo": "U_{2}",
            "significado": "tensão real em $R_2$, sem instrumento ligado",
            "unidade": "V"
          },
          {
            "simbolo": "U_{\\text{lida}}",
            "significado": "tensão efetivamente indicada pelo aparelho",
            "unidade": "V"
          },
          {
            "simbolo": "R_{1},\\,R_{2}",
            "significado": "resistências do divisor",
            "unidade": "Ω"
          },
          {
            "simbolo": "R_{v}",
            "significado": "impedância de entrada do voltímetro",
            "unidade": "Ω"
          },
          {
            "simbolo": "R_{eq}",
            "significado": "resistência equivalente de Thévenin vista do ponto de medida (no divisor, $R_1 \\parallel R_2$)",
            "unidade": "Ω"
          },
          {
            "simbolo": "\\varepsilon",
            "significado": "erro relativo por efeito de carga (×100 para %)",
            "unidade": "—"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#240",
          "cat1#245",
          "cat2#339"
        ],
        "notas": "Atenção ao que entra na segunda fórmula: o que o voltímetro divide é a tensão VERDADEIRA do ponto ($U_2$), não a tensão de entrada $U$, e a resistência que lhe faz frente é a de Thévenin do circuito ($R_1 \\parallel R_2$), não $R_1$ nem $R_2$ isoladas. O voltímetro liga-se em paralelo e passa a ser mais um ramo, pelo que a leitura é sempre INFERIOR à real, nunca superior. O erro só tende para zero com $R_v \\gg R_{eq}$ — daí os 10 MΩ dos multímetros digitais. Com $R_v = R_{eq}$ o erro é de 50 %; $R_{eq} = 1$ MΩ medido com 10 MΩ dá ~9 %. A qualidade essencial de um bom voltímetro é a impedância de entrada, não a resolução nem a resposta em frequência."
      },
      {
        "key": "erro-de-insercao-do-amperimetro",
        "nome": "Erro de inserção do amperímetro",
        "latex": "\\varepsilon = \\frac{R_{a}}{R_{a}+R}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "\\varepsilon",
            "significado": "erro relativo introduzido pelo aparelho (×100 para %)",
            "unidade": "—"
          },
          {
            "simbolo": "R_{a}",
            "significado": "impedância interna do amperímetro",
            "unidade": "Ω"
          },
          {
            "simbolo": "R",
            "significado": "resistência do ramo onde o aparelho é inserido",
            "unidade": "Ω"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#374"
        ],
        "notas": "Simétrico exato do voltímetro: o amperímetro liga-se em série, acrescenta resistência ao ramo e faz baixar a corrente que pretende medir. Regra a decorar — voltímetro em paralelo, $Z \\to \\infty$; amperímetro em série, $Z \\to 0$."
      },
      {
        "key": "erro-relativo-e-ppm",
        "nome": "Erro relativo e partes por milhão (ppm)",
        "latex": "\\delta = \\frac{\\Delta X}{X} \\qquad \\Delta f = f \\times \\frac{\\text{ppm}}{10^{6}}",
        "variantes": [
          "N_{\\text{ppm}} = \\delta \\times 10^{6}",
          "1\\ \\text{ppm} = 10^{-6} = 1\\ \\text{Hz por cada MHz}"
        ],
        "variaveis": [
          {
            "simbolo": "\\delta",
            "significado": "erro relativo (×100 para %)",
            "unidade": "—"
          },
          {
            "simbolo": "\\Delta X",
            "significado": "desvio entre o valor lido e o valor verdadeiro",
            "unidade": "unidade de $X$"
          },
          {
            "simbolo": "X",
            "significado": "valor verdadeiro da grandeza",
            "unidade": "unidade de $X$"
          },
          {
            "simbolo": "\\Delta f",
            "significado": "erro máximo de frequência",
            "unidade": "Hz"
          },
          {
            "simbolo": "f",
            "significado": "frequência lida",
            "unidade": "Hz"
          },
          {
            "simbolo": "N_{\\text{ppm}}",
            "significado": "precisão do instrumento em partes por milhão",
            "unidade": "ppm"
          }
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#277",
          "cat1#244"
        ],
        "notas": "Atalho: 1 ppm = 1 Hz de erro por cada MHz, logo $\\Delta f$ em Hz = $f$ em MHz × ppm. A ±0,1 ppm, 146,52 MHz dá 146,52 × 0,1 = 14,652 Hz — os distratores são o mesmo algarismo com potências de dez diferentes, por isso conte as casas. Ordens de grandeza: voltímetro analógico alguns %, digital frações de % (sem paralaxe), frequencímetro a cristal na ordem das ppm."
      },
      {
        "key": "frequencimetro-contagem",
        "nome": "Frequencímetro: contagem de ciclos e resolução",
        "latex": "f = \\frac{N}{\\tau} \\qquad \\Delta f_{\\text{res}} = \\frac{1}{\\tau}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "f",
            "significado": "frequência do sinal",
            "unidade": "Hz"
          },
          {
            "simbolo": "N",
            "significado": "número de ciclos contados na janela",
            "unidade": "—"
          },
          {
            "simbolo": "\\tau",
            "significado": "duração da janela da base de tempo",
            "unidade": "s"
          },
          {
            "simbolo": "\\Delta f_{\\text{res}}",
            "significado": "resolução da leitura (incerteza de ±1 na contagem)",
            "unidade": "Hz"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#237",
          "cat2#235"
        ],
        "notas": "A exatidão vem toda da base de tempo (oscilador a cristal), não da contagem: janela de 1 s → resolução de 1 Hz; 10 s → 0,1 Hz. É o instrumento mais preciso para medir frequência; osciloscópio e analisador espectral também a medem, mas com menos rigor, e o ondámetro de absorção só identifica a faixa ou uma harmónica."
      },
      {
        "key": "diferenca-de-fase-no-osciloscopio",
        "nome": "Diferença de fase no osciloscópio",
        "latex": "\\varphi = 360^{\\circ} \\times \\frac{\\Delta t}{T}",
        "variantes": [
          "\\varphi = 2\\pi\\,\\dfrac{\\Delta t}{T} \\ \\ (\\text{rad})",
          "\\operatorname{sen}\\varphi = \\dfrac{y_{0}}{y_{\\max}} \\ \\ (\\text{elipse de Lissajous, modo XY})",
          "\\dfrac{f_{y}}{f_{x}} = \\dfrac{n_{x}}{n_{y}} \\ \\ (\\text{razão de frequências})"
        ],
        "variaveis": [
          {
            "simbolo": "\\varphi",
            "significado": "diferença de fase entre os dois sinais",
            "unidade": "°"
          },
          {
            "simbolo": "\\Delta t",
            "significado": "desvio temporal entre pontos homólogos das duas ondas",
            "unidade": "s"
          },
          {
            "simbolo": "T",
            "significado": "período do sinal",
            "unidade": "s"
          },
          {
            "simbolo": "y_{0}",
            "significado": "interseção da elipse com o eixo vertical",
            "unidade": "div"
          },
          {
            "simbolo": "y_{\\max}",
            "significado": "deflexão vertical máxima da figura",
            "unidade": "div"
          },
          {
            "simbolo": "n_{x}",
            "significado": "tangências da curva aos bordos horizontais (topo e base), iguais a $f_y$",
            "unidade": "—"
          },
          {
            "simbolo": "n_{y}",
            "significado": "tangências da curva aos bordos verticais (lados), iguais a $f_x$",
            "unidade": "—"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#13",
          "cat1#302",
          "cat1#14"
        ],
        "notas": "O instrumento da medida de fase é o osciloscópio de dois canais — não o wattímetro, o frequencímetro nem o medidor de ROE: só ele mostra os dois sinais no domínio do tempo. $\\Delta t = T/4$ → 90°. Em modo XY as figuras chamam-se de Lissajous (não «de Dirac», «de mérito» nem «de Watt»): reta inclinada = 0° ou 180°, circunferência = 90° (só se as amplitudes nos dois canais forem iguais; caso contrário fica uma elipse alinhada com os eixos), e só estabilizam quando a razão entre as duas frequências é uma razão de números inteiros — 3:2 serve, não tem de ser um múltiplo inteiro."
      },
      {
        "key": "atenuacao-para-o-analisador-espectral",
        "nome": "Atenuação necessária à entrada do analisador espectral",
        "latex": "A_{\\text{dB}} = P_{\\text{emissor}}\\,[\\text{dBm}] - P_{\\text{entrada}}\\,[\\text{dBm}]",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "A_{\\text{dB}}",
            "significado": "atenuação a intercalar, num atenuador externo de potência",
            "unidade": "dB"
          },
          {
            "simbolo": "P_{\\text{emissor}}",
            "significado": "nível à saída do emissor",
            "unidade": "dBm"
          },
          {
            "simbolo": "P_{\\text{entrada}}",
            "significado": "nível de medição pretendido no misturador do analisador",
            "unidade": "dBm"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#255"
        ],
        "notas": "A precaução essencial ao ligar um analisador espectral à saída de um emissor é atenuar o sinal — não basta cabo de dupla blindagem nem adaptar impedâncias. 100 W = +50 dBm; para medir a −10 dBm faltam 60 dB, e o atenuador tem de ser externo e capaz de dissipar os 100 W. Acima do nível óptimo o misturador satura e inventa intermodulação; muito acima (típico +30 dBm = 1 W) destrói-se."
      },
      {
        "key": "efetividade-de-blindagem",
        "nome": "Efetividade de blindagem",
        "latex": "S = 20\\,\\log_{10}\\frac{E_{i}}{E_{t}} = 20\\,\\log_{10}\\frac{H_{i}}{H_{t}}",
        "variantes": [
          "S = 10\\,\\log_{10}\\dfrac{P_{i}}{P_{t}} \\ \\ (\\text{em potências})"
        ],
        "variaveis": [
          {
            "simbolo": "S",
            "significado": "efetividade (eficácia) da blindagem",
            "unidade": "dB"
          },
          {
            "simbolo": "E_{i},\\,E_{t}",
            "significado": "campo elétrico incidente e transmitido através da blindagem",
            "unidade": "V/m"
          },
          {
            "simbolo": "H_{i},\\,H_{t}",
            "significado": "campo magnético incidente e transmitido",
            "unidade": "A/m"
          },
          {
            "simbolo": "P_{i},\\,P_{t}",
            "significado": "potência incidente e transmitida",
            "unidade": "W"
          }
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#8",
          "cat1#300",
          "cat1#391",
          "cat1#301"
        ],
        "notas": "É 20 e não 10 porque $E$ e $H$ são amplitudes; a definição é idêntica para os dois campos, muda só a grandeza na razão. Teste para eliminar distratores: sem blindagem $E_i = E_t$, $\\log 1 = 0$, logo $S = 0$ dB — as formas $20+\\log$, $20-\\log$ e $1-\\log$ dariam 20 dB, 20 dB e 1 dB, e falham-no. Campo reduzido a 1/10 → 20 dB; a 1/100 → 40 dB."
      },
      {
        "key": "densidade-de-potencia",
        "nome": "Densidade de potência e p.i.r.e.",
        "latex": "S = \\frac{P\\,G}{4\\pi d^{2}} = \\frac{\\text{p.i.r.e.}}{4\\pi d^{2}}",
        "variantes": [
          "\\text{p.i.r.e.} = P\\,G",
          "\\text{p.i.r.e.}\\,[\\text{dBW}] = P\\,[\\text{dBW}] + G\\,[\\text{dBi}]",
          "S \\propto \\dfrac{1}{d^{2}}"
        ],
        "variaveis": [
          {
            "simbolo": "S",
            "significado": "densidade de potência à distância $d$",
            "unidade": "W/m²"
          },
          {
            "simbolo": "P",
            "significado": "potência entregue à antena",
            "unidade": "W"
          },
          {
            "simbolo": "G",
            "significado": "ganho da antena na direção considerada (linear, isotrópico)",
            "unidade": "—"
          },
          {
            "simbolo": "d",
            "significado": "distância à antena",
            "unidade": "m"
          },
          {
            "simbolo": "\\text{p.i.r.e.}",
            "significado": "potência isotrópica radiada equivalente",
            "unidade": "W"
          }
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#13",
          "cat2#248",
          "cat1#219",
          "cat3#81",
          "cat2#249",
          "cat2#199"
        ],
        "notas": "O $4\\pi d^{2}$ é a área da esfera por onde uma antena isotrópica espalha a potência — daí a lei do inverso do quadrado. Duplicar a distância divide $S$ por 4 (−6 dB): a potência recebida é inversamente proporcional ao QUADRADO da distância, não à distância. Os fatores da exposição da população são exatamente os que aparecem na fórmula (potência, distância, diagrama de radiação, pois $G$ depende da direção), mais a frequência, de que dependem os limites: a resposta certa é sempre «todas as anteriores»."
      },
      {
        "key": "intensidade-de-campo-eletrico",
        "nome": "Intensidade de campo elétrico radiado",
        "latex": "E = \\frac{\\sqrt{30\\,P\\,G}}{d} = \\frac{\\sqrt{30\\,\\text{p.i.r.e.}}}{d} \\qquad S = \\frac{E^{2}}{120\\pi}",
        "variantes": [],
        "variaveis": [
          {
            "simbolo": "E",
            "significado": "intensidade do campo elétrico no campo distante",
            "unidade": "V/m"
          },
          {
            "simbolo": "P",
            "significado": "potência entregue à antena",
            "unidade": "W"
          },
          {
            "simbolo": "G",
            "significado": "ganho isotrópico na direção medida (linear)",
            "unidade": "—"
          },
          {
            "simbolo": "d",
            "significado": "distância à antena",
            "unidade": "m"
          }
        ],
        "categorias": [
          "2"
        ],
        "refs": [
          "cat2#20",
          "cat2#21",
          "cat2#22",
          "cat2#330"
        ],
        "notas": "A intensidade de campo elétrico exprime-se em volt por metro (V/m). Armadilha: fisicamente $E$ cai com $1/d$ (é a densidade de potência que cai com $1/d^{2}$), mas a resposta dada como correta em cat2#22 e cat2#330 é «decresce com o quadrado da distância» — responda o que o enunciado oficial espera. É esta grandeza que um medidor de intensidade de campo lê, e por isso essas medidas avaliam a radiação da antena emissora (levantando mesmo o diagrama), não o ganho, nem a altura, nem a sensibilidade do recetor."
      }
    ],
    "tabelas": [
      {
        "key": "instrumentos-e-ligacoes",
        "nome": "Que instrumento mede o quê, e como se liga",
        "colunas": [
          "Instrumento",
          "Mede",
          "Ligação",
          "Impedância / nível"
        ],
        "linhas": [
          [
            "Voltímetro",
            "tensão",
            "em paralelo com o componente",
            "muito alta (digital ≥ 10 MΩ)"
          ],
          [
            "Amperímetro",
            "corrente",
            "em série, abrindo o circuito",
            "muito baixa (→ 0 Ω)"
          ],
          [
            "Ohmímetro (função do multímetro)",
            "resistência",
            "componente desligado da alimentação",
            "—"
          ],
          [
            "Frequencímetro",
            "frequência, com o maior rigor (ppm)",
            "amostra de RF",
            "—"
          ],
          [
            "Osciloscópio",
            "forma de onda, período ($f = 1/T$), fase, envolvente",
            "ponta de prova, 2 canais; tem amplificadores nos sistemas horizontal e vertical",
            "alta"
          ],
          [
            "Analisador espectral",
            "energia em função da frequência (harmónicas, espúrias)",
            "amostra de RF com atenuador externo",
            "50 Ω; máx. ≈ +30 dBm (1 W), medição a ≈ −10 dBm"
          ],
          [
            "Ondámetro de absorção",
            "frequência, de forma grosseira (circuito LC)",
            "acoplamento por proximidade",
            "—"
          ],
          [
            "Dip-meter",
            "frequência de ressonância de um circuito LC",
            "acoplamento por proximidade",
            "contém um gerador de frequência variável"
          ],
          [
            "Wattímetro direcional / reflectómetro",
            "potência direta e refletida → ROE",
            "intercalado na linha",
            "50 Ω"
          ],
          [
            "Wattímetro de leitura de pico",
            "PEP de um sinal SSB (garante que não se excede a potência máxima)",
            "intercalado na linha",
            "50 Ω"
          ],
          [
            "Medidor de intensidade de campo",
            "campo radiado (V/m), diagrama de radiação",
            "à distância da antena",
            "—"
          ],
          [
            "Medidor de impedância / analisador de antena",
            "impedância, ROE; serve para pré-sintonizar um sintonizador de antena",
            "no lugar do emissor",
            "alvo: 50 Ω resistivos; dispensa fonte externa de RF"
          ],
          [
            "Medidor S",
            "intensidade do sinal recebido",
            "no recetor",
            "—"
          ],
          [
            "Sonda lógica",
            "nível alto/baixo e pulsos num circuito digital",
            "encostada ao ponto",
            "alta"
          ],
          [
            "Ponte de Wheatstone",
            "resistência, por comparação ($R_x = R_3\\,R_2/R_1$)",
            "circuito parado, corrente contínua",
            "—"
          ]
        ],
        "notas": [
          "Regra de ouro: o instrumento nunca deve alterar aquilo que mede — o voltímetro não deve desviar corrente, o amperímetro não deve acrescentar resistência.",
          "Digital vs. analógico: o digital ganha em precisão (frações de %, sem paralaxe) e em impedância de entrada; o analógico ganha em rapidez a acompanhar variações. Não há afinidade especial do digital com RF nem com circuitos de computador.",
          "Ensaio de uma junção PN: medir a tensão base-emissor com um voltímetro — cerca de 0,6 a 0,7 V no silício (0,2 a 0,3 V no germânio). Não se mede com ohmímetro «0,6 a 0,7 Ω»: uma junção é não linear e não tem resistência fixa. 6 a 7 V já seria rutura inversa.",
          "Não é mensurável diretamente: a potência aparente radiada (p.a.r.) — nenhum equipamento a lê de forma direta; calcula-se a partir da potência de saída do emissor, das perdas da linha de transmissão e do ganho da antena."
        ],
        "categorias": [
          "2",
          "1"
        ],
        "refs": [
          "cat2#235",
          "cat1#57",
          "cat2#237",
          "cat2#278",
          "cat2#232",
          "cat1#249"
        ]
      },
      {
        "key": "regra-das-aberturas-de-blindagem",
        "nome": "Blindagem: regra das aberturas e ligação à terra",
        "colunas": [],
        "linhas": [],
        "notas": [
          "Uma malha ou caixa perfurada só blinda eficazmente se as aberturas forem muito menores do que o comprimento de onda a atenuar — na prática $< \\lambda/10$, e preferencialmente $< \\lambda/20$. Com $\\lambda\\,[\\text{m}] = 300/f\\,[\\text{MHz}]$: a 435 MHz ($\\lambda \\approx 0{,}69$ m) a abertura deve ficar abaixo de ~7 cm; a 10 GHz ($\\lambda = 3$ cm) já tem de ser milimétrica.",
          "A blindagem a campos elétricos só é eficiente com um caminho de baixa impedância para a terra — uma blindagem flutuante acopla capacitivamente e pode piorar a situação. Materiais isolantes ou semicondutores não blindam.",
          "A blindagem a campos magnéticos de baixa frequência exige permeabilidade elevada (mu-metal); para o campo elétrico basta um bom condutor ligado à terra.",
          "Atua por reflexão e absorção (nunca por «efeito de túnel»); a atenuação por absorção cresce com a espessura atravessada.",
          "Uma gaiola de Faraday protege de campos eletromagnéticos — não de ondas sonoras nem de sismos."
        ],
        "categorias": [
          "1"
        ],
        "refs": [
          "cat1#5",
          "cat1#7",
          "cat1#10",
          "cat1#8",
          "cat1#391"
        ]
      },
      {
        "key": "exposicao-a-campos-eletromagneticos",
        "nome": "Exposição da população a campos eletromagnéticos",
        "colunas": [],
        "linhas": [],
        "notas": [
          "Fatores que determinam a exposição junto de uma estação de amador — contam todos, e a resposta é sempre «todas as anteriores»:",
          "Potência emitida — $S$ e $E$ crescem com a potência;",
          "Frequência — os limites de referência dependem dela;",
          "Distância às antenas — $S \\propto 1/d^{2}$ (duplicar a distância reduz a densidade de potência a um quarto);",
          "Diagrama de radiação das antenas — o ganho depende da direção; o lóbulo principal expõe muito mais do que as costas ou o que está por baixo.",
          "Na prática juntam-se ainda o ciclo de funcionamento (relação emissão/receção) e o modo de emissão.",
          "Regulamentação: é obrigatória a sinalização das estações individuais de amador no âmbito da proteção da população a campos eletromagnéticos (Decreto-Lei n.º 53/2009, art.º 13.º) — em todas as faixas, não só em HF nem só acima de 1 GHz. Já à pergunta «é obrigatória a identificação das estações individuais de amador?» a resposta dada como correta nas provas é não — é o par de perguntas quase idênticas em que se trocam as respostas."
        ],
        "categorias": [
          "3",
          "2"
        ],
        "refs": [
          "cat3#81",
          "cat2#248",
          "cat2#249",
          "cat2#250",
          "cat2#251"
        ]
      },
      {
        "key": "seguranca-eletrica-na-estacao",
        "nome": "Segurança elétrica na estação",
        "colunas": [
          "Condutor",
          "Cor (norma em vigor)"
        ],
        "linhas": [
          [
            "Terra",
            "verde e amarelo"
          ],
          [
            "Neutro",
            "azul"
          ],
          [
            "Fase",
            "castanho, preto ou cinzento"
          ]
        ],
        "notas": [
          "Fusível: serve para interromper a energia em caso de sobrecarga — não garante que a energia chegue, não evita interferências na TV nem previne choques.",
          "Resistência de drenagem: descarrega o condensador de filtragem depois de desligar a fonte ($\\tau = RC$; menos de 1 % ao fim de $5\\tau$). Sem ela a alta tensão persiste minutos ou horas.",
          "Bateria de chumbo-ácido: liberta hidrogénio explosivo ao ser carregada — carregar em local ventilado.",
          "Trovoada: desligar os cabos de antena e afastá-los dos equipamentos, retirar as fichas das tomadas e não operar a estação — todas as precauções, em conjunto.",
          "Mãos molhadas aumentam o risco de eletrocussão; condutores «à vista» num ferro de soldar dão origem a choque elétrico e curto-circuito.",
          "Bancadas com disjuntores dedicados, verificação de polaridades em baterias e superfícies isolantes são cuidados relevantes; usar máscara no nariz e na boca não é uma medida de segurança elétrica."
        ],
        "categorias": [
          "3",
          "2",
          "1"
        ],
        "refs": [
          "cat3#8",
          "cat2#287",
          "cat1#104",
          "cat3#102",
          "cat2#11",
          "cat2#413"
        ]
      }
    ]
  }
];
