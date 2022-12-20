<template>
  <el-form-item :label="i18nt('designer.setting.accordion')">
    <el-switch v-model="optionModel.accordion" @change="accordionChange"></el-switch>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n";

  export default {
    name: "tree-accordion-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
		methods:{
			accordionChange(){
				this.$set(optionModel, "accordion", optionModel.accordion)
			}
		}
  }
</script>

<style scoped>

</style>
