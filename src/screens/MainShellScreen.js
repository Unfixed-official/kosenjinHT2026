import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import ProjectsScreen from './ProjectsScreen';
import CreateProjectScreen from './CreateProjectScreen';
import ApplicationsScreen from './ApplicationsScreen';
import ProfileScreen from './ProfileScreen';

const sections = [
  { key: 'Projects', label: 'Projects', icon: '📁' },
  { key: 'Create', label: 'Create', icon: '➕' },
  { key: 'Applications', label: 'Applications', icon: '📥' },
  { key: 'Profile', label: 'Profile', icon: '👤' }
];

const baseBg = '#0f1115';
const panelBg = '#181b22';
const border = '#2a2f3b';
const text = '#f1f5f9';
const muted = '#94a3b8';
const activeBg = '#232938';

export default function MainShellScreen({ navigation }) {
  const [activeSection, setActiveSection] = useState('Projects');
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
    switch (activeSection) {
      case 'Create':
        return <CreateProjectScreen />;
      case 'Applications':
        return <ApplicationsScreen />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Projects':
      default:
        return <ProjectsScreen navigation={navigation} />;
    }
  }, [activeSection, navigation]);

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
          <View style={{ flex: 1 }}>
            <Text style={{ color: text, fontSize: 24 }}>Quintet Project</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: text, fontSize: 22 }}>{activeSection}</Text>
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
            {sections.map((section) => {
              const active = activeSection === section.key;
              return (
                <Pressable
                  key={section.key}
                  onPress={() => setActiveSection(section.key)}
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
                  <Text style={{ fontSize: 18 }}>{section.icon}</Text>
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
