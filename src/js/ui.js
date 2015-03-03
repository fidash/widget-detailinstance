/* global InstanceDetails */

var UI = (function () {
	"use strict";


	/*****************************************************************
	****************************COSNTANTS*****************************
	*****************************************************************/

	var RED = 'rgb(211, 1, 1)';
	var GREEN = 'green';
	var AMBAR = 'rgb(239, 163, 0)';
	var GRAY = 'gray';


	var statuses = {
		'ACTIVE': {
			'class': 'glyphicon glyphicon-ok fa-2x fa-inverse',
			'color': GREEN
		},
		'BUILDING': {
			'class': 'fa fa-spinner fa-pulse fa-2x fa-inverse',
			'color': GREEN
		},
		'PASSWORD': {
			'class': 'fa fa-terminal fa-2x fa-inverse',
			'color': GREEN
		},


		'HARD_REBOOT': {
			'class': 'fa fa-repeat fa-spin fa-2x fa-inverse',
			'color': AMBAR
		},
		'PAUSED': {
			'class': 'fa fa-pause fa-2x fa-inverse',
			'color': AMBAR
		},
		'REBOOT': {
			'class': 'fa fa-repeat fa-spin fa-2x fa-inverse',
			'color': AMBAR
		},
		'BUILD': {
			'class': 'fa fa-repeat fa-spin fa-2x fa-inverse',
			'color': AMBAR
		},
		'RESCUED': {
			'class': 'fa fa-life-ring fa-2x fa-inverse',
			'color': AMBAR
		},
		'RESIZED': {
			'class': 'fa fa-arrows-alt fa-2x fa-inverse',
			'color': AMBAR
		},
		'VERIFY_RESIZE': {
			'class': 'fa fa-arrows-alt fa-2x fa-inverse',
			'color': AMBAR
		},
		'SHUTOFF': {
			'class': 'fa fa-stop fa-2x fa-inverse',
			'color': AMBAR
		},
		'SOFT_DELETED': {
			'class': 'fa fa-trash fa-2x fa-inverse',
			'color': AMBAR
		},
		'STOPPED': {
			'class': 'fa fa-stop fa-2x fa-inverse',
			'color': AMBAR
		},
		'SUSPENDED': {
			'class': 'fa fa-pause fa-2x fa-inverse',
			'color': AMBAR
		},


		'UNKNOWN': {
			'class': 'fa fa-question fa-2x fa-inverse',
			'color': GRAY
		},


		'DELETED': {
			'class': 'fa fa-trash fa-2x fa-inverse',
			'color': RED
		},
		'ERROR': {
			'class': 'fa fa-times fa-2x fa-inverse',
			'color': RED
		},
		'DELETING': {
			'class': 'fa fa-repeat fa-spin fa-2x fa-inverse',
			'color': RED
		},
		'REVERT_RESIZE': {
			'class': 'fa fa-arrows-alt fa-2x fa-inverse',
			'color': RED
		}
	};

	var power_states = {
		'0': 'Power Down',
		'1': 'On',
		'4': 'Shut Off'
	};

	var flavors = {
		'1': '1 VCPU | 512MB RAM | 0GB Disk',
		'2': '1 VCPU | 2048MB RAM | 10GB Disk',
		'3': '2 VCPU | 2MB RAM | 20GB Disk'
	};

	/*****************************************************************
	****************************VARIABLES*****************************
	*****************************************************************/

	var deleteInstanceSuccess, getInstanceDetailsSuccess, receiveInstanceId,
		onError, checkInstanceDetails, deleteInstance, getDisplayableAddresses,
		rebootInstanceSuccess, refreshSuccess;

	var delay = 10000,
		prevRefresh = false,
		error = false,
		deleting = false;


	/*****************************************************************
	***************************CONSTRUCTOR****************************
	*****************************************************************/  

	function UI () {

		// Register callback for input endpoint
		MashupPlatform.wiring.registerCallback('instance_id', receiveInstanceId.bind(this));


		MashupPlatform.widget.context.registerCallback(function (newValues) {
			if ("heightInPixels" in newValues || "widthInPixels" in newValues) {
				$('body').attr('height', newValues.heightInPixels);
				$('body').attr('width', newValues.widthInPixels);
			}
		});

		this.buildDefaultView();
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	UI.prototype = {

		init: function init () {

			// Init click events
			$('#refresh-button').click(function () {
				$('#refresh-button > i').addClass('fa-spin');
				this.refresh.call(this);
			}.bind(this));
			$('#instance-reboot').click(function () {
				this.rebootInstance.call(this);
			}.bind(this));
			$('#instance-terminate').click(function () {
				this.deleteInstance.call(this);
			}.bind(this));
			$('#instance-image > span').click(function () {

				var id = $(this).text();
				var data = {
					id: id,
					access: JSTACK.Keystone.params.access
				};

				MashupPlatform.wiring.pushEvent('image_id', JSON.stringify(data));
			});			

		},

		buildDetailView: function buildDetailView (instanceData) {

			var addresses = instanceData.addresses ? getDisplayableAddresses(instanceData.addresses) : '';
			var power_state = instanceData['OS-EXT-STS:power_state'] ? power_states[instanceData["OS-EXT-STS:power_state"].toString()] : '';
			var displayableTask = (instanceData["OS-EXT-STS:task_state"] && instanceData["OS-EXT-STS:task_state"] !== '') ? instanceData["OS-EXT-STS:task_state"] + '...' : "None";
			var statusTooltip = 'Status: ' + instanceData.status + ', \x0A' + 'Power State: ' + power_state + ', \x0A' + 'VM State: ' + instanceData["OS-EXT-STS:vm_state"];

			// Adjust refresh delay
			delay = (instanceData["OS-EXT-STS:task_state"] !== null || instanceData["OS-EXT-STS:task_state"] !== '') ? 2000 : 10000;

			// Hide other views
			$('#error-view').addClass('hide');
			$('#default-view').addClass('hide');
			$('body').removeClass('stripes angled-135');

			// Fields
			$('#instance-name').text(instanceData.name);
			$('#instance-name').attr('title', instanceData.name);
			$('#instance-owner > span').text(instanceData.user_id);
			$('#instance-id > span').text(instanceData.id);
			$('#instance-image > span').text(instanceData.image.id);
			$('#instance-key-pair > span').text(instanceData.key_name);
			$('#instance-addresses > span').text(addresses);
			$('#instance-flavor > span').text(flavors[instanceData.flavor.id.toString()]);
			$('#instance-created > span').text(instanceData.created);
			$('#instance-updated > span').text(instanceData.updated);
			$('#instance-task > span').text(displayableTask);

			// Status
			$('#instance-status > i').removeClass();
			$('#instance-status > i').addClass(statuses[instanceData.status].class);
			$('#instance-status').attr('title', statusTooltip).css('background-color', statuses[instanceData.status].color);

			if (displayableTask === 'deleting...') {
				deleting = true;
				$('#instance-status > i').addClass(statuses.DELETING.class);
				$('#instance-status').css('background-color', statuses.DELETING.color);
			}

			$('#instance-status').attr('data-original-title', $('#instance-status').attr('title'));
			$('#instance-status').attr('title', '');

			$('#instance-name').attr('data-original-title', $('#instance-name').attr('title'));
			$('#instance-name').attr('title', '');

			// Initialize tooltips
			$('[data-toggle="tooltip"]').tooltip();

			// Build
			$('#detail-view').removeClass('hide');
		},

		buildDefaultView: function buildDefaultView () {

			// Hide other views
			$('#error-view').addClass('hide');
			$('#detail-view').addClass('hide');
			$('body').addClass('stripes angled-135');

			// Build
			$('#default-view').removeClass('hide');
		},

		deleteInstance: function deleteInstance () {
		
			if (!checkInstanceDetails.call(this)) {
				MashupPlatform.widget.log('Error: No instance received yet.');
				return;
			}

			this.instanceDetails.deleteInstance(deleteInstanceSuccess.bind(this), onError.bind(this));
		},

		rebootInstance: function rebootInstance () {

			if (!checkInstanceDetails.call(this)) {
				MashupPlatform.widget.log('Error: No instance received yet.');
				return;
			}

			this.instanceDetails.rebootInstance(rebootInstanceSuccess.bind(this), onError.bind(this));
		},

		refresh: function refresh () {

			if (!checkInstanceDetails.call(this)) {
				MashupPlatform.widget.log('Error: No instance received yet.');
				return;
			}

			this.instanceDetails.getInstanceDetails(refreshSuccess.bind(this), onError.bind(this));
		},

		buildErrorView: function buildErrorView (errorResponse) {
			
			// Hide other views
			$('#default-view').addClass('hide');
			$('#detail-view').addClass('hide');
			$('body').addClass('stripes angled-135');

			// Build
			if (errorResponse.message) {
				$('#error-view').text(errorResponse.message);
			}
			else {
				$('#error-view').text(errorResponse);
			}
			
			$('#error-view').removeClass('hide');
		}
	};


	/*****************************************************************
	***************************PRIVATE********************************
	*****************************************************************/

	checkInstanceDetails = function checkInstanceDetails () {
		
		if (!this.instanceDetails) {
			return false;
		}

		return true;
	};

	getDisplayableAddresses = function getDisplayableAddresses(addresses) {

        var privateAddresses = addresses["private"];
        var displayableAddresses;
        
        if (!privateAddresses) {
            return '';
        }

        displayableAddresses = privateAddresses[0].addr;

        for (var i=1; i<privateAddresses.length; i++) {
            displayableAddresses += ', ' + privateAddresses[i].addr;
        }

        return displayableAddresses;

    };


	/*****************************************************************
	***************************HANDLERS*******************************
	*****************************************************************/

	getInstanceDetailsSuccess = function getInstanceDetailsSuccess (instanceData) {
		
		// Keep refreshing if no errors
		if (!error) {
			this.buildDetailView(instanceData.server);
			
			setTimeout(function () {
				this.instanceDetails.getInstanceDetails(getInstanceDetailsSuccess.bind(this), onError.bind(this));
			}.bind(this), delay);
		}
		else {
			prevRefresh = false;
		}
	};

	deleteInstanceSuccess = function deleteInstanceSuccess (response) {
		// Nothing
	};

	rebootInstanceSuccess = function rebootInstanceSuccess (response) {
		// Nothing
	};

	refreshSuccess = function refreshSuccess (instanceData) {
		// Stop spin animation
		$('#refresh-button > i').removeClass('fa-spin');

		this.buildDetailView(instanceData.server);
	};

	onError = function onError (errorResponse) {

		// Build default view if flag deleting is true and error is 404
		if (errorResponse.message === '404 Error' && deleting) {
			this.buildDefaultView();
			deleting = false;
		}
		else {
			error = true;
			this.buildErrorView(errorResponse);
			MashupPlatform.widget.log('Error: ' + JSON.stringify(errorResponse));
		}
		
	};

	receiveInstanceId = function receiveInstanceId (wiringData) {
		wiringData = JSON.parse(wiringData);

		JSTACK.Keystone.params.access = wiringData.access;
		JSTACK.Keystone.params.token = wiringData.access.token.id;
		JSTACK.Keystone.params.currentstate = 2;

		this.instanceDetails = new InstanceDetails(wiringData.id);
		error = false;

		if (!prevRefresh) {
			prevRefresh = true;
			this.instanceDetails.getInstanceDetails(getInstanceDetailsSuccess.bind(this), onError.bind(this));	
		}
		else {
			this.instanceDetails.getInstanceDetails(refreshSuccess.bind(this), onError.bind(this));
		}
		
	};


	return UI;
})();