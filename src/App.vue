<template>
  <div v-loading="loading" v-if="isToken" class="wrapper">
    <div v-if="isAdmin" class="add-form-row align_right">
<!--    <div class="add-form-row align_right">-->
      <el-button @click="openModal.adminButton=true">Администрирование</el-button>
    </div>

    <el-card>
      <label class="add-form-label">Поиск статьи</label>
      <div class="add-form-fields">
        <el-input
            @keyup.enter.native="search"
            placeholder="Поиск"
            v-model="searchText"
            class="margin_right_10">
        </el-input>
        <el-button @click="search" :disabled="!searchText">Найти</el-button>
      </div>
    </el-card>

    <main-tree v-if="show==='tree'" :treeData="treeData" :expandedAll="expandedAll" :needCollapse="needCollapse"/>

    <search-list v-if="show==='search'" :postData="searchPostData" :sectionData="searchSectionData" :searchLabel="searchLabel"  @closeSearch="closeSearch"/>

    <el-dialog title="Привелегии пользователей" :visible.sync="openModal.charter" width="80%" @closed="nextModal = null">
      <charter-list v-if="openModal.charter"/>
    </el-dialog>

    <el-dialog title="Группы пользователей" :visible.sync="openModal.role" width="80%" @closed="nextModal = null">
      <role-list v-if="openModal.role"/>
    </el-dialog>

    <el-dialog title="Администрирование" :visible.sync="openModal.adminButton" width="20%" @closed="openNextModal">
      <el-button class="dialog-button-list" @click="setButtonList('charter')" >Привелегии</el-button>
      <el-button class="dialog-button-list" @click="setButtonList('role')"    >Группы</el-button>
      <el-button class="dialog-button-list" @click="search({notPublished : true})">Не опубликованные статьи</el-button>
    </el-dialog>

  </div>
  <div v-else>
    <el-alert
        type="warning"
        title="Авторизация"
        description ="Ожидание авторизации на сервере!"
    >
    </el-alert>
  </div>
</template>

<script>
import mainTree from '@/components/mainTree'
import searchList from '@/components/searchList'
import charterList from '@/components/admin/charter/list'
import roleList from '@/components/admin/role/list'

