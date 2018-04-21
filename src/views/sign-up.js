Vue.config.devtools = true

var waitlist = new Vue({
	el: '#waitlist',

	data: {
        email: '',
		signupsActive: null,
		lessonInfoActive: null,
		sessionsFull: null,
        submitted: false,
    },

    methods: {
        updateConfig: function(config) {
            this.signupsActive = config.signupsActive
            this.lessonInfoActive = config.lessonInfoActive
            this.sessionsFull = config.sessionsFull
        },
		submitWaitlist: function() {
            this.submitted = true
            console.log('submitting waitlist form')
            var waitlistForm = {
                email: vm.email
            }
            axios.post('/api/waitlist', waitlistForm)
		}
    }
})

var signup = new Vue({
	el: '#signup',

	data: {
		lessonInfoActive: null,
		signupsActive: null,
		sessionsFull: null,
		children: _.map(_.range(4), function() {
            return {
                name: null,
                birthday: null,
                level: null,
                sessions: []
            }
        }),
        parent: {
            name: null,
            email: null,
            phone: null,
            request: null,
        },
		maxChildren: 4,
		childCount: 1,
		selectedSession: new Array(4).fill(null),
		sessionList: [],
		customerId: null,
		error: null,
        stripePublishableKey: null,
        stripe: null,
        card: null,
		status: null,
	},

	computed: {
        submitProcessing: function() {
            return this.status == 'processing'
        },
        submitFailed: function() {
            return this.status == 'fail' || this.status == 'error'
        },
        submitSucceeded: function() {
            return this.status == 'success'
        },
		sessionTotal: function() {
			var count = 0
			_.each(this.children.slice(0, this.childCount), function(child){
				count += child.sessions.length
			})
			return count
		},
		paymentTotal: function() {
            var vm = this
			var sum = 0
			_.each(this.children.slice(0, this.childCount), function(child) {
			    _.each(child.sessions, function(sessionNum) {
                    var session = vm.getSession(sessionNum)
                    sum += session.price
                })
			})
			return Math.floor(sum * 100)
		}
	},

    filters: {
		childLabel: function(childNum) {
			var label = "child's information"
			var prefix = {
				1: 'first ',
				2: 'second ',
				3: 'third ',
				4: 'fourth ',
				5: 'fifth ',
				6: 'sixth '
			}

			if (this.childCount == 1) {
				return label
			} else {
				return prefix[childNum] + label
			}
        },
		formatSession: function(session) {
			return 'Session ' + session.num + ' - ' + session.dates
		},
        currency: function(price) {
            return '$' + price
        }
    },

	methods: {
        updateConfig: function(config) {
            this.signupsActive = config.signupsActive
            this.lessonInfoActive = config.lessonInfoActive
            this.stripePublishableKey = config.stripePublishableKey
            // #card-element is created in the DOM when signupsActive switches to true
            // This section only activates Stripe Elements if and after the element is rendered
            if (this.signupsActive) {
                this.$nextTick(this.setupStripe)
            }
        },
        updateSessions: function(sessions) {
            this.sessionList = sessions.sessionList
            this.sessionsFull = sessions.sessionsFull
        },
        setupStripe: function() {
            if (!document.getElementById("card-element")) {
                return
            }
            this.stripe = Stripe(this.stripePublishableKey)
            var elements = this.stripe.elements()
            this.card = elements.create('card')
            this.card.mount('#card-element')
            this.card.addEventListener('change', function(event) {
              var displayError = document.getElementById('card-errors');
              if (event.error) {
                displayError.textContent = event.error.message;
              } else {
                displayError.textContent = '';
              }
            })
        },
        getSession: function(sessionNum) {
            return _.find(this.sessionList, function(s) { return s.num == sessionNum })
        },
		range: function(num) {
			return _.range(num)
		},
        changeChildCount: function(num) {
            this.childCount = num
        },
        childsAvailableSessions: function(childIndex) {
			var openSessions = _.pluck(_.filter(this.sessionList, function(s){ return s.open}), 'num')
			return _.difference(openSessions, this.children[childIndex].sessions)
		},
        hasAvailableSessions: function(childNum) {
            var openSessions = this.childsAvailableSessions(childNum)
            return openSessions.length > 0
		},
		add: function(childIndex) {
            var sessionNum = this.selectedSession[childIndex]
            if (sessionNum != null) {
			    this.children[childIndex].sessions.push(sessionNum)
            }
			this.selectedSession[childIndex] = null
		},
		remove: function(childIndex, index) {
			this.children[childIndex].sessions.splice(index, 1)
		},
		submitSignup: function() {
            console.log('submitting signup form')
			var vm = this
            vm.status = 'processing'
			vm.stripe.createToken(vm.card).then(function(result) {
                if (result.error) {
					vm.error= result.error.message
                    vm.status = 'error'
                } else {
                    var signupForm = {
                        id: 'signup',
                        name: vm.parent.name,
                        phone: vm.parent.name,
                        request: vm.parent.request,
                        token: result.token.id,
                        cost: vm.paymentTotal,
                        children: vm.children.slice(0, vm.childCount),
                    }
                    axios.post('/api/signup', signupForm)
                        .then(function(response) {
                            vm.status = response && response.data && response.data.status || 'error'
                            if (!vm.status) {
                                vm.error = 'Request to server failed'
                            } else if (vm.status == 'error') {
                                vm.error = response.data.message || 'Received unknown error from server'
                            } else if (vm.status == 'success') {
                                vm.clearSignupForm()
                            }
                        })
                        .catch(function(error) {
                            vm.error = error
                            vm.status = 'fail'
                    })
                }
			})
		},
        clearSignupForm: function() {
		    this.children = _.map(_.range(4), function() {
                return {
                    name: null,
                    birthday: null,
                    level: null,
                    sessions: [],
                }
            })
            this.parent = {
                name: null,
                email: null,
                phone: null,
                request: null,
            }
            this.childCount = 1
            this.card.clear()
        }
	}
})

function getParameterByName(name) {
    name = name.replace(/[\[\]]/g, "\\$&")
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(window.location.href)
    if (!results) return ''
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, " "))
}

axios.get('/api/config')
    .then(function (response) {
        var status = response && response.data && response.data.status || 'error'
        if (status == 'success') {
            var settings = response.data.data

            var priority = getParameterByName('prioritykey') == response.data.priorityKey
            var debug = getParameterByName('debug') == 'true'

            var config = {
                stripePublishableKey: settings.stripePublishableKey,
                lessonInfoActive: settings.lessonInfoActive,
                signupsActive: priority || debug || settings.signupsActive,
                sessionList: settings.sessionList,
                sessionsFull: !_.some(settings.sessionList, function(s) { return s.open }),
            }

            waitlist.updateConfig(config)
            signup.updateConfig(config)
        }

    })
