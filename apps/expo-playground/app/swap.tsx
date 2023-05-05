import React from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';

export default function Swap() {

  return (
    <View>


      <Link href="/">Go To Home</Link>
      <Link href="/earn">Go To Earn</Link>
    </View>
  );
}
