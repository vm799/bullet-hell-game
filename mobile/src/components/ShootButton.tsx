/**
 * ShootButton Component
 * Tap-to-shoot button for firing bullets
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ShootButtonProps {
  onShootStart: () => void;
  onShootEnd: () => void;
  size?: number;
  disabled?: boolean;
}

const ShootButton: React.FC<ShootButtonProps> = ({
  onShootStart,
  onShootEnd,
  size = 80,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        disabled && styles.disabled,
      ]}
      onPressIn={onShootStart}
      onPressOut={onShootEnd}
      activeOpacity={0.6}
      disabled={disabled}
    >
      <Text style={styles.label}>FIRE</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff3333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff6666',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default ShootButton;
