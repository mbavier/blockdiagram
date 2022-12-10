import * as React from 'react';
import { PortWidget } from '@projectstorm/react-diagrams';

export class DeviceNodeWidget extends React.Component {
	render() {
		return (
			<div className="custom-node">
				<PortWidget engine={this.props.engine} port={this.props.node.getPort('in')}>
					<div className="circle-port" />
				</PortWidget>
				<PortWidget engine={this.props.engine} port={this.props.node.getPort('out')}>
					<div className="circle-port" />
				</PortWidget>
                <div className="custom-node-name">{this.props.node.name}</div>
				<div className="custom-node-color" style={{ backgroundColor: this.props.node.color }} />
                
			</div>
		);
	}
}