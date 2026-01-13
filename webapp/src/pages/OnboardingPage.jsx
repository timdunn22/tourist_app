import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  getOnboardingStatus,
  saveOnboardingStep,
  completeOnboarding,
  skipOnboarding
} from '../services/api';

// Step configuration
const STEPS = [
  { id: 1, title: 'About You', description: 'Tell us a bit about yourself' },
  { id: 2, title: 'Who to Meet', description: 'Who would you like to connect with?' },
  { id: 3, title: 'Your Interests', description: 'What activities do you enjoy?' },
  { id: 4, title: 'Accessibility', description: 'Any special requirements?' },
  { id: 5, title: 'Your Goals', description: 'What brings you here?' },
  { id: 6, title: 'Profile Setup', description: 'Complete your profile' },
];

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const CONNECTION_PREFERENCES = [
  { value: 'MALE', label: 'Men' },
  { value: 'FEMALE', label: 'Women' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'ANY', label: 'Everyone' },
];

const TRAVEL_STYLES = [
  { value: 'BUDGET', label: 'Budget', icon: '$' },
  { value: 'MID_RANGE', label: 'Mid-range', icon: '$$' },
  { value: 'LUXURY', label: 'Luxury', icon: '$$$' },
  { value: 'BACKPACKER', label: 'Backpacker', icon: 'backpack' },
  { value: 'ADVENTURE', label: 'Adventure', icon: 'mountain' },
];

const ACTIVITY_INTERESTS = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'culture', label: 'Culture' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'nature', label: 'Nature' },
  { value: 'photography', label: 'Photography' },
  { value: 'sports', label: 'Sports' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'art', label: 'Art & Museums' },
  { value: 'music', label: 'Music' },
  { value: 'history', label: 'History' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'local_experiences', label: 'Local Experiences' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'guided_tours', label: 'Guided Tours' },
  { value: 'parties', label: 'Parties & Events' },
];

const DIETARY_RESTRICTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Gluten-free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'lactose_free', label: 'Lactose-free' },
  { value: 'nut_allergy', label: 'Nut Allergy' },
  { value: 'none', label: 'None' },
];

const ACCESSIBILITY_NEEDS = [
  { value: 'wheelchair_accessible', label: 'Wheelchair accessible' },
  { value: 'hearing_impaired', label: 'Hearing assistance' },
  { value: 'vision_impaired', label: 'Vision assistance' },
  { value: 'mobility_limited', label: 'Limited mobility' },
  { value: 'none', label: 'None' },
];

