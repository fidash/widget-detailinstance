/* global InstanceDetails */

describe('User Interface', function () {
	"use strict";

	var respServices = null;
	var defaultInstance = null;
	var deletingInstance = null;
	var instanceDetails;

	beforeEach(function () {
		jasmine.getFixtures().fixturesPath = 'base/src/test/fixtures/html';
		loadFixtures('defaultTemplate.html');

		jasmine.getJSONFixtures().fixturesPath = 'base/src/test/fixtures/json';
		respServices = getJSONFixture('respServices.json');
		defaultInstance = getJSONFixture('defaultInstance.json');
		deletingInstance = getJSONFixture('deletingInstance.json');

		instanceDetails = new InstanceDetails();
		instanceDetails.init();
	});

	function receiveWiringEvent (instanceId) {

		var access = respServices.access;
		var token = 'gavrtshdrthrtyj';
		var wiringData = {
			'id': instanceId,
			'access': access,
			'token': token,
			'region': 'Spain2'
		};

		wiringData = JSON.stringify(wiringData);
		var receiveInstanceId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[1];		

		receiveInstanceId.call(instanceDetails, wiringData);
	}

	function getInstanceDetailsSuccess (response) {

		var callback;

		callback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[1];
		callback(response);
	}

	it('should build the default view', function () {

        UI.buildDefaultView();

        expect('#default-view').not.toHaveClass('hide');
    });

    it('should have a name width of 156 and a progress bar width of 76 when' + 
       ' the body size is less than 360', function () {

       	var instanceId = 'id';

    	$('body').attr('width', 100);
    	receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(defaultInstance);

		expect($('#instance-name')).toHaveCss({'max-width': '156px'});
		expect($('#progress-bar span')).toHaveCss({'max-width': '76px'});

    });

    it('should display an empty string when instance has no addresses attribute or it is empty', function () {

		var instanceData = defaultInstance.server;

		instanceData.addresses = null;
		UI.buildDetailView(instanceData);

		expect($('#instance-addresses > span')).toContainText('');

	});

	it('should display an empty string when addresses attribute has no private object', function () {

		var instanceData = defaultInstance.server;

		instanceData.addresses = {};
		UI.buildDetailView(instanceData);

		expect($('#instance-addresses > span')).toContainText('');
	});

	it('should display an empty string when instance has no power state attribute or it is empty', function () {
		var instanceData = defaultInstance.server;
		var statusTitle = 'Status: ' + instanceData.status + ', ' + 'Power State: ' + '' + ', ' + 'VM State: ' + instanceData["OS-EXT-STS:vm_state"];

		instanceData["OS-EXT-STS:power_state"] = null;
		UI.buildDetailView(instanceData);

		expect($('#instance-status').attr('data-original-title')).toEqual(statusTitle);
	});

	it('should display an empty string when instance\'s power state attribute is empty', function () {
		var instanceData = defaultInstance.server;
		var statusTitle = 'Status: ' + instanceData.status + ', ' + 'Power State: ' + '' + ', ' + 'VM State: ' + instanceData["OS-EXT-STS:vm_state"];

		instanceData["OS-EXT-STS:power_state"] = '';
		UI.buildDetailView(instanceData);

		expect($('#instance-status').attr('data-original-title')).toEqual(statusTitle);
	});

	it('should display "None" when instance\'s task attribute is empty', function () {
		var instanceData = defaultInstance.server;

		instanceData["OS-EXT-STS:task_state"] = "";
		UI.buildDetailView(instanceData);

		expect($('#instance-task span')).toContainText('None');
	});

	it('should display "None" when instance has no task attribute', function () {
		var instanceData = defaultInstance.server;

		instanceData["OS-EXT-STS:task_state"] = null;
		UI.buildDetailView(instanceData);

		expect($('#instance-task span')).toContainText('None');

	});

	it('should call JSTACK.Nova.getserverdetail when a click event is triggered on the refresh button', function () {

		var instanceId = 'id';
		var eventSpy = spyOnEvent('#refresh-button', 'click');
		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var expectedCountTimeout, expectedCountImageDetails;

		receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(defaultInstance);

		expectedCountTimeout = setTimeoutSpy.calls.count();
		expectedCountImageDetails = JSTACK.Nova.getserverdetail.calls.count() + 1;
		$('#refresh-button').trigger('click');

		expect(eventSpy).toHaveBeenTriggered();
		expect(JSTACK.Nova.getserverdetail.calls.count()).toEqual(expectedCountImageDetails);
		expect(setTimeoutSpy.calls.count()).toEqual(expectedCountTimeout);

	});

	it('should call JSTACK.Nova.deleteserver when a click event is triggered on the terminate button', function () {
		
		var instanceId = 'id';
		var eventSpy = spyOnEvent('#instance-terminate', 'click');
		var expectedCountDeleteInstance;

		receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(defaultInstance);

		expectedCountDeleteInstance = JSTACK.Nova.deleteserver.calls.count() + 1;
		$('#instance-terminate').trigger('click');

		expect(eventSpy).toHaveBeenTriggered();
		expect(JSTACK.Nova.deleteserver.calls.count()).toEqual(expectedCountDeleteInstance);
	});

	it('should call JSTACK.Nova.rebootserversoft when a click event is triggered on the reboot button', function () {
		
		var instanceId = 'id';
		var eventSpy = spyOnEvent('#instance-reboot', 'click');
		var expectedCountRebootInstance;

		receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(defaultInstance);

		expectedCountRebootInstance = JSTACK.Nova.rebootserversoft.calls.count() + 1;
		$('#instance-reboot').trigger('click');

		expect(eventSpy).toHaveBeenTriggered();
		expect(JSTACK.Nova.rebootserversoft.calls.count()).toEqual(expectedCountRebootInstance);
	});

	it('should correctly build the detail view', function () {

		var states = [
			"Power down",
			"On",
			"Shut Off"
		];
		var instanceData = deletingInstance.server;
		var addr = instanceData.addresses["private"][0].addr + ', ' + instanceData.addresses["private"][1].addr;
		var power_state = states[instanceData["OS-EXT-STS:power_state"]];
		var displayableTask = (instanceData["OS-EXT-STS:task_state"] && instanceData["OS-EXT-STS:task_state"] !== '') ? instanceData["OS-EXT-STS:task_state"] : "None";
		var fields = {
            'id': instanceData.id,
            'owner': instanceData.user_id,
            'addresses': addr,
            'created': instanceData.created,
            'updated': instanceData.updated,
            'image': instanceData.image.id,
            'key-pair': instanceData.key_name,
            'flavor': instanceData.flavor.id
        };
        var expectedTask = displayableTask;
        var instanceName = instanceData.name;
        var statusTitle = 'Status: ' + instanceData.status + ', ' + 'Power State: ' + power_state + ', ' + 'VM State: ' + instanceData["OS-EXT-STS:vm_state"];

        UI.buildDetailView(instanceData);

        for (var field in fields) {
        	expect($('#instance-' + field + ' > span')).toContainText(fields[field]);
        }

        expect($('#instance-name')).toContainText(instanceName);
        expect($('#instance-status').attr('data-original-title')).toEqual(statusTitle);
        expect($('#progress-bar > span')).toContainText(expectedTask);
	});

	it('should change the height value after been given a new height', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'heightInPixels': 400
		};

		callback(newValues);
		
		expect($('body').attr('height')).toBe(newValues.heightInPixels.toString());
	});

	it('should change the width value after been given a new width', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'widthInPixels': 800
		};

		callback(newValues);
		
		expect($('body').attr('width')).toBe(newValues.widthInPixels.toString());
	});

	it('should not change size after been given an empty new values set', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {};
		var bodyExpectedWidth = $('body').attr('width');
		var bodyExpectedHeight = $('body').attr('height');


		callback(newValues);
		
		expect($('body').attr('width')).toBe(bodyExpectedWidth);
		expect($('body').attr('height')).toBe(bodyExpectedHeight);
	});

	it('should build the error view with the correct message', function () {

		var errorCallback;
		var instanceId = 'id';
		var buildErrorViewSpy = spyOn(UI, 'buildErrorView').and.callThrough();
		var message = {
			'message': '500 Error',
			'body': 'Stack trace'
		};
		
		receiveWiringEvent(instanceId);
		errorCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[2];
		errorCallback(message);

		expect(buildErrorViewSpy).toHaveBeenCalled();
		expect($('#error-view')).toContainText('500 Error');
	});

});