import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'
import { SuperSourceBox } from '../../state/video'
import { Util } from '../..'

export class SuperSourceBoxParametersCommand extends AbstractCommand {
	static MaskFlags = {
		enabled: 1 << 0,
		source: 1 << 1,
		x: 1 << 2,
		y: 1 << 3,
		size: 1 << 4,
		cropped: 1 << 5,
		cropTop: 1 << 6,
		cropBottom: 1 << 7,
		cropLeft: 1 << 8,
		cropRight: 1 << 9
	}

	rawName = 'SSBP'
	ssrcId: number
	boxId: number
	properties: SuperSourceBox

	updateProps (newProps: Partial<SuperSourceBox>) {
		this._updateProps(newProps)
	}

	deserialize (rawCommand: Buffer) {
		this.ssrcId = rawCommand[0]
		this.boxId = rawCommand[1]
		this.properties = {
			enabled: rawCommand[2] === 1,
			source: rawCommand.readUInt16BE(3),
			x: Util.parseNumberBetween(rawCommand.readInt16BE(5), -4800, 4800),
			y: Util.parseNumberBetween(rawCommand.readInt16BE(7), -3400, 3400),
			size: Util.parseNumberBetween(rawCommand.readUInt16BE(9), 70, 1000),
			cropped: rawCommand[11] === 1,
			cropTop: Util.parseNumberBetween(rawCommand.readUInt16BE(13), 0, 18000),
			cropBottom: Util.parseNumberBetween(rawCommand.readUInt16BE(15), 0, 18000),
			cropLeft: Util.parseNumberBetween(rawCommand.readUInt16BE(17), 0, 32000),
			cropRight: Util.parseNumberBetween(rawCommand.readUInt16BE(19), 0, 32000)
		}
	}

	serialize () {
		const buffer = Buffer.alloc(24)
		buffer.writeUInt16BE(this.flag, 0)
		buffer.writeUInt8(this.ssrcId,2)
		buffer.writeUInt8(this.boxId, 3)
		buffer.writeUInt8(this.properties.enabled ? 1 : 0, 4)
		buffer.writeUInt16BE(this.properties.source, 6)
		buffer.writeInt16BE(this.properties.x, 8)
		buffer.writeInt16BE(this.properties.y, 10)
		buffer.writeUInt16BE(this.properties.size, 12)
		buffer.writeUInt8(this.properties.cropped ? 1 : 0, 14)
		buffer.writeUInt16BE(this.properties.cropTop, 16)
		buffer.writeUInt16BE(this.properties.cropBottom, 18)
		buffer.writeUInt16BE(this.properties.cropLeft, 20)
		buffer.writeUInt16BE(this.properties.cropRight, 22)
		return Buffer.concat([Buffer.from('CSBP', 'ascii'), buffer])
	}

	applyToState (state: AtemState) {
		state.video.getSuperSource(this.ssrcId).boxes[this.boxId] = {
			...this.properties
		}
	}
}
