import { createRouter, createWebHistory } from 'vue-router'

// Páginas
import PresencaProfessor from '@/views/PresencaProfessor.vue'
import PresencaTurma from '@/views/PresencaTurma.vue'

const routes = [
  {
    path: '/',
    redirect: '/presenca-professor'
  },
  {
    path: '/presenca-professor',
    name: 'PresencaProfessor',
    component: PresencaProfessor
  },
  {
    path: '/presenca-professor/turma/:id',
    name: 'PresencaTurma',
    component: PresencaTurma,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
