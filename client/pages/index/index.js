//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app=getApp()


Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    imgUrl: '',

    xcxCodeImageData:{},
    Access_Token:"",

    postList: [],
    partList: [],

    list: [
      {
        id: 'post',
        name: '发起的活动',
        open: false,
        apts: [],
        showApts: []
      },
      {
        id: 'part',
        name: '参加的活动',
        open: true,
        apts: [],
        showApts: []
      },
    ]
  },
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  },
  bindSwitch: function () {
    wx.showActionSheet({
      itemList: ['切换为场馆模式'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)      
          wx.redirectTo({
            url: '../siteIndex/siteIndex'
          })
        }
      }
    });
  },


  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    var tURL ='?aptId='
    if (typeof (options.scene) !== 'undefined') {//小程序码进入
      // scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
      tURL = tURL + decodeURIComponent(options.scene)
    } else if (typeof (options.aptId) !== "undefined") {//分享卡片进入
      tURL = tURL + options.aptId
    } else {//首页进入
      tURL = ""
    }
    if(tURL !== ""){
      wx.navigateTo({
        url: '../detailApt/detailApt' + tURL
      })
    }
    
  },
  onShow: function () {
    if (app.globalData.userInfo !== null) {
      this.setData({ userInfo: app.globalData.userInfo, logged: true }) 
    }

    if (this.data.logged) {
      this.getPostList() 
      this.getPartList()
    }

  },

  bindGetUserInfo: function () {
    this.autoGetUserInfo()
  },
  bindItemClick: function (e) {
    var currentApt = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '../detailApt/detailApt?aptId=' + currentApt._id
    })
  },
  bindNewItem: function () {
    wx.navigateTo({
      url: '../newApt/newApt'
    })
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
    this.getPostList()
    this.getPartList() 
  },
  getUserInfoFail: function (err) {
    console.error(err)
    if (err.message =="用户未登录过，请先使用 login() 登录"){
      this.logIn()
    } else {
      util.showModel('登录错误', err.message)
    }
  },

  getPostList: function () {
    var that = this
    app.globalData.aptCollection.where({
      _openid: app.globalData.userInfo.openId
    }).get({
      success: function (res) {
        let tList = that.data.list
        tList[0].apts = res.data
        tList[0].showApts = util.showAptList(res.data)
        that.setData({list : tList})
      }
    })
  },
  getPartList: function () {
    var that = this
    app.globalData.userCollection.where({
      _openid: app.globalData.userInfo.openId
    }).get({
      success: function (res) {
        that.setData({
          partList: res.data[0].apts
        }) 
        that.getPartListApts(res.data[0].apts)
      }
    })
  },
  getPartListApts: function (pList) {
    var that = this
    const _ = app.globalData.db.command
    app.globalData.aptCollection.where({
      _id: _.in(pList)
    }).get({
      success: function (res) {
        let tList = that.data.list
        tList[1].apts = res.data
        tList[1].showApts = util.showAptList(res.data)
        that.setData({ list: tList })
      }
    })
  },


    // 切换是否带有登录态
    switchRequestMode: function (e) {
        this.setData({
            takeSession: e.detail.value
        })
        this.doRequest()
    },

    doRequest: function () {
        util.showBusy('请求中...')
        var that = this
        var options = {
            url: config.service.requestUrl,
            login: true,
            success (result) {
                util.showSuccess('请求成功完成')
                console.log('request success', result)
                that.setData({
                    requestResult: JSON.stringify(result.data)
                })
            },
            fail (error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
            }
        }
        if (this.data.takeSession) {  // 使用 qcloud.request 带登录态登录
            qcloud.request(options)
        } else {    // 使用 wx.request 则不带登录态
            wx.request(options)
        }
    },

    // 上传图片接口
    doUpload: function () {
        var that = this

        // 选择图片
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function(res){
                util.showBusy('正在上传')
                var filePath = res.tempFilePaths[0]

                // 上传图片
                wx.uploadFile({
                    url: config.service.uploadUrl,
                    filePath: filePath,
                    name: 'file',

                    success: function(res){
                        util.showSuccess('上传图片成功')
                        console.log(res)
                        res = JSON.parse(res.data)
                        console.log(res)
                        that.setData({
                            imgUrl: res.data.imgUrl
                        })
                    },

                    fail: function(e) {
                        util.showModel('上传图片失败')
                    }
                })

            },
            fail: function(e) {
                console.error(e)
            }
        })
    },

    // 预览图片
    previewImg: function () {
        wx.previewImage({
            current: this.data.imgUrl,
            urls: [this.data.imgUrl]
        })
    },




    addRecord: function(){
      wx.cloud.init();
      const db = wx.cloud.database();
      const bond = db.collection('bond');
      db.collection('bond').add({
        // data 字段表示需新增的 JSON 数据
        /*
        data: {
          // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
          description: "learn cloud database",
          due: new Date("2018-09-01"),
          tags: [
            "cloud",
            "database"
          ],
          // 为待办事项添加一个地理位置（113°E，23°N）
          location: new db.Geo.Point(113, 23),
          done: false
        }
        */
        data :{
          Name: "目标一",
          DateStart: new Date(Date.now()),
          DateStop: new Date("2019-09-01"),
          LowLomit: 360,
          DatesChecked: []
        },
        success: function (res) {
          // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
          console.log(res)
        }
      })
 
    },
    getRecord: function(){
      wx.cloud.init();
      const db = wx.cloud.database();
      const bond = db.collection('bond');

      db.collection('bond').where({
        _openid:this.data.userInfo.openId
      }).get({
        success:function(res){
          console.log("res.data._id:");
          console.log(res.data[0]);
          return res.data[0]._id;
        }
      })
    },
    updateRecord:function(){

      console.log("update")

      wx.cloud.init();
      const db = wx.cloud.database();
      const bond = db.collection('bond');

      const _ = db.command
      db.collection('bond').doc("W_VgQ5SXoyWmaEi7").update({
        data: {
          DatesChecked: _.push(new Date(Date.now()))
        },
        success: function (res) {
          console.log("su");          
          console.log(res)
        },
        fail: function (e){
          console.log("fa");          
          console.log(e);
        }
      })
    },
  
})
