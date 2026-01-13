import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import api from '../services/api';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useStore();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const sessionId = searchParams.get('session_id');
  const success = searchParams.has('success');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (success || sessionId) {
      // Reload subscription data after successful checkout
      loadData();
    }
  }, [success, sessionId]);

  const loadData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        api.getSubscriptionPlans(),
        user ? api.getMySubscription() : Promise.resolve(null),
      ]);
      setPlans(plansRes.data.plans || []);
      if (subRes?.data?.subscription) {
        setCurrentSubscription(subRes.data.subscription);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier) => {
    if (!user) {
      navigate('/login?redirect=/subscription');
      return;
    }

    setCheckoutLoading(tier);
    try {
      const response = await api.createCheckoutSession({ tier });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert(error.response?.data?.error || 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await api.createBillingPortal();
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert(error.response?.data?.error || 'Failed to open billing portal');
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    try {
      await api.cancelSubscription();
      loadData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert(error.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await api.resumeSubscription();
      loadData();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      alert(error.response?.data?.error || 'Failed to resume subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {(success || sessionId) && (
          <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-lg text-center">
            Thank you for subscribing! Your subscription is now active.
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock more features and connect with more travelers around the world
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && currentSubscription.tier !== 'FREE' && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Plan: {currentSubscription.tier}
                </h3>
                <p className="text-gray-600">
                  Status: {currentSubscription.status}
                  {currentSubscription.cancelAtPeriodEnd && (
                    <span className="text-orange-600 ml-2">
                      (Cancels at period end)
                    </span>
                  )}
                </p>
                {currentSubscription.currentPeriodEnd && (
                  <p className="text-gray-500 text-sm">
                    Next billing: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleManageSubscription}
                  className="px-4 py-2 text-rose-600 border border-rose-600 rounded-lg hover:bg-rose-50"
                >
                  Manage Billing
                </button>
                {currentSubscription.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleResumeSubscription}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                  >
                    Resume Subscription
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.tier === plan.tier;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.tier}
                className={`relative bg-white rounded-2xl shadow-sm p-6 ${
                  isPopular ? 'ring-2 ring-rose-500' : 'border border-gray-200'
                } ${isCurrentPlan ? 'bg-rose-50' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 ml-1">/{plan.interval}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.tier === 'FREE' ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Free Forever'}
                  </button>
                ) : isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-green-100 text-green-700 rounded-lg cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={checkoutLoading === plan.tier}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      isPopular
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } ${checkoutLoading === plan.tier ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {checkoutLoading === plan.tier ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : currentSubscription?.tier !== 'FREE' ? (
                      'Switch Plan'
                    ) : (
                      'Get Started'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and various local payment methods through our secure payment processor, Stripe.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, your new plan will start at the next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
