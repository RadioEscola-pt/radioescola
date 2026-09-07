/**
 * The self-contained HTML review page for one exam paper: every pergunta of a
 * scanned paper beside the bank question that claims it.
 *
 * Why this exists: `qbank paper` tells you *that* pergunta 27 is cat3#70, but
 * confirming it means opening the PDF at the right page and the MDX in an
 * editor, forty times. What actually needs checking — does the scan's stem and
 * its marked answer match the bank's? — is a visual comparison, so the review
 * wants the scan and the question side by side.
 *
 * The page is deliberately built from the *bank*, never from the OCR text: an
 * intermediate transcription is exactly what a review has to be able to
 * distrust. OCR only decides which questions get flagged as needing an eye.
 *
 * Everything here is pure. Rasterising the PDF and reading the bank is the
 * script's job; this turns the result into a model and the model into a page.
 */
import type { CategoryId } from "../config/categories";
import type { ContentQuestion } from "./schema";
import { auditPapers, bankRef, questionPath, type BankQuestion } from "./analysis";

/** How a question's link to a pergunta was arrived at. */
export type Verification = "ocr" | "manual";

export type ReviewQuestion = {
  /** The pergunta number printed in the paper. */
  question: number;
  /** PDF page it sits on, or null while nobody has resolved it. */
  page: number | null;
  ref: string;
  id: number;
  file: string;
  stem: string;
  topic: string | null;
  answers: { text: string; correct: boolean }[];
  /** Withheld questions still appear — the paper examined them regardless. */
  disabled: string | null;
  verified: Verification;
  note: string | null;
  /** Other refs claiming this same pergunta. Always a defect. */
  collision: string[] | null;
};

export type ReviewModel = {
  pdf: string;
  category: CategoryId;
  questions: ReviewQuestion[];
  /** Pergunta numbers below the highest cited that nothing in the bank claims. */
  gaps: number[];
  counts: { cited: number; ocr: number; manual: number; gaps: number; unpaged: number };
};

export type ReviewInput = {
  pdf: string;
  bank: readonly BankQuestion[];
  /**
   * Which (pergunta, question id) pairs OCR found by itself. Everything else
   * was matched by a person, and is what the review is really for.
   */
  ocrMatched: ReadonlySet<string>;
  /** Optional per-pergunta commentary, keyed by pergunta number. */
  notes?: Readonly<Record<number, string>>;
};

/** The key `ocrMatched` is keyed by, so callers cannot disagree about its shape. */
export function matchKey(question: number, id: number): string {
  return `${question}#${id}`;
}

export function buildReviewModel(input: ReviewInput): ReviewModel {
  const audit = auditPapers(input.bank).find((a) => a.pdf === input.pdf);
  if (!audit) {
    throw new Error(`Nenhuma pergunta do banco cita ${input.pdf}`);
  }

  const category = input.pdf.slice(3, 4) as CategoryId;
  const byRef = new Map(input.bank.map((q) => [q.ref, q]));
  const collisions = new Map(audit.collisions.map((c) => [c.question, c.refs]));

  const questions = audit.cited.map((c): ReviewQuestion => {
    const q = byRef.get(c.ref);
    if (!q) throw new Error(`${c.ref} citado por ${input.pdf} mas ausente do banco`);
    const others = collisions.get(c.question)?.filter((r) => r !== c.ref) ?? [];
    return {
      question: c.question,
      page: c.page,
      ref: c.ref,
      id: q.id,
      file: c.file,
      stem: collapse(q.question),
      topic: q.topic ?? null,
      answers: q.answers.map((a) => ({ text: collapse(a.text), correct: a.correct === true })),
      disabled: q.disabled ?? null,
      verified: input.ocrMatched.has(matchKey(c.question, q.id)) ? "ocr" : "manual",
      note: input.notes?.[c.question] ?? null,
      collision: others.length > 0 ? others : null,
    };
  });

  return {
    pdf: input.pdf,
    category,
    questions,
    gaps: audit.gaps,
    counts: {
      cited: questions.length,
      ocr: questions.filter((q) => q.verified === "ocr").length,
      manual: questions.filter((q) => q.verified === "manual").length,
      gaps: audit.gaps.length,
      unpaged: questions.filter((q) => q.page === null).length,
    },
  };
}

