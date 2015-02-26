var JSTACK = {};
JSTACK.Keystone = jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants", "params"]);
JSTACK.Nova = jasmine.createSpyObj("Nova", ["deleteimage", "getimagelist"]);
//JSTACK.Glance = jasmine.createSpyObj("Glance", ["getimagedetail"]);