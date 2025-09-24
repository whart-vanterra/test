import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, Palette } from 'lucide-react';
import { createReviewPlatformSchema, CreateReviewPlatformData } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface ReviewPlatformFormProps {
  onSubmit: (data: CreateReviewPlatformData & { logoFile?: File }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<CreateReviewPlatformData>;
  isEditing?: boolean;
}

export function ReviewPlatformForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  isEditing = false,
}: ReviewPlatformFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.logo_url || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateReviewPlatformData>({
    resolver: zodResolver(createReviewPlatformSchema),
    defaultValues: {
      color: '#6B7280',
      priority: 0,
      is_active: true,
      ...initialData,
    },
  });

  const watchedColor = watch('color');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setValue('logo_url', '');
  };

  const onFormSubmit = async (data: CreateReviewPlatformData) => {
    await onSubmit({ ...data, logoFile: logoFile || undefined });
  };

  const predefinedColors = [
    '#4285F4', // Google Blue
    '#FF1A1A', // Yelp Red
    '#1877F2', // Facebook Blue
    '#34E0A1', // TripAdvisor Green
    '#FF6600', // BBB Orange
    '#1DA1F2', // Twitter Blue
    '#E4405F', // Instagram Pink
    '#25D366', // WhatsApp Green
    '#6B7280', // Gray
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Platform Name */}
      <div className="space-y-2">
        <Label htmlFor="name" required>
          Platform Name
        </Label>
        <Input
          id="name"
          placeholder="e.g., Google, Yelp, Facebook"
          {...register('name')}
          error={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Platform Key */}
      <div className="space-y-2">
        <Label htmlFor="key" required>
          Platform Key
        </Label>
        <Input
          id="key"
          placeholder="e.g., google, yelp, facebook"
          {...register('key')}
          error={!!errors.key}
          disabled={isEditing}
        />
        {errors.key && (
          <p className="text-sm text-red-600">{errors.key.message}</p>
        )}
        <p className="text-sm text-gray-600">
          Unique identifier for this platform. Cannot be changed after creation.
        </p>
        {isEditing && (
          <p className="text-sm text-amber-600">
            Platform key cannot be changed after creation
          </p>
        )}
      </div>

      {/* Platform Logo */}
      <div className="space-y-2">
        <Label>Platform Logo</Label>
        <div className="space-y-4">
          {/* Logo Preview */}
          {(logoPreview || logoFile) && (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Platform logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-400">Logo</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={removeLogo}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Logo Upload */}
          <div>
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <Label
              htmlFor="logo"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              {logoPreview || logoFile ? 'Change Logo' : 'Upload Logo'}
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              PNG, JPG, SVG up to 2MB. Recommended: 64x64px
            </p>
          </div>
        </div>
      </div>

      {/* Platform Color */}
      <div className="space-y-2">
        <Label htmlFor="color" required>
          Platform Color
        </Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Input
              id="color"
              type="color"
              className="w-16 h-10 p-1 border rounded"
              {...register('color')}
              error={!!errors.color}
            />
            <Input
              placeholder="#6B7280"
              {...register('color')}
              error={!!errors.color}
              className="flex-1"
            />
          </div>
          
          {/* Predefined Colors */}
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Quick select:</div>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    watchedColor === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
        {errors.color && (
          <p className="text-sm text-red-600">{errors.color.message}</p>
        )}
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Input
          id="priority"
          type="number"
          min="0"
          placeholder="0"
          {...register('priority', { valueAsNumber: true })}
          error={!!errors.priority}
        />
        {errors.priority && (
          <p className="text-sm text-red-600">{errors.priority.message}</p>
        )}
        <p className="text-sm text-gray-600">
          Lower numbers appear first in the platform list. Default is 0.
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          {...register('is_active')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label htmlFor="is_active">Active Platform</Label>
        <p className="text-sm text-gray-600">
          Only active platforms are shown in review forms
        </p>
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
          {isEditing ? 'Update Platform' : 'Create Platform'}
        </Button>
      </div>
    </form>
  );
}
