var InstanceDetails = (function (JSTACK) {
	"use strict";

	/*****************************************************************
	*************************CONSTRUCTOR******************************
	*****************************************************************/	

	function InstanceDetails (instanceId) {
		this.instanceId = instanceId;
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	InstanceDetails.prototype = {
		getInstanceDetails: function getInstanceDetails (callback, onError) {

			JSTACK.Nova.getserverdetail(this.instanceId, callback, onError);
		},

		deleteInstance: function deleteInstance (callback, onError) {
			JSTACK.Nova.deleteserver(this.instanceId, callback, onError);
		}
	};


	return InstanceDetails;

})(JSTACK);
