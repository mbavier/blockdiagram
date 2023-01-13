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
import { DeviceNodeModel, RightAnglePortModel } from './components/Device/DeviceNodeModel';

import { GroupingNodeFactory } from "./components/Grouping/GroupingNodeFactory";
import { GroupingNodeModel } from "./components/Grouping/GroupingNodeModel";

import $ from 'jquery';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from "@mui/material/SpeedDialAction";

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import CreateIcon from '@mui/icons-material/Create';

import ListItem from '@mui/material/ListItem';
import { Autocomplete, TextField, Grid, Menu, MenuItem, Input, InputLabel, DialogContentText, DialogActions } from "@mui/material";
import ListItemText from '@mui/material/ListItemText';
import { Button, ThemeProvider, createTheme } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import {Dialog, DialogContent} from '@mui/material'

import './App.css';
import CsvProcessor from "./CsvProcessor";
import PartSearch from "./PartSearch";
import Exporter from "./Exporter";
import CustomPart from "./CustomPart";
import CustomHeaders from "./CustomHeaders";
import ProjectInfo from "./ProjectInfo";
import JsonConnect from "./JsonConnect";
import { divide } from "lodash";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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
  "#FF3C32",
  "#FFEB6E",
  "#96FF6E"
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
      < SelectStatus currentNode={props.currentNode} />
      < GetPartDetails currentNode={props.currentNode} />
      < GetUserComments currentNode={props.currentNode} />
    </div>
  )
}

function GroupNameSetting(props) {
  var [partVal, setPartVal] = new React.useState(props.currentGroup.options.name);
  return (
  <Grid item xs={12}>
  <TextField variant="standard" key="GroupName" label="Grouping Name"
    onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
    style={{width:'100%'}} value= {props.currentGroup.options.name} onChange={(val) => {
      setPartVal(val.target.value)
      props.currentGroup.options.name = val.target.value;
      engine.repaintCanvas();
    }}/>
    </Grid>
    );
}

function GroupCommentSetting(props) {
    var [userNotes, setUserNotes] = new React.useState(props.currentGroup.options.userComments);
    return (
      <Grid item xs={12}>
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
          value= {props.currentGroup.options.userComments} 
          onChange={(val) => {
            setUserNotes(val.target.value);
            props.currentGroup.options.userComments = val.target.value;
            engine.repaintCanvas();
          }}
        />
      </Grid>)
}

function FontSetting(props) {
  var [textVal, setTextVal] = React.useState()
  var [alignment, setAlignment] = React.useState('left');

  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  return (
    <React.Fragment>
      <Grid item xs={2}>
        <Button style={{width:"100%", paddingTop:"12px", paddingBottom:"12px"}} variant="contained" aria-label="TextDecrease" onClick={() => {
          if (props.textGroup === "title") {
            props.currentGroup.options.titleFontSize--;
            setTextVal(props.currentGroup.options.titleFontSize);
          } else if (props.textGroup === "comment") {
            props.currentGroup.options.commentFontSize--;
            setTextVal(props.currentGroup.options.commentFontSize);
          }
          engine.repaintCanvas();
        }
        }>
          <TextDecreaseIcon />
        </Button>
      </Grid>
      <Grid style={{textAlign:"center", width:"50%", margin:"auto"}}item xs={2}>
      {props.textGroup === "title" ? props.currentGroup.options.titleFontSize : props.currentGroup.options.commentFontSize} </Grid>
      <Grid item xs={2}>
      <Button style={{width:"100%", paddingTop:"12px", paddingBottom:"12px"}} variant="contained" aria-label="TextIncrease" onClick={() => {
          if (props.textGroup === "title") {
            props.currentGroup.options.titleFontSize++;
            setTextVal(props.currentGroup.options.titleFontSize);
          } else if (props.textGroup === "comment") {
            props.currentGroup.options.commentFontSize++;
            setTextVal(props.currentGroup.options.commentFontSize);
          }
          engine.repaintCanvas();
        }}>
          <TextIncreaseIcon />
        </Button>
      </Grid>
      <Grid xs={5} style={{paddingLeft: '10px', paddingTop: '10px'}}>
      <ToggleButtonGroup
      style={{height:"50%"}}
      value={alignment}
      exclusive
      onChange={handleAlignment}
      aria-label="text alignment">
        <ToggleButton value="left" style={{width:"100%"}} variant="contained" aria-label="AlignLeft" onClick={() => {
          if (props.textGroup === "title") {
            props.currentGroup.options.titleFontAlignment = "left";
          } else if (props.textGroup === "comment") {
            props.currentGroup.options.commentFontAlignment = "left";
          }
          engine.repaintCanvas();
        }}>
          <FormatAlignLeftIcon/>
        </ToggleButton>
        <ToggleButton value="center" style={{width:"100%"}} variant="contained" aria-label="AlignCenter" onClick={() => {
          if (props.textGroup === "title") {
            props.currentGroup.options.titleFontAlignment = "center";
          } else if (props.textGroup === "comment") {
            props.currentGroup.options.commentFontAlignment = "center";
          }
          engine.repaintCanvas();
         }}>
          <FormatAlignCenterIcon/>
        </ToggleButton>
        <ToggleButton value="right" style={{width:"100%"}} variant="contained" aria-label="AlignRight" onClick={() => {
          if (props.textGroup === "title") {
            props.currentGroup.options.titleFontAlignment = "right";
          } else if (props.textGroup === "comment") {
            props.currentGroup.options.commentFontAlignment = "right";
          }
          engine.repaintCanvas();
        }}>
          <FormatAlignRightIcon/>
        </ToggleButton>
      </ToggleButtonGroup>
      </Grid>
    </React.Fragment>

  )
}

