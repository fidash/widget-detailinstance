/* global UI */

var InstanceDetails = (function (JSTACK) {
    "use strict";

    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function InstanceDetails () {

        this.delay = 4000;
        this.error = false;
        this.firstRefresh = true;

    }


    /*****************************************************************
    *                          P R I V A T E                         *
    *****************************************************************/

    function hasReceivedInstance () {
        return this.instanceId && this.region;
    }

    function drawDetails (autoRefresh, instanceData) {

        // Build view
        UI.buildDetailView(instanceData.server);

        // Recalculate refresh delay
        this.delay = (instanceData.server["OS-EXT-STS:task_state"] !== null && instanceData.server["OS-EXT-STS:task_state"] !== '') ? 1000 : 4000;

        if (autoRefresh && !this.error) {
            setTimeout(function () {
                this.getInstanceDetails(drawDetails.bind(this, true), onError.bind(this));
            }.bind(this), this.delay);
        }

    }

    function resetInterface () {
        this.error = true;
        UI.buildDefaultView();
    }

    function onError (errorResponse) {

        // Build default view if flag deleting is true and error is 404
        if (errorResponse.message === '404 Error') {
            UI.buildDefaultView();
        }
        else {
            this.error = true;
            UI.buildErrorView(errorResponse);
            MashupPlatform.widget.log('Error: ' + JSON.stringify(errorResponse));
        }
        
    }

    function receiveInstanceId (wiringData) {
        wiringData = JSON.parse(wiringData);

        JSTACK.Keystone.params.access = wiringData.access;
        JSTACK.Keystone.params.token = wiringData.token;
        JSTACK.Keystone.params.currentstate = 2;

        this.instanceId = wiringData.id;
        this.region = wiringData.region;
        this.error = false;
        this.getInstanceDetails(this.firstRefresh);
        this.firstRefresh = false;
        
    }


    /*****************************************************************
    *                          P U B L I C                           *
    *****************************************************************/

    InstanceDetails.prototype = {
        init: function () {

            var callbacks = {
                refresh: this.getInstanceDetails.bind(this, false),
                delete: this.deleteInstance.bind(this),
                reboot: this.rebootInstance.bind(this)
            };

            // Register callback for input endpoint
            MashupPlatform.wiring.registerCallback('instance_id', receiveInstanceId.bind(this));

            UI.init(callbacks);
        },

        getInstanceDetails: function (autoRefresh) {

            if (!hasReceivedInstance.call(this)) {
                onError.call(this,"No instance received yet.");
                return;
            }

            JSTACK.Nova.getserverdetail(this.instanceId, drawDetails.bind(this, autoRefresh), onError.bind(this), this.region);

        },

        deleteInstance: function () {

            if (!hasReceivedInstance.call(this)) {
                onError.call(this,"No instance received yet.");
                return;
            }

            JSTACK.Nova.deleteserver(this.instanceId, resetInterface.bind(this), onError.bind(this), this.region);

        },

        rebootInstance : function () {

            if (!hasReceivedInstance.call(this)) {
                onError.call(this,"No instance received yet.");
                return;
            }

            JSTACK.Nova.rebootserversoft(this.instanceId, this.getInstanceDetails.bind(this, false), onError.bind(this), this.region);

        }
    };


    return InstanceDetails;

})(JSTACK);
