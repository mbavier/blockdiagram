import React, {useRef} from "react";
import Checkbox from '@mui/material/Checkbox'

const primarySelectLabel = { inputProps: { 'aria-label': 'primarySelect' } };
const headerLabel = { inputProps: { 'aria-label': 'headerSelect' } };

function handleFileSelect(e, setDictOfParts, setPartOptions) {
    let file = e.target.files;
    let f = file[0];
  
    let reader = new FileReader();
  
    reader.onload = (function(e) {
      process(e.currentTarget.result, setDictOfParts, setPartOptions);
    });
      
  
    reader.readAsText(f);
  }

function submitHeaders(primary, allTextLines, setDictOfParts, setPartOptions, headers, selectedHeaders) {
    let newDictOfParts = {};
    let newPartOptions = [];
    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
            if (data.length === headers.length) {
              newDictOfParts[data[primary]] = {}
              newPartOptions[i] = {value: data[primary], label: data[primary]}
                for (var j=0; j<headers.length; j++) {
                  if (selectedHeaders[j] && j !== primary) {
                      newDictOfParts[data[primary]][headers[j]] = data[j];
                  }
                }
            }
    
      }
      console.log(newDictOfParts);
      setDictOfParts(newDictOfParts);
      setPartOptions(newPartOptions)

}

function handleSelectedHeader(selectedHeaders, index) {
    selectedHeaders[index] = !selectedHeaders[index];
    console.log(selectedHeaders);
}

function handleChecked(setChecked, index) {
    setChecked(index)
}

function Checkboxes(props) {
    const [checked, setChecked] = React.useState();
    let checkboxes = [];
    let selectedHeaders = [];
    console.log(props.headers.length===0)
    props.headers.map((object, i) => {
        selectedHeaders = [...selectedHeaders, false];
        checkboxes = [...checkboxes, <div key={i}>
                                        <Checkbox checked={i === checked} key={"primary" + i} {...primarySelectLabel} onClick={() => handleChecked(setChecked, i)}/>
                                            {object} 
                                        <Checkbox key={"header" + i} {...headerLabel} onClick={() => {handleSelectedHeader(selectedHeaders, i);}}/>
                                    </div> ]; 
        return 1;
    });
    checkboxes = [...checkboxes, <button style={{display: props.headers.length===0 ? "none" : ""}} key="headerButton" id="selectBtns" onClick={ (e) => {submitHeaders(checked, props.allTextLines, props.setDictOfParts, props.setPartOptions, props.headers, selectedHeaders)}}>Set Headers</button>]
    return (checkboxes);
}

function process(allText, setAllTextLines, setHeaders) {
    var allTextLines = allText.split('\r\n')
    var headers = allTextLines[0].split(',');
    setHeaders(headers)
    setAllTextLines(allTextLines);
  }


export default function CsvProcessor (props) {
    var setDictOfParts = props.setDictOfParts;
    var setPartOptions = props.setPartOptions;
    var [headers, setHeaders] = React.useState([]);
    var [allTextLines, setAllTextLines] = React.useState();
    const inputFile = useRef(null);

    const onInputBtnClick = () => {
        inputFile.current.click();
    }

    return (
       <div>
           <input type="file" id="file" ref={inputFile} style={{display:"none"}} onChange={(e) => {handleFileSelect(e, setAllTextLines, setHeaders)}}/>
           <div id="headerOptions"> <Checkboxes key="Checkboxes" setDictOfParts={setDictOfParts} setPartOptions={setPartOptions} headers={headers} allTextLines={allTextLines}/> </div>
      </div>
      );
  }