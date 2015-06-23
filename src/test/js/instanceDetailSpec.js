/* global InstanceDetails,UI */

describe('Instance Details', function () {
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

	afterEach(function () {
		MashupPlatform.reset();
		jasmine.resetAll(JSTACK.Nova);
		jasmine.resetAll(JSTACK.Keystone);
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

	
	/*********************************************************************************************
    *                           F U N C T I O N A L I T Y   T E S T S                            *
    *********************************************************************************************/

	it('should call JSTACK.Nova.getserverdetail when receives a wiring input event', function () {

		var instanceId = 'id';
		
		receiveWiringEvent(instanceId);

		expect(JSTACK.Nova.getserverdetail).toHaveBeenCalled();
	});



	it('should call JSTACK.Nova.deleteserver', function () {

		var instanceId = 'id';

		receiveWiringEvent(instanceId);
		instanceDetails.deleteInstance();

		expect(JSTACK.Nova.deleteserver).toHaveBeenCalled();
	});

	it('should call JSTACK.Nova.rebootserversoft', function () {
		var instanceId = 'id';

		receiveWiringEvent(instanceId);
		instanceDetails.rebootInstance();

		expect(JSTACK.Nova.rebootserversoft).toHaveBeenCalled();
	});

	it('should build the default view after deleting an instance', function () {

		var instanceId = 'id';
        var deleteCallback;
        var buildDefaultViewSpy = spyOn(UI, 'buildDefaultView');

        receiveWiringEvent(instanceId);
        instanceDetails.deleteInstance();
        deleteCallback = JSTACK.Nova.deleteserver.calls.mostRecent().args[1];
        deleteCallback();

        expect(buildDefaultViewSpy).toHaveBeenCalled();
        expect(instanceDetails.error).toBe(true);
	});

	it('should call buildDetailView after successfully getting an instance\'s details', function () {

		var buildDetailViewSpy = spyOn(UI, 'buildDetailView');
		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var successCallback;

		receiveWiringEvent(instanceId);
		successCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[1];
		successCallback(defaultInstance);

		expect(buildDetailViewSpy).toHaveBeenCalled();
	});

	it('should call the error function when refresh is called without an instance', function () {

		instanceDetails.getInstanceDetails();

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No instance received yet."');
	});

	it('should call the error function when deleteInstance is called without an instance', function () {

		instanceDetails.deleteInstance();

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No instance received yet."');

	});

	it('should call the error function when rebootInstance is called without an instance', function () {
		instanceDetails.rebootInstance();

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No instance received yet."');

	});

	it('should call JSTACK.Nova.getserverdetail when refreshing', function () {
		
		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var expectedCount;

		receiveWiringEvent(instanceId);
		instanceDetails.getInstanceDetails();

		expect(JSTACK.Nova.getserverdetail).toHaveBeenCalled();
	});

	it('should call the error function when the getInstanceDetails call fails', function () {

		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var errorCallback;

		receiveWiringEvent(instanceId);
		errorCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[2];
		errorCallback('Call error function');

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "Call error function"');
	});

	it('should set the automatic refreshing delay to 1 seconds while doing a task', function () {

		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var instanceId = 'id';

		receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(deletingInstance);
		
		expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 1000);

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

	it('should call getserverdetail 4 seconds after receiving the last update', function () {

        var callback;
        var instanceId = 'id';
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        receiveWiringEvent(instanceId);
		getInstanceDetailsSuccess(defaultInstance);
        callback = setTimeoutSpy.calls.mostRecent().args[0];
        callback();

        expect(JSTACK.Nova.getserverdetail).toHaveBeenCalled();
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 4000);
            
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

    it('should build the default view after getting a 404 error', function () {

        var buildDefaultViewSpy = spyOn(UI, 'buildDefaultView');
        var instanceId = 'id';
        var errorCallback;

        receiveWiringEvent(instanceId);
        errorCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[2];
        errorCallback({message: '404 Error'});

        expect(buildDefaultViewSpy).toHaveBeenCalled();
    });

});
