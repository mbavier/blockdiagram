import React, {useRef} from "react";
import Select from 'react-select';


import { defaultDictOfParts, defaultPartOptions } from "./data";
import createEngine, { 
  /*DefaultLinkModel, */
  DefaultNodeModel,
  DiagramModel ,
  //PathFindingLinkFactory,
  DefaultPortModel,
  RightAngleLinkFactory,
	RightAngleLinkModel
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget,
} from '@projectstorm/react-canvas-core';
import { DeviceNodeFactory } from './components/Device/DeviceNodeFactory';
import { DeviceNodeModel } from './components/Device/DeviceNodeModel';


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
import ListItemText from '@mui/material/ListItemText';
import { ThemeProvider, createTheme } from '@mui/material';


import './App.css';
import CsvProcessor from "./CsvProcessor";
import CustomPart from "./CustomPart";
import Exporter from "./Exporter";

export class RightAnglePortModel extends DefaultPortModel {
	createLinkModel() {
		return new RightAngleLinkModel();
	}
}


function handleFileSelect(e, setDictOfParts, setPartOptions) {
  let file = e.target.files;
  let f = file[0];

  let reader = new FileReader();

  reader.onload = (function(e) {
    process(e.currentTarget.result, setDictOfParts, setPartOptions);
  });
    

  reader.readAsText(f);
}
function process(allText, setDictOfParts, setPartOptions) {
  let newDictOfParts = {};
  let newPartOptions = [];
  var allTextLines = allText.split('\r\n')
  var headers = allTextLines[0].split(',');
  console.log(allTextLines, headers);
  for (var i=1; i<allTextLines.length; i++) {
    console.log(i);
    var data = allTextLines[i].split(',');
        if (data.length === headers.length) {
          newDictOfParts[data[0]] = {}
          newPartOptions[i] = {value: data[0], label: data[0]}
            for (var j=1; j<headers.length; j++) {
              console.log(data[0], data[j])
              newDictOfParts[data[0]][headers[j]] = data[j];
            }
        }

  }
  setDictOfParts(newDictOfParts);
  setPartOptions(newPartOptions)
}

let setDisabled;

export default function App () {

  return (
     <div>
      <PartSelect />
      <DiagramApp />
    </div>
    );
}

let statusOptions = [
  {
    label: "Loss",
    value: -1
  },
  {
    label: "Pending",
    value: 0
  },
  {
    label: "Win",
    value: 1
  }]
  
let statusColors = [
  "rgb(255,60,50)",
  "rgb(255,235,110)",
  "rgb(150,255,110)"
]

function PartInfoInput(props) {
  var [partVal, setPartVal] = new React.useState(props.partInfo);
  return (<input 
    onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
    type='text' style={{width:'100%'}} value= {partVal} onChange={(val) => {
      setPartVal(val.target.value)
      props.currentNode.miscInfo[props.dictKey] = val.target.value;
    }}/>);
}

