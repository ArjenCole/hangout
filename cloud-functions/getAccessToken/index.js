const cloud = require('wx-server-sdk')
const axios = require('axios')
var rp = require('request-promise');

cloud.init({
  env: 'test-f83f7a',
  traceUser: true,
})
const db = cloud.database()
const atCollection = db.collection('Access_Token');

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await atCollection.where({
      _id: "XCNfvFsqTi00tk6a"
    }).get()
  } catch (e) {
    console.log(e)
  }

}
