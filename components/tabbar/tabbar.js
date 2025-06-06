// components/tabbar/tabbar.js
const app = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {
      // 如果父页面需要传递当前选中的索引，可以在这里定义
      // 例如: currentIndex: { type: Number, value: 0 }
    },
  
    /**
     * 组件的初始数据
     */
    data: {
      activeTabIndex: 0, // 默认选中第一个 tab (火车票)
      // 定义图标链接，方便WXML中动态绑定
      iconUrls: [
        {
          normal: '/images/tabber/train_ccc.png', // 灰色火车票
          active: '/images/train.png'  // 蓝色火车票
        },
        {
          normal: '/images/tabber/airplane-take-off-ccc.png', // 灰色飞机票
          active: '/images/airplane-take-off.png'  // 蓝色飞机票
        },
        {
          normal: '/images/tabber/bus.png', // 灰色汽车票
          active: '/images/tabber/bus_blue.png'  // 蓝色汽车票
        },
        {
          normal: '/images/tabber/user.png', // 灰色个人中心
          active: '/images/tabber/user_blue.png'  // 蓝色个人中心
        }
      ]
    },
  
    /**
     * 组件的生命周期
     */
    lifetimes: {
      attached() {
        console.log('tabbar attached');
        this.updateActiveTab();
      }
    },
  
    /**
     * 组件所在页面的生命周期
     */
    pageLifetimes: {
      show() {
        console.log('page show');
        this.updateActiveTab();
      }
    },
  
    /**
     * 组件的方法列表
     */
    methods: {
      updateActiveTab() {
        // 获取当前页面路径
        const pages = getCurrentPages();
        console.log('current pages:', pages);
        const currentPage = pages[pages.length - 1];
        console.log('current page:', currentPage);
        const route = currentPage.route;
        console.log('current route:', route);
        
        // 根据页面路径设置激活的 tab
        const tabMap = {
          'pages/index/index': 0,
          'pages/flight/index': 1,
          'pages/bus/index': 2,
          'pages/user/index': 3
        };
        
        console.log('tabMap[route]:', tabMap[route]);
        if (tabMap[route] !== undefined) {
          console.log('setting activeTabIndex to:', tabMap[route]);
          // 保存到全局状态
          if (app) {
            app.globalData = app.globalData || {};
            app.globalData.activeTabIndex = tabMap[route];
          }
          this.setData({
            activeTabIndex: tabMap[route]
          });
        } else if (app && app.globalData && app.globalData.activeTabIndex !== undefined) {
          // 如果路由不在映射中，使用全局状态
          console.log('using global activeTabIndex:', app.globalData.activeTabIndex);
          this.setData({
            activeTabIndex: app.globalData.activeTabIndex
          });
        }
      },
  
      switchTab(e) {
        console.log('switchTab called with event:', e);
        const index = e.currentTarget.dataset.index;
        console.log('switchTab index:', index);
        console.log('current activeTabIndex:', this.data.activeTabIndex);
        
        if (index !== this.data.activeTabIndex) {
          console.log('updating activeTabIndex to:', index);
          // 保存到全局状态
          if (app) {
            app.globalData = app.globalData || {};
            app.globalData.activeTabIndex = index;
          }
          this.setData({
            activeTabIndex: index
          });
          
          const pages = [
            '/pages/index/index',
            '/pages/flight/index',
            '/pages/bus/index',
            '/pages/user/index'
          ];
          
          console.log('switching to page:', pages[index]);
          wx.switchTab({
            url: pages[index],
            success: (res) => {
              console.log('switchTab success:', res);
            },
            fail: (err) => {
              console.error('switchTab failed:', err);
              console.log('trying navigateTo instead');
              wx.navigateTo({
                url: pages[index],
                success: (res) => {
                  console.log('navigateTo success:', res);
                },
                fail: (err) => {
                  console.error('navigateTo failed:', err);
                  wx.showToast({
                    title: '页面跳转失败',
                    icon: 'none'
                  });
                }
              });
            }
          });
        } else {
          console.log('tab already active, no need to switch');
        }
      }
    }
  })