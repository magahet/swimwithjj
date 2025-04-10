/**
 * Stripe Client Integration
 * Uses modern Stripe Payment Method API instead of legacy Tokens API
 */

// Initialize Stripe with publishable key
let stripeInstance = null;

// Initialize Stripe with the publishable key
export const initStripe = (publishableKey) => {
    if (!publishableKey) {
        throw new Error('Stripe publishable key is required');
    }

    if (typeof window === 'undefined') {
        return null; // Server-side rendering check
    }

    if (!window.Stripe) {
        throw new Error('Stripe.js is not loaded. Make sure to include the Stripe script tag.');
    }

    stripeInstance = window.Stripe(publishableKey);
    return stripeInstance;
};

// Get the Stripe instance, initialize if needed with the provided key
export const getStripe = (publishableKey) => {
    if (!stripeInstance && publishableKey) {
        return initStripe(publishableKey);
    }
    return stripeInstance;
};

// Create Stripe Elements instances
export const createElements = (options = {}) => {
    if (!stripeInstance) {
        throw new Error('Stripe has not been initialized. Call initStripe first.');
    }

    // Create the Elements instance
    const elements = stripeInstance.elements(options);

    // Create individual element instances
    const cardNumberElement = elements.create('cardNumber', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    });

    const cardExpiryElement = elements.create('cardExpiry', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    });

    const cardCvcElement = elements.create('cardCvc', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    });

    return {
        elements,
        cardNumberElement,
        cardExpiryElement,
        cardCvcElement,
    };
};

// Create a payment method and return the ID
export const createPaymentMethod = async (elements, billingDetails) => {
    if (!stripeInstance) {
        throw new Error('Stripe has not been initialized. Call initStripe first.');
    }

    // Create the payment method using the card element and billing details
    const result = await stripeInstance.createPaymentMethod({
        type: 'card',
        card: elements.getElement('cardNumber'),
        billing_details: billingDetails,
    });

    if (result.error) {
        throw result.error;
    }

    return result.paymentMethod;
}; 