/** Questions grouped by the PDF page they sit on, ascending; unpaged last. */
export function byPage(model: ReviewModel): { page: number | null; questions: ReviewQuestion[] }[] {
  const groups = new Map<number | null, ReviewQuestion[]>();
  for (const q of model.questions) {
    const list = groups.get(q.page);
    if (list) list.push(q);
    else groups.set(q.page, [q]);
  }
  return [...groups.entries()]
    .map(([page, questions]) => ({ page, questions }))
    .sort((a, b) => {
      if (a.page === null) return 1;
      if (b.page === null) return -1;
      return a.page - b.page;
    });
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                   */
/* -------------------------------------------------------------------------- */

export type RenderOptions = {
  /** Page number -> data: URI of the rasterised scan. Missing pages render bare. */
  images: Readonly<Record<number, string>>;
  /** Total pages in the PDF, for the "página 3 de 12" label. */
  pageCount: number;
  /** Written into the footer so the page says where it came from. */
  generatedAt?: string;
};

export function renderReviewPage(model: ReviewModel, options: RenderOptions): string {
  const paper = model.pdf.split("/")[1] ?? model.pdf;
  const title = `Prova cat${model.category} · ${paper.replace(/_/g, "-")}`;
  const payload = json({
    model,
    images: options.images,
    pageCount: options.pageCount,
    groups: byPage(model).map((g) => ({ page: g.page, numbers: g.questions.map((q) => q.question) })),
  });

  return `<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap">
<style>
${STYLES}
</style>

<div class="wrap">
<header class="top">
  <p class="eyebrow">Radioescola · banco de perguntas · categoria ${model.category}</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="lede">As perguntas de <b>public/exams/${escapeHtml(model.pdf)}.pdf</b> ao lado das perguntas do banco que as citam. A digitalização fica encostada à esquerda enquanto percorre as perguntas — confirme que o enunciado e a resposta assinalada batem certo, e vá riscando.</p>
  <div class="stats">
    <div class="stat"><span class="n">${model.counts.cited}</span><span class="l">citadas</span></div>
    <div class="stat ok"><span class="n">${model.counts.ocr}</span><span class="l">confirmadas OCR</span></div>
    <div class="stat attn"><span class="n">${model.counts.manual}</span><span class="l">à mão</span></div>
    <div class="stat gap"><span class="n">${model.counts.gaps}</span><span class="l">por reclamar</span></div>
  </div>
</header>

<div class="controls">
  <div class="seg" role="group" aria-label="Filtrar perguntas">
    <button type="button" data-filter="all" aria-pressed="true">Todas</button>
    <button type="button" data-filter="manual" aria-pressed="false">Só as correspondidas à mão</button>
    <button type="button" data-filter="todo" aria-pressed="false">Por rever</button>
  </div>
  <div class="progress">
    <span id="pcount">0 revistas</span>
    <span class="bar"><i id="pbar"></i></span>
    <button type="button" class="reset" id="reset">limpar</button>
  </div>
</div>

<main id="pages"></main>

<footer>
  <p><b>Como ler os selos.</b> <i>Confirmada OCR</i> quer dizer que <code>bun run data:ocr-exams</code> encontrou esta pergunta na página sozinho; o número, o enunciado e a página batem certo sem intervenção. <i>Correspondida à mão</i> quer dizer que o OCR não a leu — foi uma pessoa que decidiu, e é aí que vale a pena gastar atenção.</p>
  <p class="foot-cmds">No terminal: <code>bun run qbank paper ${escapeHtml(model.pdf)}</code> · uma pergunta: <code>bun run qbank show ${escapeHtml(model.questions[0]?.ref ?? "cat3#1")}</code> · o diff: <code>git diff content/questions/cat${model.category}/</code></p>
  ${options.generatedAt ? `<p class="foot-cmds">Gerado por <code>bun run data:exam-review ${escapeHtml(model.pdf)}</code> em ${escapeHtml(options.generatedAt)}.</p>` : ""}
</footer>
</div>

<div class="lb" id="lb"><button type="button" class="lb-close" id="lbclose">fechar ✕</button><img id="lbimg" alt=""></div>

<script>
const DATA=${payload};
${SCRIPT}
</script>`;
}

function json(value: unknown): string {
  // `</script>` inside a string would end the block; `<` is enough to prevent it.
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Re-exported so the script can name a question file without duplicating the rule. */
export { bankRef, questionPath };
export type { ContentQuestion };

const STYLES = `:root{
  --paper:#F6F7F8; --surface:#FFFFFF; --surface-2:#F0F2F4;
  --ink:#14171A; --ink-2:#4A545C; --ink-3:#78848C;
  --rule:#DFE3E6; --rule-2:#EAEDEF;
  --accent:#17636B; --accent-soft:#E4F0F0;
  --ok:#2F7D46; --ok-soft:#E6F1E9;
  --attn:#8A5800; --attn-soft:#F7EEDD;
  --edit:#A83446; --edit-soft:#F8E7E9;
  --shadow:0 1px 2px rgba(20,23,26,.06),0 4px 14px rgba(20,23,26,.05);
  --mono:"IBM Plex Mono",ui-monospace,"SFMono-Regular",Menlo,monospace;
  --sans:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#0F1214; --surface:#171B1E; --surface-2:#1E2428;
  --ink:#E7EBED; --ink-2:#A6B1B7; --ink-3:#7C888E;
  --rule:#2A3237; --rule-2:#222A2E;
  --accent:#5CB8BE; --accent-soft:#122B2D;
  --ok:#6FBF86; --ok-soft:#14261A;
  --attn:#D7A548; --attn-soft:#2A2114;
  --edit:#E58C99; --edit-soft:#2C1619;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 4px 14px rgba(0,0,0,.3);
}}
:root[data-theme="dark"]{
  --paper:#0F1214; --surface:#171B1E; --surface-2:#1E2428;
  --ink:#E7EBED; --ink-2:#A6B1B7; --ink-3:#7C888E;
  --rule:#2A3237; --rule-2:#222A2E;
  --accent:#5CB8BE; --accent-soft:#122B2D;
  --ok:#6FBF86; --ok-soft:#14261A;
  --attn:#D7A548; --attn-soft:#2A2114;
  --edit:#E58C99; --edit-soft:#2C1619;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 4px 14px rgba(0,0,0,.3);
}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
.wrap{max-width:1400px;margin:0 auto;padding:0 24px 96px}

header.top{padding:44px 0 26px;border-bottom:1px solid var(--rule)}
.eyebrow{font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin:0 0 14px}
h1{font-family:var(--mono);font-weight:600;font-size:clamp(26px,3.6vw,38px);letter-spacing:-.02em;margin:0;text-wrap:balance}
.lede{margin:14px 0 0;max-width:64ch;color:var(--ink-2);font-size:15.5px}
.lede b{color:var(--ink);font-weight:600}

.stats{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.stat{background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:11px 15px;min-width:118px;box-shadow:var(--shadow)}
.stat .n{font-family:var(--mono);font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.15;display:block}
.stat .l{font-size:11.5px;color:var(--ink-3);font-family:var(--mono);letter-spacing:.06em;text-transform:uppercase}
.stat.ok .n{color:var(--ok)} .stat.attn .n{color:var(--attn)} .stat.gap .n{color:var(--edit)}

.controls{position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--paper) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--rule);padding:12px 0;margin-bottom:8px;display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.seg{display:flex;gap:2px;background:var(--surface-2);border:1px solid var(--rule);border-radius:9px;padding:3px}
.seg button{font-family:var(--mono);font-size:12.5px;color:var(--ink-2);background:none;border:0;border-radius:6px;padding:6px 11px;cursor:pointer}
.seg button:hover{color:var(--ink)}
.seg button[aria-pressed="true"]{background:var(--surface);color:var(--accent);box-shadow:var(--shadow);font-weight:500}
.seg button:focus-visible,.tick:focus-visible,.zoom:focus-visible,.reset:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.progress{margin-left:auto;display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:12.5px;color:var(--ink-2);font-variant-numeric:tabular-nums}
.bar{width:120px;height:5px;border-radius:3px;background:var(--rule);overflow:hidden}
.bar i{display:block;height:100%;background:var(--accent);width:100%;transform:scaleX(0);transform-origin:left;transition:transform .25s ease}
@media (prefers-reduced-motion:reduce){.bar i{transition:none}}
.reset{font-family:var(--mono);font-size:12px;color:var(--ink-3);background:none;border:0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.reset:hover{color:var(--ink)}

.page{padding:34px 0;border-bottom:1px solid var(--rule-2)}
.page.hidden{display:none}
.page-grid{display:grid;grid-template-columns:minmax(0,430px) minmax(0,1fr);gap:34px;align-items:start}
.scanwrap{position:sticky;top:74px}
.scan-label{font-family:var(--mono);font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);margin-bottom:9px;display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.zoom{display:block;padding:0;border:1px solid var(--rule);border-radius:10px;overflow:hidden;background:var(--surface);cursor:zoom-in;width:100%;box-shadow:var(--shadow)}
.zoom img{display:block;width:100%;height:auto}
.hint{font-family:var(--mono);font-size:11px;color:var(--ink-3);margin-top:8px}
.noscan{border:1px dashed var(--rule);border-radius:10px;padding:22px;font-family:var(--mono);font-size:12.5px;color:var(--ink-3);background:var(--surface-2)}

.cards{display:flex;flex-direction:column;gap:14px;min-width:0}
.card{background:var(--surface);border:1px solid var(--rule);border-radius:12px;padding:17px 19px;box-shadow:var(--shadow)}
.card.hidden{display:none}
.card.done{opacity:.55}
.card-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-bottom:11px}
.num{font-family:var(--mono);font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;background:var(--surface-2);border:1px solid var(--rule);border-radius:6px;padding:2px 8px}
.ref{font-family:var(--mono);font-size:13px;color:var(--accent);font-weight:500}
.topic{font-family:var(--mono);font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)}
.pill{font-family:var(--mono);font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;border-radius:999px;padding:3px 9px;font-weight:500;border:1px solid transparent}
.pill.ok{background:var(--ok-soft);color:var(--ok);border-color:color-mix(in srgb,var(--ok) 26%,transparent)}
.pill.attn{background:var(--attn-soft);color:var(--attn);border-color:color-mix(in srgb,var(--attn) 30%,transparent)}
.pill.edit{background:var(--edit-soft);color:var(--edit);border-color:color-mix(in srgb,var(--edit) 30%,transparent)}
.tick{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:11.5px;color:var(--ink-3);cursor:pointer;user-select:none;background:none;border:1px solid var(--rule);border-radius:7px;padding:4px 9px}
.tick:hover{color:var(--ink);border-color:var(--ink-3)}
.tick[aria-pressed="true"]{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 36%,transparent);background:var(--ok-soft)}
.stem{margin:0 0 12px;font-size:15.5px;font-weight:500;line-height:1.45;text-wrap:pretty}
ol.opts{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px;counter-reset:o}
ol.opts li{counter-increment:o;display:grid;grid-template-columns:22px 1fr;gap:9px;font-size:14px;color:var(--ink-2);padding:5px 8px;border-radius:7px;line-height:1.45}
ol.opts li::before{content:counter(o);font-family:var(--mono);font-size:12px;color:var(--ink-3);text-align:right;padding-top:1px}
ol.opts li.right{background:var(--ok-soft);color:var(--ink);font-weight:500}
ol.opts li.right::before{content:"✓";color:var(--ok);font-weight:600;text-align:center}
.note,.warn{margin-top:12px;border-radius:8px;padding:10px 12px;font-size:13.5px;color:var(--ink-2)}
.note{background:var(--attn-soft)}
.warn{background:var(--edit-soft)}
.note::before,.warn::before{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
.note::before{content:"porquê esta";color:var(--attn)}
.warn::before{content:"atenção";color:var(--edit)}
.file{margin-top:11px;font-family:var(--mono);font-size:11.5px;color:var(--ink-3);border-top:1px dashed var(--rule);padding-top:9px;overflow-x:auto;white-space:nowrap}

.gaps{padding:30px 0;border-bottom:1px solid var(--rule-2)}
.gaps h2{font-family:var(--mono);font-size:15px;font-weight:600;margin:0 0 8px}
.gaps p{margin:0 0 14px;color:var(--ink-2);max-width:66ch;font-size:14.5px}
.gapnums{display:flex;flex-wrap:wrap;gap:6px}
.gapnums span{font-family:var(--mono);font-size:12.5px;font-variant-numeric:tabular-nums;background:var(--edit-soft);color:var(--edit);border:1px solid color-mix(in srgb,var(--edit) 26%,transparent);border-radius:6px;padding:3px 9px}

footer{padding-top:30px;color:var(--ink-3);font-size:13px;max-width:74ch}
footer b{color:var(--ink-2)}
.foot-cmds{margin-top:14px}
footer code{font-family:var(--mono);font-size:12.5px;color:var(--ink-2);background:var(--surface-2);border:1px solid var(--rule);border-radius:5px;padding:1px 5px}

.lb{position:fixed;inset:0;z-index:100;background:rgba(10,13,15,.86);display:none;padding:22px;overflow:auto}
.lb.open{display:block}
.lb img{display:block;margin:0 auto;max-width:min(1150px,100%);height:auto;border-radius:8px;background:#fff}
.lb-close{position:fixed;top:16px;right:20px;font-family:var(--mono);font-size:13px;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:7px 13px;cursor:pointer}
.lb-close:hover{background:rgba(255,255,255,.24)}

@media (max-width:980px){
  .page-grid{grid-template-columns:1fr;gap:18px}
  .scanwrap{position:static}
  .progress{margin-left:0;width:100%}
}`;

const SCRIPT = String.raw`const KEY="revisao-"+DATA.model.pdf;
const TOTAL=DATA.model.questions.length;
let done=new Set();
try{const s=localStorage.getItem(KEY);if(s)done=new Set(JSON.parse(s));}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify([...done]));}catch(e){}}

const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const byNum=new Map(DATA.model.questions.map(q=>[q.question,q]));

function card(q){
  const pill=q.verified==="ocr"
    ?'<span class="pill ok">confirmada OCR</span>'
    :'<span class="pill attn">correspondida à mão</span>';
  const withheld=q.disabled?'<span class="pill edit">desativada</span>':"";
  return '<article class="card" data-num="'+q.question+'" data-verified="'+q.verified+'">'
    +'<div class="card-head">'
    +'<span class="num">'+q.question+'</span>'
    +'<span class="ref">'+esc(q.ref)+'</span>'
    +(q.topic?'<span class="topic">'+esc(q.topic)+'</span>':"")
    +pill+withheld
    +'<button type="button" class="tick" data-tick="'+q.question+'" aria-pressed="false">revisto</button>'
    +'</div>'
    +'<p class="stem">'+esc(q.stem)+'</p>'
    +'<ol class="opts">'+q.answers.map(a=>'<li class="'+(a.correct?"right":"")+'">'+esc(a.text)+'</li>').join("")+'</ol>'
    +(q.note?'<p class="note">'+esc(q.note)+'</p>':"")
    +(q.collision?'<p class="warn">Outra pergunta do banco reclama este mesmo número: '+esc(q.collision.join(", "))+'. Uma delas está errada.</p>':"")
    +(q.disabled?'<p class="warn">Desativada: '+esc(q.disabled)+'</p>':"")
    +'<p class="file">'+esc(q.file)+'</p>'
    +'</article>';
}

const pages=document.getElementById("pages");
pages.innerHTML=DATA.groups.map(g=>{
  const qs=g.numbers.map(n=>byNum.get(n));
  const label=g.page===null?"Sem página registada":"Página "+g.page+" de "+DATA.pageCount;
  const img=g.page!==null&&DATA.images[g.page];
  const scan=img
    ?'<button type="button" class="zoom" data-img="'+g.page+'" aria-label="Ampliar a página '+g.page+'"><img src="'+DATA.images[g.page]+'" alt="Digitalização da página '+g.page+'"></button><p class="hint">clique para ampliar</p>'
    :'<div class="noscan">Sem digitalização para estas perguntas. Corra <strong>bun run data:ocr-exams '+esc(DATA.model.pdf)+' --apply</strong> para resolver a página, ou <strong>bun run data:fonte-pages</strong> para a indicar à mão.</div>';
  return '<section class="page" data-page="'+g.page+'">'
    +'<div class="page-grid"><div class="scanwrap">'
    +'<div class="scan-label"><span>'+label+'</span><span>perguntas '+g.numbers.join(", ")+'</span></div>'
    +scan+'</div>'
    +'<div class="cards">'+qs.map(card).join("")+'</div>'
    +'</div></section>';
}).join("")
+(DATA.model.gaps.length?'<section class="gaps"><h2>Por reclamar</h2><p>Estes números de pergunta estão abaixo do mais alto que o banco cita, mas nenhuma pergunta os reclama. Ou a prova repete uma pergunta que já lá está sem a citar, ou falta ligá-la.</p><div class="gapnums">'+DATA.model.gaps.map(n=>"<span>"+n+"</span>").join("")+'</div></section>':"");

function paint(){
  document.querySelectorAll("[data-tick]").forEach(b=>{
    const on=done.has(Number(b.dataset.tick));
    b.setAttribute("aria-pressed",on?"true":"false");
    b.textContent=on?"revisto ✓":"revisto";
    b.closest(".card").classList.toggle("done",on);
  });
  document.getElementById("pcount").textContent=done.size+" / "+TOTAL+" revistas";
  document.getElementById("pbar").style.transform="scaleX("+(TOTAL?done.size/TOTAL:0)+")";
  if(current==="todo")applyFilter();
}

let current="all";
function applyFilter(){
  document.querySelectorAll(".card").forEach(c=>{
    const n=Number(c.dataset.num);
    const show=current==="all"?true
      :current==="manual"?c.dataset.verified==="manual"
      :!done.has(n);
    c.classList.toggle("hidden",!show);
  });
  document.querySelectorAll(".page").forEach(s=>{
    const any=[...s.querySelectorAll(".card")].some(c=>!c.classList.contains("hidden"));
    s.classList.toggle("hidden",!any);
  });
}

document.addEventListener("click",e=>{
  const t=e.target.closest("[data-tick]");
  if(t){
    const n=Number(t.dataset.tick);
    done.has(n)?done.delete(n):done.add(n);
    save();paint();
    return;
  }
  const z=e.target.closest(".zoom");
  if(z){
    lbimg.src=DATA.images[z.dataset.img];
    lbimg.alt="Página "+z.dataset.img;
    lb.classList.add("open");
  }
});
document.getElementById("reset").addEventListener("click",()=>{done.clear();save();paint();});
document.querySelectorAll("[data-filter]").forEach(b=>{
  b.addEventListener("click",()=>{
    current=b.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(x=>x.setAttribute("aria-pressed",x===b?"true":"false"));
    applyFilter();
  });
});

const lb=document.getElementById("lb"),lbimg=document.getElementById("lbimg");
function closeLb(){lb.classList.remove("open");}
document.getElementById("lbclose").addEventListener("click",closeLb);
lb.addEventListener("click",e=>{if(e.target===lb)closeLb();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLb();});

paint();`;
