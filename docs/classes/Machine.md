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

• **new Machine**<`C`, `E`\>(`statechart`, `__namedParameters?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `statechart` | [`default`](default.md)<`C`, `E`\> |
| `__namedParameters` | `Object` |
| `__namedParameters.trace?` | `boolean` |
| `__namedParameters.observer?` | (`state`: [`State`](State.md)<`C`, `E`\>) => `void` |

#### Defined in

[Machine.ts:27](https://github.com/burrows/statechart/blob/d9d682c/src/Machine.ts#L27)

## Accessors

### context

• `get` **context**(): `C`

#### Returns

`C`

#### Defined in

[Machine.ts:83](https://github.com/burrows/statechart/blob/d9d682c/src/Machine.ts#L83)

___

### current

• `get` **current**(): [`Node`](Node.md)<`C`, `E`\>[]

#### Returns

[`Node`](Node.md)<`C`, `E`\>[]

#### Defined in

[Machine.ts:75](https://github.com/burrows/statechart/blob/d9d682c/src/Machine.ts#L75)

___

### paths

• `get` **paths**(): `string`[]

#### Returns

`string`[]

#### Defined in

[Machine.ts:79](https://github.com/burrows/statechart/blob/d9d682c/src/Machine.ts#L79)

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

[Machine.ts:59](https://github.com/burrows/statechart/blob/d9d682c/src/Machine.ts#L59)

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

[Machine.ts:87](https://github.com/burrows/statechart/blob/d9d682c/src/Machine.ts#L87)

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

[Machine.ts:51](https://github.com/burrows/statechart/blob/d9d682c/src/Machine.ts#L51)

___

### start

▸ **start**(): [`Machine`](Machine.md)<`C`, `E`\>

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:39](https://github.com/burrows/statechart/blob/d9d682c/src/Machine.ts#L39)

___

### stop

▸ **stop**(): [`Machine`](Machine.md)<`C`, `E`\>

#### Returns

[`Machine`](Machine.md)<`C`, `E`\>

#### Defined in

[Machine.ts:45](https://github.com/burrows/statechart/blob/d9d682c/src/Machine.ts#L45)
