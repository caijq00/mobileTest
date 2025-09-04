import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useBookingData } from '../hooks/useBookingData';
import { Segment } from '../types/booking.types';
import { ExpiryHandler } from '../utils/expiryHandler';
import { ErrorHandler } from '../utils/errorHandler';

const BookingList: React.FC = () => {
  const { data, isLoading, error, isFromCache, refresh, clearCache } = useBookingData(true);

  useEffect(() => {
    console.log('BookingList: 页面出现，当前数据:', JSON.stringify(data, null, 2));
  }, [data]);

  const handleRefresh = async () => {
    try {
      await refresh();
    } catch (err) {
      Alert.alert('刷新失败', ErrorHandler.getErrorMessage(ErrorHandler.handleError(err)));
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      '清除缓存',
      '确定要清除所有缓存数据吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              await clearCache();
            } catch (err) {
              Alert.alert('清除缓存失败', ErrorHandler.getErrorMessage(ErrorHandler.handleError(err)));
            }
          }
        }
      ]
    );
  };

  const renderSegmentItem = ({ item }: { item: Segment }) => (
    <View style={styles.segmentItem}>
      <Text style={styles.segmentId}>航段 {item.id}</Text>
      <View style={styles.routeContainer}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationCode}>{item.originAndDestinationPair.origin.code}</Text>
          <Text style={styles.locationName}>{item.originAndDestinationPair.origin.displayName}</Text>
          <Text style={styles.cityName}>{item.originAndDestinationPair.originCity}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.locationContainer}>
          <Text style={styles.locationCode}>{item.originAndDestinationPair.destination.code}</Text>
          <Text style={styles.locationName}>{item.originAndDestinationPair.destination.displayName}</Text>
          <Text style={styles.cityName}>{item.originAndDestinationPair.destinationCity}</Text>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => {
    if (!data) return null;

    const expiryInfo = ExpiryHandler.checkDataExpiry(data);
    const expiryText = ExpiryHandler.formatTimeUntilExpiry(expiryInfo.timeUntilExpiry);

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.title}>预订信息</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>船只参考:</Text>
          <Text style={styles.value}>{data.shipReference}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>船只Token:</Text>
          <Text style={styles.value}>{data.shipToken}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>可出票检查:</Text>
          <Text style={styles.value}>{data.canIssueTicketChecking ? '是' : '否'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>持续时间:</Text>
          <Text style={styles.value}>{data.duration} 分钟</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>数据状态:</Text>
          <Text style={[styles.value, expiryInfo.isExpired ? styles.expired : styles.valid]}>
            {expiryText}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>数据来源:</Text>
          <Text style={styles.value}>{isFromCache ? '缓存' : '网络'}</Text>
        </View>
        <Text style={styles.segmentsTitle}>航段信息</Text>
      </View>
    );
  };

  if (isLoading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{ErrorHandler.getErrorMessage(error)}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.segments || []}
        renderItem={renderSegmentItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRefresh}>
          <Text style={styles.buttonText}>刷新数据</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClearCache}>
          <Text style={styles.buttonText}>清除缓存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  expired: {
    color: '#e74c3c',
  },
  valid: {
    color: '#27ae60',
  },
  segmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  segmentItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  segmentId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flex: 1,
    alignItems: 'center',
  },
  locationCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  locationName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cityName: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: '#0066cc',
    marginHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingList;