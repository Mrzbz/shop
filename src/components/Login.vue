<template>
  <div class="login_container">
    <div class="loginBox">
      <!-- 头像 -->
      <div class="avatar">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单 -->
      <div class="form">
        <el-form
          :model="loginForm"
          status-icon
          :rules="rules"
          ref="loginFormRef"
        >
          <!-- username -->
          <el-form-item prop="username">
            <el-input
              placeholder="请输入用户名"
              prefix-icon="iconfont icon-user"
              v-model="loginForm.username"
            >
            </el-input>
          </el-form-item>
          <!-- pwd -->
          <el-form-item prop="password">
            <el-input
              placeholder="请输入密码"
              prefix-icon="iconfont icon-3702mima"
              v-model="loginForm.password"
              type="password"
              autocomplete="off"
            >
            </el-input>
          </el-form-item>
          <!-- button -->
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import "../plugins/element";
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 失去焦点验证
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 15,
            message: "长度在 3 到 15 个字符",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur",
          },
          { min: 6, max: 16, message: "长度在6到16个字符", trugger: "blur" },
        ],
      },
    };
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return;

        const result = await this.$http.post("login", this.loginForm);

        const { data: res } = result;
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error("登录失败");
        this.$message.success("登录成功");
        window.sessionStorage.setItem("token", res.data.token);
        this.$router.push("/home");
      });
    },
    reset() {
      this.$refs.loginFormRef.resetFields();
    },
  },
};
</script>

<style scoped>
.login_container {
  /* background-color: #2b4b6b; */
}
.loginBox {
  width: 450px;
  height: 300px;
  background-color: blanchedalmond;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.loginBox > .avatar {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 10px #aaa;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
.avatar > img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.form {
  width: 100%;
  position: absolute;
  bottom: 0;
  padding: 20px;
  box-sizing: border-box;
}
</style>
