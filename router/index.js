import { createRouter, createWebHistory } from 'vue-router'

// Páginas existentes
import PresencaProfessor from '@/views/PresencaProfessor.vue'
import PresencaTurma from '@/views/PresencaTurma.vue'
import Register from '@/views/Register.vue'
import Login from '@/pages/index.vue'
import QrcodePresenca from '@/pages/presenca-professor/turma/Qrcode.vue'
import RegistroPresenca from '@/pages/registroPresenca.vue'
import QrCodeTurmas from '@/pages/qrCodeTurmas.vue'

// Chamada Manual
import ChamadaManual from '@/pages/chamada-manual.vue'
import ChamadaManualTurma from '@/pages/chamada-manual/[id].vue'

// Turmas
import Turmas from '@/pages/turmas.vue'
import TurmasCriar from '@/pages/turmas/criar.vue'
import TurmasAulas from '@/pages/turmas/[id]/aulas.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  { path: '/registro-presenca', name: 'RegistroPresenca', component: RegistroPresenca, meta: { requiresAuth: true } },
  { path: '/presenca-professor', name: 'PresencaProfessor', component: PresencaProfessor, meta: { requiresAuth: true } },
  { path: '/presenca-professor/turma/:id', name: 'PresencaTurma', component: PresencaTurma, props: true, meta: { requiresAuth: true } },
  { path: '/presenca-professor/turma/qrcode/:id', name: 'QrcodePresenca', component: QrcodePresenca, props: true, meta: { requiresAuth: true } },
  { path: '/qr-code-turmas', name: 'QrCodeTurmas', component: QrCodeTurmas, props: true, meta: { requiresAuth: true } },

  // Chamada Manual
  { path: '/chamada-manual', name: 'ChamadaManual', component: ChamadaManual, meta: { requiresAuth: true } },
  { path: '/chamada-manual/:id', name: 'ChamadaManualTurma', component: ChamadaManualTurma, props: true, meta: { requiresAuth: true } },

  // Turmas
  { path: '/turmas', name: 'Turmas', component: Turmas, meta: { requiresAuth: true } },
  { path: '/turmas/criar', name: 'TurmasCriar', component: TurmasCriar, meta: { requiresAuth: true } },
  { path: '/turmas/:id/aulas', name: 'TurmasAulas', component: TurmasAulas, props: true, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user')
  if (to.meta.requiresAuth && !user) {
    next('/')
  } else {
    next()
  }
})

export default router
