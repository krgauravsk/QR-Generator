import { useCallback, useState, useMemo } from "react";
import {
  styled,
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "styled-components";
import Toggle from "./Toggle";
import { useDarkMode } from "./UseDarkMode";
import { lightTheme, darkTheme } from "./Theme";
import { GlobalStyles } from "./Global";
import "./styles.css";

// TextField with dynamic border colors
const DynamicTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: theme.textFieldBorder,
    },
    "&:hover fieldset": {
      borderColor: theme.textFieldHoverBorder,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.textFieldFocusBorder,
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.text,
  },
  "& .MuiInputBase-input": {
    color: theme.text,
  },
}));

function App() {
  const [inputValue, setInputValue] = useState("");
  const [qrConfig, setQrConfig] = useState({
    text: "",
    size: 310,
    bgColor: "ffffff",
  });

  const qrCodeUrl = useMemo(() => {
    if (!qrConfig.text) return "";
    return `http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrConfig.text
    )}&size=${qrConfig.size}x${qrConfig.size}&bgcolor=${qrConfig.bgColor}`;
  }, [qrConfig.text, qrConfig.size, qrConfig.bgColor]);

  const handleGenerate = useCallback(() => {
    if (inputValue.trim()) {
      setQrConfig((prev) => ({ ...prev, text: inputValue }));
    }
  }, [inputValue]);

  const handleConfigChange = useCallback((field, value) => {
    setQrConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const [theme, toggleTheme, componentMounted] = useDarkMode();
  const themeMode = theme === "light" ? lightTheme : darkTheme;

  // MUI theme for proper theme propagation
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: { main: themeMode.textFieldFocusBorder },
          text: { primary: themeMode.text },
        },
      }),
    [theme, themeMode]
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider theme={themeMode}>
        <GlobalStyles />
        <div className="App">
          <div className="header-container">
            <div className="header-text">QR Code Generator</div>

            <div className="toggle-container">
              <Toggle
                className="toggle"
                theme={theme}
                toggleTheme={toggleTheme}
              />
              <h4>
                It's a {theme === "light" ? "light theme" : "dark theme"}!
              </h4>
            </div>
          </div>

          <div className="input-box">
            <div className="text-field-generate-container">
              <DynamicTextField
                id="outlined-basic"
                label="Enter text to encode"
                className="text-field"
                variant="outlined"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputValue.trim()) {
                    handleGenerate();
                  }
                }}
                fullWidth
              />
              <button
                className="button third"
                onClick={handleGenerate}
                disabled={!inputValue.trim()}
              >
                Generate
              </button>
            </div>

            <div className="background-dimension-container">
              <h5>Background Color:</h5>
              <input
                type="color"
                onChange={(e) =>
                  handleConfigChange("bgColor", e.target.value.substring(1))
                }
                aria-label="Select background color"
              />
              <h5>Dimension: {qrConfig.size}px</h5>
              <input
                type="range"
                min="200"
                max="600"
                value={qrConfig.size}
                onChange={(e) =>
                  handleConfigChange("size", parseInt(e.target.value))
                }
                aria-label="Adjust QR code size"
              />
            </div>
          </div>

          {qrCodeUrl && (
            <div className="qr-code-download-container">
              <img
                src={qrCodeUrl}
                alt={`QR code for ${qrConfig.text}`}
                width={qrConfig.size}
                height={qrConfig.size}
              />
              <a href={qrCodeUrl} download="QRCode">
                <button type="button">Download</button>
              </a>
            </div>
          )}
        </div>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
