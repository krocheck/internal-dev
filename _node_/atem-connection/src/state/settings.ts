export interface MultiViewerPropertiesState {
	layout: number
}

export interface MultiViewerSourceState {
	source: number
	windowIndex: number
}

export class SettingsState {
	multiViewerProperties: Array<MultiViewerPropertiesState> = []
	multiViewerSource: Array<MultiViewerSourceState> = []
	videoMode: 0
}