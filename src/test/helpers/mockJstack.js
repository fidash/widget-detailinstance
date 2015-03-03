var JSTACK = {};
JSTACK.Keystone = jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants", "params"]);
JSTACK.Nova = jasmine.createSpyObj("Nova", ["getserverdetail", "deleteserver", "rebootserversoft"]);