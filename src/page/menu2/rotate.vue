<template>
  <div :style="setStyle(rotateLeft, rotateRight)" class="menu_rotate">
    <div :style="!rotateLeft && 'display:none'" @click="rotateTo('left')">
      <div class="icon" v-html="icons.rotateLeft"></div>
    </div>
    <div @click="rotateTo('right')" :style="!rotateRight && 'display:none'">
      <div class="icon" v-html="icons.rotateRight"></div>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";
import icons from "../icons.js";
export default {
  props: {
    canvas: {
      type: Object,
      default: () => {}
    },
    currItem: {
      type: Object,
      default: () => {}
    },
    rotateRight: {
      type: Boolean,
      default: false
    },
    rotateLeft: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      icons
    };
  },
  computed: {
    setStyle() {
      return function(left, right) {
        if (left && right) {
          return {
            display: "flex",
            flex: 2
          };
        }
        if (!left && !right) {
          return {
            display: "none"
          };
        }

        return {
          display: "flex",
          flex: 1
        };
      };
    }
  },
  methods: {
    rotateTo(direction) {
      this.currItem.rotateTo(direction);
      //  更新canvas的宽高
      const { imageInfo, rotate } = this.currItem;
      // 保持水平垂直居中
      let wrap = document.querySelector("#image_canvas_wrap");
      if (rotate % 180 === 0) {
        this.canvas.setWidth(imageInfo.scale.width);
        this.canvas.setHeight(imageInfo.scale.height);
        wrap.style["align-items"] = "center";
      } else {
        this.canvas.setWidth(imageInfo.scale.height);
        this.canvas.setHeight(imageInfo.scale.width);
        wrap.style["align-items"] = "flex-start";
      }
      // 作为组整体旋转
      this.canvas.discardActiveObject();
      let sel = new fabric.ActiveSelection(this.canvas.getObjects(), {
        canvas: this.canvas,
        cornerSize: 0,
        hasControls: true
      });
      this.canvas.setActiveObject(sel);
      direction === "left" ? sel.rotate(-90) : sel.rotate(90);
      // 恢复缩放
      let center = this.canvas.getCenter();
      let zoomPoint = new fabric.Point(center.top, center.left);
      this.canvas.zoomToPoint(zoomPoint, 1);
      // 组居中
      sel.center();
      this.canvas.renderAll();
    }
  }
};
</script>

<style lang="less" scoped>
.menu_rotate {
  justify-content: space-around;
}
</style>
