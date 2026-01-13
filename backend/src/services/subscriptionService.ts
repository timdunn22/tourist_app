import Stripe from 'stripe';
import { PrismaClient, SubscriptionTier, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Stripe (will be null if no API key)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Pricing configuration
export const SUBSCRIPTION_PRICES = {
  [SubscriptionTier.BASIC]: {
    priceId: process.env.STRIPE_PRICE_BASIC,
    amount: 999, // $9.99
    name: 'Basic',
    features: [
      'Message your matches',
      'Join unlimited activities',
      'Access city & country chat rooms',
    ],
  },
  [SubscriptionTier.PREMIUM]: {
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    amount: 1999, // $19.99
    name: 'Premium',
    features: [
      'All Basic features',
      'See who viewed your profile',
      'Priority in matching algorithm',
      'Verified badge on profile',
      'Unlimited super likes',
    ],
  },
  [SubscriptionTier.BUSINESS]: {
    priceId: process.env.STRIPE_PRICE_BUSINESS,
    amount: 4999, // $49.99
    name: 'Business',
    features: [
      'All Premium features',
      'Business profile badge',
      'Analytics dashboard',
      'Promoted listings',
    ],
  },
};

/**
 * Get or create Stripe customer for user
 */
export async function getOrCreateStripeCustomer(
  userId: string
): Promise<string | null> {
  if (!stripe) {
    console.warn('Stripe not configured');
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user already has a subscription with Stripe customer
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId },
  });

  // Update or create subscription with customer ID
  await prisma.subscription.upsert({
    where: { userId },
    update: { stripeCustomerId: customer.id },
    create: {
      userId,
      stripeCustomerId: customer.id,
      tier: SubscriptionTier.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  return customer.id;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  tier: SubscriptionTier,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string } | null> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  // FREE tier has no price config
  if (tier === SubscriptionTier.FREE) {
    throw new Error('Cannot checkout for free tier');
  }

  const priceConfig = SUBSCRIPTION_PRICES[tier as keyof typeof SUBSCRIPTION_PRICES];
  if (!priceConfig?.priceId) {
    throw new Error(`Invalid subscription tier: ${tier}`);
  }

  const customerId = await getOrCreateStripeCustomer(userId);
  if (!customerId) {
    throw new Error('Failed to create Stripe customer');
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceConfig.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
    },
  });

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

/**
 * Create a billing portal session for managing subscription
 */
export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<{ url: string } | null> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    throw new Error('No Stripe customer found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

/**
 * Sync subscription from Stripe webhook
 */
export async function syncSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const customerId = stripeSubscription.customer as string;

  // Find user by Stripe customer ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) {
    console.error(`No subscription found for Stripe customer: ${customerId}`);
    return;
  }

  // Determine tier from price ID
  const priceId = stripeSubscription.items.data[0]?.price.id;

  let tier: SubscriptionTier = SubscriptionTier.FREE;
  if (priceId === process.env.STRIPE_PRICE_BASIC) {
    tier = SubscriptionTier.BASIC;
  } else if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
    tier = SubscriptionTier.PREMIUM;
  } else if (priceId === process.env.STRIPE_PRICE_BUSINESS) {
    tier = SubscriptionTier.BUSINESS;
  }

  // Map Stripe status to our status
  let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
  switch (stripeSubscription.status) {
    case 'active':
      status = SubscriptionStatus.ACTIVE;
      break;
    case 'past_due':
      status = SubscriptionStatus.PAST_DUE;
      break;
    case 'canceled':
      status = SubscriptionStatus.CANCELLED;
      break;
    case 'unpaid':
      status = SubscriptionStatus.PAST_DUE;
      break;
    case 'trialing':
      status = SubscriptionStatus.TRIALING;
      break;
    default:
      status = SubscriptionStatus.ACTIVE;
  }

  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      tier,
      status,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      cancelledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
    },
  });
}

/**
 * Handle subscription deleted
 */
export async function handleSubscriptionDeleted(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const customerId = stripeSubscription.customer as string;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!subscription) {
    return;
  }

  // Downgrade to free tier
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      tier: SubscriptionTier.FREE,
      status: SubscriptionStatus.CANCELLED,
      stripeSubscriptionId: null,
      stripePriceId: null,
      cancelledAt: new Date(),
    },
  });
}

