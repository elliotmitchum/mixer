import { useState } from 'react'
import mixbox from 'mixbox'
import './App.css'

const black = "#000000"

// Helper function to convert hex to RGB array
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ]
    : null
}

// Helper function to convert RGB array to hex
function rgbToHex(rgb: number[]): string {
  return `#${ rgb
    .map((x) => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('') }`
}

// Helper function to validate hex color
function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
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
  const [colorA, setColorA] = useState('')
  const [colorB, setColorB] = useState('')

  const isValidA = isValidHex(colorA)
  const isValidB = isValidHex(colorB)
  const bothValid = isValidA && isValidB

  // Define the 6 grids
  const gridConfigs: GridConfig[] = bothValid
    ? [
      {
        title: 'CA = User A, CB = User B, CC = White',
        ca: colorA,
        cb: colorB,
        cc: '#FFFFFF'
      },
      {
        title: 'CA = User A, CB = User B, CC = Black',
        ca: colorA,
        cb: colorB,
        cc: black
      },
      {
        title: 'CA = User A, CB = Black, CC = White',
        ca: colorA,
        cb: black,
        cc: '#FFFFFF'
      },
      {
        title: 'CA = User B, CB = Black, CC = White',
        ca: colorB,
        cb: black,
        cc: '#FFFFFF'
      },
    ]
    : []

  // Column ratios: CA, CA:CB 2:1, CA:CB 1:1, CA:CB 1:2, CB
  const columnRatios = [0.0, 1.0 / 3.0, 0.5, 2.0 / 3.0, 1.0]

  // Row ratios: 100%, 75%, 50%, 25%, 5% (amount of CC)
  const rowRatios = [0.0, 0.25, 0.5, 0.75, 0.95]

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
    const caRgb = hexToRgb(caHex)
    const cbRgb = hexToRgb(cbHex)
    const ccRgb = hexToRgb(ccHex)

    if (!caRgb || !cbRgb || !ccRgb) return black

    // First mix CA and CB based on column ratio
    let abMix = mixbox.lerp(caRgb, cbRgb, colRatio)
    if (!abMix) return black

    if (cdHex) {
      const cdRatio = cdStart - rowRatio > 0 ? (cdStart - rowRatio) * 0.6 : 0
      const cdRgb = hexToRgb(cdHex)
      if (!cdRgb) return black
      abMix = mixbox.lerp(abMix, cdRgb, cdRatio)
      if (!abMix) return black
    }

    // Then mix the result with CC based on row ratio
    const finalMix = mixbox.lerp(abMix, ccRgb, rowRatio)
    if (!finalMix) return black

    return rgbToHex(finalMix)
  }

  return (
    <div className="app">
      <h1>Color Mixer</h1>
      <div className="inputs">
        <div className="input-group">
          <label htmlFor="colorA">Colour A:</label>
          <input
            id="colorA"
            type="text"
            value={ colorA }
            onChange={ (e) => setColorA(e.target.value) }
            placeholder="#RRGGBB"
            className={ colorA && !isValidA ? 'invalid' : '' }
          />
        </div>
        <div className="input-group">
          <label htmlFor="colorB">Colour B:</label>
          <input
            id="colorB"
            type="text"
            value={ colorB }
            onChange={ (e) => setColorB(e.target.value) }
            placeholder="#RRGGBB"
            className={ colorB && !isValidB ? 'invalid' : '' }
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
                      { rowIndex === 0
                        ? '100%'
                        : rowIndex === 1
                          ? '75%'
                          : rowIndex === 2
                            ? '50%'
                            : rowIndex === 3
                              ? '25%'
                              : '5%' }
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
                      )
                      return (
                        <td key={ colIndex }>
                          <div
                            className="swatch"
                            style={ { backgroundColor: color } }
                            title={ color }
                          />
                        </td>
                      )
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
  )
}

export default App
