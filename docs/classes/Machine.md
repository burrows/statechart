[@corey.burrows/statechart](../README.md) / Machine

# Class: Machine<C, E\>

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

[Machine.ts:9](https://github.com/burrows/statechart/blob/f0db066/src/Machine.ts#L9)

## Accessors

### context

• `get` **context**(): `C`

#### Returns

`C`

#### Defined in

[Machine.ts:52](https://github.com/burrows/statechart/blob/f0db066/src/Machine.ts#L52)

___

### current

• `get` **current**(): [`Node`](Node.md)<`C`, `E`\>[]

#### Returns

[`Node`](Node.md)<`C`, `E`\>[]

#### Defined in

[Machine.ts:44](https://github.com/burrows/statechart/blob/f0db066/src/Machine.ts#L44)

___

### paths

• `get` **paths**(): `string`[]

#### Returns

`string`[]

#### Defined in

[Machine.ts:48](https://github.com/burrows/statechart/blob/f0db066/src/Machine.ts#L48)

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

[Machine.ts:28](https://github.com/burrows/statechart/blob/f0db066/src/Machine.ts#L28)

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

[Machine.ts:56](https://github.com/burrows/statechart/blob/f0db066/src/Machine.ts#L56)

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

[Machine.ts:23](https://github.com/burrows/statechart/blob/f0db066/src/Machine.ts#L23)

___

### start

▸ **start**(): [`Machine`](Machine.md)<`C`, `E`\>

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:13](https://github.com/burrows/statechart/blob/f0db066/src/Machine.ts#L13)

___

### stop

▸ **stop**(): [`Machine`](Machine.md)<`C`, `E`\>

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:18](https://github.com/burrows/statechart/blob/f0db066/src/Machine.ts#L18)
