"""Mede a cobertura dos guias contra o Anexo 1 da ANACOM.

O Anexo 1 é a autoridade nacional: uma tabela item a item com uma coluna por
categoria e um X na categoria mais baixa que exige a matéria (cumulativa para
cima, porque a progressão é 3 -> 2 -> 1). Os documentos da CEPT ficam como
contexto: só por eles teríamos de inferir que cat 1 = HAREC e cat 2 = Novice.

    python3 docs/referencias/medir-anexo1.py            # resumo
    python3 docs/referencias/medir-anexo1.py --faltas   # itens sem sinal
    python3 docs/referencias/medir-anexo1.py --itens    # a tabela toda, uma linha por item

Precisa do PDF nesta pasta e de `pdftotext` (poppler). A sonda é de palavras,
não de sentido: confirme à mão tudo o que aparecer como falta.
"""
import pathlib, re, subprocess, sys, unicodedata

PDF = pathlib.Path(__file__).with_name('anacom-anexo1-materias-exame.pdf')
GUIDES = pathlib.Path(__file__).resolve().parents[2] / 'app' / 'aprender'
ORDER = ['3', '2', '1']          # da mais baixa para a mais alta
# Itens que a sonda não apanha e que foram confirmados à mão: o guia cobre a
# matéria com outras palavras. Chave: subcapítulo + alínea.
VERIFICADOS = {
    ('9.3', 'd'): 'interferencias: «Separação das antenas de emissão e de TV»',
    ('9.3', 'f'): 'interferencias: TVI, BCI e entrada de antena do receptor',
    ('6', 'b'): 'entidades: «Os planos de frequências da IARU»',
    ('4.4', 'h'): 'malha-de-captura-de-fase: ruído de fase e mistura recíproca',
    ('1.9', 'f'): 'amplificadores-e-classes e banda-lateral-unica: potência de pico',
}

STOP = set('para pela pelo com sem dos das que uma uns umas seus suas nos nas '
           'este esta isto aos são ser sua seu por entre sobre como tipo tipos '
           'utilizacao aplicacao funcionamento caracteristicas conhecimento'.split())


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def parse_annex():
    """(capítulo, subcapítulo, alínea, texto, categoria mínima) por item.

    A tabela do PDF tem células que ocupam várias linhas e alinham o X pelo meio
    vertical, pelo que a alínea, o seu texto e a sua cruz podem estar em linhas
    diferentes. Ler linha a linha perdia itens inteiros em silêncio: o 1.6 b),
    «valor instantâneo, valor médio, amplitude e valor eficaz», que é matéria de
    categoria 3, nunca chegou a entrar na contagem. Por isso lê-se por blocos:
    da linha de uma alínea até à seguinte, com uma espreitadela à linha de cima
    para o caso de o texto começar acima da alínea.
    """
    text = subprocess.run(['pdftotext', '-layout', str(PDF), '-'],
                          capture_output=True, text=True, check=True).stdout
    items, chapter, sub = [], '', ''

    def flush(block, cols, chapter, sub, letter):
        """Fecha um item: a cruz manda, o texto é o que sobra."""
        xs = [(i, len(line)) for line in block for i, ch in enumerate(line) if ch == 'X']
        if not xs:
            return None
        cat = min((abs(pos - x), str(c)) for x, _ in xs for c, pos in cols.items())[1]
        body = ' '.join(re.sub(r'\s+', ' ', l).strip(' X') for l in block)
        body = re.sub(r'\s+', ' ', body).strip()
        return (chapter, sub, letter, body, cat)

    for page in text.split('\f'):
        lines = page.split('\n')
        header = next((l for l in lines if 'Cat. 1' in l), None)
        if not header:
            continue
        cols = {c: header.find(f'Cat. {c}') for c in (1, 2, 3)}

        letter, block = None, []
        for n, line in enumerate(lines):
            head = re.sub(r'\(ver nota.*', '', line).rstrip()

            is_new = bool(re.match(r'\s*[a-z]\)', line))
            is_head = bool(
                re.match(r'\s*\d+\.\d+\s+\S', head)
                or re.match(r'\s*\d+\.?\s+[A-ZÁÂÃÉÊÍÓÔÕÚÇ][A-ZÁÂÃÉÊÍÓÔÕÚÇ \-/,\.]*$', head)
                or re.match(r'\s*\d+\.\s*$', head)
            )

            if (is_new or is_head) and letter:
                if item := flush(block, cols, chapter, sub, letter):
                    items.append(item)
                letter, block = None, []

            # Um capítulo pode vir invertido, com o número sozinho numa linha e o
            # título na anterior («PLANOS DE FAIXAS ... / 6.»).
            if re.match(r'\s*\d+\.\s*$', head) and n > 0:
                title = re.sub(r'\(ver nota.*', '', lines[n - 1]).strip()
                letters = [c for c in title if c.isalpha()]
                caps = sum(1 for c in letters if c.isupper())
                if len(letters) > 4 and caps / len(letters) > 0.8:
                    chapter = sub = f"{head.strip().rstrip('.')} {title.title()}"
                    continue
            if m := re.match(r'\s*(\d+)\.?\s+([A-ZÁÂÃÉÊÍÓÔÕÚÇ][A-ZÁÂÃÉÊÍÓÔÕÚÇ \-/,\.]*)$', head):
                chapter = sub = f'{m.group(1)} {m.group(2).strip().title()}'
                continue
            if m := re.match(r'\s*(\d+\.\d+)\s+(\S.*?)\s*$', head):
                sub = f'{m.group(1)} {m.group(2).strip()}'
                continue

            if is_new:
                letter = re.match(r'\s*([a-z])\)', line).group(1)
                block = [line[line.index(')') + 1:]]
                # Texto que começa na linha acima da alínea (célula centrada).
                if not block[0].strip(' X'):
                    prev = lines[n - 1] if n else ''
                    if prev.strip() and not re.match(r'\s*([a-z]\)|\d)', prev):
                        block.insert(0, prev)
            elif letter is not None:
                block.append(line)

        if letter and (item := flush(block, cols, chapter, sub, letter)):
            items.append(item)

    return items


