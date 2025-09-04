import { BookingDataManager } from '../managers/bookingDataManager';

export async function testDataManager() {
  console.log('=== 开始测试 BookingDataManager ===');
  
  const dataManager = BookingDataManager.getInstance();

  try {
    console.log('\n1. 测试首次获取数据:');
    const result1 = await dataManager.getBookingData();
    console.log('数据获取结果:', {
      hasData: !!result1.data,
      isFromCache: result1.isFromCache,
      hasError: !!result1.error,
      shipReference: result1.data?.shipReference
    });

    if (result1.data) {
      console.log('\n2. 测试数据过期检查:');
      const expiryInfo = dataManager.getDataExpiryInfo(result1.data);
      console.log('过期信息:', expiryInfo);

      console.log('\n3. 测试从缓存获取数据:');
      const result2 = await dataManager.getBookingData();
      console.log('缓存数据获取结果:', {
        hasData: !!result2.data,
        isFromCache: result2.isFromCache,
        isSameData: result1.data?.shipReference === result2.data?.shipReference
      });

      console.log('\n4. 测试强制刷新:');
      const result3 = await dataManager.refreshBookingData();
      console.log('刷新结果:', {
        hasData: !!result3.data,
        isFromCache: result3.isFromCache,
        shipReference: result3.data?.shipReference
      });
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }

  console.log('\n=== 测试完成 ===');
}