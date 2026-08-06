import Script from "next/script";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Public Website Stylesheets - Isolated to (public) routes */}
      <link rel="stylesheet" href="/style-css/main.css" />
      <link rel="stylesheet" href="/style-css/mscol.css" />
      <link rel="stylesheet" href="/style-css/responsive.css" />
      <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />

      {children}

      {/* Public Scripts */}
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/apexcharts" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
      <Script src="/script/js/main.js" strategy="lazyOnload" />
    </>
  );
}
