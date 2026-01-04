import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/ui/Button";
import { useTheme } from "../../contexts/ThemeContext";
import { AppText } from "../../components/ui/AppText";

// Import Reanimated components and hooks
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { ShieldCheck, Lock, Bell } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Welcome to Mountescrow",
    description:
      "Experience seamless and secure transactions with our escrow platform built for peace of mind in every deal.",
    icon: <ShieldCheck size={80} color="#FFFFFF" />,
    backgroundColor: "#010e5a",
  },
  {
    id: "2",
    title: "Protect Your Payments",
    description:
      "Funds are held securely until both parties meet agreed terms. No more payment disputes or delivery worries.",
    icon: <Lock size={80} color="#FFFFFF" />,
    backgroundColor: "#0066ff",
  },
  {
    id: "3",
    title: "Instant Notifications",
    description:
      "Stay updated on transaction progress, from payment deposits to approvals and releases, all in real time.",
    icon: <Bell size={80} color="#FFFFFF" />,
    backgroundColor: "#f97316",
  },
];

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const scrollOffset = useSharedValue(0);
  const footerY = useSharedValue(height);

  React.useEffect(() => {
    footerY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const footerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: footerY.value }],
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollOffset.value,
      slides.map((_, i) => i * width),
      slides.map((slide) => slide.backgroundColor)
    );

    return {
      backgroundColor: backgroundColor,
    };
  });

  const onScroll = (event) => {
    scrollOffset.value = event.nativeEvent.contentOffset.x;
  };

  const onMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    runOnJS(setCurrentIndex)(index);
  };

  const navigateToNextScreen = () => {
    router.replace("/(auth)/login");
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      footerY.value = withTiming(height, { duration: 300 }, (isFinished) => {
        if (isFinished) {
          runOnJS(navigateToNextScreen)();
        }
      });
    }
  };

  const handleSkip = () => {
    footerY.value = withTiming(height, { duration: 300 }, (isFinished) => {
      if (isFinished) {
        runOnJS(navigateToNextScreen)();
      }
    });
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>{item.icon}</View>
        <AppText allowFontScaling={false} style={[styles.title]}>
          {item.title}
        </AppText>
        <AppText allowFontScaling={false} style={[styles.description]}>
          {item.description}
        </AppText>
      </View>
    </View>
  );

  const Indicator = ({ index }) => {
    const activeWidth = 24;
    const inactiveWidth = 8;
    // We use primary color for active indicator in the white footer
    const activeColor = colors.primary;
    const inactiveColor = colors.border;

    const indicatorAnimatedStyle = useAnimatedStyle(() => {
      const isCurrent = index === currentIndex;
      return {
        width: withTiming(isCurrent ? activeWidth : inactiveWidth, {
          duration: 200,
        }),
        backgroundColor: withTiming(isCurrent ? activeColor : inactiveColor, {
          duration: 200,
        }),
      };
    });

    return <Animated.View style={[styles.indicator, indicatorAnimatedStyle]} />;
  };

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      <AnimatedFlashList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={width}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
      />

      <Animated.View
        style={[
          styles.footer,
          footerAnimatedStyle,
          { backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <Indicator key={index} index={index} />
          ))}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <AppText
              allowFontScaling={false}
              style={[styles.skipText, { color: colors.textSecondary }]}
            >
              Skip
            </AppText>
          </TouchableOpacity>

          <Button
            title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            variant="primary"
            style={styles.nextButton}
            // Ensure the text color is high-contrast (surface color) and uses your font
            textStyle={{
              color: colors.surface, // This will be white in most themes
              fontSize: 18,
            }}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height: height * 0.75,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    minWidth: 160,
  },
});
