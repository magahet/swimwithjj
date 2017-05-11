Vue.prototype.$http = axios
Vue.config.devtools = true

new Vue({
	el: '#app',

    config: {
        devtools: true
    },

	data: {
		lessonInfoActive: false,
		sessionList: [],
		calendar: ''
	},

	beforeCreate: function() {
		var vm = this
		this.$http.get('config.cgi')
			.then(function (response) {
                var status = response.data && response.data.status || 'error'
                if (status == 'success') {
                    var config = response.data.data
                    vm.lessonInfoActive = config.lessonInfoActive
                    vm.sessionList = config.sessionList
                }
			})
		this.$http.get('session-cal.cgi')
			.then(function (response) {
				vm.calendar = response.data
			})
	}
})

