<template>
  <div>
    <div class="menu_undo">
      <div @click="dealClick" v-html="undoIcon"></div>
    </div>
  </div>
</template>

<script>
import icons from "../icons.js";

export default {
  name: "undo",
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
      undoIcon: icons.undo
      // isShow: false
    };
  },

  watch: {
    // mode(newmode) {
    //   if (newmode === "eraser") {
    //     this.eraserIcon = icons.activeEraser;
    //   } else {
    //     this.eraserIcon = icons.eraser;
    //   }
    // },
    // canvas(newCanvas) {
    //   newCanvas.on("mouse:down", this.dealMousedown);
    //   newCanvas.on("object:over", this.dealMouseover);
    // }
  },
  methods: {
    dealClick() {
      this.$emit("click");
    }
  }
};
</script>
