<!--
/**
 * author: vformAdmin
 * email: vdpadmin@163.com
 * website: https://www.vform666.com
 * date: 2021.08.18
 * remark: 如果要分发VForm源码，需在本文件顶部保留此文件头信息！！
 */
-->

<template>
  <el-container class="main-container full-height">
    <el-header class="main-header">
      <div class="float-left main-title">
        <img src="../../assets/vform-logo.png" @click="openHome">
        <span class="bold">{{vfProductName}}</span> {{vfProductTitle}} <span class="version-span">Ver {{vFormVersion}}</span></div>
      <div class="float-right external-link">
        <el-dropdown v-if="showLink('languageMenu')" @command="handleLanguageChanged">
          <span class="el-dropdown-link">{{curLangName}}<svg-icon icon-class="el-arrow-down" /></span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh-CN">{{i18nt('application.zh-CN')}}</el-dropdown-item>
              <el-dropdown-item command="en-US">{{i18nt('application.en-US')}}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!--
        <a v-if="showLink('externalLink')" href="javascript:void(0)" @click="(ev) => openUrl(ev, gitUrl)" target="_blank"><svg-icon icon-class="github" />{{i18nt('application.github')}}</a>
        <a v-if="showLink('externalLink')" href="javascript:void(0)" @click="(ev) => openUrl(ev, docUrl)" target="_blank"><svg-icon icon-class="document" />{{i18nt('application.document')}}</a>
        <a v-if="showLink('externalLink')" href="javascript:void(0)" @click="(ev) => openUrl(ev, chatUrl)" target="_blank">{{i18nt('application.qqGroup')}}</a>
        <a v-if="showLink('externalLink')" href="javascript:void(0)" @click="(ev) => openUrl(ev, subScribeUrl)" target="_blank">
          {{i18nt('application.subscription')}}<i class="el-icon-top-right"></i></a>
        -->
        <a href="javascript:void(0)">&nbsp;</a>
      </div>
    </el-header>

    <el-container>
      <el-aside class="side-panel">
        <widget-panel :designer="designer" />
      </el-aside>

      <el-container class="center-layout-container">
        <el-header class="toolbar-header">
          <toolbar-panel :designer="designer" ref="toolbarRef">
            <template v-for="(idx, slotName) in $slots" #[slotName]>
              <slot :name="slotName"></slot>
            </template>
          </toolbar-panel>
        </el-header>
        <el-main class="form-widget-main">
          <el-scrollbar class="container-scroll-bar" :style="{height: scrollerHeight}">
            <v-form-widget :designer="designer" :form-config="designer.formConfig">
            </v-form-widget>
          </el-scrollbar>
        </el-main>
      </el-container>

      <el-aside>
        <setting-panel :designer="designer" :selected-widget="designer.selectedWidget"
                       :form-config="designer.formConfig" @edit-event-handler="testEEH" />
      </el-aside>
    </el-container>

  </el-container>
</template>

