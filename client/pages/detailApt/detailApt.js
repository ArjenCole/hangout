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
    prevPage: {},

    select: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (typeof (options.aptId)=='undefined'){
      this.getAptFromIndex(options)
    } else {
      this.getApt(options.aptId)
    }
  },


  bindShowSelectBox() {
    this.setData({
      select: !this.data.select
    })
  },
  mySelect(e) {
    var name = e.currentTarget.dataset.name
    this.setData({//关起下拉菜单
      select: false
    })
  },

  getAptFromIndex: function (options) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    this.setData({
      prevPage: pages[pages.length - 2]
    })

    var tListIdx = 0;
    if (options.list == "post") {
      tListIdx = 0;
    } else {
      tListIdx = 1;
    }
    var tApt = this.data.prevPage.data.list[tListIdx].apts[options.idx]
    this.setData({
      apt: tApt,
      showApt: util.showAppointment(tApt, app.globalData.userInfo)
    }) 
  },
  getApt: function (pId) {
    var that = this;
    app.globalData.aptCollection.where({
      _id: pId
    }).get({
      success: function (res) {
        that.setData({
          apt: res.data[0],
          showApt: util.showAppointment(res.data[0], app.globalData.userInfo)
        })
      },
      fail: function (res) {
        console.log("getAptFail", res)
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (ops) {
    var tTitle = '邀请你参加活动';; var tPath = "";
    //if (ops.from === 'button') {
      // 来自页面内转发按钮
      if(app.globalData.userInfo!==null){
        tTitle = app.globalData.userInfo.nickName + tTitle
      }
      tPath = '/pages/index/index?aptId=' + this.data.apt._id;//分享地址
      //tPath = '/pages/detailApt/detailApt?aptId=' + this.data.apt._id;//分享地址

    //}
    console.log(tPath)
    this.setData({//关起下拉菜单
      select: false
    })
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
    this.setData({//关起下拉菜单
      select: false
    })
  },
  bindGetUserInfo: function () {
    this.autoGetUserInfo()
    this.setData({//关起下拉菜单
      select: false
    })
  },
  bindDenyTap: function () {
    if (app.globalData.userInfo !== null) { 
      util.showBusy('正在取消')
      this.updateApt(this.updateArr(this.data.apt.records, "deny"), "deny")
    }else{
      console.log("尚未登陆")
    }
    this.setData({//关起下拉菜单
      select: false
    })
  },
  bindJoinTap: function () {
    if (app.globalData.userInfo !== null) {
      util.showBusy('正在报名')
      this.updateApt(this.updateArr(this.data.apt.records, "join"), "join")
    }
    this.setData({//关起下拉菜单
      select: false
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
    var tRecord = util.newRecord(app.globalData.userInfo)
    var index =-1
    for (var i in tArr) {
      if(tArr[i]==null){continue}
      if (tArr[i].openId == app.globalData.userInfo.openId) {
        index=i
        continue
      }
    }
    if (index >= 0) {
      if (pAttends == "join") {
        tArr[index] = tRecord
      } else {
        tArr.splice(index, 1)
      }
    } else {
      tArr.push(tRecord) 
    }
    return tArr
  },
  updateApt: function (pRecords, pAttends){
    var that = this
    var tID = this.data.apt._id;
    wx.cloud.callFunction({
      name: 'updateAptRecords',
      data: {
        pId: tID,
        pRecords: pRecords,
      },
    })
      .then(res => {
        console.log("res1", res.result) // 3
        if(pAttends=="join"){
          that.checkUser()
        }else{
          that.deleteUser()
        }
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
        util.showSuccess('报名成功')
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
        util.showSuccess('报名成功')
      },
      fail: function (e) {
        util.showModel('报名失败', e)
        console.log(e);
      }
    })
  },
  deleteUser: function () {
    var partList = null
    if (typeof (this.data.prevPage.data)=='undefined'){
      this.getPartList()
    }else{
      partList = this.data.prevPage.data.partList
      this.deleteUser1(partList)
    }


  },
  getPartList: function () {
    var that = this
    app.globalData.userCollection.where({
      _openid: app.globalData.userInfo.openId
    }).get({
      success: function (res) {
        that.deleteUser1(res.data[0].apts) 
      }
    })
  },
  deleteUser1: function (partList) {
    var tID = app.globalData.userInfo.openId;
    var index = -1
    for (var i in partList) {
      if (partList[i] == this.data.apt._id) { index = i }
    }
    if (index < 0) { return }
    partList.splice(index, 1)
    const _ = app.globalData.db.command
    app.globalData.userCollection.doc(tID).update({
      data: {
        apts: partList
      },
      success: function (res) {
        util.showSuccess('取消成功')
      },
      fail: function (e) {
        util.showModel('取消失败', e)
        console.log(e);
      }
    })
  },

  getFormID: function (e) {
    /*console.log(e.detail)
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
    })*/
  }
})