var InstanceDetails = (function (JSTACK) {
	"use strict";

	/*****************************************************************
	*                     C O N S T R U C T O R                      *
	*****************************************************************/	

	function InstanceDetails (instanceId) {
		this.instanceId = instanceId;
	}


	/*****************************************************************
	*                          P U B L I C                           *
	*****************************************************************/

	InstanceDetails.prototype = {
		getInstanceDetails: function getInstanceDetails (callback, onError, region) {

			JSTACK.Nova.getserverdetail(this.instanceId, callback, onError, region);
		},

		deleteInstance: function deleteInstance (callback, onError, region) {
			JSTACK.Nova.deleteserver(this.instanceId, callback, onError, region);
		},

		rebootInstance : function rebootInstance (callback, onError, region) {
			JSTACK.Nova.rebootserversoft(this.instanceId, callback, onError, region);
		}
	};


	return InstanceDetails;

})(JSTACK);