function GroupInfoSetting(props) {

  if (props.currentGroup !== undefined) {
    return (
      <React.Fragment key="GroupInfoSettings">
        <Grid key="GroupNameSetting" justify="flex-end" alignItems="center" container spacing={1}>
          <GroupNameSetting currentGroup={props.currentGroup}/>
          <FontSetting currentGroup={props.currentGroup} textGroup="title"/>
        </Grid>
        <Grid key="GroupCommentSetting" justify="flex-end" alignItems="center" container spacing={1}>
          <GroupCommentSetting currentGroup={props.currentGroup}/>
          <FontSetting currentGroup={props.currentGroup} textGroup="comment" />
        </Grid>
      </React.Fragment>
    )
  } else {
    return ("")
  }
}


var lastClick, selectedNode;
let commOptions = ["I2C", "SPI", "CLK", "Data", "GPIO", "UART"];
let powerOptions = ["V", "Vout", "Vin"]

function addNewPort(side, name, type, engine) {
  if (name !== "") {
    let newPort;
    newPort = selectedNode.addPort(new RightAnglePortModel(side, `${name}$-${selectedNode.options['id']}`, name));

    if (type === "Data") {
      
      newPort.options.color = "blue"
    } else if (type === "Power") {
      newPort.options.color = "red"
    } else {
      newPort.options.color = "gray"
    }
    engine.repaintCanvas();
  }
  // $("div.newPortDiv").css("display","none");
  // $("input#portInput")[0].value = null;
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


function addNewGrouping(engine, name, setCurrentGroup) {
  let model = engine.getModel();
  let newNode = new GroupingNodeModel({
    name: name, 
    width: 50, 
    height: 50, 
    clicked:false,
    userComments: "",
    titleFontSize: 12,
    titleFontAlignment: "center",
    commentFontSize: 12,
    commentFontAlignment: "center"});

  newNode.setPosition( ($(document ).width())/2, ($(document).height())/2);
  newNode.registerListener({
    selectionChanged: (e) => {
      if (e.isSelected) {
        selectedGroup = newNode;
        setCurrentGroup(newNode);
      } else {
        selectedGroup = undefined;
        setCurrentGroup(undefined);
      }
    },
    entityRemoved: (e) => {
      selectedGroup = undefined;
      engine.getModel().setLocked(false)
      setCurrentGroup(undefined);
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
    color: "#FFEB6E",
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

// const AppBar = styled(MuiAppBar, {
//   shouldForwardProp: (prop) => prop !== 'open',
// })(({ theme, open }) => ({
//   transition: theme.transitions.create(['margin', 'width'], {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.leavingScreen,
//   }),
//   ...(open && {
//     width: `calc(100% - ${drawerWidth}px)`,
//     marginRight: `${drawerWidth}px`,
//     transition: theme.transitions.create(['margin', 'width'], {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//   })
// }));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

function BlockDiagramMenu(props) {
  const [open, setOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);
  const [bottomOpen, setBottomOpen] = React.useState(false);
  const [pageEditOpen, setPageEditOpen] = React.useState(false);
  const [mbdUploaded, setMBDUploaded] = React.useState(false);
  const [disabledSection, setDisabledSection] = React.useState(true);
  const [subheading, setSubheading] = React.useState("");
  var [currentNode, setCurrentNode] = React.useState();
  var [currentColor, setCurrentColor] = React.useState();
  
  var [currentGroup, setCurrentGroup] = React.useState();
  var [displayingInfo, setDisplayingInfo] = React.useState(null);
  var [modelPages, setModelPages] = React.useState([{name: 'Page 1', model: engine.getModel()}]);
  var [currentPage, setCurrentPage] = React.useState(modelPages[0]);
  var [pageEditSelected, setPageEditSelected] = React.useState();
  var [projectInfoData, setProjectInfoData] = React.useState({name: "", timeline: "", category: "", projectType: "", keyPeople: "", comments: ""});
  var [partDialogOption, setPartDialogOption] = React.useState("none");


  subtitle = subheading;
  setDisabled = setDisabledSection;

  function handleAddPage() {
    console.log(modelPages); 
    var newModel = new DiagramModel();
    let newModelPages = [...modelPages]
    newModelPages[modelPages.length] = {name: `Page ${modelPages.length + 1}`, model: newModel}
    setCurrentPage(newModelPages[modelPages.length])
    setModelPages(newModelPages);
    
    engine.setModel(newModel)
    
  }

  function handlePageEditOpen(i) {
    setPageEditSelected(i);
    setPageEditOpen(true);
  }

  function handlePartDialogOpen(dialogOption) {
    setPartDialogOption(dialogOption);
  }

  function handlePartDialogClose() {
    setPartDialogOption("none");
  }

  function handlePageEditClose() {
    setPageEditOpen(false);
    let newName = document.getElementById("pageNameInput").value;
    let newModelPages = modelPages;
    console.log(newModelPages)
    newModelPages[pageEditSelected]['name'] = newName;
    //setModelPages(modelPages);
    
  }

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

  const handleRightDrawerOpen = () => {
    setRightOpen(true);
  };

  const handleRightDrawerClose = () => {
    setRightOpen(false);
  }

  const handleBottomDrawerOpen = () => {
    setBottomOpen(true);
  }

  const handleBottomDrawerClose = () => {
    setBottomOpen(false);
    setDisplayingInfo(null);
  }

  var allOpenStatus = (open || rightOpen);
  const handleAllDrawerClose = () => {
    setRightOpen(false);
    setOpen(false);
  }

  function SelectInfo(props) {
    let partOptions = props.partOptions;
    let dictOfParts = props.dictOfParts;
    return (<Grid justify="flex-end" alignItems="center" container key="GridForAddParts" spacing={1}>
      <Grid key="PartSelectAutocomplete" item xs={12}>
        <Autocomplete
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
        <Grid key="PartSelectAutocompleteGrid" item xs={6}>
          <Button fullWidth variant="contained" onClick={() => {
            addNewNode(engine, selectedPart[0], selectedPart[1], setCurrentNode);
          }}> Add </Button>
        </Grid>
          <Grid key="PartSelectAutocompleteGridClose" item xs={6}>
            <Button fullWidth variant="contained" onClick={() => {
              addNewNode(engine, selectedPart[0], selectedPart[1], setCurrentNode);
              props.closeDialog();
            }}> Add and Close </Button>
          </Grid>
        </Grid>
        )
  }

  function GroupInfo(props) {
    var [textValue, setTextValue] = React.useState("")
    return (<Grid justify="flex-end" alignItems="center" container key="GridForNewGroup" spacing={1}>
      <Grid key="GroupInfoAutocomplete" item xs={12}>
          <TextField 
          fullWidth
          onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
          value={textValue}
          label="Add A Grouping" variant="standard" onChange={(e) => {
            setTextValue(e.target.value);
          }
          } onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addNewGrouping(engine, textValue, props.setCurrentGroup);
              setTextValue("");
              e.target.blur();
            }
          }}/>
        </Grid>
        <Grid key="NewGroupAutocompleteGrid" item xs={6}>
          <Button fullWidth variant="contained" onClick={() => {
            addNewGrouping(engine, textValue, props.setCurrentGroup);
            setTextValue("");
          }}> Add </Button>
        </Grid>
        <Grid key="NewGroupAutocompleteAndCloseGrid" item xs={6}>
          <Button fullWidth variant="contained" onClick={() => {
            addNewGrouping(engine, textValue, props.setCurrentGroup);
            setTextValue("");
            props.closeDialog();
          }}> Add and Close</Button>
        </Grid>
        </Grid>
        )
  }

  const [alertOpen, setAlertOpen] = React.useState(false);

  const handleAlertOpen = () => {
    setAlertOpen(true);
    console.log()
}

  const handleAlertClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }

      setAlertOpen(false);
  }
  
  function BomChange() {
    if (mbdUploaded) {
      let models = engine.getModel().getActiveNodeLayer().getModels();
      Promise.all(Object.values(models).map((node) => {
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
        } else if (node.options.type === 'grouping') {
          node.registerListener({
            selectionChanged: (e) => {
              if (e.isSelected) {
                selectedGroup = node;
                setCurrentGroup(node);
              } else {
                selectedGroup = undefined;
                setCurrentGroup(undefined);
              }
            },
            entityRemoved: (e) => {
              selectedGroup = undefined;
              engine.getModel().setLocked(false)
              setCurrentGroup(undefined);
            }});
        }
      })).then(() => setMBDUploaded(false));
    }
    return (<div>
      <CsvProcessor handleAlertOpen={handleAlertOpen} setModelPages={setModelPages} setSubheading={setSubheading} setMBDUploaded={setMBDUploaded} engine={engine} drawerWidth={'425px'} setDictOfParts={props.setDictOfParts} setPartOptions={props.setPartOptions} setProjectInfoData={setProjectInfoData}/>
      </div>)
  }
  
  function PortInput() {
    return (
      <Autocomplete
      style={{
          margin:"1%",
          marginLeft:"2.5%",
          marginRight:"0%",
          width:"95%"
      }}
      onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
        options={(selectedNode !== undefined ? Object.keys(selectedNode.getPorts()).map((port) => {
          return (selectedNode.getPorts()[port].options.label)
        }) : ["Port Select"])}
        disabled={disabledSection}
        className="portTypeSelect" 
        id="portInput"
        key="portInputField"
        autoSelect
        defaultValue="New Port"
        renderInput={(params) => (
          <TextField {...params} label="Selected Port" variant="standard" />
        )}
      />
    )
  }
  
  function PortButtons() {
    var [alignment, setAlignment] = React.useState('left');
    var [portType, setPortType] = React.useState('General');


    const handleAlignment = (event, newAlignment) => {
      console.log(newAlignment)
      if (newAlignment !== null) {
        setAlignment(newAlignment);
      }
    };
    return (
      <Grid style={{marginLeft:"2.5%"}} container spacing={0} key="GridForPortButtons">
        
        <Grid item xs={6}>
        <Grid container>
          <Grid item xs={12}>
          <Autocomplete
          style={{
            marginBottom: "1%",
            marginRight: "2.5%"
          }}
          onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}
            options={["General", "Power", "Data"]}
            disabled={disabledSection}
            className="portTypeSelect" 
            id="auto-select"
            autoSelect
            defaultValue="General"
            renderInput={(params) => (
              <TextField {...params} label="Set Port Type" variant="standard" />
            )}
            onChange={(e) => {setPortType(e.target.innerHTML)}}
          />
          </Grid>
          <Grid item xs={12}>
          <ToggleButtonGroup
            value={alignment}
            exclusive
            size="small"
            onChange={handleAlignment}
            aria-label="text alignment"
            style={{width:'98%'}}>
            <ToggleButton disabled={disabledSection} style={{width:'50%'}} value="left" aria-label="left port">
              Left
            </ToggleButton>
            <ToggleButton disabled={disabledSection} style={{width:'50%'}} value="right" aria-label="right port">
              Right
            </ToggleButton>
          </ToggleButtonGroup>
          </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
        <Grid container height="100%">
          <Grid item xs={12}>
            <Button variant="contained" disabled={disabledSection} style={{minWidth:"95%", height:"38.75px", marginTop:"10px"}} className="portButton" onClick={() => addNewPort(alignment==="left", document.getElementById("portInput").value, portType, engine)}> Add </Button>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" disabled={disabledSection} style={{minWidth:"95%", marginTop:"3px", height:"38.75px",}} className="portButton" onClick={() => deleteNode(engine)}> Delete </Button>
          </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  function PartDrawer() {
    return (
      <React.Fragment>
          <MenuItem key='Part Info' onClick={() => {handleDrawerOpen(); handleClosePartsMenu();}}>
                    <Typography textAlign="center">Part Info</Typography>
          </MenuItem>
          
    </React.Fragment>
    )
  }
  
  const [anchorElFile, setAnchorElFile] = React.useState(null);
  const [anchorElProject, setAnchorElProject] = React.useState(null);
  const [anchorElHeaders, setAnchorElHeaders] = React.useState(null);
  const [anchorElParts, setAnchorElParts] = React.useState(null);

  const handleOpenFileMenu = (event) => {
    setAnchorElFile(event.currentTarget);
  }

  const handleOpenProjectMenu = (event) => {
    setAnchorElProject(event.currentTarget);
  }

  const handleOpenHeadersMenu = (event) => {
    setAnchorElHeaders(event.currentTarget);
  }
  const handleOpenPartsMenu = (event) => {
    setAnchorElParts(event.currentTarget);
  }

  const handleCloseFileMenu = (event) => {
    setAnchorElFile(null);
  }
  const handleCloseProjectMenu = (event) => {
    setAnchorElProject(null);
  }
  const handleCloseHeadersMenu = (event) => {
    setAnchorElHeaders(null);
  }
  const handleClosePartsMenu = (event) => {
    setAnchorElParts(null);
  }

  function AddPartDialog() {
    return (<Dialog fullWidth maxWidth={'sm'} open={partDialogOption === 'uploaded'} onClose={handlePartDialogClose}>
            <DialogContent>
              <DialogContentText>
                Add Uploaded Part:
              </DialogContentText>
              <DialogActions>
                <SelectInfo partOptions={props.parts} dictOfParts={props.dict} closeDialog={handlePartDialogClose}/>
              </DialogActions>
            </DialogContent>
          </Dialog>
    )
  }

  function SearchPartDialog() {
    return (<Dialog fullWidth maxWidth={'sm'} open={partDialogOption === 'search'} onClose={handlePartDialogClose}>
      <DialogContent>
        <DialogContentText>
          Search for a part:
        </DialogContentText>
        <TextField id="pageNameInput" variant="standard" onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}/>
        <DialogActions>
          <Button onClick={handlePartDialogClose}>Set Page Name</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
)
  }

  function CustomPartDialog() {
    return (<Dialog fullWidth maxWidth={'sm'} open={partDialogOption === 'custom'} onClose={handlePartDialogClose}>
      <DialogContent>
        <DialogContentText>
          Add Custom Part:
        </DialogContentText>
        <DialogActions>
          <CustomPart headers={Object.keys(Object.values(props.dict)[0])} addNode={addNewNode} engine={engine} setCurrentNode={setCurrentNode} closeDialog={handlePartDialogClose}/>
        </DialogActions>
      </DialogContent>
    </Dialog>
)
  }

  function AddGroupingDialog() {
    return (<Dialog open={partDialogOption === 'group'} onClose={handlePartDialogClose}>
      <DialogContent>
        <DialogContentText>
          Add Grouping:
        </DialogContentText>
        <DialogActions>
          <GroupInfo setCurrentGroup={setCurrentGroup} closeDialog={handlePartDialogClose}/>
        </DialogActions>
      </DialogContent>
    </Dialog>
)
  }

  const speedDialActions = [
    { icon: <AddIcon/>, name: 'Add Uploaded Part', actionClick: () => handlePartDialogOpen('uploaded') },
    { icon: <SearchIcon/>, name: 'Search for a part', actionClick: () => handlePartDialogOpen('search') },
    { icon: <CreateIcon/>, name: 'Add Custom Part', actionClick: () => handlePartDialogOpen('custom') },
    { icon: <GroupWorkOutlinedIcon/>, name: 'Add Grouping', actionClick: () => handlePartDialogOpen('group') }
  ];


  return (
    <ThemeProvider theme={theme}>
    <Box sx={{ display: 'flex'}}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Grid container>
            <Grid item xs={11}>
          <Box sx={{flex: '1'}}>
          <Typography variant="h6" noWrap component="div">
            Block Diagram Maker
          </Typography>
          <Button id="headerButton" variant="outlined" onClick={handleOpenFileMenu}>
            File
          </Button>
          <Menu
            sx={{ mt: '45px' }}
            id="file-appbar"
            anchorEl={anchorElFile}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElFile)}
            onClose={handleCloseFileMenu}
            >
             <Exporter engine={engine} projectInfoData={projectInfoData} dictOfParts={props.dict} modelPages={modelPages}/>
             <BomChange />
             <JsonConnect />
            </Menu>
            <Button id="headerButton" variant="outlined" onClick={handleOpenProjectMenu}>
            Project
          </Button>
          <Menu
            sx={{ mt: '45px' }}
            id="file-appbar"
            anchorEl={anchorElProject}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElProject)}
            onClose={handleCloseProjectMenu}
            >
              <MenuItem key='viewDetails' onClick={() => {handleBottomDrawerOpen(); handleCloseProjectMenu(); setDisplayingInfo('project')}}>
                <Typography textAlign="center">View Project Details</Typography>
            </MenuItem>
             <MenuItem key='viewBoM' onClick={() => {handleBottomDrawerOpen(); handleCloseProjectMenu(); setDisplayingInfo('bom')}}>
                <Typography textAlign="center">View BoM</Typography>
            </MenuItem>

            </Menu>
          <Button id="headerButton" variant="outlined" onClick={handleOpenHeadersMenu}>
            Headers
          </Button>
          <Menu
            sx={{ mt: '45px' }}
            id="headers-appbar"
            anchorEl={anchorElHeaders}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElHeaders)}
            onClose={handleCloseHeadersMenu}
            >
             <CustomHeaders engine={engine} setDictOfParts={props.setDictOfParts} setPartOptions={props.setPartOptions} setSubheading={setSubheading}/>
            </Menu>
            <Button id="headerButton" variant="outlined" onClick={handleOpenPartsMenu}>
            Parts
          </Button>
          <Menu
            sx={{ mt: '45px' }}
            id="parts-appbar"
            anchorEl={anchorElParts}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElParts)}
            onClose={handleClosePartsMenu}
            >
              <PartDrawer/>
            </Menu>
            </Box>
            </Grid>
            <Grid item xs={1} >
              <Grid style={{height:'100%'}}>
            <IconButton onClick={() => {((allOpenStatus) ? handleAllDrawerClose() : handleDrawerOpen())}}>
              {(allOpenStatus) ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
            </IconButton>
              </Grid>
            </Grid>
            </Grid>
            </Toolbar>
          </AppBar>
            <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: '%6F6F6F'
            }
          }}
          anchor="right"
          open={open}
          variant="persistent"
          >
            <DrawerHeader/>
          <List>
            <Typography variant="h6" style={{marginLeft:'2.5%'}}>{disabledSection ? "No Device Selected"  : currentNode.options.name} </Typography>
            <ListItem key="ColorSelect"  disablePadding disabled={disabledSection}>
                  <InputLabel style={{marginLeft:'2.5%', marginRight:'2.5%'}}>Block Color:</InputLabel>
                  <Input aria-label="test" type="color" style={{width:'72.5%'}} disabled={disabledSection} value={(currentNode !== undefined ? currentNode.options.color : "#000000")} onChange={ (e) => {
                    setCurrentColor(e.target.value)
                    currentNode.options.color = e.target.value
                    engine.repaintCanvas();
                  }
                  }/>
            </ListItem>
            <Divider style={{height:'10px'}}/>
            <ListItem key="NewPortText" disablePadding disabled={disabledSection}>
                  <PortInput disabledSection={disabledSection} />
            </ListItem>
            <ListItem key="NewPortButtons" disablePadding disabled={disabledSection}>
                  <PortButtons disabledSection={disabledSection} />
            </ListItem>
            <Divider style={{height:'10px'}}/>
            <ListItem key="PartInfoSection">
              <ListItemText key="PartInfoText">
                <PartInfo key="PartFunction" currentNode={currentNode}/>
              </ListItemText>
            </ListItem>
            <ListItem key="GroupInfoSection">
              <ListItemText key="GroupInfoText">
                <GroupInfoSetting key="GroupFunction" currentGroup={currentGroup}/>
              </ListItemText>
            </ListItem>
        </List>
      </Drawer>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '%6F6F6F'
          }
        }}
        anchor="right"
        open={rightOpen}
        onClose={handleRightDrawerClose}
        >
          <DrawerHeader/>
        <List>
          
          <ListItem key="Selection" disablePadding>
                  <SelectInfo partOptions={props.parts} dictOfParts={props.dict} />
          </ListItem>
          <ListItem key="GroupSelection" disablePadding>
                  <GroupInfo setCurrentGroup={setCurrentGroup}/>
          </ListItem>
          <Divider/>
          <CustomPart headers={Object.keys(Object.values(props.dict)[0])} addNode={addNewNode} engine={engine} setCurrentNode={setCurrentNode}/>
          <Divider/>
            <PartSearch drawerWidth={'425px'} addNode={addNewNode} setCurrentNode={setCurrentNode} engine={engine} dict={props.dict}/>
          <Divider/>
      </List>
      </Drawer>
      <Drawer
        sx={{
          width: '100%',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: '100%',
            boxSizing: 'border-box',
            background: '%6F6F6F'
          }
        }}
        anchor="bottom"
        open={bottomOpen}
        onClose={handleBottomDrawerClose}
        >
          <ProjectInfo engine={engine} displayingInfo={displayingInfo} setProjectInfoData={setProjectInfoData} projectInfoData={projectInfoData} />
      </Drawer>
      <Drawer
      sx={{
          width: '100%',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: '100%',
            boxSizing: 'border-box',
            background: '%6F6F6F'
          }
        }}
        variant="permanent"
        anchor="bottom">
          <ListItem disablePadding>
          {modelPages.map((page, i) => {
              return (<Button 
                      style={{width:`${1/(modelPages.length+2) * 100}%`, 
                              backgroundColor: `rgba(0,0,0,${0.5*(currentPage !== page)}`,
                              borderRadius:0,
                              color: 'rgb(0,0,0)'}} 
                      variant="outlined"
                      onDoubleClick={() => {handlePageEditOpen(i)}} 
                      onClick={() => {
                        engine.setModel(page['model']);
                        setCurrentPage(page)}} 
                        > 
                          {page['name']} 
                      </Button>)
          })}
          <Button style={{width:'10%'}} onClick={handleAddPage}>+</Button>
          </ListItem>
          <Dialog open={pageEditOpen} onClose={handlePageEditClose}>
            <DialogContent>
              <DialogContentText>
                Set Page Name:
              </DialogContentText>
              <TextField id="pageNameInput" variant="standard" onFocus={()=>{engine.getModel().setLocked(true)}} onBlur={()=>engine.getModel().setLocked(false)}/>
              <DialogActions>
                <Button onClick={handlePageEditClose}>Set Page Name</Button>
              </DialogActions>
            </DialogContent>
          </Dialog>
      </Drawer>
      
    </Box>
    <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
      <Alert onClose={handleAlertClose} severity="success" sx={{ width: '100%' }}>
              Success!
      </Alert>
    </Snackbar> 
    <SpeedDial color="primary" ariaLabel="Add Part SpeedDial" sx= {{position:'absolute', bottom:'50px', right:'16px'}} icon={<SpeedDialIcon/>}>
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.actionClick}
            />
          ))}
    </SpeedDial>
    <AddPartDialog/>
    <SearchPartDialog/>
    <CustomPartDialog/>
    <AddGroupingDialog/>
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
        <BlockDiagramMenu setDictOfParts={setDictOfParts} setPartOptions={setPartOptions} parts={partOptions} dict={dictOfParts} inputFileInfo={[onInputBtnClick, inputFile]}> </BlockDiagramMenu>
   </div>
  );
}