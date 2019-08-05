import { CommandParser } from '../../lib/atemCommandParser'
import { ProtocolVersion } from '../../enums'

export type CommandTestConverterSet = { [key: string]: CommandTestConverter }
export interface CommandTestConverter {
	idAliases: { [key: string]: string }
	propertyAliases: { [key: string]: (v: any) => { name?: string, val: any } }
	customMutate?: (v: any) => any
}

export interface TestCase {
	name: string
	bytes: string
	command: { [key: string]: any }
}

export function runTestForCommand (commandParser: CommandParser, commandConverters: CommandTestConverterSet, i: number, testCase: TestCase, allowUnknown?: boolean) {
	const cmd = commandParser.commandFromRawName(testCase.name)
	if (!cmd && allowUnknown) return

	let matchedCase = false
	if (cmd) {
		const buffer = Buffer.from(testCase.bytes.replace(/-/g, ''), 'hex')
		const length = buffer.readUInt16BE(0)
		const name = buffer.toString('ascii', 4, 8)

		const converter = commandConverters[name]
		let mutatedCommand: { [key: string]: any } = {}
		for (const key in testCase.command) {
			const newKey = key[0].toLowerCase() + key.substring(1)
			const propConv = converter ? converter.propertyAliases[`${name}.${newKey}`] || converter.propertyAliases[newKey] : undefined
			const newProp = propConv ? propConv(testCase.command[key]) : { val: testCase.command[key] }

			mutatedCommand[newProp.name || newKey] = newProp.val
		}

		if (converter && converter.customMutate) {
			mutatedCommand = converter.customMutate(mutatedCommand)
		}

		if (typeof cmd.deserialize === 'function') {
			matchedCase = true
			test(`Test #${i}: ${testCase.name} - Deserialize`, () => {
				cmd.deserialize!(buffer.slice(0, length).slice(8), commandParser.version)

				delete cmd.flag // Anything deserialized will never have flags
				delete cmd.rawName
				delete (cmd as any).rawCommand

				if (converter) {
					for (const key in cmd) {
						const newName = converter.idAliases[key]
						if (cmd.hasOwnProperty(key) && newName) {
							if (!cmd.properties) cmd.properties = {}
							cmd.properties[newName] = (cmd as any)[key]
						}
					}
				}

				expect(cmd.properties).toEqual(mutatedCommand)
			})
		}

		if (typeof cmd.serialize === 'function') {
			matchedCase = true
			test(`Test #${i}: ${testCase.name} - Serialize`, () => {
				if (converter) {
					for (const id of Object.keys(converter.idAliases)) {
						const id2 = converter.idAliases[id];
						(cmd as any)[id] = mutatedCommand[id2]
						delete mutatedCommand[id2]
					}
				}

				if (mutatedCommand.mask !== undefined) {
					cmd.flag = mutatedCommand.mask
					delete mutatedCommand.mask
				}

				cmd.properties = mutatedCommand

				const hexStr = (buf: Buffer) => {
					const str = buf.toString('hex')
					let str2 = ''
					for (let i = 0; i < str.length; i += 2) {
						str2 += str[i + 0] + str[i + 1]
						str2 += (i % 16 === 14) ? '\n' : '-'
					}
					return str2.substring(0, str2.length - 1)
				}

				const encodedBytes = cmd.serialize!(commandParser.version)
				// console.log(hexStr(buffer.slice(4)))
				expect(length).toEqual(encodedBytes.length + 8)
				expect(hexStr(buffer.slice(8))).toEqual(hexStr(encodedBytes))
			})
		}
	}

	if (!matchedCase) {
		test(`Test #${i}: ${testCase.name} - Skip`, () => {
			// Command should have either a serialize or deserialize
			expect(false).toBeTruthy()
		})
	}
}

export function ensureAllCommandsCovered (commandParser: CommandParser, testCases: Array<TestCase>) {
	test('Ensure all commands tested', () => {
		// Verify that all commands were tested
		const expectUndefined = commandParser.version === ProtocolVersion.V7_2
		let knownNames: string[] = []
		for (const name of Object.keys(commandParser.commands)) {
			for (const cmd of commandParser.commands[name]) {
				const inst = new cmd()
				if ((expectUndefined && !inst.minimumVersion) || inst.minimumVersion === commandParser.version) {
					knownNames.push(name)
				}
			}
		}

		// knownNames = Object.keys(commandParser.commands).sort()
		const testNames = Array.from(new Set(testCases.map(c => c.name))).filter(n => knownNames.indexOf(n) !== -1).sort()

		// Temporarily ignore these missing cases
		knownNames = knownNames.filter(n => n !== 'InCm' && n !== 'InPr' && n !== 'KeFS')

		knownNames.sort()

		expect(testNames).toEqual(knownNames)
	})
}
