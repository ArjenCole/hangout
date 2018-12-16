// client/pages/detailApt/detailApt.js
var app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    apt: {},
    test :"2"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.getApt(options.aptId)
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

  },

  getApt: function (pId) {
    var that = this;
    console.log(this)
    app.globalData.aptCollection.where({
      _id: pId
    }).get({
      success: function (res) {
        console.log("res", res.data[0])
        var t = res.data[0]
        console.log("t", t)
        that.setData({ apt: t })
        console.log("t1", t)

      }
    })
  },
})