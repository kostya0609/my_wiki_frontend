<template>
  <div v-loading="loading">
    <div class="add-form-row">
      <label class="add-form-label">Название</label>
      <el-input
          type="text"
          v-model="role.name"
          :class="errors.name ? 'invalid' : ''"
          placeholder="Укажите название"
      />
      <small v-if="errors.name">{{ errors.name}}</small>
    </div>
    <div class="add-form-row">
      <label>Примечание</label>
      <el-input
          type="textarea"
          rows="4"
          v-model="role.note"
          placeholder="Укажите примечание">
      </el-input>
    </div>
    <div class="add-form-row">
      <el-button style="width:100%" @click="saveRole">Сохранить группу</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name  : 'EditRole',
  props : ['data'],
  data  : function (){
    return {
      role_id : '',

      role    : {
        name : '',
        note : '',
      },

      errors     : {
        name   : null,
      },
    };
  },

  computed : {
    loading (){
      return this.$store.getters.loading;
    },
  },

  methods : {
    getData(){
      this.role_id   = this.data.id[0].value;
      this.role.name = this.data.name[0].value;
      this.role.note = this.data.note[0].value

    },

    async saveRole() {
      if (!this.role.name) return this.errors.name = 'Необходимо ввести название группы!';

      this.$store.commit('setLoading',true);

      let result = await this.$store.dispatch('query',{url : '/role/edit',data : {
          id   : this.role_id,
          edit : 'set',
          ... this.role
        }});

      if(result.status == 'success') {
        this.role = { name    : '', comment : '' }
        await this.$emit('customModal',{key : 'edit', value : false});
      }else {
        await this.$emit('customModal',{key : 'edit', value : true});
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
    }
  },
  created() {
    this.getData();
  },
  watch:{
    'role.name' : function(){
      this.errors.name = null;
    },
  },
}
</script>