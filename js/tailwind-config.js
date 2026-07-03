/* Configuración de Tailwind (Play CDN).
   Debe cargarse SIN defer, justo tras el script del CDN y antes del render,
   para que las utilidades personalizadas estén disponibles al pintar. */
tailwind.config = {
  theme: {
    screens: {
      sm: "480px", // móvil grande
      md: "768px", // tablet
      lg: "1024px", // desktop
      xl: "1280px",
    },
    extend: {
      colors: {
        // Paleta corporativa Cisco (misma que la página C9200L)
        cisco: { dark: "#0D274D", DEFAULT: "#049FD9" },
      },
    },
  },
};
