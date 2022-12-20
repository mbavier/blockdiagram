import {  NodeModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import _ from "lodash";

/**
 * Example of a custom model using pure javascript
 */
export class MouseNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'mouse'
		});
		this.color = options.color || { options: 'red' };
        this.name = options.name || { options: 'name' };
        this.width = options.width || {options: '10'};
        this.height = options.height || {options: '10'};
        this.id = options.id || {options: 'id'};
	}
	doClone(lookupTable, clone) {
        clone.portsIn = [];
        clone.portsOut = [];
        super.doClone(lookupTable, clone);
    }

	deserialize(event) {
        super.deserialize(event);
        this.options.name = event.data.name;
        this.options.color = event.data.color;
		this.options.extras = event.data.extras;
        this.options.weight = event.data.weight;
        this.options.height = event.data.height;
    }
    serialize() {
        return Object.assign(Object.assign({}, super.serialize()), { 
            name: this.options.name, 
            color: this.options.color, 
            width: this.options.width, 
            height: this.options.height
        });
        }
    }