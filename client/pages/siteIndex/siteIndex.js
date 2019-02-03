// client/pages/siteIndex/siteIndex.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    requestBackDetail:"coming soon",
  },

  bindSwitch: function () {
    wx.showActionSheet({
      itemList: ['切换为用户模式'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
          wx.redirectTo({
            url: '../index/index'
          })
        }
      }
    });
  },
  bindTestRequest: function () {
    var that = this
    wx.request({
      url: 'https://testdjango.arjen.club:8093/', 
      data: {
        x: '1' ,
        y: '2'  },
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },  
        success: function(res) { 
          console.log(res.data) 
          console.log(res.data.detail) 
          that.setData({
            requestBackDetail: res.data.detail,
          })
        }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    if (app.globalData.userInfo !== null) {
      this.setData({ userInfo: app.globalData.userInfo, logged: true })
    }
  },

  bindNewSite: function () {
    wx.navigateTo({
      url: '../siteNew/siteNew',
    })
  },
  bindGetUserInfo: function () {
    this.autoGetUserInfo()
  },
  // 获得用户信息
  autoGetUserInfo: function () {
    if (this.data.logged) return
    util.showBusy('正在登录')
    const session = qcloud.Session.get()
    if (session) {
      //if (false) {
      qcloud.loginWithCode({
        success: res => {
          this.getUserInfoSu(res);
        },
        fail: err => {
          this.getUserInfoFail(err);
        }
      })
    } else {
      this.logIn()
    }
  },
  logIn: function () {
    qcloud.login({
      success: res => {
        this.getUserInfoSu(res);
      },
      fail: err => {
        this.getUserInfoFail(err);
      }
    })
  },
  getUserInfoSu: function (res) {
    this.setData({ userInfo: res, logged: true })
    app.globalData.userInfo = res
    util.showSuccess('登录成功')
  },
  getUserInfoFail: function (err) {
    console.error(err)
    if (err.message == "用户未登录过，请先使用 login() 登录") {
      this.logIn()
    } else {
      util.showModel('登录错误', err.message)
    }
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