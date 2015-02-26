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

			var onOk = function onOk (response) {

				var instanceData;
				
				for (var i=0; i<response.images.length; i++) {
					if (response.servers[i].id === this.instanceId) {
						instanceData = JSON.stringify(response.servers[i]);
						break;
					}
				}

				if (!instanceData) {
					onError("Instance with ID " + this.instanceId + " does not exist.");
					return;
				}

				callback(instanceData);
			}.bind(this);

			//JSTACK.Nova.getinstancelist(true, onOk, onError);
		},

		deleteInstance: function deleteInstance (callback, onError) {
			//JSTACK.Nova.deleteinstance(this.instanceId, callback, onError);
		}
	};


	return InstanceDetails;

})(JSTACK);
