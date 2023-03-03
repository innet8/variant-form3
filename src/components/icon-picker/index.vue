<template>
  <el-select :value="modelValue" clearable @clear="clearHandle">
    <template #prefix>
    <span class="icon-picker-selected" v-if="modelValue !== '' && modelValue != null">
      <el-icon :size="16"><component :is="modelValue" /></el-icon>
    </span>
    </template>

    <el-option class="icon-picker-option" :value="modelValue">
      <div>
        <ul>
          <li v-for="iconClass in icons" :key="iconClass" @click="iconClick(iconClass)">
            <span><el-icon :size="16"><component :is="iconClass" /></el-icon></span>
          </li>
          <div class="clearfix"></div>
        </ul>
      </div>
    </el-option>
  </el-select>
</template>

<script>
  import {eleIcons} from "@/utils/el-icons";
  import SvgIcon from '@/components/svg-icon'

  export default {
    name: "icon-picker",
    props: ['modelValue'],
    emits: ['update:modelValue'],
    components: {
      SvgIcon
    },
    data() {
      return {
        icons: eleIcons
      };
    },
    methods: {
      iconClick(className) {
        this.$emit('update:modelValue', className);
      },

      clearHandle() {
        this.$emit('update:modelValue', '');
      }
    }
  }
</script>

<style scoped>
  .clearfix {
    clear: both;
  }

  .icon-picker-option.el-select-dropdown__item {
    width: 307px;
    height: auto;
    max-height: 200px;
    overflow-y: auto;
    padding: 0;
  }

  .icon-picker-option.el-select-dropdown__item.hover, .icon-picker-option.el-select-dropdown__item:hover {
    background-color: #fff;
    cursor: default;
  }

  .icon-picker-option.el-select-dropdown__item.selected {
    color: #606266;
    font-weight: normal;
  }

  .icon-picker-option::-webkit-scrollbar {
    width: 7px;
    background-color: #eee;
  }

  .icon-picker-option::-webkit-scrollbar-track {
    background-color: #eee;
  }

  .icon-picker-option::-webkit-scrollbar-thumb {
    background: #d7d7d7;
    border-radius: 7px;
  }

  .icon-picker-option > div {
    cursor: default;
  }

  .icon-picker-option ul {
    display: block;
    margin: 0;
    padding: 0;
  }

  .icon-picker-option ul > li {
    display: block;
    margin: 0;
    padding: 0;
    float: left;
    text-align: center;
    cursor: pointer;
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }

  .icon-picker-option ul > li:hover {
    color: #327edb;
    font-size: 18px;
  }

  .icon-picker-selected {
    color: #555555;
    height: 20px;
    line-height: 20px;
  }

</style>
