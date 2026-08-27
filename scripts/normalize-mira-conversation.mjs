import process from "node:process"
import sharp from "sharp"

const [inputPath, outputPath] = process.argv.slice(2)

if (!inputPath || !outputPath) {
  throw new Error("Uso: node scripts/normalize-mira-conversation.mjs <input.webp> <output.webp>")
}

const columns = 7
const rows = 2
const source = sharp(inputPath)
const metadata = await source.metadata()

if (!metadata.width || !metadata.height) {
  throw new Error(`Impossibile leggere le dimensioni di ${inputPath}`)
}

const cellWidth = 384
const cellHeight = 448
const contentWidth = 300
const contentHeight = 420
const composites = []

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

function isCharacterPixel(x, y) {
  const offset = (y * info.width + x) * info.channels
  const alpha = data[offset + 3]
  const brightness = (data[offset] + data[offset + 1] + data[offset + 2]) / 3
  return alpha > 24 && brightness < 185
}

function projection(axis, start, end) {
  const length = axis === "x" ? info.width : info.height
  const values = new Uint32Array(length)
  for (let y = axis === "x" ? start : 0; y < (axis === "x" ? end : info.height); y += 1) {
    for (let x = axis === "x" ? 0 : start; x < (axis === "x" ? info.width : end); x += 1) {
      if (isCharacterPixel(x, y)) values[axis === "x" ? x : y] += 1
    }
  }
  return values
}

function findRuns(values, threshold, minimumWidth) {
  const runs = []
  let start = -1
  for (let index = 0; index <= values.length; index += 1) {
    if (index < values.length && values[index] >= threshold) {
      if (start < 0) start = index
    } else if (start >= 0) {
      if (index - start >= minimumWidth) runs.push({ start, end: index })
      start = -1
    }
  }
  return runs
}

const yProjection = projection("y", 0, info.width)
const splitStart = Math.floor(info.height * 0.38)
const splitEnd = Math.floor(info.height * 0.62)
let rowSplit = splitStart
for (let y = splitStart + 1; y < splitEnd; y += 1) {
  if (yProjection[y] < yProjection[rowSplit]) rowSplit = y
}

const rowRanges = [
  { top: 0, bottom: rowSplit },
  { top: rowSplit, bottom: info.height },
]

async function cleanFrame(left, top, width, height) {
  const extracted = await sharp(inputPath)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const pixels = extracted.data
  const frameInfo = extracted.info
  const pixelCount = frameInfo.width * frameInfo.height
  const distance = new Uint8Array(pixelCount).fill(255)
  const queue = new Int32Array(pixelCount)
  let queueStart = 0
  let queueEnd = 0

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const offset = pixelIndex * frameInfo.channels
    const alpha = pixels[offset + 3]
    const red = pixels[offset]
    const green = pixels[offset + 1]
    const blue = pixels[offset + 2]
    const brightness = (red + green + blue) / 3
    const spread = Math.max(red, green, blue) - Math.min(red, green, blue)
    if (alpha > 24 && (brightness < 178 || spread > 44)) {
      distance[pixelIndex] = 0
      queue[queueEnd] = pixelIndex
      queueEnd += 1
    }
  }

  while (queueStart < queueEnd) {
    const pixelIndex = queue[queueStart]
    queueStart += 1
    const nextDistance = distance[pixelIndex] + 1
    if (nextDistance > 8) continue
    const x = pixelIndex % frameInfo.width
    const y = Math.floor(pixelIndex / frameInfo.width)
    const neighbours = []
    if (x > 0) neighbours.push(pixelIndex - 1)
    if (x + 1 < frameInfo.width) neighbours.push(pixelIndex + 1)
    if (y > 0) neighbours.push(pixelIndex - frameInfo.width)
    if (y + 1 < frameInfo.height) neighbours.push(pixelIndex + frameInfo.width)
    for (const neighbour of neighbours) {
      if (distance[neighbour] <= nextDistance) continue
      distance[neighbour] = nextDistance
      queue[queueEnd] = neighbour
      queueEnd += 1
    }
  }

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (distance[pixelIndex] <= 8) continue
    pixels[pixelIndex * frameInfo.channels + 3] = 0
  }

  return sharp(pixels, {
    raw: {
      width: frameInfo.width,
      height: frameInfo.height,
      channels: frameInfo.channels,
    },
  }).png().toBuffer()
}

for (let row = 0; row < rows; row += 1) {
  const { top, bottom } = rowRanges[row]
  const xProjection = projection("x", top, bottom)
  const runs = findRuns(xProjection, 4, 45)

  if (runs.length !== columns) {
    throw new Error(`Rilevate ${runs.length} pose nella riga ${row + 1}, attese ${columns}`)
  }

  const boundaries = [0]
  for (let column = 1; column < columns; column += 1) {
    boundaries.push(Math.floor((runs[column - 1].end + runs[column].start) / 2))
  }
  boundaries.push(info.width)

  for (let column = 0; column < columns; column += 1) {
    const left = boundaries[column]
    const right = boundaries[column + 1]
    const cleanedFrame = await cleanFrame(left, top, right - left, bottom - top)
    const frame = await sharp(cleanedFrame)
      .resize(contentWidth, contentHeight, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer()

    composites.push({
      input: frame,
      left: column * cellWidth + Math.floor((cellWidth - contentWidth) / 2),
      top: row * cellHeight + cellHeight - contentHeight - 14,
    })
  }
}

await sharp({
  create: {
    width: columns * cellWidth,
    height: rows * cellHeight,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .webp({ quality: 92, alphaQuality: 100, smartSubsample: true })
  .toFile(outputPath)

console.log(`${outputPath}: ${columns}x${rows} frames, split at y=${rowSplit}, ${cellWidth}x${cellHeight}px per frame`)
