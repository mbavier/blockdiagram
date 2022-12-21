import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, ListItemButton, MenuItem, Typography, TextField } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';



export default function CustomHeaders(props) {
    const [open, setOpen] = React.useState(false)
    var [subheading, setSubheading] = React.useState("")
    var [userOptions, setUserOptions] = React.useState([])
    var [headerInputs, setHeaderInputs] = React.useState([])
    function addHeader(i) {
        function handleChange(e, i) {
            if (i == 0) {
                setSubheading(e.target.value)
            } else {
                userOptions[i] = e.target.value
                setUserOptions(userOptions)
            }
        }
        let label = `Header ${i}`
        if (i === 0){
            label = "Subheading"
        }
        return ( <ListItem key={label} style={{marginLeft:"2.5%"}} disablePadding> 
                    <TextField style={{width:"95%"}} id="standard-basic" label={label} variant="standard" 
                    onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)} 
                            onChange={(e) => handleChange(e, i)} /> 
                </ListItem>)
    }
    

    const handleClick = () => {
        setOpen(true);
        setHeaderInputs([addHeader(0)])
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onInputBtnClick = () => {
        let blankDict = {"FillerNode":{}};
        blankDict["FillerNode"][subheading] = "CustomInfo"
        userOptions.map((option) => {
            blankDict["FillerNode"][option] = "CustomInfo"
        })
        console.log(blankDict)
        props.setDictOfParts(blankDict)
        props.setSubheading(subheading)
        props.setPartOptions([])
        setOpen(!open);
    }

    const createButton = () => {
        return (
            <Button variant='contained' id="selectBtns" onClick={onInputBtnClick} style={{width:"100%", margin: '0'}}>Set Headers</Button>
        );
    }

    const createInputs = () => {
        let output = (
            <React.Fragment key="headerSets">
            {headerInputs}
            <ListItem disablePadding key="AddHeaderButton">
                <ListItemButton onClick={() => setHeaderInputs([...headerInputs, addHeader(headerInputs.length+1)])}>
                    <ListItemIcon>
                        <AddIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Click to Add New Header"/>
                </ListItemButton>
            </ListItem>
            </React.Fragment>
        )
        return (
            output
        );
    }

    return (
        <React.Fragment key="CustomHeaderList">
            <MenuItem key={'Upload'} onClick={handleClick}>
                 <Typography textAlign="center">Set Custom Headers</Typography>
            </MenuItem>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Set Headers</DialogTitle>
                <DialogContent>
                <List component="div" disablePadding>
                    {createInputs()}
                </List>
                <DialogActions key="setHeaderButton" disablePadding style={{marginTop:"1%"}}>
                    {createButton()}
                </DialogActions>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}
