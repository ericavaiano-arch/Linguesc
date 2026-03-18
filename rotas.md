# Proteção de Rotas — definePageMeta por página

Adicione o bloco `definePageMeta` no início do <script setup> de cada página:

## Rotas públicas (sem middleware)
- pages/index.vue         → sem middleware (login)
- pages/register.vue      → sem middleware (cadastro)

## Rotas de ALUNO (middleware: auth)
Adicionar no <script setup>:

  definePageMeta({ middleware: 'auth' })

Páginas:
- pages/hub.vue
- pages/presencaAluno.vue
- pages/registroPresenca.vue
- pages/profile/[id].vue

## Rotas de PROFESSOR (middleware: professor)
Adicionar no <script setup>:

  definePageMeta({ middleware: 'professor' })

Páginas:
- pages/dashboard.vue
- pages/turmas/index.vue
- pages/turmas/[id]/aulas.vue
- pages/turmas/[id]/historico.vue
- pages/turmas/[id]/relatorio.vue
- pages/chamada-manual/index.vue        (ou chamada-manual.vue)
- pages/chamada-manual/[id].vue
- pages/qrCodeTurmas.vue
- pages/presencaProfessor.vue
- pages/presenca-professor/turma/[id].vue
- pages/presenca-professor/turma/qrcode/[id].vue

## Rotas de ADMIN (middleware: admin)
Adicionar no <script setup>:

  definePageMeta({ middleware: 'admin' })

Páginas:
- pages/admin/index.vue
- pages/admin/usuarios.vue
- pages/admin/configuracoes.vue