<template>
  <node-view-wrapper>

    <vue-draggable-resizable :w="width" :h="height" :draggable="false" :handles="['mr', 'br', 'bm']">
      <span class="default-image" :style="'background-image: url('+node.attrs.src+');'"></span>
      <img ref="devImg" v-if="mounted" :src="node.attrs.src" @load="onImgLoad">
    </vue-draggable-resizable>

    <node-view-content class="content" />
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-2'

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent
  },
  props: nodeViewProps,

  data: function () {
    return {
      mounted : true,
      width: 100,
      height: 100,
    }
  },
  // mounted() {
  //   this.width = this.$refs.devImg.width;
  //   this.height = this.$refs.devImg.height;
  //   this.$nextTick(() => {
  //     this.mounted = false
  //   });
  // },
  methods:{
    onImgLoad(){
      this.width =  this.$refs.devImg.width;
      this.height = this.$refs.devImg.height;
      this.mounted = false
    }
  }
}
</script>

<style>
.default-image{
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  width: 100%;
  height: 100%;
  display: block;
}
.resizable.vdr{
  border : 0 !important;
}
.active.resizable.vdr{
  border: 1px dashed #000 !important;
}
.vdr {
  position: relative !important;
}
</style>