import React, {useRef} from "react";
import { ListItem, Checkbox, ListItemText, Radio, Grid, Button } from "@mui/material";
import { read, utils } from "xlsx";

import { DiagramModel } from "@projectstorm/react-diagrams"
import { DeviceNodeModel, RightAnglePortModel } from './components/Device/DeviceNodeModel';
import { GroupingNodeModel } from "./components/Grouping/GroupingNodeModel";

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
                if (node.type === 'device') {
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
                } else if (node.type === 'grouping') {
                    let newNode = new GroupingNodeModel({
                        name: node.name,
                        userComments: node.userComments,
                        color: node.color,
                        id: node.id,
                        width: node.width,
                        height: node.height,
                        titleFontSize: node.titleFontSize, 
                        titleFontAlignment: node.titleFontAlignment, 
                        commentFontSize: node.commentFontSize, 
                        commentFontAlignment: node.commentFontAlignment
                    })
                    newNode.setPosition(node.x, node.y)
                    newModel.addNode(newNode);
                }
                return 1;
            })
            Object.values(uploadedModel.layers[linkLayer].models).map((link) => {
                console.log(link.source)
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
    e.target.value = null;
  }

function submitHeaders(primary, allTextLines, setDictOfParts, setPartOptions, headers, selectedHeaders) {
    let newDictOfParts = {};
    let newPartOptions = [];
    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(/(?!\B"[^"]*),(?![^"]*"\B)/g);
            if (data.length === headers.length) {
              newDictOfParts[data[primary]] = {}
              newPartOptions[i] = data[primary]
                for (var j=0; j<headers.length; j++) {
                  if (selectedHeaders[j] && j !== primary) {
                      newDictOfParts[data[primary]][headers[j]] = data[j].replace(/\r\n/g, ' ').replace(/^"(.+(?="$))"$/, '$1');
                  }
                }
            }
    
      }
      setDictOfParts(newDictOfParts);
      setPartOptions(newPartOptions)

}

function handleSelectedHeader(selectedHeaders, index, subChecked, targetChecked) {
    if (index === subChecked) {
        selectedHeaders[index] = true;
    } else {
        selectedHeaders[index] = targetChecked;
    }
}

function handleChecked(checked, setChecked, index) {
    if (index === checked && index !== undefined) {
        setChecked(undefined);
    } else {
        setChecked(index);
    }
}

function Checkboxes(props) {
    const [checked, setChecked] = React.useState();
    const [subChecked, setSubChecked] = React.useState();
    let checkboxes = [];
    let selectedHeaders = [];

    function titleSet() {
        if (props.headers.length > 0) {
            return (
            <React.Fragment key="GridHeaders">
            <Grid key={"ItemHeader"} item xs={6}>
                <div style={{marginLeft:"2.5%"}}> Item </div>
            </Grid>
            <Grid key={"HeaderHeader"} item xs={2}>
                Header
            </Grid>
            <Grid key={"SubtextHeader"} item xs={2}>
                Subtext 
            </Grid>
            <Grid key={"MiscHeader"} item xs={2}>
                Misc
            </Grid>
            </React.Fragment>
            )
        } else {
            return
        }
    }

    function handleSetHeadersClick(e) {
        selectedHeaders[subChecked] = true;
        submitHeaders(checked, props.allTextLines, props.setDictOfParts, props.setPartOptions, props.headers, selectedHeaders);
        props.setSubheading(props.headers[subChecked].replace(/\r\n/g, ' ').replace(/^"(.+(?="$))"$/, '$1'))
        props.setHeaders([]); 
        props.setAllTextLines(undefined); 
        props.setBomUploadDisable(false);
    }
    checkboxes = 
    <Grid key="GridForChecks" container spacing={0}>
    {titleSet()}
    {props.headers.map((object, i) => {
        selectedHeaders = [...selectedHeaders, false];
        return ( 
            <React.Fragment key={`GridOption${i}`}>
            <Grid key={`Object${i}`} style={{backgroundColor:`rgba(0,0,0,${(i%2==1)*0.3})`, display:"flex", alignItems:"center"}} item xs={6}>
                <div style={{marginLeft:"2.5%"}}>{object}</div>
            </Grid>
            <Grid key={`primary${i}`} style={{backgroundColor:`rgba(0,0,0,${(i%2==1)*0.3})`}} item xs={2}>
                <Radio checked={i === checked} key={"primarySwitch" + i} {...primarySelectLabel} onClick={() => handleChecked(checked, setChecked, i)}/>
            </Grid>
            <Grid key={`Subheader${i}`} style={{backgroundColor:`rgba(0,0,0,${(i%2==1)*0.3})`}} item xs={2}>
                <Radio checked={i === subChecked} key={"subheaderSwitch" + i} {...primarySelectLabel} onClick={(e) => {handleChecked(subChecked, setSubChecked, i); handleSelectedHeader(selectedHeaders, i, subChecked, e.target.checked);}}/>
            </Grid>
            <Grid key={`Misc${i}`} style={{backgroundColor:`rgba(0,0,0,${(i%2==1)*0.3})`}} item xs={2}>
                <Checkbox edge="end" key={"header" + i} {...headerLabel} onClick={(e) => {handleSelectedHeader(selectedHeaders, i, subChecked, e.target.checked);}}/>
            </Grid>
            </React.Fragment> ); 
        })}
        <Button variant="contained" style={{width: `${props.drawerWidth*.95}px`, display: props.headers.length===0 ? "none" : ""}} key="headerButton" id="selectBtns" onClick={ (e) => handleSetHeadersClick(e)}>Set Headers</Button>
    </Grid>
    
    
    return (
        checkboxes
        );
}

function process(allText, setAllTextLines, setHeaders) {
    var allTextLines = allText.match(/(?:[^\r\n"]+|"[^"]*")+/g)
    var headers = allTextLines[0].match(/(?:[^,"]+|"[^"]*")+/g);
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
            <Checkboxes key="Checkboxes" setSubheading={props.setSubheading} setDictOfParts={setDictOfParts} setPartOptions={setPartOptions} headers={headers} setHeaders={setHeaders} allTextLines={allTextLines} setAllTextLines={setAllTextLines} setBomUploadDisable={setBomUploadDisable} drawerWidth={props.drawerWidth}/>
        );
    }
    const createButton = () => {
        return (
            <Button variant="contained" id="selectBtns" onClick={onInputBtnClick} style={{width:`${props.drawerWidth*.95}px`, display:(bomUploadDisable ? "none" : "")}}>BoM/MBD Upload</Button>
        );
    }

    return (
       <>
           <input type="file" id="file" ref={inputFile} style={{display:"none"}} onChange={(e) => {handleFileSelect(e, setAllTextLines, setHeaders, props.engine, 
                                                                                                                    props.setMBDUploaded, setBomUploadDisable, props.addNewNode);}}/>
           <ListItemText primary={createCheckboxes()}/>
           <ListItemText primary={createButton()}/>
           
        </>
      );
  }