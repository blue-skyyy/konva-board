<template>
  <div class="menu_color">
    <div @click.stop="dealClick" v-html="colorIcon" class="color_icon"></div>
    <div class="color_box" v-show="isShow">
      <div
        class="color_item"
        v-for="(d, index) in colorList"
        @click.stop="changeColor(d)"
        :key="index"
        :style="setStyle(d)"
      ></div>
    </div>
  </div>
</template>

<script>
import icons from "../icons.js";
export default {
  name: "color",
  props: {
    colorList: {
      default: () => [],
      type: Array
    },
    mode: {
      default: "",
      type: String
    }
  },
  data() {
    return {
      colorIcon: icons.color,
      isShow: false
    };
  },
  computed: {
    setStyle() {
      return function (bgcolor) {
        return {
          backgroundColor: bgcolor,
          width: "20px",
          height: "20px"
        };
      };
    }
  },
  methods: {
    dealClick() {
      this.$emit("click", "color");
    },
    changeColor(color) {
      this.$emit("changeConfig", "color", color);
      this.isShow = false;
      this.$emit("click", "pencil");
    }
  },
  watch: {
    mode(newmode) {
      if (newmode === "color") {
        this.isShow = true;
        this.colorIcon = icons.activeColor;
      } else {
        this.isShow = false;
        this.colorIcon = icons.color;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.menu_color {
  position: relative;
  .color_box {
    position: absolute;
    top: 30px;
    display: flex;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 5px 3px;
    background: #383c36;
    z-index: 1000;
    &::after {
      z-index: 999;
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
    .color_item {
      margin: 0 3px;
    }
  }
}
</style>
