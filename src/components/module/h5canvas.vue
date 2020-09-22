<template>
  <canvas class="h5_canvas"></canvas>
</template>
<script>
import { debounce } from "../../utils.js";
import { fabric } from "fabric";
const PEN_URL =
  "https://img.vipkidstatic.com/beeschool/server/1594090400039/%E7%AC%94.png";

export default {
  props: {
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    mode: {
      type: String,
      default: ""
    },
    zIndex: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: "red"
    },
    item: {
      type: Object,
      default: () => {}
    },
    fc: {
      type: Object
    }
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      points: [],
      canDraw: false,
      priviousPressure: 0,
      beginPoint: null,
      endPoint: null,
      baseLineList: [6, 10, 15, 25],
      historyList: []
    };
  },
  watch: {
    mode(newVal) {
      if (!this.ctx) return;
      if (newVal === "pencil") {
        this.ctx.globalCompositeOperation = "source-over";
        this.canvas.style.cursor = `url("${PEN_URL}") 2 16, auto`;
        // this.canvas.setCursor(`url("${PENCIL_URL}") 2 16, auto`);
      }
      if (newVal === "eraser") {
        this.ctx.globalCompositeOperation = "destination-out";
        this.canvas.style.cursor = "wait";
      }
    }
  },
  mounted() {
    if (!this.width || !this.height) return;
    this.canvas = document.querySelector(".h5_canvas");
    // console.log(this.canvas, this.width);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.cursor = `url("${PEN_URL}") 2 16, auto`;
    this.ctx = this.canvas.getContext("2d");
    // console.log("...", this.canvas, this.ctx);
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.lineCap = "round"; //设置线条的结束端点样式
    this.ctx.lineJion = "round"; //设置两条线相交时，所创建的拐角类型
    this.ctx.strokeStyle = this.color; // 线条颜色

    // 注册事件
    this.canvas.addEventListener(
      "pointerdown",
      (e) => {
        // if (this.mode === "eraser") {
        //   this.eraser(e);
        // } else {
        this.handledown(e);
        // }
      },
      false
    );
    this.canvas.addEventListener(
      "pointerup",
      (e) => {
        this.handleUp(e);
        // this.debounceMethod(this);
        // this.item.save("h5", this.saveImageData());
      },
      false
    );
    this.canvas.addEventListener(
      "pointermove",
      (e) => {
        this.handleMove(e);
      },
      false
    );
    this.canvas.addEventListener(
      "pointerleave",
      (e) => {
        // if (this.mode === "eraser") {
        // this.eraser(e);
        // } else {
        this.handleUp(e);
        // this.saveImageData("llll");
        // }
      },
      false
    );
  },
  methods: {
    debounceMethod: debounce((that) => {
      // 防抖
      that.item.save("h5", that.saveImageData());
    }, 2000),
    handleUp(e) {
      if (!this.canDraw) return;
      const { x, y, pressure } = this.getPos(e);
      this.priviousPressure = pressure;
      // this.points.push({ x, y });
      this.points.push({ x, y, command: "L" });
      if (this.points.length > 3) {
        const lastTwoPoints = this.points.slice(-2);
        const controlPoint = lastTwoPoints[0];
        const endPoint = {
          x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
          y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2
        };
        this.drawPath(
          this.beginPoint,
          controlPoint,
          endPoint,
          ((this.priviousPressure + pressure) / 2) * this.baseLineList[0]
        );
        this.beginPoint = endPoint;
      } else {
        this.priviousPressure = pressure;
      }
      this.beginPoint = null;
      this.canDraw = false;
      this.points = [];
    },
    handledown(e) {
      this.canDraw = true;
      const { x, y, pressure } = this.getPos(e);
      this.priviousPressure = pressure;
      // this.points.push({ x, y });
      this.points.push({ x, y, command: "M" });
      this.beginPoint = { x, y };
    },
    handleMove(e) {
      if (!this.canDraw) return;
      const { x, y, pressure } = this.getPos(e);
      this.priviousPressure = pressure;
      // this.points.push({ x, y });
      this.points.push({ x, y, command: "L" });
      if (this.points.length > 3) {
        const lastTwoPoints = this.points.slice(-2);
        const controlPoint = lastTwoPoints[0];
        const endPoint = {
          x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
          y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2
        };
        this.drawPath(
          this.beginPoint,
          controlPoint,
          endPoint,
          pressure * this.baseLineList[0]
        );
        this.beginPoint = endPoint;
      }
    },
    getPos(e) {
      const { pressure } = e;
      return {
        x: e.layerX,
        y: e.layerY,
        pressure
      };
    },
    drawPath(beginPoint, controlPoint, endPoint, width) {
      this.ctx.beginPath();
      this.ctx.moveTo(beginPoint.x, beginPoint.y);
      this.ctx.quadraticCurveTo(
        controlPoint.x,
        controlPoint.y,
        endPoint.x,
        endPoint.y
      );
      if (this.mode === "eraser") {
        width = 15;
        this.ctx.strokeStyle = "#FFF";
      }
      this.ctx.lineWidth = width;
      this.ctx.stroke();
      this.ctx.closePath();
      let p = this.pathToCurve(this.points);
      var path = new fabric.Path(p, {
        fill: null,
        stroke: this.color,
        strokeWidth: width,
        strokeLineCap: "round",
        strokeLineJoin: "round",
        evented: false,
        hasControls: false,
        hasBorders: false,
        selectable: true,
        isDrawingMode: false
        // strokeStyle
      });
      this.fc.add(path);
    },
    saveImageData() {
      let imgData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      return imgData;
    },
    putImageData(data) {
      this.ctx.putImageData(data, 0, 0);
    },
    export() {
      return this.canvas.toDataURL("image/jpeg", 1.0);
      // console.log("p", p);
    },
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
.h5_canvas {
  // position: absolute;
  border: 1px solid green;
  top: 0;
}
</style>
