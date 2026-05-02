# Expo Calendar

一个简易的日历 App，支持日程管理、本地提醒和实时天气。

## 功能

- 年/月/日视图日历
- 添加、查看、删除日程
- 本地通知提醒
- 实时天气显示

## APIkey依赖

- **和风天气** - 获取天气数据
- **高德地图** - IP 定位和天气兜底

## 快速开始

### 1. 配置环境变量

创建 `.env` 文件：

```bash
EXPO_PUBLIC_AMAP_KEY=你的高德Key
EXPO_PUBLIC_WEATHER_KEY=你的和风天气Key
EXPO_PUBLIC_WEATHER_API_HOST=devapi.qweather.com
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 运行项目

```bash
# 启动开发服务器
pnpm run start

# Android
pnpm run android

# iOS
pnpm run ios

# Web
pnpm run web
```
