import { useMemo } from "react";
import { useRoutes } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useAtomValue } from "jotai";

import { appRoutes } from "./routes/dashboardRoutes";
import { getTheme } from "./theme/theme";
import { themeAtom } from "./lib/state/atoms/settingsAtoms";
import StateBootstrap from "./lib/state/StateBootstrap";

export default function App() {
  const themeMode = useAtomValue(themeAtom);

  // Debug: See what we're actually getting
  console.log('themeMode type:', typeof themeMode);
  console.log('themeMode value:', themeMode);

  const theme = useMemo(() => {
    // Handle cases where themeMode might be an object or undefined
    let mode = 'light'; // default
    
    if (typeof themeMode === 'string') {
      mode = themeMode;
    } else if (themeMode && typeof themeMode === 'object') {
      // If it's an object, try to extract the value
      mode = themeMode.value || themeMode.theme || 'light';
    }
    
    console.log('Using theme mode:', mode);
    return getTheme(mode);
  }, [themeMode]);

  const routes = useRoutes(appRoutes);

  return (
    <ThemeProvider theme={theme}>
      <StateBootstrap />
      <CssBaseline />
      {routes}
    </ThemeProvider>
  );
}