// constants/Fonts.js
import { Platform } from "react-native";

export const Fonts = {
  body: Platform.select({
    ios: "System",
    android: "sans-serif",
    web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: "sans-serif",
  }),
  headline: Platform.select({
    ios: "System",
    android: "sans-serif",
    web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: "sans-serif",
  }),
  code: "monospace",
};
