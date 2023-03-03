import {
  Edit, Minus, Plus, InfoFilled, Search, CirclePlus, Delete,
  ArrowDown, ArrowUp, Bottom, Top, Back, Right, BottomLeft, TopRight,
} from '@element-plus/icons-vue'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export const eleIcons = []

export function registerIcon(app) {
  app.component('el-icon-edit', Edit)
  app.component('el-icon-minus', Minus)
  app.component('el-icon-plus', Plus)
  app.component('el-icon-info', InfoFilled)
  app.component('el-icon-search', Search)
  app.component('el-icon-circle-plus-outline', CirclePlus)
  app.component('el-icon-delete', Delete)
  app.component('el-icon-arrow-down', ArrowDown)
  app.component('el-icon-arrow-up', ArrowUp)
  app.component('el-icon-bottom', Bottom)
  app.component('el-icon-top', Top)
  app.component('el-icon-back', Back)
  app.component('el-icon-right', Right)
  app.component('el-icon-bottom-left', BottomLeft)
  app.component('el-icon-top-right', TopRight)

  //全部注册，供图标选择器组件使用
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    eleIcons.push(key)
    app.component(key, component)
  }
}
