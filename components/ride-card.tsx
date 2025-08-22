import COLORS from '@/constants/color';
import FONTS from '@/constants/fonts';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface RideCardProps {
  from: string;
  to: string;
  dateTime: string;
  driver: string;
  carSeats: number;
  paymentStatus: 'Paid' | 'Unpaid';
  mapUrl: string;
}

const RideCard: React.FC<RideCardProps> = ({
  from,
  to,
  dateTime,
  driver,
  carSeats,
  paymentStatus,
  mapUrl,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={{ uri: mapUrl }} style={styles.map} />
        <View>
          <Text style={styles.locationText}>➤ {from}</Text>
          <Text style={styles.locationText}>📍 {to}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>Date & Time</Text>
        <Text style={styles.valueText}>{dateTime}</Text>

        <Text style={styles.detailText}>Driver</Text>
        <Text style={styles.valueText}>{driver}</Text>

        <Text style={styles.detailText}>Car seats</Text>
        <Text style={styles.valueText}>{carSeats}</Text>

        <Text style={styles.detailText}>Payment Status</Text>
        <Text style={[styles.valueText, { color: paymentStatus === 'Paid' ? 'green' : 'red' }]}>
          {paymentStatus}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 12,
    margin: 10,

  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  map: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  locationText: {
    fontSize: FONTS.size.small,
    marginBottom: 2,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailText: {
    width: '45%',
       fontSize: FONTS.size.small,
    color: '#555',
    
  },
  valueText: {
    width: '45%',
    fontSize: FONTS.size.small,
    fontWeight: '600',
    // marginBottom: 8,
   textAlign: 'right' 
  },
});

export default RideCard;
