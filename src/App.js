<<<<<<< Updated upstream
import React from "react";
=======
import React, {useRef} from "react";
import Select from 'react-select';

import { defaultDictOfParts, defaultPartOptions } from "./data";
>>>>>>> Stashed changes
import createEngine, { 
  /*DefaultLinkModel, */
  DefaultNodeModel,
  DiagramModel 
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget,
} from '@projectstorm/react-canvas-core';

import Select from 'react-select';
import $ from 'jquery';

import { dictOfParts, partOptions } from "./data";

import './App.css';
// $(document).ready(function() {
//     $("#file").on('change', function() {
//       let reader = new FileReader();
//       console.log($(reader.readAsText("#file").prop('files')[0]));
//     })
//   });
  
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

const customStyles = {
  menu: (provided) => ({
    ...provided,
    zIndex: 100
  })
}

let selectedPart;
  function handleChange(selectedOption)  {
    selectedPart = selectedOption;
  }

// $(document).ready(function() {
//   $.ajax({
//     type: "GET",
//     url: "parts.csv",
//     dataType: "text",
//     success: function(data) {process(data);}
//   });
// });



// var dictOfParts = {};
// var partOptions = [];



// function process(allText) {
//   var allTextLines = allText.split('\r\n')
//   var headers = allTextLines[0].split(',');
//   console.log(allTextLines, headers);
//   for (var i=1; i<allTextLines.length; i++) {
//     console.log(i);
//     var data = allTextLines[i].split(',');
//         if (data.length == headers.length) {
//             dictOfParts[data[0]] = {}
//             partOptions[i] = {value: data[0], label: data[0]}
//             for (var j=1; j<headers.length; j++) {
//               console.log(data[0], data[j])
//                 dictOfParts[data[0]][headers[j]] = data[j];
//             }
//         }

//   }
//   console.log(dictOfParts);
//   console.log(partOptions)
// }

var selectedNodeX, selectedNodeY, selectedNodeWidth, selectedNodeHeight, selectedNode;
function addNewNode(engine, partName) {
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
        Object.keys(dictOfParts[partName]).map((block) => $("div.infoDiv").append("<p>" + block + ": " + dictOfParts[partName][block] + "</p>"));
        selectedNodeX = node.position.x;
        selectedNodeY = node.position.y;
        selectedNodeWidth = node.width;
        selectedNodeHeight = node.height;
        selectedNode = node;
      } else{
        $("div.infoDiv").css("display", "none");
        $("div.infoDiv").html("");
      }
    },

  })
  engine.repaintCanvas()
}

var engine;

var lastClick;

function addNewPort(type, name) {
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

function deleteNode() {
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
  if (e.clientX > selectedNodeX && e.clientX < selectedNodeX + selectedNodeWidth) {
    if (e.clientY > selectedNodeY && e.clientY < selectedNodeY + selectedNodeHeight) {
      if (e.timeStamp - lastClick < 200) {
        $("div.newPortDiv").css("display","block");
      }
    }
  }
  lastClick = e.timeStamp;
}

export default () => {

  
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
    <Select className="partInput" defaultValue={partOptions[0]} options={partOptions} styles={customStyles} onChange={handleChange} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            console.log(selectedPart);
            addNewNode(engine, selectedPart.value);
          }
        }}
          
        />
    <div className="newPortDiv">
        <div className="newPortText">Add a new port:</div>
        <input id="portInput" type="text" placeholder="Node Name"></input>
        <div className="buttonDiv">
          <button className="portButton" onClick={() => addNewPort("input", document.getElementById("portInput").value)}> Input </button>
          <button className="portButton" onClick={() => addNewPort("output", document.getElementById("portInput").value)}> Output </button>
          <button className="portButton" onClick={() => deleteNode()}> Delete </button>
        </div>
    </div>
    <div id='containerDiv' style={{zIndex:'-1', position:'absolute', left:0, top:0}} onMouseDown={(e) => handleClick(e)} >
      <CanvasWidget engine={engine} />
      </div>
    <div className='infoDiv'></div>
    </div>
  );
};
<<<<<<< Updated upstream
=======

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
  const inputFile = useRef(null);

  const onInputBtnClick = () => {
    inputFile.current.click();
  }

  return (
    <div>
        <input type="file" id="file" ref={inputFile} style={{display:"none"}} onChange={(e) => {handleFileSelect(e, setDictOfParts, setPartOptions)}}/>
         
  <Select className="partInput" defaultValue={partOptions[0]} options={partOptions} styles={customStyles} onChange={(e) => {handleChange(e, dictOfParts[e.value])}} onKeyDown={(e) => {
    if (e.key === 'Enter') {
        console.log(selectedPart)
        addNewNode(engine, selectedPart[0], selectedPart[1]);
    }
  }}
  />
  <button onClick={onInputBtnClick}> Change input</button>
   </div>
  );
}
>>>>>>> Stashed changes
