// ─── Barrel export — src/components/index.js ─────────────────────────────────
// Grouped by domain for easy discovery.

// agent
export { default as AgentBadge } from './agent/AgentBadge.component.jsx';
export { default as AgentPanel } from './agent/AgentPanel.component.jsx';
export { default as AgentCoordinationTab } from './agent/AgentCoordinationTab.component.jsx';

// chat
export { default as ChatBubble } from './chat/ChatBubble.component.jsx';
export { default as ChatMessageList } from './chat/ChatMessageList.component.jsx';
export { default as SyntaxCode } from './chat/SyntaxCode.component.jsx';

// input
export { default as InputBar } from './input/InputBar.component.jsx';

// layout
export { default as Header } from './layout/Header.component.jsx';
export { default as SidebarDrawer } from './layout/SidebarDrawer.component.jsx';

// math
export { default as MathFormula } from './math/MathFormula.component.jsx';

// modals
export { default as ConfirmDialog } from './modals/ConfirmDialog.modal.jsx';
export { default as SetupGuideModal } from './modals/SetupGuideModal.modal.jsx';

// shared
export * from './shared/Icons.js';
export { default as PasswordField } from './shared/PasswordField.component.jsx';
export { default as WelcomeLogo } from './shared/WelcomeLogo.component.jsx';
