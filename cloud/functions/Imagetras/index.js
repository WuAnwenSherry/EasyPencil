// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  //event参数是小程序调用时传入的参数，它本身自带一个字段userInfo，其中包含用户的openId和小程序的appId
  //const wxContext = cloud.getWXContext()
  var userid = event.userid
  var roomid = event.room_num
  var image = event.image_get
  var upordo = event.flag
  //user.openid = wxContext.OPENID
  console.log('event' + event)
  console.log(userid)
  console.log(roomid)
  var r = await db.collection('rooms').where({ room_id: roomid }).get()
  if (r.data.length > 0 && upordo==="up") { //room already exist - for user2
    //console.log("user2 add:" + r.data.user2_openid)
    var p = await db.collection('rooms').where({ //yuanxian 'await'
      room_id: roomid
    }).update({
      data: {
        imageshare: image
      }
    })
    return Promise.resolve('imagetrans_success')
  }
  else if (r.data.length > 0 && upordo === "do") { //room already exist - for user2
    //console.log("user2 add:" + r.data.user2_openid)
    return Promise.resolve(r.data[0].imageshare)
    /*
    var p = await db.collection('rooms').where({ //yuanxian 'await'
      room_id: roomid
    }).get({
      success: function (res) {
        console.log('res')
        console.log(res)
        return Promise.resolve(res.data[0].imageshare)
      },fail:function(){
        return Promise.resolve("get_wrong")
      }
    })
    */
    //return Promise.resolve('imagetrans_success')
  }
  else {//room need to be created - for user1

    return Promise.resolve('imagetrans_fail')
  
  }
}