/**
 * Plan details and pricing utility functions for the billing system
 */

// Plan types
export type PlanType = 'community' | 'standard' | 'professional' | 'enterprise';
export type BillingCycleType = 'monthly' | 'annual';

// Feature structure
interface PlanFeature {
  price: string;
  unit: string;
  privateHubs: number | string;
  workspaces: number | string;
  collections: number | string;
  collaborators: number | string;
  buttonText: string;
  priceId?: string;
  discount?: string;
}

// Plan details structure
interface PlanDetails {
  [key: string]: {
    monthly: PlanFeature;
    annual: PlanFeature;
  };
}

/**
 * Default plan details with features and pricing
 */
export const DEFAULT_PLAN_DETAILS: PlanDetails = {
  community: {
    monthly: {
      price: '$0.00',
      unit: '/user/month',
      privateHubs: 1,
      workspaces: 3,
      collections: 'Unlimited',
      collaborators: 5,
      buttonText: 'Pricing Plans',
    },
    annual: {
      price: '$0.00',
      unit: '/user/year',
      privateHubs: 1,
      workspaces: 3,
      collections: 'Unlimited',
      collaborators: 5,
      buttonText: 'Pricing Plans',
    },
  },
  standard: {
    monthly: {
      price: '$9.99',
      unit: '/user/month',
      privateHubs: 1,
      workspaces: 5,
      collections: 'Unlimited',
      collaborators: 'Unlimited',
      buttonText: 'Upgrade',
      priceId: 'price_1RZaD7FLRwufXqZCEtDiMO02',
    },
    annual: {
      price: '$99',
      unit: '/user/year',
      privateHubs: 1,
      workspaces: 5,
      collections: 'Unlimited',
      collaborators: 'Unlimited',
      buttonText: 'Upgrade',
      discount: 'Save 17.4%',
      priceId: 'price_1RZaFiFLRwufXqZCNc7JterI',
    },
  },
  professional: {
    monthly: {
      price: '$19.99',
      unit: '/user/month',
      privateHubs: 1,
      workspaces: 10,
      collections: 'Unlimited',
      collaborators: 'Unlimited',
      buttonText: 'Upgrade',
      priceId: 'price_1RZaELFLRwufXqZCRDIWybT1',

    },
    annual: {
      price: '$199',
      unit: '/user/year',
      privateHubs: 1,
      workspaces: 10,
      collections: 'Unlimited',
      collaborators: 'Unlimited',
      buttonText: 'Upgrade',
      discount: 'Save 17%',
      priceId: 'price_1RZaGtFLRwufXqZCVUrpvs74',
    },
  },
  enterprise: {
    monthly: {
      price: '$49.99',
      unit: '/user/month',
      privateHubs: 'Unlimited',
      workspaces: 'Unlimited',
      collections: 'Unlimited',
      collaborators: 'Unlimited',
      buttonText: 'Contact Sales',
    },
    annual: {
      price: '$499',
      unit: '/user/year',
      privateHubs: 'Unlimited',
      workspaces: 'Unlimited',
      collections: 'Unlimited',
      collaborators: 'Unlimited',
      buttonText: 'Contact Sales',
      discount: 'Save 16.8%',
    },
  },
};

/**
 * List of available plans
 */
export const AVAILABLE_PLANS: PlanType[] = ['community', 'standard', 'professional', 'enterprise'];

/**
 * Format a price from cents to dollars with $ sign
 * @param cents Price in cents
 * @returns Formatted price string (e.g. $9.99)
 */
export function formatPriceFromCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format a date to a readable string
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string (e.g. January 1, 2023)
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Normalize billing cycle string
 * @param interval 'month' or 'year' (or variations)
 * @returns 'monthly' or 'annual'
 */
export function normalizeBillingCycle(interval: string): BillingCycleType {
  return interval === 'month' ? 'monthly' : 'annual';
}

/**
 * Capitalize the first letter of a string
 * @param str Input string
 * @returns String with first letter capitalized
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a unique plan identifier that combines plan type and billing cycle
 * @param plan Plan name (e.g., 'standard', 'professional')
 * @param billingCycle Billing cycle ('monthly' or 'annual')
 * @returns Combined plan identifier (e.g., 'standard-monthly')
 */
export function getPlanId(plan: string, billingCycle: BillingCycleType): string {
  return `${plan}-${billingCycle}`;
}

