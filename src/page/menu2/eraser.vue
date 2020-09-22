<template>
  <div>
    <div class="menu_eraser">
      <div @click="dealClick" v-html="eraserIcon" class="eraser_icon"></div>
      <div class="color_box" v-show="isShow"></div>
    </div>
  </div>
</template>

<script>
import icons from "../icons.js";

export default {
  name: "eraser",
  props: {
    mode: {
      default: "",
      type: String
    },
    canvas: {
      default: () => {},
      type: Object
    }
  },
  data() {
    return {
      eraserIcon: icons.eraser,
      isShow: false,
      hoverObj: null
    };
  },

  watch: {
    mode(newmode) {
      if (newmode === "eraser") {
        this.eraserIcon = icons.activeEraser;
      } else {
        this.eraserIcon = icons.eraser;
      }
    },
    canvas(newCanvas) {
      newCanvas.on("mouse:down", this.dealMousedown);
      newCanvas.on("object:over", this.dealMouseover);
    }
  },
  methods: {
    dealMousedown(e) {
      // 橡皮模式，移除选中的元素
      if (this.mode === "eraser" && e.target === this.hoverObj) {
        this.canvas.remove(this.hoverObj);
        this.hoverObj = null;
      }
    },
    dealMouseover(e) {
      // 判断是否是橡皮模式
      if (this.mode !== "eraser") return;

      let target = e.target;
      // 取消之前hoverObj的hover效果
      if (this.hoverObj) {
        this.hoverObj.stroke = this.hoverObj.origStroke;
        this.canvas.renderAll();
      }

      // hover对象为笔划
      if (target.get("type") === "path") {
        target.origStroke = target.stroke;
        // 高亮待删除的笔划
        target.stroke = "#999";
        this.hoverObj = target;
        this.canvas.renderAll();
      }
    },
    dealClick() {
      this.$emit("click");
    }
    // this.canvas.isDrawingMode = true;
    // const EraserBrush = fabric.util.createClass(fabric.PencilBrush, {
    //   _finalizeAndAddPath() {
    //     console.log("EraserBrush");
    //     let ctx = this.canvas.contextTop;
    //     ctx.closePath();
    //     if (this.decimate) {
    //       this._points = this.decimatePoints(this._points, this.decimate);
    //     }
    //     let pathData = this.convertPointsToSVGPath(this._points).join("");
    //     // console.log("pathData", pathData);
    //     if (pathData === "M 0 0 Q 0 0 0 0 L 0 0") {
    //       // do not create 0 width/height paths, as they are
    //       // rendered inconsistently across browsers
    //       // Firefox 4, for example, renders a dot,
    //       // whereas Chrome 10 renders nothing
    //       this.canvas.requestRenderAll();
    //       return;
    //     }

    //     // use globalCompositeOperation to 'fake' eraser
    //     let path = this.createPath(pathData);
    //     // console.log("path", path);
    //     path.globalCompositeOperation = "destination-out";
    //     path.selectable = false;
    //     path.evented = false;
    //     path.absolutePositioned = true;
    //     path.set({
    //       nameType: "eraser",
    //       globalCompositeOperation: "destination-out",
    //       opacity: 0
    //       // stroke: "green",
    //       // strokeWidth: 20
    //     });
  }
};
</script>
