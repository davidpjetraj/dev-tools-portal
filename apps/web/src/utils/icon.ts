/**
 * Detects if a string is an image URL (starts with http/https).
 */
export function isUrl(str: string | null | undefined): boolean {
    if (!str) return false;
    return /^https?:\/\//.test(str);
}
