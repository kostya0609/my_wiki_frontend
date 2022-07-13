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
      <el-button style="width:100%" @click="saveCharter">Сохранить привелегию</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name  : 'EditCharter',
  props : ['data'],
  data  : function (){
    return {
      charter_id : '',

      charter    : {
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
      this.charter_id     = this.data.id[0].value;
      this.charter.name   = this.data.name[0].value;
      this.charter.note   = this.data.note[0].value

    },

    async saveCharter() {
      if (!this.charter.name) return this.errors.name = 'Необходимо ввести название привелегии!';

      this.$store.commit('setLoading',true);

      let result = await this.$store.dispatch('query',{url : '/charter/edit',data : {
        id   : this.charter_id,
        edit : 'set',
        ... this.charter
      }});

      if(result.status == 'success') {
          this.charter = { name    : '', comment : '' }
          await this.$emit('customModal',{key : 'edit', value : false});
      } else {
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
    'charter.name' : function(){
      this.errors.name = null;
    },
  },
}
</script>