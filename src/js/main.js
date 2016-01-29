/* global InstanceDetails */

window.addEventListener('DOMContentLoaded', function () {
    "use strict";

    var instanceDetails = new InstanceDetails();
    instanceDetails.init();
    instanceDetails.authenticate();
}, false);
