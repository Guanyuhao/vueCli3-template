<template>
  <div class="layout-content">
    <div class="image-wrapper">
      <imageBase />
    </div>
    <div class="right"></div>
  </div>
</template>

<script>
import imageBase from "./base"
export default {
  name: "imageLabel",
  components: {
    imageBase
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
