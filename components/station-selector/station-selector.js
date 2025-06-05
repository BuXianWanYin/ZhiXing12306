const { stationGroupedData } = require('../../utils/station_data');

Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {
    show: { type: Boolean, value: false },
    title: { type: String, value: '选择站点' }
  },
  data: {
    stationData: {},
    letterList: [],
    searchKeyword: '',
    searchResults: [],
    groupedStations: {},
    currentLetter: 'A', // 当前显示的字母
    pageSize: 20, // 每页显示的站点数量
    currentPage: 1, // 当前页码
    scrollViewTarget: '', // 滚动目标id
    activeLetterIndex: 'A', // 当前高亮的字母索引 (用于点击或拖拽时的高亮)
    letterIndexPositions: [], // 侧边字母索引项的位置 (用于拖拽功能)
    sequentialLoadingIndex: 0, // 顺序背景加载的索引
    isSequentialLoading: false, // 顺序加载状态标志
    sequentialLoadingTimer: null, // 顺序加载的计时器ID
    placeholderText: '请输入城市或站点'
  },
  lifetimes: {
    attached() {
      // 只加载字母列表
      const letters = Object.keys(stationGroupedData).sort();
      this.setData({
        letterList: letters,
        stationData: stationGroupedData // 保存完整数据但不显示
      }, () => {
        // 设置字母列表后，查询侧边字母索引项的位置（用于拖拽）
         wx.nextTick(() => {
            this.queryLetterIndexPositions(); // 查询字母索引项位置
         });

         // 初始加载：先加载字母 'A' 的所有站点
         const initialLetter = 'A';
         if (letters.includes(initialLetter)) {
              this.loadStationsByLetter(initialLetter, true); // 为 'A' 加载所有数据

              // 加载完 'A' 后，从 'B' 开始进行顺序加载
              const startSequentialLetterIndex = letters.indexOf('B');
              if (startSequentialLetterIndex !== -1) {
                  // 使用定时器在开始顺序加载前增加延迟
                  setTimeout(() => {
                      this.sequentialLoadingIndex = startSequentialLetterIndex;
                      this.startSequentialLoading();
                  }, 300); // 开始顺序加载前的小延迟
              }
         } else {
             // 如果 'A' 不存在，从第一个字母开始顺序加载
              if (letters.length > 0) {
                   this.sequentialLoadingIndex = 0;
                   setTimeout(() => {
                       this.startSequentialLoading();
                   }, 300); // 小延迟
              }
         }
      });

    },
    detached() {
      // 组件移除时断开观察器 (已移除)
    }
  },
  observers: {
    'show': function(show) {
      // 在组件显示时重置搜索状态
      // When the component becomes visible, reset search state
      if (show) {
        this.setData({
          searchKeyword: '',
          searchResults: []
        });
      }
    }
  },
  methods: {
    // 查询侧边字母索引项的边界矩形 (用于拖拽功能)
    queryLetterIndexPositions(retries = 0) {
         const MAX_RETRIES = 10; // 最大重试次数

         // 仅当组件当前显示时进行查询
        if (!this.data.show) {
            return;
        }
        const query = wx.createSelectorQuery().in(this);
        // 选择字母索引容器内的所有字母项
        query.selectAll('.letter-index .letter-item').boundingClientRect(rects => {

            // 检查 rects 是否有效且具有非零高度/顶部位置
             const isValid = rects && rects.length > 0 && rects.some(rect => rect.height > 0 || rect.top > 0);

            if (!isValid && retries < MAX_RETRIES) {
                 setTimeout(() => this.queryLetterIndexPositions(retries + 1), 100); // 100ms 后重试
                 return;
            } else if (!isValid) {
                 this.letterIndexPositions = []; // 重试失败后设置为空数组
                 return;
            }

            // 存储每个字母项相对于视口的顶部位置和高度
            const positions = rects.map(rect => ({ top: rect.top, height: rect.height }));
            this.letterIndexPositions = positions; // 更新数据
        }).exec();
    },

    // 启动或恢复顺序背景加载的方法
    startSequentialLoading() {
        const letters = this.data.letterList;
        const currentIndex = this.sequentialLoadingIndex;

        if (this.isSequentialLoading || currentIndex >= letters.length) {
            return;
        }

        this.isSequentialLoading = true;

        const loadNextLetter = () => {
            const letter = letters[this.sequentialLoadingIndex];
            if (!letter) {
                 this.isSequentialLoading = false;
                 this.sequentialLoadingTimer = null; // 清除计时器
                 return;
            }

            // 仅当此字母的数据尚未通过直接点击完全加载时进行加载
            const loadedCount = this.data.groupedStations[letter]?.length || 0;
            const totalCount = this.data.stationData[letter]?.length || 0;

            if (loadedCount < totalCount || totalCount === 0) { // 如果未完全加载或根本没有站点
                 // 为序列中的当前字母加载一页站点 (分页)
                 this.loadStationsByLetter(letter, false); // loadFull = false for sequential loading
            } else {
            }

            this.sequentialLoadingIndex++; // 移动到下一个字母索引

            if (this.sequentialLoadingIndex < letters.length) {
                // 安排延迟加载下一个字母
                this.sequentialLoadingTimer = setTimeout(loadNextLetter, 50); // 字母之间的小延迟
            } else {
                this.isSequentialLoading = false;
                this.sequentialLoadingTimer = null; // 清除计时器
            }
        };

        // 开始序列中的第一个字母加载
        loadNextLetter();
    },

    // 处理字母索引的触摸开始事件
    onTouchStart(e) {
       // 如果顺序加载处于活动状态，则暂停
       if (this.isSequentialLoading) {
           if (this.sequentialLoadingTimer) {
               clearTimeout(this.sequentialLoadingTimer);
               this.sequentialLoadingTimer = null;
           }
           this.isSequentialLoading = false; // 标记为暂停
       }
       // 您可能需要存储起始触摸位置，如果需要复杂手势
    },

    // 处理字母索引的触摸移动事件
    onTouchMove(e) {
       const touchY = e.touches[0].clientY; // 获取触摸相对于视口的当前 Y 位置

       const letterList = this.data.letterList;
       const letterIndexPositions = this.letterIndexPositions; // 侧边索引的字母位置

       if (!letterIndexPositions || letterIndexPositions.length === 0) {
            return;
       }

       // 根据 Y 位置确定触摸当前在哪一个字母上
       let touchedLetter = null;
       for (let i = 0; i < letterIndexPositions.length; i++) {
           const { top, height } = letterIndexPositions[i]; // 位置相对于视口
           // 检查 touchY 是否在此字母项的垂直范围内
           if (touchY >= top && touchY < top + height) {
               touchedLetter = letterList[i];
               break; // 找到触摸到的字母
           }
       }

       if (touchedLetter) {
            // 如果触摸到的字母与当前高亮的字母不同 (避免不必要的更新)
            // 或者如果 scrollViewTarget 未设置 (意味着我们尚未跳转到某个字母)
           // 侧边索引拖拽时直接高亮并设置滚动目标
           if (touchedLetter !== this.data.activeLetterIndex || !this.data.scrollViewTarget) {
               // 立即更新高亮字母
               this.setData({
                   activeLetterIndex: touchedLetter,
                   scrollViewTarget: touchedLetter // 设置滚动目标为触摸到的字母的 section ID
               });

               // 在拖拽期间加载触摸到的字母的所有站点
               this.loadStationsByLetter(touchedLetter, true); // 为拖拽加载所有数据

               // 如果顺序加载处于活动状态，则暂停
                if (this.isSequentialLoading) {
                     if (this.sequentialLoadingTimer) {
                        clearTimeout(this.sequentialLoadingTimer);
                        this.sequentialLoadingTimer = null;
                     }
                     this.isSequentialLoading = false; // 标记为暂停
                }
           }
       } else {
       }
    },

    // 处理字母索引的触摸结束事件
    onTouchEnd(e) {

      // 延迟一小段时间后恢复顺序加载，以便滚动完成
      setTimeout(() => {
          this.startSequentialLoading();
      }, 300); // 恢复顺序加载前的小延迟
    },

    // 处理滚动事件
    onScroll(e) {

    },

    // loadStationsByLetter 方法 (简化，由触摸/滚动使用)
    // 添加 loadFull 参数：true 表示加载所有，false/undefined 表示分页加载
    loadStationsByLetter(e, loadFull = false) {
        const letter = e.currentTarget?.dataset?.letter || e; // 从事件对象或直接传递获取字母
        if (!letter) {
             return;
        }

        // 仅当此字母的数据尚未完全加载时进行加载
        const loadedCount = this.data.groupedStations[letter]?.length || 0;
        const totalCount = this.data.stationData[letter]?.length || 0;

        // 如果已完全加载或此字母根本没有站点
        if ((loadedCount > 0 && loadedCount >= totalCount) || (totalCount === 0 && loadedCount > 0)) {
             return; // 如果已满或尝试加载后为空，则不再加载
        }

        // 如果需要加载，则进行切片
        const stations = this.data.stationData[letter] || [];

        let stationsToLoad;
        if (loadFull) {
           stationsToLoad = stations; // 加载此字母的所有站点
        } else {
           const start = loadedCount; // 从上次中断的地方开始
           const countToLoad = this.data.pageSize; // 加载下一页大小
           const end = start + countToLoad;
            stationsToLoad = stations.slice(start, end);

            if (stationsToLoad.length === 0 && start > 0) { // 没有新站点可追加，可能已到底部
                return; // 如果没有新站点且不是完整加载请求，则不加载
            }
        }

         // 将新站点追加到此字母的现有站点中
         const currentStations = this.data.groupedStations[letter] || [];
         const updatedStations = (loadFull || loadedCount === 0) ? stationsToLoad : [...currentStations, ...stationsToLoad];


        this.setData({
          // currentLetter 现在与 activeLetterIndex 同步
          groupedStations: {
             ...this.data.groupedStations, // 保留其他字母的数据
            [letter]: updatedStations // 设置或追加当前字母的数据
          },
           // currentPage 逻辑不直接适用于分组部分加载
        }, () => {
             // 如果布局发生显著变化，重新查询字母索引位置 (主列表加载内容时可能性较低)
             // 已移除重新创建观察器的逻辑。
        });
      },

    // loadMoreStations 方法 (触发加载当前高亮字母的更多站点)
    loadMoreStations() {
      const { activeLetterIndex } = this.data; // 使用 activeLetterIndex

      if (!activeLetterIndex) {
          return;
      } // 如果列表可见，不应该发生

      // loadStationsByLetter 将处理检查是否有更多数据并进行追加。
      this.loadStationsByLetter({ currentTarget: { dataset: { letter: activeLetterIndex } } });
    },

    // 处理字母索引项的点击事件
    onLetterTap(e) {
      const tappedLetter = e.currentTarget.dataset.item;

      if (tappedLetter) {
        // 点击时，我们直接设置目标和高亮字母。
        this.setData({
          activeLetterIndex: tappedLetter,
          currentLetter: tappedLetter, // 保持 currentLetter 同步
          scrollViewTarget: tappedLetter // 设置滚动目标为点击到的字母的 section ID
        });

        // 显式加载点击到的字母的所有站点
         this.loadStationsByLetter(tappedLetter, true); // 为点击加载所有数据
      }
    },

    // 处理主列表中字母部分标题的点击事件
    onLetterIndexTap(e) {
      const tappedLetter = e.currentTarget.dataset.letter;

      if (tappedLetter) {
        // 点击时，我们直接设置目标和高亮字母。
        this.setData({
          activeLetterIndex: tappedLetter,
          currentLetter: tappedLetter, // 保持 currentLetter 同步
          scrollViewTarget: tappedLetter // 设置滚动目标为点击到的字母的 section ID
        });

        // 显式加载点击到的字母的所有站点
        this.loadStationsByLetter(tappedLetter, true); // 为部分标题点击加载所有数据
      }
    },

    onClose() {
      // 关闭组件时重置搜索状态
      // Closing the component resets the search state
      this.setData({
        searchKeyword: '',
        searchResults: []
      });
      this.triggerEvent('close');
    },

    onSelect(e) {
      const station = e.currentTarget.dataset.station;
      this.triggerEvent('select', { station });
      this.triggerEvent('close');
    },

    searchInput(e) {
      const keyword = e.detail.value.toLowerCase();
      this.setData({ searchKeyword: keyword });

      if (!keyword) {
        this.setData({ searchResults: [] });
        return;
      }

      const results = [];
      // 在所有站点数据中搜索
      Object.values(this.data.stationData).forEach(stations => {
        stations.forEach(station => {
          if (station.name.includes(keyword) ||
              station.pinyin.includes(keyword) ||
              station.abbr.includes(keyword)) {
            results.push(station);
          }
        });
      });

      this.setData({ searchResults: results.slice(0, 80) }); // 限制搜索结果数量
    },

  }
});