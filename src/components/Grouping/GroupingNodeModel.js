import { DefaultPortModel, RightAngleLinkFactory, RightAngleLinkModel, NodeModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import _ from "lodash";

export class RightAnglePortModel extends DefaultPortModel {
	createLinkModel() {
		return new RightAngleLinkModel();
	}
}
/**
 * Example of a custom model using pure javascript
 */
export class GroupingNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'grouping'
		});
		this.color = options.color || { options: 'red' };
        this.name = options.name || { options: 'name' };
		this.subname = options.subname || { options: 'subname' }
        this.width = options.width || {options: '10'};
        this.height = options.height || {options: '10'};
		// setup an in and out port
		this.portsOut = [];
		this.portsIn = [];
	}
	doClone(lookupTable, clone) {
        clone.portsIn = [];
        clone.portsOut = [];
        super.doClone(lookupTable, clone);
    }
    removePort(port) {
        super.removePort(port);
        if (port.getOptions().in) {
            this.portsIn.splice(this.portsIn.indexOf(port), 1);
        }
        else {
            this.portsOut.splice(this.portsOut.indexOf(port), 1);
        }
    }
    addPort(port) {
        super.addPort(port);
        console.log(port)
        if (port.getOptions().in) {
            if (this.portsIn.indexOf(port) === -1) {
                this.portsIn.push(port);
            }
        }
        else {
            if (this.portsOut.indexOf(port) === -1) {
                this.portsOut.push(port);
            }
        }
        return port;
    }
	getInPorts() {
		return this.portsIn;
	}

	getOutPorts() {
		return this.portsOut;
	}
    addInPort(label, after = true) {
        const p = new RightAnglePortModel({
            in: true,
            name: label,
            label: label,
            alignment: PortModelAlignment.LEFT
        });
        if (!after) {
            this.portsIn.splice(0, 0, p);
        }
        return this.addPort(p);
    }
    addOutPort(label, after = true) {
        const p = new RightAnglePortModel({
            in: false,
            name: label,
            label: label,
            alignment: PortModelAlignment.RIGHT
        });
        if (!after) {
            this.portsOut.splice(0, 0, p);
        }
        return this.addPort(p);
    }

	deserialize(event) {
        super.deserialize(event);
        this.options.name = event.data.name;
        this.options.color = event.data.color;
		this.options.subname = event.data.subname;
		this.options.extras = event.data.extras;
        this.options.weight = event.data.weight;
        this.options.height = event.data.height;
        this.portsIn = _.map(event.data.portsInOrder, (id) => {
			return this.getPortFromID(id);
        });
        this.portsOut = _.map(event.data.portsOutOrder, (id) => {
            return this.getPortFromID(id);
        });
    }
    serialize() {
        return Object.assign(Object.assign({}, super.serialize()), { name: this.options.name, color: this.options.color, subname: this.options.subname, width: this.options.width, height: this.options.height, portsInOrder: _.map(this.portsIn, (port) => {
                return port.getID();
            }), portsOutOrder: _.map(this.portsOut, (port) => {
                return port.getID();
            }) });
    }
}