import React, { useEffect } from "react";
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



export default function DiagramApp(props) {
  //1) setup the diagram engine
  var engine = createEngine({
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
