# Marca

O ficheiro-mestre é `RadioEscola-F.eps` — a folha de marca em vetor, com as
quatro variantes lado a lado. `brand-sheet.svg` é a mesma folha convertida para
SVG (`inkscape RadioEscola-F.eps -o brand-sheet.svg`), que é a forma prática de
a abrir e de extrair peças. **Nenhum dos dois é servido pelo site**; ambos
existem para se poder regenerar tudo o resto.

## Cores

| Uso | Cor |
| --- | --- |
| Tinta (losango, letras, «2019») | `#211d1d` no claro, `#ffffff` no escuro |
| Sinal — antena e resistência (preenchimento) | `#de1e25` |
| Sinal — linhas de terra (traço) | `#ec1d27` |

Os dois vermelhos vêm assim do original: as linhas de terra são traçadas, não
preenchidas, e o desenhador usou um tom ligeiramente diferente. Não são um erro
de conversão — não os unifique sem falar com quem desenhou a marca.

O acento do site continua a ser o âmbar `#f59e0b`. O vermelho da marca vive
apenas dentro do losango.

## O que é gerado a partir daqui

| Ficheiro | O que é |
| --- | --- |
| `components/brand/LogoMark.tsx` | o losango embutido, tinta em `currentColor` |
| `components/brand/LogoWordmark.tsx` | «RÁDIO ESCOLA» embutido, tinta em `currentColor` |
| `public/logo/mark.svg` | losango, tinta escura (fundos claros) |
| `public/logo/mark-on-dark.svg` | losango, tinta branca (fundos escuros) |
| `public/logo/mark-mono.svg` | losango a uma cor só |
| `public/logo/lockup.svg` | losango + «RÁDIO ESCOLA» na horizontal |
| `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png` | ícones do separador e do iOS |
| `public/icons/icon*.svg`, `public/icons/icon*.png` | ícones da PWA, referidos pelo `manifest.webmanifest` |

`LogoMark.tsx` e `LogoWordmark.tsx` são as cópias embutidas, e são as que a
barra de navegação, o rodapé e o menu móvel usam, lado a lado. São embutidas em
vez de servidas como `<img>` porque só assim a tinta pode seguir `currentColor`
— um componente dá o losango preto no tema claro e branco no escuro, sem um
segundo ficheiro para manter sincronizado. Os ficheiros em `public/logo/` são
para tudo o resto (e-mail, apresentações, quem peça o logótipo).

**Porque é que o lockup não se usa inteiro.** O `public/logo/lockup.svg` fixa o
tamanho do wordmark em relação ao losango, e essa proporção não serve uma barra
de 56 px: o losango precisa de `h-10` para o interior se ler, e a essa altura o
wordmark do lockup sai com metade do corpo do texto que substituiu. Separados,
cada um leva a sua altura — na navegação, `h-10` e `h-5`. O
`LogoWordmark.tsx` leva o `viewBox` da caixa envolvente medida do wordmark
dentro do lockup, para não arrastar folga à volta das letras.

## O losango é alto, não quadrado

A proporção é ~1:2. Num ícone quadrado sobra folga nos lados, e por isso os
ícones assentam o losango sobre um quadrado de cantos redondos — sem esse fundo
a marca ficaria minúscula ao lado de outros ícones. `icon-maskable-512.png`
recua o losango para dentro da zona segura de 80%, que é o que o Android corta.

**O quadrado é branco, e a tinta segue-o.** Era `#211d1d`, o que punha o ícone
a desaparecer na barra de separadores escura do Chrome: o quadrado dava
`#211d1d` contra um `#202124`, 1,04:1 de contraste — a mesma cor, na prática.
Em branco dá 16:1 no escuro. O preço é a barra clara, onde o quadrado passa de
12,7:1 para 1,31:1 e deixa de ter aresta própria; o que lá dentro está — o
losango escuro e o vermelho — continua a ler-se contra o branco, que é o que
importa a 16 px. Se algum dia se quiser a aresta de volta no tema claro, é um
filete à volta do quadrado, e isso já é mexer na marca.

Quando se troca o fundo troca-se a tinta com ele, pela tabela de cores acima:
losango, letras e «2019» a `#211d1d` sobre claro, a `#ffffff` sobre escuro. Os
dois vermelhos do sinal não mudam em nenhuma das variantes.

Pela mesma razão, na barra de navegação o losango precisa de mais altura do que
um ícone normal (`h-10` numa barra `h-14`): a `h-8` o interior — o «RE», o
«2019», a resistência — deixa de se ler.
