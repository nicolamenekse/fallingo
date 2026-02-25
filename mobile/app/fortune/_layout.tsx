import { Stack } from 'expo-router';

export default function FortuneLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="coffee" />
      <Stack.Screen name="palm" />
      <Stack.Screen name="tarot" />
      <Stack.Screen name="horoscope" />
      <Stack.Screen name="result" />
      <Stack.Screen name="premium" />
    </Stack>
  );
}
