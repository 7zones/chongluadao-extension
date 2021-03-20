const plugin = require("tailwindcss/plugin");
module.exports = {
  important: true,
  fontFamily: {
    display: ["Helvetica", "sans-serif"],
    body: ["Helvetica-Neue", "sans-serif"],
  },
  variants: {},
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("important", ({ container }) => {
        container.walkRules((rule) => {
          rule.selector = `.\\!${rule.selector.slice(1)}`;
          rule.walkDecls((decl) => {
            decl.important = true;
          });
        });
      });
    }),
  ],
  extend: {
    colors: {
      gray: {
        100: "#f5f5f5",
        200: "#eeeeee",
        300: "#e0e0e0",
        400: "#bdbdbd",
        500: "#9e9e9e",
        600: "#757575",
        700: "#616161",
        800: "#424242",
        900: "#212121",
      },
    },
  },
};
