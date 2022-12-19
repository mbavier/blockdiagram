import React from "react";
import ListItemText from '@mui/material/ListItemText'
import { Button, Grid } from '@mui/material'
import { writeFile, utils } from "xlsx";
import { DiagramModel } from "@projectstorm/react-diagrams"


function beginExcelExport(engine, dict) {
    let models = engine.getModel().activeNodeLayer.models;
    let headerArray = ["Name", ...Object.keys(dict[Object.keys(dict)[0]]), "Device Status", "Comments"];
    let pageArray = [headerArray];
    var wb = utils.book_new();
    let possibleStatus = ["Loss", "Pending", "Win"]

    for (var node in models) {
        if (Object.keys(models[node].options.extras.miscInfo).length == Object.keys(dict[Object.keys(dict)[0]]).length) {
            pageArray = [...pageArray, [models[node].options.name, ...Object.values(models[node].options.extras.miscInfo), possibleStatus[models[node].options.extras.deviceStatus+1], models[node].options.extras.userComments]];
        }
    }
    var ws = utils.aoa_to_sheet(pageArray);
    utils.book_append_sheet(wb, ws, "Sheet1");
    writeFile(wb, "BoM.xlsx");
    
}
  

async function beginCanvasExport(engine) {
    engine.zoomToFit();
    engine.getModel();
    //engine.getModel().setZoomLevel(100);
    //engine.getModel().setOffset(-window.innerWidth/1.275, -window.innerHeight/2)
    await engine.repaintCanvas();
    window.print()
    // var pdf = new jspdf("landscape");
    // var savedModel = engine.getModel().serialize()
    // engine.zoomToFitNodes()
    // var canvas = engine.getCanvas();
    // const data = await html2canvas(canvas);
    // const img = data.toDataURL("image/png");
    // const imgProperties = pdf.getImageProperties(img);
    // console.log(imgProperties)
    // const pdfWidth = pdf.internal.pageSize.setWidth(imgProperties.width);
    // const pdfHeight = pdf.internal.pageSize.setHeight(imgProperties.height);

    // pdf.addImage(img, "PNG", 0, 0);
    // pdf.save("test.pdf")
    // console.log(savedModel)
    // let oldModel = new DiagramModel();
    // oldModel.deserializeModel(savedModel, engine)
    // engine.setModel(oldModel);
    // engine.repaintCanvas();
}

async function beginBDExport(engine) {
    var savedModel = engine.getModel().serialize()

    const file = new Blob([JSON.stringify(savedModel)], {type: 'text/json'});
    const href = await URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = href;
    link.download = "blockDiagram" + Date.now() + ".mbd";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export default function Exporter (props) {

    const createButton = () => {
        return (
                <Grid style={{marginLeft:"2.5%"}} container spacing={0} key="GridForExport">
                    <Grid item xs={6}>
                        <Button variant="contained" id="exportBtns" onClick={() => {beginBDExport(props.engine, props.dictOfParts)}} className="portButton">Export Save File</Button>
                    </Grid>
                    <Grid style={{marginLeft:"0%"}} item xs={6}>
                        <Button variant="contained" id="exportBtns" onClick={() => {beginExcelExport(props.engine, props.dictOfParts)}} className="portButton">Export Excel</Button>
                    </Grid>
                {/* <button id="exportBtns" onClick={() => {beginCanvasExport(props.engine, props.dictOfParts)}} style={{width:'45%'}}>Export PDF</button> */}
                </Grid>
        );
    }

    return (
        <>
        <ListItemText primary={createButton()}/>
        </>
    )
}