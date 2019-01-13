import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'
import { MultiViewerSourceState } from '../../state/settings'

export class MultiViewerSourceCommand extends AbstractCommand {
	rawName = 'MvIn'
	mvId: number
	index: number

	properties: MultiViewerSourceState

	updateProps (newProps: Partial<MultiViewerSourceState>) {
		this._updateProps(newProps)
	}

	deserialize (rawCommand: Buffer) {
		// Storing MV1 as 0-9 and MV2 as 100-109 (just in case future MVs do >10 windows)
		this.index = rawCommand.readUInt8(0)*100 + rawCommand.readUInt8(1)
		this.mvId = rawCommand.readUInt8(0)

		this.properties = {
			source: rawCommand.readUInt16BE(2),
			windowIndex: rawCommand.readUInt8(1)
		}
	}

	serialize () {
		const buffer = Buffer.alloc(4)
		buffer.writeUInt8(this.mvId, 0)
		buffer.writeUInt8(this.properties.windowIndex, 1)
		buffer.writeUInt16BE(this.properties.source, 2)
		return Buffer.concat([Buffer.from('CMvI', 'ascii'), buffer])
	}

	applyToState (state: AtemState) {
		state.settings.multiViewerSource[this.index] = {
			...state.settings.multiViewerSource[this.index],
			...this.properties
		}
	}
}
