import type { PackageJson } from '../types/package-json.js';
import { join } from './path.js';

interface Package {
  manifest: PackageJson;
  dir: string;
}

export type Graph = Record<string, Set<string>>;

const types = ['peerDependencies', 'devDependencies', 'optionalDependencies', 'dependencies'] as const;

export function createPkgGraph(
  cwd: string,
  wsNames: string[],
  wsPkgNames: Set<string>,
  byPkgName: Map<string, Package>,
  byName: Map<string, Package>
) {
  const graph: Graph = {};

  const getPkgDirs = (pkg: Package) => {
    const dirs = new Set<string>();
    for (const type of types) {
      if (pkg.manifest[type]) {
        for (const pkgName in pkg.manifest[type]) {
          if (wsPkgNames.has(pkgName)) {
            const workspace = byPkgName.get(pkgName);
            if (workspace) dirs.add(workspace.dir);
          }
        }
      }
    }
    return dirs;
  };

  for (const name of wsNames) {
    const pkg = byName.get(name);
    if (pkg) graph[join(cwd, name)] = getPkgDirs(pkg);
  }

  return graph;
}
