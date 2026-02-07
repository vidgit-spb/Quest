import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'KiddoQuest — мини-игра для изучения слов',
  description: 'Мини-приложение для Telegram: изучаем английские слова в формате соревнования.'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700&family=Nunito:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css?v=20260207b" />
      </head>
      <body>
        {children}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
        <Script type="module" src="/app.js?v=20260207b" strategy="afterInteractive" />
      </body>
    </html>
  );
}
