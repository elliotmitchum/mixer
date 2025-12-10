import { useState } from "react";
import mixbox from "mixbox";
import "./App.css";

const black = "#000000";
const white = "#ffffff";

const popularCombinations = {
  "": { name: "Custom", colorA: "", colorB: "" },
  "zorn": { name: "Zorn", colorA: "#CC9933", colorB: "#E30022" },
  "moonlight": { name: "Moonlight", colorA: "#003153", colorB: "#483C32" },
  "power": { name: "Power", colorA: "#E32636", colorB: "#40826D" },
  "blockbuster": { name: "Blockbuster", colorA: "#006064", colorB: "#F28C28" },
  "sorcerer": { name: "Sorcerer", colorA: "#4B0082", colorB: "#CC9933" },
  "botanical": { name: "Botanical", colorA: "#8E3A59", colorB: "#507d2a" }
};

// Helper function to convert hex to RGB array
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ]
    : null;
}

// Helper function to convert RGB array to hex
function rgbToHex(rgb: number[]): string {
  return `#${ rgb
    .map((x) => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("") }`;
}

// Helper function to validate hex color
function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

type GridConfig = {
  title: string;
  ca: string;
  cb: string;
  cc: string;
  cd?: string; // Optional CD color (opposite of CC)
  cdStart?: number;
};

function App() {
  const [colorA, setColorA] = useState("");
  const [colorB, setColorB] = useState("");
  const [preset, setPreset] = useState("");

  const isValidA = isValidHex(colorA);
  const isValidB = isValidHex(colorB);
  const bothValid = isValidA && isValidB;

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPreset = e.target.value;
    setPreset(selectedPreset);
    if (selectedPreset && popularCombinations[selectedPreset as keyof typeof popularCombinations]) {
      const combo = popularCombinations[selectedPreset as keyof typeof popularCombinations];
      setColorA(combo.colorA);
      setColorB(combo.colorB);
    }
  };

  // Define the 6 grids
  const gridConfigs: GridConfig[] = bothValid
    ? [
      {
        title: "CA = User A, CB = User B, CC = White",
        ca: colorA,
        cb: colorB,
        cc: white
      },
      {
        title: "CA = User A, CB = User B, CC = Black",
        ca: colorA,
        cb: colorB,
        cc: black
      },
      {
        title: "CA = User A, CB = Black, CC = White",
        ca: colorA,
        cb: black,
        cc: white
      },
      {
        title: "CA = User B, CB = Black, CC = White",
        ca: colorB,
        cb: black,
        cc: white
      }
    ]
    : [];

  // Column ratios: CA, CA:CB 2:1, CA:CB 1:1, CA:CB 1:2, CB
  const columnRatios = [0.0, 1.0 / 3.0, 0.5, 2.0 / 3.0, 1.0];

  // Row ratios: 0:1, 1:3, 1:2, 1:1, 2:1, 3:1 (CC:base ratio)
  const rowRatios = [0.0, 0.25, 1.0 / 3.0, 0.5, 2.0 / 3.0, 0.75];
  const rowLabels = ["0:1", "1:3", "1:2", "1:1", "2:1", "3:1"];

  // Calculate color for a cell
  function getCellColor(
    caHex: string,
    cbHex: string,
    ccHex: string,
    colRatio: number,
    rowRatio: number,
    cdHex?: string,
    cdStart?: number
  ): string {
    const caRgb = hexToRgb(caHex);
    const cbRgb = hexToRgb(cbHex);
    const ccRgb = hexToRgb(ccHex);

    if (!caRgb || !cbRgb || !ccRgb) return black;

    // First mix CA and CB based on column ratio
    let abMix = mixbox.lerp(caRgb, cbRgb, colRatio);
    if (!abMix) return black;

    if (cdHex && cdStart !== undefined) {
      const cdRatio = cdStart - rowRatio > 0 ? (cdStart - rowRatio) * 0.6 : 0;
      const cdRgb = hexToRgb(cdHex);
      if (!cdRgb) return black;
      abMix = mixbox.lerp(abMix, cdRgb, cdRatio);
      if (!abMix) return black;
    }

    // Then mix the result with CC based on row ratio
    const finalMix = mixbox.lerp(abMix, ccRgb, rowRatio);
    if (!finalMix) return black;

    return rgbToHex(finalMix);
  }

  return (
    <div className="app">
      <h1>Color Mixer</h1>
      <div className="inputs">
        <div className="input-group">
          <label htmlFor="preset">Preset:</label>
          <select
            id="preset"
            value={ preset }
            onChange={ handlePresetChange }
          >
            { Object.entries(popularCombinations).map(([key, combo]) => (
              <option key={ key } value={ key }>
                { combo.name }
              </option>
            )) }
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="colorA">Colour A:</label>
          <input
            id="colorA"
            type="text"
            value={ colorA }
            onChange={ (e) => {
              setColorA(e.target.value);
              setPreset("");
            } }
            placeholder="#RRGGBB"
            className={ colorA && !isValidA ? "invalid" : "" }
          />
        </div>
        <div className="input-group">
          <label htmlFor="colorB">Colour B:</label>
          <input
            id="colorB"
            type="text"
            value={ colorB }
            onChange={ (e) => {
              setColorB(e.target.value);
              setPreset("");
            } }
            placeholder="#RRGGBB"
            className={ colorB && !isValidB ? "invalid" : "" }
          />
        </div>
      </div>

      { bothValid && (
        <div className="grids-container">
          { gridConfigs.map((config, gridIndex) => (
            <div key={ gridIndex } className="grid-wrapper">
              <h2 className="grid-title">{ config.title }</h2>
              <table className="color-grid">
                <thead>
                <tr>
                  <th></th>
                  <th>CA</th>
                  <th>CA:CB 2:1</th>
                  <th>CA:CB 1:1</th>
                  <th>CA:CB 1:2</th>
                  <th>CB</th>
                </tr>
                </thead>
                <tbody>
                { rowRatios.map((rowRatio, rowIndex) => (
                  <tr key={ rowIndex }>
                    <td className="row-label">
                      { rowLabels[rowIndex] }
                    </td>
                    { columnRatios.map((colRatio, colIndex) => {
                      const color = getCellColor(
                        config.ca,
                        config.cb,
                        config.cc,
                        colRatio,
                        rowRatio,
                        config.cd,
                        config.cdStart
                      );
                      return (
                        <td key={ colIndex }>
                          <div
                            className="swatch"
                            style={ { backgroundColor: color } }
                            title={ color }
                          />
                        </td>
                      );
                    }) }
                  </tr>
                )) }
                </tbody>
              </table>
            </div>
          )) }
        </div>
      ) }
    </div>
  );
}

export default App;
