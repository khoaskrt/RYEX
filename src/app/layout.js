import './globals.css';

export const metadata = {
  title: 'RYEX - San giao dich Crypto uy tin hang dau Viet Nam',
  description:
    'Trai nghiem nen tang giao dich tai san so an toan, minh bach va tuan thu quy dinh phap luat.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html className="light" lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="font-body selection:bg-primary-container selection:text-on-primary-container">
        {children}
      </body>
    </html>
  );
}
