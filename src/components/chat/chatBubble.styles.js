// ─── Unified styles re-export ─────────────────────────
// Merges bubbleStyles and tableStyles into the single `s` object
// that all sub-components import from this file.
import { bubbleStyles } from './chatBubble.styles.bubble.js';
import { tableStyles }  from './chatBubble.styles.table.js';

export const s = { ...bubbleStyles, ...tableStyles };
