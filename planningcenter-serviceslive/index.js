// PlanningCenterOnline-Services-Live

var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var Client = require('node-rest-client').Client;
var debug;
var log;

var baseAPIUrl = 'https://api.planningcenteronline.com/services/v2';

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	//self.actions(); // export actions

	return self;
}

instance.prototype.currentState = {
	internal: {},
	dynamicVariables: {},
	dynamicVariableDefinitions: {}
};

instance.prototype.init = function () {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATUS_OK);

	self.initFeedbacks();
	self.initVariables();
	self.init_pcoserviceslive();
};

instance.prototype.updateConfig = function (config) {
	var self = this;
	self.config = config;

	self.status(self.STATUS_OK);

	self.initFeedbacks();
	self.initVariables();
	self.init_pcoserviceslive();
};

instance.prototype.init_pcoserviceslive = function () {
	var self = this;

	let services_url = `${baseAPIUrl}/service_types`;
	
	if (self.config.parentfolder !== '')
	{
		services_url += `?where[parent_id]=${self.config.parentfolder}`;
	}

	self.doRest('GET', services_url, {})
	.then(function (result) {
		if (result.data.length > 0) {
			self.currentState.internal.plans_list = [];
			self.processServicesData(result.data);
		}
	})
	.catch(function (message) {
		self.log('error', message);
		self.status(self.STATUS_ERROR, message);
	});
};

