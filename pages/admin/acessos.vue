<script setup>
definePageMeta({ middleware: 'admin' })
const router = useRouter()
onMounted(() => router.replace('/admin/usuarios'))
</script>
