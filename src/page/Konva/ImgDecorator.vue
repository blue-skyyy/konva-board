<template>
  <div>
    <div id="image-decorator-wrap" ref="image_decorator_wrap">
      <div id="image-canvas"></div>
    </div>

    <div id="menu">
      <!-- <menu-color
        @click="switchMode"
        class="menu_item"
        :colorList="myConfig && myConfig.colorList"
        :mode="mode"
        @changeConfig="changeConfig"
      >
      </menu-color> -->
    </div>
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
    <el-button size="mini" @click="preview">预览</el-button>
  </div>
</template>

<script>
import Konva from "konva";
import {
  imageList,
  getBgImgXYOffset,
  C_WIDTH,
  C_HEIGHT,
  rotateAroundCenter
} from "../util.js";
import Item from "../Item.js";

const methods = {
  preview() {
    this.$emit("preview");
  },
  // 切换图片复原操作
  // 切换工具栏模式
  switchMode(mode) {
    this.mode = mode;
    if (mode === "brush" || mode === "eraser") {
      this.addEvent();
      this.currItem.bgImg && this.currItem.bgImg.draggable(false);
    }
    if (mode === "moveobject") {
      this.removeStageEvents();
      this.setCursorStyle("pointer");
      this.currItem.bgImg.draggable(true);
    }

    if (mode === "reset") {
      this.currItem.setRotate(0);
      rotateAroundCenter(this.currItem.bgImg, 0);
      let state = this.currItem.getOriginState();
      this.loadCanvasFromJSON(JSON.parse(state));
      this.currItem.clearHistorylist();
      this.currItem.save(JSON.parse(state));
      this.switchMode("brush");
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
    // 旋转时 缩放属性为1
    this.setZoom("noop");
    this.currItem.rotateTo(type);
    const { rotate } = this.currItem;
    rotateAroundCenter(this.freeDrawLayer, rotate);
    this.stage.batchDraw();
  },
  // 放大缩小
  setZoom(type) {
    let zoom;
    if (type === "noop") {
      zoom = 1;
    } else {
      zoom = this.stage.getAttr("scaleX") || 1;
      if (type == "out") {
        // 放大
        zoom = zoom + this.zoomStep;
        zoom = Math.min(3, zoom); //最大是原来的3倍
      }
      if (type === "in") {
        zoom = zoom - this.zoomStep;
        zoom = Math.max(0.1, zoom); //最小为原来的1/10
      }
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
    let isPaint = false;
    let lastLine;
    this.stage.on("mousedown", () => {
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
      this.saveCurrItemState();
    });
    this.stage.on("mousemove", () => {
      let oldScale = this.stage.scaleX();
      if (!isPaint) {
        return;
      }
      // 确保缩放功能能正常使用
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
  },
  // 反序列化
  loadCanvasFromJSON(state) {
    if (!state) return;
    this.stage = Konva.Node.create(state, "image-canvas");
    // 添加背景图
    // 背景图片不会保存在JSON对象里
    this.bgImgLayer = this.stage.getLayers()[0];
    this.bgImgLayer.add(this.currItem.bgImg);
    this.bgImgLayer.batchDraw();
    // this.bgImgLayer.batchDraw();
    this.freeDrawLayer = this.stage.getLayers()[1];
    this.freeDrawLayer.batchDraw();
    this.isSwitching = false;
  },
  saveCurrItemState() {
    if (!this.currItem) return;
    let state = this.stage.toJSON();
    this.currItem.save(state);
  },
  toNext() {
    // this.saveCurrItemState();
    this.switchImage(this.currIndex + 1);
  },
  toPrev() {
    // this.saveCurrItemState();
    this.switchImage(this.currIndex - 1);
  },
  toDataUrl() {
    const imgUrl = this.stage.toDataURL({
      x: 0,
      y: 0,
      width: C_WIDTH,
      height: C_HEIGHT,
      pixelRatio: 1 // 图片质量
    });

    this.$emit("emitLoadImg", imgUrl);
  },
  // 加载背景图片
  loadBackImage(itemObj) {
    return new Promise((reslove) => {
      const { imageInfo } = itemObj;
      const { scale } = imageInfo;
      Konva.Image.fromURL(itemObj.originUrl, (kImg) => {
        kImg.setAttrs({
          // 设置居中
          x: getBgImgXYOffset(scale.width, null, this.C_WIDTH, 700),
          y: getBgImgXYOffset(null, scale.height, this.C_WIDTH, 700),
          id: "bgImg",
          draggable: false,
          source: itemObj.originUrl,
          width: scale.width,
          height: scale.height
        });
        this.bgImgLayer.add(kImg);
        this.bgImgLayer.batchDraw();
        this.currItem.bgImg = kImg;
        reslove();
      });
    });
  },

  afterSwitch(index, itemObj, isFirstRender = false) {
    if (isFirstRender) {
      // 首次渲染;
      if (!this.bgImgLayer) {
        let bgImgLayer = new Konva.Layer();
        this.bgImgLayer = bgImgLayer;
        this.loadBackImage(itemObj, this.initFreeDrawCanvas);
      } else {
        this.bgImgLayer && this.bgImgLayer.removeChildren();
        this.loadBackImage(itemObj).then(() => {
          this.saveCurrItemState();
        });
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
    if (!img) {
      console.warn("图片不存在");
      return;
    }
    let itemObj;
    if (img && !img.isRender) {
      this.isSwitching = true;
      // 首次渲染
      itemObj = new Item(
        {
          url: this.imageList[index].url,
          conWH: { width: this.C_WIDTH, height: 700 }
        },
        () => this.afterSwitch(index, itemObj, true)
      );
      console.log("====首次渲染=====");
      this.currIndex = index;
      this.currItem = itemObj;
      this.itemList[this.currIndex] = itemObj;
      this.$set(
        this.imageList,
        index,
        Object.assign({}, { ...this.imageList[index] }, { isRender: true })
      );
    } else {
      this.isSwitching = true;
      this.currIndex = index;
      // 非首次渲染
      console.log("======非首次渲染=====");
      this.currItem = this.itemList[this.currIndex];
      let lastState = this.currItem.getLastState();
      console.log("lastState", lastState);
      this.loadCanvasFromJSON(JSON.parse(lastState));
    }
    this.setZoom("noop");
    this.switchMode("brush");
  }
};
export default {
  methods,
  mounted() {
    const { width } = this.$refs.image_decorator_wrap.getBoundingClientRect();
    // first we need Konva core things: stage and layer
    let stage = new Konva.Stage({
      container: "image-canvas",
      scaleY: 1,
      scaleX: 1,
      centeredScaling: true,
      // 确定了canvas的宽高
      width,
      height: 700
      // draggable: true
    });

    this.C_WIDTH = width;
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
  // border: 1px solid red;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  overflow: hidden;
  background: #fff;
  // background-image: linear-gradient(
  //     45deg,
  //     #ccc 25%,
  //     transparent 25%,
  //     transparent 75%,
  //     #ccc 75%,
  //     #ccc
  //   ),
  //   linear-gradient(
  //     45deg,
  //     #ccc 25%,
  //     transparent 25%,
  //     transparent 75%,
  //     #ccc 75%,
  //     #ccc
  //   );
  // background-size: 24px 24px;
  // background-position: 0 0, 12px 12px;
  // #image-canvas {
  //   border: 1px solid yellow;
  // }
  // .img {
  //   margin-top: 20px;
  //   border: 1px solid blue;
  // }
}
</style>
