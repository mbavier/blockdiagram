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
	LinkModel,
	RightAngleLinkModel
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget,
} from '@projectstorm/react-canvas-core';

import $ from 'jquery';

import { styled, useTheme } from '@mui/material/styles';
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
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

import './App.css';
import { ListSubheader } from "@mui/material";

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
        if (data.length == headers.length) {
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


var lastClick, selectedNode;

function addNewPort(type, name, engine) {
  if (name != "") {
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
    Object.keys(port.links).map((link) => {currentModel.removeLink(link)})});
  outPort.map((port) => {
    Object.keys(port.links).map((link) => {currentModel.removeLink(link)})});
  currentModel.removeNode(selectedNode);
  engine.repaintCanvas();
  $("div.newPortDiv").css("display","none");
  $("div.infoDiv").css("display", "none");
  $("div.infoDiv").html("");
}


function handleClick(e) {
    if (selectedNode != undefined) {
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


function addNewNode(engine, partName, partInfo) {
  let numOfNodes = Object.keys(engine.getModel().getActiveNodeLayer().getModels()).length;
  let node = new DefaultNodeModel({
    name: partName,
    color: "rgb(0,192,255)"
  });
  node.setPosition( ($(document ).width())/2 + numOfNodes*5, ($(document).height())/2 + numOfNodes*5);
  node.addPort(new RightAnglePortModel(true, `in${partName}-${numOfNodes}`, "In"));
  node.addPort(new RightAnglePortModel(false, `out${partName}-${numOfNodes}`, "Out"));;
  engine.getModel().addNode(node);
  node.registerListener({
    selectionChanged: (e) => {
      if (e.isSelected) {
        $("div.infoDiv").css("display", "block");
        Object.keys(partInfo).map((block) => $("div.infoDiv").append("<p>" + block + ": " + partInfo[block] + "</p>"));
        selectedNode = node;
        setDisabled(false);
        $("div#selectedPartName").html(partName)
      } else{
        $("div.infoDiv").css("display", "none");
        $("div.infoDiv").html("");
        selectedNode = undefined;
        setDisabled(true);
        $("div#selectedPartName").html("")
      }
    },

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
  //2) setup the diagram model
  var model = new DiagramModel();
  // pathfinding = engine.getLinkFactories().getFactory(PathFindingLinkFactory.NAME); // For use when importing, see smart routing example
  //5) load model into engine
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

function selectInfo(partOptions, dictOfParts) {
  return (<>
  <Select className="partInput" defaultValue={partOptions[0]} options={partOptions} styles={customStyles} onChange={(e) => {handleChange(e, dictOfParts[e.value])}} onKeyDown={(e) => {
    if (e.key === 'Enter') {
        addNewNode(engine, selectedPart[0], selectedPart[1]);
    }
      }}/>
      <button id="selectBtns" onClick={() => {
        addNewNode(engine, selectedPart[0], selectedPart[1]);
      }}> Add </button></>
      )
}

function bomChange(onInputBtnClick) {
  return (<button id="selectBtns" onClick={onInputBtnClick} style={{width:drawerWidth-15}}>Change BoM</button>)
}

function portInput(disabledSection) {
  return (
      <input onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)} disabled={disabledSection} id="portInput" type="text" placeholder="New Port Name"></input>
  )
}

function portButtons(disabledSection) {
  return (
    <>
      <button disabled={disabledSection} class="portButton" onClick={() => addNewPort("input", document.getElementById("portInput").value, engine)}> Input </button>
      <button disabled={disabledSection} class="portButton" onClick={() => addNewPort("output", document.getElementById("portInput").value, engine)}> Output </button>
    </>
  )
}


function PersistentDrawerLeft(props) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [disabledSection, setDisabledSection] = React.useState(true);
  setDisabled = setDisabledSection;


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
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
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
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
          <ListItemText primary={bomChange(props.inputFileInfo[0])}></ListItemText>
        </ListItem>
        <Divider/>
        <ListItem key="Selection" disablePadding>
                <ListItemText primary={selectInfo(props.parts, props.dict)} />
        </ListItem>
        <Divider/>
        <ListSubheader>
          Part Selected: <div id="selectedPartName" style={{display:"inline-block"}}></div>
          </ListSubheader>
          <ListItem key="NewPortText" disablePadding disabled={disabledSection}>
                <ListItemText primary={portInput(disabledSection)} />
          </ListItem>
          <ListItem key="NewPortButtons" disablePadding disabled={disabledSection}>
                <ListItemText primary={portButtons(disabledSection)} />
          </ListItem>
          <ListItem disablePadding disabled={disabledSection}>
          <button disabled={disabledSection} style={{minWidth:"95%"}}className="portButton" onClick={() => deleteNode(engine)}> Delete </button>
          </ListItem>
        </List>
        <Divider />
      </Drawer>
    </Box>
  );
}

const customStyles = {
  container: (provided) => ({
    ...provided,
    margin:"4px",
    width: "300px",
    float: "left",
    fontFamily: "Arial"
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 100
  })
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
        <input type="file" id="file" ref={inputFile} style={{display:"none"}} onChange={(e) => {handleFileSelect(e, setDictOfParts, setPartOptions)}}/>
        <PersistentDrawerLeft parts={partOptions} dict={dictOfParts} inputFileInfo={[onInputBtnClick, inputFile]}> </PersistentDrawerLeft>
   </div>
  );
}

