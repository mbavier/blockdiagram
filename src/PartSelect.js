import React from "react";
import Select from 'react-select';

import { defaultDictOfParts, defaultPartOptions } from "./data";

import './App.css';

const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 100
    })
  }
  
let selectedPart;
function handleChange(selectedOption, partInfo, setNewPart)  {
    console.log(selectedOption)
    selectedPart = selectedOption;
    setNewPart([selectedPart, partInfo]);
}

export default function PartSelect(props) {
    var [dictOfParts, setDictOfParts] = React.useState(defaultDictOfParts);
    var [partOptions, setPartOptions] = React.useState(defaultPartOptions);
    var setNewPart =props.setNewPart;
    
    return (
//     <div>
//          <button onClick={() => {setDictOfParts({...dictOfParts, "Test": {
//         "Description": "5-V 5-A boost converter with PG and PFM/PWM control",
//         "Ordering & quality": "Ordering & quality",
//         "SubFamily": "Boost converters (integrated switch)",
//         "Rating": "Catalog",
//         "TI functional safety category": " --- ",
//         "\"Operating temperature range\n(C)\"": "-40 to 125",
//         "Package size: mm2:W x L (PKG)": "3 mm2: 1.2 x 2.1 (SOT-5X3|8)",
//         "Package Group": "SOT-5X3|8",
//         "\"Approx. price\n(USD)\"": "$0.600 | 1ku",
//         "Status": "PREVIEW"
//     }});
//     setPartOptions([...partOptions, {
//       "value": "Test",
//       "label": "Test"
//   }]);
//     }}> Change input</button>
    <Select className="partInput" defaultValue={partOptions[0]} options={partOptions} styles={customStyles} onChange={(e) => {handleChange(e, dictOfParts[e.value], setNewPart)}} 
    onKeyDown={(e) => {
        if (e.key === 'Enter') {
            console.log("Hi")
          //addNewNode(engine, newPart[0], newPart[1]);
        }
      }}/>
    // </div>
    );
}