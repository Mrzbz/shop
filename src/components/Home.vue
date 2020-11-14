<template>
  <div>
    <el-button type="info" @click="quit">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    quit() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
  },
};
</script>
