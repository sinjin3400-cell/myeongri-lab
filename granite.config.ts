import { defineConfig } from '@apps-in-toss/web-framework/config';

/**
 * appName: 앱인토스 콘솔에 등록한 앱 ID와 동일하게 맞추세요.
 * 콘솔에서 다른 ID로 등록했다면 그 값으로 변경하세요.
 */
export default defineConfig({
  appName: 'myeongri-lab',
  brand: {
    displayName: '명리연구소',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/appsintoss/30245/96c67b5d-abe3-44bf-817b-62846282c042.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
});
