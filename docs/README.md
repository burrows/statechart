@corey.burrows/statechart

# @corey.burrows/statechart

## Table of contents

### Classes

- [Machine](classes/Machine.md)
- [Node](classes/Node.md)
- [State](classes/State.md)
- [default](classes/default.md)

### Interfaces

- [ActionObj](interfaces/ActionObj.md)
- [Activity](interfaces/Activity.md)
- [EnterHandlerResult](interfaces/EnterHandlerResult.md)
- [Event](interfaces/Event.md)
- [ExitHandlerResult](interfaces/ExitHandlerResult.md)

### Type aliases

- [Action](README.md#action)
- [ActionFn](README.md#actionfn)
- [ConditionFn](README.md#conditionfn)
- [EnterHandler](README.md#enterhandler)
- [EventHandler](README.md#eventhandler)
- [EventHandlerResult](README.md#eventhandlerresult)
- [ExitHandler](README.md#exithandler)
- [InternalEvent](README.md#internalevent)
- [NodeBody](README.md#nodebody)
- [SendFn](README.md#sendfn)

## Type aliases

### Action

Ƭ **Action**<`E`\>: [`ActionObj`](interfaces/ActionObj.md)<`E`\> \| [`ActionFn`](README.md#actionfn)<`E`\>

#### Type parameters

| Name |
| :------ |
| `E` |

#### Defined in

[types.ts:17](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L17)

___

### ActionFn

Ƭ **ActionFn**<`E`\>: (`send`: [`SendFn`](README.md#sendfn)<`E`\>) => `void`

#### Type parameters

| Name |
| :------ |
| `E` |

#### Type declaration

▸ (`send`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `send` | [`SendFn`](README.md#sendfn)<`E`\> |

##### Returns

`void`

#### Defined in

[types.ts:15](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L15)

___

### ConditionFn

Ƭ **ConditionFn**<`C`, `E`\>: (`ctx`: `C`, `evt`: [`InternalEvent`](README.md#internalevent) \| `E`) => `string` \| `undefined`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](interfaces/Event.md) |

#### Type declaration

▸ (`ctx`, `evt`): `string` \| `undefined`

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | `C` |
| `evt` | [`InternalEvent`](README.md#internalevent) \| `E` |

##### Returns

`string` \| `undefined`

#### Defined in

[types.ts:59](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L59)

___

### EnterHandler

Ƭ **EnterHandler**<`C`, `E`\>: (`ctx`: `C`, `evt`: [`InternalEvent`](README.md#internalevent) \| `E`) => [`EnterHandlerResult`](interfaces/EnterHandlerResult.md)<`C`, `E`\> \| `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](interfaces/Event.md) |

#### Type declaration

▸ (`ctx`, `evt`): [`EnterHandlerResult`](interfaces/EnterHandlerResult.md)<`C`, `E`\> \| `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | `C` |
| `evt` | [`InternalEvent`](README.md#internalevent) \| `E` |

##### Returns

[`EnterHandlerResult`](interfaces/EnterHandlerResult.md)<`C`, `E`\> \| `void`

#### Defined in

[types.ts:42](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L42)

___

### EventHandler

Ƭ **EventHandler**<`C`, `E`, `T`\>: (`ctx`: `C`, `evt`: `Extract`<`E`, { `type`: `T`  }\>) => [`EventHandlerResult`](README.md#eventhandlerresult)<`C`, `E`\> \| `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](interfaces/Event.md) |
| `T` | extends `E`[``"type"``] \| [`InternalEvent`](README.md#internalevent)[``"type"``] |

#### Type declaration

▸ (`ctx`, `evt`): [`EventHandlerResult`](README.md#eventhandlerresult)<`C`, `E`\> \| `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | `C` |
| `evt` | `Extract`<`E`, { `type`: `T`  }\> |

##### Returns

[`EventHandlerResult`](README.md#eventhandlerresult)<`C`, `E`\> \| `void`

#### Defined in

[types.ts:53](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L53)

___

### EventHandlerResult

Ƭ **EventHandlerResult**<`C`, `E`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](interfaces/Event.md) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `actions?` | [`Action`](README.md#action)<`E`\>[] |
| `context?` | `C` |
| `goto?` | `string` \| `string`[] |

#### Defined in

[types.ts:47](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L47)

___

### ExitHandler

Ƭ **ExitHandler**<`C`, `E`\>: (`ctx`: `C`, `evt`: [`InternalEvent`](README.md#internalevent) \| `E`) => [`ExitHandlerResult`](interfaces/ExitHandlerResult.md)<`C`, `E`\> \| `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](interfaces/Event.md) |

#### Type declaration

▸ (`ctx`, `evt`): [`ExitHandlerResult`](interfaces/ExitHandlerResult.md)<`C`, `E`\> \| `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | `C` |
| `evt` | [`InternalEvent`](README.md#internalevent) \| `E` |

##### Returns

[`ExitHandlerResult`](interfaces/ExitHandlerResult.md)<`C`, `E`\> \| `void`

#### Defined in

[types.ts:31](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L31)

___

### InternalEvent

Ƭ **InternalEvent**: { `type`: ``"__start__"``  } \| { `type`: ``"__stop__"``  }

#### Defined in

[types.ts:7](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L7)

___

### NodeBody

Ƭ **NodeBody**<`C`, `E`\>: (`n`: [`Node`](classes/Node.md)<`C`, `E`\>) => `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](interfaces/Event.md) |

#### Type declaration

▸ (`n`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `n` | [`Node`](classes/Node.md)<`C`, `E`\> |

##### Returns

`void`

#### Defined in

[types.ts:24](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L24)

___

### SendFn

Ƭ **SendFn**<`E`\>: (`event`: `E`) => `void`

#### Type parameters

| Name |
| :------ |
| `E` |

#### Type declaration

▸ (`event`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `E` |

##### Returns

`void`

#### Defined in

[types.ts:9](https://github.com/burrows/statechart/blob/6bcdb81/src/types.ts#L9)
