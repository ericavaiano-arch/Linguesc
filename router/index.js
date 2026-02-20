import { createRouter, createWebHistory } from 'vue-router'

// Páginas
import PresencaProfessor from '@/views/PresencaProfessor.vue'
import PresencaTurma from '@/views/PresencaTurma.vue'
import Register from '@/views/Register.vue'
import Login from '@/pages/index.vue'

// Import correto do Qrcode
import QrcodePresenca from '@/pages/presenca-professor/turma/Qrcode.vue'
import RegistroPresenca from  '@/pages/registroPresenca.vue'


const routes = [
  // LOGIN (rota pública principal)
  {
    path: '/',
    name: 'Login',
    component: Login
  },

  // CADASTRO (público)
  {
    path: '/register',
    name: 'Register',
    component: Register
  },

  // ROTAS PRIVADAS
    {
    path: '/registro-presenca',
    name: 'RegistroPresenca',
    component: RegistroPresenca,
    meta: { requiresAuth: true }
  },
  {
    path: '/presenca-professor',
    name: 'PresencaProfessor',
    component: PresencaProfessor,
    meta: { requiresAuth: true }
  },
  {
    path: '/presenca-professor/turma/:id',
    name: 'PresencaTurma',
    component: PresencaTurma,
    props: true,
    meta: { requiresAuth: true }
  },
  {
  path: '/presenca-professor/turma/qrcode/:id',
    name: 'QrcodePresenca',
    component: QrcodePresenca,
    props: true,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user');

  if (to.meta.requiresAuth && !user) {
    next('/');
  } else {
    next();
  }
});

export default router