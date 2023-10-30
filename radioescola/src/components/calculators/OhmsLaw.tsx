'use client'

import React, { useState } from 'react'



export default function OhmsLawCalculator() {
    interface IOhmsLaw {
        volts: number,
        amperes: number,
        ohms: number
    }

    const [results, setresults] = useState<IOhmsLaw>({volts: 0, amperes: 0, ohms:0})

    function handleOnChange(e :  React.ChangeEvent<HTMLInputElement>) {
        console.log(e.target.name)
    }


    function calculate(values: IOhmsLaw) : IOhmsLaw {

        return {volts: 0, amperes: 0, ohms:0}
    }




  return (
    <div>
        <input type="number" value={results.volts} onChange={handleOnChange} name="volts"/>

    </div>
  )
}
