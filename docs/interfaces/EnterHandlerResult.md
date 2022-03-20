[@corey.burrows/statechart](../README.md) / EnterHandlerResult

# Interface: EnterHandlerResult<C, E\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](Event.md) |

## Table of contents

### Properties

- [actions](EnterHandlerResult.md#actions)
- [activities](EnterHandlerResult.md#activities)
- [context](EnterHandlerResult.md#context)

## Properties

### actions

• `Optional` **actions**: [`Action`](../README.md#action)<`E`\>[]

#### Defined in

[types.ts:38](https://github.com/burrows/statechart/blob/f1380e4/src/types.ts#L38)

___

### activities

• `Optional` **activities**: [`Activity`](Activity.md)<`E`\>[]

#### Defined in

[types.ts:39](https://github.com/burrows/statechart/blob/f1380e4/src/types.ts#L39)

___

### context

• `Optional` **context**: `C`

#### Defined in

[types.ts:37](https://github.com/burrows/statechart/blob/f1380e4/src/types.ts#L37)
