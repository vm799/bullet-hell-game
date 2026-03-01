/**
 * Result Screen
 * Displays match results and rewards
 */

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type ResultScreenProps = {
  navigation: StackNavigationProp<any>;
  route: any;
};

const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
  const { matchResult } = route.params || {};
  const [isWin, setIsWin] = useState(false);
  const [rewards, setRewards] = useState(0);

  useEffect(() => {
    // Calculate if player won (placeholder - would use actual player ID)
    const playerWon = matchResult?.winner === 'p1';
    setIsWin(playerWon);
    setRewards(playerWon ? 100 : 10);
  }, [matchResult]);

  const handlePlayAgain = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.resultCard}>
        <Text style={[styles.result, isWin ? styles.win : styles.loss]}>
          {isWin ? 'VICTORY!' : 'DEFEAT'}
        </Text>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={styles.score}>
              {matchResult?.p1Score || 0}
            </Text>
          </View>
          <Text style={styles.vs}>VS</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Opponent</Text>
            <Text style={styles.score}>
              {matchResult?.p2Score || 0}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsTitle}>REWARDS</Text>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardLabel}>Coins Earned</Text>
            <Text style={styles.rewardValue}>+{rewards}</Text>
          </View>
          {isWin && (
            <>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardLabel}>Rating</Text>
                <Text style={styles.rewardValue}>+32</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardLabel}>Win Streak</Text>
                <Text style={styles.rewardValue}>+1</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.duration}>
          <Text style={styles.durationText}>
            Duration: {matchResult?.duration || 0}s
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.playAgainButton} onPress={handlePlayAgain}>
        <Text style={styles.playAgainText}>PLAY AGAIN</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  resultCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 30,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  result: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 2,
  },
  win: {
    color: '#0f0',
  },
  loss: {
    color: '#ff4444',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  scoreBox: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  vs: {
    color: '#666',
    fontSize: 18,
    marginHorizontal: 10,
  },
  divider: {
    height: 2,
    backgroundColor: '#16213e',
    marginVertical: 20,
  },
  rewardsContainer: {
    marginBottom: 20,
  },
  rewardsTitle: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  rewardLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  rewardValue: {
    color: '#0f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  duration: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#16213e',
  },
  durationText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: '#00d4ff',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  playAgainText: {
    color: '#0f0f0f',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default ResultScreen;
