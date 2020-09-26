module.exports = {

	CONFIG_MODEL: {
		1:  { id: 1,  label: 'Carbonite',                arch: 'carbonite', inputs: 24,  MEs: 2, keyers: 4, MMEs: 4,  MMEKeyers: 2, MSCs: 2,  XP: 0, CK: 0, MSs: '4|0',  MVs: '2|16', CC: '8|32',  mem: 100,  auxes: '1|8' },
		2:  { id: 2,  label: 'Carbonite Multi-Media',    arch: 'carbonite', inputs: 24,  MEs: 2, keyers: 4, MMEs: 4,  MMEKeyers: 2, MSCs: 2,  XP: 0, CK: 0, MSs: '4|0',  MVs: '2|16', CC: '8|32',  mem: 100,  auxes: '1|8' },
		3:  { id: 3,  label: 'Carbonite Plus',           arch: 'carbonite', inputs: 24,  MEs: 2, keyers: 4, MMEs: 4,  MMEKeyers: 2, MSCs: 2,  XP: 0, CK: 0, MSs: '4|0',  MVs: '2|16', CC: '8|32',  mem: 100,  auxes: '1|8' },
		4:  { id: 4,  label: 'Carbonite Black',          arch: 'carbonite', inputs: 36,  MEs: 3, keyers: 4, MMEs: 4,  MMEKeyers: 2, MSCs: 2,  XP: 0, CK: 0, MSs: '4|0',  MVs: '2|16', CC: '8|32',  mem: 100,  auxes: '1|20' },
		5:  { id: 5,  label: 'Carbonite Black UHD',      arch: 'carbonite', inputs: 9,   MEs: 1, keyers: 4, MMEs: 2,  MMEKeyers: 2, MSCs: 2,  XP: 0, CK: 2, MSs: '2|0',  MVs: '1|16', CC: '8|32',  mem: 100,  auxes: '1|10' },
		6:  { id: 6,  label: 'Carbonite Black+',         arch: 'carbonite', inputs: 36,  MEs: 3, keyers: 4, MMEs: 4,  MMEKeyers: 2, MSCs: 2,  XP: 0, CK: 0, MSs: '4|0',  MVs: '5|16', CC: '8|32',  mem: 100,  auxes: '1|20' },
		7:  { id: 7,  label: 'Carbonite Black+ UHD',     arch: 'carbonite', inputs: 9,   MEs: 1, keyers: 4, MMEs: 2,  MMEKeyers: 2, MSCs: 2,  XP: 0, CK: 2, MSs: '2|0',  MVs: '4|16', CC: '8|32',  mem: 100,  auxes: '1|10' },
		8:  { id: 8,  label: 'Carbonite Black Solo9',    arch: 'carbonite', inputs: 9,   MEs: 1, keyers: 4, MMEs: 2,  MMEKeyers: 2, MSCs: 1,  XP: 0, CK: 0, MSs: '4|0',  MVs: '1|10', CC: '8|32',  mem: 100,  auxes: '1|16' },
		9:  { id: 9,  label: 'Carbonite Black Solo13',   arch: 'carbonite', inputs: 13,  MEs: 1, keyers: 4, MMEs: 2,  MMEKeyers: 2, MSCs: 1,  XP: 0, CK: 0, MSs: '4|0',  MVs: '1|10', CC: '8|32',  mem: 100,  auxes: '1|16' },
		10: { id: 10, label: 'Carbonite Ultra',          arch: 'carbonite', inputs: 24,  MEs: 3, keyers: 4, MMEs: 4,  MMEKeyers: 2, MSCs: 2,  XP: 0, CK: 2, MSs: '4|0',  MVs: '4|16', CC: '8|32',  mem: 100,  auxes: '1|28' },
		11: { id: 11, label: 'Carbonite Ultra UHD',      arch: 'carbonite', inputs: 18,  MEs: 2, keyers: 4, MMEs: 2,  MMEKeyers: 2, MSCs: 1,  XP: 0, CK: 2, MSs: '2|0',  MVs: '4|16', CC: '8|32',  mem: 100,  auxes: '1|28' },
		12: { id: 12, label: 'Carbonite Mosaic',         arch: 'carbonite', inputs: 36,  MEs: 0, keyers: 0, MMEs: 10, MMEKeyers: 4, MSCs: 10, XP: 0, CK: 0, MSs: '36|0', MVs: '4|16', CC: '8|32',  mem: 100,  auxes: '1|20' },
		13: { id: 13, label: 'Carbonite UltraChromeHR',  arch: 'carbonite', inputs: 36,  MEs: 0, keyers: 0, MMEs: 4,  MMEKeyers: 2, MSCs: 0,  XP: 0, CK: 4, MSs: '8|0',  MVs: '2|16', CC: '0|0',   mem: 100,  auxes: '1|20' },
		14: { id: 14, label: 'Carbonite UltraChromeHR+', arch: 'carbonite', inputs: 36,  MEs: 0, keyers: 0, MMEs: 4,  MMEKeyers: 2, MSCs: 0,  XP: 0, CK: 4, MSs: '8|0',  MVs: '5|16', CC: '0|0',   mem: 100,  auxes: '1|20' },
		15: { id: 15, label: 'Graphite',                 arch: 'carbonite', inputs: 13,  MEs: 2, keyers: 4, MMEs: 4,  MMEKeyers: 2, MSCs: 2,  XP: 3, CK: 0, MSs: '4|0',  MVs: '2|16', CC: '8|32',  mem: 100,  auxes: '1|20' },
		16: { id: 16, label: 'Acuity 4RU',               arch: 'acuity',    inputs: 60,  MEs: 7, keyers: 8, MMEs: 10, MMEKeyers: 1, MSCs: 0,  XP: 0, CK: 0, MSs: '4|4',  MVs: '6|20', CC: '48|48', mem: 1000, auxes: '8|8' },
		17: { id: 17, label: 'Acuity 8RU',               arch: 'acuity',    inputs: 120, MEs: 8, keyers: 8, MMEs: 15, MMEKeyers: 1, MSCs: 0,  XP: 0, CK: 0, MSs: '4|4',  MVs: '8|20', CC: '48|48', mem: 1000, auxes: '8|8' },
		18: { id: 18, label: 'Acuity UHD 4RU',           arch: 'acuity',    inputs: 15,  MEs: 3, keyers: 4, MMEs: 0,  MMEKeyers: 0, MSCs: 0,  XP: 0, CK: 0, MSs: '1|2',  MVs: '6|20', CC: '48|48', mem: 1000, auxes: '8|8' },
		19: { id: 19, label: 'Acuity UHD 8RU',           arch: 'acuity',    inputs: 30,  MEs: 4, keyers: 4, MMEs: 0,  MMEKeyers: 0, MSCs: 0,  XP: 0, CK: 0, MSs: '1|2',  MVs: '8|20', CC: '48|48', mem: 1000, auxes: '8|8' },
		20: { id: 20, label: 'Vision MD',                arch: 'vision',    inputs: 32,  MEs: 3, keyers: 4, MMEs: 0,  MMEKeyers: 0, MSCs: 0,  XP: 0, CK: 0, MSs: '3|4',  MVs: '0|0',  CC: '12|48', mem: 100,  auxes: '6|8' },
		21: { id: 21, label: 'Vision QMD',               arch: 'vision',    inputs: 32,  MEs: 5, keyers: 4, MMEs: 8,  MMEKeyers: 1, MSCs: 0,  XP: 0, CK: 0, MSs: '3|4',  MVs: '0|0',  CC: '12|48', mem: 100,  auxes: '6|8' },
		22: { id: 22, label: 'Vision MD-X',              arch: 'vision',    inputs: 96,  MEs: 4, keyers: 4, MMEs: 0,  MMEKeyers: 0, MSCs: 0,  XP: 0, CK: 0, MSs: '3|4',  MVs: '0|0',  CC: '12|48', mem: 100,  auxes: '6|8' },
		23: { id: 23, label: 'Vision QMD-X',             arch: 'vision',    inputs: 96,  MEs: 8, keyers: 4, MMEs: 12, MMEKeyers: 1, MSCs: 0,  XP: 0, CK: 0, MSs: '3|4',  MVs: '0|0',  CC: '12|48', mem: 100,  auxes: '6|8' },
	},
	CONFIG_BUSES: {
		'ME':  { bus: 'ME',  carbonite: true,  acuity: true,  vision: true  },
		'AUX': { bus: 'AUX', carbonite: false, acuity: true,  vision: true  },
		'MME': { bus: 'MME', carbonite: true,  acuity: false, vision: false },
		'MSC': { bus: 'MSC', carbonite: true,  acuity: false, vision: false }
	},
	CONFIG_DEST: {
		'AUX': { bus: 'AUX', carbonite: true, acuity: true,  vision: true  },
		'KEY': { bus: 'KEY', carbonite: true, acuity: true,  vision: true  },
		'ME':  { bus: 'ME',  carbonite: true, acuity: true,  vision: true  },
		'MME': { bus: 'MME', carbonite: true, acuity: false, vision: false },
		'PGM': { bus: 'PGM', carbonite: true, acuity: true,  vision: true  },
		'PST': { bus: 'PST', carbonite: true, acuity: true,  vision: true  }
	},
	CONFIG_SRC: {
		'AUX': { bus: 'AUX', carbonite: true,  acuity: true,  vision: true  },
		'BG':  { bus: 'BG',  carbonite: true,  acuity: true,  vision: true  },
		'BK':  { bus: 'BK',  carbonite: true,  acuity: true,  vision: true  },
		'CLN': { bus: 'CLN', carbonite: true,  acuity: true,  vision: true  },
		'CK':  { bus: 'CK',  carbonite: true,  acuity: false, vision: false },
		'CKA': { bus: 'CKA', carbonite: true,  acuity: false, vision: false },
		'GS':  { bus: 'GS',  carbonite: false, acuity: true,  vision: true  },
		'IN':  { bus: 'IN',  carbonite: true,  acuity: true,  vision: true  },
		'KEY': { bus: 'KEY', carbonite: true,  acuity: true,  vision: true  },
		'ME':  { bus: 'ME',  carbonite: true,  acuity: true,  vision: true  },
		'MME': { bus: 'MME', carbonite: true,  acuity: false, vision: false },
		'MS':  { bus: 'MS',  carbonite: true,  acuity: true,  vision: true  },
		'MVA': { bus: 'MVA', carbonite: false, acuity: true,  vision: false },
		'MVB': { bus: 'MVB', carbonite: false, acuity: true,  vision: false },
		'PGM': { bus: 'PGM', carbonite: true,  acuity: true,  vision: true  },
		'PV':  { bus: 'PV',  carbonite: true,  acuity: true,  vision: true  },
		'XPA': { bus: 'XPA', carbonite: true,  acuity: false, vision: false },
		'XPV': { bus: 'XPV', carbonite: true,  acuity: false, vision: false }
	},
	CONFIG_COMMANDS: {
		'CC':             { command: 'CC',             carbonite: true,  acuity: true,  vision: true  },
		'CKINIT':         { command: 'CKINIT',         carbonite: true,  acuity: false, vision: false },
		'FTB':            { command: 'FTB',            carbonite: true,  acuity: true,  vision: true  },
		'GPI':            { command: 'GPI',            carbonite: true,  acuity: true,  vision: true  },
		'HELP':           { command: 'HELP',           carbonite: true,  acuity: true,  vision: true  },
		'KEYAUTO':        { command: 'KEYAUTO',        carbonite: false, acuity: true,  vision: true  },
		'KEYAUTOON':      { command: 'KEYAUTOON',      carbonite: true,  acuity: false, vision: false },
		'KEYAUTOOFF':     { command: 'KEYAUTOOFF',     carbonite: true,  acuity: false, vision: false },
		'KEYCUT':         { command: 'KEYCUT',         carbonite: false, acuity: true,  vision: true  },
		'KEYCUTON':       { command: 'KEYCUTON',       carbonite: true,  acuity: false, vision: false },
		'KEYCUTOFF':      { command: 'KEYCUTOFF',      carbonite: true,  acuity: false, vision: false },
		'KEYMODE':        { command: 'KEYMODE',        carbonite: true,  acuity: false, vision: false },
		'KEYSHAPED':      { command: 'KEYSHAPED',      carbonite: false, acuity: true,  vision: true  },
		'KEYSTATE':       { command: 'KEYSTATE',       carbonite: false, acuity: true,  vision: true  },
		'LOADSET':        { command: 'LOADSET',        carbonite: true,  acuity: true,  vision: true  },
		'MEAUTO':         { command: 'MEAUTO',         carbonite: true,  acuity: true,  vision: true  },
		'MECUT':          { command: 'MECUT',          carbonite: true,  acuity: true,  vision: true  },
		'MEM':            { command: 'MEM',            carbonite: true,  acuity: true,  vision: true  },
		'MEMSAVE':        { command: 'MEMSAVE',        carbonite: true,  acuity: true,  vision: true  },
		'MENM':           { command: 'MENM',           carbonite: true,  acuity: true,  vision: true  },
		'MS':             { command: 'MS',             carbonite: true,  acuity: true,  vision: true  },
		'MSPLAY':         { command: 'MSPLAY',         carbonite: false, acuity: true,  vision: true  },
		'MVBOX':          { command: 'MVBOX',          carbonite: true,  acuity: true,  vision: false },
		'RESETALL':       { command: 'RESETALL',       carbonite: false, acuity: true,  vision: true  },
		'SAVESET':        { command: 'SAVESET',        carbonite: true,  acuity: true,  vision: true  },
		'SETVIDMODE REF': { command: 'SETVIDMODE REF', carbonite: false, acuity: true,  vision: true  },
		'SETVIDMODE VID': { command: 'SETVIDMODE VID', carbonite: false, acuity: true,  vision: true  },
		'TRANSINCL':      { command: 'TRANSINCL',      carbonite: true,  acuity: true,  vision: true  },
		'TRANSRATE':      { command: 'TRANSRATE',      carbonite: true,  acuity: true,  vision: true  },
		'TRANSTYPE':      { command: 'TRANSTYPE',      carbonite: true,  acuity: true,  vision: true  },
		'XPT':            { command: 'XPT',            carbonite: false, acuity: true,  vision: true  }
	}
}