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

let globalSocket: Socket | null = null;

/**
 * Initialize a Socket.IO connection for Stripe events
 * @param apiBaseUrl Base API URL
 * @param handlers Object containing event handlers
 * @returns Socket instance
 */
export function initializeStripeSocket(apiBaseUrl: string, handlers: StripeHandlers = {}): Socket {
  // If socket already exists and is connected, clean up previous event listeners and reuse the connection
  if (globalSocket && globalSocket.connected) {
    // Remove any existing listeners to prevent duplicates
    if (handlers.onPaymentSuccess) {
      globalSocket.off('payment_success');
      globalSocket.on('payment_success', handlers.onPaymentSuccess);
    }

    if (handlers.onPaymentFailed) {
      globalSocket.off('payment_failed');
      globalSocket.on('payment_failed', handlers.onPaymentFailed);
    }

    if (handlers.onSubscriptionUpdated) {
      globalSocket.off('subscription_updated');
      globalSocket.on('subscription_updated', handlers.onSubscriptionUpdated);
    }

    if (handlers.onSubscriptionCreated) {
      globalSocket.off('subscription_created');
      globalSocket.on('subscription_created', handlers.onSubscriptionCreated);
    }

    if (handlers.onSubscriptionCanceled) {
      globalSocket.off('subscription_canceled');
      globalSocket.on('subscription_canceled', handlers.onSubscriptionCanceled);
    }

    // Return the existing socket with updated handlers
    console.log('Reusing existing socket connection:', globalSocket.id);
    return globalSocket;
  }

  // Create a new socket if one doesn't exist or isn't connected
  if (globalSocket && !globalSocket.connected) {
    console.log('Previous socket exists but disconnected, creating new connection');
    // Clean up the disconnected socket
    globalSocket.disconnect();
    globalSocket = null;
  }

  // Create a new socket only if one doesn't exist yet
  const socket = io(`${apiBaseUrl}`, {
    path: '/socket.io',
    transports: ['polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  globalSocket = socket;

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

/**
 * Disconnect the global Socket.IO connection
 * Should be called when the app is shutting down or user logs out
 */
export function disconnectStripeSocket(): void {
  if (globalSocket) {
    console.log('Disconnecting global socket connection:', globalSocket.id);
    globalSocket.disconnect();
    globalSocket = null;
  }
}
