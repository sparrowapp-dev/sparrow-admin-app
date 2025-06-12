import { io, Socket } from 'socket.io-client';

interface StripeHandlers {
  onConnect?: (id: any) => void;
  onConnectError?: (error: Error) => void;
  onDisconnect?: (reason: string) => void;
  onPaymentSuccess?: (data: any) => void;
  onPaymentFailed?: (data: any) => void;
  onSubscriptionUpdated?: (data: any) => void;
  onSubscriptionCreated?: (data: any) => void;
  onSubscriptionCanceled?: (data: any) => void;
}

/**
 * Initialize a Socket.IO connection for Stripe events
 * @param apiBaseUrl Base API URL
 * @param handlers Object containing event handlers
 * @returns Socket instance
 */
export function initializeStripeSocket(apiBaseUrl: string, handlers: StripeHandlers = {}): Socket {
  const socket = io(`${apiBaseUrl}`, {
    path: '/socket.io',
    transports: ['polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Connected to stripe-events socket:', socket.id);
    if (handlers.onConnect) handlers.onConnect(socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    if (handlers.onConnectError) handlers.onConnectError(error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from stripe-events socket:', reason);
    if (handlers.onDisconnect) handlers.onDisconnect(reason);
  });

  // Payment events
  if (handlers.onPaymentSuccess) {
    socket.on('payment_success', handlers.onPaymentSuccess);
  }

  if (handlers.onPaymentFailed) {
    socket.on('payment_failed', handlers.onPaymentFailed);
  }

  // Subscription events
  if (handlers.onSubscriptionUpdated) {
    socket.on('subscription_updated', handlers.onSubscriptionUpdated);
  }

  if (handlers.onSubscriptionCreated) {
    socket.on('subscription_created', handlers.onSubscriptionCreated);
  }

  if (handlers.onSubscriptionCanceled) {
    socket.on('subscription_canceled', handlers.onSubscriptionCanceled);
  }

  return socket;
}
