import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThumbsDown, ThumbsUp, Plus, Minus } from 'lucide-react';
import { createLocationSchema, CreateLocationData } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { generateSlug } from '@/lib/utils';
import { Brand, ReviewPlatform } from '@/lib/types';

interface LocationFormProps {
  onSubmit: (data: CreateLocationData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<CreateLocationData>;
  isEditing?: boolean;
  brands: Brand[];
  availablePlatforms: ReviewPlatform[];
  userRole?: 'admin' | 'super_admin';
}

export function LocationForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  isEditing = false,
  brands,
  availablePlatforms,
  userRole = 'admin',
}: LocationFormProps) {
  const [platforms, setPlatforms] = useState<Array<{ platformId: string; url: string }>>(
    initialData?.platform_order?.map(key => ({
      platformId: key,
      url: initialData.platform_urls[key] || '',
    })) || [{ platformId: '', url: '' }]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateLocationData>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      rating_type: 'emoji',
      is_active: true,
      ...initialData,
    },
  });

  const watchedName = watch('name');

  // Auto-generate slug when name changes
  React.useEffect(() => {
    if (watchedName && !isEditing) {
      const slug = generateSlug(watchedName);
      setValue('slug', slug);
    }
  }, [watchedName, setValue, isEditing]);

  const addPlatform = () => {
    if (platforms.length < 3) {
      setPlatforms([...platforms, { platformId: '', url: '' }]);
    }
  };

  const removePlatform = (index: number) => {
    if (platforms.length > 1) {
      setPlatforms(platforms.filter((_, i) => i !== index));
    }
  };

  const updatePlatform = (index: number, field: 'platformId' | 'url', value: string) => {
    const updated = platforms.map((platform, i) =>
      i === index ? { ...platform, [field]: value } : platform
    );
    setPlatforms(updated);
  };

  const onFormSubmit = async (data: CreateLocationData) => {
    const platform_urls: Record<string, string> = {};
    const platform_order: string[] = [];

    platforms.forEach((platform) => {
      if (platform.platformId && platform.url) {
        platform_urls[platform.platformId] = platform.url;
        platform_order.push(platform.platformId);
      }
    });

    await onSubmit({
      ...data,
      platform_urls,
      platform_order,
    });
  };

  const getAvailablePlatformOptions = (currentIndex: number) => {
    const usedPlatformIds = platforms
      .map((p, i) => i !== currentIndex ? p.platformId : null)
      .filter(Boolean);
    
    return availablePlatforms.filter(platform => !usedPlatformIds.includes(platform.key));
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Brand Selection */}
      <div className="space-y-2">
        <Label htmlFor="brand_id" required>
          Brand
        </Label>
        <Select
          id="brand_id"
          {...register('brand_id')}
          error={!!errors.brand_id}
        >
          <option value="">Select a brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </Select>
        {errors.brand_id && (
          <p className="text-sm text-red-600">{errors.brand_id.message}</p>
        )}
      </div>

      {/* Location Name */}
      <div className="space-y-2">
        <Label htmlFor="name" required>
          Location Name
        </Label>
        <Input
          id="name"
          placeholder="Enter location name"
          {...register('name')}
          error={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* URL Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug" required>
          URL Slug
        </Label>
        <Input
          id="slug"
          placeholder="location-name"
          {...register('slug')}
          error={!!errors.slug}
          disabled={isEditing && userRole !== 'super_admin'}
        />
        {errors.slug && (
          <p className="text-sm text-red-600">{errors.slug.message}</p>
        )}
        <p className="text-sm text-gray-600">
          This will be used in the review URL: /review/brand-slug/{watch('slug') || 'location-name'}
        </p>
        {isEditing && userRole !== 'super_admin' && (
          <p className="text-sm text-amber-600">
            (Only super admins can edit slugs after creation)
          </p>
        )}
      </div>

      {/* Rating Type */}
      <div className="space-y-2">
        <Label required>Rating Type</Label>
        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer">
            <CardContent
              className="p-4"
              onClick={() => setValue('rating_type', 'emoji')}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="emoji"
                  {...register('rating_type')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-2xl">😞😐🙂😍</div>
                  <div className="text-sm font-medium">Emoji Rating</div>
                  <div className="text-xs text-gray-500">1-5 scale with emojis</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer">
            <CardContent
              className="p-4"
              onClick={() => setValue('rating_type', 'thumbs')}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="thumbs"
                  {...register('rating_type')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="flex space-x-2">
                    <ThumbsDown className="w-6 h-6 text-red-500" />
                    <ThumbsUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-sm font-medium">Thumbs Rating</div>
                  <div className="text-xs text-gray-500">Simple thumbs up/down</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {errors.rating_type && (
          <p className="text-sm text-red-600">{errors.rating_type.message}</p>
        )}
      </div>

      {/* Review Platforms */}
      <div className="space-y-2">
        <Label required>Review Platforms</Label>
        <div className="space-y-3">
          {platforms.map((platform, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="text-sm font-medium text-gray-500 w-8">
                #{index + 1}
              </div>
              
              <div className="flex-1">
                <Select
                  value={platform.platformId}
                  onChange={(e) => updatePlatform(index, 'platformId', e.target.value)}
                  error={!platform.platformId && index === 0}
                >
                  <option value="">Select platform</option>
                  {getAvailablePlatformOptions(index).map((p) => (
                    <option key={p.id} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex-1">
                <Input
                  placeholder="Platform URL"
                  value={platform.url}
                  onChange={(e) => updatePlatform(index, 'url', e.target.value)}
                  error={!platform.url && platform.platformId !== ''}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removePlatform(index)}
                disabled={platforms.length === 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {platforms.length < 3 && (
            <Button
              type="button"
              variant="outline"
              onClick={addPlatform}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Platform
            </Button>
          )}
        </div>
        {errors.platform_urls && (
          <p className="text-sm text-red-600">At least one platform with valid URL is required</p>
        )}
      </div>

      {/* Notification Email Override */}
      <div className="space-y-2">
        <Label htmlFor="notification_email">Notification Email Override</Label>
        <Input
          id="notification_email"
          type="email"
          placeholder="Override brand's default email (optional)"
          {...register('notification_email')}
          error={!!errors.notification_email}
        />
        {errors.notification_email && (
          <p className="text-sm text-red-600">{errors.notification_email.message}</p>
        )}
        <p className="text-sm text-gray-600">
          If left blank, negative review notifications will use the brand&apos;s default email address.
        </p>
      </div>

      {/* Active Location */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          {...register('is_active')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label htmlFor="is_active">Active Location</Label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? 'Update Location' : 'Create Location'}
        </Button>
      </div>
    </form>
  );
}
