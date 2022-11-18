import React from "react";
import Select from 'react-select';

import { defaultDictOfParts, defaultPartOptions } from "./data";
import createEngine, { 
  /*DefaultLinkModel, */
  DefaultNodeModel,
  DiagramModel 
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget,
} from '@projectstorm/react-canvas-core';

import $ from 'jquery';

import './App.css';



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
      selectedNode.addOutPort(name);
    } else {
      selectedNode.addInPort(name);
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
        console.log(selectedNode)
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
  console.log(partName);
  let numOfNodes = Object.keys(engine.getModel().getActiveNodeLayer().getModels()).length;
  let node = new DefaultNodeModel({
    name: partName,
    color: "rgb(0,192,255)"
  });
  node.setPosition(200 + numOfNodes*5, 200 + numOfNodes*5);
  node.addInPort("In");
  node.addOutPort("Out");
  engine.getModel().addNode(node);
  node.registerListener({
    selectionChanged: (e) => {
      if (e.isSelected) {
        $("div.infoDiv").css("display", "block");
        console.log(node);
        Object.keys(partInfo).map((block) => $("div.infoDiv").append("<p>" + block + ": " + partInfo[block] + "</p>"));
        selectedNode = node;
      } else{
        $("div.infoDiv").css("display", "none");
        $("div.infoDiv").html("");
      }
    },

  })
  console.log(engine);
  engine.repaintCanvas();
}

var engine;
function DiagramApp() {
  //1) setup the diagram engine
  engine = createEngine({
    registerDefaultDeleteItemsAction: false
  });
  //2) setup the diagram model
  var model = new DiagramModel();

  //5) load model into engine
  engine.setModel(model);
  //6) render the diagram!
  return (
    <div>
    <div className="newPortDiv">
        <div className="newPortText">Add a new port:</div>
        <input id="portInput" type="text" placeholder="Node Name"></input>
        <div className="buttonDiv">
          <button className="portButton" onClick={() => addNewPort("input", document.getElementById("portInput").value, engine)}> Input </button>
          <button className="portButton" onClick={() => addNewPort("output", document.getElementById("portInput").value, engine)}> Output </button>
          <button className="portButton" onClick={() => deleteNode(engine)}> Delete </button>
        </div>
    </div>
    <div id='containerDiv' style={{zIndex:'-1', position:'absolute', left:0, top:0}} onMouseDown={(e) => handleClick(e)}  >
      <CanvasWidget engine={engine} />
      </div>
    <div className='infoDiv'></div>
    </div>
  );
};

const customStyles = {
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
  return (
    <div>
         <button onClick={() => {setDictOfParts({...dictOfParts, "Test": {
        "Description": "5-V 5-A boost converter with PG and PFM/PWM control",
        "Ordering & quality": "Ordering & quality",
        "SubFamily": "Boost converters (integrated switch)",
        "Rating": "Catalog",
        "TI functional safety category": " --- ",
        "\"Operating temperature range\n(C)\"": "-40 to 125",
        "Package size: mm2:W x L (PKG)": "3 mm2: 1.2 x 2.1 (SOT-5X3|8)",
        "Package Group": "SOT-5X3|8",
        "\"Approx. price\n(USD)\"": "$0.600 | 1ku",
        "Status": "PREVIEW"
    }});
    setPartOptions([...partOptions, {
      "value": "Test",
      "label": "Test"
  }]);
    }}> Change input</button>
  <Select className="partInput" defaultValue={partOptions[0]} options={partOptions} styles={customStyles} onChange={(e) => {handleChange(e, dictOfParts[e.value])}} onKeyDown={(e) => {
    if (e.key === 'Enter') {
        console.log(selectedPart)
        addNewNode(engine, selectedPart[0], selectedPart[1]);
    }
  }}
  />
  // </div>
  );
}