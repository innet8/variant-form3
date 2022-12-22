<template>
	<container-item-wrapper :widget="widget">
		<el-container>
			<el-main style="align-items: baseline;">
				<el-input v-if="widget.options.filter" :placeholder="i18nt('designer.setting.enterForQuery')" v-model="filterText"></el-input>
				<el-button-group>
						<el-button type="primary" round plain v-if="widget.options.expandRetractAllNode" @click="expandAllNode()">
							{{i18nt('designer.setting.expandRetractAllNode')}}
						</el-button>
						<el-button type="primary" round plain v-if="widget.options.selectClearAllNode && widget.options.showCheckBox" @click="selectAllNode()">
							{{i18nt('designer.setting.selectClearAllNode')}}
						</el-button>
				</el-button-group>
				<el-tree :data="widget.options.treeData" :props="defaultProps" ref="tree" border
					:lazy="widget.options.lazy"
					node-key="id"
					highlight-current
					:current-node-key="currentKey"
					:show-checkbox="widget.options.showCheckBox"
					:default-expanded-keys="widget.options.defaultEK"
					:default-checked-keys="widget.options.defaultCK"
					:expand-on-click-node="widget.options.expandOnClickNode"
					:default-expand-all="widget.options.defaultExpandAllNode"
					:draggable="widget.options.draggable"
					@node-click="handleTreeNodeClick"
					@node-contextmenu="handleTreeNodeContextmenu"
					@check="handleTreeNodeCheck"
					:filter-node-method="filterNode">
					<template #default="{ node, data }">
						<span class="custom-tree-node">
							<span>{{ node.label }}</span>
						</span>
					</template>
				</el-tree>
			</el-main>
		</el-container>
	</container-item-wrapper>
