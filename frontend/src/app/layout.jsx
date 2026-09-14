import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import ClientProviders from './ClientProviders';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sree Padmavathi Silks | Pure Kanchipuram & Handloom Silks',
  description: 'Authentic handwoven Kanchipuram, Banarasi, and Soft Silk sarees directly from master weavers in Hindupur, Andhra Pradesh.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
