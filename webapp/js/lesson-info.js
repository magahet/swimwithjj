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
		this.$http.get('config.json')
			.then(function (response) {
				vm.lessonInfoActive = response.data.lessonInfoActive
			})
		this.$http.get('sessions.json')
			.then(function (response) {
				vm.sessionList = response.data.sessionList
			})
		this.$http.get('session-cal.cgi')
			.then(function (response) {
				vm.calendar = response.data
			})
	}
})

