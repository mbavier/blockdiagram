import * as React from 'react';
import { GroupingNodeModel } from './GroupingNodeModel';
import { GroupingNodeWidget } from './GroupingNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class GroupingNodeFactory extends AbstractReactFactory {
	constructor() {
		super('grouping');
	}

	generateModel(event) {
		return new GroupingNodeModel();
	}

	generateReactWidget(event) {
		return <GroupingNodeWidget engine={this.engine} node={event.model} />;
	}
}