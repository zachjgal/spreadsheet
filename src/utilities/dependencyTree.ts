// class that stores dependencies between cells

import { CircularReferenceError } from "./errors";

export class DependencyTree {
  private graph: Map<string, Set<string>>;

  constructor() {
    this.graph = new Map<string, Set<string>>();
  }

  getGraph() {
    return this.graph;
  }

  toString() {
    return JSON.stringify(
      Object.fromEntries(
        Array.from(this.graph.entries()).map(([key, value]) => [
          key,
          Array.from(value),
        ])
      )
    );
  }

  remapNodeCoordinates(nodeStartCoords: Coords, nodeEndCoords: Coords) {
    const startCoordsKey = nodeStartCoords.toString();
    const endCoordsKey = nodeEndCoords.toString();
    for (let node of this.topologicalSort()) {
      const nodeDependencies = this.graph.get(node);
      // gets linter to shut up
      if (nodeDependencies === undefined) {
        throw new Error("missing node");
      }
      // remap key
      if (node === startCoordsKey) {
        this.graph.delete(node);
        this.graph.set(endCoordsKey, nodeDependencies as Set<string>);
      }
      // remap dependency entries
      if (nodeDependencies.has(startCoordsKey)) {
        nodeDependencies.delete(startCoordsKey);
        nodeDependencies.add(endCoordsKey);
      }
    }
  }

  addDependencies(node: Coords, dependencies: Set<Coords>) {
    // todo move initialization of node elsewhere
    if (!this.graph.has(node.toString())) {
      this.graph.set(node.toString(), new Set<string>());
    }

    for (let dependency of dependencies.values()) {
      let dependencyEntry = this.graph.get(dependency.toString());
      if (!dependencyEntry) {
        this.graph.set(dependency.toString(), new Set<string>());
      }
      (this.graph.get(dependency.toString()) as Set<string>).add(
        node.toString()
      );
      if (this.hasCycle(node.toString(), dependency.toString())) {
        throw new CircularReferenceError(node, dependency);
      }
    }
  }

  /*
   * In a directed acyclic graph, if there's a path from node A to node B,
   * and a path from node B to node A, you have a cycle
   */
  private hasCycle(node1: string, node2: string): boolean {
    return this.graphHasPath(node1, node2) && this.graphHasPath(node2, node1);
  }

  /*
   * Perform BFS starting at node1 until either a path to node2 is found,
   * in which case return true, or there are no more nodes to explore, in
   * which case return false.
   * */
  private graphHasPath(from: string, to: string): boolean {
    if (from === to) {
      return true;
    }
    let visited: Set<string> = new Set<string>();
    let queue: Array<string> = [];
    queue.push(from);

    while (queue.length > 0) {
      const node = queue.shift() as string;
      if (node === to) {
        return true;
      }
      visited.add(node);
      let adjacencies = this.graph.get(node) as Set<string>;
      for (let adjacentNode of adjacencies.values()) {
        if (!visited.has(adjacentNode)) {
          queue.push(adjacentNode);
        }
      }
    }
    return false;
  }

  hasCell(node: Coords): boolean {
    return this.graph.has(node.toString());
  }

  remove(node: Coords) {
    for (let n of this.graph.keys()) {
      if ((this.graph.get(n.toString()) as Set<string>).has(node.toString())) {
        (this.graph.get(n.toString()) as Set<string>).delete(node.toString());
      }
    }
  }

  visitNode(node: string, visited: Set<string>, stack: Array<string>) {
    visited.add(node);
    for (let child of (this.graph.get(node) as Set<string>).values()) {
      if (!visited.has(child)) {
        this.visitNode(child, visited, stack);
      }
    }
    stack.push(node);
  }

  topologicalSort(start?: Coords) {
    let visited: Set<string> = new Set<string>();
    let stack: Array<string> = new Array<string>();
    let universe: Array<string>;
    if (start) {
      if (!this.graph.has(start.toString())) {
        return [];
      }
      universe = new Array<string>();
      universe.push(start.toString());
    } else {
      universe = Array.from(this.graph.keys());
    }
    for (let node of universe) {
      if (!visited.has(node)) {
        this.visitNode(node, visited, stack);
      }
    }
    stack.reverse();
    return stack;
  }
}
