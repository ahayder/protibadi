angular.module('starter.factories', [])


.factory('NumberFactory', [function () {
	

	return {
		saveNumber: function(info){
			if(window.localStorage['numbers']){
				var storage = [];
				storage = JSON.parse(window.localStorage['numbers']);
				storage.push(info);
				window.localStorage['numbers'] = JSON.stringify(storage);
				return true;
			}
			else{
				var storage = [];
				storage.push(info);
				window.localStorage['numbers'] = JSON.stringify(storage);
				return true;
			}
		},
		getNumbers: function(){
			return JSON.parse(window.localStorage['numbers'] || false);
		},
		saveMessage: function(msg){
			msg = String(msg);
			window.localStorage['message'] = msg;
			return true;
		},
		getMessage: function(){
			return window.localStorage['message'] || false;
		}
	};
}])