function GetPartDetails(props) {
  if (props.currentNode !== undefined) {
  let partInfo =  props.currentNode.miscInfo;
  return(Object.keys(partInfo).map((key) => {
      return (<div id="infoHeader" key={`PartInfo${key}`}> {key}: 
              < PartInfoInput dictKey={key} partInfo={partInfo[key]} currentNode={props.currentNode}/>
            </div>)}));
  } else {
    return ""
  }
}

  function SelectStatus(props) {
  if (props.currentNode !== undefined) {
    return (<Select options={statusOptions}
    className="partInput"
    style={customStyles}
    defaultValue={statusOptions[props.currentNode.deviceStatus+1]}
    onChange={(e)=> {
      props.currentNode.deviceStatus = e.value
      props.currentNode.options.color = statusColors[e.value+1]
      engine.repaintCanvas();
    }
    }
    />)
  } else {
    return ""
  }
  }

  function GetUserComments(props) {
  if (props.currentNode !== undefined) {
    var [userNotes, setUserNotes] = new React.useState(props.currentNode.userComments);
    return (
      <div id="infoHeader"> Comments:
    <textarea 
      onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
      style={{width:'100%', height:"100px"}} value= {userNotes} onChange={(val) => {
        setUserNotes(val.target.value)
        props.currentNode.userComments = val.target.value;
      }}/>
      </div>)
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


var lastClick, selectedNode;

function addNewPort(type, name, engine) {
  if (name !== "") {
    if (type === "output") {
      selectedNode.addPort(new RightAnglePortModel(false, `${name}$-${selectedNode.options['id']}`, name));;
    } else {
      selectedNode.addPort(new RightAnglePortModel(true, `${name}$-${selectedNode.options['id']}`, name));
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


function handleClick(e) {
    if (selectedNode !== undefined) {
        if (e.clientX > selectedNode.position.x && e.clientX < selectedNode.position.x + selectedNode.width) {
            if (e.clientY > selectedNode.position.y && e.clientY < selectedNode.position.y + selectedNode.height) {
            if (e.timeStamp - lastClick < 200) {
                $("div.newPortDiv").css("display","block");
            }
            }
        }
        
        lastClick = e.timeStamp;
    }
}





function addNewNode(engine, partName, partInfo, setCurrentNode) {
  let numOfNodes = Object.keys(engine.getModel().getActiveNodeLayer().getModels()).length;
  let node = new DefaultNodeModel({
    name: partName,
    color: "rgb(255,235,110)"
  });
  node.setPosition( ($(document ).width())/2 + numOfNodes*5, ($(document).height())/2 + numOfNodes*5);
  node.addPort(new RightAnglePortModel(true, `in${partName}-${numOfNodes}`, "In"));
  node.addPort(new RightAnglePortModel(false, `out${partName}-${numOfNodes}`, "Out"));;
  node.miscInfo = partInfo;
  node.deviceStatus = 0
  node.userComments = ""
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
        setCurrentNode(undefined);
      }
    },
    entityRemoved: (e) => {
      selectedNode = undefined;
      setDisabled(true);
    }

  })
  engine.repaintCanvas();
}




var engine;

// var pathfinding; // For use when importing
function DiagramApp() {
  //1) setup the diagram engine
  engine = createEngine({
   //registerDefaultDeleteItemsAction: false
  });
  engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());
  engine.getNodeFactories().registerFactory(new DeviceNodeFactory());
  const state = engine.getStateMachine().getCurrentState();
  state.dragNewLink.config.allowLooseLinks = false;

  //2) setup the diagram model
  var model = new DiagramModel();
  // pathfinding = engine.getLinkFactories().getFactory(PathFindingLinkFactory.NAME); // For use when importing, see smart routing example
  //5) load model into engine

  // const deviceNode = new DeviceNodeModel({color: 'rgb(192, 255, 0)', name: 'Test'});
  // deviceNode.setPosition(100, 100);
  // model.addNode(deviceNode);
  console.log(model)
  engine.setModel(model);
  //6) render the diagram!
  
  return (
    <div id='containerDiv' style={{zIndex:'-1', position:'absolute', left:0, top:0}} onMouseDown={(e) => handleClick(e)}  >
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
  const [disabledSection, setDisabledSection] = React.useState(true);
  var [currentNode, setCurrentNode] = React.useState();
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
    return (<>
    <Select 
    onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
    className="partInput" options={partOptions} styles={customStyles} onChange={(e) => {handleChange(e, dictOfParts[e.value])}} onKeyDown={(e) => {
      if (e.key === 'Enter') {
          addNewNode(engine, selectedPart[0], selectedPart[1], setCurrentNode);
      }
        }}/>
        <button id="selectBtns" onClick={() => {
          addNewNode(engine, selectedPart[0], selectedPart[1], setCurrentNode);
        }}> Add </button></>
        )
  }
  
  function bomChange() {
    return (<div>
      <CsvProcessor drawerWidth={drawerWidth} setDictOfParts={props.setDictOfParts} setPartOptions={props.setPartOptions}/>
      </div>)
  }
  
  function portInput() {
    return (
        <input onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)} disabled={disabledSection} id="portInput" type="text" placeholder="New Port Name"></input>
    )
  }
  
  function portButtons() {
    return (
      <>
        <button disabled={disabledSection} className="portButton" onClick={() => addNewPort("input", document.getElementById("portInput").value, engine)}> Input </button>
        <button disabled={disabledSection} className="portButton" onClick={() => addNewPort("output", document.getElementById("portInput").value, engine)}> Output </button>
      </>
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
        <Divider/>
           <CustomPart drawerWidth={drawerWidth} addNode={addNewNode} setCurrentNode={setCurrentNode} engine={engine} dict={props.dict}/>
        <Divider/>
        <ListItem>
          <ListItemText sx={{
            color: "white"
          }}>
            Part Selected: <div id="selectedPartName" style={{display:"inline-block"}}></div>
          </ListItemText>
          </ListItem>
          <ListItem key="NewPortText" disablePadding disabled={disabledSection}>
                <ListItemText primary={portInput(disabledSection)} />
          </ListItem>
          <ListItem key="NewPortButtons" disablePadding disabled={disabledSection}>
                <ListItemText primary={portButtons(disabledSection)} />
          </ListItem>
          <ListItem disablePadding disabled={disabledSection}>
            <button disabled={disabledSection} style={{minWidth:"95%", marginBottom:"5px"}} className="portButton" onClick={() => deleteNode(engine)}> Delete </button>
          </ListItem>
          <Divider />
          <ListItem key="PartInfoSection">
            <ListItemText key="PartInfoText">
              <PartInfo key="PartFunction" currentNode={currentNode}/>
            {/* <div id="PartInfoName" style={{fontSize:16}}> </div>
            <div id="PartInfoDetails" style={{fontSize:12}}> </div> */}
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
  selectedPart = [selectedOption['value'], partInfo];
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
        <input type="file" id="file" ref={inputFile} style={{display:"none"}} onChange={(e) => {handleFileSelect(e, setDictOfParts, setPartOptions);}}/>
        <PersistentDrawerLeft setDictOfParts={setDictOfParts} setPartOptions={setPartOptions} parts={partOptions} dict={dictOfParts} inputFileInfo={[onInputBtnClick, inputFile]}> </PersistentDrawerLeft>
   </div>
  );
}

