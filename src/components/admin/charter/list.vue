<template>
  <div v-loading="loading">

    <div class="add-form-row align_right">
      <el-button @click="openModal.add = true">Добавить привелегию</el-button>
    </div>

    <Grid :name="name" v-if="load" />

    <el-dialog title="Добавить привилегию" :visible.sync="openModal.add" width="50%" :append-to-body="true">
      <charter-add @customModal="showModal"  v-if="openModal.add" @close="openModal.add = false" />
    </el-dialog>

    <el-dialog title="Редактировать привилегию" :visible.sync="openModal.edit" width="50%" :append-to-body="true">
      <charter-edit @customModal="showModal" :data="modal.data" v-if="openModal.edit" @close="openModal.edit = false" />
    </el-dialog>

  </div>
</template>
<script>
import CharterAdd  from '@/components/admin/charter/add'
import CharterEdit from '@/components/admin/charter/edit'
export default {
  name : 'ListCharter',
  components : {CharterAdd, CharterEdit},
  data : function (){
    return {
      load       : false,
      name       : 'charter',
      modal      : {
        data :  [],
      },
      openModal  : {
        add  : false,
        edit : false,
      },

      grid       : {
        filter      : {
          data     : {
            id              : {
              show : false,
              type : 'number',
              name : 'ID',
            },
            name            : {
              type     : 'list',
              name     : 'Название',
              multiple : true,
              option   : [],
            },
          },
          filter   : function(data){
             this.filterData = data;
             this.getData();
          }.bind(this),
          clear    : function(){
            this.filterData = {};
            this.getData();
          }.bind(this),
        },
        context     : [
          {
            name : 'Редактировать',
            function : (row) => {
              this.modal.data = row;
              let notDelete = ['admin', 'showAll'];
              let charter = row.name[0].value
              if (notDelete.indexOf(charter) >= 0) {
                this.$notify({
                  title                     : 'Ошибка',
                  message                   : `Привелегию - ${charter} редактировать запрещено!`,
                  type                      : 'error',
                  dangerouslyUseHTMLString  : true,
                  duration                  : 10000,
                  showClose                 : true
                });
                return;
              }
              this.openModal.edit  = true;
            }
          },
          {
            name : 'Удалить',
            function : function(row){
              this.$confirm(`Вы уверены, что хотите удалить привелегию - ${row.name[0].value} ?`).then(async() => {
                this.deleteCharter(row);
              }).catch(() => {});

            }.bind(this),
          },
        ],
        pagination  : {
          show : 'none'
        },
        header      : {
          id         : {
            name  : 'ID',
          },
          name       : {
            name  : 'Название',
            width : 200,
          },
          note       : {
            name  : 'Примечания',
            width : 400,
          },
          created_at : {
            name  : 'Дата добавления',
            width : 250,
          },
        },
        elements    : [],
      },
      filterData : {},
    };
  },

  computed : {
    loading (){
      return this.$store.getters.loading;
    },
  },

  methods : {
    async getData(){
      this.$store.commit('setLoading',true);

      this.grid.filter.data.name.option = [];
      let filter = await this.$store.dispatch('normalizeFilterData', this.filterData);

      let result = await this.$store.dispatch('query',{url : '/charter/list', data : { filter  : filter } });

      if(result.status == 'success') {

        //ниже заполнить правами select у фильтра
        this.grid.filter.data.name.option = result.data.map(el => {
          return {value : el.name[0].value, label : el.name[0].value};
        })

          //ниже добавляются исходнные права которые нужны для работы программы (в случае если при первом запуске таблица прав пустая)
          // Object.keys(filter).length нужен если после фильтрации нет данных удовлетворяющих условию фильтра то моковые данные не надо добавлять
          if( Object.keys(filter).length == 0 && result.data.length == 0 ){
            let mokCharter = [
              {name : 'showAll', note : 'Просмотр всего'},
              {name : 'admin',   note : 'Администрирование'},
            ];
            for (let i = 0; i < mokCharter.length; i++ ) {
              await this.$store.dispatch('query',{url : '/charter/add',data : mokCharter[i]});
            }
            result = await this.$store.dispatch('query',{ url     : '/charter/list',  data    : { filter  : filter } });
            this.$grid.commit('normalizeElement',{name : this.name, data : {elements : result.data}});
          }

        this.$grid.commit('normalizeElement',{name : this.name, data : {elements : result.data}});
      } else
          this.$notify({
            title                     : 'Ошибка',
            message                   : 'Некорректный ответ сервера',
            type                      : 'error',
            dangerouslyUseHTMLString  : true,
            duration                  : 10000,
            showClose                 : true
          });

      this.$store.commit('setLoading',false);
    },
    showModal : function(e){
      this.openModal[e.key] = e.value;
      this.getData();
    },

    async deleteCharter(row){

      let notDelete = ['showAll', 'admin'];
      let charter = row.name[0].value
      if (notDelete.indexOf(charter) >= 0) {
        this.$notify({
          title                     : 'Ошибка',
          message                   : `Привелегию - ${charter} удалять запрещено!`,
          type                      : 'error',
          dangerouslyUseHTMLString  : true,
          duration                  : 10000,
          showClose                 : true
        });
        return;
      }

      this.$store.commit('setLoading',true);

      let result = await this.$store.dispatch('query',{
        url : '/charter/delete',
        data : {id : row.id[0].value}
      });
      if(result.status == 'success') {
        this.getData();
      }

      this.$store.commit('setLoading',false);
    },

  },
  created : function(){
    this.load = this.$grid.dispatch('createGrid', {name : this.name, data : this.grid});
    this.getData();
  },
}
</script>