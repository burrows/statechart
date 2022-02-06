import Node, {Effect, initEvent, Event} from './Node';

export interface State<C> {
  current: string[];
  context: C;
}

export default class Statechart<C, E extends Event> {
  private root: Node<C, E>;
  public initialState: State<C>;

  constructor(context: C, body: (n: Node<C, E>) => void) {
    this.root = new Node('__root__', body);
    this.initialState = {current: [], context};
  }

  send(state: State<C>, event: E | typeof initEvent): [State<C>, Effect<E>[]] {
    return [state, []];
  }
}
