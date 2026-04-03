import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type PlaceholderScreenProps = {
  title: string;
  routeName: string;
};

export function PlaceholderScreen({ title, routeName }: PlaceholderScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText style={styles.subtitle}>Placeholder screen</ThemedText>
      <ThemedText type="defaultSemiBold">Route: /{routeName}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  subtitle: {
    fontSize: 18,
  },
});
