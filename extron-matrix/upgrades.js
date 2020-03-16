module.exports = {

	/**
	 * INTERNAL: add various upgrade scripts
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	addUpgradeScripts() {

		// v1.0.0 (convert extron-dxp users)
		this.addUpgradeScript((config, actions, releaseActions, feedbacks) => {
			var changed = false;

			let upgradePass = function(action, changed) {
				switch (action.action) {
					case 'recall':
						action.action = 'recall_global';
						action.label = this.id + ':' + action.action;
						changed = true;
						break;
					case 'saveGlobalP':
						action.action = 'save_global';
						action.label = this.id + ':' + action.action;
						changed = true;
						break;
					case 'inputToAll':
						action.action = 'route_all';
						action.label = this.id + ':' + action.action;
						changed = true;
						break;
				}

				return changed;
			}

			for (let k in actions) {
				changed = upgradePass(actions[k], changed);
			}

			for (let k in releaseActions) {
				changed = upgradePass(releaseActions[k], changed);
			}

			return changed;
		});
	}
}