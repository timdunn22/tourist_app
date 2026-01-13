import { Router, Request, Response, raw } from 'express';
import Stripe from 'stripe';
import {
  syncSubscriptionFromStripe,
  handleSubscriptionDeleted,
  handlePaymentFailed,
} from '../services/subscriptionService';

const router = Router();

// Initialize Stripe (will be null if no API key)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /webhooks/stripe
 * Handle Stripe webhooks
 * Note: This route uses raw body parser (configured in index.ts before JSON parsing)
 */
router.post(
  '/stripe',
  raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    if (!stripe || !webhookSecret) {
      console.warn('Stripe webhooks not configured');
      return res.status(400).json({ error: 'Webhooks not configured' });
    }

    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await syncSubscriptionFromStripe(subscription);
          console.log(`Subscription ${event.type}:`, subscription.id);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(subscription);
          console.log('Subscription deleted:', subscription.id);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(invoice);
          console.log('Invoice payment failed:', invoice.id);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log('Invoice payment succeeded:', invoice.id);
          // Subscription update will be handled by subscription.updated event
          break;
        }

        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('Checkout session completed:', session.id);
          // Subscription creation will be handled by subscription.created event
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error handling webhook ${event.type}:`, error);
      return res.status(500).json({ error: 'Webhook handler error' });
    }

    res.json({ received: true });
  }
);

/**
 * GET /webhooks/health
 * Health check for webhooks endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    stripeConfigured: !!stripe,
    webhookSecretConfigured: !!webhookSecret,
  });
});

export default router;
