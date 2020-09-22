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
      pencil: icons.pencil,
      isShow: false,
      positionStarStr: ""
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
    pathEnd() {
      if (!this.canDraw) return;
      let ctxCanvasPathString = this.pathToCurve(this.points);
      ctxCanvasPathString = `${this.positionStarStr} ${ctxCanvasPathString}`;
      this.positionStarStr = "";
      this.points = [];
      this.canDraw = false;
      this.drawPath(ctxCanvasPathString);
    },
    getPos(e) {
      let pointer = {
        x: e.absolutePointer.x,
        y: e.absolutePointer.y
      };
      return pointer;
    },

    pathStart({ x, y }) {
      this.positionStarStr = `M ${x} ${y}`;
    },
    onPointup() {
      if (!this.canDraw) return;
      this.pathEnd();
    },
    onPointdown(e) {
      this.canDraw = true;
      let pos = this.getPos(e);
      this.positionStarStr = `M ${pos.x} ${pos.y}`;
    },
    onPointmove(e) {
      if (!this.canDraw) return;
      let pos = this.getPos(e);
      this.points.push({ x: pos.x, y: pos.y, command: "L" });
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

    drawPath(pathStr) {
      console.log("this.color", this.color, this.pencilSize);
      let path = new fabric.Path(pathStr, {
        fill: null,
        // stroke: this.color,
        stroke: "#b92b27",
        strokeWidth: this.pencilSize,
        strokeLineCap: "round",
        strokeLineJoin: "round",
        absolutePositioned: true,
        pathOffset: null,
        evented: true,
        hasControls: true,
        hasBorders: true,
        selectable: true,
        isDrawingMode: false,
        className: "custom_path"
      });
      path.set("className", "custom_path");
      this.canvas.add(path);
      this.canvas.renderAll();
    },

    unShow() {
      this.isShow = false;
    },
    changePencilSize(size) {
      this.$emit("changeConfig", "pencilSize", size);
      this.isShow = false;
    },
    dealClick() {
      this.isShow = true;
      this.$emit("click");
    }
  },
  watch: {
    mode(newMode) {
      if (newMode === "pencil") {
        this.canvas.discardActiveObject();
        this.pencil = icons.activePencil;
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush.color = this.color;
        let container = this.canvas;
        container.on("mouse:down", this.onPointdown);
        container.on("mouse:move", this.onPointmove);
        container.on("mouse:up", this.onPointup);
      }

      if (newMode !== "pencil") {
        this.canvas.isDrawingMode = false;
        this.pencil = icons.pencil;
        this.isShow = false;
        let container = this.canvas;
        container.off("mouse:down", this.onPointdown);
        container.off("mouse:move", this.onPointmove);
        container.off("mouse:up", this.onPointup);
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
