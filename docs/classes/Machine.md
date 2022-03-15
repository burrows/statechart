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

[Machine.ts:8](https://github.com/burrows/statechart/blob/a7b3e7e/src/Machine.ts#L8)

## Accessors

### context

• `get` **context**(): `C`

#### Returns

`C`

#### Defined in

[Machine.ts:57](https://github.com/burrows/statechart/blob/a7b3e7e/src/Machine.ts#L57)

___

### current

• `get` **current**(): `string`[]

#### Returns

`string`[]

#### Defined in

[Machine.ts:53](https://github.com/burrows/statechart/blob/a7b3e7e/src/Machine.ts#L53)

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

[Machine.ts:37](https://github.com/burrows/statechart/blob/a7b3e7e/src/Machine.ts#L37)

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

[Machine.ts:61](https://github.com/burrows/statechart/blob/a7b3e7e/src/Machine.ts#L61)

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

[Machine.ts:32](https://github.com/burrows/statechart/blob/a7b3e7e/src/Machine.ts#L32)

___

### start

▸ **start**(): [`Machine`](Machine.md)<`C`, `E`\>

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:22](https://github.com/burrows/statechart/blob/a7b3e7e/src/Machine.ts#L22)

___

### stop

▸ **stop**(): [`Machine`](Machine.md)<`C`, `E`\>

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:27](https://github.com/burrows/statechart/blob/a7b3e7e/src/Machine.ts#L27)
