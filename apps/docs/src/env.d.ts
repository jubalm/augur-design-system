declare module "*?raw" {
  /** Raw file contents, imported at build time (Vite `?raw`). */
  const content: string;
  export default content;
}
