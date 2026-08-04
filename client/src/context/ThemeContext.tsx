import React, { createContext, useContext, useEffect, useState } from "react";

export type AccentType = "lime" | "orange" | "violet";
export type ThemeType = "light" | "dark";

export interface AccentConfig {
  id: AccentType;
  name: string;
  hex: string;
  textColor: "text-black" | "text-white";
  textHex: string;
  glowRgb: string;
}

export const ACCENTS: Record<AccentType, AccentConfig> = {
  lime: {
    id: "lime",
    name: "Sun Glare / Canary",
    hex: "#CCFF00",
    textColor: "text-black",
    textHex: "#000000",
    glowRgb: "204, 255, 0",
  },
  orange: {
    id: "orange",
    name: "Exuberant Orange",
    hex: "#FF5528",
    textColor: "text-white",
    textHex: "#ffffff",
    glowRgb: "255, 85, 40",
  },
  violet: {
    id: "violet",
    name: "Blue Violet",
    hex: "#6355D8",
    textColor: "text-white",
    textHex: "#ffffff",
    glowRgb: "99, 85, 216",
  },
};

export const PRESET_BG_IMAGES = [
  {
    id: "preset1",
    name: "Dark Mesh",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "preset2",
    name: "Urban Glass",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80"
  }
];

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  accent: AccentType;
  setAccent: (accent: AccentType) => void;
  accentColor: string; // e.g. "#CCFF00"
  accentTextColor: "text-black" | "text-white";
  accentTextHex: string;
  accentConfig: AccentConfig;
  bgImage: string | null;
  setBgImage: (url: string | null) => void;
  removeBgImage: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    return (localStorage.getItem("app-theme") as ThemeType) || "dark";
  });

  const [accent, setAccentState] = useState<AccentType>(() => {
    const saved = localStorage.getItem("app-accent") as AccentType;
    return (saved && ACCENTS[saved]) ? saved : "lime";
  });

  const [bgImage, setBgImageState] = useState<string | null>(() => {
    return localStorage.getItem("app-bg-image") || null;
  });

  const setBgImage = (url: string | null) => {
    if (url) {
      setBgImageState(url);
      localStorage.setItem("app-bg-image", url);
    } else {
      removeBgImage();
    }
  };

  const removeBgImage = () => {
    setBgImageState(null);
    localStorage.removeItem("app-bg-image");
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem("app-theme", newTheme);
  };

  const setAccent = (newAccent: AccentType | string) => {
    let normalized: AccentType = "lime";
    if (newAccent === "orange") normalized = "orange";
    else if (newAccent === "violet" || newAccent === "purple") normalized = "violet";
    else if (newAccent === "lime" || newAccent === "yellow") normalized = "lime";

    setAccentState(normalized);
    localStorage.setItem("app-accent", normalized);
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = bgImage ? "transparent" : "#000000";
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = bgImage ? "transparent" : "#FFFFFF";
      document.body.style.color = "#000000";
    }
  }, [theme, bgImage]);

  useEffect(() => {
    document.documentElement.classList.remove("theme-lime", "theme-orange", "theme-violet");
    document.documentElement.classList.add(`theme-${accent}`);

    const config = ACCENTS[accent] || ACCENTS.lime;
    document.documentElement.style.setProperty("--accentColor", config.hex);
    document.documentElement.style.setProperty("--accent-color", config.hex);
    document.documentElement.style.setProperty("--accentTextColor", config.textHex);
    document.documentElement.style.setProperty("--accent-text-color", config.textHex);
    document.documentElement.style.setProperty("--accentGlowRgb", config.glowRgb);
    document.documentElement.style.setProperty("--accent-glow", `rgba(${config.glowRgb}, 0.35)`);
    document.documentElement.style.setProperty("--primary-color", config.hex);
    document.documentElement.style.setProperty("--primary-text", config.textHex);
  }, [accent]);

  const accentConfig = ACCENTS[accent] || ACCENTS.lime;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        accent,
        setAccent,
        accentColor: accentConfig.hex,
        accentTextColor: accentConfig.textColor,
        accentTextHex: accentConfig.textHex,
        accentConfig,
        bgImage,
        setBgImage,
        removeBgImage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
