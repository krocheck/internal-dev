import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'

export class SuperSourceCascadeCommand extends AbstractCommand {
	rawName = 'SSCs'
	properties: {
		enabled: boolean
	}

	deserialize (rawCommand: Buffer) {
		this.properties = {
			enabled: rawCommand[0] === 1
		}
	}

	serialize() {
		const rawCommand = 'SSCs'
		return new Buffer([...Buffer.from(rawCommand), this.properties.enabled, 0x8e, 0xd3, 0x4f])
	}

	applyToState(state: AtemState) {
		state.video.superSourceCadcade = this.properties.enabled
	}
}
