import {
  createdInviteSchema,
  familyResponseSchema,
  invitePreviewSchema,
  type Contact,
  type CreateInviteRequest,
  type FamilyResponse,
} from '@kids-chores/contracts';
import { apiJson, apiOk, apiRequest } from '@/shared/api/http';
import type { CreateInviteResult, InvitePreviewResult, JoinRequestResult } from '../model/types';

export const fetchFamily = (): Promise<FamilyResponse | null> =>
  apiJson('/family', (data) => familyResponseSchema.parse(data));

export const createInvite = async (request: CreateInviteRequest): Promise<CreateInviteResult> => {
  const response = await apiRequest('/family/invites', 'POST', request);
  if (response?.status === 429) {
    return { status: 'tooMany' };
  }
  if (!response?.ok) {
    return { status: 'failed' };
  }
  try {
    return { status: 'created', invite: createdInviteSchema.parse(await response.json()) };
  } catch {
    return { status: 'failed' };
  }
};

export const dropInvite = (id: string): Promise<boolean> => apiOk(`/family/invites/${id}`, 'DELETE');

export const previewInvite = async (token: string): Promise<InvitePreviewResult> => {
  const response = await apiRequest('/family/invites/preview', 'POST', { token });
  if (response?.status === 404 || response?.status === 400) {
    return { status: 'gone' };
  }
  if (!response?.ok) {
    return { status: 'failed' };
  }
  try {
    return { status: 'ready', preview: invitePreviewSchema.parse(await response.json()) };
  } catch {
    return { status: 'failed' };
  }
};

export const acceptInvite = (token: string): Promise<boolean> => apiOk('/family/invites/accept', 'POST', { token });

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
