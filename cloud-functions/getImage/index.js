const cloud = require('wx-server-sdk')
const axios = require('axios')
var rp = require('request-promise');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  try {
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

    return await cloud.uploadFile({
      cloudPath: 'xcxcodeimages/' + Date.now() + '.png',
      fileContent: response.data,
    });
  } catch (err) {
    console.log('>>>>>> ERROR:', err)
  }
}