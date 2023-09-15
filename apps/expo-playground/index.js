/* eslint-disable import/imports-first */

import 'fast-text-encoding';
import 'react-native-url-polyfill/auto';

import { Buffer } from '@craftzdog/react-native-buffer';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';

global.Buffer = Buffer;
process.version = 'v16.0.0';
polyfillWebCrypto();

import 'expo-router/entry';
