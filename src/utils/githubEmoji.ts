import { emojify } from 'node-emoji';

// GitHub/gitmoji shortcodes that node-emoji doesn't include
const EXTRA_EMOJI: Record<string, string> = {
  pencil: '📝',
  adhesive_bandage: '🩹',
  monocle_face: '🧐',
  stethoscope: '🩺',
  safety_vest: '🦺',
  technologist: '🧑‍💻',
};

/**
 * Replace emoji shortcodes like :pencil: with Unicode emoji characters.
 * Uses node-emoji for comprehensive coverage, with a fallback map
 * for GitHub-specific shortcodes it doesn't include.
 */
export function replaceGithubEmoji(text: string): string {
  // First pass: replace shortcodes node-emoji doesn't know
  const patched = text.replace(/:([a-z0-9_+-]+):/g, (match, code) => {
    return EXTRA_EMOJI[code] ? EXTRA_EMOJI[code] : match;
  });
  // Second pass: let node-emoji handle everything else
  return emojify(patched);
}
