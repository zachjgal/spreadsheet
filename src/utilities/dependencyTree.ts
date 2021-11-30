// class that stores dependencies between cells

export class DependencyTree {
  private graph: Map<string, Set<string>>;

  constructor() {
    this.graph = new Map<string, Set<string>>();
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
      if (
        (this.graph.get(node.toString()) as Set<string>).has(
          dependency.toString()
        )
      ) {
        throw new Error(`Circular reference between ${node} and ${dependency}`);
      }
    }
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
