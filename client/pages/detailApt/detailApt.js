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
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2]; 

    var tListIdx=0;
    if(options.list=="post"){
      tListIdx = 0;
    }else{
      tListIdx = 1;
    }
    var tApt = prevPage.data.list[tListIdx].apts[options.idx]
    this.setData({
      apt: tApt,
      showApt: util.showAppointment(tApt, app.globalData.userInfo)
    }) 
    //this.getApt(options.aptId)
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
  bindEditTap: function () {
    if (!this.data.showApt.editAble) { return }
    wx.navigateTo({
      url: '../newApt/newApt?aptId=' + this.data.apt._id,
    })
  },
  bindGetUserInfo: function () {
    this.autoGetUserInfo()
  },
  bindDenyTap: function () {
    if (app.globalData.userInfo !== null) { 
      this.updateApt(this.updateArr(this.data.apt.records, -1))
    }else{
      console.log("尚未登陆")
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
      },
      fail:function (res){
        console.log("getAptFail", res)
      }
    })
  },

  // 获得用户信息
  autoGetUserInfo: function () {
    util.showBusy('正在登录')
    const session = qcloud.Session.get()
    if (session) {
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
  logIn : function () {
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
    app.globalData.userInfo = res
    this.setData({
      showApt: util.showAppointment(this.data.apt, app.globalData.userInfo)
    })
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

  updateArr: function (pArr, pAttends) {
    var tArr = util.deepClone(pArr)
    var tRecord = util.newRecord(app.globalData.userInfo, pAttends)
    var flag = false;
    for (var i in tArr) {
      if(tArr[i]==null){continue}
      if (tArr[i].openId == app.globalData.userInfo.openId) {
        tArr[i] = tRecord
        flag = true
      }
    }
    if (!flag) { tArr.push(tRecord) }
    console.log(tArr)
    return tArr
  },
  updateApt: function (pRecords){
    var that = this
    var tID = this.data.apt._id;
    /*app.globalData.aptCollection.doc(tID).update({
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
    })*/
    wx.cloud.callFunction({
      // 云函数名称
      name: 'updateAptRecords',
      // 传给云函数的参数
      data: {
        pId: tID,
        pRecords: pRecords,
      },
    })
      .then(res => {
        console.log("res1", res.result) // 3
        that.checkUser()
        that.getApt(that.data.apt._id)
      })
      .catch(console.error)
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
  },


  getFormID: function (e) {
    console.log(e.detail)
    var self = this;
    let _access_token = '5_E1pZJQzTC-lC0r-JJz9wVAZv5Zv22CNtmV_7C1T0sqC9TV7mGE4FTmDX2B0PVM4LaGtaTfXwzfJLnD7fDKTg8DOICJNkKBQgn_Ot2zYmBJyY1g1VXoBNdtwUE0QaP8_9tWlbR-Zq7L1OyrrPKCIjAEAOGM';
    let url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + _access_token; 
    let _jsonData = {
      access_token: _access_token,
      touser: app.globalData.userInfo._openid,
      template_id: 'VRJi_vUV5ddCY_Hbfu29RbukAFlMfVu0mvBh',
      form_id: e.detail.formId,
      page: "pages/index/index",
      data: {
        "keyword1": { "value": "测试数据一", "color": "#173177" },
        "keyword2": { "value": "测试数据二", "color": "#173177" },
        "keyword3": { "value": "测试数据三", "color": "#173177" },
      }
    }
    wx.request({
      url: url,
      data: _jsonData,
      method: 'POST',
      success: function (res) {
        console.log(res)
      },
      fail: function (err) {
        console.log('request fail ', err);
      },
      complete: function (res) {
        console.log("request completed!");
      }
    })
  }
})