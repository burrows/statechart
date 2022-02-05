import Node from './Node';

describe('Node#root', () => {
  it('returns the root node', () => {
    const a = new Node('a', s => {
      s.state('b', s => {
        s.state('c');
      });
    });
    const b = a.children[0];
    const c = b.children[0];

    expect(a.root).toBe(a);
    expect(b.root).toBe(a);
    expect(c.root).toBe(a);
  });
});

describe('Node#ancestors', () => {
  it('returns a list of ancestor nodes', () => {
    const a = new Node('a', s => {
      s.state('b', s => {
        s.state('c');
      });
    });
    const b = a.children[0];
    const c = b.children[0];

    expect(a.ancestors).toEqual([]);
    expect(b.ancestors).toEqual([a]);
    expect(c.ancestors).toEqual([b, a]);
  });
});

describe('Node#path', () => {
  it('returns the path to the node', () => {
    const a = new Node('a', s => {
      s.state('b');
      s.state('c');
    });

    expect(a.path).toBe('/a');
    expect(a.children[0].path).toBe('/a/b');
    expect(a.children[1].path).toBe('/a/c');
  });
});
