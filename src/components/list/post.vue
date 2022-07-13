<template>
  <div v-loading="loading">
    <div v-if="isAdmin" class="add-form-row align_right">
      <el-button @click="toEdit">Редактировать</el-button>
    </div>

    <div class="add-form-row">
      <label class="add-form-label ">Заголовок статьи</label>
      <div class="add-form-fields">
        <p>{{postData.title}}</p>
      </div>
    </div>

    <div class="add-form-row">
      <label class="add-form-label ">Текст статьи</label>
      <div class="add-form-fields">
        <editor v-if="!loading && postData.text" :postContent="postData.text"  :mayEdit="false"/>
      </div>
    </div>

    <div class="add-form-row">
      <label class="add-form-label ">Хэштеги статьи</label>
      <div class="add-form-fields">
        <p v-if="postData.tags.length === 0">В данный момент у статьи нет хештегов</p>
        <span class="multiple-element" v-for="(tag,item) in postData.tags">
            <span  class="margin_right_10">{{tag}}</span>
        </span>
      </div>
    </div>

    <div class="add-form-row">
      <label class="add-form-label ">Публикация статьи</label>
      <div class="add-form-fields">
        <p v-if="postData.published">Статья опубликована</p>
        <p v-else>Статья не опубликована</p>
      </div>
    </div>

    <div class="add-form-row">
      <el-button class="width_100" @click="close">
        Закрыть
      </el-button>
    </div>
  </div>
</template>

<script>
import Editor from '@/components/editor.vue'
export default {
  name  : "listPost",
  props : ['id'],
  components : {Editor},
  data (){
    return {
      postData : {
        title     : '',
        text      : '',
        tags      : [],
        published : 0,
        section   : {},
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

    async getData(){
      this.$store.commit('setLoading',true);
      let result = await this.$store.dispatch('query',{
        url  : '/post/edit',
        data : {
          edit : 'get',
          id   :  this.id
        }
      });

      if(result.status == 'success') {
          this.postData = result.data
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
    },

    toEdit(){
      this.$emit('customModal', {key : 'listPost',value : false, update : 'needEdit', id : this.id } );
    },

    close(){
      this.$emit('customModal', {key : 'listPost',value : false, update : false});
    },

  },

  created() {
    this.getData();
  }
}
</script>

<style scoped>

</style>