import { getMonthHolidayAndLunar } from '../../utils/holiday.js';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
Component({
  properties: {
    show: { type: Boolean, value: false },
    dateText: { type: String, value: '' }
  },
  data: {
    year: 2025,
    month: 6,
    days: [],
    weekDays,
    selectedDate: ''
  },
  lifetimes: {
    attached() {
      const today = new Date();
      this.setData({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        selectedDate: this.properties.dateText || this.formatDate(today)
      });
      this.initCalendar(today.getFullYear(), today.getMonth() + 1);
    }
  },
  methods: {
    stop() {},
    onClose() {
      this.triggerEvent('close');
      this.setData({ show: false });
    },
    onSelectDay(e) {
      const date = e.currentTarget.dataset.date;
      if (!date) return;
      this.setData({ selectedDate: date });
      this.triggerEvent('select', { date });
      this.setData({ show: false });
    },
    prevMonth() {
      let { year, month } = this.data;
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      this.setData({ year, month });
      this.initCalendar(year, month);
    },
    nextMonth() {
      let { year, month } = this.data;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      this.setData({ year, month });
      this.initCalendar(year, month);
    },
    // 生成日历数据
    initCalendar(year, month) {
      const today = new Date();
      const days = [];
      const firstDay = new Date(year, month - 1, 1);
      const startWeek = firstDay.getDay();
      const daysCount = new Date(year, month, 0).getDate();
      const selectedDate = this.data.selectedDate;

      // 先补齐上月空白
      for (let i = 0; i < (startWeek === 0 ? 0 : startWeek); i++) {
        days.push({ day: '', isCurrentMonth: false });
      }

      // 异步获取整月农历和节假日
      getMonthHolidayAndLunar(year, month).then(monthData => {
        // monthData 是一个数组，每天一个对象
        for (let d = 1; d <= daysCount; d++) {
          const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
          const dayInfo = monthData.find(item => item.date === dateStr) || {};
          let festival = '';
          if (dayInfo.solarTerms && !/后$/.test(dayInfo.solarTerms)) {
            festival = dayInfo.solarTerms;
          }
          let holiday = '';
          let lunar = '';
          if (dayInfo.lunarCalendar) {
            const match = dayInfo.lunarCalendar.match(/(初|十|廿|三十)[一二三四五六七八九十]/);
            lunar = match ? match[0] : dayInfo.lunarCalendar.slice(-2);
          }
          let isReserve = false;
          if (dayInfo.typeDes && dayInfo.typeDes.indexOf('预约') !== -1) {
            isReserve = true;
          }
          days.push({
            day: d,
            date: dateStr,
            isCurrentMonth: true,
            isToday: today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d,
            isSelected: selectedDate === dateStr,
            lunar,
            festival,
            holiday,
            weekDay: dayInfo.weekDay || '',
            suit: dayInfo.suit || '',
            avoid: dayInfo.avoid || '',
            isReserve
          });
        }
        this.setData({
          year,
          month,
          days
        });
      });
    },
    formatDate(date) {
      if (typeof date === 'string') return date;
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
  }
});