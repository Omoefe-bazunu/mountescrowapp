import React from "react";
import { Text } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { Fonts } from "../../constants/Fonts";

export function AppText({
  children,
  style,
  variant = "text", // Allows you to choose color key like 'primary' or 'textSecondary'
  ...props
}) {
  const { colors } = useTheme();

  return (
    <Text
      {...props}
      allowFontScaling={false} // Globally disables system font scaling [cite: 55]
      style={[
        {
          // Uses the locked sans-serif font from your constants [cite: 28]
          fontFamily: Fonts.body,
          // Automatically sets the color based on Light/Dark mode [cite: 9, 10, 19]
          color: colors[variant] || colors.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
