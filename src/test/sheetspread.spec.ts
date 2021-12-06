import { expect, assert } from "chai";
import { DependencyTree } from "../utilities/dependencyTree";
import { CircularReferenceError } from "../utilities/errors";

describe("Test for adding dependency and hascell functions", () => {
  const dependencyTree = new DependencyTree();
  const coords1: Coords = [1, 1];
  const coords2: Coords = [2, 2];
  const coords3: Coords = [3, 3];
  const coords4: Coords = [4, 4];
  const coords5: Coords = [5, 5];
  const coords6: Coords = [6, 6];
  const coordSet1: Set<Coords> = new Set<Coords>();
  const coordSet2: Set<Coords> = new Set<Coords>();
  const coordSet3: Set<Coords> = new Set<Coords>();
  const coordSet4: Set<Coords> = new Set<Coords>();

  dependencyTree.addDependencies(coords1, coordSet1);
  it("checking simple addDepencies function to dependency tree ", () => {
    expect(dependencyTree.hasCell(coords1)).equals(true);
  });

  it("checking simple addDepencies function to dependency tree ", () => {
    dependencyTree.addDependencies(coords2, coordSet2);
    expect(dependencyTree.hasCell(coords2)).equals(true);
  });

  it("checking simple addDepencies function to dependency tree ", () => {
    dependencyTree.addDependencies(coords3, coordSet3);
    expect(dependencyTree.hasCell(coords3)).equals(true);
  });

  it("checking simple addDepencies function to dependency tree ", () => {
    dependencyTree.addDependencies(coords4, coordSet4);
    expect(dependencyTree.hasCell(coords4)).equals(true);
  });

  it("checking simple addDepencies function to dependency tree when there is not coords", () => {
    expect(dependencyTree.hasCell(coords1)).equals(true);
    expect(dependencyTree.hasCell(coords5)).equals(false);
    expect(dependencyTree.hasCell(coords6)).equals(false);
  });
});

describe("Test for visitNode", () => {
  const dependencyTree = new DependencyTree();
  const coords1: Coords = [1, 1];
  const coords2: Coords = [1, 2];
  const coordSet: Set<Coords> = new Set<Coords>();
  const visitSet: Set<string> = new Set<string>();
  const stack: Array<string> = new Array<string>();

  it("checking simple graphHasPath function to dependency tree in case of 1 ", () => {
    dependencyTree.addDependencies(coords1, coordSet);
    dependencyTree.visitNode("1,1", visitSet, stack);
    expect(stack.length).equals(1);
    dependencyTree.addDependencies(coords2, coordSet);
    dependencyTree.visitNode("1,2", visitSet, stack);
    expect(stack.length).equals(2);
  });
});

describe("Test for toString", () => {
  const dependencyTree = new DependencyTree();
  const coords1: Coords = [1, 1];
  const coords2: Coords = [2, 2];
  const coords3: Coords = [3, 3];
  const coords4: Coords = [4, 4];
  const coords5: Coords = [5, 5];
  const coordSet: Set<Coords> = new Set<Coords>();

  it("checking simple toString function to dependency tree without dependency ", () => {
    dependencyTree.addDependencies(coords1, coordSet);
    dependencyTree.addDependencies(coords2, coordSet);
    dependencyTree.addDependencies(coords3, coordSet);
    dependencyTree.addDependencies(coords4, coordSet);
    dependencyTree.addDependencies(coords5, coordSet);
    expect(dependencyTree.toString()).equals(
      `{"1,1":[],"2,2":[],"3,3":[],"4,4":[],"5,5":[]}`
    );
  });

  it("checking simple toString function to dependency tree with dependency ", () => {
    coordSet.add(coords2);
    dependencyTree.addDependencies(coords1, coordSet);
    expect(dependencyTree.toString()).equals(
      `{"1,1":[],"2,2":["1,1"],"3,3":[],"4,4":[],"5,5":[]}`
    );
    coordSet.add(coords3);
    dependencyTree.addDependencies(coords4, coordSet);
    expect(dependencyTree.toString()).equals(
      `{"1,1":[],"2,2":["1,1","4,4"],"3,3":["4,4"],"4,4":[],"5,5":[]}`
    );
  });
});