instance.prototype.processServicesData = function (result) {
	var self = this;

	self.currentState.internal.services = result;

	for (let i = 0; i < result.length; i++) {
		let serviceTypeId = result[i].id;
		let plans_url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans?filter=future&per_page=7`;

		self.doRest('GET', plans_url, {})
		.then(function (result) {
			self.processPlansData(result.data);
		})
		.catch(function (message) {
			self.log('error', message);
			self.status(self.STATUS_ERROR, message);
		});
	}
};

instance.prototype.processPlansData = function (result) {
	var self = this;

	self.status(self.STATUS_OK);
	let services = self.currentState.internal.services;

	for (let j = 0; j < result.length; j++) {
		self.currentState.internal.plans.push(result[j]);

		let planListObj = {};
		planListObj.id = result[j].id;
		planListObj.serviceTypeId = result[j].relationships.service_type.data.id;
		let serviceObj = services.find(s => s.id === planListObj.serviceTypeId);
		planListObj.label = `${serviceObj.attributes.name} - ${result[j].attributes.dates} (${result[j].id})`;
		self.currentState.internal.plans_list.push(planListObj);
	}

	self.actions();
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'You will need to setup a Personal Access Token in your PCO account.'
		},
		{
			type: 'textinput',
			id: 'applicationid',
			label: 'Application ID',
			width: 12
		},
		{
			type: 'textinput',
			id: 'secretkey',
			label: 'Secret Key',
			width: 12
		},
		{
			type: 'textinput',
			id: 'parentfolder',
			label: 'Parent Folder within PCO to limit service type choices for this instance.',
			width: 12
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;

	debug('destroy', self.id);
}

// Set up Feedbacks
instance.prototype.initFeedbacks = function () {
	var self = this;

	var feedbacks = {

	};

	//self.setFeedbackDefinitions(feedbacks);
}

// Set up available variables
instance.prototype.initVariables = function () {
	var self = this;

	var variables = [
		{
			label: 'Plan Index',
			name:  'plan_index'
		},
		{
			label: 'Plan Length',
			name:  'plan_length'
		},
		{
			label: 'Plan Current Item',
			name:  'plan_currentitem'
		}
	];

	self.setVariableDefinitions(variables);

	// Initialize the current state and update Companion with the variables.
	self.emptyCurrentState();
}

/**
 * Updates the dynamic variable and records the internal state of that variable.
 * 
 * Will log a warning if the variable doesn't exist.
 */
instance.prototype.updateVariable = function (name, value) {
	var self = this;
	
	console.log("updating variable: " + name + ":" + value);

	if (self.currentState.dynamicVariables[name] === undefined) {
		self.log('warn', 'Variable ' + name + 'does not exist');
		//return;
	}

	self.currentState.dynamicVariables[name] = value;
	self.setVariable(name, value);
}

/**
 * Updates all Companion variables at once.
 */
instance.prototype.updateAllVariables = function () {
	var self = this;

	Object.keys(self.currentState.dynamicVariables).forEach(function (key) {
		self.updateVariable(key, self.currentState.dynamicVariables[key]);
	});
}

/**
 * Initialize an empty current variable state.
 */
instance.prototype.emptyCurrentState = function () {
	var self = this;

	// Reinitialize the currentState variable, otherwise this variable (and the module's
	// state) will be shared between multiple instances of this module.
	self.currentState = {};

	// The internal state, list of services and plans in PCO
	self.currentState.internal = {
		services: [],
		plans: [],
		plans_list: [{id: '', label: 'No plans loaded. Update instance config.'}],
		currentController: null
	};

	// The dynamic variable exposed to Companion
	self.currentState.dynamicVariables = {
		plan_index: '',
		plan_length: '',
		plan_currentitem: ''
	};

	// Update Companion with the default state of each dynamic variable.
	Object.keys(self.currentState.dynamicVariables).forEach(function (key) {
		self.updateVariable(key, self.currentState.dynamicVariables[key]);
	});
}

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function (system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'nextitem': {
			label: 'Go to Next Item',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.'
				}
			]
		},
		'previousitem': {
			label: 'Go to Previous Item',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.'
				}
			]
		},
		'nextitem_specific': {
			label: 'Go to Next Item of a Specific Plan',
			options: [
				{
					type: 'textinput',
					label: 'PCO Service Type Id',
					id: 'servicetypeid',
					tooltip: 'PCO Service Type Id.'
				},
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					tooltip: 'PCO Plan Id.'
				}
			]
		},
		'previousitem_specific': {
			label: 'Go to Previous Item of a Specific Plan',
			options: [
				{
					type: 'textinput',
					label: 'PCO Service Type Id',
					id: 'servicetypeid',
					tooltip: 'PCO Service Type Id to control.'
				},
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					tooltip: 'PCO Plan Id to control.'
				}
			]
		},
		'takecontrol': {
			label: 'Take Control',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.'
				}
			]
		},
		'releasecontrol': {
			label: 'Release Control',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.'
				}
			]
		},
		'takecontrol_specific': {
			label: 'Take Control of a Specific Plan',
			options: [
				{
					type: 'textinput',
					label: 'PCO Service Type Id',
					id: 'servicetypeid',
					tooltip: 'PCO Service Type Id to control.'
				},
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					tooltip: 'PCO Plan Id to control.'
				}
			]
		},
		'releasecontrol_specific': {
			label: 'Release Control of a Specific Plan',
			options: [
				{
					type: 'textinput',
					label: 'PCO Service Type Id',
					id: 'servicetypeid',
					tooltip: 'PCO Service Type Id to control.'
				},
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					tooltip: 'PCO Plan Id to control.'
				}
			]
		}
	});
}

instance.prototype.action = function (action) {
	var self = this;
	var options = action.options;

	let planId = options.planid;
	let planObj = self.currentState.internal.plans_list.find(p => p.id === planId);
	if (planObj.serviceTypeId) {
		let serviceTypeId = planObj.serviceTypeId;

		switch (action.action) {
			case 'nextitem':
				self.takeControl(serviceTypeId, planId)
				.then(function (result) {
					self.status(self.STATUS_OK);
					self.controlLive(serviceTypeId, planId, 'next');
				})
				.catch(function (message) {
					self.log('error', message);
					self.status(self.STATUS_ERROR, message);
				});
				break;
			case 'previousitem':
				self.takeControl(serviceTypeId, planId)
				.then(function (result) {
					self.status(self.STATUS_OK);
					self.controlLive(serviceTypeId, planId, 'previous');
				})
				.catch(function (message) {
					self.log('error', message);
					self.status(self.STATUS_ERROR, message);
				});
				break;
			case 'nextitem_specific':
				self.takeControl(options.servicetypeid, planId)
				.then(function (result) {
					self.status(self.STATUS_OK);
					self.controlLive(options.servicetypeid, planId, 'next');
				})
				.catch(function (message) {
					self.log('error', message);
					self.status(self.STATUS_ERROR, message);
				});
				break;
			case 'previousitem_specific':
				self.takeControl(options.servicetypeid, planId)
				.then(function (result) {
					self.status(self.STATUS_OK);
					self.controlLive(options.servicetypeid, planId, 'previous');
				})
				.catch(function (message) {
					self.log('error', message);
					self.status(self.STATUS_ERROR, message);
				});
				break;
			case 'takecontrol':
				self.takeControl(serviceTypeId, planId)
				.then(function (result) {
					self.status(self.STATUS_OK);
				})
				.catch(function (message) {
					self.log('error', message);
					self.status(self.STATUS_ERROR, message);
				});
				break;
			case 'releasecontrol':
				self.releaseControl(serviceTypeId, planId)
				.then(function (result) {
					self.status(self.STATUS_OK);
				})
				.catch(function (message) {
					self.log('error', message);
					self.status(self.STATUS_ERROR, message);
				});
				break;
			case 'takecontrol_specific':
				self.takeControl(options.servicetypeid, planId)
				.then(function (result) {
					self.status(self.STATUS_OK);
				})
				.catch(function (message) {
					self.log('error', message);
					self.status(self.STATUS_ERROR, message);
				});
				break;
			case 'releasecontrol_specific':
				self.releaseControl(options.servicetypeid, planId)
				.then(function (result) {
					self.status(self.STATUS_OK);
				})
				.catch(function (message) {
					self.log('error', message);
					self.status(self.STATUS_ERROR, message);
				});
				break;
		}
	}
}

instance.prototype.doRest = function (method, url, body) {
	var self = this;

	return new Promise(function (resolve, reject) {

		function handleResponse(err, result) {
			if (err === null && typeof result === 'object' && ((result.response.statusCode === 200) || (result.response.statusCode === 201))) {
				// A successful response

				var objJson = {};

				if (result.data.length > 0) {
					try {
						objJson = JSON.parse(result.data.toString());
					} catch (error) {
						reject('Unable to parse JSON.');
					}
				}

				resolve(objJson);
			}
			else {
				// Failure. Reject the promise.
				var message = 'Unknown error';

				if (result !== undefined) {
					if (result.response !== undefined) {
						message = result.response.statusCode + ': ' + result.response.statusMessage;
					} else if (result.error !== undefined) {
						// Get the error message from the object if present.
						message = result.error.code + ': ' + result.error.message;
					}
				}

				reject(message);
			}
		}

		var options_auth = {};

		if ((self.config.applicationid === '') || (self.config.secretkey === '')) {
			reject('Invalid Application ID/Secret Key.');
		}
		else {
			options_auth = {
				user: self.config.applicationid,
				password: self.config.secretkey
			};

			var client = new Client(options_auth);

			switch (method) {
				case 'POST':
					client.post(url, function (data, response) {
						handleResponse(null, {data: data, response: response});
					})
					.on('error', function (error) {
						handleResponse(true, {error: error});
					});
					break;
				case 'GET':
					client.get(url, function (data, response) {
						handleResponse(null, {data: data, response: response});
					})
					.on('error', function (error) {
						handleResponse(true, {error: error});
					});
					break;
				default:
					throw new Error('Invalid method');
					break;
			}
		}
	});
}

/* Takes control of the PCO plan which is needed before the plan can be changed. */
instance.prototype.takeControl = function (serviceTypeId, planId) {
	var self = this;

	var live_url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans/${planId}/live`;

	var toggle_url = live_url + '/toggle_control';

	return new Promise(function (resolve, reject) {
		self.doRest('GET', live_url, {})
		.then(function (result) {
			if (result.data.links.controller === null) {
				//no one is controlling this plan, so let's take control
				self.doRest('POST', toggle_url, {})
				.then(function (result) {
					resolve(result);
				})
				.catch(function (message) {
					self.log('error', message);
					self.status(self.STATUS_ERROR, message);
				});
			} else {
				//someone is in control, so let's check to see who it is
				if (result.data.links.controller === self.currentState.internal.currentController) {
					//no need to do anything, we are currently in control
					resolve(result);
				} else {
					//we aren't in control, so we need to take control by first toggling the controller to null
					self.doRest('POST', toggle_url, {})
					.then(function (result) {
						//now toggle it back to us
						self.doRest('POST', toggle_url, {})
						.then(function (result) {
							//we should be in control now, let's save the controller to an internal variable so we know who "we" are next time
							self.currentState.internal.currentController = result.data.links.controller;
							resolve(result);
						})
						.catch(function (message) {
							self.log('error', message);
							self.status(self.STATUS_ERROR, message);
						});
					})
					.catch(function (message) {
						self.log('error', message);
						self.status(self.STATUS_ERROR, message);
					});
				}
			}
		})
		.catch(function (message) {
			self.log('error', message);
			self.status(self.STATUS_ERROR, message);
		});
	});
}

instance.prototype.releaseControl = function (serviceTypeId, planId) {
	var self = this;

	var live_url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans/${planId}/live`;
	var toggle_url = live_url + '/toggle_control';

	return new Promise(function (resolve, reject) {
		self.doRest('GET', live_url, {})
			.then(function (result) {
				if (result.data.links.controller !== null) {
					//let's release control
					self.doRest('POST', toggle_url, {})
					.then(function (result) {
						resolve(result);
					})
					.catch(function (message) {
						self.log('error', message);
						self.status(self.STATUS_ERROR, message);
					});
				}
			})
			.catch(function (message) {
				self.log('error', message);
				self.status(self.STATUS_ERROR, message);
			});
	});
}

instance.prototype.controlLive = function (serviceTypeId, planId, direction) {
	var self = this;

	let baseUrl = `${baseAPIUrl}/service_types/${serviceTypeId}/plans/${planId}/live`;

	let url;

	switch (direction) {
		case 'next':
			url = baseUrl + '/go_to_next_item?include=items,current_item_time';
			break;
		case 'previous':
			url = baseUrl + '/go_to_previous_item?include=items,current_item_time';
			break;
	}

	self.doRest('POST', url, {})
		.then(function (result) {
			//plan was moved, let's process the results
			self.processLiveData(result);
		})
		.catch(function (message) {
			self.log('error', message);
			self.status(self.STATUS_ERROR, message);
		});
}

instance.prototype.processLiveData = function (result) {
	var self = this;

	if (result.errors) {
		self.log('error', result.errors);
		self.status(self.STATUS_ERROR, result.errors);
	} else {
		let items = result.included;
		let currentItemTimeId = result.data.relationships.current_item_time.data && result.data.relationships.current_item_time.data.id;
		let currentItemTime = result.included.find((res) => res.type === 'ItemTime' && res.id === currentItemTimeId);
		let currentItemId = currentItemTime && currentItemTime.relationships && currentItemTime.relationships.item.data && currentItemTime.relationships.item.data.id;

		if (currentItemId) {
			let index = items.findIndex((i) => i.id === currentItemId);
			let item = items.find(i => i.id === currentItemId);
			
			console.log(item.attributes.title);
			/*
			if (self.currentState.dynamicVariableDefinitions['plan_index_' + result.data.id] === undefined)
			{
				let variableObj = {};
				variableObj.label = 'Plan ' + result.data.id + ' Current Index';
				variableObj.name = 'plan_index_' + result.data.id;
				self.currentState.dynamicVariableDefinitions.push(variableObj);
			}
			
			if (self.currentState.dynamicVariableDefinitions['plan_length_' + result.data.id] === undefined)
			{
				let variableObj = {};
				variableObj.label = 'Plan ' + result.data.id + ' Length';
				variableObj.name = 'plan_length_' + result.data.id;
				self.currentState.dynamicVariableDefinitions.push(variableObj);
			}
			
			if (self.currentState.dynamicVariableDefinitions['plan_currentitem_' + result.data.id] === undefined)
			{
				let variableObj = {};
				variableObj.label = 'Plan ' + result.data.id + ' Current Item';
				variableObj.name = 'plan_currentitem_' + result.data.id;
				self.currentState.dynamicVariableDefinitions.push(variableObj);
			}
			
			self.setVariableDefinitions(self.currentState.dynamicVariableDefinitions);
			
			//console.log(self.currentState.dynamicVariableDefinitions);
			*/
		   
			self.updateVariable('plan_index', index);
			self.updateVariable('plan_length', items.length);
			self.updateVariable('plan_currentitem', item.attributes.title);
		}
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
