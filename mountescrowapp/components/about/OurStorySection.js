import { View, Text, StyleSheet, ImageBackground } from "react-native";

export default function OurStory() {
  return (
    <ImageBackground
      source={{
        uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FourStoryBgImage.jpg?alt=media&token=e02be423-c968-45a8-b404-59cbf071e050",
      }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.title}>OUR STORY</Text>
        <View style={styles.textContainer}>
          <Text style={styles.paragraph}>
            Mountescrow was founded with a bold vision: to transform digital
            transactions into a secure, transparent, and empowering ecosystem
            for buyers and sellers alike. We understand the hurdles of online
            commerce—fears of fraud, distrust in unfamiliar parties, and the
            need for seamless payment safety. This drove us to create a solution
            that fosters confidence and eliminates uncertainty in every deal.
          </Text>
          <Text style={[styles.paragraph, styles.marginTop]}>
            Mountescrow acts as a steadfast partner, ensuring funds are
            protected until transaction terms are met. Fostering collaboration
            and trust between parties. Beyond single transactions, we are
            building a future where trust defines commerce. Our innovative
            milestone-based payments streamline project workflows, while our
            multi-party transaction services simplify even the most complex
            deals.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 64, backgroundColor: "#1E40AF" },
  content: { alignItems: "center", paddingHorizontal: 16 },
  title: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 16,
  },
  textContainer: { maxWidth: 1024, width: "100%" },
  paragraph: { color: "#fff", fontSize: 18, textAlign: "center" },
  marginTop: { marginTop: 16 },
});
