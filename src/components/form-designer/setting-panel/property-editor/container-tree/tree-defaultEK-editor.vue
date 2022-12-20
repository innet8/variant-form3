<template>
  <el-form-item :label="i18nt('designer.setting.defaultEK')">
		<el-input v-model="optionModel.defaultEK" placeholder="[nodeId,……]"></el-input>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n";

  export default {
    name: "tree-defaultEK-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
  }
</script>

<style scoped>

</style>
