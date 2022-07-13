<template>
  <div v-loading="loading">
    <div class="add-form-row">
      <label class="add-form-label ">Новое название раздела</label>
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
  name  : "editSection",
  props : [
    //'node',
    'nodeData'],
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
        url  : '/section/edit',
        data : {
          //parent_section : this.node.parent.data.id === 0 ? this.node.parent.data.id : this.node.parent.data.id.slice(1),
          id             : this.nodeData.id === 0 ? this.nodeData.id : this.nodeData.id.slice(1),
          name           : this.name,
          edit           : 'set',
        }
      });

      if(result.status == 'success') {
        this.$emit('customModal',{key : 'editSection', update : 'editSection', newName : this.name});
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