describe("Test for Circular ReferenceError", () => {
  const dependencyTree = new DependencyTree();
  const coords1: Coords = [1, 1];
  const coordSet: Set<Coords> = new Set<Coords>();
  const coords2: Coords = [2, 2];
  const coordSet2: Set<Coords> = new Set<Coords>();
  it("checking circular dependency error", () => {
    coordSet.add(coords1);
    assert.throw(
      () => dependencyTree.addDependencies(coords1, coordSet),
      CircularReferenceError,
      ""
    );
  });

  it("checking circular dependency error", () => {
    coordSet.add(coords1);
    dependencyTree.addDependencies(coords2, coordSet);
    coordSet2.add(coords2);
    assert.throw(
      () => dependencyTree.addDependencies(coords1, coordSet),
      CircularReferenceError,
      ""
    );
  });
});

describe("Test for topologicalSort", () => {
  const dependencyTree = new DependencyTree();
  const coords1: Coords = [1, 1];
  const coords2: Coords = [2, 2];
  const coords3: Coords = [3, 3];
  const coords4: Coords = [4, 4];
  const coordSet: Set<Coords> = new Set<Coords>();

  it("checking simple topologicalSort function to dependency tree ", () => {
    coordSet.add(coords2);
    dependencyTree.addDependencies(coords1, coordSet);
    coordSet.add(coords3);
    dependencyTree.addDependencies(coords4, coordSet);
    dependencyTree.topologicalSort(coords1);
    expect(dependencyTree.toString()).equals(
      `{"1,1":[],"2,2":["1,1","4,4"],"4,4":[],"3,3":["4,4"]}`
    );
  });
});

describe("Test for remapNodeCoordinates", () => {
  const dependencyTree = new DependencyTree();
  const coords1: Coords = [1, 1];
  const coords2: Coords = [2, 2];
  const coords3: Coords = [3, 3];
  const coords4: Coords = [4, 4];
  const coordSet: Set<Coords> = new Set<Coords>();
  const coordSet2: Set<Coords> = new Set<Coords>();

  it("checking simple remapNodeCoordinates function after topological sort to dependency tree ", () => {
    coordSet.add(coords2);
    dependencyTree.addDependencies(coords1, coordSet);
    coordSet.add(coords3);
    dependencyTree.addDependencies(coords4, coordSet);
    dependencyTree.topologicalSort(coords1);
    dependencyTree.remapNodeCoordinates(coords1, coords2);
    expect(dependencyTree.toString()).equals(
      `{"2,2":[],"4,4":[],"3,3":["4,4"]}`
    );
  });

  it("checking simple remapNodeCoordinates function to dependency tree ", () => {
    coordSet.add(coords2);
    dependencyTree.addDependencies(coords1, coordSet);
    coordSet.add(coords3);
    dependencyTree.addDependencies(coords4, coordSet);
    dependencyTree.remapNodeCoordinates(coords1, coords2);
    expect(dependencyTree.toString()).equals(
      `{"2,2":[],"4,4":[],"3,3":["4,4","2,2"]}`
    );
  });

  it("checking simple remapNodeCoordinates function to dependency tree ", () => {
    coordSet.add(coords2);
    dependencyTree.addDependencies(coords1, coordSet);
    coordSet2.add(coords3);
    dependencyTree.addDependencies(coords4, coordSet2);
    dependencyTree.remapNodeCoordinates(coords1, coords4);
    expect(dependencyTree.toString()).equals(
      `{"2,2":["4,4"],"4,4":[],"3,3":["4,4","2,2"]}`
    );
  });
});
