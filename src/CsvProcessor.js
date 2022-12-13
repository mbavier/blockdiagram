import React, {useRef} from "react";
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import { read, utils } from "xlsx";

import { DiagramModel } from "@projectstorm/react-diagrams"
import { DeviceNodeModel, RightAnglePortModel } from './components/Device/DeviceNodeModel';

const primarySelectLabel = { inputProps: { 'aria-label': 'primarySelect' } };
const headerLabel = { inputProps: { 'aria-label': 'headerSelect' } };

async function handleFileSelect(e, setDictOfParts, setPartOptions, engine,
                                    setMBDUploaded, setBomUploadDisable, addNewNode) {
    let file = e.target.files;
    let f = file[0];
    let type = f.name.split(".")[1];
    let reader = new FileReader();
  
    reader.onload = (function(e) {
        if (type === "mbd") {
            let newModel = new DiagramModel();
            let uploadedModel = JSON.parse(e.target.result);
            newModel.setOffset(uploadedModel.offsetX, uploadedModel.offsetY);
            newModel.setZoomLevel(uploadedModel.zoom);
            newModel.setGridSize(uploadedModel.gridSize);
            let nodeLayer, linkLayer;
            for (let layer in uploadedModel.layers) {
                if (uploadedModel.layers[layer].type === 'diagram-nodes') {
                    nodeLayer = layer;
                } else if (uploadedModel.layers[layer].type === 'diagram-links') {
                    linkLayer = layer;
                }
            }
            Object.values(uploadedModel.layers[nodeLayer].models).map((node) => {
                let newNode = new DeviceNodeModel({
                    name: node.name,
                    subname: node.subname,
                    color: node.color,
                    id: node.id,
                    extras: node.extras
                })
                newNode.setPosition(node.x, node.y)
                node.ports.map((port) => {
                    let newPort = new RightAnglePortModel(port.in, port.name, port.label)
                    newPort.options.id = port.id;
                    
                    newNode.addPort(newPort);
                    console.log(port.id, newPort.id)
                })
                newModel.addNode(newNode);
                return 1;
            })
            Object.values(uploadedModel.layers[linkLayer].models).map((link) => {
                let newLink = newModel.getNode(link.source).getPortFromID(link.sourcePort).link(newModel.getNode(link.target).getPortFromID(link.targetPort));
                newModel.addLink(newLink)
                return 1;
            })
            //uploadedModel.deserializeModel(JSON.parse(e.target.result), engine)
            engine.setModel(newModel);
            setMBDUploaded(true);
            setBomUploadDisable(false);
        } else {
            let processData = e.target.result;
            if (typeof(processData) === 'object') {
                var workBook = read(processData); 
                processData = utils.sheet_to_csv(workBook.Sheets[workBook.SheetNames[0]], {RS: '\r\n'});
                
            }

            process(processData, setDictOfParts, setPartOptions);
        }
    });
      
    if (f.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        reader.readAsArrayBuffer(f);
    } else if (f.type === "text/csv") {
        reader.readAsText(f);
    } else if (f.name.includes(".mbd")) {
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
            <button id="selectBtns" onClick={onInputBtnClick} style={{width:`${props.drawerWidth*.95}px`, display:(bomUploadDisable ? "none" : "")}}>BoM/MBD Upload</button>
        );
    }

    return (
       <>
           <input type="file" id="file" ref={inputFile} style={{display:"none"}} onChange={(e) => {handleFileSelect(e, setAllTextLines, setHeaders, props.engine, 
                                                                                                                    props.setMBDUploaded, setBomUploadDisable, props.addNewNode)}}/>
           <ListItemText primary={createCheckboxes()}/>
           <ListItemText primary={createButton()}/>
           
        </>
      );
  }