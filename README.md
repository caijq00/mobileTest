# React Native Booking Data Manager

这是一个基于React Native的预订数据管理系统，包含完整的数据提供者、缓存层和UI展示。

## 项目结构

```
src/
├── components/          # UI组件
│   └── BookingList.tsx  # 预订列表页面
├── hooks/              # React Hooks
│   └── useBookingData.ts # 预订数据Hook
├── managers/           # 数据管理器
│   └── bookingDataManager.ts # 主数据管理器
├── services/           # 服务层
│   └── bookingService.ts # 预订数据服务
├── cache/              # 缓存层
│   └── cacheManager.ts  # 缓存管理器
├── utils/              # 工具类
│   ├── expiryHandler.ts # 过期处理工具
│   └── errorHandler.ts  # 错误处理工具
├── types/              # 类型定义
│   └── booking.types.ts # 预订相关类型
├── data/               # 模拟数据
│   └── booking.json     # 预订数据JSON
└── test/               # 测试文件
    └── testDataManager.ts # 数据管理器测试
```

## 主要功能

### 1. 数据管理器 (BookingDataManager)
- **单例模式**: 全局唯一实例
- **缓存机制**: 使用AsyncStorage进行本地持久化
- **时效性处理**: 自动检查数据是否过期
- **刷新机制**: 支持手动和自动后台刷新
- **错误处理**: 完善的错误处理和降级方案

### 2. 服务层 (BookingService)
- Mock数据响应，模拟网络请求
- 支持成功和失败场景
- 动态生成过期时间

### 3. 缓存层 (CacheManager)
- 基于AsyncStorage的持久化存储
- 支持TTL(生存时间)机制
- 缓存有效性检查

### 4. 时效性处理 (ExpiryHandler)
- 数据过期检查
- 缓存数据与新数据合并
- 过期时间格式化显示

### 5. 错误处理 (ErrorHandler)
- 统一的错误类型定义
- 错误消息本地化
- 重试机制支持

## 使用方式

### 基础使用

```typescript
import { useBookingData } from './src/hooks/useBookingData';

const MyComponent = () => {
  const { data, isLoading, error, refresh } = useBookingData();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <BookingDisplay data={data} />;
};
```

### 直接使用数据管理器

```typescript
import { BookingDataManager } from './src/managers/bookingDataManager';

const dataManager = BookingDataManager.getInstance();

// 获取数据
const result = await dataManager.getBookingData();

// 强制刷新
const freshResult = await dataManager.refreshBookingData();

// 清除缓存
await dataManager.clearCache();
```

## 特性说明

### 数据流程
1. 首次请求 → 从服务层获取 → 缓存到本地 → 返回数据
2. 后续请求 → 检查缓存 → 如有效直接返回 → 如过期则刷新
3. 数据即将过期 → 后台静默刷新 → 更新缓存

### 缓存策略
- **缓存时长**: 30分钟
- **数据时效性**: 根据服务端返回的expiryTime判断
- **降级机制**: 网络失败时使用过期缓存数据

### 错误处理
- 网络错误自动重试
- 缓存错误降级处理
- 用户友好的错误提示

## 运行项目

```bash
# 安装依赖
npm install

# 运行Android
npm run android

# 运行iOS  
npm run ios

# 启动Metro
npm start
```

## 测试

项目包含数据管理器的基础测试，可以在控制台查看测试日志：

```typescript
import { testDataManager } from './src/test/testDataManager';
testDataManager();
```

## 注意事项

1. 每次页面出现时会自动调用数据提供者接口
2. 数据会在控制台打印，便于调试
3. 支持下拉刷新和手动刷新按钮
4. 缓存数据在应用重启后仍然有效
5. 数据过期时会显示相应的状态提示