import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading       : false,

    //domain        : 'https://lara.bsi.local/api/wiki',
    //domain        : 'https://vc.bsi.local/api/wiki',
    domain              :  process.env.NODE_ENV === 'production' ? window.location.origin + '/api/wiki' : 'https://vc.bsi.local/wiki',

    postData      : {postData : {}, status : false},
    postCut       : false,

    sectionCut    : false,
    cutSectionId  : null,

    userId        : null,
    charters      : [],
  },

  getters : {
    loading       : s => s.loading,
    domain        : s => s.domain,

    postData      : s => s.postData,
    postCut       : s => s.postCut,

    sectionCut    : s => s.sectionCut,
    cutSectionId  : s => s.cutSectionId,

    userId        : s => s.userId,
    charters      : s => char => { return s.charters.indexOf(char) >= 0 ? true : false },

  },

  mutations: {
    setLoading(s,v){
      s.loading = v;
    },
    setPostData(s,v){
      s.postData = v;
    },
    setPostCut(s, v){
      s.postCut = v;
    },
    setSectionCut(s, v){
      s.sectionCut = v;
    },
    setCutSectionId(s, v){
      s.cutSectionId = v;
    },

    setUserId(s,v){
      s.userId = v;
    },
    setCharters(s,v){
      s.charters = v;
    },


  },

  actions: {
    async query (ctx, params){
      if(!('type' in params)) params.type = 'json'

      let body, header = {};

      if(params.type == 'json'){
        body = {
          token : window.token,
          ...params.data
        }
        header['Content-Type'] = 'application/json;charset=utf-8';
      }else{
        body = params.data;
        body.append('token',window.token);
      }
      try {
        let query = await fetch(ctx.getters.domain + params.url, {
          method: 'post',
          headers: header,
          body: params.type == 'json' ? JSON.stringify(body) : body
        });
        let result = null;
        params.downloadRequest ? result = query :  result = await query.json();
        return result;
      }catch(e){
        return {'status' : 'error','message' : 'Некорректный ответ сервера'};
      }
    },

    normalizeFilterData(ctx, data){
      let normalFilter = {};
      for (let key in data){
        if ((data[key].type === 'number' || data[key].type === 'date')         && data[key].min)                normalFilter[key] = data[key];
        if ((data[key].type === 'list'   || data[key].type === 'searchlist')   && data[key].value.length > 0 )  normalFilter[key] = data[key];
      }
      return normalFilter;
    },

    async getData(ctx, params){
      let data = [];

      let result = await this.dispatch('query', {
        url  : '/section/list',
        data : {
          id       : params.id === 0 ?  params.id = params.id : params.id = params.id.slice(1),
          charters : ctx.state.charters,
        }
      });

      if(result.status == 'success') {
        let posts = [], sections = [];
        if (result.sections instanceof Array && result.posts instanceof Array )
            // приходят два массива - статьи и разделы... для дерева каталога нужен общий массив из элементов
            // и для статей нужен признак  is_post - что это статья и нужен признка вырезания статьи is_cut чтоб потом у статей был данный функционал
        sections = result.sections;
        //для дерева надо чтоб id разделов и id статей были уникальны в рамках узла дерева ... к id разделов добавим s
        sections.forEach(el => {
          el['id'] = 's' + el['id'];
          el['is_cut'] =  false;
        })
        posts = result.posts;
        posts.forEach(el => {
          el['is_post'] = true;
          el['is_cut'] =  false;
        });
        if (params.onlyPosts) data = posts; else data = sections.concat(posts);
      }
      return {
        data         : data,
        notification : {
          title   : result.title,
          message : result.message,
          type    : result.status,
        }
      };
    },

  },
  modules: {
  }
})
