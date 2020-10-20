// canvas 全局配置 canvas-Imagedata
var context = null;// 使用 wx.createContext 获取绘图上下文 context
var contextsmall=null;
var isButtonDown = false; //指尖是否接触
var arrx = [];
var arry = [];
var arrz = [];
var canvasw = 0;
var canvash = 0;
var btnheight=0;
var linewidth = 1;
var eraser = false;
var color_R = 0;
var color_G = 0;
var color_B = 0;
var colorchoosetext=[];
var colorselected=[];
var filetemp=[];
var filetempundo=[];
var filetempredo=[];
var importfile=[];
var imgwidth = [];
var imgheight = [];
var rpx;

var g_sharedscreen = false;
var resfileID = [];

var g_openid=[];
var g_usernickName=[];
var g_userUrl=[];
var g_roomnum=0;
var g_connect=false;//0-init 1-user1-connect 2-user2-connect
const db = wx.cloud.database()
const watcher = null


var image_get=[]
//var sMD5 = require('../utils/spark-md5.js')

//获取系统信息
wx.getSystemInfo({
  success: function (res) {
    rpx = res.windowWidth/375;
    canvasw = rpx*375;//设备宽度
    canvash = 0.68*rpx*(res.windowHeight);
    btnheight = 0.2 * rpx * (res.windowHeight);
    console.log(canvasw);
    console.log(canvash);
  }
});

