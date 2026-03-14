export type TermsOfService = {
  id: number;
  content: string;
  version: string;
  created_at: string;
  has_accepted: boolean;
  accepted_at: string | null;
};