export default {
  name : 'Wiki',
  components : {mainTree, searchList, charterList, roleList},
  data (){
    return {
      show : 'tree',//'search'

      treeData          : [
        {
          id       : 0,
          label    : '/',
          children : [],
        }
      ], //начальный корневой элемент каталога
      expandedAll       : false,
      needCollapse      : null,

      isToken           : false,
      timerId           : null,

      openModal         : {
        adminButton : false,
        charter     : false,
        role        : false,
      },
      nextModal         : false,

      searchText        : '',
      searchLabel       : '',
      searchPostData    : [],
      searchSectionData : [],
    }
  },
  computed : {
    loading (){
      return this.$store.getters.loading;
    },
    user_id() {
      return this.$store.getters.userId
    },
    isAdmin(){
      return this.$store.getters.charters('admin')
    },
  },

  methods : {
    async search(data){
      this.$store.commit('setLoading',true);
      this.searchLabel = this.searchText;
      let type = '', q = ''

      if (data.notPublished)  {
          q ='';
          type = 'no_published_post';
          this.openModal.adminButton = false;
      } else {
          if (this.searchText.charAt(0) === '#') type = '#'; else type = 'all';

          q = this.searchText;
      }

      let result = await this.$store.dispatch('query',{
        url  : '/search',
        data : {q : q, search : type}
      });

      if(result.status == 'success') {
         if (result.posts)    this.searchPostData    = result.posts;    else this.searchPostData    = [];
         if (result.sections) this.searchSectionData = result.sections; else this.searchSectionData = [];
          this.searchSectionData.forEach(el => {
            el.value = 's' + el.value; // у секций везде единообразно id с буквой s
          })

          this.show = 'search';
          this.$set(result, 'title', 'успешно')
      } else {
          this.searchPostData = [];
          this.searchSectionData = [];
          this.show = 'tree';
          this.$set(result, 'title', 'ошибка')
      }
      this.searchText = '';
      this.$notify({
        title                     : result.title,
        message                   : result.message,
        type                      : result.status,
        dangerouslyUseHTMLString  : true,
        duration                  : 5000,
        showClose                 : true
      });

      this.$store.commit('setLoading',false);
    },

    setButtonList(key) {
      switch (key) {
        case 'charter' :
          this.openModal.adminButton = false;
          this.nextModal = 'charter';
          break;

        case 'role' :
          this.openModal.adminButton = false;
          this.nextModal = 'role';
          break;
      }
    },

    openNextModal(){
       if(this.nextModal)
          this.openModal[this.nextModal] = true;
    },

    async closeSearch(type, id, label, published){
      if (id && type) {
        let result = null;
        if (type === 'section') {
            result = await this.$store.dispatch('query', {url: '/section/path', data: {id: id === 0 ? id : id.slice(1)}});
            if(result.status == 'success') {
              let data = result.data

              let changeSectionId = async function(data){
                if (data.children instanceof Array) {
                  data.id = 's' + data.id
                  await changeSectionId(data.children[0])
                } else {
                   data.id = 's' + data.id
                   data.children = [{}] ;
                }
              };

              if (data instanceof Array)
                await changeSectionId(data[0]);

              this.treeData[0].children = data;
              this.expandedAll = true;
            }
        } else {
            result = await  this.$store.dispatch('query',{url : '/post/path',data : { id : id} });
            if(result.status == 'success') {
               let data = result.data

               let changeSectionId = async function(data){
                  if (data.children instanceof Array) {
                      data.id = 's' + data.id
                      await changeSectionId(data.children[0])
                  } else {
                      data.id = 's' + data.id
                      data.children = [{id : id, label : label, published : published, is_post : true, is_cut : false}];
                  }
               };

            if (data instanceof Array)
              await changeSectionId(data[0]);
            else
              data = [{id : id, label : label, published : published, is_post : true, is_cut : false}];

            this.treeData[0].children = data;
            this.expandedAll = true;
          }
        }
        if(result.status !== 'success')
            this.$notify({
              title                     : result.title,
              message                   : result.message,
              type                      : 'error',
              dangerouslyUseHTMLString  : true,
              duration                  : 10000,
              showClose                 : true
            });
      }

      if (type === 'section')
        this.needCollapse = id;
      else
        this.needCollapse = null;

      this.show='tree';
    },

    async initData(){
      //console.log('Попытка авторизоваться')
      if (window._userId)  {
          this.$store.commit('setUserId', window._userId);
      } else {
          this.$store.commit('setUserId', null);
      };

      window._token ? window.token = window._token : window.token = '';

      if (window.token) {
          setTimeout(() => {clearInterval(this.timerId)});
          let result = await  this.$store.dispatch('query',{url : '/home',data : { id : this.user_id} });

          this.isToken = true; //в этом случае наверху отрисуется начальный компонент

          if (result.charters)
            this.$store.commit('setCharters', result.charters);
          else
            this.$store.commit('setCharters', []);

      } else {
          this.isToken = false;
          this.$store.commit('setCharters', []);
      };
    },
  },

  async created() {
    await this.initData();
    if (this.isToken) {

      //ниже получаем массив детей корневого каталога
      this.$store.commit('setLoading',true);
      let result = await this.$store.dispatch('getData',{id : 0, onlyPosts : false})
      this.$store.commit('setLoading',false);

      // ниже загружаем туда полученных детей
      let childs = result.data;
      childs.forEach(el => {
        this.treeData[0].children.push(el);
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
    }
      else
        this.timerId = setInterval(() => this.initData(), 5000 );
  }
}
</script>

<style>

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  /*padding-right: 10px;*/
}
.wrapper {
  padding: 10px
}

.button_wrapper{
  display: flex;
}

.add-form-row{
  margin-bottom: 10px;
}

.add-form-fields {
  display: flex;
  margin-top: 5px;
}

.add-form-label{
  font-weight: bold;
}

.two_fields {
  display: grid !important;
  grid-template-columns: 49% 49%;
  grid-gap: 2%;
}

.three_fields {
  display: grid !important;
  grid-template-columns: 32% 32% 32%;
  grid-gap: 2%;
}

.other_fields{
  display: grid !important;
  grid-template-columns: 64% 32%;
  grid-gap: 2%;
}

.width_100 {
  width: 100%;
}
.align_right {
  text-align: right
}

.multiple-value{
  margin-bottom: 10px;
}

.multiple-element{
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  margin-right: 10px;
}

.multiple-element:last-child{
  margin-right: 0;
}

.dialog-button-list {
  width: 100%;
  margin-bottom: 10px !important;
  display: block !important;
  margin-left: 0 !important;
}

.close_search_button {
  float: right;
  padding: 3px 0
}

.margin_right_10{
  margin-right: 10px;
}

.myI:hover{
  color: #3fddff !important;
  font-size: 20px;
  text-align: right;
}

.mySpan{
  padding: 10px;
 }

.two_level-span {
  margin-left: 20px;
}

.mySpan:hover {
  color: #3fddff !important;
  cursor: pointer;
  /*font-size: 14px;*/
  text-align: right;
}


small {
  color: #ff2400;
}
.invalid {
  border:solid 1px;
  border-color: #ff2400;
}


</style>
