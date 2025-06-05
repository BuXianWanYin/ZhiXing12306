// components/tabbar/tabbar.js
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
          normal: 'https://img.icons8.com/ios-filled/50/888888/train.png', // 灰色火车票
          active: 'https://img.icons8.com/ios-filled/50/3a8dff/train.png'  // 蓝色火车票
        },
        {
          normal: 'https://img.icons8.com/ios-filled/50/888888/airplane-take-off.png', // 灰色飞机票
          active: 'https://img.icons8.com/ios-filled/50/3a8dff/airplane-take-off.png'  // 蓝色飞机票
        },
        {
          normal: 'https://img.icons8.com/ios-filled/50/888888/order-history.png', // 灰色汽车票
          active: 'https://img.icons8.com/ios-filled/50/3a8dff/order-history.png'  // 蓝色汽车票
        },
        {
          normal: 'https://img.icons8.com/ios-filled/50/888888/user.png', // 灰色个人中心
          active: 'https://img.icons8.com/ios-filled/50/3a8dff/user.png'  // 蓝色个人中心
        }
      ]
    },
  
    /**
     * 组件的方法列表
     */
    methods: {
      switchTab: function(e) {
        const index = e.currentTarget.dataset.index; // 获取点击的 tab 的索引
        if (index !== this.data.activeTabIndex) {
          this.setData({
            activeTabIndex: index
          });
          // TODO: 这里可以触发事件通知父页面进行页面切换
          // this.triggerEvent('tabChange', { index: index });
          console.log('切换到索引为', index, '的tab');
        }
      }
    }
  })