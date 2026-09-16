export interface PaneBox {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

type Tree =
  | { kind: 'leaf'; id: number }
  | { kind: 'split'; axis: 'x' | 'y'; ratio: number; first: Tree; second: Tree };

export type TerminalTree = Tree;

export function paneCount(width: number) {
  return width < 600 ? 8 : width < 1000 ? 11 : 14;
}

// Each split is shared by both neighbouring panels, including during a transition.
export function createTree(width: number, height: number, count = paneCount(width)): Tree {
  let nextId = 0;
  const split = (w: number, h: number, leaves: number, depth: number): Tree => {
    if (leaves === 1) return { kind: 'leaf', id: nextId++ };
    const axis = w / h > (depth % 2 ? 1.25 : 1.05) ? 'x' : 'y';
    const firstCount = Math.max(1, Math.min(leaves - 1, Math.round(leaves * (depth % 3 === 0 ? 0.4 : 0.5))));
    const ratio = firstCount / leaves + (depth % 2 ? 0.07 : -0.04);
    return {
      kind: 'split', axis, ratio,
      first: split(axis === 'x' ? w * ratio : w, axis === 'y' ? h * ratio : h, firstCount, depth + 1),
      second: split(axis === 'x' ? w * (1 - ratio) : w, axis === 'y' ? h * (1 - ratio) : h, leaves - firstCount, depth + 1),
    };
  };
  return split(width, height, count, 0);
}

function minimumTracks(tree: Tree): { width: number; height: number } {
  if (tree.kind === 'leaf') return { width: 1, height: 1 };
  const a = minimumTracks(tree.first);
  const b = minimumTracks(tree.second);
  return tree.axis === 'x'
    ? { width: a.width + b.width, height: Math.max(a.height, b.height) }
    : { width: Math.max(a.width, b.width), height: a.height + b.height };
}

function minimumCell(tree: Tree, width: number, height: number) {
  const tracks = minimumTracks(tree);
  return {
    width: Math.min(width < 600 ? 82 : 118, width / tracks.width * 0.72),
    height: Math.min(height < 500 ? 50 : 72, height / tracks.height * 0.72),
  };
}

function bounds(tree: Extract<Tree, { kind: 'split' }>, width: number, height: number, cell: { width: number; height: number }) {
  const a = minimumTracks(tree.first);
  const b = minimumTracks(tree.second);
  const size = tree.axis === 'x' ? width : height;
  const min = tree.axis === 'x' ? a.width * cell.width : a.height * cell.height;
  const max = tree.axis === 'x' ? b.width * cell.width : b.height * cell.height;
  return [min / size, 1 - max / size] as const;
}

export function layoutTree(tree: Tree, width: number, height: number): PaneBox[] {
  const cell = minimumCell(tree, width, height);
  const visit = (node: Tree, w: number, h: number, x: number, y: number): PaneBox[] => {
    if (node.kind === 'leaf') return [{ id: node.id, left: x, top: y, width: w, height: h }];
    const [min, max] = bounds(node, w, h, cell);
    const ratio = Math.max(min, Math.min(max, node.ratio));
    if (node.axis === 'x') {
      const split = w * ratio;
      return [...visit(node.first, split, h, x, y), ...visit(node.second, w - split, h, x + split, y)];
    }
    const split = h * ratio;
    return [...visit(node.first, w, split, x, y), ...visit(node.second, w, h - split, x, y + split)];
  };
  return visit(tree, width, height, 0, 0);
}

export function advanceTree(tree: Tree, width: number, height: number): Tree {
  const paths: string[] = [];
  const collect = (node: Tree, path: string) => {
    if (node.kind === 'leaf') return;
    paths.push(path);
    collect(node.first, path + 'a');
    collect(node.second, path + 'b');
  };
  collect(tree, '');
  const chosen = paths[Math.floor(Math.random() * paths.length)];
  const cell = minimumCell(tree, width, height);
  const visit = (node: Tree, w: number, h: number, path: string): Tree => {
    if (node.kind === 'leaf') return node;
    const [min, max] = bounds(node, w, h, cell);
    let ratio = Math.max(min, Math.min(max, node.ratio));
    if (path === chosen) {
      const next = min + Math.random() * (max - min);
      // Give each move a clear direction instead of barely perceptible jitter.
      ratio = Math.abs(next - ratio) < (max - min) * 0.25
        ? (ratio < (min + max) / 2 ? max : min)
        : next;
    }
    return {
      ...node, ratio,
      first: visit(node.first, node.axis === 'x' ? w * ratio : w, node.axis === 'y' ? h * ratio : h, path + 'a'),
      second: visit(node.second, node.axis === 'x' ? w * (1 - ratio) : w, node.axis === 'y' ? h * (1 - ratio) : h, path + 'b'),
    };
  };
  return visit(tree, width, height, '');
}
