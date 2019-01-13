export interface MultiViewerPropertiesState {
	layout: number
	mvID: number
}

export interface MultiViewerSourceState {
	mvID: number
	source: number
	windowIndex: number
}

export class SettingsState {
	multiViewerProperties: Array<MultiViewerPropertiesState> = []
	multiViewerSource: Array<MultiViewerSourceState> = []
}