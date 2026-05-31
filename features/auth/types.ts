import type { Profile, ProfileOption } from "@/types";

export type MyInfo = {
  email: string;
  id: number;
  profiles: ProfileOption[];
  is_email_verified: boolean;
  regular_profile_onboarding_completed: boolean;
  business_profile_onboarding_completed: boolean;
  pending_deletion: PendingDeletion;
};

export type Tokens = {
  access: string;
  refresh: string;
};

export type PendingDeletion = {
  scheduled_deletion_at: string;
  days_remaining: number;
} | null;

export type User = {
  id: null | number;
  email: null | string;
  profiles: ProfileOption[] | null;
  is_email_verified: boolean;
  regular_profile_onboarding_completed: boolean;
  business_profile_onboarding_completed: boolean;
  pending_deletion: PendingDeletion;
};

export type RegisterUserResponse = {
  id: number;
  email: string;
  profile: Profile;
};
