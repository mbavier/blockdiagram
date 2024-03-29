import React, {useRef} from "react";
import { MenuItem, Checkbox, Typography, Radio, Grid, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import { read, utils } from "xlsx";

import { DiagramModel } from "@projectstorm/react-diagrams"
import { DeviceNodeModel, RightAnglePortModel } from './components/Device/DeviceNodeModel';
import { GroupingNodeModel } from "./components/Grouping/GroupingNodeModel";
import toolInfo from "./toolInfo";

const primarySelectLabel = { inputProps: { 'aria-label': 'primarySelect' } };
const headerLabel = { inputProps: { 'aria-label': 'headerSelect' } };

async function handleFileSelect(e, setDictOfParts, setPartOptions, engine,
                                    setMBDUploaded, setModelPages, handleClickOpen, setProjectInfoData) {
    let file = e.target.files;
    let f = file[0];
    let type = f.name.split(".")[1];
    let reader = new FileReader();
    
    reader.onload = (function(e) {
        if (type === "mbd") {
            let uploadedProject = JSON.parse(e.target.result);
            if (toolInfo.version !== uploadedProject.exportVersion) {
                alert("Export from previous version, some details may be lost!");
            }
            setProjectInfoData(uploadedProject.projectDetails);
            let uploadedPages = uploadedProject.models;
            let convertedPages = [];
            (uploadedPages).map((page, i) => {
                let uploadedModel = page['model'];
                let newModel = new DiagramModel();
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
                    let newLink = newModel.getNode(link.source).getPortFromID(link.sourcePort).link(newModel.getNode(link.target).getPortFromID(link.targetPort));
                    newModel.addLink(newLink)
                    return 1;
                })
                console.log(newModel)
                convertedPages[i] = {name: page['name'], model: newModel};
            })
            console.log(convertedPages)
            //uploadedModel.deserializeModel(JSON.parse(e.target.result), engine)
            engine.setModel(convertedPages[0]['model']);
            setModelPages(convertedPages)
            setMBDUploaded(true);

        } else {
            let processData = e.target.result;
            if (typeof(processData) === 'object') {
                var workBook = read(processData); 
                processData = utils.sheet_to_csv(workBook.Sheets[workBook.SheetNames[0]], {RS: '\r\n'});
                
            }

            process(processData, setDictOfParts, setPartOptions, handleClickOpen);
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

function submitHeaders(primary, allTextLines, setDictOfParts, setPartOptions, headers, selectedHeaders, handleAlertOpen) {
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
      handleAlertOpen()

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
        submitHeaders(checked, props.allTextLines, props.setDictOfParts, props.setPartOptions, props.headers, selectedHeaders, props.handleAlertOpen);
        props.setSubheading(props.headers[subChecked].replace(/\r\n/g, ' ').replace(/^"(.+(?="$))"$/, '$1'))
        props.setHeaders([]); 
        props.setAllTextLines(undefined); 
    }
    checkboxes = 
    <React.Fragment>
    <Grid key="GridForChecks" container spacing={0}>
    {titleSet()}
    {props.headers.map((object, i) => {
        selectedHeaders = [...selectedHeaders, false];
        return ( 
            <React.Fragment key={`GridOption${i}`}>
            <Grid key={`Object${i}`} style={{backgroundColor:`rgba(61,148,246,${(i%2===1)*0.3})`, display:"flex", alignItems:"center"}} item xs={6}>
                <div style={{marginLeft:"2.5%"}}>{object}</div>
            </Grid>
            <Grid key={`primary${i}`} style={{backgroundColor:`rgba(61,148,246,${(i%2===1)*0.3})`}} item xs={2}>
                <Radio checked={i === checked} key={"primarySwitch" + i} {...primarySelectLabel} onClick={() => handleChecked(checked, setChecked, i)}/>
            </Grid>
            <Grid key={`Subheader${i}`} style={{backgroundColor:`rgba(61,148,246,${(i%2===1)*0.3})`}} item xs={2}>
                <Radio checked={i === subChecked} key={"subheaderSwitch" + i} {...primarySelectLabel} onClick={(e) => {handleChecked(subChecked, setSubChecked, i); handleSelectedHeader(selectedHeaders, i, subChecked, e.target.checked);}}/>
            </Grid>
            <Grid key={`Misc${i}`} style={{backgroundColor:`rgba(61,148,246,${(i%2===1)*0.3})`}} item xs={2}>
                <Checkbox edge="end" key={"header" + i} {...headerLabel} onClick={(e) => {handleSelectedHeader(selectedHeaders, i, subChecked, e.target.checked);}}/>
            </Grid>
            </React.Fragment> ); 
        })}
        
    </Grid>
    <DialogActions>
        <Button variant="contained" style={{width: '100%', margin: '0'}} key="headerButton" id="selectBtns" onClick={ (e) => handleSetHeadersClick(e)}>Set Headers</Button>
    </DialogActions>
    </React.Fragment>

    return (
        checkboxes
        );
}

function process(allText, setAllTextLines, setHeaders, handleClickOpen) {
    var allTextLines = allText.match(/(?:[^\r\n"]+|"[^"]*")+/g)
    var headers = allTextLines[0].match(/(?:[^,"]+|"[^"]*")+/g);
    setHeaders(headers)
    handleClickOpen();
    
    setAllTextLines(allTextLines);
  }


export default function CsvProcessor (props) {
    var setDictOfParts = props.setDictOfParts;
    var setPartOptions = props.setPartOptions;
    var [headers, setHeaders] = React.useState([]);
    var [allTextLines, setAllTextLines] = React.useState();
    var [open, setOpen] = React.useState(false);
    const inputFile = useRef(null);

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onInputBtnClick = () => {
        inputFile.current.click();
        
    }

    return (
       <>
            <input type="file" id="file" ref={inputFile} style={{display:"none"}} onChange={(e) => {handleFileSelect(e, setAllTextLines, setHeaders, props.engine, props.setMBDUploaded, props.setModelPages, handleClickOpen, props.setProjectInfoData);}}/>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Set Headers</DialogTitle>
                <DialogContent>
                    <Checkboxes key="Checkboxes" setSubheading={props.setSubheading} setDictOfParts={setDictOfParts} setPartOptions={setPartOptions} headers={headers} setHeaders={setHeaders} allTextLines={allTextLines} setAllTextLines={setAllTextLines} drawerWidth={props.drawerWidth} handleAlertOpen={props.handleAlertOpen}/>
                </DialogContent>
            </Dialog>                                                                                                      
            <MenuItem key={'Upload'} onClick={onInputBtnClick}>
                 <Typography textAlign="center">Upload</Typography>
            </MenuItem> 
        </>
      );
  }