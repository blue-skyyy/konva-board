<template>
  <div class="menu_pencil">
    <div v-html="pencil" class="pencil_icon" @click.stop="dealClick"></div>
    <div class="pencil_box" v-show="isShow">
      <div
        class="pencil_item"
        v-for="(d, index) in pencilSizeList"
        @click.stop="changePencilSize(d)"
        :key="index"
        :class="{ active: d === pencilSize }"
        :style="setStyle(index)"
      ></div>
    </div>
  </div>
</template>
<script>
import { fabric } from "fabric";
// import { fabric } from "fabric";
// import Pressure from "pressure";

import icons from "../icons.js";
export default {
  name: "pencil",
  props: {
    mode: {
      default: "",
      type: String
    },
    canvas: {
      default: () => {},
      type: Object
    },
    color: {
      default: "",
      type: String
    },
    pencilSizeList: {
      default: () => [],
      type: Array
    },
    pencilSize: {
      default: 1,
      type: Number
    }
  },
  data() {
    return {
      points: [],
      canDraw: false,
      priviousPressure: 0,
      beginPoint: null,
      endPoint: null,
      pressure: null,
      // baseLineList: [6, 10, 15, 25],
      pencil: icons.pencil,
      isShow: false
    };
  },
  computed: {
    setStyle() {
      return function(index) {
        return {
          width: `${4 * (index + 2)}px`,
          height: `${4 * (index + 2)}px`
        };
      };
    }
  },
  methods: {
    handleUp(e) {
      if (!this.canDraw) return;
      const { x, y, pressure } = this.getPos(e);
      this.priviousPressure = pressure;
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
          (this.priviousPressure + pressure) / 2
        );
        this.beginPoint = endPoint;
      } else {
        this.priviousPressure = pressure;
      }
      this.beginPoint = null;
      this.canDraw = false;
      this.points = [];
    },
    handleDown(e) {
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
      this.points.push({ x, y, command: "L" });
      if (this.points.length > 3) {
        const lastTwoPoints = this.points.slice(-2);
        const controlPoint = lastTwoPoints[0];
        const endPoint = {
          x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
          y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2
        };
        this.drawPath(this.beginPoint, controlPoint, endPoint, pressure);
        this.beginPoint = endPoint;
      }
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
    },

    getPos(e) {
      return {
        x: e.absolutePointer.x,
        y: e.absolutePointer.y,
        pressure: 1
      };
    },

    drawPath(beginPoint, controlPoint, endPoint, width) {
      let c = document.createElement("canvas");
      this.ctx = c.getContext("2d");
      this.ctx.beginPath();
      this.ctx.moveTo(beginPoint.x, beginPoint.y);
      this.ctx.quadraticCurveTo(
        controlPoint.x,
        controlPoint.y,
        endPoint.x,
        endPoint.y
      );

      this.ctx.lineWidth = width;
      this.ctx.stroke();
      this.ctx.closePath();
      let p = this.pathToCurve(this.points);
      var path = new fabric.Path(p, {
        fill: null,
        stroke: "green",
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
      this.canvas.add(path);
    },
    unShow() {
      this.isShow = false;
    },
    changePencilSize(size) {
      this.$emit("changeConfig", "pencilSize", size);
      this.isShow = false;
    },
    dealClick() {
      // console.log("yes");
      this.isShow = true;
      // this.pencil = icons.activePencil;

      this.$emit("click");
    },

    freeDraw() {
      // const that = this;
      // var hLinePatternBrush = new fabric.PatternBrush(this.canvas);
      // hLinePatternBrush.getPatternSrc = (function(fabric) {
      //   return function() {
      //     var patternCanvas = fabric.document.createElement("canvas");
      //     patternCanvas.width = patternCanvas.height = 10;
      //     var ctx = patternCanvas.getContext("2d");
      //     ctx.strokeStyle = "green";
      //     ctx.lineWidth = 40;
      //     ctx.beginPath();
      //     ctx.moveTo(5, 0);
      //     ctx.lineTo(5, 10);
      //     ctx.closePath();
      //     ctx.stroke();
      //     return patternCanvas;
      //   };
      // })(fabric);

      // this.canvas.freeDrawingBrush = hLinePatternBrush;
      // this.canvas.freeDrawingBrush.width = 5;
      let cxt = this.canvas.getContext("2d");
      cxt.globalCompositeOperation = "source-over";
      // fabric.Path.globalCompositeOperation = "source-over";
      this.canvas.freeDrawingBrush = null;
      let pencilBrush = new fabric.PencilBrush(this.canvas);

      console.log("color", this.color, "width", this.pencilSize);
      pencilBrush.color = this.color;
      pencilBrush.width = this.pencilSize;
      this.canvas.freeDrawingBrush = pencilBrush;
    }
  },
  watch: {
    mode(newMode) {
      // if (newMode !== "pencil") {
      //   this.canvas.isDrawingMode = false;
      //   this.canvas.off("mouse:down");
      //   this.canvas.off("mouse:up");
      //   this.canvas.off("mouse:move");
      // }
      if (newMode === "pencil") {
        this.canvas.discardActiveObject();
        // console.log("A");
        this.pencil = icons.activePencil;
        this.canvas.isDrawingMode = true;
        // this.isShow = true;
        let brush = this.canvas.freeDrawingBrush;
        brush.color = this.color;
        brush.width = this.pencilSize;
        // this.freeDraw();
        this.canvas.on("mouse:down", this.handleDown);
        this.canvas.on("mouse:move", this.handleMove);
        this.canvas.on("mouse:up", this.handleUp);
      }

      if (newMode !== "pencil") {
        // console.log("B");
        this.canvas.isDrawingMode = false;
        this.pencil = icons.pencil;
        this.isShow = false;
      }
    },
    pencilSize(val) {
      this.canvas.freeDrawingBrush.width = val;
    },
    color(val) {
      this.canvas.freeDrawingBrush.color = val;
    }
  }
};
</script>

<style lang="less" scoped>
.menu_pencil {
  position: relative;
  .pencil_box {
    position: absolute;
    top: 30px;
    display: flex;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 8px 6px;
    background: #383c36;
    align-items: center;
    &::after {
      content: "";
      position: absolute;
      padding: 0;
      width: 0;
      height: 0;
      border-right: 10px solid transparent;
      border-left: 10px solid transparent;
      border-bottom: 10px solid #383c36;
      top: -10px;
      left: 50%;
      transform: translate(-50%, 0);
    }
    .pencil_item {
      margin: 0 3px;
      background: #f2f2ee;
      border-radius: 50%;
    }
    .active {
      background: #999;
    }
  }
}
</style>
