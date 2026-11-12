import { familyInviteSchema, familyResponseSchema, type Contact, type FamilyResponse } from '@kids-chores/contracts';
import { apiJson, apiOk, apiRequest } from '@/shared/api/http';
import type { InviteResult, JoinRequestResult } from '../model/types';

export const fetchFamily = (): Promise<FamilyResponse | null> =>
  apiJson('/family', (data) => familyResponseSchema.parse(data));

export const sendInvite = async (contact: Contact): Promise<InviteResult> => {
  const response = await apiRequest('/family/invites', 'POST', { contact });
  if (response?.status === 409) {
    return { status: 'member' };
  }
  if (!response?.ok) {
    return { status: 'failed' };
  }
  try {
    return { status: 'sent', invite: familyInviteSchema.parse(await response.json()) };
  } catch {
    return { status: 'failed' };
  }
};

export const dropInvite = (id: string): Promise<boolean> => apiOk(`/family/invites/${id}`, 'DELETE');

export const acceptInvite = (id: string): Promise<boolean> => apiOk(`/family/invites/${id}/accept`, 'POST');

export const requestToJoin = async (contact: Contact): Promise<JoinRequestResult> => {
  const response = await apiRequest('/family/requests', 'POST', { contact });
  if (response?.status === 429) {
    return 'tooMany';
  }
  return response?.ok === true ? 'sent' : 'failed';
};

export const approveRequest = (id: string): Promise<boolean> => apiOk(`/family/requests/${id}/approve`, 'POST');

export const declineRequest = (id: string): Promise<boolean> => apiOk(`/family/requests/${id}`, 'DELETE');

export const removeMember = (userId: string): Promise<boolean> => apiOk(`/family/members/${userId}`, 'DELETE');

export const requestFamilyLeave = (): Promise<boolean> => apiOk('/family/leave', 'POST');
