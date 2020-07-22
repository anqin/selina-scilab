//index.js
let pdjs = null;
const maps = require('./map');

const app = getApp();
let modelData = null;
let that = '';
let ctx;
let canvas;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img: '/image/test_default.png',
    imgB64: '',
    imgInfo: '',
    content: '',
    ishow: false,
    resultType: '',
    resultVal: '',
  },
  onReady() {
    const query = wx.createSelectorQuery();
    query.select('#myCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
        canvas = res[0].node
        ctx = canvas.getContext('2d')
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.onLoadPaddle()
  },
  /**
   * 选择图片
   */
  chooseimgTap: function() {
    that.setData({
      ishow: false
    });
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.setData({
          img: res.tempFilePaths[0]
        });
        wx.getImageInfo({
            src: res.tempFilePaths[0],
            success: (imgInfo) => {
                let {
                width,
                height,
                path
                } = imgInfo;

                const imgObj = canvas.createImage()
                imgObj.src = path;
                imgObj.width = width
                imgObj.height = height
                imgObj.onload = function () {
                    // ctx.drawImage(imgObj,0,0, width, height,0,0, width, height)
                    that.setData({imgInfo: imgObj});
                }
            }
        })
      }
    })
  },
  /**
   * 转b64
   */
  getB64ByUrl: function(url) {
    const FileSystemManager = wx.getFileSystemManager();
    FileSystemManager.readFile({
      filePath: url,
      encoding: 'base64',
      success(res) {
        // console.log(res.data);
        that.setData({
          imgB64: res.data
        });
      }
    })
  },

  /**
   * 植物识别
   */
  plantTap: function(e) {
    that.setData({
      content: JSON.stringify('working ...')
    });

    pdjs.predict(that.data.imgInfo, function(data) {
      const maxItem = pdjs.utils.getMaxItem(data);
      console.info(data)
      console.info(maxItem.value)
      that.setData({
        resultType: maps[maxItem.index],
        resultVal: maxItem.value,
      });
    });

  },

onLoadPaddle: function() {
  pdjs = new app.globalData.Paddlejs({
    //modelPath: 'https://paddlejs.cdn.bcebos.com/models/wine/',
    modelPath: 'http://172.24.196.159:8000/',
    fileCount: 3,
    needPreheat: true,
    feedShape: {
        fw: 224,
        fh: 224
    },
    fetchShape: [1, 7, 1, 1],
    fill: [255, 255, 255, 255],
    scale: 256,
    targetSize: { height: 224, width: 224 },
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    inputType: 'htmlImageElement'
  });
  pdjs.loadModel();

}

})