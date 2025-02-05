import '@/app/globals.css'  // 导入 app 目录下的 globals.css
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
} 