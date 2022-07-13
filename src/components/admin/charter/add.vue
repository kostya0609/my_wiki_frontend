<template>
  <div v-loading="loading">
    <div class="add-form-row">
      <label class="add-form-label">Название</label>
      <el-input
          type="text"
          v-model="charter.name"
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
          v-model="charter.note"
          placeholder="Укажите примечание">
      </el-input>
    </div>
    <div class="add-form-row">
      <el-button style="width:100%" @click="saveCharter">Добавить привелегию</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name : 'AddCharter',
  data : function (){
    return {
      charter : {
        name    : '',
        note    : '',
      },
      errors   : {
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
    async saveCharter() {
      if (!this.charter.name) return this.errors.name = 'Необходимо ввести название привелегии!';

      this.$store.commit('setLoading',true);

        let result = await this.$store.dispatch('query',{url : '/charter/add',data : this.charter});

        if(result.status == 'success') {
            this.charter = { name    : '', note : '' }
            await this.$emit('customModal',{key : 'add', value : false});
        } else {
            await this.$emit('customModal',{key : 'add', value : true});
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

  watch:{
    'charter.name' : function(){
      this.errors.name = null;
    },
  },
}
</script>