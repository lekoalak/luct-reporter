
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS, FONTS } from '../../config/theme';
import { Card, EmptyState, LoadingScreen, StarRating } from '../../components/UIComponents';
import { subscribeRatings, getAverageRating } from '../../services/attendanceService';
import { useAuth } from '../../hooks/useAuth';
import { showAlert } from '../../utils/alert';
import TopBar from '../../components/TopBar';

export default function LecturerRatingsScreen({ navigation }) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeRatings(user.uid, (data) => {
      setRatings(data);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  const avg = getAverageRating(ratings);
  const positive = ratings.filter(r => r.score >= 4).length;
  const neutral = ratings.filter(r => r.score === 3).length;
  const poor = ratings.filter(r => r.score <= 2).length;

  if (loading) return <LoadingScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
    <TopBar title="My Ratings" navigation={navigation} showBack={false} />
      <TopBar title="My Ratings" navigation={navigation} showBack={false} />

      <FlatList
        data={ratings}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            <View style={styles.avgBanner}>
              <Text style={styles.avgNum}>{avg || '—'}</Text>
              <StarRating value={Math.round(Number(avg))} size={30} />
              <Text style={styles.avgLabel}>
                {ratings.length} rating{ratings.length !== 1 ? 's' : ''} received
              </Text>
              {ratings.length > 0 && (
                <View style={styles.breakdown}>
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownCount, { color: COLORS.success }]}>{positive}</Text>
                    <Text style={styles.breakdownLabel}>👍 Positive</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownCount, { color: COLORS.warning }]}>{neutral}</Text>
                    <Text style={styles.breakdownLabel}>😐 Neutral</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownCount, { color: COLORS.error }]}>{poor}</Text>
                    <Text style={styles.breakdownLabel}>👎 Poor</Text>
                  </View>
                </View>
              )}
            </View>
            {ratings.length > 0 && (
              <Text style={styles.listTitle}>All Reviews</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <Card style={{ alignItems: 'center', padding: 30 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>⭐</Text>
            <Text style={{ fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.navy }}>
              No ratings yet
            </Text>
            <Text style={{ color: COLORS.gray, marginTop: 6, textAlign: 'center' }}>
              Students and PRL members can rate your lectures
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <View style={styles.ratingRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.raterRole?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.ratingMeta}>
                  <Text style={styles.raterRole}>
                    {item.raterRole?.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <StarRating value={item.score} size={14} />
                </View>
                {item.comment ? (
                  <Text style={styles.ratingComment}>{item.comment}</Text>
                ) : (
                  <Text style={styles.noComment}>No comment left</Text>
                )}
                <Text style={styles.ratingDate}>
                  {item.createdAt?.seconds
                    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-GB')
                    : ''}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avgBanner: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  avgNum: { fontSize: 56, fontWeight: '900', color: COLORS.white },
  avgLabel: { color: COLORS.gray, fontSize: FONTS.sizes.sm, marginTop: 4 },
  breakdown: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#003366',
    paddingTop: 16,
    width: '100%',
    justifyContent: 'space-around',
  },
  breakdownItem: { alignItems: 'center' },
  breakdownCount: { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  breakdownLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 2 },
  listTitle: {
    fontSize: FONTS.sizes.sm, fontWeight: '700',
    color: COLORS.gray, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 10,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#C9A84C', fontWeight: '800', fontSize: 16 },
  ratingMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  raterRole: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.navy },
  ratingComment: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, lineHeight: 20 },
  noComment: { fontSize: FONTS.sizes.xs, color: COLORS.gray, fontStyle: 'italic' },
  ratingDate: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 4 },
});