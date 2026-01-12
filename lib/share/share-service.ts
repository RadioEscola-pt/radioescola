export type SharePlatform = "native" | "twitter" | "facebook" | "linkedin" | "copy";

export interface ShareContent {
  title: string;
  text: string;
  url?: string;
  hashtags?: string[];
}

/**
 * Check if native Web Share API is available
 */
export function canUseNativeShare(): boolean {
  if (typeof navigator === "undefined") return false;
  return "share" in navigator && typeof navigator.share === "function";
}

/**
 * Generate share URL for a specific platform
 */
export function getShareUrl(content: ShareContent, platform: Exclude<SharePlatform, "native" | "copy">): string {
  const { text, url, hashtags } = content;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = url ? encodeURIComponent(url) : "";

  switch (platform) {
    case "twitter": {
      const hashtagParam = hashtags?.length ? `&hashtags=${hashtags.join(",")}` : "";
      return `https://twitter.com/intent/tweet?text=${encodedText}${url ? `&url=${encodedUrl}` : ""}${hashtagParam}`;
    }
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    default:
      return "";
  }
}

/**
 * Share content using native API or fallback
 */
export async function share(
  content: ShareContent,
  platform?: SharePlatform
): Promise<boolean> {
  // If platform specified, use that method
  if (platform === "copy") {
    return copyToClipboard(content.text + (content.url ? `\n${content.url}` : ""));
  }

  if (platform && platform !== "native") {
    const url = getShareUrl(content, platform);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
      return true;
    }
    return false;
  }

  // Try native share first
  if (canUseNativeShare()) {
    try {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url,
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
      return false;
    }
  }

  // Fallback to copy
  return copyToClipboard(content.text + (content.url ? `\n${content.url}` : ""));
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
