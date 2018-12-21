// client/pages/detailApt/detailApt.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var util = require('../../utils/util.js')
var app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    apt: {},
    showApt: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options",options.aptId)
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
  onShareAppMessage: function (ops) {
    var tTitle = ""; var tPath = "";
    //if (ops.from === 'button') {
      // 来自页面内转发按钮        
      tTitle = app.globalData.userInfo.nickName + '邀请你参加活动';
      tPath = '/pages/index/index?aptId=' + this.data.apt._id;//分享地址
      //tPath = '/pages/detailApt/detailApt?aptId=' + this.data.apt._id;//分享地址

    //}
    console.log(tPath)

    return {
      title: tTitle,//分享内容
      path: tPath,//分享地址
      //imageUrl: '/images/img_share.png',//分享图片
    }

  },

  bindGetUserInfo: function () {
    this.autoGetUserInfo()
  },
  bindDenyTap: function () {
    if (app.globalData.userInfo !== null) { 
      this.updateApt(this.updateArr(this.data.apt.records, -1))
    }
  },
  bindPendTap: function () {
    if (app.globalData.userInfo !== null) {
      this.updateApt(this.updateArr(this.data.apt.records, 0))
    }
  },
  bindJoinTap: function () {
    if (app.globalData.userInfo !== null) {
      this.updateApt(this.updateArr(this.data.apt.records, 1))
    }
  },

  getApt: function (pId) {
    var that = this;
    app.globalData.aptCollection.where({
      _id: pId
    }).get({
      success: function (res) {
        that.setData({ 
          apt: res.data[0],
          showApt: util.showAppointment(res.data[0],app.globalData.userInfo)
        })
        app.globalData.currentApt=that.data.apt
      }
    })
  },

  // 获得用户信息
  autoGetUserInfo: function () {
    util.showBusy('正在登录')
    const session = qcloud.Session.get()
    if (session) {
      console.log(1)
      qcloud.loginWithCode({
        success: res => {
          this.getUserInfoSu(res);
        },
        fail: err => {
          this.getUserInfoFail(err);
        }
      })
    } else {
      console.log(2)
      this.logIn()
    }
  },
  logIn : function () {
    qcloud.login({
      success: res => {
        this.getUserInfoSu(res);
      },
      fail: err => {
        console.log(4)
        this.getUserInfoFail(err);
      }
    })
  },
  getUserInfoSu: function (res) {
    app.globalData.userInfo = res
    this.setData({
      showApt: util.showAppointment(this.data.apt, app.globalData.userInfo)
    })
    util.showSuccess('登录成功')
  },
  getUserInfoFail: function (err) {
    console.log(5)
    console.error(err)
    util.showModel('登录错误', err.message)
    //this.logIn()
  },

  updateArr: function (pArr, pAttends) {
    var tArr = util.deepClone(pArr)
    var tRecord = util.newRecord(app.globalData.userInfo, pAttends)
    var flag = false;
    for (var i in tArr) {
      if (tArr[i]._openid == app.globalData.userInfo._openid) {
        tArr[i] = tRecord
        flag = true
      }
    }
    if (!flag) { tArr.push(tRecord) }
    return tArr
  },
  updateApt: function (pRecords){
    var that = this
    var tID = this.data.apt._id;
    app.globalData.aptCollection.doc(tID).update({
      data: {
        records: pRecords
      },
      success: function (res) {
        that.checkUser()
        that.getApt(that.data.apt._id)
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },

  checkUser: function () {
    var that = this;
    app.globalData.userCollection.where({
      _openid: app.globalData.userInfo.openId
    }).get({
      success: function (res) {
        if(res.data.length==0){
          that.addUser()
        } else {
          that.updateUser()
        }
      }
    })
  },
  addUser: function () {
    var tUser={}
    tUser._id = app.globalData.userInfo.openId
    tUser.apts=[]
    tUser.apts.push(this.data.apt._id)
    const col = app.globalData.userCollection;
    col.add({
      data: tUser,
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
      }
    })
  },
  updateUser: function () {
    var tID = app.globalData.userInfo.openId;
    const _ = app.globalData.db.command
    app.globalData.userCollection.doc(tID).update({
      data: {
        apts: _.push(this.data.apt._id)
      },
      success: function (res) {
        
      },
      fail: function (e) {
        console.log(e);
      }
    })
  }
})