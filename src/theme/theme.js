import { createTheme } from "@mui/material/styles";

export const tokens = {
  ink: "#12201A",
  inkSoft: "#1E3129",
  paper: "#F6F7F3",
  card: "#FFFFFF",
  lime: "#C6FF4E",
  limeDeep: "#8FCB1F",
  coral: "#FF6B4A",
  slate: "#5B6960",
  slateLight: "#8B978E",
  line: "#E2E6DF",
};

const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: tokens.paper, paper: tokens.card },
    primary: { main: tokens.limeDeep, contrastText: tokens.ink },
    secondary: { main: tokens.ink, contrastText: tokens.lime },
    error: { main: tokens.coral },
    text: { primary: tokens.ink, secondary: tokens.slate },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", -apple-system, sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, boxShadow: "none" },
        containedPrimary: {
          backgroundColor: tokens.ink,
          color: tokens.lime,
          "&:hover": { backgroundColor: tokens.inkSoft, boxShadow: "none" },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

export default theme;