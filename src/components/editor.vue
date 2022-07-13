<template>
  <div class="editor_wrapper" v-if="editor">
    <div class="show_button_block" v-if="editable">
      <span class="button_element">
        Текущие параметры
      </span>
      <span class="button_element" @click="editor.chain().focus().toggleBold().run()" >
        {{showSize}}
      </span>
      <span class="button_element color" @click="editor.chain().focus().toggleBold().run()">
        <span class="show_color_element" :style="'background:' + showColor "></span>
      </span>
      <span class="button_element color" @click="editor.chain().focus().toggleBold().run()">
        <b>#{{showId}}</b>
      </span>
    </div>
    <div class="button_block" v-if="editable">
      <span class="button_element" @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        <i class="ri-bold"></i>
      </span>
      <span class="button_element" @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        <i class="ri-italic"></i>
      </span>
      <span class="button_element list">
        <el-select v-model="fontSize" placeholder="Select">
          <el-option
              v-for="i in 30"
              :key="i"
              :label=" i+10 + 'px'"
              :value="i+10">
          </el-option>
        </el-select>
      </span>
      <span class="button_element color">
        <el-color-picker v-model="fontColor"></el-color-picker>
      </span>
      <span class="button_element" @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }">
        <i class="ri-align-left"></i>
      </span>
      <span class="button_element" @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }">
        <i class="ri-align-center"></i>
      </span>
      <span class="button_element" @click="editor.chain().focus().setTextAlign('right').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }">
        <i class="ri-align-right"></i>
      </span>
      <span class="button_element" @click="toggleLink">
        <i class="ri-link"></i>
      </span>
      <span class="button_element" @click="toggleElementId" :class="{ 'is-active': showId }">
        <i class="ri-attachment-2"></i>
      </span>
      <el-dropdown class="button_element" @command="handleCommand" trigger="click">
        <span class="el-dropdown-link">
          <i class="ri-list-check"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="toggle">Создать/Удалить (точки)</el-dropdown-item>
          <el-dropdown-item command="number">Создать/Удалить (цифры)</el-dropdown-item>
          <el-dropdown-item command="add">Добавить строку</el-dropdown-item>
          <el-dropdown-item command="child">Вложеный</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <editor-content :editor="editor" />
<!--    <span @click="toggleEditable">Редактировать</span>-->
<!--    <span @click="getData">Получить</span>-->
  </div>
</template>

<script>
import { Editor, EditorContent, VueNodeViewRenderer  } from '@tiptap/vue-2'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import HardBreak from '@tiptap/extension-hard-break'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import FontSize from '@/extension/fontSize'
import idElement from '@/extension/idElement'
import 'remixicon/fonts/remixicon.css'
import ImageDraggable from '@/extension/imageDraggable'
import Component from '@/components/imageElement'
import {mergeAttributes} from "@tiptap/core";

const mainImage = Image.extend({

  renderHTML({ HTMLAttributes }) {
    return ['main-resize', mergeAttributes(HTMLAttributes), ['img', HTMLAttributes, 0]]
  },

  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})

