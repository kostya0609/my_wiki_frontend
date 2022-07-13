<template>
  <div v-loading="loading">
    <div class="add-form-row align_right">
      <el-button @click="openModal.add = true">Добавить группу</el-button>
    </div>
    <Grid :name="name" v-if="load" />

    <el-dialog title="Добавить группу" :visible.sync="openModal.add" width="50%" :append-to-body="true">
      <role-add @customModal="showModal"  v-if="openModal.add" @close="openModal.add = false" />
    </el-dialog>

    <el-dialog title="Редактировать группу" :visible.sync="openModal.edit" width="50%" :append-to-body="true" >
      <role-edit @customModal="showModal" :data="modal.data" v-if="openModal.edit" @close="openModal.edit = false" />
    </el-dialog>

    <el-dialog title="Настройка группы" :visible.sync="openModal.connect" width="50%" :append-to-body="true" @closed="showModal({key : 'connect', value : false})">
      <role-connect :data="modal.data" v-if="openModal.connect"  @close="openModal.connect = false"/>
    </el-dialog>

  </div>
</template>
<script>

import RoleAdd     from '@/components/admin/role/add'
import RoleEdit    from '@/components/admin/role/edit'
import RoleConnect from '@/components/admin/role/connect'

export default {
  name : 'ListRole',
  components : {RoleAdd, RoleEdit, RoleConnect},

  data : function (){
    return {
      load       : false,
      name       : 'role',
      modal      : {
        data :  [],
      },
      openModal  : {
        add     : false,
        edit    : false,
        connect : false,
      },

      grid       : {
        filter     : {
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
            users           : {
              type      : 'searchlist',
              name      : 'Пользователи',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/search',
                  data  :  {q : data, search : 'user'}
                });
                if(result.status == 'success') return result.data
              }.bind(this),
            },
            charter         : {
              type     : 'list',
              name     : 'Привелегии',
              multiple : true,
              option   : [],
            },
            created_at      : {
              type : 'date',
              name : 'Дата создания',
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
              let notEdit = ['admin', 'allPostShow'];
              let role = row.name[0].value
              if (notEdit.indexOf(role) >= 0) {
                this.$notify({
                  title                     : 'Ошибка',
                  message                   : `Группу - ${role} редактировать запрещено!`,
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
            name : 'Настроить группу',
            function : (row) => {
              this.modal.data = row;
              this.openModal.connect  = true;
            }
          },
          {
            name : 'Удалить',
            function : function(row){
              let notDelete = ['admin', 'allPostShow'];
              let role = row.name[0].value
              if (notDelete.indexOf(role) >= 0) {
                this.$notify({
                  title                     : 'Ошибка',
                  message                   : `Группу - ${role} удалять запрещено!`,
                  type                      : 'error',
                  dangerouslyUseHTMLString  : true,
                  duration                  : 10000,
                  showClose                 : true
                });
                return;
              }

              this.$confirm(`Вы уверены, что хотите удалить группу - ${row.name[0].value} ?`).then(async() => {
                this.deleteRole(row);
              }).catch(() => {});

            }.bind(this),
          },
        ],
        pagination  : {
          show : 'none'
        },
        header     : {
          id      : {
            name        : 'ID',
            width       : 100,
            //contentSort : true,
          },
          name    : {
            name  : 'Название',
            width : 200,
            child : ['users']
          },
          users   : {
            name  : 'Пользователи',
            width : 300
          },
          charter : {
            name  : 'Права',
            width : 300,
          },
          note    : {
            name  : 'Примечания',
            width : 300,
          },
          created_at : {
            name        : 'Дата добавления',
            width       : 300,
          //  contentSort : true,
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
    async getData() {
      this.$store.commit('setLoading', true);

      this.grid.filter.data.name.option = [];
      let filter = await this.$store.dispatch('normalizeFilterData', this.filterData);

      let charter = await this.$store.dispatch('query', {url: '/charter/list'});
      if (charter.status == 'success') {
        this.grid.filter.data.charter.option = charter.data.map(el => {
          return {value: el.id[0].value, label: el.name[0].value};
        })
      }
      let result = await this.$store.dispatch('query', {url: '/role/list', data: {filter: filter}});

      if (result.status == 'success') {
          //ниже добавляются исходнные права которые нужны для работы программы (в случае если при первом запуске таблица прав пустая)
          // Object.keys(filter).length нужен если после фильтрации нет данных удовлетворяющих условию фильтра то моковые данные не надо добавлять
          if (Object.keys(filter).length == 0 && result.data.length == 0) {
                let mokRole = [
                {name: 'admin',              note: 'Администратор'},
                {name: 'allPostShow',        note: 'Просмотр всех статей'},
                ];

                for (let i = 0; i < mokRole.length; i++) {
                  await this.$store.dispatch('query', {url: '/role/add', data: mokRole[i]});
                }

                result = await this.$store.dispatch('query', {url: '/role/list', data: {filter: filter}});
                this.$grid.commit('normalizeElement',{name : this.name, data : {elements : result.data}});
              }

          this.grid.filter.data.name.option = result.data.map(el => {
            return {value : el.name[0].value, label : el.name[0].value};
           })
          this.$grid.commit('normalizeElement', {name: this.name, data: {elements: result.data}});
      } else
          this.$notify({
            title                     : 'Ошибка',
            message                   : 'Некорректный ответ сервера',
            type                      : 'error',
            dangerouslyUseHTMLString  : true,
            duration                  : 10000,
            showClose                 : true
          });

      this.$store.commit('setLoading', false);
    },

    async deleteRole(row){
      this.$store.commit('setLoading',true);

      let result = await this.$store.dispatch('query',{
        url : '/role/delete',
        data : {id : row.id[0].value}
      });
      if(result.status == 'success') {
        this.getData();
      }

      this.$store.commit('setLoading',false);
    },

    showModal : function(e){
      this.openModal[e.key] = e.value;
      this.getData();
    },
  },
  created : function(){
    this.load = this.$grid.dispatch('createGrid', {name : this.name, data : this.grid});
    this.getData();
  },
}
</script>