let pdjs = null;
const maps = require('./map');
const app = getApp();
Page({
    data: {
      result: ''
    },
    onLoad: function () {
        pdjs = new app.globalData.Paddlejs({
            modelPath: 'https://paddlejs.cdn.bcebos.com/models/wine/',
            fileCount: 3,
            needPreheat: true,
            feedShape: {
                fw: 224,
                fh: 224
            },
            fetchShape: [1, 40, 1, 1],
            fill: '#fff',
            scale: 256,
            targetSize: { height: 224, width: 224 },
            mean: [0.485, 0.456, 0.406],
            std: [0.229, 0.224, 0.225],
            inputType: 'arraybuffer'
        });
        pdjs.loadModel();
    },
    chooseImage() {
        const me = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success (res) {
              // tempFilePath可以作为img标签的src属性显示图片
              wx.getImageInfo({
                src: res.tempFilePaths[0],
                success: (imgInfo) => {
                  let {
                    width,
                    height,
                    path
                  } = imgInfo;
                  let ctx = wx.createCanvasContext('canvas');

                  ctx.drawImage(path, 0, 0, width, height);
                  ctx.draw(false, ()=>{
                    wx.canvasGetImageData({
                      canvasId: 'canvas',
                      x: 0,
                      y: 0,
                      width: width,
                      height: height,
                      success(res) {
                        const input = {
                            data: res.data,
                            width: width,
                            height: height
                        };
                        pdjs.predict(input, function(data) {
                            const maxItem = pdjs.utils.getMaxItem(data);
                            console.log('result==============')
                            console.log(maps[maxItem.index])
                            me.setData({'result': maps[maxItem.index]})
                        });
                      },
                      fail(e) {
                          console.log(e)
                      }
                    }, this);
                  })
                }
              })
            }
        });
    }
});