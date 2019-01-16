import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'
import { MultiViewerPropertiesState } from '../../state/settings'
//import { MultiViewerLayout } from '../../enums'

export class MultiViewerPropertiesCommand extends AbstractCommand {
	static MaskFlags = {
		layout: 1 << 0
	}

	rawName = 'MvPr'
	multiViewerId: number

	properties: MultiViewerPropertiesState

	updateProps (newProps: Partial<MultiViewerPropertiesState>) {
		this._updateProps(newProps)
	}

	deserialize (rawCommand: Buffer) {
		this.multiViewerId = rawCommand.readUInt8(0)

		this.properties = {
			layout: rawCommand.readUInt8(1),
		}
	}

	serialize () {
		const rawCommand = 'CMvP'
		return new Buffer([
			...Buffer.from(rawCommand),
			this.flag,
			this.multiViewerId,
			this.properties.layout,
			0x00
		])
	}

	applyToState (state: AtemState) {
		state.settings.multiViewerProperties[this.multiViewerId] = {
			...state.settings.multiViewerProperties[this.multiViewerId],
			...this.properties
		}
	}
}
