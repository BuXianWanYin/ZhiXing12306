# 仿智行12306 微信小程序

## 项目结构
```
├── app.js                 # 小程序入口文件
├── app.json               # 小程序全局配置文件
├── app.wxss              # 小程序全局样式文件
├── components/           # 公共组件目录
│   ├── date-selector/    # 日期选择器组件
│   ├── station-selector/ # 站点选择器组件
│   ├── swiper/          # 轮播组件
│   ├── tabbar/          # 底部导航栏组件
│   ├── custom-tabbar/   # 自定义底部导航栏组件
│   └── navigation-bar/   # 导航栏组件
├── pages/               # 页面目录
│   ├── train-list/      # 火车票列表页面
│   ├── index/           # 首页
│   ├── rob-ticket/      # 抢票页面
│   ├── user/            # 个人中心
│   ├── bus/             # 汽车票相关页面
│   └── flight/          # 机票相关页面
├── utils/               # 工具函数目录
├── styles/              # 公共样式目录
├── images/              # 图片资源目录
├── project.config.json  # 项目配置文件
├── project.private.config.json # 项目私有配置文件
├── sitemap.json         # 小程序搜索配置文件
└── .eslintrc.js         # ESLint 配置文件
```

## 技术栈
- 微信小程序原生开发框架
- WXSS 样式开发
- JavaScript ES6+
- ESLint 代码规范

## 开发环境要求
- 微信开发者工具
- Node.js 环境
- 微信小程序账号

## 安装和使用

1. 克隆项目
```bash
git clone https://github.com/BuXianWanYin/ZhiXing12306.git
```

2. 使用微信开发者工具打开项目

3. 在微信开发者工具中导入项目

4. 在 project.config.json 中配置你的 AppID

5. 编译运行

## 代码规范
项目使用 ESLint 进行代码规范检查，配置文件为 `.eslintrc.js`。在开发过程中请遵循以下规范：
- 使用 ES6+ 语法
- 遵循微信小程序开发规范
- 保持代码风格统一

## 联系方式
- 项目维护者：[QGJ]
- 邮箱：[2644832053@qq.com] 