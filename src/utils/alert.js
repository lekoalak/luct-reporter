import { Platform, Alert } from 'react-native';

export const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n\n${message || ''}`);
      if (confirmed) {
        const confirmBtn = buttons.find(b => b.style === 'destructive' || b.text === 'Logout' || b.text === 'Delete' || b.text === 'OK');
        if (confirmBtn?.onPress) confirmBtn.onPress();
      }
    } else {
      window.alert(`${title}${message ? '\n\n' + message : ''}`);
      if (buttons && buttons[0]?.onPress) buttons[0].onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};