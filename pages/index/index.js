Page({
    data: {
      banners: [
        { url: 'https://img1.baidu.com/it/u=1234567890,1234567890&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=270' },
        { url: 'https://img.zcool.cn/community/01b6c95e3e7e2fa8012193a3e7e2e2.jpg' },
        { url: 'https://img.zcool.cn/community/01b6c95e3e7e2fa8012193a3e7e2e3.jpg' }
      ],
      activeTab: 0,
      fromStation: '哈尔滨',
      toStation: '北京',
      date: '2024-06-06',
      weekday: '周四',
      isHighSpeed: false,
      isStudent: false,
      history: ['北京-佳木斯', '佳木斯-北京'],
      quickNav: [
        { icon: 'https://unicons.iconscout.com/release/v4.0.0/svg/solid/bolt.svg', title: '极速抢票' },
        { icon: 'https://unicons.iconscout.com/release/v4.0.0/svg/solid/seat.svg', title: '在线选座' },
        { icon: 'https://unicons.iconscout.com/release/v4.0.0/svg/solid/gift.svg', title: '抢手好货' },
        { icon: 'https://unicons.iconscout.com/release/v4.0.0/svg/solid/building.svg', title: '超值酒店' }
      ],
      tabbarIndex: 0,
      isStudentTicket: false,
      isHighSpeedTrain: false,
      historyList: [],
      dateText: '6月6日',
      dayText: '明天',
      showFromStation: false,
      showToStation: false,
      showDate: false
    },
    onLoad() {
      // 假数据
      const defaultHistory = [
        '北京-佳木斯',
        '佳木斯-北京',
        '上海-广州'
      ];
      // 先尝试读取本地存储
      let history = wx.getStorageSync('historyList');
      // 如果本地没有，则用假数据
      if (!history || history.length === 0) {
        history = defaultHistory;
        wx.setStorageSync('historyList', history);
      }
      this.setData({ historyList: history });
    },
    switchTab(e) {
      this.setData({ activeTab: e.currentTarget.dataset.index });
    },
    chooseStation(e) {
      // TODO: 跳转到选择车站页面
    },
    chooseDate() {
      wx.navigateTo({
        url: '/pages/choose-date/choose-date'
      });
    },
    toggleHighSpeed(e) {
      this.setData({ isHighSpeed: e.detail.value });
    },
    toggleStudent(e) {
      this.setData({ isStudent: e.detail.value });
    },
    onSearch() {
      // TODO: 跳转到火车票列表页面
    },
    clearHistory() {
      this.setData({ history: [] });
    },
    toggleStudentTicket() {
      this.setData({
        isStudentTicket: !this.data.isStudentTicket
      });
    },
    toggleHighSpeedTrain() {
      this.setData({
        isHighSpeedTrain: !this.data.isHighSpeedTrain
      });
    },
    onSearchTicket() {
      const { fromStation, toStation, historyList } = this.data;
      const newRecord = `${fromStation}-${toStation}`;
      let newHistory = historyList.filter(item => item !== newRecord);
      newHistory.unshift(newRecord);
      if (newHistory.length > 3) newHistory = newHistory.slice(0, 3);
      this.setData({ historyList: newHistory });
      wx.setStorageSync('historyList', newHistory);
      // ... 这里可以继续你的查询逻辑 ...
    },
    onClearHistory() {
      this.setData({ historyList: [] });
      wx.removeStorageSync('historyList');
    },
    chooseFromStation() {
      this.setData({ showFromStation: true });
    },
    chooseToStation() {
      this.setData({ showToStation: true });
    },
    onShow() {
      // 取回选择的站点和日期
      const fromStation = wx.getStorageSync('fromStation');
      const toStation = wx.getStorageSync('toStation');
      const dateText = wx.getStorageSync('dateText');
      const dayText = wx.getStorageSync('dayText');
      if (fromStation) this.setData({ fromStation });
      if (toStation) this.setData({ toStation });
      if (dateText) this.setData({ dateText });
      if (dayText) this.setData({ dayText });
    },
    showFromStationSelector() {
      this.setData({ showFromStation: true });
    },
    showToStationSelector() {
      this.setData({ showToStation: true });
    },
    showDateSelector() {
      this.setData({ showDate: true });
    },
    onFromStationSelect(e) {
      const station = e.detail.station;
      this.setData({ 
        fromStation: station.name,
        showFromStation: false 
      });
      wx.setStorageSync('fromStation', station.name);
    },
    onToStationSelect(e) {
      const station = e.detail.station;
      this.setData({ 
        toStation: station.name,
        showToStation: false 
      });
      wx.setStorageSync('toStation', station.name);
    },
    onStationSelectorClose() {
      this.setData({ showFromStation: false, showToStation: false });
    },
    onDateSelect(e) {
      const date = e.detail.date;
      this.setData({
        dateText: this.formatDate(date),
        dayText: this.getDayText(date),
        showDate: false
      });
    },
    onDateSelectorClose() {
      this.setData({ showDate: false });
    },
    formatDate(dateStr) {
      const arr = dateStr.split('-');
      return `${parseInt(arr[1])}月${parseInt(arr[2])}日`;
    },
    getDayText(dateStr) {
      const today = new Date();
      const target = new Date(dateStr);
      const diff = (target - today) / (1000 * 60 * 60 * 24);
      if (diff < 1 && diff > -1) return '今天';
      if (diff < 2 && diff > 0) return '明天';
      const weekArr = ['日', '一', '二', '三', '四', '五', '六'];
      return `周${weekArr[target.getDay()]}`;
    }
  });