// Visuals for project cards and project pages.
//
// Every visual follows the same rules so the grid feels like one system:
// - It plays on its own while it is on screen (slowly), and the pointer takes over on hover.
// - A caption chip (bottom-left) says what you are looking at; a hint chip (top-right) says
//   what the pointer does.
// - Real results are shown where we have them (compare sliders, scrubbable footage).
//   Projects without footage get a small canvas that animates the actual method.

const V = '/assets/viz';

export type Layer = { src: string; label: string };

export type Viz =
  | { kind: 'compare'; caption: string; hint: string; a: Layer; b: Layer[]; fit?: 'cover' | 'contain'; tone?: 'dark' | 'light' }
  // fit 'contain' shows the whole frame; chips 'top' moves the chips to the top corners so they
  // do not cover content near the bottom of the footage.
  | { kind: 'video'; caption: string; hint: string; src: string; poster: string; scrub?: boolean; fit?: 'cover' | 'contain'; chips?: 'top' }
  | { kind: 'frames'; caption: string; hint: string; sprite: string; frames: number; size: number; from: string; to: string }
  | { kind: 'canvas'; caption: string; hint: string; scene: string };

export const VIZ: Record<string, Viz> = {
  // Real results ----------------------------------------------------------
  normals: {
    kind: 'compare', caption: 'Normal map · detail', hint: 'Move to compare', tone: 'light', fit: 'contain',
    a: { src: `${V}/2dgs_zoom_ours.webp`, label: 'Ours' },
    b: [
      { src: `${V}/2dgs_zoom_gsir.webp`, label: 'GS-IR' },
      { src: `${V}/2dgs_zoom_ref.webp`, label: 'Reference' },
    ],
  },
  saturation: {
    kind: 'compare', caption: 'Recovery under saturation', hint: 'Move to compare', fit: 'contain', tone: 'light',
    a: { src: `${V}/sat_lm.webp`, label: 'LM (ours)' },
    b: [
      { src: `${V}/sat_csc.webp`, label: 'CSC' },
      { src: `${V}/sat_si.webp`, label: 'SI' },
      { src: `${V}/sat_original.webp`, label: 'Original' },
    ],
  },
  tomography: {
    kind: 'compare', caption: 'CT reconstruction', hint: 'Move to compare', fit: 'contain',
    a: { src: `${V}/lspd_lspd.webp`, label: 'LSPD (ours)' },
    b: [
      { src: `${V}/lspd_nesterov.webp`, label: 'Nesterov' },
      { src: `${V}/lspd_lpd.webp`, label: 'LPD' },
      { src: `${V}/lspd_truth.webp`, label: 'Ground truth' },
    ],
  },
  colorize: {
    kind: 'compare', caption: 'pix2pix colorization', hint: 'Move to compare',
    a: { src: `${V}/color_color.webp`, label: 'Colorized' },
    b: [{ src: `${V}/color_gray.webp`, label: 'Grayscale input' }],
  },
  rpca: {
    kind: 'compare', caption: 'M = L + S', hint: 'Move to separate',
    a: { src: `${V}/lrmr_frame.webp`, label: 'Video frame' },
    b: [
      { src: `${V}/lrmr_lowrank.webp`, label: 'Low-rank background' },
      { src: `${V}/lrmr_sparse.webp`, label: 'Sparse foreground' },
    ],
  },
  unet: {
    kind: 'compare', caption: 'Predicted instance mask', hint: 'Move to reveal', fit: 'contain',
    a: { src: `${V}/unet_mask.webp`, label: 'U-Net mask' },
    b: [{ src: `${V}/unet_input.webp`, label: 'Input' }],
  },
  slam: {
    kind: 'video', caption: 'Dense 3D reconstruction', hint: 'Move to orbit', scrub: true,
    src: `${V}/homerobot.mp4`, poster: `${V}/homerobot_poster.webp`,
  },
  keyboard: {
    // The typed text (bottom) and detected key (top) are the point of this clip: show the full frame.
    kind: 'video', caption: 'Paper keyboard · live camera', hint: 'Move to scrub', scrub: true, fit: 'contain', chips: 'top',
    src: `${V}/virtual_keyboard.mp4`, poster: `${V}/virtual_keyboard_poster.webp`,
  },
  diffusion: {
    kind: 'frames', caption: 'Reverse diffusion', hint: 'Move to denoise',
    sprite: `${V}/diffusion_sprite.webp`, frames: 21, size: 200, from: 'Noise', to: 'Image',
  },

  // Method animations ------------------------------------------------------
  mathprompter: { kind: 'canvas', scene: 'mathprompter', caption: 'Abstract → generate → verify', hint: 'Hover to slow down' },
  yolo: { kind: 'canvas', scene: 'yolo', caption: 'IoU: prediction vs ground truth', hint: 'Move the prediction' },
  permutation: { kind: 'canvas', scene: 'permutation', caption: 'Detecting swapped measurements', hint: 'Move to swap a pair' },
  quantum: { kind: 'canvas', scene: 'quantum', caption: "Wiesner's quantum money", hint: 'Move to measure a qubit' },
  recipes: { kind: 'canvas', scene: 'recipes', caption: 'Sparse user × recipe ratings', hint: 'Move to inspect' },
  stocks: { kind: 'canvas', scene: 'stocks', caption: 'Candlesticks · SMA 9 / 21', hint: 'Move for OHLC' },
  journal: { kind: 'canvas', scene: 'journal', caption: 'TODOs → today’s journal', hint: 'Hover to slow down' },
  navicane: { kind: 'canvas', scene: 'navicane', caption: 'Depth sensing · haptic guidance', hint: 'Move to probe distance' },
  sudoku: { kind: 'canvas', scene: 'sudoku', caption: 'AlexNet digits · registered overlay', hint: 'Move to tilt the board' },
  learningAgents: { kind: 'canvas', scene: 'bandits', caption: 'Beta posteriors · live regret', hint: 'Move to inspect an arm' },
};
