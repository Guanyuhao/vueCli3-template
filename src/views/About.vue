<template>
  <div class="about">
    <h1>This is an about page</h1>
    svg: <svg-icon icon-class="icon-back" />
    {{ new Date() | parseTime }}
  </div>
</template>

<script>
export default {
  components: {}
}
</script>

<style lang="scss" scoped></style>
