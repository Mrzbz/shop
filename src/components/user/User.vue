<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="18">
          <!-- 搜索框 -->
          <el-input
            v-model="queryInfo.query"
            @clear="getUserList"
            placeholder="请输入内容"
            clearable
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
        <!-- Dialog -->
        <el-dialog
          title="添加用户"
          :visible.sync="dialogVisible"
          width="50%"
          @close="dialogClose"
        >
          <el-form
            :model="addForm"
            :rules="addFormRules"
            ref="ruleFormRef"
            label-width="70px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>

            <el-form-item label="手机" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>
        <!-- Dialog -->
      </el-row>

      <!-- 表格 -->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="changeState(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 分配角色 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                size="mini"
                @click="setRole(scope.row)"
                icon="el-icon-setting"
              >
              </el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="delUser(scope.row.id)"
            ></el-button>
            <!--  -->
            <el-dialog
              title="提示"
              :visible.sync="editDialogVisible"
              width="50%"
            >
              <el-form
                :model="editForm"
                :rules="editRules"
                ref="editRuleFormRef"
                label-width="70px"
                @close="editClose"
              >
                <el-form-item label="用户名">
                  <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="editForm.email" prop="email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                  <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo"
                  >确 定</el-button
                >
              </span>
            </el-dialog>
            <!--  -->

            <!-- 分配角色对话框 -->
            <el-dialog
              title="分配角色"
              :visible.sync="setRoleDialogVisible"
              width="50%"
              @close="setRoleDialogClose"
            >
              <div>
                <p>当前用户:{{ userInfo.username }}</p>
                <p>当前用户:{{ userInfo.role_name }}</p>
                <div>
                  分配新角色:
                  <div>
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                      <el-option
                        v-for="item in rolesList"
                        :key="item.id"
                        :label="item.roleName"
                        :value="item.id"
                      >
                      </el-option>
                    </el-select>
                  </div>
                </div>
              </div>
              <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false"
                  >取 消</el-button
                >
                <el-button type="primary" @click="saveRoleInfo"
                  >确 定</el-button
                >
              </span>
            </el-dialog>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    // 验证手机规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的电话号码"));
    };

    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      // dialog
      dialogVisible: false,
      editDialogVisible: false,
      // dialogForm
      addForm: {
        username: "",
        password: "",
        email: "",
      },
      editForm: {},

      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      editRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 分配角色对话框
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 选中项 角色id值
      selectedRoleId: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      let { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    // 监听每页显示数量
    handleSizeChange(newSize) {
      console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码值
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    async changeState(userinfo) {
      let { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      this.$message.success("更新用户状态成功！");
    },
    // 监听dialog的关闭事件
    dialogClose() {
      this.$refs.ruleFormRef.resetFields();
    },
    // 点击按钮添加新用户
    addUser() {
      this.$refs.ruleFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        // 校验通过可以发送请求
        let { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) return this.$message.error("添加用户失败");

        this.$message.success(res.meta.msg);
        this.dialogVisible = false;
        this.getUserList();
      });
    },
    // 修改弹出框
    async showEditDialog(id) {
      let { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.editForm = res.data;

      this.editDialogVisible = true;
    },
    // 监听关闭编辑窗口
    editClose() {
      this.$refs.editRulesFormRef.resetFields();
    },
    // 修改用户信息
    editUserInfo() {
      this.$refs.editRuleFormRef.validate(async (vali) => {
        if (!vali) return;
        let { data: res } = await this.$http.put("users/" + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        });

        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

        this.editDialogVisible = false;
        this.getUserList();
        this.$message.success(res.meta.msg);
      });
    },
    // 删除用户
    async delUser(id) {
      let str = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      console.log(str);
      if (str !== "confirm") {
        return this.$message.error("已取消操作");
      } else {
        let { data: res } = await this.$http.delete("users/" + id);
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg);
        } else {
          this.$message.success(res.meta.msg);
          this.getUserList();
        }
      }
    },
    // 分配角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;

      // 展示对话框之前，获取所有角色的列表
      let { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) return this.$message.error(res.mate.msg);

      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色");
      }
      let { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.setRoleDialogVisible = false;
      this.getUserList();
    },
    setRoleDialogClose() {
      this.userInfo = {};
      this.selectedRoleId = "";
    },
  },
};
</script>
