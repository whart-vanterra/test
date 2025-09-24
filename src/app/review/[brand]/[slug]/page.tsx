'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ThumbsDown, ThumbsUp, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Location, ReviewPlatform } from '@/lib/types';

interface ReviewStepProps {
  location: Location;
  platforms: ReviewPlatform[];
  onRatingSelect: (rating: number) => void;
}

function RatingStep({ location, onRatingSelect }: ReviewStepProps) {
  const isEmojiMode = location.rating_type === 'emoji';

  if (isEmojiMode) {
    const emojis = ['😠', '😞', '😐', '🙂', '😍'];
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            How was your experience with {location.brand?.name}?
          </h2>
          <p className="text-gray-600">
            Your feedback helps us improve our service
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => onRatingSelect(index + 1)}
              className="text-6xl hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-2"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          How was your experience with {location.brand?.name}?
        </h2>
        <p className="text-gray-600">
          Your feedback helps us improve our service
        </p>
      </div>

      <div className="flex justify-center space-x-8">
        <button
          onClick={() => onRatingSelect(1)}
          className="flex flex-col items-center space-y-2 p-6 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <ThumbsDown className="w-12 h-12 text-red-500" />
          <span className="text-lg font-medium text-red-700">Thumbs Down</span>
        </button>

        <button
          onClick={() => onRatingSelect(5)}
          className="flex flex-col items-center space-y-2 p-6 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <ThumbsUp className="w-12 h-12 text-green-500" />
          <span className="text-lg font-medium text-green-700">Thumbs Up</span>
        </button>
      </div>
    </div>
  );
}

