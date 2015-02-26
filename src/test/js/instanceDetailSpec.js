/* global ImageDetails UI receiveImageId */

describe('Test image details', function () {
	"use strict";

	var respServices = null;
	var respImageList = null;
	var calledGetImageDetailsSuccess, calledGetImageDetailsError;
	var ui;


	beforeEach(function () {
		jasmine.getJSONFixtures().fixturesPath = 'src/test/fixtures/json';
		respServices = getJSONFixture('respServices.json');
		respImageList = getJSONFixture('respImageList.json');
		calledGetImageDetailsSuccess = false;
		calledGetImageDetailsError = false;
		ui = new UI();
	});

	afterEach(function () {
		ui.buildDefaultView();
	});

	function receiveWiringEvent (ui, imageId) {
		
		var access = respServices.access;
		var wiringData = {
			'id': imageId,
			'access': access
		};

		wiringData = JSON.stringify(wiringData);
		var receiveImageId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[1];		

		receiveImageId.call(ui, wiringData);
	}

	function callGetImageDetailsCallback (imageDetails) {

		var callback;

		imageDetails.getImageDetails(function () {
			calledGetImageDetailsSuccess = true;
		},
		function () {
			calledGetImageDetailsError = true;
		});

		callback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
		callback(respImageList);
	}

	it('should call JSTACK.Nova.getimagelist when receives a wiring input event', function () {

		var imageId = 'id';
		
		receiveWiringEvent(ui, imageId);

		expect(JSTACK.Nova.getimagelist).toHaveBeenCalled();
		expect(ui.imageDetails).toExist();
	});

	it('should call JSTACK.Nova.deleteimage', function () {

		var imageId = 'id';

		receiveWiringEvent(ui, imageId);
		ui.deleteImage();

		expect(JSTACK.Nova.deleteimage).toHaveBeenCalled();
		expect(ui.imageDetails).toExist();
	});

	it('should call buildDefaultView after successfully deleting an image', function () {

		var buildDefaultViewSpy = spyOn(ui, 'buildDefaultView');
		var imageId = 'id';
		var successCallback;

		receiveWiringEvent(ui, imageId);
		ui.deleteImage();
		successCallback = JSTACK.Nova.deleteimage.calls.mostRecent().args[1];
		successCallback();

		expect(buildDefaultViewSpy).toHaveBeenCalled();
	});

	it('should call JSTACK.Nova.getimagelist error callback', function () {

		var imageId = 'id';
		
		receiveWiringEvent(ui, imageId);
		callGetImageDetailsCallback(ui.imageDetails);
		expect(calledGetImageDetailsError).toBe(true);

	});

	it('should call JSTACK.Nova.getimagelist success callback', function () {

		var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';

		receiveWiringEvent(ui, imageId);
		callGetImageDetailsCallback(ui.imageDetails);
		expect(calledGetImageDetailsSuccess).toBe(true);
	});

	it('should call buildDetailView after successfully getting an image\'s details', function () {

		var buildDetailViewSpy = spyOn(ui, 'buildDetailView');
		var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var successCallback;

		receiveWiringEvent(ui, imageId);
		successCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
		successCallback(respImageList);

		expect(buildDetailViewSpy).toHaveBeenCalled();
	});

	it('should call the error function when refresh or delete are called without an image', function () {

		ui.refresh();
		ui.deleteImage();

		expect(MashupPlatform.widget.log.calls.count()).toBe(2);
		expect(MashupPlatform.widget.log.calls.argsFor(0)).toEqual(['Error: No image received yet.']);
		expect(MashupPlatform.widget.log.calls.argsFor(1)).toEqual(['Error: No image received yet.']);
	});

	it('should call JSTACK.Nova.getimagelist when refreshing', function () {
		
		var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';

		receiveWiringEvent(ui, imageId);
		ui.refresh();

		expect(JSTACK.Nova.getimagelist).toHaveBeenCalled();
	});

	it('should call the error function when the getImageDetails or deleteImage calls fail', function () {

		var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var errorCallback;

		receiveWiringEvent(ui, imageId);
		errorCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[2];
		errorCallback('Call error function');

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "Call error function"');
	});

	it('should correctly build the detail view', function () {

		var imageData = respImageList.images[0];
		var z = 0;
		var fields = [
                'ID: ' + imageData.id,
                'Name: ' + imageData.name,
                'Status: ' + imageData.status,
                'Visibility: Public',
                'Checksum: ' + imageData.checksum,
                'Created: ' + imageData.created_at,
                'Updated: ' + imageData.updated_at,
                'Size: ' + imageData.size,
                'Container format: ' + imageData.container_format,
                'Disk format: ' + imageData.disk_format
                ];
		
		ui.buildDetailView(imageData);

		$('.center_container > ul > li').each(function () {
			expect($(this)).toContainText(fields[z]);
			z += 1;
		});
	});

	it('should build the detailed view with a private image', function () {

		var imageData = respImageList.images[1];
		var z = 0;
		var fields = [
                'ID: ' + imageData.id,
                'Name: ' + imageData.name,
                'Status: ' + imageData.status,
                'Visibility: Private',
                'Checksum: ' + imageData.checksum,
                'Created: ' + imageData.created_at,
                'Updated: ' + imageData.updated_at,
                'Size: ' + imageData.size,
                'Container format: ' + imageData.container_format,
                'Disk format: ' + imageData.disk_format
                ];
		
		ui.buildDetailView(imageData);

		$('.center_container > ul > li').each(function () {
			expect($(this)).toContainText(fields[z]);
			z += 1;
		});
	});
	
	it('should build build the detailed view with a protected image', function () {

		var imageData = respImageList.images[2];
		var z = 0;
		var fields = [
                'ID: ' + imageData.id,
                'Name: ' + imageData.name,
                'Status: ' + imageData.status,
                'Visibility: Public',
                'Checksum: ' + imageData.checksum,
                'Created: ' + imageData.created_at,
                'Updated: ' + imageData.updated_at,
                'Size: ' + imageData.size,
                'Container format: ' + imageData.container_format,
                'Disk format: ' + imageData.disk_format
                ];

        ui.buildDetailView(imageData);

		$('.center_container > ul > li').each(function () {
			expect($(this)).toContainText(fields[z]);
			z += 1;
		});
	});

	it('should change the height value after been given a new height', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'heightInPixels': 400
		};
		var imageData = respImageList.images[2];
		var totalHeight;

		$('.center_container').css('height', '400px');
		ui.buildDetailView(imageData);
		callback(newValues);
		totalHeight = parseInt($('.center_container').css('height')) + parseInt($('.north_container').css('height')) + parseInt($('.south_container').css('height'));
		
		expect(totalHeight).toBe(newValues.heightInPixels);
	});

	it('should change the width value after been given a new width', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'widthInPixels': 768
		};
		var imageData = respImageList.images[2];
		var totalWidth;

		ui.buildDetailView(imageData);
		callback(newValues);
		totalWidth = parseInt($('.center_container').css('width')) + parseInt($('.east_container').css('width')) + parseInt($('.west_container').css('width'));
		
		expect(totalWidth).toBe(newValues.widthInPixels);
	});

	it('should not change size after been given an empty new values set', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {};
		var imageData = respImageList.images[2];
		var totalWidthPrev, totalWidth, totalHeightPrev, totalHeight;

		totalHeightPrev = parseInt($('.center_container').css('height')) + parseInt($('.north_container').css('height')) + parseInt($('.south_container').css('height'));
		totalWidthPrev = parseInt($('.center_container').css('width')) + parseInt($('.east_container').css('width')) + parseInt($('.west_container').css('width'));

		ui.buildDetailView(imageData);
		callback(newValues);

		totalHeight = parseInt($('.center_container').css('height')) + parseInt($('.north_container').css('height')) + parseInt($('.south_container').css('height'));
		totalWidth = parseInt($('.center_container').css('width')) + parseInt($('.east_container').css('width')) + parseInt($('.west_container').css('width'));
		
		expect(totalWidthPrev).toEqual(totalWidth);
		expect(totalHeightPrev).toEqual(totalHeight);
	});

});
