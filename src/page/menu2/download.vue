<template>
  <div>
    <div class="menu_download">
      <div @click="dealClick" v-html="downloadIcon" class="eraser_icon"></div>
    </div>

    <el-dialog
      title="请选择下载图片类型"
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
    >
      <el-button type="warning" @click.stop="download('origin')"
        >下载原始图片</el-button
      >
      <el-button type="danger" @click.stop="download('current')"
        >下载当前图片</el-button
      >
    </el-dialog>
  </div>
</template>

<script>
import icons from "../icons.js";

export default {
  name: "download",
  props: {
    mode: {
      default: "",
      type: String
    },
    canvas: {
      default: () => {},
      type: Object
    },
    originUrl: {
      default: "",
      type: String
    },
    exportImage: {
      default: null,
      type: Function
    }
  },
  data() {
    return {
      downloadIcon: icons.download,
      dialogVisible: false
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
    download(type) {
      if (type === "origin") {
        if (!this.originUrl) return;
        fetch(this.originUrl)
          .then((res) => {
            return res.blob();
          })
          .then((data) => {
            let downloadLink = document.createElement("a");
            downloadLink.href = window.URL.createObjectURL(data);
            downloadLink.download = new Date().getTime() + ".jpeg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(downloadLink.href);
            this.dialogVisible = false;
          })
          .catch((err) => {
            this.$message.error(err + "下载失败");
            this.dialogVisible = false;
          });
      }

      if (type === "current") {
        this.exportImage("single").then((url) => {
          let img = new Image(); // 获取要下载的图片
          img.src = url;
          img.onload = () => {
            let a = document.createElement("a"); // 创建一个a节点插入的document
            let event = new MouseEvent("click"); // 模拟鼠标click点击事件
            a.download = "downImg"; // 设置a节点的download属性值
            a.href = url; // 将图片的src赋值给a节点的href
            a.dispatchEvent(event); // 触发鼠标点击事件
            this.dialogVisible = false;
            a.parentNode.removeChild(a);
          };
          img.onerror = (err) => {
            this.$message.error(err + "下载失败");
            this.dialogVisible = false;
          };
        });
      }
    },
    dealClick() {
      this.dialogVisible = true;
    }
  }
};
</script>
