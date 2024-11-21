/* import { Stack } from "expo-router/stack";

export default function Layout() {
  return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
  );
}
 */
import { Stack } from "expo-router/stack";
import { AppProvider } from "../context";

export default function Layout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AppProvider>
  );
}