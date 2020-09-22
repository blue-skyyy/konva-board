<template>
  <div>
    <div class="menu_drag">
      <div @click="dealClick" v-html="dragIcon" class="drag_icon"></div>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";
import icons from "../icons.js";
export default {
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
      dragIcon: icons.drag
    };
  },
  methods: {
    dealClick() {
      this.canvas.discardActiveObject();
      this.$emit("click");
      let sel = new fabric.ActiveSelection(this.canvas.getObjects(), {
        canvas: this.canvas
      });
      this.canvas.setActiveObject(sel);
      this.canvas.renderAll();
    }
  },
  watch: {
    mode(newmode) {
      if (newmode === "drag") {
        this.dragIcon = icons.activeDrag;
      } else {
        this.dragIcon = icons.drag;
      }
    }
  }

  // watch: {
  //   mode(newMode) {
  //     if (newMode === "drag" || this.mode === "drag") {
  //       console.log("watch");
  //       this.dealClick();
  //       // let sel = new fabric.ActiveSelection(this.canvas.getObjects(), {
  //       //   canvas: this.canvas
  //       // });
  //       // this.canvas.setActiveObject(sel);
  //       // this.canvas.renderAll();
  //     }
  //   }
  // }
};
</script>

<style lang="less" scoped>
div {
  // background: red;
  display: inline-block;
}
</style>
