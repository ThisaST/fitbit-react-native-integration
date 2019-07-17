/** @format */

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import MainApp from './router';

if(__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
}
AppRegistry.registerComponent(appName, () => MainApp);