/**
 * Check if a plan can be selected based on current plan
 * @param currentPlan User's current plan (lowercase)
 * @param targetPlan Plan to check if selectable (lowercase)
 * @param targetBillingCycle Billing cycle of the target plan ('monthly' or 'annual')
 * @param currentBillingCycle Billing cycle of the current plan ('monthly' or 'annual')
 * @returns Boolean indicating if the plan can be selected
 */
export function isPlanSelectable(
  currentPlan: string,
  targetPlan: string,
  targetBillingCycle: BillingCycleType = 'monthly',
  currentBillingCycle: BillingCycleType = 'monthly',
): boolean {
  // Community plan is always disabled (not selectable)
  if (targetPlan === 'community') return false;

  // Enterprise plan is always available for contact
  if (targetPlan === 'enterprise') return true;

  // Create unique identifiers for current and target plans
  const currentPlanId = getPlanId(currentPlan, currentBillingCycle);
  const targetPlanId = getPlanId(targetPlan, targetBillingCycle);

  // Cannot select the current plan
  if (currentPlanId === targetPlanId) return false;

  // Special case rules based on current plan
  // Hierarchy: standard monthly (1) > professional monthly (2) > standard annually (3) > professional annually (4)
  switch (currentPlanId) {
    case 'community-monthly':
    case 'community-annual':
      // Community users can upgrade to any paid plan (except community which is already blocked above)
      return true;

    case 'standard-monthly':
      // Standard monthly can upgrade to: professional monthly, standard annual, professional annual
      return ['professional-monthly', 'standard-annual', 'professional-annual'].includes(
        targetPlanId,
      );

    case 'professional-monthly':
      // Professional monthly can upgrade to: standard annual, professional annual
      return ['standard-annual', 'professional-annual'].includes(targetPlanId);

    case 'standard-annual':
      // Standard annual can only upgrade to professional annual or downgrade to lower tiers
      return ['professional-annual'].includes(targetPlanId);

    case 'professional-annual':
      // Professional annual can only downgrade
      return ['standard-annual', 'professional-monthly', 'standard-monthly'].includes(targetPlanId);

    default:
      // Default fallback for any unhandled cases
      return true;
  }
}

/**
 * Check if a plan change is a downgrade
 * @param currentPlan Current plan name (lowercase)
 * @param targetPlan Target plan name (lowercase)
 * @returns Boolean indicating if this is a downgrade
 */
export function isDowngrade(
  currentPlan: string,
  targetPlan: string,
  currentBillingCycle: BillingCycleType = 'monthly',
  targetBillingCycle: BillingCycleType = 'monthly',
): boolean {
  // Define plan values using our hierarchy
  // Standard Monthly (1) < Professional Monthly (2) < Standard Annual (3) < Professional Annual (4)
  function getPlanValue(planName: string, cycle: string): number {
    if (planName === 'community') return 0;
    if (planName === 'standard' && cycle === 'monthly') return 1;
    if (planName === 'professional' && cycle === 'monthly') return 2;
    if (planName === 'standard' && cycle === 'annual') return 3;
    if (planName === 'professional' && cycle === 'annual') return 4;
    if (planName === 'enterprise') return 5;
    return 0;
  }

  const currentValue = getPlanValue(currentPlan, currentBillingCycle);
  const targetValue = getPlanValue(targetPlan, targetBillingCycle);

  return targetValue < currentValue;
}

/**
 * Process subscription data to extract plan details
 * @param subscriptionData Raw subscription data from API
 * @param databasePlanName Plan name from the database (overrides Stripe plan name)
 * @returns Processed subscription information
 */
