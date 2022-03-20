[@corey.burrows/statechart](../README.md) / Machine

# Class: Machine<C, E\>

Provides a reference `Machine` class for maintaining the current state of a
statechart and executing side effects. It's perfectly valid choose to
implement this logic for yourself if this class doesn't suit your needs.

## Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

## Table of contents

### Constructors

- [constructor](Machine.md#constructor)

### Accessors

- [context](Machine.md#context)
- [current](Machine.md#current)
- [paths](Machine.md#paths)

### Methods

- [exec](Machine.md#exec)
- [matches](Machine.md#matches)
- [send](Machine.md#send)
- [start](Machine.md#start)
- [stop](Machine.md#stop)

## Constructors

### constructor

• **new Machine**<`C`, `E`\>(`statechart`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `statechart` | [`default`](default.md)<`C`, `E`\> |

#### Defined in

[Machine.ts:14](https://github.com/burrows/statechart/blob/364aac9/src/Machine.ts#L14)

## Accessors

### context

• `get` **context**(): `C`

#### Returns

`C`

#### Defined in

[Machine.ts:57](https://github.com/burrows/statechart/blob/364aac9/src/Machine.ts#L57)

___

### current

• `get` **current**(): [`Node`](Node.md)<`C`, `E`\>[]

#### Returns

[`Node`](Node.md)<`C`, `E`\>[]

#### Defined in

[Machine.ts:49](https://github.com/burrows/statechart/blob/364aac9/src/Machine.ts#L49)

___

### paths

• `get` **paths**(): `string`[]

#### Returns

`string`[]

#### Defined in

[Machine.ts:53](https://github.com/burrows/statechart/blob/364aac9/src/Machine.ts#L53)

## Methods

### exec

▸ **exec**(`state`): [`Machine`](Machine.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:33](https://github.com/burrows/statechart/blob/364aac9/src/Machine.ts#L33)

___

### matches

▸ **matches**(`path`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

#### Returns

`boolean`

#### Defined in

[Machine.ts:61](https://github.com/burrows/statechart/blob/364aac9/src/Machine.ts#L61)

___

### send

▸ **send**(`event`): [`Machine`](Machine.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `E` |

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:28](https://github.com/burrows/statechart/blob/364aac9/src/Machine.ts#L28)

___

### start

▸ **start**(): [`Machine`](Machine.md)<`C`, `E`\>

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:18](https://github.com/burrows/statechart/blob/364aac9/src/Machine.ts#L18)

___

### stop

▸ **stop**(): [`Machine`](Machine.md)<`C`, `E`\>

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:23](https://github.com/burrows/statechart/blob/364aac9/src/Machine.ts#L23)
