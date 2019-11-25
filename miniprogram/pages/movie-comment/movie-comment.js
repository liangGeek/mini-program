const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    rate: 0,
    images: [],
    fileIds: [],
  },
  onChangeRate: function (event) {
    this.setData({
      rate: event.detail
    })
  },
  onChangeContent: function (event) {
    this.setData({
      content: event.detail
    })
  },
  upoadImg: function () {
    wx.chooseImage({
      count: 5,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          images: this.data.images.concat(tempFilePaths)
        })
      }
    })
  },

  deleteImg: function(event) {
    this.setData({
      images: this.data.images.filter(item => item !== event.currentTarget.dataset.item)
    })
  },

  submit: function () {
    wx.showLoading({
      title: '评论中...',
    })
    let promiseArr = [];
    for (let i = 0; i < this.data.images.length; i++) {
      let item = this.data.images[i];
      let suffix = /\.\w+$/.exec(item)[0];
      promiseArr.push(new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime + suffix,
          filePath: item,
          success: res => {
            this.setData({
              fileIds: this.data.fileIds.concat(res.fileID)
            });
            resolve();
          }
        })
      }))
    }
    Promise.all(promiseArr).then(res => {
      db.collection('comment').add({
        data: {
          content: this.data.content,
          score: this.data.rate,
          movieid: this.data.movieid,
          fileIds: this.data.fileIds
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '评论成功',
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      }).catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '评论失败',
        })
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '电影评论',
    })
    this.setData({
      movieid: options.movieid
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})