<template>
  <div>
    <div id="container">
      <div id="image_canvas_wrap" ref="image_canvas_wrap">
        <canvas id="image_canvas" ref="image_canvas"></canvas>
      </div>
      <div id="menu">
        <menu-switch-image
          @prevFunc="prev"
          @nextFunc="next"
          :prev="myConfig && myConfig.prev"
          :next="myConfig && myConfig.next"
          class="menu_item"
        >
        </menu-switch-image>

        <menu-undo
          :mode="mode"
          :canvas="canvas"
          @click="switchMode('undo')"
          class="menu_item"
        ></menu-undo>

        <menu-drag
          :mode="mode"
          :canvas="canvas"
          @click="switchMode('drag')"
          class="menu_item"
        />
        <menu-pencil
          :mode="mode"
          :canvas="canvas"
          @click="switchMode('pencil')"
          :color="myConfig && myConfig.color"
          :pencilSizeList="myConfig && myConfig.pencilSizeList"
          :pencilSize="myConfig && myConfig.pencilSize"
          @changeConfig="changeConfig"
          ref="pencil"
          class="menu_item"
        />

        <menu-eraser
          :canvas="canvas"
          :mode="mode"
          @click="switchMode('eraser')"
          class="menu_item"
        />
        <menu-color
          @click="switchMode"
          class="menu_item"
          :colorList="myConfig && myConfig.colorList"
          :mode="mode"
          @changeConfig="changeConfig"
        >
        </menu-color>

        <menu-rotate
          class="menu_item"
          :canvas="canvas"
          :currItem="currItem"
          :rotateRight="myConfig && myConfig.rotateRight"
          :rotateLeft="myConfig && myConfig.rotateLeft"
        />

        <menu-zoom
          class="menu_item"
          :canvas="canvas"
          :zoomIn="myConfig && myConfig.zoomIn"
          :zoomOut="myConfig && myConfig.zoomOut"
        />

        <menu-restore
          :canvas="canvas"
          :bg="currItem && currItem.bgImg"
          :currItem="currItem"
          class="menu_item"
        ></menu-restore>

        <menu-download
          :canvas="canvas"
          class="menu_item"
          :exportImage="exportImage"
        >
        </menu-download>

        <button @click="saveCurrItemState">点我保存状态</button>

        <!-- <button @click="exportTest">点我导出</button> -->
      </div>
    </div>

    <img :src="imgUrl" style="border: 1px solid blue" />
    <img :src="imgUrlExport" style="border: 1px solid green" />
  </div>
</template>

