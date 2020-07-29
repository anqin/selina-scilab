/**
 * @file index.js
 */

import maps from './map.js';
let predictT = 0;

Page({
    data: {
        imgPath: './smartapp.png',
        content: '',
        resultType: '',
        resultVal: '',
        isShow: true,
        options: { // 模型配置项
            modelPath: 'https://paddlejs.cdn.bcebos.com/models/fruit/',
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
            std: [0.229, 0.224, 0.225]
        },
        time: 0,
        status: '' // 初始值为''， 变为'predict'时会触发模型预测
    },

    /**
     * 选择图片
     */
    chooseImage: function () {
        const me = this;
        this.setData({
            ishow: false
        });
        swan.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                const path = res.tempFilePaths[0];
                swan.getFileSystemManager().readFile({
                    filePath: path,
                    encoding: 'base64',
                    success: res => {
                        me.setData({
                            imgBase64: res && res.data,
                            imgPath: path
                        });
                    },
                    fail: res => {
                        console.log(res);
                    }
                });
            }
        });
    },

    predict(e) {
        const status = e && e.detail && e.detail.status;
        if (status === 'loaded') {
            this.setData({status: 'loaded', isShow: false});
        }
        else if (status === 'complete') {
            this.setData({time: Date.now() - predictT});
            const data = e.detail.data;
            const maxItem = this.getMaxItem(data);
            this.setData({status: '', resultType: maps[maxItem.index], resultVal: maxItem.value});
        }
    },

    doPredict() {
        predictT = Date.now();
        this.setData({status: 'predict'});
    },

    getMaxItem(datas = []) {
        let max = Math.max.apply(null, datas);
        let index = datas.indexOf(max);
        return {value: max, index};
    },

});
