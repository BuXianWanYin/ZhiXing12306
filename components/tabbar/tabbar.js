// components/tabbar/tabbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentIndex: {
      type: Number,
      value: 0,
      observer(newVal) {
        console.log('tabbar收到currentIndex:', newVal, typeof newVal);
        this.setData({ activeTabIndex: newVal });
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    activeTabIndex: 0, // 默认选中第一个 tab (火车票)
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

  lifetimes: {
    attached() {
      console.log('tabbar attached');
      this.setData({ activeTabIndex: this.data.currentIndex });
    }
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      if (index === this.data.activeTabIndex) return;
      const pages = [
        '/pages/index/index',
        '/pages/flight/index',
        '/pages/bus/index',
        '/pages/user/index'
      ];
      wx.switchTab({ url: pages[index] });
    }
  }
});
