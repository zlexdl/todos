(function (exports) {

	'use strict';

	exports.api = {
		getAddressByCode: function (code, obj) {

            var _this = obj
			axios.get('http://47.105.92.180:8088/v1/todo/address/' + code,{
				params: {
				}
			  })
			.then(function (response) {
				if(response.data) {
					console.log('getAddressByCode::response.data='+response.data);

					_this.address = response.data || ''
					console.log('getAddressByCode::_this.address='+_this.address);
					todoStorage.setAddress(response.data)
					api.getTodosFromDB(response.data, _this)
				} else {
					window.location.href='https://www.ddpurse.com/openapi/get_code?app_id=92d251abf8281c178619&redirect_uri=http://8sv.top/todos/index.html'
				}
			})
			.catch(function (error) {
				// handle error
				console.log('getAddressByCode::error='+error);
				_this.todos = todoStorage.fetch
			})
			.then(function () {
				// always executed
			});
		},
		getTodosFromBSV: function (tx, obj) {

            var _this = obj
			axios.get('https://api.whatsonchain.com/plugin/0/main/' + tx,{
				params: {
				}
			  })
			.then(function (response) {

				var str = response.data
				str = str.replace(/<\/?[^>]*>/g,'')
				str = str.replace(/[ | ]*\n/g,'\n')

				_this.todos = JSON.parse(str) || []

			})
			.catch(function (error) {
				console.log('getTodosFromBSV::error='+error);
				api.getTodosFromDB(_this.address ,_this)
				// handle error
				console.log(error);
			})
			.then(function () {
				// always executed
			});
		},
		getTodosFromDB: function (address, obj) {
			console.log('getTodosFromDB::address='+address);
            var _this = obj
			axios.get('http://47.105.92.180:8088/v1/todo',{
				params: {
				  address: address
				}
			  })
			.then(function (response) {
				console.log('getTodosFromDB::data='+response.data.todos);
				_this.todos = response.data && response.data.todos || [];

			})
			.catch(function (error) {
				console.log('getTodosFromDB::error='+error);
				var data = todoStorage.fetch();
				_this.todos = data || [];
				
			})
			.then(function () {
				// always executed
			});
		},
		saveToDB: function (todos, address) {
			var _todo = todos
			var _address = address
			if(address){
				axios.post('http://47.105.92.180:8088/v1/todo', {
					"id": _address,
					"todos": _todo
				  })
				  .then(function (response) {
					console.log(response);
				  })
				  .catch(function (error) {
					console.log(error);
				  });
			}

		}
	};

})(window);
