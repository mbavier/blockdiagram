import React from 'react';
import { List, ListItem, ListItemText, ListItemButton, Button, Collapse, TextField } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';


export default function CustomPart(props) {
    const [open, setOpen] = React.useState(false)
    let blockOptions = ["Block Name", ...props.headers]
    var [blockName, setBlockName] = React.useState("")
    var [userOptions, setUserOptions] = React.useState({})
    const onInputBtnClick = () => {
        props.addNode(props.engine, blockName, userOptions, props.setCurrentNode)
    }

    const createButton = () => {
        return (
            <React.Fragment>
                <Button variant="contained" id="selectBtns" onClick={onInputBtnClick} style={{width:"95%"}}>Add</Button>
                <Button variant="contained" id="selectBtns" onClick={() => {onInputBtnClick(); props.closeDialog()}} style={{width:"95%"}}>Add and Close</Button>
            </React.Fragment>
        );
    }

    const createInputs = () => {
        function handleChange(e, header) {
            if (header === "Block Name") {
                setBlockName(e.target.value)
            } else {
                userOptions[header] = e.target.value
                setUserOptions(userOptions)
            }  
        }

        let output = blockOptions.map((header) => {
            return (<ListItem key={header} disablePadding> 
            <TextField onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)} 
            fullWidth value={userOptions.header} id="standard-basic" label={header} variant="standard" onChange={(e) => handleChange(e, header)} /> </ListItem>)
        });
        return (
            output
        );
    }

    return (
        <React.Fragment key="ListOfStuff">
                <List style={{width:"100%"}} key="CustomPartInputAndButton" component="div" disablePadding>
                    {createInputs()}
                    <ListItem key="CustomPartAdd" disablePadding style={{marginTop:"1%"}}>
                        {createButton()}
                    </ListItem>
                </List>
        </React.Fragment>
    )
}
