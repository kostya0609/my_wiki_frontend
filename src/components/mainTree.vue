<template>
  <div v-loading="loading">
    <br/>
    <el-card>
      <div slot="header">
        <label class="add-form-label">Каталог статей</label>
      </div>


      <div class="custom-tree-container">
        <el-tree
            node-key="id"
            :data="treeData"
            @node-expand="expand"
            @node-collapse="collapse"
            @node-click="nodeClick"
            :default-expand-all="expandedAll"
            ref="tree"
        >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span v-if="node.data.is_post" class="mySpan">
            <i :class = "[ {'el-icon-document' : !node.data.is_cut&&node.data.published}, {'el-icon-edit-outline' : !node.data.is_cut&&!node.data.published}, {'el-icon-scissors' : node.data.is_cut}]" />
            {{node.label}}
          </span>
          <span v-else class="mySpan">
            <i :class = "[ {'el-icon-folder' : !node.data.is_cut&&!node.expanded}, {'el-icon-folder-opened' : !node.data.is_cut&&node.expanded}, {'el-icon-scissors' : node.data.is_cut}]"  />
            {{node.label}}
          </span>
          <i
              v-if="isAdmin"
              @click.stop="() => contextAction(node, data)"
              class="el-icon-s-unfold  myI"/>
        </span>
        </el-tree>
      </div>
    </el-card>
    <el-dialog :title="'Действие для раздела: ' + currentSectionName" :visible.sync="openModal.sectionButton" width="40%" @closed="openNextModal">
      <el-button v-if="!nodeData.is_cut" class="dialog-button-list" @click="setButtonList('addSection')">Добавить подраздел</el-button>
      <el-button v-if="!nodeData.is_cut && nodeData.id !== 0 "      @click="setButtonList('editSection')" class="dialog-button-list">Редактировать подраздел</el-button>
      <el-button v-if="!nodeData.is_cut && nodeData.id !== 0 "      @click="copySection(true)" class="dialog-button-list">Вырезать подраздел</el-button>
      <el-button v-if="!nodeData.is_cut" class="dialog-button-list" @click="copySection(false)" :disabled=!sectionCut>Вставить подраздел</el-button>
      <el-button v-if="!nodeData.is_cut" class="dialog-button-list" @click="deleteSection" :disabled="notDelete">Удалить подраздел</el-button>
      <el-button v-if="!nodeData.is_cut" class="dialog-button-list" @click="setButtonList('addPost')">Добавить статью</el-button>
      <el-button v-if="!nodeData.is_cut" class="dialog-button-list" @click="insertPost" :disabled="!postDataStatus">Вставить статью</el-button>
      <el-button v-if="nodeData.is_cut"   class="dialog-button-list" @click="cancelSectionCut">Отменить</el-button>
    </el-dialog>

    <el-dialog :title="'Добавление подраздела в раздел ' + currentSectionName" :visible.sync="openModal.addSection" width="30%" @closed="nextModal = null" :close-on-click-modal="false">
      <add-section @customModal="showModal" :nodeData=nodeData v-if="openModal.addSection"/>
    </el-dialog>

    <el-dialog :title="'Редактирование подраздела ' + currentSectionName" :visible.sync="openModal.editSection" width="30%" @closed="nextModal = null" :close-on-click-modal="false">
      <edit-section @customModal="showModal"  :nodeData=nodeData v-if="openModal.editSection"/>
    </el-dialog>

    <el-dialog :title="'Добавление статьи в раздел ' + currentSectionName" :visible.sync="openModal.addPost" width="90%" @closed="nextModal = null" :close-on-click-modal="false">
      <add-post @customModal="showModal" :nodeData=nodeData v-if="openModal.addPost"/>
    </el-dialog>

    <el-dialog :title="'Действие для статьи: ' + currentSectionName" :visible.sync="openModal.postButton" width="40%" @closed="openNextModal">
      <el-button v-if="!nodeData.is_cut"  class="dialog-button-list" @click="setPublish">{{nodeData.published ? 'Отменить публикацию' : 'Опубликовать'}}</el-button>
      <el-button v-if="!nodeData.is_cut"  class="dialog-button-list" @click="setButtonList('editPost')">Редактировать</el-button>
      <el-button v-if="!nodeData.is_cut"  class="dialog-button-list" @click="copyPost(true)">Вырезать</el-button>
      <el-button v-if="!nodeData.is_cut"  class="dialog-button-list" @click="copyPost(false)">Копировать</el-button>
      <el-button v-if="!nodeData.is_cut"  class="dialog-button-list" @click="deletePost">Удалить</el-button>
      <el-button v-if="nodeData.is_cut"   class="dialog-button-list" @click="cancelPostCut">Отменить</el-button>
    </el-dialog>

    <el-dialog :title="'Просмотр статьи в разделе ' + currentSectionName" :visible.sync="openModal.listPost" width="90%" @closed="nextModal = null" :close-on-click-modal="false">
      <list-post  @customModal="showModal" :id="postId"  v-if="openModal.listPost"/>
    </el-dialog>

    <el-dialog :title="'Редактирование статьи в разделе ' + currentSectionName" :visible.sync="openModal.editPost" width="90%" @closed="nextModal = null" :close-on-click-modal="false">
      <edit-post  @customModal="showModal" :id="postId"  v-if="openModal.editPost"/>
    </el-dialog>

  </div>