<script>
import { fabric } from "fabric";
import _ from "lodash";
import { imageList } from "./util.js";
import Item from "./Item";
import MenuDrag from "./menu/drag.vue";
import MenuPencil from "./menu/pencil.vue";
import MenuZoom from "./menu/zoom.vue";
import MenuRestore from "./menu/restore.vue";
import MenuRotate from "./menu/rotate.vue";
import MenuColor from "./menu/color.vue";
import MenuEraser from "./menu/eraser.vue";
import MenuSwitchImage from "./menu/switchImage.vue";
import MenuDownload from "./menu/download.vue";
import MenuUndo from "./menu/undo.vue";
// fabric.Object.prototype.set({
//   borderColor: "red",
//   cornerColor: "red", //激活状态角落图标的填充颜色
//   cornerStrokeColor: "", //激活状态角落图标的边框颜色
//   borderOpacityWhenMoving: 1,
//   borderScaleFactor: 1,
//   cornerSize: 8,
//   cornerStyle: "rect", //rect,circle
//   centeredScaling: false, //角落放大缩小是否是以图形中心为放大原点
//   centeredRotation: true, //旋转按钮旋转是否是左上角为圆心旋转
//   transparentCorners: false, //激活状态角落的图标是否透明
//   rotatingPointOffset: 20, //旋转距旋转体的距离
//   originX: "center",
//   originY: "center",
//   lockUniScaling: false, //只显示四角的操作
//   hasRotatingPoint: true, //是否显示旋转按钮
//   selectionDashArray: [5, 5]
// });
const methods = {
  // 延迟存储

  preSave: _.debounce(function() {
    this.saveCurrItemState();
  }, 4000),
  // 调整快照状态
  fixState(state, { scaleX, scaleY }) {
    if (!state) {
      console.error("state is required");
      return false;
    }
    let stateObj = JSON.parse(state);
    stateObj.objects[0].scaleY = scaleY;
    stateObj.objects[0].scaleX = scaleX;
    return JSON.stringify(stateObj);
  },
  // 导出图片的方法
  exportImageFunc(item) {
    return new Promise((reslove, reject) => {
      if (!item) reject("item is required, item:", item);
      // this.saveCurrItemState(); // 导出时候默认保存一次，避免状态遗漏
      const {
        rotate,
        imageInfo: { scale },
        scaleX,
        scaleY
      } = item;
      // 导出canvas
      let exportCanvas;
      if (!exportCanvas) {
        exportCanvas = document.createElement("canvas");
        exportCanvas.id = "export_canvas";
        exportCanvas.style.border = "1px solid pink";
      } else {
        exportCanvas.getObjects().forEach((child) => {
          exportCanvas.remove(child);
        });
      }
      // 调整宽高
      const width = rotate % 180 === 0 ? scale.width : scale.height;
      const height = rotate % 180 === 0 ? scale.height : scale.width;
      exportCanvas = new fabric.Canvas("export_canvas", {
        width,
        height
      });

      let state = item.getCurrState();
      // 由于0.3333333 存储状态会保存为0.33 导出后比例有略微不同 手动保持一致
      let fixState = this.fixState(state, { scaleY, scaleX });
      exportCanvas.loadFromJSON(fixState, () => {
        exportCanvas.discardActiveObject();
        let sel = new fabric.ActiveSelection(exportCanvas.getObjects(), {
          canvas: exportCanvas,
          cornerSize: 0,
          hasControls: false
        });
        exportCanvas.setActiveObject(sel);
        sel.translateX = "center";
        sel.translateY = "center";
        sel.left = 0;
        sel.top = 0;

        // exportCanvas.centerObject(sel);
        // document.appendChild(exportCanvas);

        let data = exportCanvas.toDataURL({
          // origin.height / scale.height,
          // multiplier: 10, // 恢复比例导出
          format: "jpeg",
          quality: 0.8 // 降质量
        });
        exportCanvas.renderAll();
        this.imgUrlExport = data;

        reslove(data);
      });
    });
  },
  exportImage(type, index = this.currIndex) {
    // let center = this.canvas.getCenter();
    // let zoomPoint = new fabric.Point(center.left, center.top);
    // this.canvas.zoomToPoint(zoomPoint, 1);
    // this.canvas.renderAll();
    // 导出单张(默认当前)或所有
    if (!this.currItem || !type) return;
    this.saveCurrItemState(); // 导出时候默认保存当前item一次，避免状态遗漏
    if (type === "single") {
      // 单张
      if (index < 0) return;
      return this.exportImageFunc(this.itemList[index]);
    }
    if (type === "list") {
      // 全部
      return this.imageList.map((d, i) => {
        if (d.rendered) {
          return this.exportImageFunc(this.itemList[i]);
        } else {
          return new Promise((reslove) => reslove(d));
        }
      });
    }
  },
  initDocumentEvents() {
    // 点击菜单外区域将弹出层清除
    document.addEventListener("click", (e) => {
      let menu = document.querySelector("#menu");
      if (!e.target.id === "menu" || !menu.contains(e.target)) {
        let pencil = this.$refs.pencil;
        pencil && pencil.unShow();
      }
    });
  },
  changeConfig(prop, value) {
    this.myConfig[prop] = value;
    // console.log(" this.myConfig----change", this.myConfig);
  },
  freeDraw(canvas = this.canvas) {
    this.canvas.isDrawingMode = true;
    var hLinePatternBrush = new fabric.PatternBrush(canvas);
    hLinePatternBrush.getPatternSrc = (function(fabric) {
      return function() {
        var patternCanvas = fabric.document.createElement("canvas");
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext("2d");
        ctx.strokeStyle = "green";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.stroke();
        return patternCanvas;
      };
    })(fabric);

    canvas.freeDrawingBrush = hLinePatternBrush;
    // canvas.freeDrawingBrush.width = 20;
  },
  switchMode(mode) {
    // if (this.mode === mode) {
    //   this.mode = "";
    //   return;
    // }
    this.mode = mode;
    // if (this.mode === mode) return;
    console.log("this.mode", this.mode);

    if (mode === "undo") {
      this.undo();
    }

    if (mode === "pencil") {
      // this.preSave();
    }
  },
  test() {
    this.freeDraw(this.canvas);
  },
  addrect() {
    var rect = new fabric.Rect({
      top: 50, //距离画布上边的距离
      left: 100, //距离画布左侧的距离，单位是像素
      width: 100, //矩形的宽度
      height: 70, //矩形的高度
      fill: "blue", //填充的颜色
      stroke: "orange", // 边框原色
      strokeWidth: 5, // 边框大小
      rx: 8, //圆角半径
      ry: 4 //圆角半径
    });
    this.rect = rect;

    this.canvas.add(rect);
    this.canvas.renderAll();
  },
  delreact() {
    this.canvas.remove(this.rect);
    this.canvas.renderAll();
  },
  prev() {
    this.currIndex -= 1;
    this.switchImage(this.currIndex);
  },
  next() {
    this.currIndex += 1;
    this.switchImage(this.currIndex);
  },
  setCanvasWH(w, h) {
    this.canvas.setWidth(w);
    this.canvas.setHeight(h);
  },
  initCanvasEvents() {
    this.canvas.on("object:added", this.dealAdd);
    this.canvas.on("object:modified", this.dealModify);
    this.canvas.on("object:removed", this.dealRemove);

    // this.canvas.on("mouse:wheel", this.mouseWheel);
    this.canvas.on("path:created", this.dealPathCreated);
  },
  dealPathCreated(e) {
    // console.log("path----created", e);
    // this.canvas.remove(e.path);
    // this.canvas.renderAll();

    if (e.path.className === "custom_path") {
      //
    }
    if (this.mode === "eraser") {
      // let objs = this.canvas.getObjects();
      // console.log("objs", objs);
      // let paths = [];
      // for (let i = 0; i < objs.length; i++) {
      //   if (objs[i].get("type") === "path" && objs[i].modeType === "eraser") {
      //     // path类型
      //     paths.push(objs[i]);
      //   }
      // }
    }

    if (this.mode === "pencil") {
      // cxt.globalCompositeOperation = "source-over";
      // e.path.set({
      //   globalCompositeOperation: "source-over"
      // });
      // e.path.globalCompositeOperation = "source-over";
      // e.path.selectable = false;
      // e.path.evented = false;
      // e.path.absolutePositioned = true;
    }

    // this.canvas.renderAll();
  },
  toNext() {
    this.currIndex += 1;
    this.switchImage(this.currIndex);
  },
  dealAdd(e) {
    let target = e.target;
    // console.log("dealAdd", target);
    if (target.get("type") === "path") {
      if (target.className !== "custom_path") {
        console.log("dealAdd", target, target.left);
        // this.canvas.remove(e.target);
      }
    }
    // console.log("----dealAdd----", e);
    if (this.historyChanging) return;
    if (e.target.isBg) return;
    // if (!e.target.isContainedWithinObject(this.currItem.bgImg)) {
    //   e.target.set({
    //     hasBorders: false,
    //     hasControls: false,
    //     selectable: false
    //   });
    //   this.canvas.remove(e.target);
    //   setTimeout(() => alert("请在图片范围内操作"), 500);
    //   return;
    // }
  },
  dealModify() {
    if (this.historyChanging) return;
    // console.log("added");
  },
  dealRemove() {
    if (this.historyChanging) return;
    // console.log("removed");
  },
  clearBoard() {
    this.canvas.getObjects().forEach((child) => {
      this.canvas.remove(child);
    });
  },

  afterSwitch(index, itemObj, firstRender = false) {
    const { imageInfo, scaleX, scaleY } = itemObj;
    if (firstRender) {
      let bgImg = new fabric.Image();
      bgImg.setSrc(
        this.itemList[index].url,
        () => {
          bgImg.hasBorders = false;
          bgImg.hasControls = false;
          bgImg.selectable = false;
          bgImg.scaleable = false;
          // 0.33333 会导致导出图片有留白  如果放大则会导致图片导出不全
          bgImg.scaleX = scaleX;
          bgImg.scaleY = scaleY;
          bgImg.scaleToHeight(imageInfo.scale.height, false);
          bgImg.scaleToWidth(imageInfo.scale.width, false);
          bgImg.crossOrigin = "anonymous";
          bgImg.translateX = "top";
          bgImg.translateY = "left";
          // bgImg.globalCompositeOperation = "destination-over";
          bgImg.left = 0;
          bgImg.top = 0;
          bgImg.zIndex = 1;
          bgImg.isBg = true;
          // 动态添加scale比例

          this.clearBoard();
          this.setCanvasWH(imageInfo.scale.width, imageInfo.scale.height);
          // 初次加载的Image，需要自动创建一条历史记录
          bgImg.sendToBack();
          this.currItem.bgImg = bgImg;

          this.canvas.add(bgImg);
          this.saveCurrItemState();

          this.canvas.renderAll();
          this.historyChanging = false;
          this.switching = false;
        },
        // 防止画布污染
        { crossOrigin: "anonymous" }
      );
    } else {
      // 非首次加载
    }
  },
  switchImage(index) {
    if (this.currIndex < 0) return;
    let obj = this.imageList[index];
    if (!obj) return;
    let itemObj;
    if (obj && !obj.rendered) {
      console.log("首次渲染");
      // 首次渲染
      itemObj = new Item(
        {
          url: this.imageList[index].url,
          // canvas: this.canvas
          conWH: this.conWH
        },
        () => this.afterSwitch(index, itemObj, true)
      );
      this.currItem = itemObj;
      this.itemList[this.currIndex] = itemObj;
      this.imageList[this.currIndex].rendered = true;
    } else if (obj && obj.rendered) {
      // 非首次渲染
      console.log("非首次渲染");
      let state = itemObj.getCurrState();
      this.canvas.loadFromJSON(state, () => {
        this.afterSwitch(index, itemObj, false);
        // this.bgImg = this.canvas.getObjects()[0];
        // this.bgImg.rotate(itemObj.rotate);
        // this.isCorrectionWorkVersion && this.changeZoom(itemObj.zoom);
        // afterSwitch(false);
      });
    }
  },
  saveCurrItemState() {
    console.count("=======saveCurrItemState=======");
    // 保存当前每个实例状态
    if (!this.currItem) return;
    let imgData = this.canvas.toDataURL();
    this.canvas.renderAll();
    this.currItem.save(
      imgData,
      this.canvas.toJSON(["width", "height", "zoom"])
    );
    this.imgUrl = imgData;
  },
  undo() {
    if (!this.currItem || this.historyChanging) return;
    let history = this.currItem.getPreHistory();
    const { scaleY, scaleX } = this.currItem;
    let fixHistory = this.fixState(history, { scaleX, scaleY });
    if (fixHistory) {
      const historyObj = JSON.parse(fixHistory);
      const { width, height } = historyObj;
      this.canvas.loadFromJSON(fixHistory, () => {
        if (width && height) {
          this.setCanvasWH(width, height);
        }
        this.historyChanging = false;
        this.canvas.renderAll();
      });
    }
  }
};
export default {
  mounted() {
    // 静用缓存 该属性会对line hover事件产生影响 高亮不生效
    fabric.Object.prototype.objectCaching = false;
    let canvas = new fabric.Canvas("image_canvas", {
      backgroundColor: "#fff"
      // selection: false
      // isDrawingMode: true
    });

    // 实现mouseover事件
    canvas.findTarget = (function(originalFn) {
      return function() {
        let target = originalFn.apply(this, arguments);
        if (target) {
          if (this._hoveredTarget !== target) {
            canvas.fire("object:over", { target: target });
            if (this._hoveredTarget) {
              canvas.fire("object:out", { target: this._hoveredTarget });
            }
            this._hoveredTarget = target;
          }
        } else if (this._hoveredTarget) {
          canvas.fire("object:out", { target: this._hoveredTarget });
          this._hoveredTarget = null;
        }
        return target;
      };
    })(canvas.findTarget);

    this.canvas = canvas;

    this.initCanvasEvents();

    this.initDocumentEvents();

    // this.freeDraw(canvas);

    this.imageList = this.imageList.map((d) => {
      return {
        url: d,
        rendered: false
      };
    });

    let containerDOM;
    this.$nextTick(() => {
      containerDOM = this.$refs.image_canvas_wrap;
      this.conWH = {
        width: containerDOM.clientWidth,
        height: containerDOM.clientHeight
      };
      this.toNext();
      // this.addrect();
    });
  },
  methods,
  props: {
    config: {
      default: () => {},
      type: Object
    }
  },
  data() {
    const defaultConfig = {
      colorList: ["#b92b27", "#ee9ca7", "#1565C0", "#a8ff78"],
      color: "#b92b27",
      pencilSizeList: [1, 2, 3, 4],
      pencilSize: 1,
      rotateLeft: true,
      rotateRight: true,
      zoomIn: true,
      zoomOut: true,
      prev: true,
      next: true
    };
    return {
      canvas: null,
      conWH: {},
      historyChanging: false,
      imageList: imageList,
      itemList: [],
      currIndex: -1,
      currItem: null,
      panning: false,
      mode: "",
      freeDrawingBrushWidth: 20,
      myConfig: Object.assign({}, defaultConfig, this.config),
      imgUrl: null,
      imgUrlExport: null

      // colors: {}
      // statusList: null,
    };
  },
  components: {
    MenuDrag,
    MenuPencil,
    MenuZoom,
    MenuRestore,
    MenuRotate,
    MenuColor,
    MenuEraser,
    MenuSwitchImage,
    MenuDownload,
    MenuUndo
  }
};
</script>

<style lang="less" scoped>
#container {
  // overflow: hidden;
}
#image_canvas_wrap {
  box-sizing: content-box;
  width: 800px;
  height: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  background: #fff;
  background-image: linear-gradient(
      45deg,
      #ccc 25%,
      transparent 25%,
      transparent 75%,
      #ccc 75%,
      #ccc
    ),
    linear-gradient(
      45deg,
      #ccc 25%,
      transparent 25%,
      transparent 75%,
      #ccc 75%,
      #ccc
    );
  background-size: 24px 24px;
  background-position: 0 0, 12px 12px;
  #image_canvas {
    height: 100%;
    width: 100%;
    border: 1px solid red;
    box-sizing: border-box;
    display: flex;
    align-self: center;
    // border-left: 10px solid red;
  }
}
#menu {
  width: 800px;
  height: 50px;
  position: relative;
  z-index: 1;
  background: #485563;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to bottom,
    #29323c,
    #485563
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to bottom, #29323c, #485563);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  margin: 0 auto;
  display: flex;
  align-items: center;
  .menu_item {
    flex: 1;
    position: relative;
  }
}
</style>
