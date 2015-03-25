/* global InstanceDetails */

var UI = (function () {
	"use strict";


	/*****************************************************************
	****************************COSNTANTS*****************************
	*****************************************************************/

	var NONUSABLEWIDTH = 204;

	// Colors
	var RED = 'rgb(217, 83, 79)';
	var GREEN = 'green';
	var AMBAR = 'rgb(239, 163, 0)';
	var GRAY = 'gray';


	var statuses = {

		// GREEN
		'ACTIVE': {
			'class': 'glyphicon glyphicon-ok  fa-inverse',
			'color': GREEN
		},
		'BUILDING': {
			'class': 'fa fa-spinner fa-pulse  fa-inverse',
			'color': GREEN
		},
		'PASSWORD': {
			'class': 'fa fa-terminal  fa-inverse',
			'color': GREEN
		},

		// AMBAR
		'HARD_REBOOT': {
			'class': 'fa fa-repeat fa-spin  fa-inverse',
			'color': AMBAR
		},
		'PAUSED': {
			'class': 'fa fa-pause  fa-inverse',
			'color': AMBAR
		},
		'REBOOT': {
			'class': 'fa fa-repeat fa-spin  fa-inverse',
			'color': AMBAR
		},
		'BUILD': {
			'class': 'fa fa-repeat fa-spin  fa-inverse',
			'color': AMBAR
		},
		'RESCUED': {
			'class': 'fa fa-life-ring  fa-inverse',
			'color': AMBAR
		},
		'RESIZED': {
			'class': 'fa fa-arrows-alt  fa-inverse',
			'color': AMBAR
		},
		'VERIFY_RESIZE': {
			'class': 'fa fa-arrows-alt  fa-inverse',
			'color': AMBAR
		},
		'SHUTOFF': {
			'class': 'fa fa-stop  fa-inverse',
			'color': AMBAR
		},
		'SOFT_DELETED': {
			'class': 'fa fa-trash  fa-inverse',
			'color': AMBAR
		},
		'STOPPED': {
			'class': 'fa fa-stop  fa-inverse',
			'color': AMBAR
		},
		'SUSPENDED': {
			'class': 'fa fa-pause  fa-inverse',
			'color': AMBAR
		},

		// GRAY
		'UNKNOWN': {
			'class': 'fa fa-question  fa-inverse',
			'color': GRAY
		},

		// RED
		'DELETED': {
			'class': 'fa fa-trash  fa-inverse',
			'color': RED
		},
		'ERROR': {
			'class': 'fa fa-times  fa-inverse',
			'color': RED
		},
		'DELETING': {
			'class': 'fa fa-trash fa-inverse',
			'color': RED,
			'animation': 'working-animation'
		},
		'REVERT_RESIZE': {
			'class': 'fa fa-arrows-alt  fa-inverse',
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

	var getInstanceDetailsSuccess, receiveInstanceId, onError, initEvents,
		checkInstanceDetails, getDisplayableAddresses, refreshSuccess,
		setNameMaxWidth;

	var delay, prevRefresh, error, deleting;


	/*****************************************************************
	***************************CONSTRUCTOR****************************
	*****************************************************************/  

	function UI () {

		delay = 10000;
		prevRefresh = false;
		error = false;
		deleting = false;

		initEvents.call(this);
		this.buildDefaultView();
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	UI.prototype = {

		buildDetailView: function buildDetailView (instanceData) {

			var addresses = instanceData.addresses ? getDisplayableAddresses(instanceData.addresses) : '';
			var power_state = (instanceData['OS-EXT-STS:power_state'] && instanceData['OS-EXT-STS:power_state'] !== "") ? power_states[instanceData["OS-EXT-STS:power_state"].toString()] : '';
			var displayableTask = (instanceData["OS-EXT-STS:task_state"] && instanceData["OS-EXT-STS:task_state"] !== "") ? instanceData["OS-EXT-STS:task_state"] + '...' : "None";
			var statusTooltip = 'Status: ' + instanceData.status + ', ' + 'Power State: ' + power_state + ', ' + 'VM State: ' + instanceData["OS-EXT-STS:vm_state"];

			// Adjust refresh delay
			delay = (instanceData["OS-EXT-STS:task_state"] !== null && instanceData["OS-EXT-STS:task_state"] !== '') ? 2000 : 10000;

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
			$('#instance-status').removeClass('working-animation');
			$('#instance-status > div > i').removeClass();
			
			if (displayableTask === 'deleting...') {
				deleting = true;
				$('#instance-status > div > i').addClass(statuses.DELETING.class);
				$('#instance-status').css('background-color', statuses.DELETING.color);
				$('#instance-status').addClass(statuses.DELETING.animation);
			}
			else {
				$('#instance-status > div > i').addClass(statuses[instanceData.status].class);
				$('#instance-status').css('background-color', statuses[instanceData.status].color);
			}

			// Set name max-width
			setNameMaxWidth(NONUSABLEWIDTH);

			// Fix tooltips
			$('#instance-status').attr('title', statusTooltip);
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

			this.instanceDetails.deleteInstance(null, onError.bind(this));
		},

		rebootInstance: function rebootInstance () {

			if (!checkInstanceDetails.call(this)) {
				MashupPlatform.widget.log('Error: No instance received yet.');
				return;
			}

			this.instanceDetails.rebootInstance(null, onError.bind(this));
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

    setNameMaxWidth = function setNameMaxWidth (nonUsableWidth) {

		var bodyWidth = $('body').attr('width');

		if (bodyWidth >= 360) {
			$('#instance-name').css('max-width', bodyWidth - nonUsableWidth);
		}
		else {
			$('#instance-name').css('max-width', 360 - nonUsableWidth);
		}
	};

    initEvents = function initEvents () {

    	// Register callback for input endpoint
		MashupPlatform.wiring.registerCallback('instance_id', receiveInstanceId.bind(this));

		// Register resize callback
		MashupPlatform.widget.context.registerCallback(function (newValues) {
			if ("heightInPixels" in newValues || "widthInPixels" in newValues) {

				// Set body size
				$('body').attr('height', newValues.heightInPixels);
				$('body').attr('width', newValues.widthInPixels);

				// Set name max-width
				setNameMaxWidth(NONUSABLEWIDTH);
			}
		});

		// Init click events
		$('#refresh-button').click(function () {
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

	refreshSuccess = function refreshSuccess (instanceData) {

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