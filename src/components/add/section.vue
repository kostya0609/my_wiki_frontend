<template>
<div v-loading="loading">
  <div class="add-form-row">
    <label class="add-form-label ">Название раздела</label>
    <div class="add-form-fields">
      <el-input
          placeholder="Имя раздела"
          v-model="name"
          @keyup.enter.native="save"
      >
      </el-input>
    </div>
  </div>

  <div class="add-form-row">
    <el-button @click="save" class="width_100">
      Сохранить
    </el-button>
  </div>

</div>
</template>

<script>
export default {
  name  : "addSection",
  props : ['nodeData'],
  data(){
    return {
      name : '',
    }
  },
  computed :{
    loading (){
      return this.$store.getters.loading;
    },
  },
  methods :{
    async save(){
      this.$store.commit('setLoading',true);

      let result = await this.$store.dispatch('query',{
        url  : '/section/add',
        data : {
          parent_section : this.nodeData.id === 0 ? this.nodeData.id : this.nodeData.id.slice(1),
          name           : this.name,
        }
      });

      if(result.status == 'success') {
         result.new_section.id = 's'+result.new_section.id; // добавить к id раздела букву s для уникальности id в дереве
          this.$emit('customModal',{key : 'addSection',value : false, update : 'addSection', newSection : result.new_section});
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