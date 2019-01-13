import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'
import { MacroRecorderState } from '../../state/macro'

export class MacroRecordingStatusCommand extends AbstractCommand {
	rawName = 'MRcS'

	properties: MacroRecorderState

	deserialize (rawCommand: Buffer) {
		this.properties = {
			isRecording: Boolean(rawCommand[0] & 1 << 0),
			macroIndex: rawCommand.readUInt16BE(2)
		}
	}

	applyToState (state: AtemState) {
		state.macroRecorder = {
			...state.macroRecorder,
			...this.properties
		}
	}
}
