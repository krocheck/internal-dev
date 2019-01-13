import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'
import { MacroPropertiesState } from '../../state/macro'

export class MacroPropertiesCommand extends AbstractCommand {
	rawName = 'MPrp'

	properties: MacroPropertiesState

	deserialize (rawCommand: Buffer) {

		var descLen = rawCommand.readUInt16BE(4);
		var nameLen = rawCommand.readUInt16BE(6);

		this.properties = {
			description: '',
			isUsed: Boolean(rawCommand[2] & 1 << 0),
			macroIndex: rawCommand.readUInt16BE(0),
			name: ''
		}

		if ( descLen > 0 ) {
			this.properties.description = Util.bufToNullTerminatedString(rawCommand, (8 + nameLen), descLen);
		}

		if ( nameLen > 0 ) {
			this.properties.name = Util.bufToNullTerminatedString(rawCommand, 8, nameLen);
		}
	}

	applyToState (state: AtemState) {
		state.macroProperties = {
			...state.macroProperties,
			...this.properties
		}
	}
}
