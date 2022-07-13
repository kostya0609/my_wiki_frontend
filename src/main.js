import Vue from 'vue'
import App from './App.vue'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import locale from 'element-ui/lib/locale/lang/ru-RU';
import VDG from 'volumetric-datagrid';
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

//window._userId = 13048;
//window._token  = '$2y$10$OOyb6fCHwqiaXWRIwKxf1.MA7b7lizXFu8J.0M6XhdJqLM6G.3ipO';

Vue.config.productionTip = false

Vue.use(VDG);
Vue.use(ElementUI, {locale});
Vue.component('vue-draggable-resizable', VueDraggableResizable)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')

