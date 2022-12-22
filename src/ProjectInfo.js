import React from "react";
import { Box, MenuItem, Typography } from '@mui/material';
import { DataGrid, GridColDeff } from '@mui/x-data-grid';
import { utils } from "xlsx";

function BeginBoMGeneration(props) {

    let models = props.engine.getModel().activeNodeLayer.models;
    let statusOptions = ["Lost", "Pending", "Win"]
    let devices = []
    let id = 0;
    for (var node in models) {
        if (models[node].options.type === "device") {
            let newDict = {id: id, "Name": models[node].options.name || "", "Subtext": models[node].options.subname || "", "Device Status": statusOptions[models[node].options.extras.deviceStatus+1] || "", "Comments": models[node].options.extras.userComments || ""}
            if (models[node].options.extras.miscInfo !== undefined) {
                Object.keys(models[node].options.extras.miscInfo).map((info) => {
                    newDict[info] = models[node].options.extras.miscInfo[info]
                })
            }
            devices = [...devices, newDict]
            id = id + 1;
        }
    }
    if (devices.length === 0) {
        return (
            <Box sx={{ height: 520, width: '100%'}}>
                <Typography variant="h4" sx={{ margin: "5%"}}>
                    No Devices
                </Typography>
            </Box>
        )
    }
    const columns = Object.keys(devices[0]).map((header) => {
        return {
            field: header,
            flex: 1,
            headerName: header,
            editable: true
        }
    });

    return (
        <Box sx={{ height: 520, width: '100%'}}>
            <DataGrid 
            initialState={{
                columns: {
                    columnVisibilityModel: {
                        id: false,
                    }
                }
            }}
            columns={columns} 
            rows={devices}/>
        </Box>
    )


}

function DisplayProjectDetails() {
    return (
        <Box sx={{ height: 520, width: '100%'}}>
            <Typography variant="h6">
                Project Name
            </Typography>
        </Box>
    )
}

export default function ProjectInfo(props) {

    if (props.displayingInfo === 'bom') {
        return (
            <BeginBoMGeneration engine={props.engine} />
        )
    } else if (props.displayingInfo === 'project') {
        return (
            <DisplayProjectDetails />
        )
    } else {
        return ""
    }
}