const GOALS_MOTIVATION = [
  { value: 'make_friends', label: 'Make new friends' },
  { value: 'find_travel_buddy', label: 'Find a travel buddy' },
  { value: 'attend_experiences', label: 'Attend local experiences' },
  { value: 'learn_new_skills', label: 'Learn new skills' },
  { value: 'explore_nightlife', label: 'Explore nightlife' },
  { value: 'cultural_exchange', label: 'Cultural exchange' },
  { value: 'language_practice', label: 'Language practice' },
  { value: 'networking', label: 'Professional networking' },
  { value: 'promote_business', label: 'Promote my business' },
  { value: 'become_guide', label: 'Become a guide' },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setUser, setOnboardingCompleted } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    connectionPrefs: [],
    ageRangeMin: 18,
    ageRangeMax: 65,
    activityInterests: [],
    travelStyle: '',
    dietaryRestrictions: [],
    accessibilityNeeds: [],
    goalsMotivation: [],
    avatar: '',
    bio: '',
    currentCity: '',
    currentCountry: '',
    languages: [],
  });

  // Fetch current onboarding status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getOnboardingStatus();
        const { onboardingStep, onboardingCompleted, ...data } = response.data;

        if (onboardingCompleted) {
          navigate('/');
          return;
        }

        setCurrentStep(Math.max(onboardingStep || 1, 1));
        setFormData(prev => ({
          ...prev,
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          gender: data.gender || '',
          connectionPrefs: data.connectionPrefs || [],
          ageRangeMin: data.ageRangeMin || 18,
          ageRangeMax: data.ageRangeMax || 65,
          activityInterests: data.activityInterests || [],
          travelStyle: data.travelStyle || '',
          dietaryRestrictions: data.dietaryRestrictions || [],
          accessibilityNeeds: data.accessibilityNeeds || [],
          goalsMotivation: data.goalsMotivation || [],
          avatar: data.avatar || '',
          bio: data.bio || '',
          currentCity: data.currentCity || '',
          currentCountry: data.currentCountry || '',
          languages: data.languages || [],
        }));
      } catch (err) {
        console.error('Failed to fetch onboarding status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = async () => {
    setSaving(true);
    setError('');

    try {
      // Prepare step data
      let stepData = {};
      switch (currentStep) {
        case 1:
          stepData = {
            dateOfBirth: formData.dateOfBirth || null,
            gender: formData.gender || null,
          };
          break;
        case 2:
          stepData = {
            connectionPrefs: formData.connectionPrefs,
            ageRangeMin: formData.ageRangeMin,
            ageRangeMax: formData.ageRangeMax,
          };
          break;
        case 3:
          stepData = {
            activityInterests: formData.activityInterests,
            travelStyle: formData.travelStyle || null,
          };
          break;
        case 4:
          stepData = {
            dietaryRestrictions: formData.dietaryRestrictions,
            accessibilityNeeds: formData.accessibilityNeeds,
          };
          break;
        case 5:
          stepData = {
            goalsMotivation: formData.goalsMotivation,
          };
          break;
        case 6:
          stepData = {
            avatar: formData.avatar || null,
            bio: formData.bio || null,
            currentCity: formData.currentCity || null,
            currentCountry: formData.currentCountry || null,
            languages: formData.languages,
          };
          break;
      }

      await saveOnboardingStep(currentStep, stepData);

      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding
        await completeOnboarding();
        setOnboardingCompleted(true);
        setUser({ ...user, onboardingCompleted: true });
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await skipOnboarding();
      setOnboardingCompleted(true);
      setUser({ ...user, onboardingCompleted: true });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to skip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">LocalLink</span>
          <h1 className="text-2xl font-bold text-white mt-4">
            {STEPS[currentStep - 1].title}
          </h1>
          <p className="text-white/80">
            {STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 h-2 rounded-full transition-colors ${
                step.id <= currentStep ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="input"
                  max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                <p className="text-sm text-gray-500 mt-1">
                  You must be 18 or older to use LocalLink
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('gender', option.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.gender === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Connection Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who would you like to meet?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CONNECTION_PREFERENCES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleArrayItem('connectionPrefs', option.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.connectionPrefs.includes(option.value)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range: {formData.ageRangeMin} - {formData.ageRangeMax}
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={formData.ageRangeMin}
                    onChange={(e) => updateField('ageRangeMin', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={formData.ageRangeMax}
                    onChange={(e) => updateField('ageRangeMax', parseInt(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are you interested in? (Select at least 3)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACTIVITY_INTERESTS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleArrayItem('activityInterests', option.value)}
                      className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                        formData.activityInterests.includes(option.value)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {formData.activityInterests.length}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {TRAVEL_STYLES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('travelStyle', option.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.travelStyle === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Accessibility */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DIETARY_RESTRICTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleArrayItem('dietaryRestrictions', option.value)}
                      className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.dietaryRestrictions.includes(option.value)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessibility Needs
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCESSIBILITY_NEEDS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleArrayItem('accessibilityNeeds', option.value)}
                      className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.accessibilityNeeds.includes(option.value)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Goals */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are you looking for? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS_MOTIVATION.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleArrayItem('goalsMotivation', option.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.goalsMotivation.includes(option.value)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Profile */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => updateField('avatar', e.target.value)}
                  className="input"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="input"
                  rows={3}
                  maxLength={500}
                  placeholder="Tell others about yourself..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current City
                  </label>
                  <input
                    type="text"
                    value={formData.currentCity}
                    onChange={(e) => updateField('currentCity', e.target.value)}
                    className="input"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.currentCountry}
                    onChange={(e) => updateField('currentCountry', e.target.value)}
                    className="input"
                    placeholder="USA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.languages.join(', ')}
                  onChange={(e) => updateField('languages', e.target.value.split(',').map(l => l.trim()).filter(Boolean))}
                  className="input"
                  placeholder="English, Spanish, French"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="btn btn-outline flex-1"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? 'Saving...' : currentStep === 6 ? 'Complete' : 'Next'}
            </button>
          </div>

          {/* Skip Button */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleSkip}
              disabled={saving}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
