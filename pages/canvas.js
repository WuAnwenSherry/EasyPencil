// canvas 全局配置
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
//data:{
// rubberison:false
//  showModal:false
//  clickId:-1
// colorArray: ['#A9D1BD', '#71CC51', '#9DAA4A', '#6B7139', '#666339', '#5A523C']
//}
//注册页面-
Page({
  data: {
    pathCount:0,
    contextCount:0,
    curContexts: [],

    canvasWidth: canvasw,
    canvasHeight: canvash,
    buttonsHeight: btnheight,

    rubberison: false,
    showModal: false,
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
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        //width: canvasw,
        //height: canvash,
        //destWidth: canvasw,
        //destHeight: canvash,
        canvasId: 'canvas',
        success: function (res) {
          filetempundo = res.tempFilePath;
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
    }
    context.beginPath()
    if(eraser)
    {
      context.setLineWidth(linewidth+4);
      for (var i = 0; i < arrx.length; i++) {
        if (arrz[i] == 0) {
          context.moveTo(arrx[i], arry[i])
        } else {
          context.clearRect(arrx[i] - (linewidth + 4), arry[i] - (linewidth + 4), 2 * (linewidth + 4), 2 * (linewidth + 4))
        }
      }
      context.draw(true)
    }
    else
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
    context.draw(true);
    }
  },

  canvasEnd: function (event) {
    isButtonDown = false;
    arrx = [];
    arry = [];
    arrz = [];
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      //width: canvasw,
      //height: canvash,
      //destWidth: canvasw,
      //destHeight: canvash,
      canvasId: 'canvas',
      success: function (res) {
        filetempredo = res.tempFilePath;
        
      }
    });
  },

  /**
  * 回退一步
  */
  back: function (options) {
    context.drawImage(filetempundo, 0, 0, canvasw, canvash);
    context.draw();
    //console.log(this.data.colorselected);
  },
  forward: function (options) {
    context.drawImage(filetempredo, 0, 0, canvasw, canvash);
    context.draw();
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
    arrx = [];
    arry = [];
    arrz = [];
    context.clearRect(0, 0, canvasw, canvash);
    context.draw(true);
  },
  //connect and upload the file
  connectrequest:function(){
    wx.uploadFile({
      url: 'http://localhost:8080/webtest/myservlet',
      header: { "Content-Type": "multipart/form-data" },
      filePath: String(filetempredo),
      name: 'file',
      formData:{
        "name":"testpic",
        "message":"test message"
      },
      success: function (res) {
        console.log(res);
      }
    });
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
  onLoad: function (options) {
    // 使用 wx.createContext 获取绘图上下文 context
    context = wx.createCanvasContext('canvas');
    contextsmall = wx.createCanvasContext('canvasmall');
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
  }
})//注册页面-end-