function PositiveFeedbackStep({ location, platforms, rating, onPlatformClick, onMaybeLater }: {
  location: Location;
  platforms: ReviewPlatform[];
  rating: number;
  onPlatformClick: (platform: ReviewPlatform) => void;
  onMaybeLater: () => void;
}) {
  const isThumbsMode = location.rating_type === 'thumbs';
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">
          {isThumbsMode ? '👍' : '🎉'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isThumbsMode ? "Thank You for the Thumbs Up!" : "Fantastic! We're Thrilled!"}
        </h2>
        <div className="flex justify-center space-x-1 mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600">
          We&apos;d love it if you could share your experience on one of these platforms:
        </p>
      </div>

      <div className="space-y-3">
        {location.platform_order.map((platformKey) => {
          const platform = platforms.find(p => p.key === platformKey);
          const platformUrl = location.platform_urls[platformKey];
          
          if (!platform || !platformUrl) return null;

          return (
            <Card key={platform.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <button
                  onClick={() => onPlatformClick(platform)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {platform.logo_url ? (
                      <img
                        src={platform.logo_url}
                        alt={platform.name}
                        className="w-10 h-10 rounded"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{platform.name}</div>
                      <div className="text-sm text-gray-500">Share your experience</div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={onMaybeLater}
          className="text-gray-600"
        >
          Maybe Later
        </Button>
      </div>
    </div>
  );
}

function NegativeFeedbackStep({ location, rating, onSubmit }: {
  location: Location;
  rating: number;
  onSubmit: (data: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    comments: string;
  }) => void;
}) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    comments: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'customer_phone') {
      // Format phone number
      const phoneNumber = value.replace(/\D/g, '');
      if (phoneNumber.length >= 6) {
        const formatted = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        setFormData({ ...formData, [field]: formatted });
      } else if (phoneNumber.length >= 3) {
        const formatted = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        setFormData({ ...formData, [field]: formatted });
      } else if (phoneNumber.length > 0) {
        const formatted = `(${phoneNumber}`;
        setFormData({ ...formData, [field]: formatted });
      } else {
        setFormData({ ...formData, [field]: phoneNumber });
      }
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          We&apos;re Sorry You Had a Poor Experience
        </h2>
        <div className="flex justify-center space-x-1 mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600">
          Please let us know what went wrong so we can make it right.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="customer_name"
              required
              value={formData.customer_name}
              onChange={(e) => handleInputChange('customer_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="customer_email"
              required
              value={formData.customer_email}
              onChange={(e) => handleInputChange('customer_email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="customer_phone"
            required
            value={formData.customer_phone}
            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
            Comments *
          </label>
          <textarea
            id="comments"
            required
            rows={4}
            value={formData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            placeholder="Please tell us what went wrong..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-center">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full md:w-auto"
          >
            Send Feedback to GM
          </Button>
        </div>
      </form>
    </div>
  );
}

function ThankYouStep({ isPositive, rating }: { isPositive: boolean; rating: number }) {
  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl mb-4">
        {isPositive ? '🎉' : '🙏'}
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {isPositive ? 'Thank You!' : 'Thank You for Your Feedback'}
      </h2>
      
      <p className="text-gray-600">
        {isPositive ? (
          <>
            We&apos;re so glad you had a great experience! 
            <br />
            Don&apos;t forget to check out our referral program for special rewards.
          </>
        ) : (
          <>
            We sincerely apologize for the inconvenience.
            <br />
            Our management team will contact you within 24 hours to resolve this issue.
          </>
        )}
      </p>

      <div className="flex justify-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-6 h-6 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState<'rating' | 'positive' | 'negative' | 'thankyou'>('rating');
  const [rating, setRating] = useState<number | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [platforms, setPlatforms] = useState<ReviewPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const brandSlug = params.brand as string;
  const locationSlug = params.slug as string;

  useEffect(() => {
    fetchLocationData();
    fetchPlatforms();
  }, [brandSlug, locationSlug]);

  const fetchLocationData = async () => {
    try {
      const response = await fetch(`/api/locations/by-brand/${brandSlug}/${locationSlug}`);
      const result = await response.json();

      if (response.ok) {
        setLocation(result.data.location);
      } else {
        toast.error('Location not found');
        router.push('/');
      }
    } catch (error) {
      toast.error('Failed to load location');
      router.push('/');
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/review-platforms');
      const result = await response.json();

      if (response.ok) {
        setPlatforms(result.data.platforms);
      }
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
    
    // Determine feedback type based on rating and rating type
    const isPositive = location?.rating_type === 'thumbs' 
      ? selectedRating === 5 
      : selectedRating >= 4;
    
    if (isPositive) {
      setStep('positive');
    } else {
      setStep('negative');
    }
  };

  const handlePlatformClick = (platform: ReviewPlatform) => {
    if (!location || !rating) return;

    // Submit positive review
    submitReview({
      location_id: location.id,
      nps_score: rating,
      feedback_type: 'positive',
      external_review_url: location.platform_urls[platform.key],
    });

    // Redirect to external platform
    window.open(location.platform_urls[platform.key], '_blank');
    
    setStep('thankyou');
  };

  const handleMaybeLater = () => {
    if (!location || !rating) return;

    // Submit positive review without external URL
    submitReview({
      location_id: location.id,
      nps_score: rating,
      feedback_type: 'positive',
    });

    setStep('thankyou');
  };

  const handleNegativeFeedback = async (data: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    comments: string;
  }) => {
    if (!location || !rating) return;

    // Submit negative review
    await submitReview({
      location_id: location.id,
      nps_score: rating,
      feedback_type: 'negative',
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      comments: data.comments,
    });

    setStep('thankyou');
  };

  const submitReview = async (reviewData: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit review');
      }

      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Location not found</h1>
          <p className="text-gray-600 mt-2">The requested location could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Brand Logo */}
        {location.brand?.logo_url && (
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
              <img
                src={location.brand.logo_url}
                alt={location.brand.name}
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
        )}

        {/* Review Steps */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {step === 'rating' && (
              <RatingStep
                location={location}
                platforms={platforms}
                onRatingSelect={handleRatingSelect}
              />
            )}

            {step === 'positive' && rating && (
              <PositiveFeedbackStep
                location={location}
                platforms={platforms}
                rating={rating}
                onPlatformClick={handlePlatformClick}
                onMaybeLater={handleMaybeLater}
              />
            )}

            {step === 'negative' && rating && (
              <NegativeFeedbackStep
                location={location}
                rating={rating}
                onSubmit={handleNegativeFeedback}
              />
            )}

            {step === 'thankyou' && rating && (
              <ThankYouStep
                isPositive={location.rating_type === 'thumbs' ? rating === 5 : rating >= 4}
                rating={rating}
              />
            )}
          </CardContent>
        </Card>

        {/* Website Link */}
        {location.brand?.website_url && (
          <div className="text-center mt-8">
            <a
              href={location.brand.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Visit {location.brand.name} Website
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
