import Node from './Node';

describe('Node#root', () => {
  it('returns the root node', () => {
    const a = new Node('a', s => {
      s.state('b', s => {
        s.state('c');
      });
    });
    const b = a.children.b;
    const c = b.children.c;

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
    const b = a.children.b;
    const c = b.children.c;

    expect(a.ancestors).toEqual([]);
    expect(b.ancestors).toEqual([a]);
    expect(c.ancestors).toEqual([b, a]);
  });
});

describe('Node#path', () => {
  it('returns the path to the node', () => {
    const root = new Node('root', s => {
      s.state('a', s => {
        s.state('c');
      });
      s.state('b');
    });

    expect(root.path).toBe('/');
    expect(root.children.a.path).toBe('/a');
    expect(root.children.a.children.c.path).toBe('/a/c');
    expect(root.children.b.path).toBe('/b');
  });
});

describe('Node#resolve', () => {
  const root = new Node('root', s => {
    s.state('s', s => {
      s.state('s1', s => {
        s.state('s11');
        s.state('s12');
      });
      s.state('s2', s => {
        s.state('s21');
        s.state('s22');
      });
    });
  });
  const s = root.children.s;
  const s1 = s.children.s1;
  const s2 = s.children.s2;
  const s11 = s1.children.s11;
  const s12 = s1.children.s12;
  const s21 = s2.children.s21;
  const s22 = s2.children.s22;

  it('resolves the node at the given full path from the root node', () => {
    expect(root.resolve('/s')).toBe(s);
    expect(root.resolve('/s/s1')).toBe(s1);
    expect(root.resolve('/s/s2/s22')).toBe(s22);
  });

  it('resolves the node object at the given relative path from the root state', () => {
    expect(root.resolve('s')).toBe(s);
    expect(root.resolve('s/s1')).toBe(s1);
    expect(root.resolve('s/s1/../s2')).toBe(s2);
  });

  it('resolves the node object at the given full path from a child state', () => {
    expect(s12.resolve('/s')).toBe(s);
    expect(s22.resolve('/s/s1')).toBe(s1);
    expect(s21.resolve('/s/s2/s22')).toBe(s22);
  });

  it('resolves the node object at the given relative path from a child state', () => {
    expect(s1.resolve('s12')).toBe(s12);
    expect(s1.resolve('s11')).toBe(s11);
    expect(s22.resolve('../..')).toBe(s);
    expect(s22.resolve('../../..')).toBe(root);
  });

  it('returns undefined when given an invalid path', () => {
    expect(root.resolve('/a/b/x')).toBe(undefined);
  });
});
