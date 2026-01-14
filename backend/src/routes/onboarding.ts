import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getOnboardingStatus,
  saveOnboardingStep,
  completeOnboarding,
  getPersonalizedSuggestions,
  skipOnboarding,
  stepValidations,
  onboardingOptions,
} from '../controllers/onboardingController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/onboarding/status
 * Get current onboarding status and saved data
 */
router.get('/status', getOnboardingStatus);

/**
 * GET /api/onboarding/options
 * Get available options for onboarding form fields
 */
router.get('/options', (_req, res) => {
  res.json(onboardingOptions);
});

/**
 * POST /api/onboarding/step/:step
 * Save data for a specific onboarding step (1-6)
 */
router.post('/step/:step', async (req, res, next) => {
  const step = parseInt(req.params.step) as 1 | 2 | 3 | 4 | 5 | 6;
  if (step >= 1 && step <= 6 && stepValidations[step]) {
    await Promise.all(stepValidations[step].map(validator => validator.run(req)));
  }
  next();
}, saveOnboardingStep);

/**
 * POST /api/onboarding/complete
 * Mark onboarding as complete
 */
router.post('/complete', completeOnboarding);

/**
 * POST /api/onboarding/skip
 * Skip onboarding (can complete later)
 */
router.post('/skip', skipOnboarding);

/**
 * GET /api/onboarding/suggestions
 * Get personalized suggestions based on completed profile
 */
router.get('/suggestions', getPersonalizedSuggestions);

export default router;
