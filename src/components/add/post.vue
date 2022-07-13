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
            class="margin_right_10"
            style="width: 100%"

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
        Сохранить
      </el-button>
    </div>
  </div>
</template>

<script>
import Editor from '@/components/editor.vue'
export default {
  name  : "addPost",
  components : {Editor},
  props : ['nodeData'],
  data(){
    return {
      text           : '{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"left"},"content":[{"type":"text","text":"Введите текст"}]}]}',
      title          : '',
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
        url  : '/post/add',
        data : {
          section_id     : this.nodeData.id === 0 ? this.nodeData.id : this.nodeData.id.slice(1),
          title          : this.title,
          text           : this.text,
          tags           : this.hashTags,
          published      : this.published ? '1' : '0',
        }
      });

      if(result.status == 'success') {
         this.$emit('customModal',{key : 'addPost',value : false, update : 'addPost', newPost : result.new_post});
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
}
</script>

<style scoped>

</style>