import React, {useRef} from "react";

import { defaultDictOfParts, defaultPartOptions } from "./data";
import createEngine, { 
  /*DefaultLinkModel, */
  DefaultNodeModel,
  DiagramModel ,
  PathFindingLinkFactory,
  DefaultPortModel,
  RightAngleLinkFactory,
	RightAngleLinkModel
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget,
} from '@projectstorm/react-canvas-core';
import { DeviceNodeFactory } from './components/Device/DeviceNodeFactory';
import { DeviceNodeModel } from './components/Device/DeviceNodeModel';

import { GroupingNodeFactory } from "./components/Grouping/GroupingNodeFactory";
import { GroupingNodeModel } from "./components/Grouping/GroupingNodeModel";

import $ from 'jquery';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import { Autocomplete, TextField, Grid } from "@mui/material";
import ListItemText from '@mui/material/ListItemText';
import { Button, ThemeProvider, createTheme } from '@mui/material';


import './App.css';
import CsvProcessor from "./CsvProcessor";
import PartSearch from "./PartSearch";
import Exporter from "./Exporter";
import CustomPart from "./CustomPart";
import CustomHeaders from "./CustomHeaders";

export class RightAnglePortModel extends DefaultPortModel {
	createLinkModel() {
		return new RightAngleLinkModel(
      {color: (this.options.color !== undefined) ? this.options.color : 'gray'});
	}
}

let setDisabled, subtitle;

export default function App () {

  return (
     <div>
      <PartSelect />
      <DiagramApp />
    </div>
    );
}

let statusOptions = [ "Loss", "Pending", "Win"];
let statusRelation = {
  "Loss" : -1,
  "Pending": 0,
  "Win": 1
}

let statusColors = [
  "rgb(255,60,50)",
  "rgb(255,235,110)",
  "rgb(150,255,110)"
];

function PartInfoInput(props) {
  var [partVal, setPartVal] = new React.useState(props.partInfo);
  return (<TextField variant="standard" key={`${props.dictKey}PartInfoSection`} label={props.dictKey}
    onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
    style={{width:'100%'}} value= {props.currentNode.options.extras.miscInfo[props.dictKey]} onChange={(val) => {
      setPartVal(val.target.value)
      props.currentNode.options.extras.miscInfo[props.dictKey] = val.target.value;
    }}/>);
}

function GetPartDetails(props) {
  if (props.currentNode !== undefined) {
  let partInfo =  props.currentNode.options.extras.miscInfo;
  return(Object.keys(partInfo).map((key) => {
      return (< PartInfoInput key={`${key}TopPartInfoSection`}dictKey={key} partInfo={partInfo[key]} currentNode={props.currentNode}/>)}));
  } else {
    return "";
  }
}

  function SelectStatus(props) {
  if (props.currentNode !== undefined) {
    var [currentStatus, setCurrentStatus] = new React.useState(statusOptions[props.currentNode.options.extras.deviceStatus+1]);
    if (statusOptions[props.currentNode.options.extras.deviceStatus+1] !== currentStatus) {
      setCurrentStatus(statusOptions[props.currentNode.options.extras.deviceStatus+1]);
    }
    return (<Autocomplete 
              options={statusOptions}
              className="partInput"
              value={currentStatus}
              renderInput={(params) => (
                <TextField {...params} label="Device Status" variant="standard" />
              )}
              onChange={(e)=> {
                  props.currentNode.options.extras.deviceStatus = statusRelation[e.target.innerHTML];
                  props.currentNode.options.color = statusColors[statusRelation[e.target.innerHTML]+1];
                  setCurrentStatus(statusOptions[props.currentNode.options.extras.deviceStatus+1]);
                  engine.repaintCanvas();
                }
              }
            />);
  } else {
    return "";
  }
  }

  function GetUserComments(props) {
  if (props.currentNode !== undefined) {
    var [userNotes, setUserNotes] = new React.useState(props.currentNode.options.extras.userComments);
    return (
      <TextField
      key="UserComments"
        onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
          id="standard-multiline-flexible"
          label="Comments"
          multiline
          maxRows={4}
          variant="standard"
          style={{
            width:"100%"
          }}
          value= {props.currentNode.options.extras.userComments} 
          onChange={(val) => {
            setUserNotes(val.target.value)
            props.currentNode.options.extras.userComments = val.target.value;}}
        />)
  } else {
    return ""
  }
  }

