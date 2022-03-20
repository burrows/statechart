[@corey.burrows/statechart](../README.md) / State

# Class: State<C, E\>

`State` objects are immutable objects that track the current state of a
statechart.

## Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

## Table of contents

### Properties

- [actions](State.md#actions)
- [activities](State.md#activities)
- [context](State.md#context)
- [current](State.md#current)

### Accessors

- [paths](State.md#paths)

### Methods

- [matches](State.md#matches)

## Properties

### actions

• **actions**: [`Action`](../README.md#action)<`E`\>[]

A list of [Action](../README.md#action) objects queued by the last `send`. You must call the
`exec` method on these objects for the side effects to actually run.

#### Defined in

[State.ts:21](https://github.com/burrows/statechart/blob/f1380e4/src/State.ts#L21)

___

### activities

• **activities**: `Object`

The current [Activity](../interfaces/Activity.md) state.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `current` | { `[path: string]`: [`Activity`](../interfaces/Activity.md)<`E`\>[];  } | The list of activities that are currently running. |
| `start` | [`Activity`](../interfaces/Activity.md)<`E`\>[] | The list of activities that were queued by the last `send` and thus must be started by calling their `start` method. |
| `stop` | [`Activity`](../interfaces/Activity.md)<`E`\>[] | The list of activities that must be stopped by calling their `stop` method since the state that originally queued them is no longer current. |

#### Defined in

[State.ts:27](https://github.com/burrows/statechart/blob/f1380e4/src/State.ts#L27)

___

### context

• **context**: `C`

The current context.

#### Defined in

[State.ts:12](https://github.com/burrows/statechart/blob/f1380e4/src/State.ts#L12)

___

### current

• **current**: [`Node`](Node.md)<`C`, `E`\>[]

A list of the current leaf state nodes.

#### Defined in

[State.ts:16](https://github.com/burrows/statechart/blob/f1380e4/src/State.ts#L16)

## Accessors

### paths

• `get` **paths**(): `string`[]

Returns the paths of the current states.

#### Returns

`string`[]

#### Defined in

[State.ts:72](https://github.com/burrows/statechart/blob/f1380e4/src/State.ts#L72)

## Methods

### matches

▸ **matches**(`path`): `boolean`

Used to check if some state is current. The `path` parameter can be a path
to any state in the statechart (leaf state or otherwise). Throws an `Error`
if the given path cannot be resolved.

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

#### Returns

`boolean`

#### Defined in

[State.ts:81](https://github.com/burrows/statechart/blob/f1380e4/src/State.ts#L81)
