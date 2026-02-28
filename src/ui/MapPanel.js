import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const mapAsset = require('../image/map.svg');

export default function MapPanel({
  pins = [],
  selectable = false,
  onSelect,
  onPinPress,
  selectedPinId,
  showLabelsAtZoom = 1.8,
  height = 300,
  fullScreen = false
}) {
  const [zoom, setZoom] = useState(1);
  const [frameSize, setFrameSize] = useState({ width: 0, height });

  const canvasWidth = useMemo(() => Math.max(200, frameSize.width * zoom), [frameSize.width, zoom]);
  const canvasHeight = useMemo(() => Math.max(150, frameSize.height * zoom), [frameSize.height, zoom]);

  const onPressMap = (event) => {
    if (!selectable || !onSelect) return;
    const x = event.nativeEvent.locationX / canvasWidth;
    const y = event.nativeEvent.locationY / canvasHeight;
    const nx = Math.max(0, Math.min(1, x));
    const ny = Math.max(0, Math.min(1, y));
    onSelect({ x: nx, y: ny });
  };

  const zoomIn = () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)));

  return (
    <View style={{ flex: fullScreen ? 1 : undefined }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: '#334155' }}>地図（ピン選択可能）</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={zoomOut} style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#dbeafe', borderRadius: 8 }}>
            <Text style={{ color: '#334155' }}>-</Text>
          </TouchableOpacity>
          <Text style={{ color: '#334155', minWidth: 42, textAlign: 'center' }}>{Math.round(zoom * 100)}%</Text>
          <TouchableOpacity onPress={zoomIn} style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#dbeafe', borderRadius: 8 }}>
            <Text style={{ color: '#334155' }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        onLayout={(event) => {
          const { width, height: layoutHeight } = event.nativeEvent.layout;
          setFrameSize({ width, height: layoutHeight || height });
        }}
        style={{
          flex: fullScreen ? 1 : undefined,
          height: fullScreen ? undefined : height,
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#c7d2fe',
          backgroundColor: '#eef6ff'
        }}
      >
        <ScrollView horizontal contentContainerStyle={{ minWidth: '100%' }}>
          <ScrollView contentContainerStyle={{ minHeight: '100%' }}>
            <Pressable onPress={onPressMap} style={{ width: canvasWidth, height: canvasHeight }}>
              <Image source={mapAsset} resizeMode="stretch" style={{ width: canvasWidth, height: canvasHeight }} />

              {pins.map((pin) => {
                const left = (pin.x || 0) * canvasWidth;
                const top = (pin.y || 0) * canvasHeight;
                const isSelected = selectedPinId === pin.id;
                return (
                  <Pressable
                    key={pin.id}
                    onPress={() => onPinPress?.(pin)}
                    style={{ position: 'absolute', left, top, alignItems: 'center' }}
                  >
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: isSelected ? '#4f46e5' : '#38bdf8',
                        borderWidth: 2,
                        borderColor: '#ffffff'
                      }}
                    />
                    {typeof pin.count === 'number' ? (
                      <View
                        style={{
                          position: 'absolute',
                          top: -10,
                          right: -14,
                          backgroundColor: '#4f46e5',
                          borderRadius: 10,
                          paddingHorizontal: 6,
                          paddingVertical: 1,
                          borderWidth: 1,
                          borderColor: '#ffffff'
                        }}
                      >
                        <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>{pin.count}</Text>
                      </View>
                    ) : null}
                    {zoom >= showLabelsAtZoom ? (
                      <View style={{ marginTop: 4, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#c7d2fe', maxWidth: 240 }}>
                        <Text numberOfLines={1} style={{ color: '#1f2a44', fontWeight: '700' }}>
                          {pin.title || 'Untitled'}
                        </Text>
                        {pin.rolesText ? (
                          <Text numberOfLines={1} style={{ color: '#64748b', marginTop: 2 }}>
                            {pin.rolesText}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </Pressable>
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
}