def guide_corpus():
    """Texto dos guias, por categoria declarada na frontmatter."""
    corpus = {c: [] for c in ORDER}
    for f in sorted(GUIDES.glob('*/page.mdx')):
        raw = f.read_text()
        fm = re.match(r'^---\n(.*?)\n---', raw, re.S)
        cats = re.search(r'categories:\s*\[(.*?)\]', fm.group(1) if fm else '')
        for c in (x.strip().strip('"\'') for x in cats.group(1).split(',')) if cats else []:
            if c in corpus:
                corpus[c].append(norm(raw))
    return {c: '\n'.join(v) for c, v in corpus.items()}


def probe_terms(body):
    """As duas palavras mais distintivas do item."""
    words = [w for w in re.findall(r'[a-zà-ú]{5,}', norm(body)) if w not in STOP]
    return sorted(set(words), key=len, reverse=True)[:2]


def main():
    items = parse_annex()

    if '--itens' in sys.argv:
        # Uma linha por item, para procurar por assunto: a numeração do Anexo 1 é
        # a do HAREC e a dos guias é a do Novice, por isso casar por número dá
        # asneira e o casamento tem de ser pelo texto.
        for chapter, sub, letter, body, cat in items:
            print(f'cat{cat} | {chapter[:28]:30} | {sub[:34]:36} | {letter}) {body}')
        return

    corpus = guide_corpus()
    required = {c: [i for i in items if ORDER.index(i[4]) <= ORDER.index(c)] for c in ORDER}

    print(f'Anexo 1: {len(items)} itens com categoria atribuída\n')
    gaps = {}
    for c in ORDER:
        miss = []
        for chapter, sub, letter, body, _ in required[c]:
            if (sub.split()[0], letter) in VERIFICADOS:
                continue
            terms = probe_terms(body)
            if terms and not any(re.search(rf'\b{t}', corpus[c]) for t in terms):
                miss.append((sub, letter, body, terms))
        gaps[c] = miss
        total = len(required[c])
        print(f'categoria {c}: {total - len(miss)}/{total} itens com sinal nos guias '
              f'({100 * (total - len(miss)) // total}%)')

    print(f'\n{len(VERIFICADOS)} itens confirmados à mão (a sonda falha, o guia cobre):')
    for (sub, letter), onde in VERIFICADOS.items():
        print(f'  {sub} {letter})  {onde}')

    if '--faltas' in sys.argv:
        for c in ORDER:
            if not gaps[c]:
                continue
            print(f'\n--- categoria {c}: {len(gaps[c])} sem sinal ---')
            for sub, letter, body, terms in gaps[c]:
                print(f'  {sub[:34]:36} {letter}) {body[:58]:60} [{", ".join(terms)}]')


if __name__ == '__main__':
    main()
