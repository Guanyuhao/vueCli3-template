<template>
  <div class="about">
    <h1>
      This is an about page svg: <svg-icon icon-class="icon-back" />
      {{ new Date() | parseTime }}
    </h1>
    <imagelabel />
  </div>
</template>

<script>
import imagelabel from "@/components/imagelabel/index.vue"
export default {
  components: { imagelabel }
}
</script>

<style lang="scss" scoped>
.about {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  h1 {
    height: 50px;
  }
  .layout-content {
    flex: 1;
  }
}
</style>
