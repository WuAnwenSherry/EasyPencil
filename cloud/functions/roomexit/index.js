// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  //event参数是小程序调用时传入的参数，它本身自带一个字段userInfo，其中包含用户的openId和小程序的appId
  var userid = event.userid
  var roomid = event.room_num
  console.log('event' + event)
  console.log(userid)
  console.log(roomid)
  
  var res = await db.collection('rooms').where({ room_id: roomid }).get()
  //return Promise.resolve(res.data[0].user1_openid)
  //console.log(res)
  //console.log(res.data)
  
  if (res.data.length > 0) { //find room
    console.log(res)
    console.log("room_exit_info_user1:" + res.data[0].user1_openid)
    console.log("room_exit_info_user2:" + res.data[0].user2_openid)
    //remove client collection as exit 
    let r = await db.collection('client').where({ openid: userid }).remove() 
    //
    if (res.data[0].user1_openid === userid) { //usr1 ask to exit
      if (res.data[0].user2_openid === "EXIT" || typeof (res.data[0].user2_openid) =="undefined" ){
        let r=await db.collection('rooms').doc(res.data[0]._id).remove()
        //r.then(function(promisevalue){
          return Promise.resolve('room_delete')
        //})
      }
      else {
        let p =await db.collection('rooms').where({
          room_id: roomid
        }).update({
          data: {
            user1_openid: "EXIT"
          }
        })
        if(p._id && p._id!='')
        //p.then(function(promisevalue){
          return Promise.resolve("user1_exit")
       // })
        //if (p.user1_openid == 'EXIT')
        //  return Promise.resolve("user1_exit")
        //else
        //  return Promise.resolve("user1_exit_err")
      }
    }
    else if (res.data[0].user2_openid === userid) {
      if (res.data[0].user1_openid === "EXIT" || typeof(res.data[0].user1_openid)=="undefined") {
        let r = await db.collection('rooms').doc(res.data[0]._id).remove()

        //r.then(function (promisevalue) {
          return Promise.resolve('room_delete')
        //})
      }
      else {
        let p = await db.collection('rooms').where({
          room_id: roomid
        }).update({
          data: {
            user2_openid: "EXIT"
          }
        })
        if(p._id&&p._id!='')
        //p.then(function (promisevalue) {
          return Promise.resolve("user2_exit")
        //})
        
       // if (p.user2_openid == 'EXIT')
      //    return Promise.resolve("user2_exit")
       // else
       //   return Promise.resolve("user2_exit_err")
        
      }
    }
  } else {//not find room
    return Promise.resolve("no_room_exit_error")
  }

  
  /*
  db.collection('rooms').where({room_id: roomid}).get({
     success:function(res){
       console.log("res"+res.data)
       console.log("room_exit_info_user1:" + res.data.user1_openid)
       console.log("room_exit_info_user2:" + res.data.user2_openid)
       if (res.data.user1_openid == userid) {
         if (res.data.user2_openid == 'EXIT') {
           db.collection('rooms').doc(res.data._id).remove({
             success:function(res){
               return Promise.resolve('room_delete')
             }
           })
         }
         else {
           let p = await db.collection('rooms').where({
             room_id: roomid
           }).update({
             data: {
               user1_openid: 'EXIT'
             }
           })
           if (p.user1_openid == 'EXIT')
             return Promise.resolve("user1_exit")
           else
             return Promise.resolve("user1_exit_err")
         }
       }
       else if (res.data.user2_openid == userid) {
         if (res.data.user1_openid == 'EXIT') {
           db.collection('rooms').doc(res.data._id).remove({
             success:function(res){
               return Promise.resolve('room_delete')
             }
           })
         }
         else {
           let p = await db.collection('rooms').where({
             room_id: roomid
           }).update({
             data: {
               user2_openid: 'EXIT'
             }
           })
           if (p.user2_openid == 'EXIT')
             return Promise.resolve("user2_exit")
           else
             return Promise.resolve("user2_exit_err")
         }
       }
     },fail:function(err){
       return Promise.resolve("no_room_exit_error")
     }
  })
*/

}