# 仿智行12306 微信小程序

## 项目结构
```
├── app.js                 # 小程序入口文件，包含全局逻辑
├── app.json               # 小程序全局配置，包括页面路径、窗口样式等
├── app.wxss              # 全局样式文件，定义通用样式
├── components/           # 公共组件目录
│   ├── date-selector/    # 日期选择器组件，支持日历展示和日期选择
│   ├── station-selector/ # 站点选择器组件，支持站点搜索和选择
│   ├── swiper/          # 轮播组件，用于首页展示
│   ├── tabbar/          # 底部导航栏组件
│   ├── custom-tabbar/   # 自定义底部导航栏组件，支持更多交互
│   └── navigation-bar/   # 导航栏组件，统一页面导航样式
├── pages/               # 页面目录
│   ├── train-list/      # 火车票列表页面，展示车次信息
│   ├── index/           # 首页，包含主要功能入口
│   ├── rob-ticket/      # 抢票页面，提供抢票功能
│   ├── user/            # 个人中心，用户信息管理
│   ├── bus/             # 汽车票相关页面，包含查询和预订
│   └── flight/          # 机票相关页面，包含查询和预订
├── utils/               # 工具函数目录，包含通用方法
├── styles/              # 公共样式目录，存放通用样式文件
├── images/              # 图片资源目录，存放项目图片资源
├── project.config.json  # 项目配置文件，包含项目设置
├── project.private.config.json # 项目私有配置文件，包含个人开发设置
├── sitemap.json         # 小程序搜索配置文件，用于微信搜索
└── .eslintrc.js         # ESLint 配置文件，定义代码规范
```

## 技术栈
- 微信小程序原生开发框架
- WXSS 样式开发
- JavaScript ES6+
- ESLint 代码规范
- 微信小程序组件化开发

## 开发环境要求
- 微信开发者工具（最新版本）
- Node.js 环境（建议 v14.0.0 或以上）
- 微信小程序账号（需要 AppID）
- Git 版本控制工具

## 安装和使用

1. 克隆项目
```bash
git clone https://github.com/BuXianWanYin/ZhiXing12306.git
```

2. 使用微信开发者工具打开项目
   - 打开微信开发者工具
   - 选择"导入项目"
   - 选择项目目录
   - 填入自己的 AppID（如果没有，可以使用测试号）

4. 配置项目
   - 在 project.config.json 中配置你的 AppID
   - 检查 project.private.config.json 中的私有配置
   - 确保 sitemap.json 配置正确

5. 编译运行
   - 点击编译按钮
   - 在模拟器中预览效果
   - 使用真机调试功能进行测试

## 开发规范
项目使用 ESLint 进行代码规范检查，配置文件为 `.eslintrc.js`。在开发过程中请遵循以下规范：

- 使用 ES6+ 语法特性
- 遵循微信小程序开发规范
- 保持代码风格统一
- 组件化开发，提高代码复用性
- 合理使用注释，提高代码可读性
- 遵循目录结构规范
- 使用语义化的命名方式

## 开发流程
1. 创建功能分支
2. 开发新功能
3. 提交代码前进行代码检查
4. 提交 Pull Request
5. 代码审查
6. 合并到主分支

## 项目维护
- 定期更新依赖包
- 及时修复已知问题
- 优化用户体验
- 添加新功能
- 完善文档

## 联系方式
- 项目维护者：[QGJ]
- 邮箱：[2644832053@qq.com]
- 项目地址：[https://github.com/BuXianWanYin/ZhiXing12306]
