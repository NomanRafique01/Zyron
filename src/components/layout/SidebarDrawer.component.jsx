/**
 * SidebarDrawer.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Left-side conversation history sidebar drawer for Zyron.
 *
 * Renders the sliding sidebar overlay with:
 *   • Header and close button
 *   • New Conversation button
 *   • Search input to filter history
 *   • Grouped conversation list (Today / Yesterday / Previous Chats)
 *   • Footer workspace branding block
 *
 * Animated slide-in controlled by parent via sidebarAnim Animated.Value.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import s from '../../styles/app.styles';
import C from '../../config/colors.config';
import { groupConversationsByDate } from '../../config/appConfig';
import { PlusIcon, TrashIcon, SidebarIcon } from '../shared/Icons';

/**
 * SidebarDrawer
 *
 * @param {boolean}           sidebarOpen
 * @param {function}          onClose
 * @param {Animated.Value}    sidebarAnim       — translateX value (-280 → 0)
 * @param {array}             conversations
 * @param {string|null}       currentSessionId
 * @param {string}            searchQuery
 * @param {function}          setSearchQuery
 * @param {function}          onSelectConversation
 * @param {function}          onDeleteSession
 * @param {function}          onNewChat
 */
export default function SidebarDrawer({
  sidebarOpen,
  onClose,
  sidebarAnim,
  conversations,
  currentSessionId,
  searchQuery,
  setSearchQuery,
  onSelectConversation,
  onDeleteSession,
  onNewChat,
}) {
  const insets = useSafeAreaInsets();

  if (!sidebarOpen) return null;

  // Filter history based on search query
  const filteredConversations = conversations.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered history
  const { today, yesterday, older } = groupConversationsByDate(filteredConversations);

  const renderHistoryItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        s.historyItem,
        currentSessionId === item.id && s.historyItemActive
      ]}
      onPress={() => onSelectConversation(item.id)}
      activeOpacity={0.75}
    >
      <View style={s.historyItemLeft}>
        <View style={[s.historyDot, { backgroundColor: currentSessionId === item.id ? C.purple : '#4E4E61' }]} />
        <Text
          style={[
            s.historyItemText,
            currentSessionId === item.id && s.historyItemTextActive
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </View>
      <TouchableOpacity
        style={s.historyDeleteBtn}
        onPress={(e) => onDeleteSession(item.id, e)}
        activeOpacity={0.6}
      >
        <TrashIcon color="#5E5E72" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity
      style={s.sidebarScrim}
      activeOpacity={1}
      onPress={onClose}
    >
      <Animated.View
        style={[
          s.sidebarDrawer,
          { transform: [{ translateX: sidebarAnim }], marginTop: insets.top + 80, marginBottom: 0 }
        ]}
        onStartShouldSetResponder={() => true}
      >
        {/* Header */}
        <View style={[s.sidebarHeader, { paddingTop: 14 }]}>
          <Text style={s.sidebarTitle}>ZyronChats</Text>
          <TouchableOpacity
            style={s.sidebarCloseBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <SidebarIcon color="#8A8A9D" />
          </TouchableOpacity>
        </View>

        {/* New Chat trigger */}
        <TouchableOpacity
          style={s.newChatBtn}
          onPress={onNewChat}
          activeOpacity={0.8}
        >
          <PlusIcon color="#FFFFFF" />
          <Text style={s.newChatBtnText}>New Conversation</Text>
        </TouchableOpacity>

        {/* Premium search bar */}
        <View style={s.searchContainer}>
          <TextInput
            style={s.searchInput}
            placeholder="Search history..."
            placeholderTextColor="#5E5E72"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* List timeline-grouped conversations */}
        <ScrollView style={s.sidebarScroll} showsVerticalScrollIndicator={false}>
          {filteredConversations.length === 0 ? (
            <Text style={s.noHistoryText}>
              {conversations.length === 0 ? 'No chat history found.' : 'No matching results.'}
            </Text>
          ) : (
            <View style={{ paddingBottom: 20 }}>
              {today.length > 0 && (
                <View>
                  <Text style={s.timeframeHeader}>Today</Text>
                  {today.map(renderHistoryItem)}
                </View>
              )}

              {yesterday.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={s.timeframeHeader}>Yesterday</Text>
                  {yesterday.map(renderHistoryItem)}
                </View>
              )}

              {older.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={s.timeframeHeader}>Previous Chats</Text>
                  {older.map(renderHistoryItem)}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Sidebar bottom workspace block */}
        <View style={[s.sidebarFooter, { paddingBottom: Math.max(insets.bottom + 8, 0) }]}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={s.sidebarFooterLogo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={s.sidebarFooterTitle}>ZyronWorkspace</Text>
            <Text style={s.sidebarFooterSub}>Agent Coordination</Text>
          </View>
          <View style={s.activeIndicator} />
        </View>

      </Animated.View>
    </TouchableOpacity>
  );
}
