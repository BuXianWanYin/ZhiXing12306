
Page({
  data: {
    fromStation: '北京', // 默认出发城市
    toStation: '上海', // 默认到达城市
    date: '', // 日期
    dateText: '', // 格式化的日期文本
    dateValue: '', // 日期值
    dayText: '', // 星期几文本
    showFromCity: false, // 是否显示出发城市选择器
    showToCity: false, // 是否显示到达城市选择器
    showDate: false, // 是否显示日期选择器
  },

  onLoad() {
    // 设置今天的日期
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    
    this.setData({ 
      date: todayStr,
      dateText: this.formatDate(todayStr),
      dateValue: todayStr,
      dayText: this.getDayText(todayStr)
    });
  },

  onShow() {
    // 设置当前页面的 tabBar 索引
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        activeTabIndex: 1  // 飞机票是第二个 tab
      });
    }
  },

  // 显示出发城市选择器
  showFromCitySelector() {
    this.setData({ showFromCity: true });
  },

  // 显示到达城市选择器
  showToCitySelector() {
    this.setData({ showToCity: true });
  },

  // 显示日期选择器
  showDateSelector() {
    this.setData({ showDate: true });
  },

  // 交换出发和到达城市
  switchCities() {
    const { fromStation, toStation } = this.data;
    this.setData({
      fromStation: toStation,
      toStation: fromStation
    });
  },

  // 格式化日期
  formatDate(dateStr) {
    const arr = dateStr.split('-');
    return `${parseInt(arr[1])}月${parseInt(arr[2])}日`;
  },

  // 获取星期几文本
  getDayText(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 清零时分秒
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0); // 也清零
    const diff = (target - today) / (1000 * 60 * 60 * 24);
    if (diff === 0) return '今天';
    if (diff === 1) return '明天';
    const weekArr = ['日', '一', '二', '三', '四', '五', '六'];
    return `周${weekArr[target.getDay()]}`
  }
})