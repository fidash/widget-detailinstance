var Utils = (function () {
    "use strict";


    /*****************************************************************
    *                        C O N S T A N T S                       *
    *****************************************************************/

    var POWER_STATES = {
        '0': 'Power Down',
        '1': 'On',
        '4': 'Shut Off'
    };


    /*****************************************************************
    *                          P U B L I C                           *
    *****************************************************************/

    function getDisplayableAddresses(addresses) {

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

    }

    function getDisplayablePowerState (powerState) {
        return (powerState && powerState !== "") ? POWER_STATES[powerState.toString()] : '';
    }

    return {
        getDisplayableAddresses: getDisplayableAddresses,
        getDisplayablePowerState: getDisplayablePowerState
    };

})();