function PartInfo(props) {
  let partName = ""
  if (props.currentNode !== undefined) {
    partName = props.currentNode.options.name
  }
  if (props.currentNode !== undefined && props.currentNode.options.name !== partName) {
    partName = props.currentNode.options.name
  }

  

  
  return (
    <div key="PartInfoTop">
      <div id="infoHeader"> {partName} </div>
      < SelectStatus currentNode={props.currentNode} />
      < GetPartDetails currentNode={props.currentNode} />
      < GetUserComments currentNode={props.currentNode} />
    </div>
  )
}

function GroupInfoSetting(props) {
  if (props.currentGroup !== undefined) {
    console.log(props.currentGroup)
    return (
      <div>
        {props.currentGroup.options.name}
      </div>
    )
  } else {
    return ("")
  }
}


var lastClick, selectedNode;
let commOptions = ["I2C", "SPI", "CLK", "Data", "GPIO", "UART"];
let powerOptions = ["V", "Vout", "Vin"]

function addNewPort(type, name, engine) {
  if (name !== "") {
    let newPort;
    if (type === "output") {
      newPort = selectedNode.addPort(new RightAnglePortModel(false, `${name}$-${selectedNode.options['id']}`, name));
    } else {
      newPort = selectedNode.addPort(new RightAnglePortModel(true, `${name}$-${selectedNode.options['id']}`, name));
    }
    if (commOptions.includes(name)) {
      newPort.options.color = "blue"
    } else if (powerOptions.includes(name)) {
      newPort.options.color = "red"
    } else {
      newPort.options.color = "gray"
    }
    engine.repaintCanvas();
  }
  $("div.newPortDiv").css("display","none");
  $("input#portInput")[0].value = null;
}

function deleteNode(engine) {
  let currentModel = engine.getModel();
  let inPort = selectedNode.getInPorts();
  let outPort = selectedNode.getOutPorts();
  inPort.map((port) => {
    Object.keys(port.links).map((link) => {
      currentModel.removeLink(link);
      return 1;
    });
    return 1;});
  outPort.map((port) => {
    Object.keys(port.links).map((link) => {
      currentModel.removeLink(link);
      return 1;
    });
    return 1;});
  currentModel.removeNode(selectedNode);
  engine.repaintCanvas();
  $("div.newPortDiv").css("display","none");
  selectedNode = undefined;
  setDisabled(true);
  $("div#selectedPartName").html("")
}
let selectedGroup;

function handleMouseUp(e) {
  if (selectedGroup !== undefined) {
    selectedGroup.options.clicked = false;
  }
}


function addNewGrouping(engine, name) {
  let model = engine.getModel();
  let newNode = new GroupingNodeModel({name: name, width: 50, height: 50, clicked:false});
  newNode.setPosition( ($(document ).width())/2, ($(document).height())/2);
  newNode.registerListener({
    selectionChanged: (e) => {
      if (e.isSelected) {
        selectedGroup = newNode;
      } else {
        selectedGroup = undefined;
      }
    }});
  model.addNode(newNode)
  console.log(newNode)
  engine.repaintCanvas();

}




function addNewNode(engine, partName, partInfo, setCurrentNode) {
  let numOfNodes = Object.keys(engine.getModel().getActiveNodeLayer().getModels()).length;
  let node = new DeviceNodeModel({
    name: partName,
    subname: partInfo[subtitle],
    color: "rgb(255,235,110)",
    extras: {
      miscInfo: {...partInfo},
      deviceStatus: 0,
      userComments: ""
    }
  });
  node.setPosition( ($(document ).width())/2 + numOfNodes*5, ($(document).height())/2 + numOfNodes*5);
  node.addPort(new RightAnglePortModel(true, `in${partName}-${numOfNodes}`, "In"));
  node.addPort(new RightAnglePortModel(false, `out${partName}-${numOfNodes}`, "Out"));;
  console.log(node)
  engine.getModel().addNode(node);
  node.registerListener({
    selectionChanged: (e) => {
      if (e.isSelected) {
        selectedNode = node;
        setCurrentNode(node);
        setDisabled(false);
      } else {
        selectedNode = undefined;
        setDisabled(true);
        engine.getModel().setLocked(false)
        setCurrentNode(undefined);
      }
    },
    entityRemoved: (e) => {
      selectedNode = undefined;
      setDisabled(true);
      engine.getModel().setLocked(false)
      setCurrentNode(undefined);
    }

  })
  engine.repaintCanvas();
}




var engine;