</template>

<script>

import addSection from "@/components/add/section";
import editSection from "@/components/edit/section";
import addPost from "@/components/add/post";
import listPost from "@/components/list/post";
import editPost from "@/components/edit/post";
export default {
  name : "mainTree",
  components : {addSection, editSection, addPost, listPost, editPost},
  props : ['treeData', 'expandedAll', 'needCollapse'],
  data(){
    return {
      node               : {},
      nodeData           : {},
      nextModal          : null,
      postId             : null,
      cutPostId          : null,
      currentSectionName : '',
      sectionId          : null,
      parentNodes        : [],
      openModal          : {
        sectionButton : false,
        postButton    : false,
        addSection    : false,
        editSection   : false,
        addPost       : false,
        listPost      : false,
        editPost      : false,
      },
    }
  },
  computed :{
    loading (){
      return this.$store.getters.loading;
    },
    postDataStatus (){
      return this.$store.getters.postData.status;
    },
    postCut (){
      return this.$store.getters.postCut;
    },
    sectionCut (){
      return this.$store.getters.sectionCut;
    },
    cutSectionId (){
      return this.$store.getters.cutSectionId;
    },
    notDelete (){
       if (this.nodeData.id === 0) return true // корневой каталог не удалить
       if (this.nodeData.children) {
         if (this.nodeData.children.length > 0) return true
       }
      return false;
    },
    isAdmin(){
      return this.$store.getters.charters('admin')
    },
  },
  methods : {

    setButtonList(key) {
      switch (key) {
        case 'addSection' :
          this.openModal.sectionButton = false;
          this.nextModal = 'addSection';
          break;
        case 'editSection' :
          this.openModal.sectionButton = false;
          this.nextModal = 'editSection';
          break;

        case 'addPost' :
          this.openModal.sectionButton = false;
          this.nextModal = 'addPost';
          break;
        case 'editPost' :
          this.openModal.postButton = false;
          this.node.parent.data.id === 0 ? this.sectionId = this.node.parent.data.id : this.sectionId = this.node.parent.data.id.slice(1);
          this.postId = this.nodeData.id;
          this.node.parent.data.label ? this.currentSectionName = this.node.parent.data.label : this.currentSectionName = '';
          this.nextModal = 'editPost';
          break;
      }
    },

    openNextModal(){
      if(this.nextModal)
        this.openModal[this.nextModal] = true;
    },

    showModal(e){
      this.openModal[e.key] = e.value;
      if (e.update === 'addSection') {
         this.appendSection(this.nodeData, e.newSection)
      }
      if (e.update === 'editSection') {
        this.nodeData.label = e.newName;
      }
      if (e.update === 'addPost') {
        this.appendPost(this.nodeData, e.newPost)
      }
      if (e.update === 'editPost') {
        this.nodeData.label = e.newTitle;
        this.nodeData.published = e.published;
      }
      if (e.update === 'needEdit') {
          this.postId = e.id;
          this.openModal.editPost = true;
      }
    },

    contextAction(node,data) {
      //всегда и только тут и еще при клике на узел  забираем текущие данные об узле дерева с которым работаем в данный момент! Эти данные нигде больше не должны переопределяться или заменяться
      this.node     = node;
      this.nodeData = data;
      this.$refs.tree.store.defaultExpandAll = false;

      // ниже чисто для визуала в титлах модальных окон и так потом нет проблем с рендингом если этих данных нет
      data.label ?  this.currentSectionName = data.label : this.currentSectionName = '';

      if (data.is_post)
        this.openModal.postButton = true;
      else
        this.openModal.sectionButton = true;
      console.log('нажали на контекст', this.nodeData)

    },

    appendSection(data, newSection) {
      if (!data.children) {
        this.$set(data, 'children', []);
     }

      data.children.push(newSection);
      this.$refs.tree.store.nodesMap[data.id].expanded = true;
    },

    appendPost(data, newPost) {
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newPost);
      this.$refs.tree.getNode(data).expanded = true;
    },

    nodeClick(data,node){
      //всегда и только тут и еще при клике на контекстное меню  забираем текущие данные об узле дерева с которым работаем в данный момент! Эти данные нигде больше не должны переопределяться или заменяться
      this.node     = node;
      this.nodeData = data;

      this.$refs.tree.store.defaultExpandAll = false;

      if (data.is_post && !data.is_cut)  {
        this.postId = data.id;
        node.parent.data.label ? this.currentSectionName = node.parent.data.label : this.currentSectionName = '';
        this.openModal.listPost = true;
      }
    },

    async expand(data) {
      this.$refs.tree.store.defaultExpandAll = false;
      //событие разворачивания списка
      //ниже все очистили ...чтоб данные были всегда актуальны и получены именно с бэка
       this.$set(data, 'children', []);

      // //ниже получаем массив детей
      this.$store.commit('setLoading',true);
      let result = await this.$store.dispatch('getData',  {id : data.id, onlyPosts : false})
      this.$store.commit('setLoading',false);

      // ниже загружаем туда полученных детей

      result.data.forEach(el => {
        data.children.push(el);
      })

      if (result.notification.type !== 'success'){
        this.$notify({
          title                     : result.notification.title,
          message                   : result.notification.message,
          type                      : result.notification.type,
          dangerouslyUseHTMLString  : true,
          duration                  : 10000,
          showClose                 : true
        });
      }
    },

    collapse(data, node){
      this.$refs.tree.store.defaultExpandAll = false;
      //при сворачивании данные удалить... иначе ругается vue что будет много watcher
      this.$set(data, 'children', [{}])

      //ниже если сворачивается папка в которой могла копироваться или вырезаться статья/подраздел или сворачивается ее родетельская папка, то копирование или вырезание не актуально
      // признак копирования is_cut скидывется, в том числе при повторном разворачивании папки и получении сервера данных о статье
      if (this.parentNodes.indexOf(node.id) >= 0) {
        this.$store.commit('setPostData', {postData : {}, status : false});
        this.$store.commit('setPostCut', false);

        this.$store.commit('setSectionCut', false);
        this.$store.commit('setCutSectionId', null);

        this.parentNodes = [];
        this.cutPostId = null;
        this.$message({
          message   : 'Данные о копировании или вырезании статьи / подраздела удалены, так как ее раздел или ее родительский раздел был свернут!',
          type      : 'warning',
          showClose : true,
          duration  : 10000,
        });
      }
    },

    async setPublish(){
      let published = this.nodeData.published;

      this.$confirm(`Вы уверены, что хотите ${published ? 'отменить публикацию статьи' : 'опубликовать статью'}  - ${this.nodeData.label} ?`, 'Предупреждение', {
        confirmButtonText : 'OK',
        cancelButtonText  : 'Cancel',
        type              : 'warning',
      } ).then(async() => {
        this.$store.commit('setLoading',true);
        let result = await this.$store.dispatch('query',{
          url  : '/post/edit',
          data : {
            edit      : 'set',
            id        : this.nodeData.id,
            published : published ? '0' : '1',
          }
        });

        if(result.status == 'success') {
          this.nodeData.published = !published;
          this.openModal.postButton = false;
        }
        this.$notify({
          title                     : result.title,
          message                   : result.message,
          type                      : result.status,
          dangerouslyUseHTMLString  : true,
          duration                  : 10000,
          showClose                 : true
        });
        this.$store.commit('setLoading',false);
      }).catch(() => {this.openModal.postButton = false;});
    },

    async getPostData(id){
      this.$store.commit('setLoading',true);
      let postData = {
        id        : '',
        title     : '',
        text      : '',
        hashTags  : [],
        published : '0',
      };
      let status = false; // признка что статья успешно получена

      let result = await this.$store.dispatch('query',{
        url  : '/post/edit',
        data : {
          edit : 'get',
          id   :  id
        }
      });

      if(result.status == 'success') {
        status = true;
        postData.id = result.data.id;
        postData.title = result.data.title;
        postData.text = result.data.text;
        postData.hashTags = result.data.tags;
        result.data.published === 1 ? postData.published = true : postData.published = false;
      } else
         this.$notify({
          title                     : result.title,
          message                   : result.message,
          type                      : result.status,
          dangerouslyUseHTMLString  : true,
          duration                  : 10000,
          showClose                 : true
        });

      this.$store.commit('setLoading',false);
      return {postData, status}
    },

    async copyPost(cut){
      let postData = {};
      postData = await  this.getPostData(this.nodeData.id)

      // ниже рекурсией получить ID все родителей чтоб потом отслеживать их сворачивание
      let parentId = [];
      let getParentId = async function(data){
        parentId.push(data.id)
          if (data.parent) {
             await getParentId(data.parent)
          }
      };
      await getParentId(this.node.parent)
      this.parentNodes = parentId;

      if (postData.status) {
        // сохранили статью в сторе
        this.$store.commit('setPostData', postData);

          if (cut){
              // если вырезание
              this.$store.commit('setPostCut', true);
              this.nodeData.is_cut = true;
              this.cutPostId = this.nodeData.id;
              console.log('нажали вырезать', this.nodeData.is_cut)
          } else {
              this.$store.commit('setPostCut', false); this.cutPostId = null
          } // если это копирование то на всякий случай убрать признаки вырезания

      } else {
         // с получением статьи были проблемы.... все почистить
          this.$store.commit('setPostData', {postData : {}, status : false});
          this.$store.commit('setPostCut', false)
          this.parentNodes = [];
          this.cutPostId = null;
      }
      this.openModal.postButton = false;
    },

    async copySection(сut){

      // ниже рекурсией получить ID все родителей чтоб потом отслеживать их сворачивание
      let parentId = [];
      let getParentId = async function(data){
        parentId.push(data.id)
        if (data.parent) {
          await getParentId(data.parent)
        }
      };
      await getParentId(this.node.parent)
      this.parentNodes = parentId;

      if (this.cutSectionId) {
        this.$refs.tree.getNode({id : 's' + this.cutSectionId}).data.is_cut = false;
        if (this.$refs.tree.getNode({id : 's' + this.cutSectionId, is_cut : true} ).data.children.length > 0)
            this.$refs.tree.getNode({id : 's' + this.cutSectionId, is_cut : true} ).isLeaf = false;//возможность раскрытия...треугольничек слева вернуть если есть children
      }

      if (сut) {
        // значит надо вырезать секцию
          this.$store.commit('setSectionCut', true);
          this.$store.commit('setCutSectionId', this.nodeData.id.slice(1));
          this.nodeData.is_cut = true;
          // ниже надо свернуть вырезаемую папку
          this.$refs.tree.getNode({id : 's' + this.cutSectionId, is_cut : true} ).expanded = false;
          this.$refs.tree.getNode({id : 's' + this.cutSectionId, is_cut : true} ).isLeaf = true; //возможность раскрытия...треугольничек слева убрать
        }
        else {
          this.$store.commit('setLoading',true);
          let result = await this.$store.dispatch('query',{
            url  : '/section/edit',
            data : {
              id             : this.cutSectionId,
              parent_section : this.nodeData.id === 0 ? 'root' : this.nodeData.id.slice(1),
              level          : this.nodeData.level,
              head_section   : this.nodeData.head_section,
              edit           : 'set',
            }
        });

         if(result.status == 'success') {
           // ниже чтоб потом свернуть папку где был вырезаен элемент и удалить из дерева этот элемент
           this.$refs.tree.getNode({id : 's' + this.cutSectionId, is_cut : true} ).parent.expanded = false;
           this.$refs.tree.remove( {id : 's' + this.cutSectionId, is_cut : true});

           // куда вставляем подраздел добавить в папку children пустой объект ... чтоб у него появился признак того, что его можно развернуть (если он уже имеет других детей то ничего делать с ним не надо)

           if (this.$refs.tree.getNode({id : this.nodeData.id} ).data.children.length === 0) this.$refs.tree.getNode({id : this.nodeData.id} ).data.children.push({});

           // ниже чтоб свернуть папку куда был вставлен элемент
           this.$refs.tree.getNode({id : this.nodeData.id} ).expanded = false;
         }

        this.$notify({
          title                     : result.title,
          message                   : result.message,
          type                      : result.status,
          dangerouslyUseHTMLString  : true,
          duration                  : 10000,
          showClose                 : true
        });

         // ниже обнулить id и признак вырезанности. Папка уже вырезана и вставлена.
         this.$store.commit('setSectionCut', false);
         this.$store.commit('setCutSectionId', null);

         this.$store.commit('setLoading',false);
        }

      this.openModal.sectionButton = false;
    },

    async insertPost(){
      this.$store.commit('setLoading',true);

      let postData = {};

      if (this.postDataStatus) {
        //если статья была успешно получена в store

        postData = this.$store.getters.postData.postData

        this.$set(postData, 'section_id', this.node.data.id === 0  ? this.node.data.id : this.node.data.id.slice(1)); //добавли в данные статьи ID ее секции убрав превую букву s

        if (this.postCut) {
            //если было вырезание статьи, а не копирование
            this.$set(postData, 'edit', 'set'); // добавили в статью признак того, что будет изменение данных, а не получение данных (по факту меняем ID раздела)
            let result = await this.$store.dispatch('query',{
              url  : '/post/edit',
              data : postData,
            });
            this.$set(result.post, 'is_cut', false); // добавить в статью признак вырезаемости (так как он не приходит с бэка)

            if(result.status == 'success') {
                // ниже добавили статью в нужное место каталога
                this.appendPost(this.nodeData, result.post)
                this.openModal.sectionButton = false;
                // ниже чтоб потом свернуть папку если вырезаемый элемент был последним
                let parent = this.$refs.tree.getNode({id : this.cutPostId, is_post : true, is_cut : true}).parent;
                if (parent.data.children.length === 1) parent.expanded = false;
                // ниже удалить статью из старого места в каталоге и очистить данные в store о том, что было вырезание статьи
                this.$refs.tree.remove({id : this.cutPostId, is_post : true, is_cut : true});
                this.$store.commit('setPostData', {postData : {}, status : false});
                this.$store.commit('setPostCut', false);
                this.parentNodes = []; // массив с ID всех родителей статьи
                this.cutPostId = null;
          } else
                this.$notify({
                  title                     : result.title,
                  message                   : result.message,
                  type                      : result.status,
                  dangerouslyUseHTMLString  : true,
                  duration                  : 10000,
                  showClose                 : true
                });

        } else {
            // если было копирование статьи
            let result = await this.$store.dispatch('query',{
              url  : '/post/add',
              data : postData,
            });
            if(result.status == 'success') {
                this.appendPost(this.nodeData, result.new_post)
                this.openModal.sectionButton = false;
            } else
                 this.$notify({
                    title                     : result.title,
                    message                   : result.message,
                    type                      : result.status,
                    dangerouslyUseHTMLString  : true,
                    duration                  : 10000,
                    showClose                 : true
                 });
        }
      };//если статья была успешно получена
      this.$store.commit('setLoading',false);
    },

    cancelPostCut(){
      this.nodeData.is_cut = false;
      this.$store.commit('setPostData', {postData : {}, status : false});
      this.$store.commit('setPostCut', false);
      this.parentNodes = [];
      this.openModal.postButton = false;
    },

    cancelSectionCut(){
      this.nodeData.is_cut = false;

      if (this.$refs.tree.getNode({id : 's' + this.cutSectionId, is_cut : true} ).data.children.length > 0)
        this.$refs.tree.getNode({id : 's' + this.cutSectionId, is_cut : true} ).isLeaf = false;//возможность раскрытия...треугольничек слева вернуть если есть children

      this.$store.commit('setSectionCut', false);
      this.$store.commit('setCutSectionId', null);
      this.openModal.sectionButton = false;
    },

    deletePost(){
      this.$confirm(`Вы уверены, что хотите удалить статью - ${this.nodeData.label} ?`, 'Предупреждение', {
        confirmButtonText : 'OK',
        cancelButtonText  : 'Cancel',
        type              : 'warning',
      } ).then(async() => {
        this.$store.commit('setLoading',true);
        let result = await this.$store.dispatch('query',{
          url  : '/post/delete',
          data : {id : this.nodeData.id}
        });

        if(result.status == 'success') {
           // ниже чтоб потом свернуть папку если удаляемый элемент был последним
            if (this.node.parent.data.children.length === 1) this.node.parent.expanded = false;

            this.$refs.tree.remove({id : this.nodeData.id, is_post : true});
            this.openModal.postButton = false;
        }
        this.$store.commit('setLoading',false);

      }).catch(() => {this.openModal.postButton = false;});
    },

    deleteSection(){
      this.$confirm(`Вы уверены, что хотите удалить раздел - ${this.currentSectionName} ?`, 'Предупреждение', {
        confirmButtonText : 'OK',
        cancelButtonText  : 'Cancel',
        type              : 'warning',
      } ).then(async() => {
        this.$store.commit('setLoading',true);
        let result = await this.$store.dispatch('query',{
          url  : '/section/delete',
          data : {id :this.nodeData.id.slice(1)},
        });
        if(result.status == 'success') {
           if (this.node.parent.data.children.length === 1) this.node.parent.expanded = false;
            this.$refs.tree.remove({id : this.nodeData.id, is_post : false});
            this.openModal.sectionButton = false;
        }
        this.$store.commit('setLoading',false);
      }).catch(() => {this.openModal.sectionButton = false;});
    },
  },

  mounted() {
    // надо сраскрыть домашний каталог в том случае если переход был не из поиска.
    // при переходе в каталог из поиска нужно свернуть запрошенный каталог чтоб потом пользователь в него кликнул и получил актуальные данные стандартным образом
    if (this.needCollapse) this.$refs.tree.getNode(this.needCollapse).expanded = false; else this.$refs.tree.getNode({id : 0}).expanded = true;
  }

}
</script>

<style scoped>

</style>
