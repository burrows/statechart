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
