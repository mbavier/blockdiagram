import React from "react";
import CreatableSelect from 'react-select/creatable';

import { ListItem } from "@mui/material";


const components = {
  DropdownIndicator: null,
};

const createOption = (label, value) => ({
  label,
  value,
});

const customStyles = {
  container: (provided) => ({
    ...provided,
    margin:"1%",
    marginLeft:"2.5%",
    marginRight:"0%",
    
    width: "95%",
    float: "left",
    fontFamily: ["Roboto","Helvetica","Arial","sans-serif"]
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 100
  })
}

export default function PartSearch(props) {
  
    const [inputValue, setInputValue] = React.useState('');
    const [value, setValue] = React.useState([]);
    const [options, setOptions] = React.useState([{ }])
  
  React.useEffect(() => {
    let headers = [createOption("Name:", 'Name')]
    Object.keys(props.dict[Object.keys(props.dict)[0]]).map((label) => {
      headers = [...headers, createOption(label + ":", label)]
    })
    setOptions(headers)
  }, [props.dict])

  const handleKeyDown = (event) => {
    if (!inputValue) return;
    let label = inputValue
    let value = inputValue
    // if (inputValue.includes(":")) {
    //   let tempVal = inputValue.split(":")
    //   label = tempVal[1].trim()
    //   value = tempVal[0].trim()
    // }
    switch (event.key) {
      case 'Enter':
      //case 'Tab':
        setValue((prev) => [...prev, createOption(label, value.replace(":",""))]);
        setInputValue('');
        event.preventDefault();
    }
  };
  const onInputBtnClick = () => {
    let newPartInfo = {}
    console.log(options)
    options.map((header) => {
      if (header.value !== "Name") {
        newPartInfo[header.value] = "";
      }
    })
    let newPartName = ""
    value.map((entry, i) => {
      if (entry.value === "Name") {
        newPartName = value[i+1].value
      }
      else if (Object.keys(newPartInfo).includes(entry.value)) {
        console.log(entry)
        newPartInfo[entry.value] = value[i+1].value
      }
    })
    //console.log(newPartInfo)
    props.addNode(props.engine, newPartName, newPartInfo, props.setCurrentNode)
    setValue([])
}



  const createButton = () => {
    return (
        <button id="selectBtns" onClick={onInputBtnClick} style={{width:`${props.drawerWidth*.95}px`}}>Search Part (Not Working)</button>
    );
  }
  
  return (
    <div>
    <ListItem key="SelectDevices" disablePadding>
          <CreatableSelect
            components={components}
            inputValue={inputValue}
            isClearable
            isMulti
            //menuIsOpen={false}
            styles={customStyles}
            onChange={(newValue) => setValue(newValue)}
            onInputChange={(newValue) => setInputValue(newValue)}
            onKeyDown={handleKeyDown}
            placeholder="Select Header, then type info and press Enter"
            value={value}
            options={options}
            onFocus={()=>{props.engine.getModel().setLocked(true)}} onBlur={()=>props.engine.getModel().setLocked(false)}
          />
        </ListItem>
      <ListItem disablePadding>
        {createButton()}
      </ListItem>
      </div>
  );
  }