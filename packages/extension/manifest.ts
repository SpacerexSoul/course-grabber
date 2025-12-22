import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Course Grabber',
  version: '1.0.0',
  description: 'Extract embedded course videos and send to Course Grabber',
  action: {
    default_popup: 'index.html',
    default_icon: {
      '16': 'public/vite.svg',
      '32': 'public/vite.svg',
      '48': 'public/vite.svg',
      '128': 'public/vite.svg',
    },
  },
  icons: {
    '16': 'public/vite.svg',
    '32': 'public/vite.svg',
    '48': 'public/vite.svg',
    '128': 'public/vite.svg',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['activeTab', 'scripting', 'webRequest', 'storage'],
  host_permissions: ['<all_urls>'],
})