function DiagramApp() {
  //1) setup the diagram engine
  engine = createEngine({
   //registerDefaultDeleteItemsAction: false
  });
  engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());
  engine.getNodeFactories().registerFactory(new GroupingNodeFactory());
  engine.getNodeFactories().registerFactory(new DeviceNodeFactory());
  const state = engine.getStateMachine().getCurrentState();
  state.dragNewLink.config.allowLooseLinks = false;

  //2) setup the diagram model
  var model = new DiagramModel();
  // For use when importing, see smart routing example
  //5) load model into engine
  
  engine.setModel(model);
  //6) render the diagram!
  return (
    <div id='containerDiv' style={{zIndex:'-1', position:'absolute', left:0, top:0}} /*onMouseDown={(e) => handleMouseDown(e)}*/ onMouseUp={(e) => handleMouseUp(e)} >
      <CanvasWidget engine={engine} />
    </div>
  );
};



const drawerWidth = 425;
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const customStyles = {
  container: (provided) => ({
    ...provided,
    marginLeft:"2.5%",
    marginRight:"0%",
    width: "70%",
    float: "left",
    fontFamily: ["Roboto","Helvetica","Arial","sans-serif"],
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 100,
  })
}

function PersistentDrawerLeft(props) {
  const [open, setOpen] = React.useState(false);
  const [mbdUploaded, setMBDUploaded] = React.useState(false);
  const [disabledSection, setDisabledSection] = React.useState(true);
  const [subheading, setSubheading] = React.useState("");
  var [currentNode, setCurrentNode] = React.useState();
  var [currentGroup, setCurrentGroup] = React.useState();

  subtitle = subheading;
  setDisabled = setDisabledSection;

  const theme = createTheme({
    palette: {
      primary: {
        main: "#3d94f6"
      },
      secondary: {
        main: "#606060"
      }
    },
    direction: "ltr"
  })

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function selectInfo(partOptions, dictOfParts) {
    return (<Grid justify="flex-end" alignItems="center" container key="GridForAddParts" spacing={0}>
      <Grid key="PartSelectAutocomplete" item xs={8}>
        <Autocomplete
          style={{
            margin:"1%",
              marginLeft:"2.5%",
              marginRight:"0%",
              width:"95%"
          }}
          onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
            options={partOptions}
            className="partInput" 
            id="auto-select"
            autoSelect
            renderInput={(params) => (
              <TextField {...params} label="Select A Part" variant="standard" />
            )}
            onChange={(e) => {handleChange(e.target.innerHTML, dictOfParts[e.target.innerHTML]);}}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  addNewNode(engine, selectedPart[0], selectedPart[1], setCurrentNode);
              }
            }}
          />
        </Grid>
        <Grid key="PartSelectAutocompleteGrid" item xs={4}>
          <Button style={{width:'95%'}} variant="contained" onClick={() => {
            addNewNode(engine, selectedPart[0], selectedPart[1], setCurrentNode);
          }}> Add </Button>
        </Grid>
        </Grid>
        )
  }

  function GroupInfo() {
    var [textValue, setTextValue] = React.useState("")
    return (<Grid justify="flex-end" alignItems="center" container key="GridForNewGroup" spacing={0}>
      <Grid key="GroupInfoAutocomplete" item xs={8}>
          <TextField 
          onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
          value={textValue}
          style={{
            margin:"1%",
              marginLeft:"2.5%",
              marginRight:"0%",
              width:"95%"
          }} label="Add A Grouping" variant="standard" onChange={(e) => {
            setTextValue(e.target.value);
          }
          } onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addNewGrouping(engine, textValue);
              setTextValue("");
            }
          }}/>
        </Grid>
        <Grid key="NewGroupAutocompleteGrid" item xs={4}>
          <Button style={{width:'95%'}} variant="contained" onClick={() => {
            addNewGrouping(engine, textValue);
            setTextValue("");
          }}> Add </Button>
        </Grid>
        </Grid>
        )
  }
  
  function bomChange() {
    
    if (mbdUploaded) {
      let models = engine.getModel().getActiveNodeLayer().getModels();
      Object.values(models).map((node) => {
        if (node.options.type === 'device') {
          node.registerListener({
            selectionChanged: (e) => {
              if (e.isSelected) {
                selectedNode = node;
                setCurrentNode(node);
                setDisabled(false);
              } else {
                selectedNode = undefined;
                setDisabled(true);
                engine.getModel().setLocked(false)
                setCurrentNode(undefined);
              }
            },
            entityRemoved: (e) => {
              selectedNode = undefined;
              setDisabled(true);
              engine.getModel().setLocked(false)
              setCurrentNode(undefined);
            }
        
          })
        }
      });
      setMBDUploaded(false);
    }
    return (<div>
      <CsvProcessor setSubheading={setSubheading} setMBDUploaded={setMBDUploaded} engine={engine} drawerWidth={drawerWidth} setDictOfParts={props.setDictOfParts} setPartOptions={props.setPartOptions}/>
      </div>)
  }
  
  function portInput() {
    return (
        <TextField 
          id="portInput"
          key="portInputField"
          variant="standard"
          onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
          disabled={disabledSection} label="New Port"
          style={{margin:"1%",
          marginLeft:"2.5%",
          marginRight:"0%",
          width:"95%"}}/>
    )
  }
  
  function portButtons() {
    return (
      <Grid style={{marginLeft:"2.5%"}} container spacing={0} key="GridForPortButtons">
      <Grid item xs={6}>
        <Button variant="contained" disabled={disabledSection} className="portButton" onClick={() => addNewPort("input", document.getElementById("portInput").value, engine)}> Input </Button>
      </Grid>
      <Grid style={{marginLeft:"0%"}} item xs={6}>
        <Button variant="contained" disabled={disabledSection} className="portButton" onClick={() => addNewPort("output", document.getElementById("portInput").value, engine)}> Output </Button>
      </Grid>
      <Grid style={{marginTop:"1%"}} item xs={12}>
        <Button variant="contained" disabled={disabledSection} style={{minWidth:"95%", marginBottom:"5px"}} className="portButton" onClick={() => deleteNode(engine)}> Delete </Button>
      </Grid>
      </Grid>
    )
  }
  
  return (
    <ThemeProvider theme={theme}>
    <Box sx={{ display: 'flex'}}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Block Diagram Maker
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: "#6F6F6F"
          }
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader sx={{
          background: "#3d94f6",
          color: "white"
        }}>
          <ListItemText>
            Edit
          </ListItemText> 
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
        <ListItem key="BoM" disablePadding>
          {bomChange()}
        </ListItem>
        <Divider/>
        <ListItem key="Selection" disablePadding>
                <ListItemText primary={selectInfo(props.parts, props.dict)} />
        </ListItem>
        <ListItem key="GroupSelection" disablePadding>
                <GroupInfo />
        </ListItem>
        <Divider/>
        <CustomHeaders engine={engine} setDictOfParts={props.setDictOfParts} setPartOptions={props.setPartOptions} setSubheading={setSubheading}/>
        <Divider/>
        <CustomPart headers={Object.keys(Object.values(props.dict)[0])} addNode={addNewNode} engine={engine} setCurrentNode={setCurrentNode}/>
        <Divider/>
           <PartSearch drawerWidth={drawerWidth} addNode={addNewNode} setCurrentNode={setCurrentNode} engine={engine} dict={props.dict}/>
        <Divider/>
          <ListItem key="NewPortText" disablePadding disabled={disabledSection}>
                <ListItemText primary={portInput(disabledSection)} />
          </ListItem>
          <ListItem key="NewPortButtons" disablePadding disabled={disabledSection}>
                <ListItemText primary={portButtons(disabledSection)} />
          </ListItem>
          <Divider />
          <ListItem key="PartInfoSection">
            <ListItemText key="PartInfoText">
              <PartInfo key="PartFunction" currentNode={currentNode}/>
              <GroupInfoSetting key="GroupFunction" currentGroup={currentGroup}/>
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <Exporter drawerWidth={drawerWidth} engine={engine} dictOfParts={props.dict}/>
          </ListItem>
        </List>
        <Divider />
      </Drawer>
    </Box>
    </ThemeProvider>
  );
}



var selectedPart;
function handleChange(selectedOption, partInfo)  {
  selectedPart = [selectedOption, partInfo];
}



function PartSelect() {
  var [dictOfParts, setDictOfParts] = React.useState(defaultDictOfParts);
  var [partOptions, setPartOptions] = React.useState(defaultPartOptions);
  const inputFile = useRef(null);

  const onInputBtnClick = () => {
    inputFile.current.click();
  }

  return (
    <div id="selectDiv">
        <PersistentDrawerLeft setDictOfParts={setDictOfParts} setPartOptions={setPartOptions} parts={partOptions} dict={dictOfParts} inputFileInfo={[onInputBtnClick, inputFile]}> </PersistentDrawerLeft>
   </div>
  );
}

