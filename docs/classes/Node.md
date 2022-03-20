[@corey.burrows/statechart](../README.md) / Node

# Class: Node<C, E\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

## Table of contents

### Constructors

- [constructor](Node.md#constructor)

### Properties

- [children](Node.md#children)
- [name](Node.md#name)
- [parent](Node.md#parent)
- [type](Node.md#type)

### Methods

- [C](Node.md#c)
- [H](Node.md#h)
- [concurrent](Node.md#concurrent)
- [enter](Node.md#enter)
- [exit](Node.md#exit)
- [on](Node.md#on)
- [state](Node.md#state)

## Constructors

### constructor

• **new Node**<`C`, `E`\>(`name`, `body?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `body?` | [`NodeBody`](../README.md#nodebody)<`C`, `E`\> |

#### Defined in

[Node.ts:31](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L31)

## Properties

### children

• **children**: `Map`<`string`, [`Node`](Node.md)<`C`, `E`\>\>

#### Defined in

[Node.ts:17](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L17)

___

### name

• **name**: `string`

#### Defined in

[Node.ts:14](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L14)

___

### parent

• `Optional` **parent**: [`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:16](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L16)

___

### type

• **type**: ``"cluster"`` \| ``"concurrent"``

#### Defined in

[Node.ts:15](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L15)

## Methods

### C

▸ **C**(`f`): [`Node`](Node.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | [`ConditionFn`](../README.md#conditionfn)<`C`, `E`\> |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:175](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L175)

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

[Node.ts:80](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L80)

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

[Node.ts:60](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L60)

___

### enter

▸ **enter**(`handler`, `__namedParameters?`): [`Node`](Node.md)<`C`, `E`\>

Define an enter handler for this state. The given [EnterHandler](../README.md#enterhandler) can
return an object with the following optional keys to control the behavior
of the statechart:

* `context`: Update the context
* `actions`: Queue a list of [Action](../README.md#action) to run after the transition is
  complete
* `activities`: Queue a list of [Activity](../interfaces/Activity.md) to start after the transition
  is complete

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

[Node.ts:133](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L133)

___

### exit

▸ **exit**(`handler`, `__namedParameters?`): [`Node`](Node.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | [`ExitHandler`](../README.md#exithandler)<`C`, `E`\> |
| `__namedParameters` | `Object` |
| `__namedParameters.type?` | ``"pre"`` \| ``"post"`` |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:150](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L150)

___

### on

▸ **on**<`T`\>(`type`, `handler`): [`Node`](Node.md)<`C`, `E`\>

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

[Node.ts:164](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L164)

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

[Node.ts:100](https://github.com/burrows/statechart/blob/39f3eaa/src/Node.ts#L100)
