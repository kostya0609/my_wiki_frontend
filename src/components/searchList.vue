<template>
  <div v-loading="loading">
    <br/>
    <el-card>
      <div slot="header">
        <label class="add-form-label">Результаты поиска: {{searchLabel}}</label>
        <el-button
         class="close_search_button"
         type="text"
         @click="$emit('closeSearch', null)">
        Закрыть
        </el-button>
      </div>

      <p v-if="sectionData.length===0 && postData.length===0" >Поиск не дал результатов, попробуйте изменить запрос</p>
      <div v-else>
        <div v-for="(item, index) in sectionData" :key="'s'+index" >
    <!-- ниже клик всегда по разделу и запрос данных этого раздела         -->
          <div class="custom-tree-node">
            <span
                @click="getData(item.value)"
                class="mySpan"
            >
              {{index+1}}. <i class="el-icon-folder"/>  {{item.label}}
            </span>

  <!--      ниже иконка контекстного меню для админа и действий с разделом          -->
            <i
                v-if="isAdmin"
                @click="action({index : null, array : 'sectionData', sectionButton : true, id : item.value, label : item.label, section : null, published : null})"
                class="el-icon-s-unfold myI"
            />
          </div>

      <!--  ниже отрисовывается (только статьи этого раздела) кликнутый раздел,  а прошлый открытый закроется        -->
            <div v-if="openKey===item.value">
              <div v-for="(el, idx) in posts" :key="'sp'+idx" class="custom-tree-node">
      <!--     ниже клик всегда по статье раскрытого раздела           -->
                <span
                    @click="action({index : idx, array : 'posts', listPost : true, id : el.id, label : el.label, section : el.section, published : el.published})"
                    class="mySpan two_level-span"
                >
                  {{index+1}}-{{idx+1}}. <i :class="el.published ? 'el-icon-document' : 'el-icon-edit-outline'"/> {{el.label}}
                </span>
      <!--      ниже иконка контекстного меню для админа и действий со статьй          -->
                <i
                    v-if="isAdmin"
                    @click="action({index : idx, array : 'posts', postButton : true, id : el.id, label : el.label, section : el.section, published : el.published})"
                    class="el-icon-s-unfold myI"
                />
              </div>
      <!--    ниже если кликнутый раздел оказался пустым без статей          -->

              <span
                  v-if="posts.length===0"
                  :disabled="true"
                  class="mySpan two_level-span"
              >
                - раздел пуст
              </span>

            </div>
        </div>

    <!-- HR разделяет сверху разделы и снизу статьи-->
        <hr v-if="sectionData.length>0 && postData.length>0"/>

        <div v-for="(item, index) in postData" :key="'p'+index" class="custom-tree-node">
      <!--ниже клик всегда по статье-->
          <span
              @click="action({index : index, array : 'postData', listPost : true,  id : item.value, label : item.label, section : item.section === null ? 'корневой каталог' : item.section,  published : item.published})"
              class="mySpan"
          >
            {{index+1}}. <i :class="item.published ? 'el-icon-document' : 'el-icon-edit-outline'"/> {{item.label}}
          </span>
   <!--   ниже иконка контекстного меню для админа и действий со статьй          -->
          <i
              v-if="isAdmin"
              @click="action({index : index, array : 'postData', postButton : true, id : item.value, label : item.label, section : item.section === null ? 'корневой каталог' : item.section, published : item.published})"
              class="el-icon-s-unfold  myI"
          />
        </div>
      </div>

      <el-dialog :title="'Действие для статьи ' + openModal.label + ' в разделе ' + openModal.section" :visible.sync="openModal.postButton" width="40%">
        <el-button class="dialog-button-list" @click="$emit('closeSearch','post', openModal.id, openModal.label, openModal.published); openModal.postButton=false">Перейти в каталог</el-button>
        <el-button class="dialog-button-list" @click="setPublish">{{openModal.published ? 'Отменить публикацию' : 'Опубликовать'}}</el-button>
        <el-button class="dialog-button-list" @click="action ({postButton : false, editPost : true})">Редактировать</el-button>
      </el-dialog>

      <el-dialog :title="'Просмотр статьи в разделе ' + openModal.section" :visible.sync="openModal.listPost" width="80%" :close-on-click-modal="false">
        <list-post  @customModal="showModal" :id="openModal.id"  v-if="openModal.listPost"/>
      </el-dialog>

      <el-dialog :title="'Редактирование статьи в разделе ' + openModal.section" :visible.sync="openModal.editPost" width="80%" :close-on-click-modal="false">
        <edit-post  @customModal="showModal" :id="openModal.id" v-if="openModal.editPost"/>
      </el-dialog>

      <el-dialog :title="'Действие для раздела ' + openModal.label" :visible.sync="openModal.sectionButton" width="40%">
        <el-button class="dialog-button-list" @click="$emit('closeSearch', 'section', openModal.id); openModal.sectionButton=false">Перейти в каталог</el-button>
      </el-dialog>

    </el-card>
  </div>
