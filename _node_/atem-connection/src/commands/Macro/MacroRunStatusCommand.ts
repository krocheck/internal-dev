import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'
import { MacroPlayerState } from '../../state/macro'

export class MacroRunStatusCommand extends AbstractCommand {
	rawName = 'MRPr'

	properties: MacroPlayerState

	deserialize (rawCommand: Buffer) {
		this.properties = {
			isRunning: Boolean(rawCommand[0] & 1 << 0),
			isWaiting: Boolean(rawCommand[0] & 1 << 1),
			loop: Boolean(rawCommand[1] & 1 << 0),
			macroIndex: rawCommand.readUInt16BE(2)
		}
	}

	applyToState (state: AtemState) {
		state.macroPlayer = {
			...state.macroPlayer,
			...this.properties
		}
	}
}
