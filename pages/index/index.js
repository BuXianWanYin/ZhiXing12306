Page({
    data: {
      fromStation: '南宁东', // 默认出发站
      toStation: '北京', // 默认到达站
      date: '', // 日期
      dateText: '', // 格式化的日期文本
      dateValue: '', // 日期值
      isHighSpeed: false,
      isStudent: false,
      history: [],
      tabbarIndex: 0,
      isStudentTicket: false, // 是否选择学生票
      isHighSpeedTrain: false, // 是否只显示高铁动车
      historyList: [], // 历史搜索记录
      dayText: '', // 星期几文本
      showFromStation: false, // 是否显示出发站选择器
      showToStation: false, // 是否显示到达站选择器
      showDate: false, // 是否显示日期选择器
      tabIndex: 0
    },
    onLoad() {
      // 读取本地存储的历史记录
      let history = wx.getStorageSync('historyList') || [];
      this.setData({ historyList: history });

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
    switchTab(e) {
      this.setData({ activeTab: e.currentTarget.dataset.index });
    },
    chooseDate() {
      wx.navigateTo({
        url: `/pages/choose-date/choose-date?date=${this.data.date}`
      });
    },
    toggleHighSpeed(e) {
      this.setData({ isHighSpeed: e.detail.value });
    },
    toggleStudent(e) {
      this.setData({ isStudent: e.detail.value });
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
  
    },
    onClearHistory() {
      this.setData({ historyList: [] });
      wx.removeStorageSync('historyList');
    },
    onHistoryItemTap(e) {
      const item = e.currentTarget.dataset.item;
      const [fromStation, toStation] = item.split('-');
      
      // 更新当前选择的站点
      this.setData({
        fromStation,
        toStation
      });
      
      // 存储站点信息
      wx.setStorageSync('fromStation', fromStation);
      wx.setStorageSync('toStation', toStation);
      
      // 使用当前选择的站点和日期进行查询
      this.onSearchTrainTickets();
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
      console.log('Main page date before opening selector:', this.data.date);
      this.setData({
        dateValue: this.data.date,
        showDate: true
      });
      console.log('Main page dateValue set to:', this.data.dateValue);
    },
    onLoad() {
      console.log('本页tabIndex:', this.data.tabIndex);
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
        date: date,
        dateText: this.formatDate(date),
        dateValue: date,
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
      today.setHours(0, 0, 0, 0); // 清零时分秒
      const target = new Date(dateStr);
      target.setHours(0, 0, 0, 0); // 也清零
      const diff = (target - today) / (1000 * 60 * 60 * 24);
      if (diff === 0) return '今天';
      if (diff === 1) return '明天';
      const weekArr = ['日', '一', '二', '三', '四', '五', '六'];
      return `周${weekArr[target.getDay()]}`
    },
    onSearchTrainTickets: function() {
      const departureStation = this.data.fromStation;
      const arrivalStation = this.data.toStation;
      const travelDate = this.data.date;
      const isHighSpeedTrain = this.data.isHighSpeedTrain;
      const isStudentTicket = this.data.isStudentTicket;

      if (!travelDate) {
        wx.showToast({ title: '请选择出发日期', icon: 'none' });
        return;
      }

      // 添加新的历史记录
      const newRecord = `${departureStation}-${arrivalStation}`;
      let historyList = this.data.historyList.filter(item => item !== newRecord);
      historyList.unshift(newRecord);
      if (historyList.length > 3) {
        historyList = historyList.slice(0, 3);
      }
      
      this.setData({ historyList });
      wx.setStorageSync('historyList', historyList);

      wx.navigateTo({
        url: `/pages/train-list/index?departureStation=${departureStation}&arrivalStation=${arrivalStation}&travelDate=${travelDate}&isHighSpeedTrain=${isHighSpeedTrain}&isStudentTicket=${isStudentTicket}`
      });
    },
    switchStations() {
      const { fromStation, toStation } = this.data;
      this.setData({
        fromStation: toStation,
        toStation: fromStation
      });
      // 更新存储的站点信息
      wx.setStorageSync('fromStation', toStation);
      wx.setStorageSync('toStation', fromStation);
    },
    onGoFlight() {
      wx.navigateTo({ url: '/pages/flight/index' });
    }
  });