</template>
<script>
import listPost from '@/components/list/post'
import editPost from '@/components/edit/post'
export default {
  name : "searchList",
  components : {listPost,editPost},
  props : ['postData', 'sectionData', 'searchLabel'],
  data (){
    return {
     posts     : [],
     postId    : '',
     openKey   : 'null',
     openModal : {
       sectionButton : false,
       postButton    : false,
       listPost      : false,
       editPost      : false,

       id            : null,
       label         : null,
       section       : null,
       published     : null,

       index         : null,
       array         : '',
     },
    }
  },
  computed : {
    loading (){
      return this.$store.getters.loading;
    },
    isAdmin(){
      return this.$store.getters.charters('admin')
    },
  },
  methods : {

    async getData(id){
       this.$store.commit('setLoading',true);
       let result = await this.$store.dispatch('getData', {id : id, onlyPosts : true}) //true значит запросить только статьи
       this.$store.commit('setLoading',false);

       this.openKey = id;

       this.posts = result.data;

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

    action(data){
      this.openModal = {
        ...this.openModal,
        ... data
      };
    },

    async setPublish(){
      let published = this.openModal.published;

      this.$confirm(`Вы уверены, что хотите ${published ? 'отменить публикацию статьи' : 'опубликовать статью'}  - ${this.openModal.label} ?`, 'Предупреждение', {
        confirmButtonText : 'OK',
        cancelButtonText  : 'Cancel',
        type              : 'warning',
      } ).then(async() => {
        this.$store.commit('setLoading',true);
        let result = await this.$store.dispatch('query',{
          url  : '/post/edit',
          data : {
            edit      : 'set',
            id        : this.openModal.id,
            published : published ? '0' : '1',
          }
        });

        if(result.status == 'success') {
          this.openModal.published = !published;

          if(this.openModal.array === 'posts'){
             this.posts[this.openModal.index].published = this.openModal.published;
          } else {
             this.postData[this.openModal.index].published = this.openModal.published;
          }

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

    showModal(e){
      this.openModal[e.key] = e.value;

      if (e.update === 'needEdit') {
        this.postId = e.id;
        this.openModal.editPost = true;
      }

      if (e.update === 'editPost') {
        if(this.openModal.array === 'posts'){
          this.posts[this.openModal.index].label = e.newTitle;
          this.posts[this.openModal.index].published = e.published;
          //два массива статей если одна и таже статья в итге поиска есть внизу в  списке статей и эта же статья была раскрыта открыта сверху в какой-то папке
          // то не важно где ее меняли - данные поиска обновяться и сверху и снизу
          this.postData.forEach(el => {
            if (el.value === this.openModal.id) {
              el.label = e.newTitle;
              el.published = e.published;
            }
          })
          //
         } else {
          this.postData[this.openModal.index].label = e.newTitle;
          this.postData[this.openModal.index].published = e.published;
          //два массива статей если одна и таже статья в итге поиска есть внизу в  списке статей и эта же статья была раскрыта открыта сверху в какой-то папке
          // то не важно где ее меняли - данные поиска обновяться и сверху и снизу
          this.posts.forEach(el => {
            if (el.id === this.openModal.id) {
               el.label = e.newTitle;
               el.published = e.published;
            }
          })
          //
        }
      }
    },
  },

  watch : {
    searchLabel(){
      this.openKey = null;
    },
  },
}
</script>

<style scoped>

</style>