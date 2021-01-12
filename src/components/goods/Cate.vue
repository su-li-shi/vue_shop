<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片试图区域 -->
    <el-card>
      <el-row>
        <el-button
            type="primary"
            @click="showAddCateDialog"
        >添加分类</el-button>
      </el-row>
      <!--  表格 -->
      <tree-table
          class="treeTable"
          :data="catelist"
          :columns="columns"
          :selection-type="false"
          :expand-type="false"
          show-index index-text="#"
          border
          :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success"
             v-if="scope.row.cat_deleted === false"
             style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <!-- 修改按钮-->
        <template slot="opt" slot-scope="scope">
          <!--<pre>-->
          <!--  {{ scope.row }}-->
          <!--</pre>-->
          <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.cat_id)"
          >编辑</el-button>
          <!-- 删除按钮 -->
          <el-button
              type="danger"
              icon="el-icon-search"
              size="mini"
              @click="removeCateById(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!--  分页区域 -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
          ref="addCateFormRef"
          :model="addCateForm"
          label-width="100px"
          :rules="addCateFormRules"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:" >
          <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
    <!-- 修改分类的对话框 -->
    <el-dialog
        title="修改分类"
        :visible.sync="editCatesDialogVisible"
        width="50%"
        @close="editDialogClosed"
        >
      <el-form
          ref="editCateRef"
          :model="editCate"
          :rules="editCateRules"
          label-width="70px">
        <el-form-item label="分类名" prop="cat_name">
          <el-input v-model="editCate.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editCatesDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCateInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      // 查询条件
      queryInfo:{
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类  名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 控制修改分类对话框的显示与隐藏
      editCatesDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加的是一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: ['blur','change']
          }
        ]
      },
      // 查询到的分类信息对象
      editCate: {},
      // 修改表单的验证规则对象
      editCateRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            triangle: ['blur', 'change']
          }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const {data: res} = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      console.log(res.data)
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听 pagesize 的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 点击按钮，展示修改分类的对话框
    async showEditDialog(id) {
      // console.log(id)
      const { data : res } = await this.$http.get('categories/' + id)
      if(res.meta.status !== 200){
        return this.$message.error('查询分类信息失败！')
      }
      this.editCate = res.data
      console.log(res)
      this.editCatesDialogVisible = true
    },
    // 修改分类名称并提交
    editCateInfo() {
      this.$refs.editCateRef.validate(async valid =>{
        console.log(valid)
        if(!valid) return
        //  发起修改分类信息的数据请求
        const { data : res } = await this.$http.put('categories/' + this.editCate.cat_id,{
          cat_name: this.editCate.cat_name
        })
        if(res.meta.status !== 200) {
          return this.$message.error('更新分类数据失败')
        }
        //  关闭对话框
        this.editCatesDialogVisible = false
        //  刷新数据列表
        await this.getCateList()
        //  提示修改成功
        this.$message.success('更新分类数据成功！')
      })
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {params: {type: 2}})
  
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      console.log(res)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      //  如果 selectedKeys 数组中的 length 大于0，证明选中的是父级分类
      //  反之，就说明没有选中任何的父级分类
      //  父级分类的id
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        //  为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.selectedKeys.cat_pid = 0
        //  为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate(){
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data : res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status !== 201){
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        await this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 监听修改分类对话框的关闭事件，重置表单数据
    editDialogClosed() {
      this.$refs.editCateRef.resetFields()
    },
    // 根据ID删除对应的分类名称
    async removeCateById(id) {
      // console.log(id)
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该分类，是否继续？', '提示', {
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
      const { data : res } = await this.$http.delete('categories/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      await this.getCateList()
    }
  }
}

</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
</style>