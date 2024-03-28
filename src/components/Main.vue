<template>
  <el-main style="padding: 0;">
    <el-scrollbar>
      <el-table :data="tableData">
        <el-table-column prop="date" label="Date" width="140">
        </el-table-column>
        <el-table-column prop="name" label="Name" width="120">
        </el-table-column>
        <el-table-column prop="address" label="Address"> </el-table-column>
      </el-table>
    </el-scrollbar>
  </el-main>
</template>

<script>
export default {
  name: "Main"
}
</script>

<style scoped>

</style>
