import { Appearance } from "react-native";

export const getColorScheme = () => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === "light";
};