export function processSubscriptionData(subscriptionData: any, databasePlanName?: string) {
  if (!subscriptionData) {
    return {
      subscriptionId: null,
      currentPlan: databasePlanName || 'Community',
      currentPrice: '$0.00',
      currentBillingCycle: 'monthly',
      nextBillingDate: '',
      lastInvoiceAmount: '$0.00',
      totalPaidAmount: '$0.00',
      userCount: 1,
      subscriptionStatus: '',
      scheduledDowngrade: { hasScheduledDowngrade: false },
      currentPriceId: '',
    };
  }

  // Extract subscription details
  const subscriptionId = subscriptionData.id;
  const metadata = subscriptionData.metadata || {};
  const subscriptionStatus = subscriptionData.status || '';

  // Get plan name and user count from metadata or use database plan name
  let currentPlan = databasePlanName || metadata.planName || 'Community';
  const userCount = parseInt(metadata.userCount || '1', 10);

  // Default price values
  let currentPrice = '$0.00';
  let currentBillingCycle = 'monthly';
  let currentPriceId = '';
  let nextBillingDate = '';
  let lastInvoiceAmount = '$0.00';
  let totalPaidAmount = '$0.00';

  // Extract price details from subscription items
  if (subscriptionData.items?.data?.length > 0) {
    const priceDetails = subscriptionData.items.data[0].price;
    if (priceDetails) {
      // Store the current price ID
      currentPriceId = priceDetails.id;
      // Format price amount (comes in cents)
      currentPrice = formatPriceFromCents(priceDetails.unit_amount);
      // Determine billing cycle
      currentBillingCycle = normalizeBillingCycle(priceDetails.recurring?.interval || 'month');
    }
  } else if (subscriptionData.plan) {
    // Fallback to plan object if items are not available
    currentPriceId = subscriptionData.plan.id;
    currentPrice = formatPriceFromCents(subscriptionData.plan.amount);
    // Get billing cycle from plan
    currentBillingCycle = normalizeBillingCycle(subscriptionData.plan.interval || 'month');
  }

  // Format next billing date
  if (subscriptionData.items?.data?.[0]?.current_period_end) {
    nextBillingDate = formatDate(subscriptionData.items.data[0].current_period_end);
  } else if (subscriptionData.current_period_end) {
    nextBillingDate = formatDate(subscriptionData.current_period_end);
  }

  // Get invoice amounts
  if (subscriptionData.latest_invoice && typeof subscriptionData.latest_invoice !== 'string') {
    if (subscriptionData.latest_invoice.amount_paid) {
      lastInvoiceAmount = formatPriceFromCents(subscriptionData.latest_invoice.amount_paid);
      totalPaidAmount = lastInvoiceAmount; // For now, use last invoice amount
    }
  } else {
    // If latest_invoice is a string ID or not available, use current price as a fallback
    lastInvoiceAmount = currentPrice;
    totalPaidAmount = currentPrice;
  }

  // Check for scheduled downgrade
  const scheduledDowngrade = getScheduledDowngrade(subscriptionData);

  // Check subscription status
  const isActive = subscriptionData.status === 'active';
  if (!isActive && !databasePlanName) {
    // Only add status indicator if not using database plan name
    currentPlan = `${currentPlan} (${capitalizeFirstLetter(subscriptionData.status)})`;
  }

  // Check if subscription is scheduled to be canceled
  if (subscriptionData.cancel_at_period_end && !databasePlanName) {
    // Add indication that the subscription will be canceled, only if not using database plan name
    const cancelDate = formatDate(subscriptionData.current_period_end);
    // Update UI to show cancellation status
    currentPlan = `${currentPlan} (Cancels on ${cancelDate})`;
  }

  // Add scheduled downgrade info to plan name if exists
  if (scheduledDowngrade.hasScheduledDowngrade && !databasePlanName) {
    currentPlan = `${currentPlan} (Downgrades to ${capitalizeFirstLetter(scheduledDowngrade.downgradePlan || '')} on ${scheduledDowngrade.downgradeDate})`;
  }

  return {
    subscriptionId,
    currentPlan,
    currentPrice,
    currentBillingCycle,
    nextBillingDate,
    lastInvoiceAmount,
    totalPaidAmount,
    userCount,
    subscriptionStatus,
    scheduledDowngrade,
    currentPriceId,
  };
}

/**
 * Check if subscription has a scheduled downgrade
 * @param subscriptionData Raw subscription data from API
 * @returns Object with downgrade info if scheduled downgrade exists
 */
export function getScheduledDowngrade(subscriptionData: any): {
  hasScheduledDowngrade: boolean;
  downgradePlan?: string;
  downgradeDate?: string;
  newPriceId?: string;
} {
  if (!subscriptionData?.metadata) {
    return { hasScheduledDowngrade: false };
  }

  const metadata = subscriptionData.metadata;

  // Check for scheduled downgrade metadata from backend
  if (metadata.scheduled_downgrade === 'true' && metadata.downgrade_at_period_end === 'true') {
    const downgradeDate = subscriptionData.current_period_end
      ? formatDate(subscriptionData.current_period_end)
      : '';

    return {
      hasScheduledDowngrade: true,
      downgradePlan: metadata.new_plan_name || 'Unknown',
      downgradeDate,
      newPriceId: metadata.new_price_id,
    };
  }

  return { hasScheduledDowngrade: false };
}
