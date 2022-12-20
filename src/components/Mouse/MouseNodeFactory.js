import * as React from 'react';
import { MouseNodeModel } from './MouseNodeModel';
import { MouseNodeWidget } from './MouseNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class MouseNodeFactory extends AbstractReactFactory {
	constructor() {
		super('mouse');
	}

	generateModel(event) {
		return new MouseNodeModel();
	}

	generateReactWidget(event) {
		return <MouseNodeWidget engine={this.engine} node={event.model} />;
	}
}