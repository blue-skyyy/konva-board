<template>
  <div class="menu-draw">
    <el-button>画笔</el-button>
    <el-button>橡皮擦</el-button>
  </div>
</template>
<script>
import Konva from "konva";
export default {
  name: "draw",
  data() {
    return {};
  },
  props: {
    freeDrawLayer: {
      type: Object
    },
    stage: {
      type: Object
    },
    mode: {
      type: String
    }
  },
  watch: {
    mode() {
      console.log("=====", this.stage);
      // if (val === "brush" || val === "eraser") {
      //   this.paintEvent();
      // }
    },
    stage() {
      if (this.mode === "brush" || this.mode === "eraser") {
        this.paintEvent();
      }
    }
  },
  methods: {
    paintEvent() {
      if (!this.stage) return;
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
        this.$emit("saveCurrItemState");
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
    }
  }
};
</script>
