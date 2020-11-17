<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- card -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 一级 -->
            <el-row
              :class="['tagbottom', i === 0 ? 'tagtop' : '', 'vcenter']"
              v-for="(item, i) in scope.row.children"
              :key="item.id"
            >
              <el-col :span="5" class="vcenter">
                <el-tag closable @close="delRightsById(scope.row, item.id)"
                  >{{ item.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 二级 -->
              <el-col :span="19">
                <el-row
                  :class="['tagbottom', j == 0 ? 'tagtop' : '', 'vcenter']"
                  v-for="(citem, j) in item.children"
                  :key="citem.id"
                >
                  <el-col :span="6"
                    ><el-tag
                      type="success"
                      closable
                      @close="delRightsById(scope.row, citem.id)"
                      >{{ citem.authName }}</el-tag
                    >

                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="(ccitem, k) in citem.children"
                      :key="ccitem.id"
                      type="warning"
                      closable
                      @close="delRightsById(scope.row, ccitem.id)"
                      >{{ ccitem.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
              >编辑</el-button
            >
            <el-button type="danger" icon="el-icon-delete" size="mini"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRightsDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->

    <el-dialog
      title="分配权限"
      :visible.sync="rightsDialogVisible"
      width="70%"
      @close="setRightsDialogClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      rightsDialogVisible: false,
      // 树形控件 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      let { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success(res.meta.msg);
      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    // 根据id删除对应的权限
    async delRightsById(row, id) {
      let confirmRes = await this.$confirm("确定要删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);

      if (confirmRes !== "confirm") {
        return this.$message.info("取消删除");
      } else {
        let { data: res } = await this.$http.delete(
          `roles/${row.id}/rights/${id}`
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        } else {
          this.$message.success(res.meta.msg);
          row.children = res.data;
        }
      }
    },
    // 分配权限对话框
    async setRightsDialog(row) {
      this.roleId = row.id;
      let { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

      this.rightsList = res.data;

      // 递归获取三级节点
      this.getLeafKeys(row, this.defKeys);
      this.rightsDialogVisible = true;
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // 监听关闭分配权限对话框
    setRightsDialogClose() {
      this.defKeys = [];
    },
    // 树形控件的确定按钮 为角色分配权限
    async allotRights() {
      let keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      let idStr = keys.join(",");
      let { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr,
      });

      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

      this.$message.success(res.meta.msg);

      this.getRolesList();

      this.rightsDialogVisible = false;
    },
  },
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.tagtop {
  border-top: 1px solid #eee;
}
.tagbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
