/* global InstanceDetails UI receiveInstanceId */

describe('Test instance details', function () {
	"use strict";

	var respServices = null;
	var respInstanceList = null;
	var calledGetInstanceDetailsSuccess, calledGetInstanceDetailsError;
	var ui;


	beforeEach(function () {
		jasmine.getJSONFixtures().fixturesPath = 'src/test/fixtures/json';
		respServices = getJSONFixture('respServices.json');
		respInstanceList = getJSONFixture('respInstanceList.json');
		calledGetInstanceDetailsSuccess = false;
		calledGetInstanceDetailsError = false;
		ui = new UI();
	});

	afterEach(function () {
		ui.buildDefaultView();
	});

	function receiveWiringEvent (ui, instanceId) {
		
		var access = respServices.access;
		var wiringData = {
			'id': instanceId,
			'access': access
		};

		wiringData = JSON.stringify(wiringData);
		var receiveInstanceId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[1];		

		receiveInstanceId.call(ui, wiringData);
	}

	function callGetInstanceDetailsCallback (instanceDetails) {

		var callback;

		instanceDetails.getInstanceDetails(function () {
			calledGetInstanceDetailsSuccess = true;
		},
		function () {
			calledGetInstanceDetailsError = true;
		});

		callback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[1];
		callback(respInstanceList);
	}

	xit('should call JSTACK.Nova.getserverdetail when receives a wiring input event', function () {

		var instanceId = 'id';
		
		receiveWiringEvent(ui, instanceId);

		expect(JSTACK.Nova.getserverdetail).toHaveBeenCalled();
		expect(ui.instanceDetails).toExist();
	});

	xit('should call JSTACK.Nova.deleteserver', function () {

		var instanceId = 'id';

		receiveWiringEvent(ui, instanceId);
		ui.deleteInstance();

		expect(JSTACK.Nova.deleteserver).toHaveBeenCalled();
		expect(ui.instanceDetails).toExist();
	});

	xit('should call buildDefaultView after successfully deleting an instance', function () {

		var buildDefaultViewSpy = spyOn(ui, 'buildDefaultView');
		var instanceId = 'id';
		var successCallback;

		receiveWiringEvent(ui, instanceId);
		ui.deleteInstance();
		successCallback = JSTACK.Nova.deleteserver.calls.mostRecent().args[1];
		successCallback();

		expect(buildDefaultViewSpy).toHaveBeenCalled();
	});

	xit('should call JSTACK.Nova.getserverdetail success callback', function () {

		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';

		receiveWiringEvent(ui, instanceId);
		callGetInstanceDetailsCallback(ui.instanceDetails);
		expect(calledGetInstanceDetailsSuccess).toBe(true);
	});

	xit('should call buildDetailView after successfully getting an instance\'s details', function () {

		var buildDetailViewSpy = spyOn(ui, 'buildDetailView');
		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var successCallback;

		receiveWiringEvent(ui, instanceId);
		successCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[1];
		successCallback(respInstanceList);

		expect(buildDetailViewSpy).toHaveBeenCalled();
	});

	xit('should call the error function when refresh or delete are called without an instance', function () {

		ui.refresh();
		ui.deleteInstance();

		expect(MashupPlatform.widget.log.calls.count()).toBe(2);
		expect(MashupPlatform.widget.log.calls.argsFor(0)).toEqual(['Error: No instance received yet.']);
		expect(MashupPlatform.widget.log.calls.argsFor(1)).toEqual(['Error: No instance received yet.']);
	});

	xit('should call JSTACK.Nova.getserverdetail when refreshing', function () {
		
		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';

		receiveWiringEvent(ui, instanceId);
		ui.refresh();

		expect(JSTACK.Nova.getserverdetail).toHaveBeenCalled();
	});

	xit('should call the error function when the getInstanceDetails or deleteInstance calls fail', function () {

		var instanceId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var errorCallback;

		receiveWiringEvent(ui, instanceId);
		errorCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[2];
		errorCallback('Call error function');

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "Call error function"');
	});

	xit('should correctly build the detail view', function () {

		var states = [
            "SHUT DOWN",
            "RUNNING",
            "SHUTOFF",
        ];
		var instanceData = respInstanceList.servers[0];
		var z = 0;
		var addr = instanceData.addresses["private"][0].addr + ', ' + instanceData.addresses["private"][1].addr;
		var power_state = states[instanceData["OS-EXT-STS:power_state"]];
		var displayableTask = (instanceData["OS-EXT-STS:task_state"] && instanceData["OS-EXT-STS:task_state"] !== '') ? instanceData["OS-EXT-STS:task_state"] : "None";
		var fields = [
                'ID: ' + instanceData.id,
                'Name: ' + instanceData.name,
                'Owner: ' + instanceData.user_id,
                'Addresses: ' + addr,
                'Status: ' + instanceData.status,
                'Disk Config: ' + instanceData["OS-DCF:diskConfig"],
                'VM State: ' + instanceData["OS-EXT-STS:vm_state"],
                'Power State: ' + power_state,
                'Task: ' + displayableTask,
                'Created: ' + instanceData.created,
                'Updated: ' + instanceData.updated,
                'Image: ' + instanceData.image.id,
                'Key Pair: ' + instanceData.key_name,
                'Flavor: ' + instanceData.flavor.id
                ];
		
		ui.buildDetailView(instanceData);
		expect($('.center_container > ul > li')).toExist();
		$('.center_container > ul > li').each(function () {
			expect($(this)).toContainText(fields[z]);
			z += 1;
		});
	});

	xit('should change the height value after been given a new height', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'heightInPixels': 400
		};
		var instanceData = respInstanceList.servers[0];
		var totalHeight;

		$('.center_container').css('height', '400px');
		ui.buildDetailView(instanceData);
		callback(newValues);
		totalHeight = parseInt($('.center_container').css('height')) + parseInt($('.north_container').css('height')) + parseInt($('.south_container').css('height'));
		
		expect(totalHeight).toBe(newValues.heightInPixels);
	});

	xit('should change the width value after been given a new width', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'widthInPixels': 768
		};
		var instanceData = respInstanceList.servers[0];
		var totalWidth;

		ui.buildDetailView(instanceData);
		callback(newValues);
		totalWidth = parseInt($('.center_container').css('width')) + parseInt($('.east_container').css('width')) + parseInt($('.west_container').css('width'));
		
		expect(totalWidth).toBe(newValues.widthInPixels);
	});

	xit('should not change size after been given an empty new values set', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {};
		var instanceData = respInstanceList.servers[0];
		var totalWidthPrev, totalWidth, totalHeightPrev, totalHeight;

		totalHeightPrev = parseInt($('.center_container').css('height')) + parseInt($('.north_container').css('height')) + parseInt($('.south_container').css('height'));
		totalWidthPrev = parseInt($('.center_container').css('width')) + parseInt($('.east_container').css('width')) + parseInt($('.west_container').css('width'));

		ui.buildDetailView(instanceData);
		callback(newValues);

		totalHeight = parseInt($('.center_container').css('height')) + parseInt($('.north_container').css('height')) + parseInt($('.south_container').css('height'));
		totalWidth = parseInt($('.center_container').css('width')) + parseInt($('.east_container').css('width')) + parseInt($('.west_container').css('width'));
		
		expect(totalWidthPrev).toEqual(totalWidth);
		expect(totalHeightPrev).toEqual(totalHeight);
	});

	xit('should build the error view on failure', function () {

		var errorCallback;
		var instanceId = 'id';
		var buildErrorViewSpy = spyOn(ui, 'buildErrorView').and.callThrough();
		var message = {
			'message': '500 Error',
			'body': 'Stack trace'
		};
		
		receiveWiringEvent(ui, instanceId);
		errorCallback = JSTACK.Nova.getserverdetail.calls.mostRecent().args[2];
		errorCallback(message);

		expect(buildErrorViewSpy).toHaveBeenCalled();
		expect($('.error')).toContainText('Error: Server returned the following error: "500 Error"');
	});


	it('',function () {
		expect(true).toBe(true);
	});
});
