import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building, Upload, X } from 'lucide-react';
import { createBrandSchema, CreateBrandData } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { generateSlug } from '@/lib/utils';

interface BrandFormProps {
  onSubmit: (data: CreateBrandData & { logoFile?: File }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<CreateBrandData>;
  isEditing?: boolean;
  userRole?: 'admin' | 'super_admin';
}

export function BrandForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  isEditing = false,
  userRole = 'admin',
}: BrandFormProps) {
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
  } = useForm<CreateBrandData>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: initialData,
  });

  const watchedName = watch('name');

  // Auto-generate slug when name changes
  React.useEffect(() => {
    if (watchedName && !isEditing) {
      const slug = generateSlug(watchedName);
      setValue('slug', slug);
    }
  }, [watchedName, setValue, isEditing]);

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

  const onFormSubmit = async (data: CreateBrandData) => {
    await onSubmit({ ...data, logoFile: logoFile || undefined });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Brand Name */}
      <div className="space-y-2">
        <Label htmlFor="name" required>
          Brand Name
        </Label>
        <Input
          id="name"
          placeholder="Enter brand name"
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
          placeholder="brand-name"
          {...register('slug')}
          error={!!errors.slug}
          disabled={isEditing && userRole !== 'super_admin'}
        />
        {errors.slug && (
          <p className="text-sm text-red-600">{errors.slug.message}</p>
        )}
        <p className="text-sm text-gray-600">
          This will be used in review URLs: /review/{watch('slug') || 'brand-name'}/location-name
        </p>
        {isEditing && userRole !== 'super_admin' && (
          <p className="text-sm text-amber-600">
            (Only super admins can edit slugs after creation)
          </p>
        )}
      </div>

      {/* Brand Logo */}
      <div className="space-y-2">
        <Label>Brand Logo</Label>
        <div className="space-y-4">
          {/* Logo Preview */}
          {(logoPreview || logoFile) && (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Brand logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building className="w-6 h-6 text-gray-400" />
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
              PNG, JPG, SVG up to 2MB. Recommended: 200x200px
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional brand description"
          rows={3}
          {...register('description')}
          error={!!errors.description}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Website URL */}
      <div className="space-y-2">
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          id="website_url"
          type="url"
          placeholder="https://example.com"
          {...register('website_url')}
          error={!!errors.website_url}
        />
        {errors.website_url && (
          <p className="text-sm text-red-600">{errors.website_url.message}</p>
        )}
      </div>

      {/* Notification Email */}
      <div className="space-y-2">
        <Label htmlFor="notification_email" required>
          Notification Email
        </Label>
        <Input
          id="notification_email"
          type="email"
          placeholder="notifications@example.com"
          {...register('notification_email')}
          error={!!errors.notification_email}
        />
        {errors.notification_email && (
          <p className="text-sm text-red-600">{errors.notification_email.message}</p>
        )}
        <p className="text-sm text-gray-600">
          Default email for negative review notifications. Can be overridden at location level.
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
          {isEditing ? 'Update Brand' : 'Create Brand'}
        </Button>
      </div>
    </form>
  );
}
