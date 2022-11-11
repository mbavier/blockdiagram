import React from "react";

import PartSelect from "./PartSelect";
import DiagramApp from "./DiagramApp";



export default function App () {
  var [newPart, setNewPart] = React.useState(0);

  return (
     <div>
      <PartSelect  setNewPart={setNewPart}/>
      <DiagramApp newPart={newPart}/>
    </div>
    );
}
