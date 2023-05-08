import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function Earn() {
  return (
    <View>
      <Link href="/">Go To Home</Link>
      <Link href="/swap">Go To Swap</Link>
    </View>
  );
}
