Vue.config.devtools = true

var config = {
    signupsActive: null,
    lessonInfoActive: null,
}

var sessions = {
    sessionList: [],
    sessionsFull: null,
}

var stripe = {
    stripePublishableKey: null
}

axios.get('config.json')
    .then(function (response) {
        config.lessonInfoActive = response.data.lessonInfoActive
        var priority = getParameterByName('prioritykey') == response.data.priorityKey
        var debug = getParameterByName('debug')
        config.signupsActive = priority || debug || response.data.signupsActive

        waitlist.updateConfig(config)
        signup.updateConfig(config)
    })

axios.get('sessions.json')
    .then(function (response) {
        sessions.sessionList = response.data.sessionList
        sessions.sessionsFull = !_.some(sessions.sessionList, function(s) { return s.open })

        waitlist.updateSessions(sessions)
        signup.updateSessions(sessions)
    })


axios.get('stripe.json')
    .then(function (response) {
        stripe.stripePublishableKey = response.data.stripePublishableKey

        setupStripe(stripe.stripePublishableKey)
        signup.updateStripe(stripe)
    })

function setupStripe(publishableKey) {
    var stripe = Stripe(publishableKey)
    var elements = stripe.elements()
    var card = elements.create('card')
    card.mount('#card-element')

	card.addEventListener('change', function(event) {
	  var displayError = document.getElementById('card-errors');
	  if (event.error) {
		displayError.textContent = event.error.message;
	  } else {
		displayError.textContent = '';
	  }
	});

}

var waitlist = new Vue({
	el: '#waitlist',

	data: {
        email: '',
        loading: false,
		signupsActive: null,
		lessonInfoActive: null,
		sessionsFull: null
    },

    methods: {
        updateConfig: function(config) {
            this.signupsActive = config.signupsActive
            this.lessonInfoActive = config.lessonInfoActive
        },
        updateSessions: function(sessions) {
            this.sessionsFull = sessions.sessionsFull
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

var signup = new Vue({
	el: '#signup',

	data: {
		lessonInfoActive: null,
		signupsActive: null,
		sessionsFull: null,
		sessions: [],
		maxChildren: 4,
		childCount: 1,
		selectedSession: new Array(4).fill(null),
		sessionList: [],
		customerId: null,
		cardButtonMessage: 'Enter Payment Information',
		paymentError: null
	},

    created: function() {
		this.clearSessions()
    },

	computed: {
		sessionTotal: function() {
			var count = 0
			_.each(this.sessions.slice(0, this.childCount), function(value, key){
				count += value.length
			})
			return count
		},
		paymentTotal: function() {
			var sum = 0
			_.each(this.sessions.slice(0, this.childCount), function(sessions) {
				sum += _.reduce(_.pluck(sessions, 'price'), function(m, n) {return m + n}, 0)
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
        },
        updateSessions: function(sessions) {
            this.sessionList = sessions.sessionList
            this.sessionsFull = sessions.sessionsFull
        },
        updateStripe: function(stripe) {
            this.stripePublishableKey = stripe.stripePublishableKey
        },
		range: function(num) {
			return _.range(num)
		},
		clearSessions: function() {
			var sessions = []
			_.each(this.range(this.maxChildren), function(i) {
				sessions.push([])
			})
			this.sessions = sessions
		},
        changeChildCount: function(num) {
            this.childCount = num
        },
        childsAvailableSessions: function(childNum) {
            var index = childNum - 1
			var openSessions = _.filter(this.sessionList, function(s){ return s.open})
			return _.difference(openSessions, this.sessions[index])
		},
        hasAvailableSessions: function(childNum) {
            var openSessions = this.childsAvailableSessions(childNum)
            return openSessions.length > 0
		},
		add: function(childNum) {
            var index = childNum - 1
            var sessionNum = this.selectedSession[index]
            if (sessionNum != null) {
                console.log(this.selectedSession[index])
                var session = _.find(this.sessionList, function(s) {return s.num == sessionNum})
			    this.sessions[index].push(session)
            }
			this.selectedSession[index] = null
		},
		remove: function(childNum, index) {
            var childIndex = childNum - 1
			this.sessions[childIndex].splice(index, 1)
		},
		payWithCard: function() {
			var vm = this
			StripeCheckout.open({
				key:         this.stripePublishableKey,
				billingAddress:     true,
				amount:      this.paymentTotal(),
				name:        'SwimWithJJ',
				description: this.sessionTotal() + ' sessions of swim lessons',
				panelLabel:  'Save Payment Information',
				token:       function(res) {
								this.$apply(function () {
									this.cardButtonMessage = 'saving payment information'
									var params = { 
										id: 'save-card',
										'stripe-token': res.id
									}
									$http.get('form-handler.cgi', {params: params}).
										success(function(data, status, headers, config) {
											if (data.response && data.response.customer_id) {
												this.cardButtonMessage = 'Payment Information Saved'
												this.customerId = data.response.customer_id
											} else if (data.response && data.response.error) {
												this.cardButtonMessage = 'Enter Payment Information'
												this.paymentError = data.response.error
											}
										}).
										error(function(data, status, headers, config) {
											this.cardButtonMessage = 'Enter Payment Information'
									})
								})
							 }
			})
		}
	}
})
