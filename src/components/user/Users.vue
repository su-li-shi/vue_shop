<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片试图区域 -->
    <el-card>
      <!-- 搜素与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
              placeholder="请输入内容"
              v-model="queryInfo.query"
              clearable
              @clear="getUserList"
          >
            <el-button
                slot="append"
                icon="el-icon-search"
                @click="getUserList">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch
                v-model="scope.row.mg_state"
                @change="userStateChanged(scope.row)"
                active-color="#13ce66"
                inactive-color="#ff4949"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--  分页区域 -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 8, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
    
    <!-- 添加用户的对话框 -->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
      <!---->
      <!-- 内容主体区域 -->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
        >
      <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  name: "Users",
  data: function() {
    //验证手机号的规则
    let checkMobile = (rule, value, cb) => {
      const regMobile = /^1[0-9]{10}$/
      if(regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      //  获取用户列表的参数对象
      queryInfo: {
        query: '',
        //当前页数
        pagenum: 1,
        //一页显示几条
        pagesize: 3
      },
      userList: [],
      total: 0,
      //  控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //  添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //  添加表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            triangle: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            triangle: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            triangle: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            triangle: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            triangle: 'blur'
          },
          { type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            triangle: 'blur'
          },
          {
            validator: checkMobile,triangle: ['blur','change']
          }
        ]
      },
      // 查询到的用户信息对象
      editForm: {},
      //  修改表单的验证规则对象
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            triangle: 'blur'
          },
          { type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            triangle: 'blur'
          },
          {
            validator: checkMobile,triangle: ['blur','change']
          }
        ]
      },
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const {data: res} = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 Switch状态的改变
    async userStateChanged(userInfo) {
      console.log(userInfo)
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status != 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$http.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    //  监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //  监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if(!valid) return
      // 可以发起添加用户的网络请求
        const {data : res} = await this.$http.post('users', this.addForm)
        console.log(res)
        if(res.meta.status !== 201) {
          this.$message.error('添加用户失败!')

        }
        this.$message.success('添加用户成功1')
        // 隐藏添加用户的对话框
        this.addDialogVisible =false
        // 重新获取用户列表数据
        await this.getUserList()
      })
    },
    // 显示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id)
      const {data: res} = await this.$http.get('users/' + id)
      if(res.meta.status !== 200){
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid =>{
        // console.log(valid)
        if(!valid) return
        // 发起修改用户信息的数据请求
         const{data: res} = await this.$http.put('users/' + this.editForm.id,{
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if(res.meta.status !== 200 ){
          return this.$message.error('更新用户数据失败')
        }
      //  关闭对话框
        this.editDialogVisible = false
      //  刷新数据列表
        await this.getUserList()
      //  提示修改成功
        this.$message.success('更新用户数据成功')
      })
    },
    // 根据ID删除对应的用户信息
    async removeUserById(id) {
      // console.log(id)
      // 弹框询问用户是否删除数据
      const confirmResult  = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
    //  如果用户确认删除，则返回值为字符串 confirm
    //  如果用户取消了删除，则返回值为字符串 cancel
    // console.log(confirmResult)
      if(confirmResult !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      // console.log('确认了删除')
      const {data: res} = await this.$http.delete('users/' + id)
      if(res.meta.status !== 200 ){
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      await this.getUserList()
    }
  }
}
</script>

<style scoped>

</style>