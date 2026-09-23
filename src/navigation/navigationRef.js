import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { api } from '../api/client';

export const navigationRef = createNavigationContainerRef();

// Used by the Profile screen to go back to the login screen from deep inside the tabs.
export function resetToLogin() {
  api.logout();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
  }
}
