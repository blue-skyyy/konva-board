<template>
  <div id="image-decorator-wrap">
    <div id="image-canvas"></div>

    <select id="tool">
      <option value="brush">Brush</option>
      <option value="eraser">Eraser</option>
    </select>
    <img :src="imgUrl" class="img" />
    <button @click="toDataUrl">点我下载</button>
    <button @click="toNext">下一张</button>
    <button @click="toPrev">上一张</button>
    <!-- <button></button> -->
  </div>
</template>

<script>
import Konva from "konva";
import { imageList } from "./util.js";
import Item from "./Item.js";

const methods = {
  saveCurrItemState() {
    if (!this.currItem) return;
    let state = this.stage.toJSON();
    console.log("state", state);
    this.currItem.save(state);
  },
  initFreeDrawCanvas() {
    let layer = new Konva.Layer({});

    this.freeDrawLayer = layer;
    this.stage.add(layer);
    layer.zIndex(99);
    console.log("======", layer.zIndex());
    let isPaint = false;
    let mode = "brush";
    let lastLine;
    this.stage.on("mousedown touchstart", () => {
      isPaint = true;
      let pos = this.stage.getPointerPosition();
      lastLine = new Konva.Line({
        stroke: "#df4b26",
        strokeWidth: 5,
        globalCompositeOperation:
          mode === "brush" ? "source-over" : "destination-out",
        points: [pos.x, pos.y]
      });
      layer.add(lastLine);
    });
    this.stage.on("mouseup touchend", () => {
      isPaint = false;
    });
    this.stage.on("mousemove touchmove", () => {
      if (!isPaint) {
        return;
      }
      const pos = this.stage.getPointerPosition();
      let newPoints = lastLine.points().concat([pos.x, pos.y]);
      lastLine.points(newPoints);
      layer.batchDraw();
    });
    let select = document.getElementById("tool");
    select.addEventListener("change", function() {
      mode = select.value;
    });
  },
  toNext() {
    this.saveCurrItemState();

    this.currIndex += 1;
    this.switchImage(this.currIndex);
  },
  toPrev() {
    this.currIndex -= 1;
    this.switchImage(this.currIndex);
  },
  toDataUrl() {
    this.imgUrl = this.stage.toDataURL({
      x: 0,
      y: 0,
      width: 600,
      height: 400,
      pixelRatio: 3
    });
  },
  // 加载背景
  loadBackImage(itemObj, cb) {
    console.log("itemObj", itemObj);
    const { imageInfo } = itemObj;
    const { scale } = imageInfo;
    Konva.Image.fromURL(itemObj.originUrl, (kImg) => {
      kImg.setAttrs({
        // 设置居中
        x: (this.conWH.width - scale.width) / 2,
        y: (this.conWH.height - scale.height) / 2,
        width: scale.width,
        height: scale.height
      });
      this.bgImgLayer.add(kImg);
      this.bgImgLayer.batchDraw();
      console.log("cb", cb);
      // cb && cb();
    });
  },
  afterSwitch(index, itemObj, isFirstRender = false) {
    if (isFirstRender) {
      // 首次渲染;
      if (!this.bgImgLayer) {
        let bgImgLayer = new Konva.Layer();
        this.bgImgLayer = bgImgLayer;
        this.loadBackImage(itemObj, this.initFreeDrawCanvas);
        this.stage.add(bgImgLayer);
      } else {
        this.bgImgLayer && this.bgImgLayer.removeChildren();
        this.loadBackImage(itemObj);
      }
      this.clearFreeDrawLayer();
    }
  },
  // 清除画笔层
  clearFreeDrawLayer() {
    if (this.freeDrawLayer) {
      this.freeDrawLayer.removeChildren();
      this.freeDrawLayer.draw();
    }
  },
  switchImage(index) {
    if (index < -1) return;
    let img = this.imageList[index];
    if (!img) return;
    let itemObj;
    if (img && !img.isRender) {
      // 首次渲染
      itemObj = new Item(
        {
          url: this.imageList[index].url,
          conWH: { width: 800, height: 600 }
        },
        () => this.afterSwitch(index, itemObj, true)
      );
      this.currItem = itemObj;
      this.itemList[this.currIndex] = itemObj;
      this.imageList[this.currIndex].isRender = true;
    } else {
      // 非首次渲染
      this.currItem = this.itemList[this.currIndex];
      let currState = this.currItem.getCurrState();
      console.log("JSON.parse(currState)", JSON.parse(currState));
      this.stage = Konva.Node.create(JSON.parse(currState), "image-canvas");
      // this.stage.forEach((d) => {
      //   console.log("d", d);
      // });
      this.bgImgLayer.batchDraw();
      // this.freeDrawLayer.batchDraw();
      // this.freeDrawLayer.zIndex(99);
    }
  }
};
export default {
  methods,
  mounted() {
    // first we need Konva core things: stage and layer
    let stage = new Konva.Stage({
      container: "image-canvas",
      // 确定了canvas的宽高
      width: 800,
      height: 600
    });

    this.stage = stage;

    // 组装数据格式
    this.imageList = this.imageList.map((d) => {
      return {
        isRender: false,
        url: d
      };
    });
    this.toNext();
    // this.();

    // 初始化时候需要异步
    // setTimeout(() => {}, 100);
  },
  data() {
    return {
      stage: null,
      imgUrl: null,
      imageList: imageList,
      currIndex: -1,
      currItem: null,
      itemList: [],
      conWH: { width: 800, height: 600 },
      freeDrawLayer: null,
      bgImgLayer: null
    };
  },
  components: {}
};
</script>

<style lang="less" scoped>
#image-decorator-wrap {
  border: 1px solid red;
  width: 800px;
  height: 600px;
  margin: 0 auto;
  .img {
    margin-top: 20px;
    border: 1px solid blue;
  }
}
</style>