<script>
  import WidgetPanel from './widget-panel/index'
  import ToolbarPanel from './toolbar-panel/index'
  import SettingPanel from './setting-panel/index'
  import VFormWidget from './form-widget/index'
  import {createDesigner} from "@/components/form-designer/designer"
  import {addWindowResizeHandler, deepClone, getQueryParam, getAllContainerWidgets,
    getAllFieldWidgets} from "@/utils/util"
  import {MOCK_CASE_URL, VARIANT_FORM_VERSION} from "@/utils/config"
  import i18n, { changeLocale } from "@/utils/i18n"
  import axios from 'axios'
  import SvgIcon from "@/components/svg-icon/index"

  export default {
    name: "VFormDesigner",
    componentName: "VFormDesigner",
    mixins: [i18n],
    components: {
      SvgIcon,
      WidgetPanel,
      ToolbarPanel,
      SettingPanel,
      VFormWidget,
    },
    props: {
      /* 后端字段列表API */
      fieldListApi: {
        type: Object,
        default: null,
      },

      /* 禁止显示的组件名称数组 */
      bannedWidgets: {
        type: Array,
        default: () => []
      },

      designerConfig: {
        type: Object,
        default: () => {
          return {
            languageMenu: true,  //是否显示语言切换菜单
            externalLink: true,  //是否显示GitHub、文档等外部链接
            formTemplates: true,  //是否显示表单模板
            eventCollapse: true,  //是否显示组件事件属性折叠面板
            clearDesignerButton: true,  //是否显示清空设计器按钮
            previewFormButton: true,  //是否显示预览表单按钮
            importJsonButton: true,  //是否显示导入JSON按钮
            exportJsonButton: true,  //是否显示导出JSON器按钮
            exportCodeButton: true,  //是否显示导出代码按钮
            generateSFCButton: true,  //是否显示生成SFC按钮

            productName: '',  //自定义表单设计器名称，对应“VForm Pro”
            productTitle: '',  //自定义表单设计器标题，对应“表单设计器”

            presetCssCode: '',  //设计器预设CSS样式代码

            resetFormJson: false,  //是否在设计器初始化时将表单内容重置为空
          }
        }
      },

    },
    data() {
      return {
        vfProductName: '',
        vfProductTitle: '',
        vFormVersion: VARIANT_FORM_VERSION,
        curLangName: '',
        curLocale: '',

        vsCodeFlag: false,
        caseName: '',

        docUrl: 'https://www.vform666.com/document3.html',
        gitUrl: 'https://github.com/vform666/variant-form3-vite',
        chatUrl: 'https://www.vform666.com/chat-group.html',
        subScribeUrl: 'https://www.vform666.com/subscribe.html',

        scrollerHeight: 0,

        designer: createDesigner(this),

        fieldList: []
      }
    },
    provide() {
      return {
        serverFieldList: this.fieldList,
        getDesignerConfig: () => this.designerConfig,
        getBannedWidgets: () => this.bannedWidgets,
      }
    },
    created() {
      this.vfProductName = (this.designerConfig && this.designerConfig.productName) || 'VForm Pro'
      this.vfProductTitle = (this.designerConfig && this.designerConfig.productTitle) ||
          this.i18nt('application.productTitle')

      this.vsCodeFlag = getQueryParam('vscode') == 1
      this.caseName = getQueryParam('case')
    },
    mounted() {
      this.initLocale()

      this.scrollerHeight = window.innerHeight - 56 - 36 + 'px'
      addWindowResizeHandler(() => {
        this.$nextTick(() => {
          this.scrollerHeight = window.innerHeight - 56 - 36 + 'px'
        })
      })

      this.loadCase()

      this.loadFieldListFromServer()
    },
    methods: {
      testEEH(eventName, eventParams) {
        console.log('test', eventName)
        console.log('test222222', eventParams)
      },

      showLink(configName) {
        if (this.designerConfig[configName] === undefined) {
          return true
        }

        return !!this.designerConfig[configName]
      },

      openHome() {
        if (!!this.vsCodeFlag) {
          const msgObj = {
            cmd: 'openUrl',
            data: {
              url: 'https://www.vform666.com/'
            }
          }
          window.parent.postMessage(msgObj, '*')
        }
      },

      openUrl(event, url) {
        if (!!this.vsCodeFlag) {
          const msgObj = {
            cmd: 'openUrl',
            data: {
              url
            }
          }
          window.parent.postMessage(msgObj, '*')
        } else {
          let aDom = event.currentTarget
          aDom.href = url
          //window.open(url, '_blank') //直接打开新窗口，会被浏览器拦截
        }
      },

      loadCase() {
        if (!this.caseName) {
          return
        }

        axios.get(MOCK_CASE_URL + this.caseName + '.txt').then(res => {
          if (!!res.data.code) {
            this.$message.error(this.i18nt('designer.hint.sampleLoadedFail'))
            return
          }

          this.setFormJson(res.data)
          this.$message.success(this.i18nt('designer.hint.sampleLoadedSuccess'))
        }).catch(error => {
          this.$message.error(this.i18nt('designer.hint.sampleLoadedFail') + ':' + error)
        })
      },

      initLocale() {
        this.curLocale = localStorage.getItem('v_form_locale')
        if (!!this.vsCodeFlag) {
          this.curLocale = this.curLocale || 'en-US'
        } else {
          this.curLocale = this.curLocale || 'zh-CN'
        }
        this.curLangName = this.i18nt('application.' + this.curLocale)
        this.changeLanguage(this.curLocale)
      },

      loadFieldListFromServer() {
        if (!this.fieldListApi) {
          return
        }

        let headers = this.fieldListApi.headers || {}
        axios.get(this.fieldListApi.URL, {'headers': headers}).then(res => {
          let labelKey = this.fieldListApi.labelKey || 'label'
          let nameKey = this.fieldListApi.nameKey || 'name'

          res.data.forEach(fieldItem => {
            this.fieldList.push({
              label: fieldItem[labelKey],
              name: fieldItem[nameKey]
            })
          })
        }).catch(error => {
          this.$message.error(error)
        })
      },

      handleLanguageChanged(command) {
        this.changeLanguage(command)
        this.curLangName = this.i18nt('application.' + command)
      },

      changeLanguage(langName) {
        changeLocale(langName)
      },

      setFormJson(formJson) {
        let modifiedFlag = false
        if (!!formJson) {
          if (typeof formJson === 'string') {
            modifiedFlag = this.designer.loadFormJson( JSON.parse(formJson) )
          } else if (formJson.constructor === Object) {
            modifiedFlag = this.designer.loadFormJson(formJson)
          }

          if (modifiedFlag) {
            this.designer.emitHistoryChange()
          }
        }
      },

      getFormJson() {
        return {
          widgetList: deepClone(this.designer.widgetList),
          formConfig: deepClone(this.designer.formConfig)
        }
      },

      clearDesigner() {
        this.$refs.toolbarRef.clearFormWidget()
      },


      /**
       * 刷新表单设计器
       */
      refreshDesigner() {
        //this.designer.loadFormJson( this.getFormJson() )  //只有第一次调用生效？？

        let fJson = this.getFormJson()
        this.designer.clearDesigner(true)  //不触发历史记录变更
        this.designer.loadFormJson(fJson)
      },

      /**
       * 预览表单
       */
      previewForm() {
        this.$refs.toolbarRef.previewForm()
      },

      /**
       * 导入表单JSON
       */
      importJson() {
        this.$refs.toolbarRef.importJson()
      },

      /**
       * 导出表单JSON
       */
      exportJson() {
        this.$refs.toolbarRef.exportJson()
      },

      /**
       * 导出Vue/HTML代码
       */
      exportCode() {
        this.$refs.toolbarRef.exportCode()
      },

      /**
       * 生成SFC代码
       */
      generateSFC() {
        this.$refs.toolbarRef.generateSFC()
      },

      /**
       * 获取所有字段组件
       * @returns {*[]}
       */
      getFieldWidgets() {
        return getAllFieldWidgets(this.designer.widgetList)
      },

      /**
       * 获取所有容器组件
       * @returns {*[]}
       */
      getContainerWidgets() {
        return getAllContainerWidgets(this.designer.widgetList)
      },

      //TODO: 增加更多方法！！

    }
  }
