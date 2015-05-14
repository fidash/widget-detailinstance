/* global InstanceDetails UI receiveInstanceId */

describe('Test instance details', function () {
	"use strict";

	var respServices = null;
	var defaultInstance = null;
	var deletingInstance = null;
	var ui;


	beforeEach(function () {

		jasmine.getFixtures().fixturesPath = 'base/src/test/fixtures/html';
		loadFixtures('defaultTemplate.html');

		jasmine.getJSONFixtures().fixturesPath = 'base/src/test/fixtures/json';
		respServices = getJSONFixture('respServices.json');
		defaultInstance = getJSONFixture('defaultInstance.json');
		deletingInstance = getJSONFixture('deletingInstance.json');

		ui = new UI();
	});

	function receiveWiringEvent (instanceId) {
		
		var access = respServices.access;
		var wiringData = {
			'id': instanceId,
			'access': access
		};

		wiringData = JSON.stringify(wiringData);
		var receiveInstanceId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[1];		

		receiveInstanceId.call(ui, wiringData);
	}

	function getInstanceDetailsSuccess (response) {

		var callback;

		callback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[1];
		callback(response);
	}

	/*********************************************************************************************
	********************************************Tests*********************************************
	*********************************************************************************************/

	it('should call JSTACK.Nova.getserverdetail when receives a wiring input event', function () {

		var instanceId = 'id';
		
		receiveWiringEvent(instanceId);

		expect(JSTACK.Nova.getserverdetail).toHaveBeenCalled();
		expect(ui.instanceDetails).toExist();
	});



	it('should call JSTACK.Nova.deleteserver', function () {

		var instanceId = 'id';

		receiveWiringEvent(instanceId);
		ui.deleteInstance();

		expect(JSTACK.Nova.deleteserver).toHaveBeenCalled();
		expect(ui.instanceDetails).toExist();
	});

	it('should call JSTACK.Nova.rebootserversoft', function () {
		var instanceId = 'id';

		receiveWiringEvent(instanceId);
		ui.rebootInstance();

		expect(JSTACK.Nova.rebootserversoft).toHaveBeenCalled();
		expect(ui.instanceDetails).toExist();
	});

	it('should build the default view after receiving a 404 error with the deleting flag active', function () {

		var buildDefaultViewSpy = spyOn(ui, 'buildDefaultView').and.callThrough();
		var instanceId = 'id';
		var errorCallback;

		receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(deletingInstance);
		errorCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[2];
		errorCallback({message: '404 Error', body: 'Not found.'});

		expect(buildDefaultViewSpy).toHaveBeenCalled();
	});

	it('should call buildDetailView after successfully getting an instance\'s details', function () {

		var buildDetailViewSpy = spyOn(ui, 'buildDetailView');
		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var successCallback;

		receiveWiringEvent(instanceId);
		successCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[1];
		successCallback(defaultInstance);

		expect(buildDetailViewSpy).toHaveBeenCalled();
	});

	it('should call the error function when refresh is called without an instance', function () {

		var expectedCount = MashupPlatform.widget.log.calls.count() + 1;

		ui.refresh();

		expect(MashupPlatform.widget.log.calls.count()).toBe(expectedCount);
		expect(MashupPlatform.widget.log.calls.mostRecent().args).toEqual(['Error: No instance received yet.']);
	});

	it('should call the error function when deleteInstance is called without an instance', function () {

		var expectedCount = MashupPlatform.widget.log.calls.count() + 1;

		ui.deleteInstance();

		expect(MashupPlatform.widget.log.calls.count()).toBe(expectedCount);
		expect(MashupPlatform.widget.log.calls.mostRecent().args).toEqual(['Error: No instance received yet.']);
	});

	it('should call the error function when rebootInstance is called without an instance', function () {

		var expectedCount = MashupPlatform.widget.log.calls.count() + 1;

		ui.rebootInstance();

		expect(MashupPlatform.widget.log.calls.count()).toBe(expectedCount);
		expect(MashupPlatform.widget.log.calls.mostRecent().args).toEqual(['Error: No instance received yet.']);
	});

	it('should call JSTACK.Nova.getserverdetail when refreshing', function () {
		
		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var expectedCount;

		receiveWiringEvent(instanceId);
		expectedCount = JSTACK.Nova.getserverdetail.calls.count() + 1;
		ui.refresh();

		expect(JSTACK.Nova.getserverdetail.calls.count()).toBe(expectedCount);
	});

	it('should call the error function when the getInstanceDetails call fails', function () {

		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var errorCallback;

		receiveWiringEvent(instanceId);
		errorCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[2];
		errorCallback('Call error function');

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "Call error function"');
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

        ui.buildDetailView(instanceData);

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
		var buildErrorViewSpy = spyOn(ui, 'buildErrorView').and.callThrough();
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

	it('should set the automatic refreshing delay to 1 seconds while doing a task', function () {

		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var instanceId = 'id';

		receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(deletingInstance);
		
		expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 1000);

	});

	it('should display an empty string when instance has no addresses attribute or it is empty', function () {

		var instanceData = defaultInstance.server;

		instanceData.addresses = null;
		ui.buildDetailView(instanceData);

		expect($('#instance-addresses > span')).toContainText('');

	});

	it('should display an empty string when addresses attribute has no private object', function () {

		var instanceData = defaultInstance.server;

		instanceData.addresses = {};
		ui.buildDetailView(instanceData);

		expect($('#instance-addresses > span')).toContainText('');
	});

	it('should display an empty string when instance has no power state attribute or it is empty', function () {
		var instanceData = defaultInstance.server;
		var statusTitle = 'Status: ' + instanceData.status + ', ' + 'Power State: ' + '' + ', ' + 'VM State: ' + instanceData["OS-EXT-STS:vm_state"];

		instanceData["OS-EXT-STS:power_state"] = null;
		ui.buildDetailView(instanceData);

		expect($('#instance-status').attr('data-original-title')).toEqual(statusTitle);

		instanceData["OS-EXT-STS:power_state"] = '';
		ui.buildDetailView(instanceData);

		expect($('#instance-status').attr('data-original-title')).toEqual(statusTitle);
	});

	it('should display "None" when instance has no task attribute or it is empty', function () {
		var instanceData = defaultInstance.server;

		instanceData["OS-EXT-STS:task_state"] = null;		
		ui.buildDetailView(instanceData);

		expect($('#instance-task span')).toContainText('None');

		instanceData["OS-EXT-STS:task_state"] = "";
		ui.buildDetailView(instanceData);

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

	it ('should call MashupPlatform.wiring.pushEvent when a click event is triggered on the image id', function () {

		var instanceId = 'id';
		var eventSpy = spyOnEvent('#instance-image > span', 'click');
		var expectedCountPushEvent;

		receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(defaultInstance);

		expectedCountPushEvent = MashupPlatform.wiring.pushEvent.calls.count() + 1;
		$('#instance-image > span').trigger('click');

		expect(eventSpy).toHaveBeenTriggered();
		expect(MashupPlatform.wiring.pushEvent.calls.count()).toEqual(expectedCountPushEvent);
	});

	it('should not call setTimeout the second time a wiring event is received', function () {

		var instanceId = 'id';
		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var expectedCountTimeout = setTimeoutSpy.calls.count() + 1;

		receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(defaultInstance);
		receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(defaultInstance);

		expect(setTimeoutSpy.calls.count()).toEqual(expectedCountTimeout);
	});

	it('should call getserverdetail 3 seconds after receiving the last update', function () {

        var expectedCount, callback;
        var instanceId = 'id';
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        receiveWiringEvent(instanceId);
        expectedCount = JSTACK.Nova.getserverdetail.calls.count() + 1;
		getInstanceDetailsSuccess(defaultInstance);
        callback = setTimeoutSpy.calls.mostRecent().args[0];
        callback();

        expect(JSTACK.Nova.getserverdetail.calls.count()).toEqual(expectedCount);
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 3000);
            
    });

    it('should not call setTimeout after an error has occurred', function () {

    	var setTimeoutSpy = spyOn(window, 'setTimeout');
    	var instanceId = 'id';
    	var expectedCount = setTimeoutSpy.calls.count();
    	var errorCallback;

    	receiveWiringEvent(instanceId);
    	errorCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[2];
    	errorCallback('Error');
    	getInstanceDetailsSuccess(defaultInstance);

    	expect(setTimeoutSpy.calls.count()).toEqual(expectedCount);
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

});
