<template>
  <div>
    <div class="canvas-container">
      <canvas ref="canvas" id="canvas"></canvas>
      <h5-canvas
        :width="config.width"
        :height="config.height"
        :color="color"
        :mode="mode"
        ref="h5canvas"
        :item="currItem"
        class="h5canvas"
        :fc="canvas"
      ></h5-canvas>
    </div>
    <button @click="changeMode('pencil')">画笔模式</button>
    <button @click="changeMode('eraser')">橡皮擦模式</button>
    <button @click="saveState">保存状态</button>
    <button @click="reStoreState">清除状态</button>
    <button @click="undo">上一步</button>
    <button @click="switchToNext(1)">切换图片</button>
    <button @click="exportTest">导出</button>
    <button @click="composeImageTest">生成合成图片</button>
    <button @click="addRect">添加fabric对象</button>
    <button @click="addRect1">添加fabric对象1</button>
    <button @click="removeRect">删除fabric对象</button>
    <img :src="baseUrl" />
    <img :src="composeUrl" />
  </div>
</template>

<script>
import { fabric } from "fabric";
import h5Canvas from "./module/h5canvas";
import Item from "./Item.js";
import { composeCanvas } from "../utils.js";
// isImageVaild,
const defaultConfig = {
  width: 800,
  height: 500
};
export default {
  components: {
    h5Canvas
  },
  data() {
    return {
      canvas: null,
      points: [],
      beginPoint: null,
      endPoint: null,
      ctx: null,
      canDraw: false,
      priviousPressure: 0,
      baseLineList: [6, 10, 15, 25],
      pathStr: "",
      color: "red",
      mode: "pencil",
      config: Object.assign({}, defaultConfig),
      imagesList: [
        "https://img.vipkidstatic.com/beeschool/server/20200717/ccb8432c-acf2-4f63-b51d-4195a3fde520.png",
        "https://img.vipkidstatic.com/beeschool/server/20200717/b279967c-4d95-4603-899c-74db4092d5b8.png"
      ],
      currIndex: 0,
      itemList: [],
      currItem: null,
      isFirstRender: true,
      loadedStatus: [],
      baseUrl: null,
      composeUrl: null,
      rect: null,
      historyChanging: false // 避免added触发
    };
  },
  mounted() {
    this.initCanvas();
    this.switchToNext();
  },
  methods: {
    removeRect() {
      this.canvas.remove(this.rect);
    },
    undo() {
      // 返回上一步
      if (!this.currItem) return;
      if (this.historyChanging) return;
      let state = this.currItem.getPreHistory();
      if (!state) return;
      this.historyChanging = true;
      console.log("state", state);
      const { type, data } = state;
      if (type === "h5") {
        this.$refs.h5canvas.putImageData(data);
        this.historyChanging = false;
        console.log("this.historyChanging---h5", this.historyChanging);
      } else if (type === "fabric") {
        this.canvas.loadFromJSON(data, () => {
          this.historyChanging = false;
          this.canvas.renderAll();
          console.log("this.historyChanging--fabric", this.historyChanging);
        });
      } else {
        this.$refs.h5canvas.putImageData(state[0].data);
        this.canvas.loadFromJSON(state[1].data, () => {
          this.historyChanging = false;
          this.canvas.renderAll();
        });
      }
    },
    addRect() {
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
    },
    addRect1() {
      var rect = new fabric.Rect({
        top: 50, //距离画布上边的距离
        left: 200, //距离画布左侧的距离，单位是像素
        width: 200, //矩形的宽度
        height: 1000, //矩形的高度
        fill: "red", //填充的颜色
        stroke: "red", // 边框原色
        strokeWidth: 5, // 边框大小
        rx: 8, //圆角半径
        ry: 4 //圆角半径
      });
      this.rect = rect;

      this.canvas.add(rect);
    },
    composeImageTest() {
      // console.log("this.canvas.toDataURL()", this.canvas.toDataURL());
      let url = composeCanvas(
        this.config.width,
        this.config.height,
        document.querySelector(".h5canvas"),
        // this.canvas.toDataURL()
        document.querySelector("#canvas")
        // document.querySelector(".lower-canvas")
      );
      this.composeUrl = url;
      console.log("url", url);
    },
    exportTest() {
      this.baseUrl = this.currItem.h5exprot();
    },
    saveState() {
      // this.$refs.h5canvas.save();
      // this.currItem.h5save();
    },
    reStoreState() {
      this.currItem.geth5State("undo");
    },
    pre() {},
    changeMode(mode) {
      this.mode = mode;
    },

    save() {
      if (!this.currItem) return;
      console.log("-----in---save-----");
      // console.log("-----save-----data", data);
      this.canvas.renderAll();
      let data = this.canvas.toJSON();
      this.currItem.save("fabric", data);
    },
    dealAdd() {
      if (this.historyChanging) return;
      console.log("----dealAdd----");
      this.save();
      // let state = JSON.stringify(this.canvas.toJSON());
      // this.currItem.save("fabric", state);

      //       // 忽略loadFromJSON过程中触发的add
      // if (this.switching || this.historyChanging) return;
      // // 忽略添加背景图片触发的add
      // if (e.target.isBackground) return;
      // if (this.mode === "pencil" && this.myAutoSave) {
      //   // 由于画笔会频繁触发保存函数，重新render，视觉会造成反应不及时的问题，限制2s才触发一次
      //   this.debounceMethod(this);
      //   return;
      // }
      // this.myAutoSave && this.prepareSave();
    },
    dealModify() {
      if (this.historyChanging) return;
      // console.log("added");
    },
    dealRemove() {
      if (this.historyChanging) return;
      // console.log("removed");
    },

    initCanvas() {
      let canvas = new fabric.Canvas("canvas", {
        isDrawingMode: false,
        width: 800,
        height: 500
      });

      // canvas.on("object:modified", () => {
      //   console.log("object:modified");
      //   let state = JSON.stringify(canvas);
      //   this.currItem.save(state);
      // });
      // canvas.on("object:added", () => {
      //   console.log("object:added");
      //   let state = JSON.stringify(canvas);
      //   this.currItem.save(state);
      // });
      // canvas.on("object:removed", () => {
      //   console.log("object:removed");
      // });

      canvas.on("object:added", this.dealAdd);
      canvas.on("object:modified", this.dealModify);
      canvas.on("object:removed", this.dealRemove);
      // canvas.on("after:render", () => { })
      this.canvas = canvas;

      this.loadedStatus = new Array(this.imagesList.lenthg).fill(false);
    },
    switchToNext(index) {
      this.switchImage(index);
    },

    async switchImage(index) {
      // 每加载一张图片才会生成一个实例
      this.currIndex = index || 0;

      if (!this.loadedStatus[this.currIndex]) {
        // 首次加载
        let item = new Item({
          url: this.imagesList[this.currIndex],
          canvas: this.canvas,
          h5canvas: this.$refs.h5canvas
        });
        item.isImageVaild().then((res) => {
          // 图片合法
          if (res.status === "ok") {
            let center = this.canvas.getCenter();
            this.canvas.setBackgroundImage(
              this.imagesList[this.currIndex],
              this.canvas.renderAll.bind(this.canvas),
              {
                // scaleX: 1.2,
                // scaleY: 1.2,
                width: this.canvas.width,
                height: this.canvas.height,
                top: center.top,
                left: center.left,
                originX: "center",
                originY: "center",
                crossOrigin: "anonymous",
                isBackImg: true
              }
            );
            this.itemList.push(item);
            this.currItem = item;
            this.loadedStatus[this.currIndex] = true;
            // 自动保存一条记录
            // this.currItem.h5save("init");
            let h5data = this.$refs.h5canvas.saveImageData();
            this.currItem.save("h5", h5data, "init");
            setTimeout(() => {
              this.currItem.save("fabric", this.canvas.toJSON(), "init");
            }, 100);
          }
        });
      } else {
        // 非首次加载
      }
    },
    // async switchImagetest(index) {
    //   // 每加载一张图片才会生成一个实例
    //   this.currIndex = index || 0;
    //   if (this.isFirstRender) {
    //     // 首次渲染
    //     let promiseList = [];
    //     this.imagesList.forEach((url) => {
    //       promiseList.push(isImageVaild(url));
    //     });
    //     const result = await Promise.allSettled(promiseList);
    //     result.forEach((p) => {
    //       // if (p.status === "fulfilled") {
    //       //   this.itemList.push(new Item({ p: res.url, canvas: this.canvas }));
    //       // }
    //       if (p.status === "rejected" || p.status === "fulfilled") {
    //         this.itemList.push(
    //           new Item({ url: p.value.url, canvas: this.canvas })
    //         );
    //       }
    //     });
    //     this.isFirstRender = false;
    //   }
    //   this.currItem = this.itemList[this.currIndex];
    //   this.currItem.historyList.push(JSON.stringify(this.canvas));
    //   let center = this.canvas.getCenter();
    //   this.canvas.setBackgroundImage(
    //     this.itemList[this.currIndex].url,
    //     this.canvas.renderAll.bind(this.canvas),
    //     {
    //       // width: (this.canvas.width / 3) * 2,
    //       // height: this.canvas.height,
    //       // height: 800,
    //       // origin: "center"
    //       scaleX: 1,
    //       scaleY: 1,
    //       // top: 0,
    //       top: center.top,
    //       left: center.left,
    //       // left: 0,
    //       originX: "center",
    //       originY: "center"
    //       // originX: "center",
    //       // originY: "top"
    //     }
    //   );
    //   this.$refs.h5canvas.save();
    // },
    pathToCurve(path, controlPointsNum = 2) {
      // M 开始 L 结束
      let support = ["M", "L"];
      let curve = { 2: "Q", 3: "C" };
      let str = "";
      for (let i = 0; i < path.length; i++) {
        let { command, x, y } = path[i];
        if (!support.includes(command)) {
          throw new Error(`${command} is not support width start`);
        }
        if (i % controlPointsNum === 0) {
          // 剩余点数不够组成曲线时使用L
          let cmd =
            i + controlPointsNum <= path.length ? curve[controlPointsNum] : "L";
          str += ` ${cmd} ${x} ${y}`;
        } else {
          str += ` ${x} ${y}`;
        }
      }
      return str;
    }
  }
};
</script>

<style lang="less" scoped>
.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 5px solid red;
  position: relative;
  overflow-y: scroll;
  #canvas {
    box-sizing: border-box;
  }
  // .h5-canvas {
  //   border: 1px solid green;
  //   position: absolute;
  //   z-index: 999;
  // }
}
</style>
