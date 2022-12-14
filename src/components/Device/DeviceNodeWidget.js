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
		z-index: 1;
		position: absolute;
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

export class DeviceNodeWidget extends React.Component {
	constructor() {
		super(...arguments);
		this.generatePort = (port) => {
			return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()}/>
        };
	}

	render() {
		return (
			<S.Node data-default-node-name={this.props.node.options.name} selected={this.props.node.isSelected()} background={this.props.node.getOptions().color}> 
				<S.Title>
					<S.TitleName> {this.props.node.options.name} </S.TitleName>
					
				</S.Title>
				<S.Title>
					<S.SubtitleName> {this.props.node.options.subname} </S.SubtitleName>
				</S.Title>
				<S.Ports>
					<S.PortsContainer> {_.map(this.props.node.getInPorts(), this.generatePort)} </S.PortsContainer>
					<S.PortsContainer> {_.map(this.props.node.getOutPorts(), this.generatePort)} </S.PortsContainer>
				</S.Ports>
			</S.Node>
		)
	}
}