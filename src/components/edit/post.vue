<template>
  <div v-loading="loading">

    <div class="add-form-row">
      <label class="add-form-label ">Заголовок статьи</label>
      <div class="add-form-fields">
        <el-input
            placeholder="Заголовок статьи"
            v-model="title">
        </el-input>
      </div>
    </div>

    <div class="add-form-row">
      <label class="add-form-label">Текст статьи</label>
      <div class="add-form-fields">
        <editor v-if="!loading" :postContent="text" @endEdit="endEdit" :mayEdit="true"/>
      </div>
    </div>

    <div class="add-form-row">
      <label class="add-form-label">Хештеги</label>
      <div class="add-form-fields">
        <span class="multiple-element" v-for="(tag,item) in hashTags">
          <span @click="hashTags.splice(item,1)" class="margin_right_10">{{tag}}</span>
          <i class="el-icon-close" @click="hashTags.splice(item,1)" />
        </span>
      </div>
    </div>

    <div class="add-form-row">
      <p v-if="hashTags.length === 0">В данный момент у статьи нет хештегов</p>
      <div class="add-form-fields">
        <el-select
            v-model.trim="hashTag"
            filterable
            remote
            reserve-keyword
            placeholder="Введите хэштег"
            :remote-method="searchHashTag"
            @change="clearSelectSearch('hashTag_search')"
            :ref="'hashTag_search'"
            class="margin_right_10 width_100"
        >
          <el-option
              v-for="item in hashTagsSearch"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <el-button class="el-icon-plus" @click="addHashTag" />
      </div>
    </div>

    <div class="add-form-row">
      <label class="add-form-label">Публикация статьи</label>
      <div class="add-form-fields">
        <el-checkbox-group v-model="published"  fill="#909399" text-color="white">
          <el-checkbox-button :label="published  ? 'Опубликовать' : 'НЕ публиковать'" v-model="published"/>
        </el-checkbox-group>
      </div>
    </div>

    <div class="add-form-row">
      <el-button class="width_100" @click="save">
        Сохранить изменения
      </el-button>
    </div>
  </div>
</template>

<script>
import Editor from '@/components/editor.vue'
export default {
  name  : "editPost",
  components : {Editor},
  props : ['id'],
  data(){
    return {
      title          : '',
      text           : '',
      published      : false,
      hashTag        : '',
      hashTags       : [],
      hashTagsSearch : [],
    }
  },

  computed :{
    loading (){
      return this.$store.getters.loading;
    },
  },
  methods : {
    endEdit(data){
      this.text = data;
    },

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
          this.title = result.data.title;
          this.text = result.data.text;
          this.hashTags = result.data.tags;
          result.data.published === 1 ? this.published = true : this.published = false;
      }

      this.$store.commit('setLoading',false);
    },

    addHashTag(){
      if (this.hashTag) {
         if (this.hashTag.charAt(0) === '#') this.hashTags.push(this.hashTag); else this.hashTags.push('#' + this.hashTag);
         this.hashTag = '';
      }
    },

    searchHashTag : async function(query){
      //this.$store.commit('setLoading',true);
      let result = await this.$store.dispatch('query',{url : '/search' ,data :  {q : query, search : 'tag'}});
      if(result.status == 'success'){
          this.hashTagsSearch = result.tags;
      }
      //this.$store.commit('setLoading',false);
    },

    clearSelectSearch : function(key){
      if (this.hashTag) {
          if (this.hashTag.charAt(0) === '#') this.hashTags.push(this.hashTag); else this.hashTags.push('#' + this.hashTag);
          this.hashTag = '';
      }
      this.$refs[key].query = '';
    },

    async save(){
      this.$store.commit('setLoading',true);

      let result = await this.$store.dispatch('query',{
        url  : '/post/edit',
        data : {
          edit           : 'set',
          id             : this.id,
          title          : this.title,
          text           : this.text,
          tags           : this.hashTags,
          published      : this.published ? '1' : '0',
        }
      });

      if(result.status == 'success') {
          this.$emit('customModal',{key : 'editPost',value : false, update : 'editPost', newTitle : this.title, published : this.published});
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
    },

  },
  created() {
    this.getData();
  }
}
</script>

<style scoped>

</style>