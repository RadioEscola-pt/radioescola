import React from 'react'

export default function Alfabeto() {
  return (
    <div>
        
        <h1 className="text-2xl mb-4">Alfabeto Fonético</h1>

<p>
  O alfabeto fonético da NATO é o alfabeto de soletração mais utilizado no
  mundo. Embora chamados de &quot;alfabetos fonéticos&quot;, alfabetos de soletração não
  têm conexão com sistemas de transcrição fonética como o alfabeto fonético
  internacional. Ao invés disso, o alfabeto da NATO define palavras-chave para
  letras do alfabeto inglês por meio de um princípio acrofônico (Alpha para A,
  Bravo para B, etc.) para que combinações críticas de letras (e números) possam
  ser pronunciadas e entendidas por aqueles que transmitem e recebem mensagens
  de voz por rádio ou telefone, independente de seu idioma nativo, especialmente
  quando a segurança de navegação ou de indivíduos é essencial.
</p>

<a
  target="_blank"
  href="docs/Alfabeto_fonético_da_OTAN.pdf"
  className="bg-neutral-100 px-2 py-1 rounded flex w-fit gap-2 my-4 items-center text-sm dark:text-neutral-50 dark:bg-neutral-800"
  ><svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
  Fonte: Wikipedia</a
>

<table className="w-full my-12 shadow border-2">
  <thead className="bg-slate-800 dark:bg-slate-950 text-white">
    <tr className="even:bg-neutral-100 dark:even:bg-slate-900">
      <th>Letra</th>
      <th>Morse</th>
      <th>Telefonia</th>
      <th>Pronúncia</th>
    </tr>
  </thead>

  <tbody className="divide-x divide-y">
    <tr className="divide-x divide-y">
      <td width="32">A</td>
      <td width="57"><strong>.-</strong></td>
      <td width="79">Alfa</td>
      <td width="297">(AL-FAH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>B</td>
      <td><strong>-...</strong></td>
      <td>Bravo</td>
      <td>(BRAH-VOH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td height="26">C</td>
      <td><strong>-.-.</strong></td>
      <td>Charlie</td>
      <td>(CHAR-LEE) ou (SHAR-LEE)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>D</td>
      <td><strong>-..</strong></td>
      <td>Delta</td>
      <td>(DELL-TAH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>E</td>
      <td><strong>.</strong></td>
      <td>Echo</td>
      <td>(ECK-OH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>F</td>
      <td><strong>..-.</strong></td>
      <td>Foxtrot</td>
      <td>(FOKS-TROT)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>G</td>
      <td><strong>--.</strong></td>
      <td>Golf</td>
      <td>(GOLF)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>H</td>
      <td><strong>....</strong></td>
      <td>Hotel</td>
      <td>(HOH-TEL)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>I</td>
      <td><strong>..</strong></td>
      <td>India</td>
      <td>(IN-DEE-AH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>J</td>
      <td><strong>.---</strong></td>
      <td>Juliett</td>
      <td>(JEW-LEE-ETT)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>K</td>
      <td><strong>-.-</strong></td>
      <td>Kilo</td>
      <td>(KEY-LOH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>L</td>
      <td><strong>.-..</strong></td>
      <td>Lima</td>
      <td>(LEE-MAH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>M</td>
      <td><strong>-.-</strong></td>
      <td>Mike</td>
      <td>(MIKE)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>N</td>
      <td><strong>.-..</strong></td>
      <td>November</td>
      <td>(NO-VEM-BER)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>O</td>
      <td><strong>---</strong></td>
      <td>Oscar</td>
      <td>(OSS-CAH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>P</td>
      <td><strong>.--.</strong></td>
      <td>Papa</td>
      <td>(PAH-PAH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>Q</td>
      <td><strong>--.-</strong></td>
      <td>Quebec</td>
      <td>(KEH-BECK)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>R</td>
      <td><strong>.-.</strong></td>
      <td>Romeo</td>
      <td>(ROW-ME-OH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>S</td>
      <td><strong>...</strong></td>
      <td>Sierra</td>
      <td>(SEE-AIR-RAH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>T</td>
      <td><strong>-</strong></td>
      <td>Tango</td>
      <td>(TANG-GO)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>U</td>
      <td><strong>..-</strong></td>
      <td>Uniform</td>
      <td>(YOU-NEE-FORM) ou (OO-NEE-FORM)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>V</td>
      <td><strong>...-</strong></td>
      <td>Victor</td>
      <td>(VIK-TAH)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>W</td>
      <td><strong>.--</strong></td>
      <td>Whiskey</td>
      <td>(WISS-KEY)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>X</td>
      <td><strong>-..-</strong></td>
      <td>Xray</td>
      <td>(ECKS-RAY)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>Y</td>
      <td><strong>-.--</strong></td>
      <td>Yankee</td>
      <td>(YANG-KEY)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>Z</td>
      <td><strong>--..</strong></td>
      <td>Zulu</td>
      <td>(ZOO-LOO)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td></td>
      <td></td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>1</td>
      <td><strong>.----</strong></td>
      <td>One</td>
      <td>(WUN)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>2</td>
      <td><strong>..---</strong></td>
      <td>Two</td>
      <td>(TOO)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>3</td>
      <td><strong>...--</strong></td>
      <td>Three</td>
      <td>(TREE)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>4</td>
      <td><strong>....-</strong></td>
      <td>Four</td>
      <td>(FOW-ER)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>5</td>
      <td><strong>.....</strong></td>
      <td>Five</td>
      <td>(FIFE)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>6</td>
      <td><strong>-....</strong></td>
      <td>Six</td>
      <td>(SIX)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>7</td>
      <td><strong>--...</strong></td>
      <td>Seven</td>
      <td>(SEV-EN)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>8</td>
      <td><strong>---..</strong></td>
      <td>Eight</td>
      <td>(AIT)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>9</td>
      <td><strong>----.</strong></td>
      <td>Nine</td>
      <td>(NIN-ER)</td>
    </tr>
    <tr className="divide-x divide-y">
      <td>0</td>
      <td><strong>-----</strong></td>
      <td>Zero</td>
      <td>(ZEE-RO)</td>
    </tr>
  </tbody>
</table>


    </div>
  )
}