//注册页面-
Page({
  data: {
    pathCount:0,
    contextCount:0,
    curContexts: [],
    actionsnow:[],

    canvasWidth: canvasw,
    canvasHeight: canvash,
    buttonsHeight: btnheight,

    rubberison: false,
    showModal: false,
    sharescreen_p: false,
    connectStatus: false,//0,//0-init 1-user1-connect 2-user2-connect
    roomnum:[],

    clickId: -1,
    linewidthnow:1,
    colorselected: 'black',
    colorchoosetext: 'color_default',
    colorNeutraltext: ['OffWhite', 'Cream', 'Beige', 'Sand', 'Camel', 'Brown'],
    colorNeutral: ['#EFEEE5', '#E8E1C7', '#CDBB99', '#A69373', '#967353', '#664D3B'],
    colorGreytext: ['Silver', 'LightGrey', 'LightCoolGrey', 'Grey', 'DarkGrey', 'Charcoal'],
    colorGrey: ['#BDBEBF', '#ABB1B3', '#7A8387', '#6A6A6A', '#3F3E47', '#2D3036'],
    colorBluetext: ['LightBlue', 'SeaBlue', 'Turquoise', 'Lavender', 'Royal', 'Navy'],
    colorBlue: ['#A1CCDE', '#00A4B5', '#008CB7', '#9B90C8', '#2E4DA7', '#373E4B'],
    colorYellowtext: ['Yellow', 'Gold', 'Ochre', 'Orange', 'Bronze', 'Rust'],
    colorYellow: ['#F6C324', '#CA981E', '#C4994B', '#DD7A39', '#91672C', '#9F5235'],
    colorPinktext: ['Pink', 'DeepPink', 'Fuchsia', 'Red', 'Burgundy', 'Purple'],
    colorPink: ['#E38FB7', '#FF1493', '#CB2F70', '#BC243C', '#852839', '#473053'],
    colortext: ['Mint', 'AppleGreen', 'Green', 'ArmyGreen', 'Olive', 'Khaki'],
    colorArray: ['#A9D1BD', '#71CC51', '#9DAA4A', '#6B7139', '#666339', '#5A523C'],
  },

  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },

  canvasStart: function (event) {
    context.save();
    if (!this.data.showModal){
      var that = this;
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        canvasId: 'canvas',
        success: function (res) {
          filetempundo = res.tempFilePath;
          //console.log("canvasStart_filetempundo_then_upload:" + res.tempFilePath)
        }
      });
    isButtonDown = true;
    arrz.push(0);
    arrx.push(event.changedTouches[0].x);
    arry.push(event.changedTouches[0].y);
    }
  },

  canvasMove: function (event) {
    if (isButtonDown) {
      arrz.push(1);
      arrx.push(event.changedTouches[0].x);
      arry.push(event.changedTouches[0].y);
      //-----
      var arr = new Array();
      this.data.curContexts[this.data.pathCount] = arr;
      this.setData({
        curContexts: this.data.curContexts,
        contextCount: 0,
      })
      //-----
    }
    context.beginPath()
    if(eraser) //橡皮擦部分
    {
      context.setLineWidth(linewidth+4);
      for (var i = 0; i < arrx.length; i++) {
        if (arrz[i] == 0) {
          context.moveTo(arrx[i], arry[i])
        } else {
          context.clearRect(arrx[i] - (linewidth + 4), arry[i] - (linewidth + 4), 2 * (linewidth + 4), 2 * (linewidth + 4))
        }
      }
      context.stroke();
    }
    else //绘制部分
    {
      context.setStrokeStyle(this.data.colorselected);
      context.setLineWidth(linewidth);
      for (var i = 0; i < arrx.length; i++) {
      if (arrz[i] == 0) {
        context.moveTo(arrx[i], arry[i])
      } else {
        context.lineTo(arrx[i], arry[i])
      }
    }
    context.stroke();
    }

    var actions = context.getActions();
    console.log("actions ");
    console.log(actions);
    this.data.curContexts[this.data.pathCount][this.data.contextCount] = actions;
    this.data.actionsnow=actions;
    wx.drawCanvas({
      canvasId: 'canvas',
      reserve: true,
      actions: actions
      //this.data.curContexts[this.data.pathCount][this.data.contextCount]// 获取绘图动作数组
    });
    this.data.contextCount++;
    console.log("pathCount");
    console.log(this.data.pathCount);
    console.log("contextCount");
    console.log(this.data.contextCount);

  },

  canvasEnd: function (event) {
    isButtonDown = false;
    arrx = [];
    arry = [];
    arrz = [];
    var that = this;

    //-----
    if(this.data.pathCount<=6){
      this.setData({
        pathCount: (this.data.pathCount + 1),
        contextCount: 0
      });
    }
    else
    {
      this.setData({
        pathCount: 1,
        contextCount: 0
      });
    }

    //-----
 
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'canvas',
      success: function (res) {
        filetempredo = res.tempFilePath;
        //console.log("canvasEnd_filetempredo_then_upload:" + res.tempFilePath)
        if (g_sharedscreen&&g_connect)
        {
          that.uptoserver(res.tempFilePath).then(res=>{
            if (true||res.errMsg === "cloud.uploadFile:ok")
            {
              //console.log("cloud.uploadFile:ok_statusCode" + res.statusCode)
              //
              var action_up = that.data.actionsnow//that.data.curContexts[that.data.pathCount - 1][that.data.contextCount];
              //console.log("action_up");
              //console.log(action_up);

              //setTimeout(function () {
                wx.cloud.callFunction({
                  name: 'penciladd',
                  data: {
                    user: {
                      name: g_usernickName,
                      avatarUrl: g_userUrl,
                      joinTime: new Date(),
                      room_num: g_roomnum,
                      visit_times: 1,
                      //image: this.data.curContexts[this.data.pathCount - 1][this.data.contextCount]
                    }
                  }
                })
                wx.cloud.callFunction({
                  name: 'useradd',
                  data: {
                    user: {
                      name: g_usernickName,
                      avatarUrl: g_userUrl,
                      joinTime: new Date(),
                      room_num: g_roomnum,
                      visit_times: 1
                    }
                  }
                })

                wx.cloud.callFunction({
                  name: 'Imagetras',
                  data: {
                      room_num: g_roomnum,
                      userid: g_openid,
                    image_get: action_up,
                      flag:"up"
                  },
                    complete: res => {
                    //console.log('action_up')
                    //console.log(res.result)
                  },
                })
              //}, 200);//endTimeout
            }
          })
          
        }
      }
    });
  },

  /**
  * 回退一步
  */
  back: function (options) {
    context.drawImage(filetempundo, 0, 0, canvasw, canvash);
    context.draw();
    //var that= this
    if (g_sharedscreen&&g_connect) {
      //var that = this
      //that.uptoserver(filetempundo);
     this.uptoserver(filetempundo).then(function (res) {
       if (res.errMsg === "cloud.uploadFile:ok") {
         console.log("cloud.uploadFile_id:" + res.fileID)
         //setTimeout(function () {
           wx.cloud.callFunction({
             name: 'penciladd',
             data: {
               user: {
                 name: g_usernickName,
                 avatarUrl: g_userUrl,
                 joinTime: new Date(),
                 room_num: g_roomnum,
                 visit_times: 1,
                 //image:image_get
               }
             }
           })
           wx.cloud.callFunction({
             name: 'useradd',
             data: {
               user: {
                 name: g_usernickName,
                 avatarUrl: g_userUrl,
                 joinTime: new Date(),
                 room_num: g_roomnum,
                 visit_times: 1
               }
             }
           })
         //}, 200);//endTimeout
        }
      })

    }
    //console.log(this.data.colorselected);
  },
  forward: function (options) {
    context.drawImage(filetempredo, 0, 0, canvasw, canvash);
    context.draw();
    if (g_sharedscreen&&g_connect) {
      this.uptoserver(filetempredo).then(function (res) {
        if (res.errMsg === "cloud.uploadFile:ok") {
          console.log("cloud.uploadFile_id:" + res.fileID)
          //setTimeout(function () { 
            wx.cloud.callFunction({
              name: 'penciladd',
              data: {
                user: {
                  name: g_usernickName,
                  avatarUrl: g_userUrl,
                  joinTime: new Date(),
                  room_num: g_roomnum,
                  visit_times: 1,
                  //image: image_get
                }
              }
            })
            wx.cloud.callFunction({
              name: 'useradd',
              data: {
                user: {
                  name: g_usernickName,
                  avatarUrl: g_userUrl,
                  joinTime: new Date(),
                  room_num: g_roomnum,
                  visit_times: 1
                }
              }
            })
          //}, 200);
        }
      })

    }
  },
  bolder: function () {
    if (linewidth < 10)
      linewidth++;
    else
      linewidth = 10;
    this.linewidthshow();
    this.setData({ linewidthnow: linewidth });
  },
  thinner: function () {
    if (linewidth > 1)
      linewidth--;
    else
      linewidth = 1;
    this.linewidthshow();
    this.setData({ linewidthnow: linewidth });
  },
  rubber: function () {
    eraser = !eraser;
    this.setData({
      rubberison: !this.data.rubberison
    })
  },
  linewidthshow:function(){
    //console.log('lineshow');
    contextsmall.setStrokeStyle(this.data.colorselected);
    contextsmall.setLineWidth(linewidth);
    contextsmall.moveTo(0, 20);
    contextsmall.lineTo(40, 20);
    contextsmall.stroke();
    contextsmall.draw(false);
  },
  preventTouchMove:function(e){
  },
  colorchoose: function () {
    this.setData({
      showModal: true
    })
  },
  changeNeutralColor: function (e) {
    this.setData({
      colorselected: this.data.colorNeutral[e.currentTarget.id],
      colorchoosetext: this.data.colorNeutraltext[e.currentTarget.id]
    })
  },
  changeGreyColor: function (e) {
    this.setData({
      colorselected: this.data.colorGrey[e.currentTarget.id],
      colorchoosetext: this.data.colorGreytext[e.currentTarget.id]
    })
  },
  changeBlueColor: function (e) {
    this.setData({
      colorselected: this.data.colorBlue[e.currentTarget.id]
    })
    this.setData({
      colorchoosetext: this.data.colorBluetext[e.currentTarget.id]
    })
  },
  changeYellowColor: function (e) {
    this.setData({
      colorselected: this.data.colorYellow[e.currentTarget.id],
      colorchoosetext: this.data.colorYellowtext[e.currentTarget.id]
    })
  },
  changePinkColor: function (e) {
    this.setData({
      colorselected: this.data.colorPink[e.currentTarget.id],
      colorchoosetext: this.data.colorPinktext[e.currentTarget.id]
    })
  },
  changeColor: function (e) {
    this.setData({
      colorselected: this.data.colorArray[e.currentTarget.id],
      colorchoosetext: this.data.colortext[e.currentTarget.id]
    })
  },
  onConfirm: function () {
    context.setStrokeStyle(this.data.colorselected);
    this.hideModal();
    this.linewidthshow();
  },
  cleardraw: function () {
    //清除画布
    //------
    arrx = [];
    arry = [];
    arrz = [];
    context.clearRect(0, 0, canvasw, canvash);
    context.draw(true);
    this.setData({
      pathCount:0,
      contextCount: 0
    });
    return;
  },
  

  //connect and upload the file
  //press 'share' button
  connectrequest:function(e){
    g_roomnum = e.detail.value.roomnum
    //console.log(this.data.roomnum)
    g_sharedscreen = !g_sharedscreen; //开启此功能
    this.setData({
      sharescreen_p:!this.data.sharescreen_p
    })
    if (g_sharedscreen){  //true sharescreen open
      wx.showToast({title: 'Sharescreen Open'})
      //console.log('Sharescreen Open')
      var that=this
      var r_temp = wx.cloud.callFunction({
        name: 'roomadd',
        data: {
          room_num: g_roomnum,
          userid: g_openid
        }
      })
      r_temp.then(function (promisevalue) {
        //console.log('promisevalue_open:'+promisevalue.result)
        if (promisevalue.result == 'room_created_forone') {
          setTimeout(function () {that.setRoomWatcher(g_roomnum)}, 5000);
        }
        else if (promisevalue.result == 'room_already_fortwo') {
          g_connect=true;
          that.setData({
            connectStatus: true
          })
          //console.log("filetempredo_share" + filetempredo)
          that.uptoserver(filetempredo)
          //room ok then add listener of friend on friend_id
          var r = db.collection('rooms').where({ room_id: g_roomnum }).get({
            success: function (res) {
              //console.log("friend_id:"+res.data[0].user1_openid)
              that.setWatcherOpenid(res.data[0].user1_openid)
              /*
              //room ok then add listener of friend on friend_doc_id
              db.collection('client').where({ openid: res.data[0].user1_openid }).get({
                success: function (res_doc) {
                  console.log("friend_doc:"+res_doc.data[0]._id)
                  that.setWatcher(res_doc.data[0]._id)
                }
              })
              */
            }
          })

          
          
        }
        else
        {
          console.log('Unpredicted result from roomadd')
        }
      })
      /*
      wx.cloud.callFunction({
        name: 'roomadd',
        data: {
          room_num:g_roomnum,
          userid: g_openid
        },
        success: function (promisevalue){
          console.log('r_temp_result:' + promisevalue.result)
          if (promisevalue.result == 'room_created_forone') {
            that.setRoomWatcher(g_roomnum)
          }
          else if (promisevalue.result == 'room_already_fortwo') {
            console.log("filetempredo_share" + filetempredo)
            that.uptoserver(filetempredo)
            var r = db.collection('rooms').where({ room_id: g_roomnum }).get({
              success: function (res) {
                console.log(res.data)
              }
            })
        }
      }, 
        fail: console.err
      })
      */
      
    }
    else {//false sharescreen close 
      wx.showToast({ title: 'Sharescreen Close' })
      //console.log('Sharescreen Close')
      var that = this
      var r_exittemp = wx.cloud.callFunction({
        name: 'roomexit',
        data: {
          room_num: g_roomnum,
          userid: g_openid
        }
        /*, success: function (promisevalue){
          console.log('r_temp:' + promisevalue.result)
        }*/
      })
      r_exittemp.then(function (promisevalue) {
        //console.log('promisevalue_result' + promisevalue.result)
        if (promisevalue.result==="room_delete")//
        {
          g_connect = false;
          that.setData({
            connectStatus: false
          })
        }
      })
    }

  },
 
  uptoserver: function (filetemp_in){
 /*
    return wx.cloud.uploadFile({
      cloudPath: g_roomnum + '.png',
      //cloudPath: '1e4e8afd044473954ea86677d4c6155e.jpg', // 上传至云端的路径
      filePath: filetemp_in,})
      */
    wx.canvasGetImageData({
      canvasId: 'canvas',
      x: 0,
      y: 0,
      width: canvasw,
      height: canvash,
      success(res) {
        image_get=res.data
        return Promise.resolve("successGetImage");
        //console.log(res.width) // 100
        //console.log(res.height) // 100
        //console.log(res.data instanceof Uint8ClampedArray) // true
        //console.log(res.data.length) // 100 * 100 * 4
      }
    })
    return Promise.resolve("successGetImage");
  },
  dofromserver:function(){

    wx.cloud.downloadFile({
      fileID: 'cloud://sherrysolitude-0f46ca.7368-sherrysolitude-0f46ca/'+g_roomnum+'.png',
      //fileID: g_roomnum+'.jpg',
      success: res => {
        // 返回临时文件路径
        console.log("download fileID: "+res.tempFilePath)
        context.drawImage(res.tempFilePath, 0, 0, canvasw, canvash);
        context.draw();
      },
      fail: 
        console.error
    })
  },
  
   //import
  importimage:function(){
    //const importfile;
    wx.chooseImage({
      count: 1,
      sizeType: ['original','compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        importfile = res.tempFilePaths[0];
        wx.getImageInfo({
          src: importfile,
          success: function (res) {
              imgwidth=res.width;
              imgheight=res.height;
              if(imgwidth/imgheight>canvasw/canvash){
            context.drawImage(importfile, 0, 0, canvasw, canvasw * imgheight / imgwidth);}
              else { context.drawImage(importfile, 0, 0, canvash*imgwidth/imgheight, canvash);}
            context.draw();
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              canvasId: 'canvas',
              success: function (res) {
                filetemp = res.tempFilePath;
              }
            });
          }
        });
      },fail(res){
        wx.showModal({
          title: 'Warning',
          content: 'choose image failure！',
          showCancel: false
        });
      }
    });
  },


  //export按钮的getimg
  getimg: function () {
    /*
    if (arrx.length == 0) {
      wx.showModal({
        title: 'Warning',
        content: 'No pic no save！',
        showCancel: false
      });
      return false;
    };
    */
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      //width: 700,
      //height: 800,
      //destWidth: canvasw,
      //destHeight: canvash,
      canvasId: 'canvas',
      success: function (res) {
        filetemp = res.tempFilePath;
        //console.log(res.tempFilePath);
      }
    });
    wx.getSetting({
      success(res) {
        // 如果没有则获取授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log("get authorized");
              wx.saveImageToPhotosAlbum({
                filePath: filetemp,
                success() {
                  wx.showToast({
                    title: 'Save success'
                  });
                },
                fail:function(error) {
                  console.log(error);
                  wx.showToast({
                    title: 'Save failure'
                  });
                }
              });
            },
            fail() {
              console.log("fail to get authorized");
            }
          });
        }
        else {
          wx.saveImageToPhotosAlbum({
            filePath: filetemp,
            success() {
              wx.showToast({
                title: 'Save success'
              });
            },
            fail:function(error) {
              console.log(error);
              wx.showToast({
                title: 'Save failure'
              });
            }
          });
        }
      }
    });


  },
  /**
   * 页面的初始数据
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
 

  /**
   * 生命周期函数--监听页面加载
   */
  setWatcherOpenid: function (friend_id) {
    //console.log('setWatcherOpenid>>friend_id:' + friend_id)
    var that = this;
    this.watcher = db.collection('client').where({openid:friend_id}).watch({
      onChange: function (snapshot) {
        //监控数据发生变化时触发
        //console.log('====WatcherOpenid====')
        //console.log('docs\'s changed events', snapshot.docChanges)
        //console.log('docs\'s changed events', snapshot.docChanges[0].dataType)
        //console.log('query result snapshot after the event', snapshot.docs)
        //console.log('is init data', snapshot.type === 'init')
        //console.log('====setWatcherOpenid end====')
        if (g_sharedscreen && g_connect && !(snapshot.type === 'init')) {
          //console.log("snapshot dataType:" + snapshot.docChanges[0].dataType)
          if (snapshot.docChanges[0].dataType==="remove")//一方退出房间
          {
            g_connect=false;
            that.setData({
              connectStatus: false
            })
          }
          //else if (snapshot.docChanges[0].dataType === "add")
          //{
            //setTimeout(function () { that.setRoomWatcher(g_roomnum) }, 5000);
          //} 
          else{//未退出而有更新-更新
            //console.log('====WatcherOpenid then download====')
            //setTimeout(function () { 
              var restempdownloadfile=[];
              wx.cloud.callFunction({
                name: 'Imagetras',
                data: {
                  room_num: g_roomnum,
                  userid: g_openid,
                  image_get: [],
                  flag: "do"
                },
                complete: res => {
                  //console.log('res')
                  //console.log(res.result)
                  wx.drawCanvas({
                    canvasId: 'canvas',
                    reserve: true,
                    actions: res.result// 获取
                  });
                  //console.log('callFunction test result: ', res)
                },
              })
              //}, 2000);
          }
        }
      },
      onError: (err) => {
        console.error(err)
      }
    })
  },
  setRoomWatcher:function(room_in){
    console.log('setRoomWatcher>>g_roomnum:' + g_roomnum)
    var that = this;
    db.collection('rooms').where({room_id: room_in}).get({
      success:function(res){
        //console.log(res)
        if (typeof(res.data[0].user2_openid)==="undefined")
        {
          wx.showToast({
            title: 'User2 Time out!!'
          })
        }
        else if (res.data[0].user2_openid==="EXIT")
        {
          wx.showToast({
            title: 'User2 EXIT!!'
          })
        }
        else
        {
            g_connect = true;
            that.setData({
            connectStatus: true
          })
          that.setWatcherOpenid(res.data[0].user2_openid)
          /*
          db.collection('client').where({ openid: res.data[0].user2_openid }).get({
            success: function (res_doc) {
              console.log("friend_doc:" + res_doc.data[0]._id)
              that.setWatcher(res_doc.data[0]._id)
            }
          })
          */
        }
      }
    })
    /*
    this.watcher = db.collection('rooms').where({
      room_id: g_roomnum
    }).watch({
      onChange: function (snapshot) {
        console.log('====Room watch====')
        //console.log(g_openid)
        console.log('docs\'s changed events', snapshot.docChanges)
        console.log('query result snapshot after the event', snapshot.docs)
        console.log('is init data', snapshot.type === 'init')
        if (!(snapshot.type === 'init'))
        {
          g_connect = true;
          that.setData({
          connectStatus: true
        })
        }
        console.log('====Room watch end====')
        //if (g_sharedscreen) { that.dofromserver() }
      },
      onError: (err) => {
        console.error(err)
      }
    })
    */
  },
  onLoad: function (options) {
    // 使用 wx.createContext 获取绘图上下文 context
    context = wx.createCanvasContext('canvas'); //画布大窗口
    contextsmall = wx.createCanvasContext('canvasmall');//左侧的看笔触的小窗口
    this.setData({
      canvasWidth: canvasw,
      canvasHeight: canvash
    })
    context.beginPath();
    context.setStrokeStyle('#000000');
    //context.setLineWidth(1);
    context.setLineCap('round');
    context.setLineJoin('round');
    contextsmall.beginPath();
    contextsmall.setStrokeStyle('black');
    //context.setLineWidth(1);
    contextsmall.setLineCap('round');
    contextsmall.setLineJoin('round');
    this.linewidthshow();
    

    console.log('---------onLoad---------')
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              var info = res.userInfo
              g_usernickName = info.nickName
              g_userUrl = info.avatarUrl
              var r_test = wx.cloud.callFunction({
                name: 'useradd',
                data: {
                  user: {
                    name: g_usernickName,
                    avatarUrl: g_userUrl,
                    joinTime: new Date(),
                    room_num:Math.random().toString(36).substr(2,15),
                    visit_times: 1,
                    //connect:false
                  }
                }
              })
              var that = this;
              r_test.then(function (promisevalue) {
                g_openid = promisevalue.result,
                  wx.canvasToTempFilePath({
                  x: 0,
                  y: 0,
                  canvasId: 'canvas',
                  success: function (res) {
                    filetempredo = res.tempFilePath;
                    console.log("filetempredo_load_1:" + filetempredo)
                    if (g_sharedscreen&&g_connect) {
                      console.log("filetempredo_load_2:" + filetempredo)
                      that.uptoserver(filetempredo);
                      //console.log("watcher set")
                    }
                  },
                   fail: console.error
                });
              })
            }
          })
        } else {
          wx.redirectTo({
            url: '../pages/canvas',
          })
        }

      }
    })
    //that.setWatcher()
    //var that = this;
    
    //const db = wx.cloud.database()
    //const wxContext = cloud.getWXContext()
    //console.log('watcher'+watcher)
    
       


  }
})//注册页面-end-