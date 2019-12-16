/*global Vue, todoStorage */

(function (exports) {

	'use strict';

	var filters = {
		all: function (todos) {
			return todos;
		},
		active: function (todos) {
			return todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		completed: function (todos) {
			return todos.filter(function (todo) {
				return todo.completed;
			});
		}
	};

	exports.app = new Vue({

		// the root element that will be compiled
		el: '.todoapp',

		// app initial state
		data: {
			todos: [],
			newTodo: '',
			editedTodo: null,
			visibility: 'all',
			url: '',
			address: '',
			tx: null
			
		},
		mounted: function(){
			var code = this.getQueryVariable('code')
			var pay_txid = this.getQueryVariable('pay_txid')
			var status = this.getQueryVariable('status')
			var param_address = this.getQueryVariable('address')

			
			if (pay_txid && pay_txid != '' && status == 1) {
				console.log("1")
				if(param_address) {
					this.address = param_address
				}
				this.tx = pay_txid
				api.getTodosFromBSV(this.tx,this)
			} else if (code) {
				console.log("2")
				api.getAddressByCode(code, this)

			} else if (!code) {
				console.log("3")
				window.location.href='https://www.ddpurse.com/openapi/get_code?app_id=92d251abf8281c178619&redirect_uri=http://8sv.top/todos/index.html'
			}else{
				console.log("4")
				api.getTodosFromDB(this.address, this)
			}

			
		},
		// watch todos change for localStorage persistence
		watch: {
			todos: {
				deep: true,
				handler: todoStorage.save
			},
			address: function (val, oldVal){
				console.log("oldVal="+oldVal)
				console.log("val="+val)
			}
		},


		computed: {
			whatsonchain: function () {
				return 'https://whatsonchain.com/tx/' + this.tx
			},
			filteredTodos: function () {
				return filters[this.visibility](this.todos);
			},
			remaining: function () {
				return filters.active(this.todos).length;
			},
			allDone: {
				get: function () {
					return this.remaining === 0;
				},
				set: function (value) {
					this.todos.forEach(function (todo) {
						todo.completed = value;
					});
				}
			}
		},

		methods: {

			pluralize: function (word, count) {
				return word + (count === 1 ? '' : 's');
			},
			getQueryVariable: function(variable) {
				var query = window.location.search.substring(1);
				console.log("query="+query)
				var vars = query.split("&");
				for (var i=0;i<vars.length;i++) {
						var pair = vars[i].split("=");
						
						if(pair[0] == variable){return pair[1];}
				}
				return(false);
			},
			addTodo: function () {
				
				var value = this.newTodo && this.newTodo.trim();
				if (!value) {
					return;
				}
				var ids = [];
				this.todos.forEach(function(todo){
					ids.push(todo["id"])
				})
				var max = ids && ids.length == 0 ? 0 : Math.max.apply(null, ids)
				this.todos.push({ id: max + 1, title: value, completed: false });
				this.newTodo = '';
			},

			removeTodo: function (todo) {
				var index = this.todos.indexOf(todo);
				this.todos.splice(index, 1);
			},

			editTodo: function (todo) {
				this.beforeEditCache = todo.title;
				this.editedTodo = todo;
			},

			doneEdit: function (todo) {
				if (!this.editedTodo) {
					return;
				}
				this.editedTodo = null;
				todo.title = todo.title.trim();
				if (!todo.title) {
					this.removeTodo(todo);
				}
			},

			cancelEdit: function (todo) {
				this.editedTodo = null;
				todo.title = this.beforeEditCache;
			},

			removeCompleted: function () {
				this.todos = filters.active(this.todos);
			},

			applyOrder: function () {

				var appId = '92D251ABF8281C178619'
				var amount = 1000
				var nonceStr = 'NONCE_STR'
				var orderSn = Math.floor(Math.random()*(9999999-1000000))+1000000
				var noticeUri = 'LOCALHOST'
				var redirectUri = 'http://8sv.top/todos/index.html?address='+this.address
				var itemName = 'ITEM_NAME'
				var secret='928da1cb62437ce7b5ce41220109364b';
				var message ='APP_ID=' +appId+ '&MERCHANT_ORDER_SN=' +orderSn+ '&ORDER_AMOUNT=' +amount+ '&NONCE_STR=' +nonceStr+ '&NOTICE_URI=' +noticeUri+ '&REDIRECT_URI=' +redirectUri.toUpperCase()+ '&ITEM_NAME=' +itemName+ '&SECRET='+secret.toUpperCase()
				var hmac = CryptoJS.HmacSHA256(message, secret);


				console.log("hmac=" + hmac);
				// window.location.href='https://www.ddpurse.com/openapi/apply_order?app_id=' +appId+ '&merchant_order_sn=' +orderSn+ '&order_amount=' +amount+ '&nonce_str=' +nonceStr+ '&notice_uri=' +noticeUri+ '&redirect_uri=' +redirectUri+ '&item_name=' +itemName+ '&sign='+hmac+'&opreturn=' + JSON.stringify(this.todos);

			var	PARAMS = {'app_id':appId
						, 'merchant_order_sn':orderSn
						, 'order_amount':amount
						, 'nonce_str':nonceStr
						, 'notice_uri':noticeUri
						, 'redirect_uri':redirectUri
						, 'item_name':itemName
						, 'sign':hmac
						, 'opreturn':JSON.stringify(this.todos)
						};
						
				this.applyOrderToDdpurse('https://www.ddpurse.com/openapi/apply_order',PARAMS);
			},
			applyOrderToDdpurse: function(URL,PARAMS){
				var temp = document.createElement("form");
				temp.action = URL;
				temp.method = "post";
				temp.style.display = "none";
				for (var x in PARAMS) {
					var opt = document.createElement("textarea");
					opt.name = x;
					opt.value = PARAMS[x];
					temp.appendChild(opt);
				}
				document.body.appendChild(temp);
				temp.submit();
				return temp;

			}


		},

		// a custom directive to wait for the DOM to be updated
		// before focusing on the input field.
		// http://vuejs.org/guide/custom-directive.html
		directives: {
			'todo-focus': function (el, binding) {
				if (binding.value) {
					el.focus();
				}
			}
		}
	});

})(window);
