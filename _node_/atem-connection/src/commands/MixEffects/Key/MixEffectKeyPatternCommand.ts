import AbstractCommand from '../../AbstractCommand'
import { AtemState } from '../../../state'
import { UpstreamKeyerPatternSettings } from '../../../state/video/upstreamKeyers'
import { Util, Enums } from '../../..'

export class MixEffectKeyPatternCommand extends AbstractCommand {
	static MaskFlags = {
		style: 1 << 0,
		size: 1 << 1,
		symmetry: 1 << 2,
		softness: 1 << 3,
		positionX: 1 << 4,
		positionY: 1 << 5,
		invert: 1 << 6
	}

	rawName = 'KePt'
	mixEffect: number
	upstreamKeyerId: number
	properties: UpstreamKeyerPatternSettings

	deserialize (rawCommand: Buffer) {
		this.mixEffect = Util.parseNumberBetween(rawCommand[0], 0, 3)
		this.upstreamKeyerId = Util.parseNumberBetween(rawCommand[1], 0, 3)
		this.properties = {
			style: Util.parseEnum<Enums.Pattern>(rawCommand[2], Enums.Pattern),
			size: Util.parseNumberBetween(rawCommand.readUInt16BE(4), 0, 10000),
			symmetry: Util.parseNumberBetween(rawCommand.readUInt16BE(6), 0, 10000),
			softness: Util.parseNumberBetween(rawCommand.readUInt16BE(8), 0, 10000),
			positionX: Util.parseNumberBetween(rawCommand.readUInt16BE(10), 0, 10000),
			positionY: Util.parseNumberBetween(rawCommand.readUInt16BE(12), 0, 10000),
			invert: rawCommand[14] === 1
		}
	}

	serialize () {
		const buffer = Buffer.alloc(16)
		buffer.writeUInt8(this.flag, 0)
		buffer.writeUInt8(this.mixEffect, 1)
		buffer.writeUInt8(this.upstreamKeyerId, 2)

		buffer.writeUInt8(this.properties.style, 3)
		buffer.writeUInt16BE(this.properties.size, 4)
		buffer.writeUInt16BE(this.properties.symmetry, 6)
		buffer.writeUInt16BE(this.properties.softness, 8)
		buffer.writeUInt16BE(this.properties.positionX, 10)
		buffer.writeUInt16BE(this.properties.positionY, 12)
		buffer[14] = this.properties.invert ? 1 : 0

		return Buffer.concat([Buffer.from('CKPt', 'ascii'), buffer])
	}

	applyToState (state: AtemState) {
		const mixEffect = state.video.getMe(this.mixEffect)
		const upstreamKeyer = mixEffect.getUpstreamKeyer(this.upstreamKeyerId)
		upstreamKeyer.patternSettings = {
			...this.properties
		}
	}
}