/**
 * Handle payment failed
 */
export async function handlePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId = invoice.customer as string;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!subscription) {
    return;
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.PAST_DUE,
    },
  });

  // TODO: Send email notification about payment failure
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: string): Promise<any> {
  let subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // Create free subscription if none exists
  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        userId,
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  return {
    ...subscription,
    features: getFeaturesByTier(subscription.tier),
  };
}

/**
 * Get features by subscription tier
 */
export function getFeaturesByTier(tier: SubscriptionTier): string[] {
  const features: string[] = [];

  // Free tier features
  features.push('See potential matches');
  features.push('Join public activities');
  features.push('Access public chat rooms');

  if (tier === SubscriptionTier.BASIC || tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.BUSINESS) {
    features.push('Message your matches');
    features.push('Create activities');
    features.push('Priority support');
  }

  if (tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.BUSINESS) {
    features.push('See who viewed your profile');
    features.push('Priority in matching algorithm');
    features.push('Verified badge on profile');
    features.push('Unlimited super likes');
  }

  if (tier === SubscriptionTier.BUSINESS) {
    features.push('Business profile badge');
    features.push('Analytics dashboard');
    features.push('Promoted listings');
  }

  return features;
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: string
): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const tier = subscription?.tier || SubscriptionTier.FREE;

  // Feature access matrix
  const featureMatrix: Record<string, SubscriptionTier[]> = {
    CHAT_MATCHES: [SubscriptionTier.BASIC, SubscriptionTier.PREMIUM, SubscriptionTier.BUSINESS],
    CREATE_ACTIVITIES: [SubscriptionTier.BASIC, SubscriptionTier.PREMIUM, SubscriptionTier.BUSINESS],
    VIEW_PROFILE_VIEWS: [SubscriptionTier.PREMIUM, SubscriptionTier.BUSINESS],
    SUPER_LIKES_UNLIMITED: [SubscriptionTier.PREMIUM, SubscriptionTier.BUSINESS],
    PRIORITY_MATCHING: [SubscriptionTier.PREMIUM, SubscriptionTier.BUSINESS],
    BUSINESS_BADGE: [SubscriptionTier.BUSINESS],
    ANALYTICS_DASHBOARD: [SubscriptionTier.BUSINESS],
    PROMOTED_LISTINGS: [SubscriptionTier.BUSINESS],
  };

  const allowedTiers = featureMatrix[feature];
  if (!allowedTiers) {
    return true; // Feature not gated
  }

  return allowedTiers.includes(tier);
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  userId: string,
  reason?: string
): Promise<void> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw new Error('No active subscription found');
  }

  // Cancel at period end in Stripe
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  // Update local record
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true,
      cancellationReason: reason,
    },
  });
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(userId: string): Promise<void> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw new Error('No subscription found');
  }

  // Resume in Stripe
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  // Update local record
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: false,
      cancellationReason: null,
    },
  });
}

/**
 * Get subscription plans for display
 */
export function getSubscriptionPlans(): any[] {
  return [
    {
      tier: SubscriptionTier.FREE,
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        'See potential matches',
        'Join public activities',
        'Access public chat rooms',
        'Basic profile',
      ],
      popular: false,
    },
    {
      tier: SubscriptionTier.BASIC,
      name: 'Basic',
      price: 9.99,
      interval: 'month',
      features: [
        'All Free features',
        'Message your matches',
        'Create activities',
        'Priority support',
      ],
      popular: true,
    },
    {
      tier: SubscriptionTier.PREMIUM,
      name: 'Premium',
      price: 19.99,
      interval: 'month',
      features: [
        'All Basic features',
        'See who viewed your profile',
        'Priority in matching',
        'Verified badge',
        'Unlimited super likes',
      ],
      popular: false,
    },
    {
      tier: SubscriptionTier.BUSINESS,
      name: 'Business',
      price: 49.99,
      interval: 'month',
      features: [
        'All Premium features',
        'Business profile badge',
        'Analytics dashboard',
        'Promoted listings',
        'Dedicated support',
      ],
      popular: false,
    },
  ];
}
