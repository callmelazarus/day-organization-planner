import { useEffect, useState } from 'react';
import { DEFAULT_AVATAR_ID, isAvatarId } from './avatar/avatarStyles';
import type { AvatarId } from './avatar/avatarStyles';

export interface UseAvatarChoiceResult {
  avatarId: AvatarId;
  setAvatarId: (id: AvatarId) => void;
}

const STORAGE_KEY = 'circular-clock-mvp:avatar';

function loadAvatarId(): AvatarId {
  const raw = localStorage.getItem(STORAGE_KEY);
  return isAvatarId(raw) ? raw : DEFAULT_AVATAR_ID;
}

export function useAvatarChoice(): UseAvatarChoiceResult {
  const [avatarId, setAvatarId] = useState<AvatarId>(() => loadAvatarId());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, avatarId);
  }, [avatarId]);

  return { avatarId, setAvatarId };
}
