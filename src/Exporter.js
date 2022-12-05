import React from "react";
import ListItemText from '@mui/material/ListItemText'
import { writeFile, utils } from "xlsx";


function beginExport(engine, dict) {
    let models = engine.getModel().activeNodeLayer.models;
    let headerArray = ["Name", ...Object.keys(dict[Object.keys(dict)[0]])];
    
    let pageArray = [headerArray];
    var wb = utils.book_new();
    for (var node in models) {
        pageArray = [...pageArray, [models[node].options['name'], ...Object.values(dict[models[node].options['name']])]];
    }
    var ws = utils.aoa_to_sheet(pageArray);
    utils.book_append_sheet(wb, ws, "Sheet1");
    writeFile(wb, "BoM.xlsx");
    
}

export default function Exporter (props) {

    const createButton = () => {
        return (
            <button id="selectBtns" onClick={() => {beginExport(props.engine, props.dictOfParts)}} style={{width:`${props.drawerWidth*.95}px`}}>Export Excel</button>
        );
    }

    return (
        <>
        <ListItemText primary={createButton()}/>
        </>
    )
}