import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'
import { SuperSourceProperties } from '../../state/video'
import { Util, Enums } from '../..'

export class SuperSourcePropertiesCommand extends AbstractCommand {
	static MaskFlags = {
		artFillSource: 1 << 0,
		artCutSource: 1 << 1,
		artOption: 1 << 2,
		artPreMultiplied: 1 << 3,
		artClip: 1 << 4,
		artGain: 1 << 5,
		artInvertKey: 1 << 6
	}

	rawName = 'SSrc'
	ssrcId: number
	properties: SuperSourceProperties

	updateProps (newProps: Partial<SuperSourceProperties>) {
		this._updateProps(newProps)
	}

	deserialize (rawCommand: Buffer) {
		this.ssrcId = rawCommand[0]
		this.properties = {
			artFillSource: rawCommand.readUInt16BE(2),
			artCutSource: rawCommand.readUInt16BE(4),
			artOption: Util.parseEnum<Enums.SuperSourceArtOption>(rawCommand.readUInt8(6), Enums.SuperSourceArtOption),
			artPreMultiplied: rawCommand[7] === 1,
			artClip: Util.parseNumberBetween(rawCommand.readUInt16BE(8), 0, 1000),
			artGain: Util.parseNumberBetween(rawCommand.readUInt16BE(10), 0, 1000),
			artInvertKey: rawCommand[12] === 1
		}
	}

	serialize () {
		const buffer = Buffer.alloc(16)

		buffer.writeUInt8(this.flag, 0)
		buffer.writeUInt8(this.ssrcId, 1)
		buffer.writeUInt16BE(this.properties.artFillSource, 2)
		buffer.writeUInt16BE(this.properties.artCutSource, 4)
		buffer.writeUInt8(this.properties.artOption, 6)
		buffer.writeUInt8(this.properties.artPreMultiplied ? 1 : 0, 7)
		buffer.writeUInt16BE(this.properties.artClip, 8)
		buffer.writeUInt16BE(this.properties.artGain, 10)
		buffer.writeUInt8(this.properties.artInvertKey ? 1 : 0, 12)

		return Buffer.concat([Buffer.from('CSSc', 'ascii'), buffer])
	}

	applyToState (state: AtemState) {
		state.video.getSuperSource(this.ssrcId).properties = this.properties
	}
}
