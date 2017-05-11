Vue.config.devtools = true

var contact = new Vue({
	el: '#contact',

	data: {
        name: null,
		email: null,
		phone: null,
		message: null,
        submitted: false,
    },

    methods: {
		submitContactForm: function() {
            this.submitted = true
            console.log('submitting contact form')
            var contactForm = {
                id: 'contact',
                name: this.name,
                email: this.email,
                phone: this.phone,
                message: this.message,
            }
            axios.post('form-handler.cgi', contactForm)
		}
    }
})
