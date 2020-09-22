/*
 * 单张图片所代表的类
 */
// import invalidImgUrl from "./image-invalid";
import { scaleWH } from "./util.js";
// import { cbrt } from "core-js/fn/number";

class Item {
  constructor(options, cb) {
    // 设置默认属性
    this.scale = 1;
    this.sizeRatio = 1;
    this.historyList = [];
    this.historyIndex = -1;
    this.imageInfo = {};
    this.origUrl = options.url;
    this.url = options.url;
    this.lastState = null;
    this.invalid = false;
    this.rotate = 0;
    this.scaleWH = false;
    this.canvas = options.canvas;
    this.zoom = 1;
    this.conWH = options.conWH;
    this.bgImg = options.bgImg;
    this.scaleX = 1;
    this.scaleY = 1;

    // 获取图片size，同时检测图片是否合法
    // TODO 考虑改为异步执行
    // this._getImageSize((err) => {
    //   if (err) {
    //     this.invalid = true;
    //     this.url = "hdasda";
    //   }

    //   cb(err);
    // });

    this._getImageInfo()
      .then(() => {
        // do somehting
        cb();
      })
      .catch((err) => {
        console.log("err", err);
        // 下载失败 用展位图
        this.invalid = true;
      });
  }

  save(newUrl, history) {
    console.log("save-------history", history);
    let jsonState = JSON.stringify(history);
    // 没有进行任何修改，则不产生新的历史记录
    if (jsonState === this.lastState) {
      console.log("no change, return");
      return;
    }

    // 保存最新的图片
    this.url = newUrl;

    // 记录修改历史
    // TODO 考虑保存历史记录数量过大的情况
    let historyList = this.historyList;
    let historyIndex = this.historyIndex;

    // 若从历史记录中的非终点开始进行了修改，
    // 则需要移除之后的历史记录，并将当前作为新的终点
    // !注意，即使针对当前历史记录没有修改，也会进行保存，并抹掉之后的历史记录
    if (historyIndex < historyList.length - 1) {
      historyList = historyList.slice(0, historyIndex + 1);
    }

    historyList.push(jsonState);
    historyIndex += 1;
    this.lastState = jsonState;
    this.historyList = historyList;
    this.historyIndex = historyIndex;
  }

  exportImage() {
    // 图片无效，或图片未作任何修改的情况下，返回原始url
    return this.invalid || this.historyList.length <= 1
      ? this.origUrl
      : this.url;
  }

  reset() {
    this.url = this.origUrl;
    this.historyList = this.historyList.slice(0, 1);
    this.historyIndex = 0;
  }

  getCurrState() {
    return this.historyList[this.historyIndex];
  }

  getPreHistory() {
    let historyIndex = this.historyIndex - 1;
    if (historyIndex < 0) {
      console.log("history index out of range");
      return null;
    }

    let history = this.historyList[historyIndex];
    if (!history) {
      console.log("no history");
      return null;
    }

    this.historyIndex = historyIndex;

    return history;
  }

  getNextHistory() {
    let historyIndex = this.historyIndex + 1;
    if (historyIndex >= this.historyList.length) {
      console.log("history index out of range");
      return null;
    }

    let history = this.historyList[historyIndex];
    if (!history) {
      console.log("no history");
      return null;
    }

    this.historyIndex = historyIndex;
    return history;
  }

  rotateTo(direction) {
    let rotate = this.rotate;

    let diff = direction === "left" ? -90 : 90;
    rotate += diff;
    if (rotate >= 360) rotate = 0;
    if (rotate <= -360) rotate = 0;

    this.rotate = rotate;
  }

  setZoomMode(mode) {
    this.zoomMode = mode;
  }

  setRotate(rotate) {
    this.rotate = rotate;
  }

  _getImageInfo() {
    return new Promise((resolve, reject) => {
      let img = new Image();
      // img.crossOrigin = "Anonymous";
      img.src = this.url;
      img.onload = () => {
        const { width, height } = scaleWH(
          img.width,
          img.height,
          this.conWH.width,
          this.conWH.height
        );

        let scaleX = Number(width / img.width);
        let scaleY = Number(height / img.height);
        this.scaleX = scaleX;
        this.scaleY = scaleY;

        this.imageInfo = {
          origin: {
            width: img.width,
            height: img.height
          },
          scale: {
            width,
            height
          }
        };

        resolve("ok");
      };
      img.onerror = (err) => {
        console.log("Item image load error:   " + err);
        reject(err);
      };
    });
    // // 首先获取图片大小
    // let img = new Image();
    // // img.crossOrigin = "anonymous";
    // img.src = this.url;
    // img.onload = () => {
    //   // 保存size数据
    //   this.imageSize = {
    //     width: img.width,
    //     height: img.height
    //   };

    //   cb();
    // };
    // img.onerror = (err) => {
    //   cb(err);
    // };
  }

  setZoom(zoom) {
    this.zoom = zoom;
  }
}

export default Item;
