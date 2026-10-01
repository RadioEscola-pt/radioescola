import pathlib, re, unicodedata, json

def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')

# Guides that declare category 2
guides = {}
for f in sorted(pathlib.Path('app/aprender').glob('*/page.mdx')):
    t = f.read_text()
    m = re.match(r'^---\n(.*?)\n---', t, re.S)
    fm = m.group(1) if m else ''
    cats = re.search(r'categories:\s*\[(.*?)\]', fm)
    cats = [c.strip().strip('"\'') for c in cats.group(1).split(',')] if cats else []
    if '2' in cats:
        guides[f.parent.name] = norm(t)

corpus = '\n'.join(guides.values())

# ERC Report 32, Annex 2. Each item: (id, name, [keyword alternatives])
SYLLABUS = [
 ('1.1', 'Condutividade, Ohm, potencia', ['condutor', 'semicondutor', 'isolador', 'lei de ohm', 'ampere', 'volt', 'watt']),
 ('1.2', 'Fontes de electricidade', ['bateria', 'pilha', 'rede electrica|rede eletrica']),
 ('1.3', 'Ondas de radio', ['ondas electromagneticas|ondas eletromagneticas', 'comprimento de onda', 'polarizacao', 'hertz']),
 ('1.4', 'Sinais audio e digitais', ['sinal audio|sinais audio', 'sinal digital|sinais digitais']),
 ('1.5', 'Sinais modulados', ['modulacao de amplitude|modulacao em amplitude', 'banda lateral unica', 'modulacao de frequencia', 'portadora', 'bandas laterais']),
 ('1.6', 'Potencia DC de entrada e RF de saida', ['potencia de saida', 'potencia de entrada|potencia fornecida|alimentacao']),
 ('2.1', 'Resistencia', ['dissipa', 'codigo de cores', 'em serie', 'em paralelo']),
 ('2.2', 'Condensador', ['farad', 'ceramic', 'electrolitic|eletrolitic', 'variavel']),
 ('2.3', 'Bobina', ['henry']),
 ('2.4', 'Transformadores', ['transformador']),
 ('2.5', 'Diodo', ['rectificador|retificador', 'zener']),
 ('2.6', 'Transistor', ['transistor']),
 ('2.7', 'Circuitos sintonizados', ['circuito sintonizado|circuitos sintonizados', 'tanque|paralelo']),
 ('3.1', 'Filtros', ['passa-baixo', 'passa-alto', 'passa-banda', 'rejeita']),
 ('4.1', 'Tipos de receptor', ['super-heterodino|superheterodino', 'trf']),
 ('4.2', 'Diagramas de blocos (A1A, A3E, J3E, F3E)', ['a1a', 'a3e', 'j3e', 'f3e']),
 ('4.3', 'Andares do receptor', ['misturador', 'frequencia intermedia', 'detector|detetor', 'bfo', 'squelch', 'amplificador de']),
 ('5.1', 'Diagramas de blocos do emissor', ['emissor de cw|cw \\(a1a\\)', 'ssb', 'fm']),
 ('5.2', 'Andares do emissor', ['oscilador', 'separador|buffer', 'excitador|driver', 'multiplicador', 'amplificador de potencia', 'filtro de saida|filtro em pi|filtro pi', 'modulador']),
 ('5.3', 'Caracteristicas do emissor', ['estabilidade', 'largura de banda', 'espuria', 'harmonica']),
 ('6.1', 'Tipos de antena e potencia radiada', ['dipolo', 'end-fed|alimentada na extremidade', 'plano de terra|ground plane', 'yagi', 'erp', 'eirp']),
 ('6.2', 'Alimentacao da antena', ['coaxial', 'bifilar|twin|linha de fita|par entrancado']),
 ('6.3', 'Adaptacao', ['adaptacao de impedancia', 'acoplador|atu|caixa de acordo|sintonizador de antena']),
 ('7', 'Espectro e propagacao', ['ionosfer', 'desvanecimento|fading', 'troposfer', 'manchas solares|ciclo solar', 'vhf', 'uhf']),
 ('8.1', 'Grandezas a medir', ['tensao', 'corrente', 'resistencia', 'potencia', 'frequencia']),
 ('8.2', 'Instrumentos de medida', ['multimetro', 'roe|estacionarias', 'ondametro|absorcao', 'carga ficticia|carga artificial']),
 ('9.1', 'Interferencia em equipamentos', ['televis|tv', 'audio']),
 ('9.2', 'Causas da interferencia', ['harmonica', 'espuria', 'radiacao directa|radiacao direta', 'rede']),
 ('9.3', 'Medidas contra a interferencia', ['filtragem|filtro', 'blindagem', 'ligacao a terra|boa terra', 'potencia minima']),
 ('10.1', 'O corpo humano', ['choque']),
 ('10.2', 'Rede electrica', ['fase', 'neutro', 'terra', 'fusive']),
 ('10.3', 'Perigos', ['alta tensao|altas tensoes|tensoes elevadas', 'condensador']),
 ('10.4', 'Trovoadas', ['trovoada|descarga atmosferica|para-raios']),
 ('b1', 'Alfabeto fonetico', ['alpha', 'bravo', 'charlie', 'zulu']),
 ('b2', 'Codigo Q', ['qrk', 'qrm', 'qro', 'qsb', 'qsy', 'qth']),
 ('b3', 'Abreviaturas operacionais', ['\\bbk\\b', '\\bcq\\b', '\\bde\\b', '\\bmsg\\b', '\\bpse\\b', '\\bur\\b']),
 ('b4', 'Indicativos de chamada', ['indicativo', 'prefixo']),
 ('c1', 'Regulamento das Radiocomunicacoes da UIT', ['uit|itu', 'regulamento das radiocomunicacoes']),
 ('c2', 'Regulamentacao CEPT', ['cept']),
 ('c3', 'Lei nacional e condicoes da licenca', ['anacom', 'decreto-lei|lei n']),
]

rows = []
for sid, name, keys in SYLLABUS:
    hits, misses = [], []
    for k in keys:
        (hits if re.search(norm(k), corpus) else misses).append(k)
    # which cat2 guide carries the matching heading number
    owner = [g for g, txt in guides.items() if re.search(rf'^## {re.escape(sid)}[ .]', txt, re.M)]
    rows.append({'id': sid, 'name': name, 'hit': len(hits), 'total': len(keys), 'missing': misses, 'owner': owner})

full = [r for r in rows if not r['missing']]
part = [r for r in rows if r['missing'] and r['hit']]
none = [r for r in rows if not r['hit']]
print(f"guias com categoria 2: {len(guides)}")
print(f"itens do programa: {len(rows)}  |  completos: {len(full)}  parciais: {len(part)}  sem sinal: {len(none)}\n")
for label, group in (('PARCIAIS', part), ('SEM SINAL', none)):
    if group:
        print(f'--- {label} ---')
        for r in group:
            print(f"  {r['id']:5} {r['name']:42} {r['hit']}/{r['total']}  falta: {', '.join(r['missing'])}")
        print()
