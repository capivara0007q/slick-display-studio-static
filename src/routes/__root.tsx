import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/home"
            className="inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow press"
          >
            Voltar para a Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#0F0E0D" },
      { title: "PromoJá Benefícios — Descontos exclusivos para associados" },
      {
        name: "description",
        content:
          "PromoJá Benefícios: descontos e vantagens exclusivas para associados em centenas de parceiros perto de você.",
      },
      { name: "author", content: "PromoJá" },
      { property: "og:title", content: "PromoJá Benefícios — Descontos exclusivos para associados" },
      {
        property: "og:description",
        content:
          "Descontos e vantagens exclusivas para associados. Use seu cartão digital, ative ofertas e economize a cada compra.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "PromoJá Benefícios — Descontos exclusivos para associados" },
      { property: "og:image", content: "/logo-promoja.png" },
      { name: "twitter:image", content: "/logo-promoja.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/logo-promoja.png" },
      { rel: "apple-touch-icon", href: "/logo-promoja.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          const observer = new MutationObserver(() => {
            document.querySelectorAll('button, a, div').forEach(el => {
              if (el.textContent && el.textContent.includes('Edit with Lovable')) {
                el.style.display = 'none';
              }
            });
          });
          observer.observe(document.body, { childList: true, subtree: true });
        ` }} />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </AuthProvider>
  );
}
