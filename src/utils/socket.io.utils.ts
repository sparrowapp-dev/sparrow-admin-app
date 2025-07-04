import { io, Socket } from 'socket.io-client';
import { APP_ENVIRONMENT } from '@/constants/environment';

interface StripeHandlers {
  onConnect?: (id: any) => void;
  onConnectError?: (error: Error) => void;
  onDisconnect?: (reason: string) => void;
  onPaymentSuccess?: (data: any) => void;
  onPaymentFailed?: (data: any) => void;
  onScheduleCreated?: (data: any) => void;
  onSubscriptionUpdated?: (data: any) => void;
  onSubscriptionCreated?: (data: any) => void;
  onSubscriptionCanceled?: (data: any) => void;
  onHubJoined?: (data: { hubId: string }) => void;
  onJoinHubError?: (data: { message: string }) => void;
}

let globalSocket: Socket | null = null;
const isProduction = APP_ENVIRONMENT === 'production';

/**
 * Initialize a Socket.IO connection for Stripe events with hub-based rooms
 * @param apiBaseUrl Base API URL
 * @param hubId Hub ID to join specific room
 * @param handlers Object containing event handlers
 * @returns Socket instance
 */
export function initializeStripeSocket(
  apiBaseUrl: string,
  hubId: string,
  handlers: StripeHandlers = {},
): Socket {
  console.log('env:', APP_ENVIRONMENT);

  // If socket already exists and is connected, update handlers and join new hub room
  if (globalSocket && globalSocket.connected) {
    // Join the new hub room if hubId is provided
    if (hubId) {
      globalSocket.emit('join-hub', { hubId });
    }

    // Remove any existing listeners to prevent duplicates
    if (handlers.onPaymentSuccess) {
      globalSocket.off('payment_success');
      globalSocket.on('payment_success', handlers.onPaymentSuccess);
    }

    if (handlers.onPaymentFailed) {
      globalSocket.off('payment_failed');
      globalSocket.on('payment_failed', handlers.onPaymentFailed);
    }

    if (handlers.onScheduleCreated) {
      globalSocket.off('subscription_schedule_updated');
      globalSocket.on('subscription_schedule_updated', handlers.onScheduleCreated);
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

    if (handlers.onHubJoined) {
      globalSocket.off('hub-joined');
      globalSocket.on('hub-joined', handlers.onHubJoined);
    }

    if (handlers.onJoinHubError) {
      globalSocket.off('join-hub-error');
      globalSocket.on('join-hub-error', handlers.onJoinHubError);
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

  const cleanedBaseUrl = apiBaseUrl?.replace(/\/v2\/?$/, '');

  // Create a new socket only if one doesn't exist yet
  const socket = io(cleanedBaseUrl, {
    path: isProduction ? '/v2/socket.io' : '/socket.io',
    transports: ['polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  globalSocket = socket;

  // Connection events
  socket.on('connect', () => {
    console.log('Connected to stripe-events socket:', socket.id);

    // Join hub-specific room immediately after connection
    if (hubId) {
      socket.emit('join-hub', { hubId });
    }

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

  // Hub room events
  if (handlers.onHubJoined) {
    socket.on('hub-joined', handlers.onHubJoined);
  }

  if (handlers.onJoinHubError) {
    socket.on('join-hub-error', handlers.onJoinHubError);
  }

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
  if (handlers.onScheduleCreated) {
    socket.on('subscription_schedule_updated', handlers.onScheduleCreated);
  }

  return socket;
}

/**
 * Join a specific hub room
 * @param hubId Hub ID to join
 */
export function joinHubRoom(hubId: string): void {
  if (globalSocket && globalSocket.connected) {
    globalSocket.emit('join-hub', { hubId });
  } else {
    console.warn('Socket not connected. Cannot join hub room.');
  }
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
