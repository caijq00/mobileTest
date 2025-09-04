# React Native 预订数据管理系统

一个基于 React Native 的数据管理系统，专门用于处理预订数据的获取、缓存、刷新和展示。

## 📱 技术栈

- **React Native**: 0.71.19
- **React**: 18.2.0
- **TypeScript**: 5.0.4
- **AsyncStorage**: 1.19.3

## 🚀 运行项目

### 环境要求
- Node.js >= 16
- React Native CLI
- Android Studio (Android 开发)
- Xcode (iOS 开发)

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 启动 Metro 服务器
```bash
npm start
# 或
yarn start
```

### 运行应用
```bash
# Android
npm run android
# 或
yarn android

# iOS
npm run ios
# 或
yarn ios
```

## 🏗️ 系统架构

### 1.1 Service 层
- **BookingService**: 核心数据服务，采用单例模式
  - 负责数据获取、重试机制、时效性验证
  - 支持配置化的重试策略和过期时间设置
  - 模拟网络请求，包含错误处理和超时机制

### 1.2 本地持久化缓存层
- **CacheManager**: 缓存管理器
  - 使用 AsyncStorage 实现本地数据持久化
  - 支持数据保存、获取、清除操作
  - 自动处理缓存过期逻辑

### 1.3 数据时效性处理
- **双重时效性检查**:
  - 缓存层面：检查缓存是否过期（默认30分钟）
  - 数据层面：检查业务数据本身的有效期
- **ExpiryHandler**: 时效性处理工具
  - 实时计算剩余有效时间
  - 格式化时间显示
  - 数据合并策略

### 1.4 刷新机制和统一接口
- **BookingDataManager**: 统一数据管理入口
  - `getBookingData()`: 智能数据获取接口
  - `refreshBookingData()`: 手动刷新接口
  - 支持强制刷新和智能缓存策略
  - 后台自动刷新机制，确保数据及时性

### 1.4.1 缓存与新数据的无缝处理
- **数据合并策略**:
  - 优先使用有效缓存数据，提升响应速度
  - 新数据获取成功后，智能合并缓存和新数据
  - 失败降级：网络失败时使用过期缓存作为备选
- **UI无缝展示**:
  - 通过 `isFromCache` 标识数据来源
  - 支持下拉刷新和手动刷新按钮
  - 实时显示数据状态和剩余有效时间

### 1.5 错误处理
- **ErrorHandler**: 统一错误处理机制
  - 错误分类：网络错误、缓存错误、数据过期、服务不可用
  - 智能重试策略，支持指数退避算法
  - 用户友好的错误信息提示
  - 错误恢复机制

## 📋 功能特性

### 2. 列表展示和数据监控
- **BookingList**: 预订数据展示组件
  - 每次页面出现自动调用数据接口
  - 控制台自动打印获取到的数据（便于调试）
  - 实时显示数据状态、来源和剩余有效时间
  - 支持下拉刷新和手动刷新操作

## 📁 项目结构

```
src/
├── components/          # UI 组件
│   └── BookingList.tsx  # 预订列表组件
├── services/            # 服务层
│   └── bookingService.ts # 数据服务
├── managers/            # 管理层
│   └── bookingDataManager.ts # 数据管理器
├── cache/               # 缓存层
│   └── cacheManager.ts  # 缓存管理器
├── hooks/               # 自定义钩子
│   ├── useBookingData.ts # 数据获取钩子
│   └── useRealTimeExpiry.ts # 实时过期钩子
├── utils/               # 工具类
│   ├── errorHandler.ts  # 错误处理器
│   └── expiryHandler.ts # 时效处理器
├── types/               # 类型定义
│   └── booking.types.ts # 预订数据类型
└── data/                # 模拟数据
    └── booking.json     # 测试数据
```

## 🔧 配置选项

可以通过 `BookingDataManager` 配置服务参数：

```typescript
const manager = BookingDataManager.getInstance();
manager.setServiceConfig({
  defaultExpiryDuration: 3600, // 默认过期时间（秒）
  refreshThreshold: 300,       // 刷新阈值（秒）
  maxRetries: 3,              // 最大重试次数
  retryDelay: 1000           // 重试延迟（毫秒）
});
```

## 📊 数据流程

1. **首次加载**: UI → DataManager → 检查缓存 → Service获取数据 → 缓存保存 → UI展示
2. **缓存命中**: UI → DataManager → 返回缓存数据 → 后台刷新（可选）
3. **数据刷新**: UI触发 → 强制获取新数据 → 合并数据 → 更新缓存 → UI更新
4. **错误处理**: 获取失败 → 尝试缓存降级 → 重试机制 → 错误提示

## 🎯 核心优势

- **高可用性**: 多层缓存策略，确保在网络异常时仍能提供服务
- **智能刷新**: 基于数据时效性的智能刷新机制，平衡性能与数据新鲜度
- **用户体验**: 无缝的数据切换，用户无感知的后台数据更新
- **可维护性**: 清晰的分层架构，便于扩展和维护
- **调试友好**: 详细的控制台日志，便于开发调试

## 🔄 测试功能

运行应用后，可以通过以下方式测试各项功能：

1. **查看控制台输出**: 每次进入页面都会打印数据
2. **下拉刷新**: 测试数据刷新机制
3. **清除缓存**: 测试缓存管理功能
4. **观察数据状态**: 实时查看数据有效期倒计时
5. **网络模拟**: 代码中有10%概率模拟网络失败，可观察错误处理机制