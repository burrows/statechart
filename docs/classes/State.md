[@corey.burrows/statechart](../README.md) / State

# Class: State<C, E\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

## Table of contents

### Constructors

- [constructor](State.md#constructor)

### Properties

- [actions](State.md#actions)
- [activities](State.md#activities)
- [context](State.md#context)
- [current](State.md#current)
- [history](State.md#history)

### Accessors

- [paths](State.md#paths)

### Methods

- [matches](State.md#matches)
- [update](State.md#update)

## Constructors

### constructor

• **new State**<`C`, `E`\>(`__namedParameters`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.actions?` | [`Action`](../README.md#action)<`E`\>[] |
| `__namedParameters.activities?` | `Object` |
| `__namedParameters.activities.current` | `Object` |
| `__namedParameters.activities.start` | [`Activity`](../interfaces/Activity.md)<`E`\>[] |
| `__namedParameters.activities.stop` | [`Activity`](../interfaces/Activity.md)<`E`\>[] |
| `__namedParameters.context` | `C` |
| `__namedParameters.current?` | [`Node`](Node.md)<`C`, `E`\>[] |
| `__namedParameters.history?` | `Object` |

#### Defined in

[State.ts:15](https://github.com/burrows/statechart/blob/39f3eaa/src/State.ts#L15)

## Properties

### actions

• **actions**: [`Action`](../README.md#action)<`E`\>[]

#### Defined in

[State.ts:7](https://github.com/burrows/statechart/blob/39f3eaa/src/State.ts#L7)

___

### activities

• **activities**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `current` | { `[path: string]`: [`Activity`](../interfaces/Activity.md)<`E`\>[];  } |
| `start` | [`Activity`](../interfaces/Activity.md)<`E`\>[] |
| `stop` | [`Activity`](../interfaces/Activity.md)<`E`\>[] |

#### Defined in

[State.ts:9](https://github.com/burrows/statechart/blob/39f3eaa/src/State.ts#L9)

___

### context

• **context**: `C`

#### Defined in

[State.ts:5](https://github.com/burrows/statechart/blob/39f3eaa/src/State.ts#L5)

___

### current

• **current**: [`Node`](Node.md)<`C`, `E`\>[]

#### Defined in

[State.ts:6](https://github.com/burrows/statechart/blob/39f3eaa/src/State.ts#L6)

___

### history

• **history**: `Object`

#### Index signature

▪ [path: `string`]: `string`

#### Defined in

[State.ts:8](https://github.com/burrows/statechart/blob/39f3eaa/src/State.ts#L8)

## Accessors

### paths

• `get` **paths**(): `string`[]

#### Returns

`string`[]

#### Defined in

[State.ts:39](https://github.com/burrows/statechart/blob/39f3eaa/src/State.ts#L39)

## Methods

### matches

▸ **matches**(`path`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

#### Returns

`boolean`

#### Defined in

[State.ts:47](https://github.com/burrows/statechart/blob/39f3eaa/src/State.ts#L47)

___

### update

▸ **update**(`data`): [`State`](State.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Partial`<[`State`](State.md)<`C`, `E`\>\> |

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[State.ts:43](https://github.com/burrows/statechart/blob/39f3eaa/src/State.ts#L43)
