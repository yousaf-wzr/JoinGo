// components/RequestCard.tsx
import COLORS from "@/constants/color";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  item: any;
  onPressAccept?: () => void;
  onPressOpen?: () => void;
};

const RequestCard: React.FC<Props> = ({ item, onPressAccept, onPressOpen }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPressOpen}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: item.avatar || `https://randomuser.me/api/portraits/men/${10 + (item.id % 70)}.jpg` }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.passengerName}</Text>
          <Text style={styles.route} numberOfLines={1}>
            {item.pickup} → {item.dropoff}
          </Text>
          <Text style={styles.meta}>~ {item.distanceKm?.toFixed?.(1) || item.distanceKm} km · {item.eta} min</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.price}>₨{item.price}</Text>
          {onPressAccept ? (
            <TouchableOpacity style={styles.acceptBtn} onPress={onPressAccept}>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RequestCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.black },
  route: { fontSize: 13, color: COLORS.gray, marginTop: 2, maxWidth: 220 },
  meta: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  price: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  acceptBtn: {
    marginTop: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptText: { color: COLORS.white, fontWeight: "600" },
});
