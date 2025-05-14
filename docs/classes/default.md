[@corey.burrows/statechart](../README.md) / default

# Class: default<C, E\>

```typescript
const statechart = new Statechart<Ctx, Evt>(initialContext, (s) => {
  s.state('a');
  s.state('b');
});
```

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `C` | `C` | The type of the statechart context. This can be any aribitray object. |
| `E` | extends [`Event`](../interfaces/Event.md) | The event type. This must be a discriminated union with a string `type` field. |

## Table of contents

### Constructors

- [constructor](default.md#constructor)

### Properties

- [initialContext](default.md#initialcontext)

### Accessors

- [initialState](default.md#initialstate)

### Methods

- [inspect](default.md#inspect)
- [send](default.md#send)
- [stop](default.md#stop)

## Constructors

### constructor

• **new default**<`C`, `E`\>(`context`, `body`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `C` |
| `body` | [`NodeBody`](../README.md#nodebody)<`C`, `E`\> |

#### Defined in

[Statechart.ts:23](https://github.com/burrows/statechart/blob/d9d682c/src/Statechart.ts#L23)

## Properties

### initialContext

• **initialContext**: `C`

#### Defined in

[Statechart.ts:19](https://github.com/burrows/statechart/blob/d9d682c/src/Statechart.ts#L19)

## Accessors

### initialState

• `get` **initialState**(): [`State`](State.md)<`C`, `E`\>

Returns the initial state of the statechart by entering from the root
state. Enter handlers will be passed an internal event with the type
`__start__`.

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Statechart.ts:33](https://github.com/burrows/statechart/blob/d9d682c/src/Statechart.ts#L33)

## Methods

### inspect

▸ **inspect**(`state?`): `string`

Returns a string representation of the statechart. If a `State` instance is
passed then the current state(s) will be marked in the output.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state?` | [`State`](State.md)<`C`, `E`\> |

#### Returns

`string`

#### Defined in

[Statechart.ts:147](https://github.com/burrows/statechart/blob/d9d682c/src/Statechart.ts#L147)

___

### send

▸ **send**(`state`, `evt`): [`State`](State.md)<`C`, `E`\>

Send an event to the statechart, possibily causing a transition. The event
will be sent to the current states as defined by the `state` param and the
updated state is returned.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |
| `evt` | `E` \| [`InternalEvent`](../README.md#internalevent) |

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Statechart.ts:66](https://github.com/burrows/statechart/blob/d9d682c/src/Statechart.ts#L66)

___

### stop

▸ **stop**(`state`): [`State`](State.md)<`C`, `E`\>

Stop the statechart by exiting from the given stte up through the root
state. Exit handlers will be passed an internal event with the type
`__stop__`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Statechart.ts:49](https://github.com/burrows/statechart/blob/d9d682c/src/Statechart.ts#L49)
