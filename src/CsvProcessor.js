import React, {useRef} from "react";
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'

const XLSX = require('xlsx');

const primarySelectLabel = { inputProps: { 'aria-label': 'primarySelect' } };
const headerLabel = { inputProps: { 'aria-label': 'headerSelect' } };

async function handleFileSelect(e, setDictOfParts, setPartOptions) {
    let file = e.target.files;
    let f = file[0];
    
    let reader = new FileReader();
  
    reader.onload = (function(e) {
        let processData = e.target.result;
        if (typeof(processData) === 'object') {
            var workBook = XLSX.read(processData); 
            console.log(workBook)
            processData = XLSX.utils.sheet_to_csv(workBook.Sheets[workBook.SheetNames[0]], {RS: '\r\n'});
            
        }
        console.log(processData)

      process(processData, setDictOfParts, setPartOptions);
    });
      
    if (f.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        reader.readAsArrayBuffer(f);
    } else {
        reader.readAsText(f);
    }
    
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
      setDictOfParts(newDictOfParts);
      setPartOptions(newPartOptions)

}

function handleSelectedHeader(selectedHeaders, index) {
    selectedHeaders[index] = !selectedHeaders[index];
}

function handleChecked(setChecked, index) {
    setChecked(index)
}

function Checkboxes(props) {
    const [checked, setChecked] = React.useState();
    let checkboxes = [];
    let selectedHeaders = [];

    function handleSetHeadersClick(e) {
        submitHeaders(checked, props.allTextLines, props.setDictOfParts, props.setPartOptions, props.headers, selectedHeaders); 
        props.setHeaders([]); 
        props.setAllTextLines(undefined); 
        props.setBomUploadDisable(false);
    }
    props.headers.map((object, i) => {
        selectedHeaders = [...selectedHeaders, false];
        checkboxes = [...checkboxes, <div key={i}>
                                        <Checkbox checked={i === checked} key={"primary" + i} {...primarySelectLabel} onClick={() => handleChecked(setChecked, i)}/>
                                            {object} 
                                        <Checkbox key={"header" + i} {...headerLabel} onClick={() => {handleSelectedHeader(selectedHeaders, i);}}/>
                                    </div> ]; 
        return 1;
    });
    checkboxes = [...checkboxes, <button style={{width: `${props.drawerWidth*.95}px`, display: props.headers.length===0 ? "none" : ""}} key="headerButton" id="selectBtns" onClick={ (e) => handleSetHeadersClick(e)}>Set Headers</button>]
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
    var [bomUploadDisable, setBomUploadDisable] = React.useState(false);
    const inputFile = useRef(null);

    const onInputBtnClick = () => {
        inputFile.current.click();
        setBomUploadDisable(true)
    }

    const createCheckboxes = () => {
        return (
        <Checkboxes key="Checkboxes" setDictOfParts={setDictOfParts} setPartOptions={setPartOptions} headers={headers} setHeaders={setHeaders} allTextLines={allTextLines} setAllTextLines={setAllTextLines} setBomUploadDisable={setBomUploadDisable} drawerWidth={props.drawerWidth}/>
        );
    }
    const createButton = () => {
        return (
            <button id="selectBtns" onClick={onInputBtnClick} style={{width:`${props.drawerWidth*.95}px`, display:(bomUploadDisable ? "none" : "")}}>Manual BoM Upload</button>
        );
    }

    return (
       <>
           <input type="file" id="file" ref={inputFile} style={{display:"none"}} onChange={(e) => {handleFileSelect(e, setAllTextLines, setHeaders)}}/>
           <ListItemText primary={createCheckboxes()}/>
           <ListItemText primary={createButton()}/>
           
        </>
      );
  }