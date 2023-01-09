import React from "react";
import { Box, MenuItem, Typography, TextField } from '@mui/material';
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

function DisplayProjectDetails(props) {
    return (
        <Box sx={{ height: 520, width: '95%', marginLeft:'2.5%'}}>
            <Typography variant="h6">
                Project Info
            </Typography>
            <TextField variant="standard" key='projectNameInput' label="Project Name:"
                onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)}
                style={{width:'100%'}} value= {props.projectInfoData.name} 
                onChange={(val) => {
                    let newProjectInfo = {...props.projectInfoData}
                    newProjectInfo.name = val.target.value
                    props.setProjectInfoData(newProjectInfo)
            }}/>
            <TextField variant="standard" key='projectTimelineInput' label="Project Timeline:"
                onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)}
                style={{width:'100%'}} value= {props.projectInfoData.timeline} 
                onChange={(val) => {
                    let newProjectInfo = {...props.projectInfoData}
                    newProjectInfo.timeline = val.target.value
                    props.setProjectInfoData(newProjectInfo)
            }}/>
            <TextField variant="standard" key='projectCategoryInput' label="Project Category:"
                onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)}
                style={{width:'100%'}} value= {props.projectInfoData.category} 
                onChange={(val) => {
                    let newProjectInfo = {...props.projectInfoData}
                    newProjectInfo.category = val.target.value
                    props.setProjectInfoData(newProjectInfo)
            }}/>
            <TextField variant="standard" key='projectTypeInput' label="Project Type:"
                onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)}
                style={{width:'100%'}} value= {props.projectInfoData.projectType} 
                onChange={(val) => {
                    let newProjectInfo = {...props.projectInfoData}
                    newProjectInfo.projectType = val.target.value
                    props.setProjectInfoData(newProjectInfo)
            }}/>
            <TextField variant="standard" key='projectKeyPeopleInput' label="Key People:"
                id='standard-multiline-flexible'
                multiline
                maxRows={6}
                onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)}
                style={{width:'100%'}} value= {props.projectInfoData.keyPeople} 
                onChange={(val) => {
                    let newProjectInfo = {...props.projectInfoData}
                    newProjectInfo.keyPeople = val.target.value
                    props.setProjectInfoData(newProjectInfo)
            }}/>
            <TextField 
                id='standard-multiline-flexible'
                multiline
                maxRows={6}
                variant="standard" key='projectCommnetsInput' label="Project Comments:"
                onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)}
                style={{width:'100%'}} value= {props.projectInfoData.comments} 
                onChange={(val) => {
                    let newProjectInfo = {...props.projectInfoData}
                    newProjectInfo.comments = val.target.value
                    props.setProjectInfoData(newProjectInfo)
            }}/>
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
            <DisplayProjectDetails engine={props.engine} projectInfoData={props.projectInfoData} setProjectInfoData={props.setProjectInfoData} />
        )
    } else {
        return ""
    }
}