import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.languagelearning',
  appPath: 'app',
  appResourcesPath: 'app/App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none'
  },
  ios: {
    discardUncaughtJsExceptions: false
  }
} as NativeScriptConfig;