<template>
  <div class="layout-content">
    <div class="image-wrapper">
      <imageBase ref="imageBase" />
    </div>
    <div class="right">
      <el-button @click="drawRect">绘制矩形</el-button>
      <el-button @click="openMove">移动</el-button>
    </div>
  </div>
</template>

<script>
// #502F3A,#502F50,#50412F,#43502F,#2F5050,#2F4150,#2F3150,#402F50,#2F5036
import imageBase from "./base"
export default {
  name: "imageLabel",
  components: {
    imageBase
  },
  methods: {
    drawRect() {
      this.$refs.imageBase.openRect()
    },
    openMove() {
      this.$refs.imageBase.openMove()
    }
  }
}
</script>

<style lang="scss" scoped>
.layout-content {
  display: flex;
  flex-direction: row;
  .image-wrapper {
    flex: 1;
    box-sizing: border-box;
    padding: 5px;
  }
  .right {
    width: 400px;
  }
}
</style>
