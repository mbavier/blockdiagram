import React from "react";
import { Grid, MenuItem, Typography } from '@mui/material';
import { utils } from "xlsx";

function beginBoMGeneration(engine, dict) {
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

}