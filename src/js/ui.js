/* global InstanceDetails */

var UI = (function () {
	"use strict";


	/*****************************************************************
	****************************VARIABLES*****************************
	*****************************************************************/

	var refreshButton, deleteButton, borderLayout, emptyLayout;

	var deleteInstanceSuccess, getInstanceDetailsSuccess, receiveInstanceId,
		onError, checkInstanceDetails, getDisplayableAddresses;


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
				headerStatus = document.createElement('h3'),
				headerSpecs = document.createElement('h3');

			header.textContent = 'Instance Details';
			headerInfo.textContent = 'Info';
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
				statusList  = document.createElement('ul'),
				specsList   = document.createElement('ul');

			var power_state = instanceData['OS-EXT-STS:power_state'] ? states[instanceData["OS-EXT-STS:power_state"]] : '';
			var addresses = instanceData.addresses ? getDisplayableAddresses(instanceData.addresses) : '';

			infoList.innerHTML = '<li><strong>' + fields[0] + ':</strong> ' + instanceData.id + '</li>' +
								 '<li><strong>' + fields[1] + ':</strong> ' + instanceData.name + '</li>' +
								 '<li><strong>' + fields[2] + ':</strong> ' + instanceData.status + '</li>';

			statusList.innerHTML = '<li><strong>' + fields[3] + ':</strong> ' + instanceData.status + '</li>' +
								   '<li><strong>' + fields[4] + ':</strong> ' + '' + '</li>' +
								   '<li><strong>' + fields[4] + ':</strong> ' + instanceData.checksum + '</li>' +
								   '<li><strong>' + fields[5] + ':</strong> ' + instanceData.created_at + '</li>' +
								   '<li><strong>' + fields[6] + ':</strong> ' + instanceData.updated_at + '</li>';

			specsList.innerHTML = '<li><strong>' + fields[7] + ':</strong> ' + instanceData.size + '</li>' +
								  '<li><strong>' + fields[8] + ':</strong> ' + instanceData.container_format + '</li>' +
								  '<li><strong>' + fields[9] + ':</strong> ' + instanceData.disk_format + '</li>';


			// Buttons
			var deleteButtonClass = instanceData.protected ? 'btn-danger pull-right disabled' : 'btn-danger pull-right';
			
			refreshButton = new StyledElements.StyledButton({text:'Refresh', 'class': 'pull-right clear'});
			deleteButton = new StyledElements.StyledButton({text:'Delete', 'class': deleteButtonClass});
			

			refreshButton.addEventListener('click', this.refresh.bind(this), false);
			deleteButton.addEventListener('click', this.deleteInstance.bind(this), false);


			// Header and footer
			borderLayout.getNorthContainer().appendChild(header);
			borderLayout.getSouthContainer().appendChild(refreshButton);
			borderLayout.getSouthContainer().appendChild(deleteButton);


			// Info {id, name}
			centerContainer.appendChild(headerInfo);
			centerContainer.appendChild(new StyledElements.Separator());
			centerContainer.appendChild(infoList);


			// Status {status, visibility, checksum, created, updated}
			centerContainer.appendChild(headerStatus);
			centerContainer.appendChild(new StyledElements.Separator());
			centerContainer.appendChild(statusList);


			// Specs {size, container_format, disk_format}
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

			background.className = 'empty-layout';
			message.clasName = 'info';
			background.appendChild(message);
			borderLayout.getCenterContainer().appendChild(background);
						
			// Insert and repaint
			borderLayout.repaint();

		},

		deleteInstance: function deleteInstance () {
		
			if (!checkInstanceDetails.call(this)) {
				MashupPlatform.widget.log('Error: No instance received yet.');
				return;
			}

			this.instanceDetails.deleteInstance(deleteInstanceSuccess.bind(this), onError);
		},

		refresh: function refresh () {

			if (!checkInstanceDetails.call(this)) {
				MashupPlatform.widget.log('Error: No instance received yet.');
				return;
			}

			this.instanceDetails.getInstanceDetails(getInstanceDetailsSuccess.bind(this), onError);
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
            displayableAddresses += '<br/>' + privateAddresses[i].addr;
        }

        return displayableAddresses;

    };


	/*****************************************************************
	***************************HANDLERS*******************************
	*****************************************************************/

	getInstanceDetailsSuccess = function getInstanceDetailsSuccess (instanceData) {
		instanceData = JSON.parse(instanceData);
		this.buildDetailView(instanceData);
	};

	deleteInstanceSuccess = function deleteInstanceSuccess (response) {
		this.buildDefaultView();
	};

	onError = function onError (error) {
		MashupPlatform.widget.log('Error: ' + JSON.stringify(error));
	};

	receiveInstanceId = function receiveInstanceId (wiringData) {
		wiringData = JSON.parse(wiringData);

		JSTACK.Keystone.params.access = wiringData.access;
		JSTACK.Keystone.params.token = wiringData.access.token.id;
		JSTACK.Keystone.params.currentstate = 2;

		this.instanceDetails = new InstanceDetails(wiringData.id);
		this.instanceDetails.getInstanceDetails(getInstanceDetailsSuccess.bind(this), onError);
	};


	return UI;
})();