import Node from './Node';

describe('Node#root', () => {
  it('returns the root node', () => {
    const a = new Node('a', {}, s => {
      s.state('b', s => {
        s.state('c');
      });
    });
    const b = a.children.get('b')!;
    const c = b.children.get('c')!;

    expect(a.root).toBe(a);
    expect(b.root).toBe(a);
    expect(c.root).toBe(a);
  });
});

describe('Node#lineage', () => {
  it('returns an array of nodes from the root to the receiver', () => {
    const root = new Node('', {}, s => {
      s.state('a', s => {
        s.state('c');
      });
      s.state('b');
    });
    const a = root.children.get('a')!;
    const b = root.children.get('b')!;
    const c = a.children.get('c')!;

    expect(root.lineage).toEqual([root]);
    expect(a.lineage).toEqual([root, a]);
    expect(c.lineage).toEqual([root, a, c]);
    expect(b.lineage).toEqual([root, b]);
  });
});

describe('Node#path', () => {
  it(`returns a string representation of the node's path`, () => {
    const root = new Node('', {}, s => {
      s.state('a', s => {
        s.state('c');
      });
      s.state('b');
    });
    const a = root.children.get('a')!;
    const b = root.children.get('b')!;
    const c = a.children.get('c')!;

    expect(root.path).toEqual('/');
    expect(a.path).toEqual('/a');
    expect(c.path).toEqual('/a/c');
    expect(b.path).toEqual('/b');
  });
});

describe('Node#resolve', () => {
  const root = new Node('root', {}, s => {
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
  const s = root.children.get('s')!;
  const s1 = s.children.get('s1')!;
  const s2 = s.children.get('s2')!;
  const s11 = s1.children.get('s11')!;
  const s12 = s1.children.get('s12')!;
  const s21 = s2.children.get('s21')!;
  const s22 = s2.children.get('s22')!;

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

describe('Node#matches', () => {
  const root = new Node('', {}, s => {
    s.state('a', s => {
      s.state('b', s => {
        s.state('c');
        s.state('d');
      });
    });
  });

  it("returns true when the given path matches the node's path and false otherwise", () => {
    const a = root.resolve('/a')!;
    const b = root.resolve('/a/b')!;

    expect(root.matches('/')).toBe(true);
    expect(root.matches('/a')).toBe(false);

    expect(a.matches('/a')).toBe(true);
    expect(a.matches('/')).toBe(true);
    expect(a.matches('/a/b')).toBe(false);

    expect(b.matches('/a/b')).toBe(true);
    expect(b.matches('/a')).toBe(true);
    expect(b.matches('/')).toBe(true);
    expect(b.matches('/a/b/c')).toBe(false);
    expect(b.matches('/a/b/d')).toBe(false);
  });

  it('throws an exception when the given path does not resolve', () => {
    const c = root.resolve('/a/b/c')!;

    expect(() => {
      c.matches('/a/b/e');
    }).toThrow('Node#matches: /a/b/e does not resolve');
  });
});

describe('Node#inspect', () => {
  interface Ctx {}
  type Evt = {type: 'x'};

  const n1 = new Node<Ctx, Evt>('', {}, s => {
    s.state('a', s => {
      s.state('d', {H: '*'}, s => {
        s.state('l');
        s.state('m');
      });
      s.state('e');
    });
    s.state('b', {concurrent: true}, s => {
      s.state('f', s => {
        s.state('h');
        s.state('i');
      });
      s.state('g', {H: true}, s => {
        s.state('j');
        s.state('k');
      });
    });
    s.state('c');
  });

  it('returns a tree representation of the node and its children', () => {
    expect(n1.inspect()).toBe(
      `/
├── a
│   ├── d (H*)
│   │   ├── l
│   │   └── m
│   └── e
├── b
│   ├┄┄ f
│   │   ├── h
│   │   └── i
│   └┄┄ g (H)
│       ├── j
│       └── k
└── c
`,
    );
  });
});
