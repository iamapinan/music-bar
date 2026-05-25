import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlayerScreen } from './src/presentation/screens/player-screen';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.container}>
      <PlayerScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
