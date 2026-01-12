"use client";

import { useState, useEffect, useCallback } from "react";
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  loadNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
  shouldSendReminder,
  sendStudyReminder,
} from "@/lib/notifications";

export interface UseNotificationsReturn {
  settings: NotificationSettings;
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission;
  toggleEnabled: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
  updateSettings: (partial: Partial<NotificationSettings>) => void;
  checkAndNotify: (dueCount: number, onClick?: () => void) => boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const [settings, setSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [isSupported] = useState(() => isNotificationSupported());

  // Load settings on mount
  useEffect(() => {
    const loaded = loadNotificationSettings();
    setSettings(loaded);
  }, []);

  // Save settings when they change
  useEffect(() => {
    saveNotificationSettings(settings);
  }, [settings]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const permission = await requestNotificationPermission();
    setSettings((prev) => ({ ...prev, permission }));
    return permission;
  }, []);

  const toggleEnabled = useCallback(async (): Promise<void> => {
    if (settings.enabled) {
      // Disable
      setSettings((prev) => ({ ...prev, enabled: false }));
    } else {
      // Enable - need to request permission first
      let permission = getNotificationPermission();

      if (permission === "default") {
        permission = await requestPermission();
      }

      if (permission === "granted") {
        setSettings((prev) => ({ ...prev, enabled: true, permission }));
      } else {
        setSettings((prev) => ({ ...prev, permission }));
      }
    }
  }, [settings.enabled, requestPermission]);

  const updateSettings = useCallback(
    (partial: Partial<NotificationSettings>): void => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const checkAndNotify = useCallback(
    (dueCount: number, onClick?: () => void): boolean => {
      if (!shouldSendReminder(dueCount, settings)) return false;
      return sendStudyReminder(dueCount, { onClick });
    },
    [settings]
  );

  return {
    settings,
    isSupported,
    isEnabled: settings.enabled,
    permission: settings.permission,
    toggleEnabled,
    requestPermission,
    updateSettings,
    checkAndNotify,
  };
}
