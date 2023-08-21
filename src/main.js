import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import LoginPage from "./components/LoginPage.vue";
import MainPage from "./components/MainPage.vue";
import SignupPage from "./components/SignupPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      component: LoginPage,
    },
    {
      path: "/signup",
      component: SignupPage,
    },
    {
      path: "/",
      component: MainPage,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!userIsLoggedIn()) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

function userIsLoggedIn() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user !== null;
}

const app = createApp(App);
app.use(router);
app.mount("#app");
