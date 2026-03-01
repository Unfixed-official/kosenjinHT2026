import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import ProjectsScreen from './ProjectsScreen';
import CreateProjectScreen from './CreateProjectScreen';
import ApplicationsScreen from './ApplicationsScreen';
import ProfileScreen from './ProfileScreen';
import DashboardScreen from './DashboardScreen';
import ProjectDetailScreen from './ProjectDetailScreen';
import WorkspaceScreen from './WorkspaceScreen';
import { QuintetLogoWide, QuintetLogoSquare } from '../ui/QuintetLogo';
import { Feather } from '@expo/vector-icons';

const sections = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'home' },
  { key: 'Projects', label: 'Projects', icon: 'folder' },
  { key: 'Create', label: 'Create', icon: 'plus-square' },
  { key: 'Applications', label: 'Applications', icon: 'inbox' },
  { key: 'Profile', label: 'Profile', icon: 'user' }
];

const baseBg = '#0f1115';
const panelBg = '#181b22';
const border = '#2a2f3b';
const text = '#f1f5f9';
const muted = '#94a3b8';
const activeBg = '#232938';

export default function MainShellScreen() {
  const [activeSection, setActiveSection] = useState({ name: 'Dashboard', params: null });
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const collapseTimerRef = useRef(null);
  const sidebarWidth = useRef(new Animated.Value(74)).current;

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const expandSidebar = () => {
    clearCollapseTimer();
    setSidebarExpanded(true);
  };

  const collapseSidebarDeferred = () => {
    clearCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      setSidebarExpanded(false);
    }, 140);
  };

  useEffect(() => {
    Animated.timing(sidebarWidth, {
      toValue: sidebarExpanded ? 220 : 74,
      duration: 180,
      useNativeDriver: false
    }).start();
  }, [sidebarExpanded, sidebarWidth]);

  useEffect(() => {
    return () => clearCollapseTimer();
  }, []);

  const CurrentSection = useMemo(() => {
    switch (activeSection.name) {
      case 'Dashboard':
        return <DashboardScreen setActiveSection={setActiveSection} />;
      case 'Create':
        return <CreateProjectScreen onProjectCreated={() => setActiveSection({ name: 'Dashboard' })} />;
      case 'Applications':
        return <ApplicationsScreen setActiveSection={setActiveSection} />;
      case 'Profile':
        return <ProfileScreen />;
      case 'ProjectDetail':
        return <ProjectDetailScreen route={{ params: activeSection.params }} setActiveSection={setActiveSection} />;
      case 'Workspace':
        return <WorkspaceScreen route={{ params: activeSection.params }} setActiveSection={setActiveSection} />;
      case 'Projects':
      default:
        return <ProjectsScreen setActiveSection={setActiveSection} />;
    }
  }, [activeSection]);

  return (
    <View style={{ flex: 1, backgroundColor: baseBg }}>
      <View
        style={{
          flex: 1,
          backgroundColor: panelBg,
          borderWidth: 1,
          borderColor: border,
          overflow: 'hidden'
        }}
      >
        <View
          style={{
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: border,
            backgroundColor: panelBg,
            paddingHorizontal: 14
          }}
        >
          <View style={{ flex: 1, paddingLeft: 8 }}>
            <QuintetLogoWide width={180} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: text, fontSize: 22 }}>
              {activeSection.name === 'Dashboard' ? 'ホーム' :
                activeSection.name === 'Projects' ? '探す' :
                  activeSection.name === 'Create' ? '作成' :
                    activeSection.name === 'ProjectDetail' ? 'プロジェクト詳細' :
                      activeSection.name === 'Workspace' ? 'ワークスペース' :
                        activeSection.name === 'Applications' ? '申請' :
                          activeSection.name === 'Profile' ? 'プロフィール' : activeSection.name}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
        </View>

        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Animated.View
            onMouseEnter={expandSidebar}
            onMouseLeave={collapseSidebarDeferred}
            style={{
              width: sidebarWidth,
              borderRightWidth: 1,
              borderRightColor: border,
              backgroundColor: panelBg,
              paddingVertical: 10,
              paddingHorizontal: 8
            }}
          >
            <View style={{ height: 42, marginBottom: 16, alignItems: 'center', justifyContent: 'center' }}>
              <QuintetLogoSquare size={32} color="#f1f5f9" />
            </View>
            {sections.map((section) => {
              const active = activeSection.name === section.key;
              return (
                <Pressable
                  key={section.key}
                  onPress={() => setActiveSection({ name: section.key })}
                  onHoverIn={expandSidebar}
                  style={{
                    height: 42,
                    borderRadius: 10,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    backgroundColor: active ? activeBg : 'transparent'
                  }}
                >
                  <Feather name={section.icon} size={22} color={active ? text : muted} />
                  {sidebarExpanded ? (
                    <Text style={{ color: active ? text : muted, marginLeft: 10, fontWeight: active ? '700' : '500' }}>
                      {section.label}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </Animated.View>

          <View style={{ flex: 1 }}>{CurrentSection}</View>
        </View>
      </View>
    </View>
  );
}
