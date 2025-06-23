import { billingService } from '@/services/billing.service';

/**
 * Stripe Utilities
 * Centralizes Stripe-related functionality for easier maintenance and reuse.
 */

// Type definitions for TypeScript support
declare global {
  interface Window {
    Stripe: any;
  }
}

// Stripe Element Types
interface StripeElementsOptions {
  fonts?: Array<{
    cssSrc: string;
  }>;
  appearance?: {
    theme: string;
    variables: {
      colorPrimary: string;
      colorBackground: string;
      colorText: string;
      colorDanger: string;
    };
  };
}

interface CardElementOptions {
  style: {
    base: {
      color: string;
      fontFamily: string;
      fontSmoothing: string;
      fontSize: string;
      '::placeholder': {
        color: string;
        fontWeight: string;
        fontSize: string;
      };
      backgroundColor: string;
      iconColor: string;
    };
    invalid: {
      color: string;
      iconColor: string;
    };
  };
  placeholder?: string;
  showIcon?: boolean;
}

// Type for Stripe elements
export type StripeElement = {
  mount: (selector: string) => void;
  on: (event: string, callback: (event: any) => void) => void;
  destroy: () => void;
};

/**
 * Initialize Stripe with the publishable key
 * @returns Initialized Stripe instance
 */
export async function initializeStripe() {
  try {
    // Load Stripe.js if not already loaded
    if (!window.Stripe) {
      await loadStripeScript();
    }

    // Fetch the publishable key from our backend
    const { publishableKey } = await billingService.getStripeConfig();

    // Initialize Stripe
    return window.Stripe(publishableKey);
  } catch (err) {
    console.error('Error initializing Stripe:', err);
    throw err;
  }
}

/**
 * Load the Stripe.js script
 * @returns Promise that resolves when the script is loaded
 */
function loadStripeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Stripe.js'));
    document.body.appendChild(script);
  });
}

/**
 * Create Stripe card elements with consistent styling
 * @param stripe Stripe instance
 * @returns Object containing elements instance and card elements
 */
export function createCardElements(stripe: any) {
  if (!stripe) {
    throw new Error('Stripe must be initialized before creating elements');
  }

  // Common styling for all elements
  const baseStyle = {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#82858A',
        fontWeight: '200',
        fontSize: '14px',
      },
      backgroundColor: '#222630',
      iconColor: '#ffffff',
    },
    invalid: {
      color: '#F37472',
      iconColor: '#F37472',
    },
  };

  // Create Elements instance
  const elements = stripe.elements({
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      },
    ],
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#4361ee',
        colorBackground: '#222630',
        colorText: '#ffffff',
        colorDanger: '#F37472',
      },
    },
  } as StripeElementsOptions);

  // Create individual elements
  const cardNumber = elements.create('cardNumber', {
    style: baseStyle,
    placeholder: 'Enter Card Number',
    showIcon: true,
  } as CardElementOptions);

  const cardExpiry = elements.create('cardExpiry', {
    style: baseStyle,
    placeholder: 'MM / YY',
  } as CardElementOptions);

  const cardCvc = elements.create('cardCvc', {
    style: baseStyle,
    placeholder: 'Enter CVV',
  } as CardElementOptions);

  return {
    elements,
    cardElements: {
      cardNumber,
      cardExpiry,
      cardCvc,
    },
  };
}

/**
 * Handle a payment that might require additional action (like 3D Secure)
 * @param stripe Stripe instance
 * @param clientSecret The client secret from the payment intent
 * @returns Result of the payment confirmation
 */
export async function handleStripePaymentConfirmation(stripe: any, clientSecret: string) {
  if (!stripe || !clientSecret) {
    throw new Error('Stripe instance and client secret are required');
  }

  try {
    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret);

    if (error) {
      throw new Error(error.message || 'Payment authentication failed');
    }

    return { paymentIntent };
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
}
