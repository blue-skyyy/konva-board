<template>
  <div>
    <div class="manager_detail">
      <canvas id="canvas" width="1720" height="1050"></canvas>
    </div>
  </div>
</template>
<script>
import { fabric } from "fabric";
export default {
  components: {},
  watch: {},
  data() {
    return {
      panning: false
    };
  },
  methods: {
    initCanvas() {
      // 1. 实例化canvas 画布
      var canvas = new fabric.Canvas("canvas");
      // 2. 设置背景图片作为底图（这里导入图片使用require，不要 使用 '../../' 方式）
      // canvas.width / 4764  （4764 是我底图图片宽度）
      // canvas.height / 3367 （3367 是我底图图片宽度）
      // canvas.setBackgroundImage(
      //   require("../../assets/images/map.png"),
      //   canvas.renderAll.bind(canvas),
      //   {
      //     scaleX: canvas.width / 4764,
      //     scaleY: canvas.height / 3367
      //   }
      // );

      // canvas.a;

      //鼠标按下事件
      canvas.on("mouse:down", function() {
        this.panning = true;
        canvas.selection = false;
      });
      //鼠标抬起事件
      canvas.on("mouse:up", function() {
        this.panning = false;
        canvas.selection = true;
      });
      // 移动画布事件
      canvas.on("mouse:move", function() {
        console.log("fff");
        // if (this.panning && e && e.e) {
        //   var delta = new fabric.Point(e.e.movementX, e.e.movementY);
        //   canvas.relativePan(delta);
        // }
      });
      // 鼠标滚动放大缩小画布
      //
      // if (document.getElementById("canvas")) {
      //   // IE9, Chrome, Safari, Opera
      //   document.addEventListener("mousewheel", function(e) {
      //     if (e.target.className == "upper-canvas ") {
      //       var zoom = (event.deltaY > 0 ? -0.1 : 0.1) + canvas.getZoom();
      //       zoom = Math.max(0.1, zoom); //最小为原来的1/10
      //       zoom = Math.min(3, zoom); //最大是原来的3倍
      //       var zoomPoint = new fabric.Point(event.pageX, event.pageY);
      //       canvas.zoomToPoint(zoomPoint, zoom);
      //     }
      //   });
      // }
    }
  },
  created() {},
  mounted() {
    this.initCanvas();
  }
};
</script>
<style scoped>
.manager_detail {
  width: 100%;
  height: calc(100vh - 112px);
  overflow: hidden;
}
</style>
