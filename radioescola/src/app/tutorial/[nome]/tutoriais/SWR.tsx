import React from 'react'

export default function SWR() {
  return (
    <div>
        
        <h1 className="page-title">Ondas estacionárias</h1>

<p>VSWR é definido como a razão entre as ondas estacionárias de tensão transmitida e refletida em um frequência de rádio (RF) sistema de transmissão elétrica. </p>
<p>Se a impedancia da entrana e o cabo sao diferentes parte do sinal e reflectido.</p>
<p>O sinal reflectido mistura-se com o sinal emitido chamado &quot;standing wave&quot;.O sinal de entrada e reflectido vem desfasados criando uma nova onda </p>

<p><img src="capitulos\SWR\standingWave.gif" /></p>

<p>O ratio entre o valor mais alto e baixo da &quot;standing wave&quot; e chamado de VSWR.</p>




O Γ (gamma) e o coofeciente de refleccao, impedancia da carga(ZL) e impedancia da fonte (Zo)

<p><img src="capitulos\SWR\b.svg" /></p>

V(max)voltagem maciama da linha, and V(min) voltagem minima da linha.
Ou tambem pode ser calculado atraves das impedancias usando a formala anterior

<p><img src="capitulos\SWR\c.svg" /></p>

<a target='_blank' href='docs/vswr_calc.pdf'>Consulte alguns exemplos práticos</a>


<h2>Exemplo: cabo coaxial com 50Ω e antena com 25Ω:</h2>
<p>Γ = (25 - 50) / (25 + 50) = -25 / 75 = -1/3</p>
<p>VSWR = 1 + |-1/3| / (1 - |-1/3|) = 2</p>

<h2>Exemplo: cabo coaxial com 50Ω e antena com 75Ω:</h2>
<p>Γ = (75 - 50) / (75 + 50) = 25 / 125 = 1/5</p>
<p>VSWR = 1 + |1/5| / (1 - |1/5|) = 1.5</p>

<h2>Exemplo: cabo coaxial com 50Ω e antena com 100Ω:</h2>
<p>Γ = (100 - 50) / (100 + 50) = 50 / 150 = 1/3</p>
<p>VSWR = 1 + |1/3| / (1 - |1/3|) = 2</p>

<p>Esses são os cálculos do VSWR com base nas impedâncias fornecidas nos exemplos. O VSWR é uma medida importante em sistemas de transmissão de RF (radiofrequência) e é usado para avaliar a eficiência e a correspondência de impedância em uma linha de transmissão. Valores mais baixos de VSWR (ideais 1:1) indicam uma melhor correspondência de impedância e menor perda de potência.</p>


    </div>
  )
}
