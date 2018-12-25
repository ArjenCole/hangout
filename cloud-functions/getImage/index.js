/*var rp = require('request-promise');
const fs = require('fs');
var stream = require('stream');
// 云函数入口函数
exports.main = async (event, context) => {
  var res = await rp(
    {
      url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + event.access_token,
      responseType: 'arraybuffer',  //设置响应类型 
      data: {
        scene: event.scene,
        page: event.page
      },
      method: "POST",
      header: {
        'content-type': 'application/json'
      }, 
      json: true  //是否json数据
    }
  ).then((body) => {
    console.log(body)
    //var src2 = wx.arrayBufferToBase64(body.data);  //对数据进行转换操作 
    return body
  }).catch(err => {
    return err
  })
  return res;
}
*/

const cloud = require('wx-server-sdk')
const axios = require('axios')
var rp = require('request-promise');
// 云函数入口函数
exports.main = async (event, context) => {
  const response = await axios({
    method: 'post',
    url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit',
    responseType: 'stream',
    params: {
      access_token: event.access_token,
    },
    data: {
      page: event.page,
      width: 300,
      scene: "id=" + event.id,
    },
  });

  return response
}