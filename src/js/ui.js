/* global InstanceDetails */

var UI = (function () {
	"use strict";


	/*****************************************************************
	****************************VARIABLES*****************************
	*****************************************************************/

	var refreshButton, deleteButton, borderLayout, emptyLayout;

	var deleteInstanceSuccess, getInstanceDetailsSuccess, receiveInstanceId,
		onError, checkInstanceDetails, deleteInstance, getDisplayableAddresses;


	/*****************************************************************
	***************************CONSTRUCTOR****************************
	*****************************************************************/  

	function UI () {

		borderLayout = new StyledElements.BorderLayout();
		borderLayout.insertInto(document.body);
		

		// Register callback for input endpoint
		MashupPlatform.wiring.registerCallback('instance_id', receiveInstanceId.bind(this));


		/* Context */
		MashupPlatform.widget.context.registerCallback(function (newValues) {
			if ("heightInPixels" in newValues || "widthInPixels" in newValues) {
				borderLayout.repaint();
			}
		});

		this.buildDefaultView();
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	UI.prototype = {
		buildDetailView: function buildDetailView (instanceData) {

			// Delete previous
			borderLayout.getNorthContainer().clear();
			borderLayout.getCenterContainer().clear();
			borderLayout.getSouthContainer().clear();

			// Border layout
			var centerContainer = borderLayout.getCenterContainer();


			// Headers
			var header = document.createElement('h2'),
				headerInfo = document.createElement('h3'),
				headerAddresses = document.createElement('h3'),
				headerStatus = document.createElement('h3'),
				headerSpecs = document.createElement('h3');

			header.textContent = 'Instance Details';
			headerInfo.textContent = 'Info';
			headerAddresses.textContent = 'Addresses';
			headerStatus.textContent = 'Status';
			headerSpecs.textContent = 'Specs';


			// Fields
			var states = [
	            "SHUT DOWN",
	            "RUNNING",
	            "SHUTOFF",
	        ];
			var fields = [
				'ID',
	            'Name',
	            'Status',
	            'Addresses',
	            'Owner',
	            'Created',
	            'Updated',
	            'Image',
	            'Key Pair',
	            'Flavor',
	            'Disk Config',
	            'VM State',
	            'Power State',
	            'Task'];


			// Data
			var infoList    = document.createElement('ul'),
				addressesList = document.createElement('ul'),
				statusList  = document.createElement('ul'),
				specsList   = document.createElement('ul');

			var power_state = instanceData['OS-EXT-STS:power_state'] ? states[instanceData["OS-EXT-STS:power_state"]] : '';
			var addresses = instanceData.addresses ? getDisplayableAddresses(instanceData.addresses) : '';
			var displayableTask = (instanceData["OS-EXT-STS:task_state"] && instanceData["OS-EXT-STS:task_state"] !== '') ? instanceData["OS-EXT-STS:task_state"] : "None";

			infoList.innerHTML = '<li><strong>' + fields[0] + ':</strong> ' + instanceData.id + '</li>' +
								 '<li><strong>' + fields[1] + ':</strong> ' + instanceData.name + '</li>' +
								 '<li><strong>' + fields[4] + ':</strong> ' + instanceData.user_id + '</li>';

			addressesList.innerHTML = '<li><strong>' + fields[3] + ':</strong> ' + addresses + '</li>';

			statusList.innerHTML = '<li><strong>' + fields[2] + ':</strong> ' + instanceData.status + '</li>' +
								   '<li><strong>' + fields[10] + ':</strong> ' + instanceData["OS-DCF:diskConfig"] + '</li>' +
								   '<li><strong>' + fields[11] + ':</strong> ' + instanceData["OS-EXT-STS:vm_state"] + '</li>' +
								   '<li><strong>' + fields[12] + ':</strong> ' + power_state + '</li>' +
								   '<li><strong>' + fields[13] + ':</strong> ' + displayableTask + '</li>';

			specsList.innerHTML = '<li><strong>' + fields[5] + ':</strong> ' + instanceData.created + '</li>' +
								  '<li><strong>' + fields[6] + ':</strong> ' + instanceData.updated + '</li>' +
								  '<li><strong>' + fields[7] + ':</strong> ' + instanceData.image.id + '</li>' +
								  '<li><strong>' + fields[8] + ':</strong> ' + instanceData.key_name + '</li>' +
								  '<li><strong>' + fields[9] + ':</strong> ' + instanceData.flavor.id + '</li>';


			// Buttons
			refreshButton = new StyledElements.StyledButton({text:'Refresh', 'class': 'pull-right clear'});
			refreshButton.addEventListener('click', this.refresh.bind(this), false);


			// Header and footer
			borderLayout.getNorthContainer().appendChild(header);
			borderLayout.getSouthContainer().appendChild(refreshButton);
			//borderLayout.getSouthContainer().appendChild(deleteButton);


			// Info {id, name}
			centerContainer.appendChild(headerInfo);
			centerContainer.appendChild(new StyledElements.Separator());
			centerContainer.appendChild(infoList);


			// Addresses {addresses}
			centerContainer.appendChild(headerAddresses);
			centerContainer.appendChild(new StyledElements.Separator());
			centerContainer.appendChild(addressesList);

			// Status {status, disk_config, vm_state, power_state, task}
			centerContainer.appendChild(headerStatus);
			centerContainer.appendChild(new StyledElements.Separator());
			centerContainer.appendChild(statusList);


			// Specs {created, updated, image, key_pair, flavor}
			centerContainer.appendChild(headerSpecs);
			centerContainer.appendChild(new StyledElements.Separator());
			centerContainer.appendChild(specsList);


			// Insert and repaint
			borderLayout.repaint();
		},

		buildDefaultView: function buildDefaultView () {

			// Delete previous
			borderLayout.getNorthContainer().clear();
			borderLayout.getCenterContainer().clear();
			borderLayout.getSouthContainer().clear();

			// Build
			var background = document.createElement('div');
			var message = document.createElement('div');

			background.className = 'stripes angled-135';
			background.appendChild(message);

			message.className = 'info';
			message.textContent = 'No instance data received yet.';

			borderLayout.getCenterContainer().appendChild(background);
						
			// Insert and repaint
			borderLayout.repaint();

		},

		deleteInstance: function deleteInstance () {
		
			if (!checkInstanceDetails.call(this)) {
				MashupPlatform.widget.log('Error: No instance received yet.');
				return;
			}

			this.instanceDetails.deleteInstance(deleteInstanceSuccess.bind(this), onError.bind(this));
		},

		refresh: function refresh () {

			if (!checkInstanceDetails.call(this)) {
				MashupPlatform.widget.log('Error: No instance received yet.');
				return;
			}

			this.instanceDetails.getInstanceDetails(getInstanceDetailsSuccess.bind(this), onError.bind(this));
		},

		buildErrorView: function buildErrorView (error) {
			
			// Delete previous
			borderLayout.getNorthContainer().clear();
			borderLayout.getCenterContainer().clear();
			borderLayout.getSouthContainer().clear();

			// Build
			var background = document.createElement('div');
			var message = document.createElement('div');

			background.className = 'stripes angled-135';
			background.appendChild(message);

			message.className = 'error';
			message.textContent = 'Error: Server returned the following error: ' + JSON.stringify(error.message);

			borderLayout.getCenterContainer().appendChild(background);
						
			// Insert and repaint
			borderLayout.repaint();
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
		//instanceData = JSON.parse(instanceData);
		this.buildDetailView(instanceData.server);
	};

	deleteInstanceSuccess = function deleteInstanceSuccess (response) {
		this.buildDefaultView();
	};

	onError = function onError (error) {
		this.buildErrorView(error);
		MashupPlatform.widget.log('Error: ' + JSON.stringify(error));
	};

	receiveInstanceId = function receiveInstanceId (wiringData) {
		wiringData = JSON.parse(wiringData);

		JSTACK.Keystone.params.access = wiringData.access;
		JSTACK.Keystone.params.token = wiringData.access.token.id;
		JSTACK.Keystone.params.currentstate = 2;

		this.instanceDetails = new InstanceDetails(wiringData.id);
		this.instanceDetails.getInstanceDetails(getInstanceDetailsSuccess.bind(this), onError.bind(this));
	};


	return UI;
})();