</script>

<style lang="scss" scoped>
  .el-container.full-height {
    height: 100%;
    overflow-y: hidden;
  }

  .el-container.center-layout-container {
    min-width: 680px;
    border-left: 2px dotted #EBEEF5;
    border-right: 2px dotted #EBEEF5;
  }

  .el-header.main-header {
    border-bottom: 2px dotted #EBEEF5;
    height: 48px !important;
    line-height: 48px !important;
    min-width: 800px;
  }

  div.main-title {
    font-size: 18px;
    color: #242424;
    display: flex;
    align-items: center;
    justify-items: center;

    img {
      cursor: pointer;
      width: 36px;
      height: 36px;
    }

    span.bold {
      font-size: 20px;
      font-weight: bold;
      margin: 0 6px 0 6px;
    }

    span.version-span {
      font-size: 14px;
      color: #101F1C;
      margin-left: 6px;
    }
  }

  .float-left {
    float: left;
  }

  .float-right {
    float: right;
  }

  .el-dropdown-link {
    margin-right: 12px;
    cursor: pointer;
  }

  div.external-link {
    display: flex;
    align-items: center;
    justify-content: center;

    a {
      font-size: 13px;
      text-decoration: none;
      margin-right: 10px;
      color: #606266;
    }
  }

  .el-header.toolbar-header {
    font-size: 14px;
    border-bottom: 1px dotted #CCCCCC;
    height: 42px !important;
    //line-height: 42px !important;
  }

  .el-aside.side-panel {
    width: 260px !important;
    overflow-y: hidden;
  }

  .el-main.form-widget-main {
    padding: 0;

    position: relative;
    overflow-x: hidden;
  }

  .container-scroll-bar {
    :deep(.el-scrollbar__wrap), :deep(.el-scrollbar__view) {
      overflow-x: hidden;
    }
  }
</style>