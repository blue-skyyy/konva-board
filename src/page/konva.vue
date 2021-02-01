<template>
  <div>
    <div id="image-decorator-wrap">
      <div id="image-canvas"></div>
    </div>

    <select id="tool">
      <option value="brush">Brush</option>
      <option value="eraser">Eraser</option>
    </select>
    <button @click="switchMode('brush')">画笔模式</button>
    <button @click="switchMode('eraser')">橡皮擦模式</button>
    <button @click="switchMode('moveobject')">移动背景图片</button>
    <button @click="switchMode('reset')">重置</button>
    <img :src="imgUrl" class="img" />
    <button @click="toDataUrl">点我下载</button>
    <button @click="toNext">下一张</button>
    <button @click="toPrev">上一张</button>
    <button>{{ currIndex }}</button>
    <button @click="setZoom('out')">放大</button>
    <button @click="setZoom('in')">缩小</button>
    <button @click="rotateTo('left')">向左</button>
    <button @click="rotateTo('right')">向右</button>
  </div>
</template>

<script>
import Konva from "konva";
import { imageList } from "./util.js";
import Item from "./Item.js";

const C_WIDTH = 800;
const C_HEIGHT = 600;
const methods = {
  // 切换工具栏模式
  switchMode(mode) {
    this.mode = mode;
    if (mode === "brush" || mode === "eraser") {
      this.addEvent();
      this.currItem.bgImg.draggable(false);
    }
    if (mode === "moveobject") {
      this.removeStageEvents();
      this.setCursorStyle("pointer");
      this.currItem.bgImg.draggable(true);
    }

    if (mode === "reset") {
      this.stage.clear();
      console.log(this.currIndex);
      this.switchImage(0);
    }
  },
  // 设置鼠标样式
  setCursorStyle(type) {
    switch (type) {
      case "pointer":
        document.body.style.cursor = "pointer";
        break;
      case "default":
        document.body.style.cursor = "pointer";
        break;
      default:
        document.body.style.cursor = "pointer";
        break;
    }
  },
  // 设置背景图片移动
  moveBgImg() {
    // console.log("this.stage", this.stage, this.stage.listening);
    // this.stage.listening(false);
    // this.isMovingBgImg = true;
    this.removeStageEvents();
    this.currItem.bgImg.draggable(true);
    this.setCursorStyle("pointer");
  },
  // 旋转
  rotateTo(type) {
    if (type === "left") {
      this.stage.rotation(-90);
    }
    if (type === "right") {
      this.stage.rotation(90);
    }
    this.stage.batchDraw();
  },
  // 放大
  setZoom(type) {
    console.log("dasdada", this.bgImgLayer, this.stage.getAttr("scaleX"));
    let zoom = this.stage.getAttr("scaleX") || 1;
    if (type == "out") {
      // 放大
      zoom = zoom + this.zoomStep;
      zoom = Math.min(3, zoom); //最大是原来的3倍
    }
    if (type === "in") {
      zoom = zoom - this.zoomStep;
      zoom = Math.max(0.1, zoom); //最小为原来的1/10
    }
    this.stage.scale({
      x: zoom,
      y: zoom
    });
    this.stage.batchDraw();
  },
  // 移除stage事件监听
  removeStageEvents() {
    this.stage.off("mousedown");
    this.stage.off("mousemove");
    this.stage.off("mouseup");
  },
  // 事件监听
  addEvent() {
    // if (this.isMovingBgImg) return;
    // console.log("addEvent");
    let isPaint = false;
    let lastLine;
    this.stage.on("mousedown", () => {
      console.log("a");
      isPaint = true;
      let pos = this.stage.getPointerPosition();
      let oldScale = this.stage.scaleX();
      lastLine = new Konva.Line({
        stroke: "#df4b26",
        strokeWidth: 5,
        globalCompositeOperation:
          this.mode === "brush" ? "source-over" : "destination-out",
        points: [
          pos.x / oldScale - this.stage.x() / oldScale,
          pos.y / oldScale - this.stage.y() / oldScale
        ]
      });
      this.freeDrawLayer.add(lastLine);
    });
    this.stage.on("mouseup", () => {
      isPaint = false;
    });
    this.stage.on("mousemove", () => {
      let oldScale = this.stage.scaleX();
      if (!isPaint) {
        return;
      }
      const pos = this.stage.getPointerPosition();
      let newPoints = lastLine
        .points()
        .concat([
          pos.x / oldScale - this.stage.x() / oldScale,
          pos.y / oldScale - this.stage.y() / oldScale
        ]);
      lastLine.points(newPoints);
      this.freeDrawLayer.batchDraw();
    });
    // let select = document.getElementById("tool");
    // select.addEventListener("change", function() {
    //   mode = select.value;
    // });
  },
  // 反序列化
  loadCanvasFromJSON(state) {
    if (!state) return;
    this.stage = Konva.Node.create(JSON.parse(state), "image-canvas");
    // 添加背景图
    this.stage.find("#bgImg").forEach((node) => {
      let img = new Image();
      img.src = node.getAttr("source");
      img.onload = () => {
        node.image(img);
        this.stage.batchDraw();
      };
    });
    // this.stage.findOne("#bgImg")
    this.freeDrawLayer = this.stage.getLayers()[1];
    this.addEvent();
    this.freeDrawLayer.batchDraw();
    this.isSwitching = false;
    // 画笔层
    // let const1 = this.stage.find("#free_draw_canvas");
    // this.addEvent();
  },
  saveCurrItemState() {
    console.log("dd");
    if (!this.currItem) return;
    let state = this.stage.toJSON();
    this.currItem.save(state);
  },
  toNext() {
    this.saveCurrItemState();
    this.switchImage(this.currIndex + 1);
  },
  toPrev() {
    this.saveCurrItemState();
    this.switchImage(this.currIndex - 1);
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
  // 加载背景图片
  loadBackImage(itemObj, cb) {
    const { imageInfo } = itemObj;
    const { scale } = imageInfo;
    Konva.Image.fromURL(itemObj.originUrl, (kImg) => {
      kImg.setAttrs({
        // 设置居中
        x: this.getBgImgXYOffset(scale.width, null),
        y: this.getBgImgXYOffset(null, scale.height),
        id: "bgImg",
        source: itemObj.originUrl,
        draggable: false,
        width: scale.width,
        height: scale.height
      });
      this.bgImgLayer.add(kImg);
      this.bgImgLayer.batchDraw();
      // 保存当前背景对象
      this.currItem.bgImg = kImg;
      cb && cb();
    });
  },
  // 获取背景图片xy偏移量
  getBgImgXYOffset(width, height) {
    if (width) {
      return C_WIDTH > width ? (C_WIDTH - width) / 2 : 0;
    }
    if (height) {
      return C_HEIGHT > height ? (C_HEIGHT - height) / 2 : 0;
    }
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
      this.isSwitching = false;
    }
  },
  // 设置stage宽高
  setStageWH(w, h) {
    this.stage.width(w);
    this.stage.height(h);
  },
  // 清除画笔层
  clearFreeDrawLayer() {
    if (this.freeDrawLayer) {
      this.freeDrawLayer.removeChildren();
      this.freeDrawLayer.draw();
    }
  },
  // 切换图层
  switchImage(index) {
    console.log("=====switchImage=====", index);
    if (index < -1) return;
    if (this.isSwitching) return;
    let img = this.imageList[index];
    if (!img) return;
    let itemObj;
    if (img && !img.isRender) {
      this.isSwitching = true;
      console.log("首次渲染");
      // 首次渲染
      itemObj = new Item(
        {
          url: this.imageList[index].url,
          conWH: { width: 800, height: 600 }
        },
        () => this.afterSwitch(index, itemObj, true)
      );
      this.currIndex = index;
      this.currItem = itemObj;
      this.itemList[this.currIndex] = itemObj;
      this.imageList[this.currIndex].isRender = true;

      // this.currItem.pushHistory();
    } else {
      this.isSwitching = true;
      this.currIndex = index;
      // 非首次渲染
      console.log("======非首次渲染=====", this.currIndex);
      console.log(
        "this.itemList[this.currIndex]",
        this.itemList[this.currIndex]
      );
      this.currItem = this.itemList[this.currIndex];
      console.log(" this.currItem", this.currItem);
      let currState = this.currItem.getOriginState();
      console.log("currState", currState);
      this.loadCanvasFromJSON(JSON.parse(currState));
      // this.loadBackImage(this.currItem);
      // this.stage = Konva.Node.create(JSON.parse(currState), "image-canvas");
      // // this.stage.find("#bgImg").
      // let image = new Image();
      // image.onload = () => {
      //   this.stage.find("#bgImg")[0].image(image);
      //   this.stage.draw();
      // };
      // image.src = this.currItem.originUrl;
      // this.stage.find("#free_draw_canvas")
      // this.freeDrawLayer.batchDraw();
      // this.stage.batchDraw();

      // this.stage.forEach((d) => {
      //   console.log("d", d);
      // });
      // this.bgImgLayer.batchDraw();
      // this.initFreeDrawCanvas();

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
      scaleY: 1,
      scaleX: 1,
      centeredScaling: true,
      // 确定了canvas的宽高
      width: 800,
      height: 600
    });

    this.stage = stage;

    // 背景层
    this.bgImgLayer = new Konva.Layer({
      id: "bg_image_layer"
    });

    // 绘画层
    this.freeDrawLayer = new Konva.Layer({
      id: "free_draw_layer",
      backgroundColor: "red"
    });

    this.stage.add(this.bgImgLayer);
    this.stage.add(this.freeDrawLayer);

    this.addEvent();

    // 组装数据格式
    this.imageList = this.imageList.map((d) => {
      return {
        isRender: false,
        url: d
      };
    });
    this.toNext();
    // this.initFreeDrawCanvas();
    // this.();

    // 初始化时候需要异步
    // setTimeout(() => {}, 100);
  },
  data() {
    return {
      mode: "brush",
      isMovingBgImg: false,
      zoomStep: 0.1,
      stage: null,
      imgUrl: null,
      imageList: imageList,
      currIndex: -1,
      currItem: null,
      itemList: [],
      conWH: { width: 800, height: 600 },
      freeDrawLayer: null,
      bgImgLayer: null,
      isSwitching: false
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  overflow: hidden;

  #image-canvas {
    border: 1px solid yellow;
  }
  .img {
    margin-top: 20px;
    border: 1px solid blue;
  }
}
</style>
