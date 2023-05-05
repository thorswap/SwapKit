/* eslint-disable import/imports-first */

import 'react-native-get-random-values';
import '@ethersproject/shims';
import 'fast-text-encoding';

import { Buffer } from '@craftzdog/react-native-buffer';

global.Buffer = Buffer;
process.version = 'v16.0.0';

// eslint-disable-next-line import/no-deprecated
import 'expo-router/entry';
