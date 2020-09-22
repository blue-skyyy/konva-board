<template>
  <div class="menu_switch_image" :style="setStyle(prev, next)">
    <div @click.stop="switchImage('prev')" :style="!prev && 'display:none'">
      <div class="icon" v-html="icons.prev"></div>
    </div>
    <div :style="!next && 'display:none'" @click.stop="switchImage('next')">
      <div class="icon" v-html="icons.next"></div>
    </div>
  </div>
</template>

<script>
import icons from "../icons.js";
export default {
  props: {
    prev: {
      type: Boolean,
      default: false
    },
    next: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      icons
    };
  },
  methods: {
    switchImage(flag) {
      if (flag === "prev") {
        this.$emit("prevFunc");
      }

      if (flag === "next") {
        this.$emit("nextFunc");
      }
    }
  },
  computed: {
    setStyle() {
      return function(prev, next) {
        if (prev && next) {
          return {
            display: "flex",
            flex: 2
          };
        }
        if (!prev && !next) {
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
.menu_switch_image {
  display: flex;
  justify-content: space-around;
}
</style>
