import Vue from "vue";
import Router from "vue-router";
const Index = () => import("./components/index.vue");
// const fabric = () => import("./components/fabric.vue");
// const fabric = () => import("./page/index.vue");

// const konva = () => import("./page/konva.vue");
const konva = () => import("./page/Konva/Index.vue");

Vue.use(Router);

const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/home",
      name: "home",
      component: Index
    },
    // {
    //   path: "/fabric",
    //   name: "fabric",
    //   component: fabric
    // },
    {
      path: "/",
      name: "konva",
      component: konva
    },
    // {
    //   path: "/konva",
    //   name: "konva",
    //   component: konva
    // },
    
  ]
});

export default router;
