<template>
  <div class="home-container">
    <el-container class="home-container">
      <el-header>
        <div>
          <img src="../assets/logo.png" />
          <span>后台管理系统</span>
        </div>
        <el-button type="info" @click="quit">退出</el-button>
      </el-header>
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle" @click="toggleCollapse">|||</div>
          <el-menu
            :default-active="activePath"
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#409eff"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            router
          >
            <!-- 一级菜单 -->
            <el-submenu
              :index="item.id + ''"
              v-for="item in menuList"
              :key="item.id"
            >
              <!-- 图标 -->
              <template slot="title">
                <i :class="iconObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item
                :index="'/' + chilItem.path"
                v-for="chilItem in item.children"
                :key="chilItem.key"
                @click="saveNavState('/' + chilItem.path)"
              >
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span>{{ chilItem.authName }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconObj: {
        "125": "iconfont icon-user",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao",
      },
      isCollapse: false,
      activePath: "",
    };
  },

  methods: {
    quit() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      let { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

      this.menuList = res.data;
      // console.log(this.menuList);
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接激活状态
    saveNavState(active) {
      window.sessionStorage.setItem("activePath", active);
      this.activePath = active;
    },
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
};
</script>

<style scoped>
.el-header {
  background-color: #3a8bf5;

  display: flex;
  justify-content: space-between;
  color: rgb(255, 255, 255);
  font-size: 24px;
  align-items: center;
}
.el-header img {
  width: 50px;
}
.el-header > div {
  display: flex;
  align-items: center;
}
/* div > span {
  margin-left: 15px;
} */
.el-aside {
  background-color: #545c64;
}
.el-main {
  background-color: #eaedf1;
}
.el-menu {
  border: 0;
}
.home-container {
  height: 100%;
}
.iconfont {
  margin-right: 10px;
}
.toggle {
  color: #fff;
  text-align: center;
  line-height: 24px;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
