const cloud = require('wx-server-sdk')
var rp = require('request-promise');

cloud.init({
  env: 'test-f83f7a',
  traceUser: true,
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const resultValue = await rp('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxeaf289464a1bf1cb&secret=bd8cc61872b7abe8578421f0a3ed7ae0')
    const token = JSON.parse(resultValue).access_token;
    console.log('------ TOKEN:', token);
    

    const db = cloud.database()
    const atCollection = db.collection('Access_Token');
    return await atCollection.doc("XCNfvFsqTi00tk6a").update({
      data: {
        token: token,
        timeStamp : new Date()
      }
    })

  } catch (err) {
    console.log('>>>>>> ERROR:', err)
  }
}
