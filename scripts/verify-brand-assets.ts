import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, normalize } from "node:path";

interface BrandAssetRecord {
  path: string;
  width: number;
  height: number;
  sha256: string;
}

interface BrandAssetManifest {
  source: string;
  sourceSha256: string;
  assets: BrandAssetRecord[];
}

const root = process.cwd();
const manifestPath = join(root, "resources/brand/assets/manifest.json");
const sourceRoot = join(root, "resources/brand/assets");
const publicRoot = join(root, "apps/docs/public/brand");

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function pngDimensions(buffer: Buffer): { width: number; height: number } {
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) {
    throw new Error("not a valid PNG");
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function fail(message: string): never {
  throw new Error(`[brand-assets] ${message}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as BrandAssetManifest;

if (!Array.isArray(manifest.assets) || manifest.assets.length !== 13) {
  fail(`expected 13 manifest assets, found ${manifest.assets?.length ?? 0}`);
}

const sourcePdfPath = join(root, manifest.source);
if (!existsSync(sourcePdfPath)) {
  fail(`missing source PDF: ${manifest.source}`);
}

const sourcePdfHash = sha256(readFileSync(sourcePdfPath));
if (sourcePdfHash !== manifest.sourceSha256) {
  fail(`source PDF hash mismatch: expected ${manifest.sourceSha256}, got ${sourcePdfHash}`);
}

const seen = new Set<string>();

for (const asset of manifest.assets) {
  const relative = normalize(asset.path).replaceAll("\\", "/");
  if (relative.startsWith("../") || relative.startsWith("/")) {
    fail(`invalid manifest path: ${asset.path}`);
  }
  if (seen.has(relative)) {
    fail(`duplicate manifest path: ${asset.path}`);
  }
  seen.add(relative);

  const sourcePath = join(sourceRoot, relative);
  const publicPath = join(publicRoot, relative);

  if (!existsSync(sourcePath)) fail(`missing source asset: ${asset.path}`);
  if (!existsSync(publicPath)) fail(`missing docs asset: ${asset.path}`);

  const source = readFileSync(sourcePath);
  const docs = readFileSync(publicPath);
  const sourceHash = sha256(source);
  const docsHash = sha256(docs);

  if (sourceHash !== asset.sha256) {
    fail(`${asset.path} source hash mismatch: expected ${asset.sha256}, got ${sourceHash}`);
  }
  if (docsHash !== asset.sha256) {
    fail(`${asset.path} docs hash mismatch: expected ${asset.sha256}, got ${docsHash}`);
  }
  if (!source.equals(docs)) {
    fail(`${asset.path} source/docs copies are not byte-identical`);
  }

  const dimensions = pngDimensions(source);
  if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
    fail(
      `${asset.path} dimensions mismatch: expected ${asset.width}x${asset.height}, got ${dimensions.width}x${dimensions.height}`,
    );
  }
}

console.log(`[brand-assets] verified ${manifest.assets.length} assets, manifest hashes, dimensions, source PDF, and docs copies`);

// Approved icon set (issue #100): published augur.net originals kept
// byte-identical, with their own manifest because they are not PDF
// extractions.
interface IconAssetRecord extends BrandAssetRecord {
  type: "svg" | "png";
  sourceUrl: string;
}

const iconManifestPath = join(sourceRoot, "icon/manifest.json");
const iconManifest = JSON.parse(readFileSync(iconManifestPath, "utf8")) as { assets: IconAssetRecord[] };
if (!Array.isArray(iconManifest.assets) || iconManifest.assets.length !== 3) {
  fail(`expected 3 icon assets, found ${iconManifest.assets?.length ?? 0}`);
}

for (const asset of iconManifest.assets) {
  const relative = normalize(asset.path).replaceAll("\\", "/");
  if (relative.includes("/") || relative.startsWith(".")) fail(`invalid icon path: ${asset.path}`);
  const sourcePath = join(sourceRoot, "icon", relative);
  const publicPath = join(publicRoot, "icon", relative);
  if (!existsSync(sourcePath)) fail(`missing source icon: ${asset.path}`);
  if (!existsSync(publicPath)) fail(`missing docs icon: ${asset.path}`);

  const source = readFileSync(sourcePath);
  const docs = readFileSync(publicPath);
  if (sha256(source) !== asset.sha256) fail(`icon/${asset.path} source hash mismatch`);
  if (!source.equals(docs)) fail(`icon/${asset.path} source/docs copies are not byte-identical`);

  if (asset.type === "png") {
    const dimensions = pngDimensions(source);
    if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
      fail(`icon/${asset.path} dimensions mismatch: got ${dimensions.width}x${dimensions.height}`);
    }
  } else {
    const svg = source.toString("utf8");
    if (!svg.includes(`viewBox="0 0 ${asset.width} ${asset.height}"`)) fail(`icon/${asset.path} viewBox mismatch`);
  }
}

console.log(`[brand-assets] verified ${iconManifest.assets.length} approved icon assets and docs copies`);