export default {
  name: 'editor',
  components: { EditorContent },
  props: ['postContent', 'mayEdit'],
  data() {
    return {
      editor: null,
      editable : this.mayEdit,
      focus : true,
      fontSize : 16,
      fontColor : '#000000',
      showSize : '16px',
      showColor : '#000000',
      showId : null,
    }
  },
  mounted() {
    let self = this;
  console.log(this.postContent)
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        TextStyle,
        Color,
        FontSize,
        HardBreak,
        TextAlign.configure({
          types: ['paragraph'],
        }),
        Heading.configure({
          levels: [1, 2, 3, 4, 5, 6],
        }),
        Link.configure({
          openOnClick: false,
        }),
        idElement,
        ImageDraggable,
        mainImage,
        BulletList.configure({
          HTMLAttributes: {
            class: 'my-custom-class',
          },
        }),
        OrderedList,
        ListItem,
      ],
      editable : self.editable,
      content  : JSON.parse(this.postContent),

      onFocus({ editor, event }) {
        self.focus = true;
      },
      onBlur : function({editor, event }) {
        self.focus = false;
        this.$emit('endEdit', JSON.stringify(editor.getJSON()));
      }.bind(this),

      onSelectionUpdate({ editor }) {
        let selection = window.getSelection(),
            el = selection.focusNode.parentNode;
        self.showSize = window.getComputedStyle(el, null).getPropertyValue('font-size');
        self.showColor = rgb2hex(window.getComputedStyle(el, null).getPropertyValue('color'));
        self.showId = 'id' in el ? el.id : '';
      },
    })

  },
  methods : {

    // getData : function(){
    //   let json = this.editor.getJSON();
    //   let text = JSON.stringify(json);
    //   let text2 = JSON.parse(text)
    //   this.editor.commands.setContent('<p>Example Text</p>');
    //   setTimeout(() => {
    //     this.editor.commands.setContent(text2);
    //   },5000)
    // },

    toggleEditable : function(){
      this.editable = !this.editable;
      this.editor.setEditable(true);
    },
    handleCommand(command) {
      if(command == 'toggle'){
        this.editor.chain().focus().toggleBulletList().run()
      }else if(command == 'number'){
        this.editor.chain().focus().toggleOrderedList().run()
      }else if(command == 'add'){
        this.editor.chain().focus().splitListItem('listItem').run()
      }else if(command == 'child'){
        this.editor.chain().focus().sinkListItem('listItem').run()
      }
    },
    toggleElementId : function (){
      if(!this.showId)
        this.setElementId()
      else
        this.editor.chain().focus().unsetIdElement().run()
    },
    setElementId : function(){
      const previousId = this.editor.getAttributes('link').href
      const id = window.prompt('ID', previousId)
      if (id === null) {
        return
      }
      if (id === '') {
        this.editor.chain().focus().unsetIdElement().run()
        return
      }
      this.editor.chain().focus().setIdElement(id).run()
    },

    toggleLink : function(){
      if(!this.editor.isActive('link'))
        this.setLink();
      else
        this.editor.chain().focus().unsetLink().run()
    },
    setLink : function(){
      const previousUrl = this.editor.getAttributes('link').href
      const url = window.prompt('URL', previousUrl)
      if (url === null) {
        return
      }
      if (url === '') {
        this.editor.chain().focus().extendMarkRange('link').unsetLink().run()
        return
      }
      let target = url[0] !== '#' ? '_blank' : null;
      this.editor.chain().focus().extendMarkRange('link').setLink({ href: url, target : target }).run()
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
  watch : {
    fontColor : function(val){
       this.editor.chain().focus().setColor(val).run()
    },
    fontSize : function(val){
       this.editor.chain().focus().setFontSize(val+'px' ).run()
    }
  }
}

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

</script>
<style>
.is-active{
  background: #EEEEEE;
}
/*.editor_wrapper{*/
/*  position: relative;*/
/*}*/
.ProseMirror-focused,
.ProseMirror{
  padding: 10px;
  margin-top: 1px;
}
.button_block{
  top: 45px;
  padding-top: 0 !important;
}
.show_button_block{
  top : 0;
  padding-top: 0!important;
}
.show_button_block,
.button_block{
  position: sticky;
  padding: 10px;
  /*width: calc(100% - 2px);*/
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid #EEE;
  z-index: 10;
  background: #FFF;
  margin-left: 1px;
}
.button_element{
  display: inline-block;
  border-right: 1px solid #EEEEEE;
  padding: 5px;
  box-sizing: border-box;
  cursor: pointer;
}
.button_element.color,
.button_element.list{
  padding: 0 10px;
}
.button_element.color input{
  background-color : transparent !important;
  position: relative;
  top: 7px;
}
.button_element:last-child{
  border-right: 0;
}
.button_block i{
  font-size: 22px;
  line-height: 0;
  position: relative;
  top: 5px;
}
.el-input--suffix .el-input__inner{
  /*width: 80px;*/
  /*height: 30px;*/
}
.el-input__suffix{
  top: -5px !important;
}
.show_color_element{
  height: 25px;
  border-radius: 15px;
  width: 40px;
  border: none;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  display: inline-block;
  top: 7px;
}
.el-color-picker__trigger{
  border: 0!important;
  height: 25px!important;
  width: 30px!important;
  padding: 0!important;
}
.el-color-picker{
  height: 25px!important;
  top: 7px;
}
</style>
