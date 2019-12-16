/*jshint unused:false */

(function (exports) {

	'use strict';

	var STORAGE_KEY = 'todos-vuejs';

	var address = ''

	exports.todoStorage = {
		setAddress: function (_address) {
			console.log("todoStorage::setAddress="+_address);
			this.address = _address
		},
		fetch: function () {
			return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
		},
		save: function (todos) {
			console.log("todoStorage::save="+this.address);
			api.saveToDB(todos, this.address)
			localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
		}
	};

})(window);
