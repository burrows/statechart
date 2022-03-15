[@corey.burrows/statechart](../README.md) / default

# Class: default<C, E\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

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

[Statechart.ts:10](https://github.com/burrows/statechart/blob/a7b3e7e/src/Statechart.ts#L10)

## Properties

### initialContext

• **initialContext**: `C`

#### Defined in

[Statechart.ts:6](https://github.com/burrows/statechart/blob/a7b3e7e/src/Statechart.ts#L6)

## Accessors

### initialState

• `get` **initialState**(): [`State`](State.md)<`C`, `E`\>

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Statechart.ts:15](https://github.com/burrows/statechart/blob/a7b3e7e/src/Statechart.ts#L15)

## Methods

### inspect

▸ **inspect**(`state?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state?` | [`State`](State.md)<`C`, `E`\> |

#### Returns

`string`

#### Defined in

[Statechart.ts:117](https://github.com/burrows/statechart/blob/a7b3e7e/src/Statechart.ts#L117)

___

### send

▸ **send**(`state`, `evt`): [`State`](State.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |
| `evt` | `E` \| [`InternalEvent`](../README.md#internalevent) |

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Statechart.ts:40](https://github.com/burrows/statechart/blob/a7b3e7e/src/Statechart.ts#L40)

___

### stop

▸ **stop**(`state`): [`State`](State.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Statechart.ts:36](https://github.com/burrows/statechart/blob/a7b3e7e/src/Statechart.ts#L36)
