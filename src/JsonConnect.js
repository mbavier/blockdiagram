import React, {useRef} from "react";
import { MenuItem, Checkbox, Typography, Radio, Grid, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import $ from 'jquery';

function handleLoad() {
    $.ajax({
      type: "GET",
      url: "http://localhost:3030/info",
      dataType: "json",  
      contentType:'application/json',
      success: function(data) {
        console.log(data)
      }
    });
}

  export default function JsonConnect (props) {
    var setDictOfParts = props.setDictOfParts;
    var setPartOptions = props.setPartOptions;
    var [headers, setHeaders] = React.useState([]);
    var [allTextLines, setAllTextLines] = React.useState();
    var [open, setOpen] = React.useState(false);
    const inputFile = useRef(null);

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onInputBtnClick = () => {
        handleLoad();
    }

    return (
       <>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Set Headers</DialogTitle>
                {/* <DialogContent>
                    <Checkboxes key="Checkboxes" setSubheading={props.setSubheading} setDictOfParts={setDictOfParts} setPartOptions={setPartOptions} headers={headers} setHeaders={setHeaders} allTextLines={allTextLines} setAllTextLines={setAllTextLines} drawerWidth={props.drawerWidth} handleAlertOpen={props.handleAlertOpen}/>
                </DialogContent> */}
            </Dialog>                                                                                                      
            <MenuItem key={'Connect to JSON'} onClick={onInputBtnClick}>
                 <Typography textAlign="center">JSON Connect</Typography>
            </MenuItem> 
        </>
      );
}