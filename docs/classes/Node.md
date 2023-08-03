[@corey.burrows/statechart](../README.md) / Node

# Class: Node<C, E\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

## Table of contents

### Methods

- [C](Node.md#c)
- [H](Node.md#h)
- [concurrent](Node.md#concurrent)
- [enter](Node.md#enter)
- [exit](Node.md#exit)
- [on](Node.md#on)
- [state](Node.md#state)

## Methods

### C

▸ **C**(`f`): [`Node`](Node.md)<`C`, `E`\>

Define a condition function for this state. The condition function is
called to determine which child state to enter when not otherwise
specified. It must either return the name of a child state or `undefined`.
When `undefined` is returned the default child will be entered unless this
is a history state, in which case the most recently exited child will be
entered.

```typescript
s.state('myState', (s) => {
  s.C((ctx, evt) => {
    return ctx.foo ? 'a' : 'b';
  });

  s.state('a');
  s.state('b');
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | [`ConditionFn`](../README.md#conditionfn)<`C`, `E`\> |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:243](https://github.com/burrows/statechart/blob/d9d682c/src/Node.ts#L243)

___

### H

▸ **H**(`star?`): [`Node`](Node.md)<`C`, `E`\>

Make the state a history state. A history state remembers its most recently
exited substate and uses that as the default substate on the next entry.
Pass `'*'` to make it a deep history state.

```typescript
s.state('myHistoryState', (s) => {
  s.H();

  s.state('a');
  s.state('b');
  s.state('c');
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `star?` | ``"*"`` |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:85](https://github.com/burrows/statechart/blob/d9d682c/src/Node.ts#L85)

___

### concurrent

▸ **concurrent**(): [`Node`](Node.md)<`C`, `E`\>

Make the state concurrent.

```typescript
s.state('myConcurrentState', (s) => {
  s.concurrent();

  // a, b, and c will all operate independently
  s.state('a');
  s.state('b');
  s.state('c');
});
```

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:65](https://github.com/burrows/statechart/blob/d9d682c/src/Node.ts#L65)

___

### enter

▸ **enter**(`handler`, `__namedParameters?`): [`Node`](Node.md)<`C`, `E`\>

Define an enter handler for this state. The given [EnterHandler](../README.md#enterhandler) can
return an object with the following optional keys to control the behavior
of the statechart:

* `context`: Update the context
* `actions`: Queue a list of [Action](../README.md#action) objects to run after the transition
  is complete
* `activities`: Queue a list of [Activity](../interfaces/Activity.md) objects to start after the
  transition is complete

```typescript
s.state('myState', (s) => {
  s.enter((ctx, evt) => {
    return {
      context: {...ctx, foo: 'bar'},
      actions: [new SomeAction()],
      activities: [new SomeActivity()],
    };
  });
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | [`EnterHandler`](../README.md#enterhandler)<`C`, `E`\> |
| `__namedParameters` | `Object` |
| `__namedParameters.type?` | ``"pre"`` \| ``"post"`` |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:138](https://github.com/burrows/statechart/blob/d9d682c/src/Node.ts#L138)

___

### exit

▸ **exit**(`handler`, `__namedParameters?`): [`Node`](Node.md)<`C`, `E`\>

Define an exit handler for this state. The given [ExitHandler](../README.md#exithandler) can
return an object with the following optional keys to control the behavior
of the statechart:

* `context`: Update the context
* `actions`: Queue a list of [Action](../README.md#action) objects to run after the transition
  is complete

```typescript
s.state('myState', (s) => {
  s.exit((ctx, evt) => {
    return {
      context: {...ctx, foo: 'bar'},
      actions: [new SomeAction()],
    };
  });
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | [`ExitHandler`](../README.md#exithandler)<`C`, `E`\> |
| `__namedParameters` | `Object` |
| `__namedParameters.type?` | ``"pre"`` \| ``"post"`` |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:175](https://github.com/burrows/statechart/blob/d9d682c/src/Node.ts#L175)

___

### on

▸ **on**<`T`\>(`type`, `handler`): [`Node`](Node.md)<`C`, `E`\>

Define an event handler for this state. The given `type` string must match
a `type` from your statechart's [Event](../interfaces/Event.md) type. The given [EventHandler](../README.md#eventhandler)
function can return an object with the following keys to control the
behavior of the statechart:

* `context`: Update the context
* `actions`: Queue a list of [Action](../README.md#action) objects to run after the transition
  is complete
* `goto`: Trigger a transition to the given state path. The state path must
  either be a full path starting from the root of the statechart or a
  relative path starting from the current state.

```typescript
s.on('SOME_EVENT', (ctx, evt) => {
  // evt type will be narrowed to the event with `{type: 'SOME_EVENT'}`
  return {
    context: {...ctx, foo: 'bar'},
    actions: [new SomeAction()],
    goto: '../some/other/state',
  };
});
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `T` |
| `handler` | `string` \| `string`[] \| [`EventHandler`](../README.md#eventhandler)<`C`, `E`, `T`\> |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:213](https://github.com/burrows/statechart/blob/d9d682c/src/Node.ts#L213)

___

### state

▸ **state**(`name`, `body?`): [`Node`](Node.md)<`C`, `E`\>

Create a substate of the current state.

```typescript
new Statechart<Ctx, Evt>(initialContext, (s) => {
  s.state('a', (s) => {
    // state a's body
  });

  s.state('b', (s) => {
    // state b's body
  });
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `body?` | [`NodeBody`](../README.md#nodebody)<`C`, `E`\> |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:105](https://github.com/burrows/statechart/blob/d9d682c/src/Node.ts#L105)