</template>
<script>
	import ContainerItemWrapper from '@/components/form-render/container-item/container-item-wrapper'
  import emitter from '@/utils/emitter'
  import i18n from "@/utils/i18n"
	import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
	import refMixin from "@/components/form-render/refMixin"
	import containerItemMixin from "@/components/form-render/container-item/containerItemMixin"

	let id = 1000;
  export default {
    name: "TreeItem",
		componentName: 'ContainerItem',  //必须固定为ContainerItem，用于接收父级组件的broadcast事件
		mixins: [emitter, i18n, refMixin, containerItemMixin],
		components: {
			ContainerItemWrapper,
			...FieldComponents,
		},
		inject: ['refList', 'sfRefList', 'globalModel', 'getFormConfig', 'getGlobalDsv'],
		data() {
			return {
				isExpand:true,
				isSelected:false,
				currentKey:'',
				filterText: '',
				data: [{
					label: '一级 1',
					children: [{
						label: '二级 1-1',
						children: [{
							label: '三级 1-1-1'
						}]
					}]
				}, {
					label: '一级 2',
					children: [{
						label: '二级 2-1',
						children: [{
							label: '三级 2-1-1'
						}]
					}, {
						label: '二级 2-2',
						children: [{
							label: '三级 2-2-1'
						}]
					}]
				}, {
					label: '一级 3',
					children: [{
						label: '二级 3-1',
						children: [{
							label: '三级 3-1-1'
						}]
					}, {
						label: '二级 3-2',
						children: [{
							label: '三级 3-2-1'
						}]
					}]
				}],
				defaultProps: {
					children: 'children',
					label: 'label'
				}
			};
		},
		watch:{
      filterText(val) {
        this.$refs.tree.filter(val);
      }
    },
    props: {
			widget: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,
      subFormRowIndex: { /* 子表单组件行索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormColIndex: { /* 子表单组件列索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormRowId: { /* 子表单组件行Id，唯一id且不可变 */
        type: String,
        default: ''
      },
    },
    created() {
			this.initRefList()
    },
		mounted() {

		},
    beforeDestroy() {
      this.unregisterFromRefList()
    },
    methods: {
			setDataSource(data){
				this.widget.options.treeData=data;
				this.currentKey=data[0].id;
			},
			// 给当前节点添加下级节点
			append(data) {
				this.$prompt(this.i18nt('designer.setting.inputNodeName'),
					this.i18nt('designer.setting.tips'), {
						confirmButtonText: this.i18nt('designer.hint.confirm'),
						cancelButtonText: this.i18nt('designer.hint.cancel'),
					}).then(({ value }) => {
						const newChild = { id: id++, label: value, children: [] };
						if (!data.children) {
							this.$set(data, 'children', []);
						}
						data.children.push(newChild);
					}).catch(() => {
						return;
					});
			},
			// 删除节点
			remove(node, data) {
				this.$confirm(this.i18nt('designer.setting.deleteNode'),
					this.i18nt('designer.setting.tips'), {
					confirmButtonText: this.i18nt('designer.hint.confirm'),
					cancelButtonText: this.i18nt('designer.hint.cancel'),
					type: 'warning'
				}).then(() => {
					const parent = node.parent;
					const children = parent.data.children || parent.data;
					const index = children.findIndex(d => d.id === data.id);
					children.splice(index, 1);
					this.$message({
						type: 'success',
						message: '删除成功!'
					});
				}).catch(() => {
				});
			},
			expandAllNode(){
				this.isExpand = !this.isExpand;
				this.changeTreeNodeExpaned(this.$refs.tree.store.root);
			},
			//改变节点的展开/收缩状态
			changeTreeNodeExpaned(node) {
				node.expanded = this.isExpand;
				for(let i = 0; i < node.childNodes.length; i++ ) {
				 //改变节点的自身expanded状态
					node.childNodes[i].expanded = this.isExpand;
				 //看看他孩子的长度，有的话就调用自己往下找
					if(node.childNodes[i].childNodes.length > 0) {
						this.changeTreeNodeExpaned(node.childNodes[i]);
					}
				}
			},
			selectAllNode(){ //debugger
				this.isSelected = !this.isSelected;
				this.changeTreeNodeSelected(this.$refs.tree.store.root);
			},
			//改变节点的勾选状态
			changeTreeNodeSelected(node) {
				node.checked = this.isSelected;
				for(let i = 0; i < node.childNodes.length; i++ ) {
				 //改变节点的自身checked状态
					node.childNodes[i].checked = this.isSelected;
				 //看看他孩子的长度，有的话就调用自己往下找
					if(node.childNodes[i].childNodes.length > 0) {
						this.changeTreeNodeSelected(node.childNodes[i]);
					}
				}
			},
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},

			/** 树节点点击事件
			 * @param {Object} data 传递给 data 属性的数组中该节点所对应的对象
			 * @param {Object} node 节点对应的 Node
			 * @param {Object} el 节点组件本身
			 */
			handleTreeNodeClick(data,node,el) {
				if (!!this.designState) { //设计状态不触发点击事件
					return
				}
				if (!!this.widget.options.onNodeClick) {
					let changeFn = new Function('data','node','el',this.widget.options.onNodeClick)
					changeFn.call(this,data,Node,el)
				} else {
					this.dispatch('VFormRender', 'node-click', [this]);
				}
			},

			/** 树节点右键事件
			 * @param {Object} event 事件句柄
			 * @param {Object} data 传递给 data 属性的数组中该节点所对应的对象
			 * @param {Object} node 节点对应的 Node
			 * @param {Object} el 节点组件本身
			 */
			handleTreeNodeContextmenu(event,data,node,el) {
				if (!!this.designState) { //设计状态不触发点击事件
					return
				}
				if (!!this.widget.options.onNodeContextmenu) {
					let changeFn = new Function('event','data','node','el',this.widget.options.onNodeContextmenu)
					changeFn.call(this,event,data,Node,el)
				} else {
					this.dispatch('VFormRender', 'node-contextmenu', [this]);
				}
			},
			/** 树组件当复选框被点击的时候触发
			 * @param {Object} checkNode
			 * @param {Object} checkNodePlus
			 */
			handleTreeNodeCheck(checkNode,checkNodePlus) {
				if (!!this.designState) { //设计状态不触发点击事件
					return
				}
				if (!!this.widget.options.onNodeCheck) {
					let changeFn = new Function('checkNode','checkNodePlus',this.widget.options.onNodeCheck)
					changeFn.call(this,checkNode,checkNodePlus)
				} else {
					this.dispatch('VFormRender', 'node-check', [this]);
				}
			},
    }
  }
</script>
<style lang="scss" scoped>
  .readonly-mode-field {
    display: inline-block;
    white-space: pre-wrap;
    line-height: 1.5;
  }
	.custom-tree-node {
	  flex: 1;
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  font-size: 14px;
	  padding-right: 8px;
	}
</style>
