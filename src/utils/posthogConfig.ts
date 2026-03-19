import posthog from 'posthog-js'
import { POSTHOG_API_KEY } from '@/constants/environment'

let isInitialized = false

export const initPostHog = () => {
  if (!isInitialized) {
    posthog.init(POSTHOG_API_KEY, {
      api_host: 'https://us.i.posthog.com',

      person_profiles: 'always',

      capture_exceptions: true,
    })

    isInitialized = true

    return true
  }

  return false
}

export const captureEvent = (
  eventName: string,

  properties?: Record<string, any>,
) => {
  posthog.capture(eventName, properties)
}

export const captureException = (
  error: Error | unknown,
  properties?: Record<string, any>,
): void => {
  if (!isInitialized) {
    initPostHog();
  }
  posthog.captureException(error, properties);
};

export const identifyUser = (email: string): void => {
  if (!posthog) {
    console.error('PostHog is not initialized');
    return;
  }
  posthog.identify(email);
};

export const posthogClient = posthog