import React from "react";
import createEngine, { 
  /*DefaultLinkModel, */
  DefaultNodeModel,
  DiagramModel 
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget
} from '@projectstorm/react-canvas-core';

import Select from 'react-select';
import $ from 'jquery';

import './App.css';

const customStyles = {
  menu: (provided) => ({
    ...provided,
    zIndex: 100
  })
}

$(document).ready(function() {
  $.ajax({
    type: "GET",
    url: "parts.csv",
    dataType: "text",
    success: function(data) {process(data);}
  });
});

var dictOfParts = {};
var partOptions = [];

let selectedPart;
  function handleChange(selectedOption)  {
    selectedPart = selectedOption;
  }

function process(allText) {
  var allTextLines = allText.split('\r\n')
  var headers = allTextLines[0].split(',');
  for (var i=1; i<allTextLines.length; i++) {
    var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            dictOfParts[data[0]] = {}
            partOptions[i] = {value: data[0], label: data[0]}
            for (var j=1; j<headers.length; j++) {
                dictOfParts[data[0]][headers[j]] = data[j];
            }
        }

  }
  console.log(dictOfParts);
  console.log(partOptions)
}


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
  engine.repaintCanvas()
}

export default () => {

  
  //1) setup the diagram engine
  var engine = createEngine();

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
    <div id='containerDiv' style={{zIndex:'-1', position:'absolute', left:0, top:0}}>
      <CanvasWidget engine={engine} />
      </div>
    </div>
  );
};
