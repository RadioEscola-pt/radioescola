/**
 * Notification Service for Study Reminders
 * Uses browser Push Notification API
 */

const STORAGE_KEY = "hamradiostudy_notification_settings";
const COOLDOWN_KEY = "hamradiostudy_last_notification";

export interface NotificationSettings {
  enabled: boolean;
  permission: NotificationPermission;
  minQuestionsForReminder: number;
  cooldownMinutes: number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  permission: "default",
  minQuestionsForReminder: 5,
  cooldownMinutes: 60,
};

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return "denied";
  }
}

/**
 * Load notification settings from localStorage
 */
export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<NotificationSettings>;
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...parsed,
        permission: getNotificationPermission(),
      };
    }
  } catch {
    // Ignore parse errors
  }

  return {
    ...DEFAULT_NOTIFICATION_SETTINGS,
    permission: getNotificationPermission(),
  };
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if enough time has passed since last notification
 */
export function isNotificationCooldownPassed(cooldownMinutes: number): boolean {
  if (typeof window === "undefined") return false;

  try {
    const lastNotification = localStorage.getItem(COOLDOWN_KEY);
    if (!lastNotification) return true;

    const lastTime = parseInt(lastNotification, 10);
    const now = Date.now();
    const cooldownMs = cooldownMinutes * 60 * 1000;

    return now - lastTime >= cooldownMs;
  } catch {
    return true;
  }
}

/**
 * Record that a notification was sent
 */
export function recordNotificationSent(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
}

/**
 * Send a study reminder notification
 */
export function sendStudyReminder(
  dueCount: number,
  options?: {
    title?: string;
    body?: string;
    onClick?: () => void;
  }
): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;

  const title = options?.title ?? "Time to Study!";
  const body = options?.body ?? `You have ${dueCount} questions ready for review.`;

  try {
    const notification = new Notification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      tag: "study-reminder",
    });

    if (options?.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    recordNotificationSent();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if we should send a reminder
 */
export function shouldSendReminder(
  dueCount: number,
  settings: NotificationSettings
): boolean {
  if (!settings.enabled) return false;
  if (settings.permission !== "granted") return false;
  if (dueCount < settings.minQuestionsForReminder) return false;
  if (!isNotificationCooldownPassed(settings.cooldownMinutes)) return false;

  return true;
}
