export function useBrowseReturn(section: '/learn' | '/gallery') {
  const route = useRoute()
  const href = useState<string>(`browse-return:${section}`, () => section)

  if (route.path === section) {
    watch(() => route.fullPath, path => {
      if (route.path === section) href.value = path.split('#')[0]!
    }, { immediate: true })
  }

  return href
}
