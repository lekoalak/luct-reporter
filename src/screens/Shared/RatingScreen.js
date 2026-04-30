import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Alert,
} from 'react-native';
import { COLORS, FONTS } from '../../config/theme';
import {
  Card, SearchBar, StarRating, Button, EmptyState,
  Input, LoadingScreen, ScreenHeader,
} from '../../components/UIComponents';
import {
  submitRating, subscribeRatings, getAverageRating,
} from '../../services/attendanceService';
import { useAuth } from '../../hooks/useAuth';

export default function RatingScreen({ route }) {
  const { targetId, targetType, targetName } = route.params;
  const { user, userData } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myScore, setMyScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeRatings(targetId, (data) => {
      setRatings(data);
      const mine = data.find(r => r.raterId === user.uid);
      if (mine) { setMyScore(mine.score); setComment(mine.comment || ''); }
      setLoading(false);
    });
    return unsub;
  }, [targetId]);

  const handleSubmit = async () => {
    if (!myScore) return Alert.alert('Rating Required', 'Please select a star rating.');
    setSubmitting(true);
    try {
      await submitRating({
        targetId,
        targetType,
        raterId: user.uid,
        raterRole: userData.role,
        score: myScore,
        comment: comment.trim(),
      });
      Alert.alert('Success', 'Your rating has been submitted.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const avg = getAverageRating(ratings);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
      <ScreenHeader title="Ratings" subtitle={targetName} />

      <FlatList
        data={ratings}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            {/* Average Banner */}
            <View style={styles.avgBanner}>
              <Text style={styles.avgNum}>{avg}</Text>
              <StarRating value={Math.round(Number(avg))} size={32} />
              <Text style={styles.avgLabel}>{ratings.length} rating{ratings.length !== 1 ? 's' : ''}</Text>
            </View>

            {/* Submit Rating */}
            <Card style={{ marginBottom: 16 }}>
              <Text style={styles.rateTitle}>
                {ratings.find(r => r.raterId === user.uid) ? 'Update Your Rating' : 'Rate This'}
              </Text>
              <View style={{ alignItems: 'flex-start', marginVertical: 12 }}>
                <StarRating value={myScore} onRate={setMyScore} size={36} />
              </View>
              <Input
                label="Comment (optional)"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                placeholder="Share your thoughts..."
              />
              <Button
                title="Submit Rating"
                onPress={handleSubmit}
                loading={submitting}
                variant="secondary"
              />
            </Card>

            <Text style={styles.listTitle}>All Reviews</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="⭐" title="No reviews yet" message="Be the first to rate!" />
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <View style={styles.ratingRow}>
              <View style={styles.ratingAvatar}>
                <Text style={styles.ratingAvatarText}>{item.raterRole?.[0]?.toUpperCase() || '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.ratingMeta}>
                  <Text style={styles.raterRole}>{item.raterRole?.replace('_', ' ').toUpperCase()}</Text>
                  <StarRating value={item.score} size={14} />
                </View>
                {item.comment ? (
                  <Text style={styles.ratingComment}>{item.comment}</Text>
                ) : null}
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
  avgNum: { fontSize: 48, fontWeight: '900', color: COLORS.white },
  avgLabel: { color: COLORS.gray, fontSize: FONTS.sizes.sm, marginTop: 4 },

  rateTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.navy },
  listTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  ratingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingAvatarText: { color: COLORS.gold, fontWeight: '700', fontSize: 14 },
  ratingMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  raterRole: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.navy },
  ratingComment: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, lineHeight: 20 },
});
