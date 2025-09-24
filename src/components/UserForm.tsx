import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAdminUserSchema, CreateAdminUserData } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface UserFormProps {
  onSubmit: (data: CreateAdminUserData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<CreateAdminUserData & { id: string }>;
  isEditing?: boolean;
  currentUserRole?: 'admin' | 'super_admin';
}

export function UserForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  isEditing = false,
  currentUserRole = 'admin',
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateAdminUserData>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: initialData,
  });

  const watchedPassword = watch('password');

  const onFormSubmit = async (data: CreateAdminUserData) => {
    await onSubmit(data);
  };

  const canEditRole = currentUserRole === 'super_admin' || !isEditing;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" required>
          Full Name
        </Label>
        <Input
          id="name"
          placeholder="Enter full name"
          {...register('name')}
          error={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" required>
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          {...register('email')}
          error={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" required={!isEditing}>
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
          {...register('password', { 
            required: !isEditing,
            validate: (value) => {
              if (isEditing && !value) return true; // Optional for editing
              if (value && value.length < 8) return "Password must be at least 8 characters";
              return true;
            }
          })}
          error={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
        {isEditing && (
          <p className="text-sm text-gray-600">
            Leave blank to keep the current password
          </p>
        )}
        {!isEditing && (
          <p className="text-sm text-gray-600">
            Password must be at least 8 characters long
          </p>
        )}
      </div>

      {/* Confirm Password (only for new users or when password is provided) */}
      {(watchedPassword || !isEditing) && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" required>
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm password"
            {...register('confirmPassword', {
              required: !isEditing || !!watchedPassword,
              validate: (value) => {
                if (!watchedPassword && isEditing) return true;
                if (value !== watchedPassword) return "Passwords do not match";
                return true;
              }
            })}
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      )}

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role" required>
          Role
        </Label>
        <Select
          id="role"
          {...register('role')}
          error={!!errors.role}
          disabled={!canEditRole}
        >
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role.message}</p>
        )}
        <p className="text-sm text-gray-600">
          <strong>Admin:</strong> Can manage brands, locations, and reviews<br />
          <strong>Super Admin:</strong> Can manage everything including other admin users
        </p>
        {!canEditRole && (
          <p className="text-sm text-amber-600">
            Only super admins can change user roles
          </p>
        )}
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
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}
