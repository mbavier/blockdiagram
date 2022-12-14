import React from 'react';
import { List, ListItem, ListItemText, ListItemButton, Button, Collapse, TextField } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';


export default function CustomPart(props) {
    const [open, setOpen] = React.useState(false)
    let blockOptions = ["Block Name", ...props.headers]
    var [blockName, setBlockName] = React.useState("")
    var [userOptions, setUserOptions] = React.useState({})
    const handleClick = () => {
        setOpen(!open);
    }
    const onInputBtnClick = () => {
        props.addNode(props.engine, blockName, userOptions, props.setCurrentNode)
        setOpen(!open);
    }

    const createButton = () => {
        return (
            <Button variant="contained" id="selectBtns" onClick={onInputBtnClick} style={{width:"95%"}}>Add Part</Button>
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
            return (<ListItem key={header} style={{marginLeft:"2.5%"}} disablePadding> 
            <TextField onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)} 
            style={{width:"95%"}} value={userOptions.header} id="standard-basic" label={header} variant="standard" onChange={(e) => handleChange(e, header)} /> </ListItem>)
        });
        return (
            output
        );
    }

    return (
        <React.Fragment key="ListOfStuff">
            <ListItemButton key="ExpandCustomBlock" onClick={handleClick}>
                <ListItemText primary="Add Custom Block"/>
                {open ? <ExpandLess/> : <ExpandMore/>}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List key="CustomPartInputAndButton" component="div" disablePadding>
                    {createInputs()}
                    <ListItem key="CustomPartAdd" disablePadding style={{marginTop:"1%"}}>
                        {createButton()}
                    </ListItem>
                </List>
            </Collapse>
        </React.Fragment>
    )
}
