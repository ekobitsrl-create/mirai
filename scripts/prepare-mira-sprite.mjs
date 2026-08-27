import process from "node:process"
import sharp from "sharp"

const [inputPath, outputPath] = process.argv.slice(2)

if (!inputPath || !outputPath) {
  throw new Error("Uso: node scripts/prepare-mira-sprite.mjs <input.png> <output.webp>")
}

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { width, height, channels } = info
const pixelCount = width * height
const background = new Uint8Array(pixelCount)
const queue = new Int32Array(pixelCount)
let queueStart = 0
let queueEnd = 0

function isBackground(pixelIndex, minimum = 198, spread = 34) {
  const offset = pixelIndex * channels
  const red = data[offset]
  const green = data[offset + 1]
  const blue = data[offset + 2]
  return Math.min(red, green, blue) >= minimum
    && Math.max(red, green, blue) - Math.min(red, green, blue) <= spread
}

function enqueue(pixelIndex) {
  if (background[pixelIndex] || !isBackground(pixelIndex)) return
  background[pixelIndex] = 1
  queue[queueEnd] = pixelIndex
  queueEnd += 1
}

for (let x = 0; x < width; x += 1) {
  enqueue(x)
  enqueue((height - 1) * width + x)
}
for (let y = 0; y < height; y += 1) {
  enqueue(y * width)
  enqueue(y * width + width - 1)
}

while (queueStart < queueEnd) {
  const pixelIndex = queue[queueStart]
  queueStart += 1
  const x = pixelIndex % width
  const y = Math.floor(pixelIndex / width)
  if (x > 0) enqueue(pixelIndex - 1)
  if (x + 1 < width) enqueue(pixelIndex + 1)
  if (y > 0) enqueue(pixelIndex - width)
  if (y + 1 < height) enqueue(pixelIndex + width)
}

for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
  if (!background[pixelIndex]) continue
  data[pixelIndex * channels + 3] = 0
}

// Feather only pale neutral pixels touching the extracted background. This
// removes the generated checkerboard halo while preserving enclosed highlights.
const feather = new Uint8Array(background)
for (let pass = 0; pass < 4; pass += 1) {
  const next = new Uint8Array(feather)
  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (feather[pixelIndex]) continue
    const x = pixelIndex % width
    const y = Math.floor(pixelIndex / width)
    const touchesBackground = (x > 0 && feather[pixelIndex - 1])
      || (x + 1 < width && feather[pixelIndex + 1])
      || (y > 0 && feather[pixelIndex - width])
      || (y + 1 < height && feather[pixelIndex + width])
    if (!touchesBackground || !isBackground(pixelIndex, 178, 44)) continue

    const offset = pixelIndex * channels
    const minimum = Math.min(data[offset], data[offset + 1], data[offset + 2])
    data[offset + 3] = Math.max(0, Math.min(255, Math.round((205 - minimum) * 9.45)))
    next[pixelIndex] = 1
  }
  feather.set(next)
}

await sharp(data, { raw: { width, height, channels } })
  .webp({ quality: 92, alphaQuality: 100, smartSubsample: true })
  .toFile(outputPath)

console.log(`${outputPath}: ${width}x${height}, ${queueEnd} background pixels removed`)
