//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
    onLaunch: function () {
      if (!wx.cloud) {//这步是将用户访问记录到用户管理中，在控制台中可见
        console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      }
      else {
        wx.cloud.init({
          env: 'test-f83f7a',
          traceUser: true,
        })
      }

      qcloud.setLoginUrl(config.service.loginUrl)
      //wx.cloud.init({ env: 'test-f83f7a' });
      this.globalData.db = wx.cloud.database();
      this.globalData.aptCollection = this.globalData.db.collection('hangout_apt');
      this.globalData.userCollection = this.globalData.db.collection('hangout_user');
    },

    globalData: {
      userInfo: null,
      db: null,
      aptCollection: null,
      userCollection: null,
    }
})