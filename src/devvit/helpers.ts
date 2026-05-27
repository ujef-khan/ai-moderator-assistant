/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * src/devvit/helpers.ts
 * Utility Helper Functions for Devvit Reddit Integration.
 */

/**
 * Checks if a string contains known spam link patterns directly on the client.
 * Pre-evaluates before calling complex LLM endpoints if latency is a constraint.
 */
export function isSuspiciousText(text: string): boolean {
  const lowercase = text.toLowerCase();
  const sketchKeywords = [
    'free-crypto', 'earn-quick-cash', 'claim-crypto-airdrop', 
    'giftcard-generators', 'fastmoneyhack', 'steam-gift-for-free',
    'paypals-fast-claim'
  ];
  
  if (lowercase.includes('http') || lowercase.includes('www.') || lowercase.includes('.com')) {
    return sketchKeywords.some(keyword => lowercase.includes(keyword));
  }
  return false;
}

/**
 * Normalizes scores from diverse telemetry feeds to evaluate user reputation multipliers.
 */
export function calculateKarmaScoreModifier(subredditKarma: number, warningCount: number): number {
  let score = 100;
  
  // High warnings discount user standard standing heavily
  score -= (warningCount * 30);
  
  // Add direct premium weighting for long-term positive contributors
  if (subredditKarma > 500) {
    score += 20;
  } else if (subredditKarma < 0) {
    score -= 15;
  }
  
  return Math.max(-100, Math.min(100, score));
}
