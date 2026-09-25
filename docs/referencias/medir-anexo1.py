"""Mede a cobertura dos guias contra o Anexo 1 da ANACOM.

O Anexo 1 é a autoridade nacional: uma tabela item a item com uma coluna por
categoria e um X na categoria mais baixa que exige a matéria (cumulativa para
cima, porque a progressão é 3 -> 2 -> 1). Os documentos da CEPT ficam como
contexto: só por eles teríamos de inferir que cat 1 = HAREC e cat 2 = Novice.

    python3 docs/referencias/medir-anexo1.py            # resumo
    python3 docs/referencias/medir-anexo1.py --faltas   # itens sem sinal

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
    ('9.4', 'b'): 'entidades: «Os planos de frequências da IARU»',
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
    """(capítulo, subcapítulo, alínea, texto, categoria mínima) por item."""
    text = subprocess.run(['pdftotext', '-layout', str(PDF), '-'],
                          capture_output=True, text=True, check=True).stdout
    items, chapter, sub = [], '', ''
    for page in text.split('\f'):
        header = next((l for l in page.split('\n') if 'Cat. 1' in l), None)
        if not header:
            continue
        cols = {c: header.find(f'Cat. {c}') for c in (1, 2, 3)}
        for line in page.split('\n'):
            if m := re.match(r'\s*(\d+)\s+([A-ZÁÂÃÉÊÍÓÔÕÚÇ][^a-z]*)$', line):
                chapter = f'{m.group(1)} {m.group(2).strip().title()}'
            if m := re.match(r'\s*(\d+\.\d+)\s+(\S.*?)\s*(?:\(ver nota.*)?$', line):
                sub = f'{m.group(1)} {m.group(2).strip()}'
            if not (m := re.match(r'\s*([a-z])\)\s+(\S.*)$', line)):
                continue
            xs = [i for i, ch in enumerate(line) if ch == 'X']
            if not xs:
                continue
            # a coluna mais à direita que o X alcança é a categoria mais baixa
            cat = min((abs(pos - x), str(c)) for x in xs for c, pos in cols.items())[1]
            body = re.sub(r'\s+', ' ', m.group(2)).strip(' X')
            items.append((chapter, sub, m.group(1), body, cat))
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
