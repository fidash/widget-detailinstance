/* global InstanceDetails,Utils */

var UI = (function () {
    "use strict";


    /*****************************************************************
    *                        C O N S T A N T S                       *
    *****************************************************************/

    var NONUSABLEWIDTH = 204;
    var PROGRESSNONUSABLEWIDTH = 100;

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

    var flavors = {
        '1': '1 VCPU | 512MB RAM | 0GB Disk',
        '2': '1 VCPU | 2048MB RAM | 10GB Disk',
        '3': '2 VCPU | 2MB RAM | 20GB Disk'
    };


    /*****************************************************************
    *                          P R I V A T E                         *
    *****************************************************************/

    function setNameMaxWidth (nonUsableWidth) {

        var bodyWidth = $('body').attr('width');

        if (bodyWidth >= 360) {
            $('#instance-name').css('max-width', bodyWidth - nonUsableWidth);
        }
        else {
            $('#instance-name').css('max-width', 360 - nonUsableWidth);
        }
    }

    function setProgressBarWidth (progressNonUsableWidth) {

        var bodyWidth = $('body').attr('width') >= 360 ? $('body').attr('width') : 360;
        var progressBarWidth = bodyWidth/2 - progressNonUsableWidth;
        $('#progress-bar').css('width', progressBarWidth);

        // Inner text
        $('#progress-bar span').css('left', progressNonUsableWidth + progressBarWidth/2);

        if (bodyWidth <= 360) {
            $('#progress-bar span').css('max-width', 76);
        }
        else {
            $('#progress-bar span').css('max-width', "None");
        }
    }

    function showView(viewId) {

        // Hide all views
        $('#error-view').addClass('hide');
        $('#default-view').addClass('hide');
        $('#detail-view').addClass('hide');
        $('body').removeClass('stripes angled-135');

        // Show view
        $('#' + viewId).removeClass('hide');
    }

    function fixTooltips (instanceData) {

        var power_state = Utils.getDisplayablePowerState(instanceData['OS-EXT-STS:power_state']);
        var statusTooltip = 'Status: ' + instanceData.status + ', ' +
                            'Power State: ' + power_state + ', ' +
                            'VM State: ' + instanceData["OS-EXT-STS:vm_state"];

        $('#instance-status')
            .attr('title', statusTooltip)
            .attr('data-original-title', $('#instance-status').attr('title'))
            .attr('title', '');

        $('#instance-name')
            .attr('title', instanceData.name)
            .attr('data-original-title', $('#instance-name').attr('title'))
            .attr('title', '');

        $('#progress-bar span')
            .attr('title', instanceData["OS-EXT-STS:task_state"])
            .attr('data-original-title', instanceData["OS-EXT-STS:task_state"])
            .attr('title', '');

    }

    function buildDetails (instanceData) {

        var addresses = instanceData.addresses ? Utils.getDisplayableAddresses(instanceData.addresses) : '';
        var power_state = Utils.getDisplayablePowerState(instanceData['OS-EXT-STS:power_state']);
        var displayableTask = (instanceData["OS-EXT-STS:task_state"] && instanceData["OS-EXT-STS:task_state"] !== "") ? instanceData["OS-EXT-STS:task_state"] : "None";

        // Fields
        $('#instance-name').text(instanceData.name);
        $('#instance-owner > span').text(instanceData.user_id);
        $('#instance-id > span').text(instanceData.id);
        $('#instance-image > span').text(instanceData.image.id);
        $('#instance-key-pair > span').text(instanceData.key_name);
        $('#instance-addresses > span').text(addresses);
        $('#instance-flavor > span').text(flavors[instanceData.flavor.id.toString()]);
        $('#instance-created > span').text(instanceData.created);
        $('#instance-updated > span').text(instanceData.updated);

        
        // Remove previous status
        $('#instance-status').removeClass('working-animation');
        $('#instance-status > div > i').removeClass();
        
        // Deleting task
        if (displayableTask === 'deleting') {
            $('#instance-status > div > i').addClass(statuses.DELETING.class);
            $('#instance-status').css('background-color', statuses.DELETING.color);
            $('#instance-status').addClass(statuses.DELETING.animation);
        }
        else {
            $('#instance-status > div > i').addClass(statuses[instanceData.status].class);
            $('#instance-status').css('background-color', statuses[instanceData.status].color);
        }

        // Every other task
        if (displayableTask !== 'None') {
            $('#instance-task > span').empty();
            $('#progress-bar span').text(displayableTask);
            $('#progress-bar').removeClass('hide');
            $('#progress').css('background', statuses[instanceData.status].color);
        }
        else {
            $('#instance-task > span').text(displayableTask);
            $('#progress-bar').addClass('hide');
        }
    }


    /*****************************************************************
    *                          P U B L I C                           *
    *****************************************************************/

    function init (callbacks) {

        // Register resize callback
        MashupPlatform.widget.context.registerCallback(function (newValues) {
            if ("heightInPixels" in newValues || "widthInPixels" in newValues) {

                // Set body size
                $('body').attr('height', newValues.heightInPixels);
                $('body').attr('width', newValues.widthInPixels);

                // Set progress bar width
                setProgressBarWidth(PROGRESSNONUSABLEWIDTH);

                // Set name max-width
                setNameMaxWidth(NONUSABLEWIDTH);
            }
        });

        // Init click events
        $('#refresh-button').click(function () {
            callbacks.refresh();
        }.bind(this));
        $('#instance-reboot').click(function () {
            callbacks.reboot();
        }.bind(this));
        $('#instance-terminate').click(function () {
            callbacks.delete();
        }.bind(this));
        $('#instance-image > span').click(function () {

            var id = $(this).text();
            var data = {
                id: id,
                access: JSTACK.Keystone.params.access
            };

            MashupPlatform.wiring.pushEvent('image_id', JSON.stringify(data));
        });

        $('body').attr('width', window.innerWidth);

    }

    function buildDetailView (instanceData) {

        buildDetails(instanceData);
        setNameMaxWidth(NONUSABLEWIDTH);
        setProgressBarWidth(PROGRESSNONUSABLEWIDTH);
        fixTooltips(instanceData);

        // Initialize tooltips
        $('[data-toggle="tooltip"]').tooltip();

        showView('detail-view');
    }

    function buildDefaultView () {

        showView('default-view');
    }

    function buildErrorView (errorResponse) {

        // Build
        if (errorResponse.message) {
            $('#error-view').text(errorResponse.message);
        }
        else {
            $('#error-view').text(errorResponse);
        }
        
        showView('error-view');
    }


    return {
        buildDetailView: buildDetailView,
        buildDefaultView: buildDefaultView,
        buildErrorView: buildErrorView,
        init: init
    };
})();