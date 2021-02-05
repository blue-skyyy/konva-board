<template>
  
  <div class="container">
    <el-row>
      <el-col :span="isPreview ? 12 : 24">
        <div class="bg-purple-dark">
          <ImgDecorator @preview="preview" @emitLoadImg="emitLoadImg"/>
        </div>
      </el-col>
      <el-col :span="12" v-if="isPreview">
         <div class="bg-purple-light">
           <img :src="imgUrl" />
         </div>
      </el-col>
    </el-row>
  </div>


</template>

<script>

import ImgDecorator from "./ImgDecorator.vue";

export default {
  data() {
    return {
      isPreview: false,
      imgUrl: null,
    }
  },
  components: {
    ImgDecorator,
  },
  methods: {
    preview() {
      this.isPreview = !this.isPreview;
    },
    emitLoadImg(url) {
      this.imgUrl = url;
      if (!this.isPreview) {
        this.preview()
      }
    }
  }
}
</script>

<style lang="less" scoped>
@height: 800px;
@padding: 20px 20px;
.bg-purple-dark {
  background: #99a9bf;
  height: @height;
  padding: @padding;
}
.bg-purple-light {
  background: #e5e9f2;
   height: @height;
   padding: @padding;
   display: flex;
   align-items: center;
   img {
     width: 100%;
   }
}
</style>