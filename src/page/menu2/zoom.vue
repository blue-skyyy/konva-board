<template>
  <div class="menu_zoom" :style="setStyle(zoomIn, zoomOut)">
    <div @click="setZoom('out')" :style="!zoomOut && 'display:none'">
      <div class="icon" v-html="icons.zoomOut"></div>
    </div>
    <div :style="!zoomIn && 'display:none'" @click="setZoom('in')">
      <div class="icon" v-html="icons.zoomIn"></div>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";
import icons from "../icons.js";
export default {
  props: {
    zoomStatus: {
      default: "",
      type: String
    },
    canvas: {
      default: () => {},
      type: Object
    },
    zoomIn: {
      type: Boolean,
      default: false
    },
    zoomOut: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      zoomStep: 0.1,
      icons
    };
  },
  methods: {
    setZoom(type) {
      // 以中心点为基点做缩放
      let zoom = this.canvas.getZoom();
      let center = this.canvas.getCenter();
      console.log(center.left, center.left * 0.9);
      let zoomPoint = new fabric.Point(center.left, center.top);
      if (type == "out") {
        // 放大
        zoom = zoom + this.zoomStep;
        zoom = Math.min(3, zoom); //最大是原来的3倍
        this.canvas.zoomToPoint(zoomPoint, zoom);
      }
      if (type === "in") {
        zoom = zoom - this.zoomStep;
        zoom = Math.max(0.1, zoom); //最小为原来的1/10
        this.canvas.zoomToPoint(zoomPoint, zoom);
      }
    }
  },
  computed: {
    setStyle() {
      return function(zoomIn, zoomOut) {
        if (zoomIn && zoomOut) {
          return {
            display: "flex",
            flex: 2
          };
        }
        if (!zoomIn && !zoomOut) {
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
  }
};
</script>

<style lang="less" scoped>
.menu_zoom {
  display: flex;
  // background: red;
  justify-content: space-around;
}
</style>
