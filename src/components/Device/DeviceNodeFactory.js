import * as React from 'react';
import { DeviceNodeModel } from './DeviceNodeModel';
import { DeviceNodeWidget } from './DeviceNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class DeviceNodeFactory extends AbstractReactFactory {
	constructor() {
		super('js-custom-node');
	}

	generateModel(event) {
		return new DeviceNodeModel();
	}

	generateReactWidget(event) {
		return <DeviceNodeWidget engine={this.engine} node={event.model} />;
	}
}