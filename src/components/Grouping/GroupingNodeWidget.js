import * as React from 'react';
import { DefaultPortLabel } from '@projectstorm/react-diagrams'
import _ from "lodash";
import styled from "@emotion/styled";
//const styled_1 = require("@emotion/styled");
var S;
(function (S) {
    S.Node = styled.div `
		background-color: ${(p) => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
		overflow: visible;
		font-size: 11px;
		min-width: 25px;
		width: ${(p) => (p.width)}px;
		min-height:25px;
		height: ${(p) => (p.height)}px;
		border: solid 2px ${(p) => (p.selected ? 'rgb(0,192,255)' : 'black')};
	`;
    S.Title = styled.div `
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		white-space: nowrap;
		justify-items: center;
	`;
    S.TitleName = styled.div `
		flex-grow: 1;
		padding: 5px 5px 0px 5px;
	`;
	S.SubtitleName = styled.div `
		flex-grow: 1;
		font-size: 9px;
		overflow-wrap: break-word;
		width: 100px;
		white-space: normal;
		padding: 0px 5px 0.5px 5px;
	`;
    S.Ports = styled.div `
		display: flex;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
	`;
    S.PortsContainer = styled.div `
		flex-grow: 1;
		display: flex;
		flex-direction: column;

		&:first-of-type {
			margin-right: 10px;
		}

		&:only-child {
			margin-right: 0px;
		}
	`;
})(S || (S = {}));
/**
 * Default node that models the DefaultNodeModel. It creates two columns
 * for both all the input ports on the left, and the output ports on the right.
 */


export class GroupingNodeWidget extends React.Component {
	constructor() {
		super(...arguments);
		this.storedPosition = this.props.node.position;
		this.initialMouse = 
		this.generatePort = (port) => {
			return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()}/>
        };
	}

	handleMouseMoveTop = (e) => {
		//console.log(e.pageX, this.props.node.position, this.props.engine.getModel().options.offsetX)
		// this.props.node.options.width = (e.pageX + this.props.engine.getModel().options.offsetX);
		// this.props.node.options.height = (this.props.node.options.height - this.props.engine.getModel().options.offsetY);
		this.props.node.options.width -= e.movementX;
		this.props.node.options.height -= e.movementY;
		this.forceUpdate();
		if (!this.props.node.options.clicked) {
			document.removeEventListener('mousemove', this.handleMouseMoveTop)
		}
	}

	handleMouseMoveBottom = (e) => {
		this.props.node.position = this.storedPosition;
		//console.log(e.pageX, this.props.node.position, this.props.engine.getModel().options.offsetX)
		// this.props.node.options.width = (e.pageX - this.props.engine.getModel().options.offsetX);
		this.props.node.options.width += e.movementX;
		this.props.node.options.height += e.movementY;
		// this.props.node.options.height = (e.pageY - this.props.engine.getModel().options.offsetY);
		this.forceUpdate();
		if (!this.props.node.options.clicked) {
			document.removeEventListener('mousemove', this.handleMouseMoveBottom)
		}
	}

	render() {
		return (	
			<S.Node data-default-node-name={this.props.node.options.name} width={this.props.node.options.width} height={this.props.node.options.height} selected={this.props.node.isSelected()} background={this.props.node.getOptions().color}> 
				
				<div style={{backgroundColor:'rgba(0,0,0,0.5)', borderRadius: '3px', width:'10px', height:'10px', position:"absolute", top: 0, left: 0}} 
						onMouseDown={(e) => {this.props.node.options.clicked = true; 
											document.addEventListener('mousemove', this.handleMouseMoveTop)}} />
				<div style={{textAlign: this.props.node.options.titleFontAlignment, width:"90%", overflow:"hidden", margin:"auto", fontSize: this.props.node.options.titleFontSize}}> {this.props.node.options.name} </div>
				<div style={{textAlign: this.props.node.options.commentFontAlignment, width:"90%", overflow:"hidden", margin:"auto", fontSize: this.props.node.options.commentFontSize}}> {this.props.node.options.userComments} </div>
				<div style={{backgroundColor:'rgba(0,0,0,0.5)', borderRadius: '3px', width:'10px', height:'10px', position:"absolute", bottom: 2, right: 2}} 
						onMouseDown={(e) => {this.storedPosition = this.props.node.position; 
											this.props.node.options.clicked = true; 
											document.addEventListener('mousemove', this.handleMouseMoveBottom)}} />
			</S.Node>
		)
	}
}