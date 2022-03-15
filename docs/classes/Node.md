[@corey.burrows/statechart](../README.md) / Node

# Class: Node<C, E\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

## Table of contents

### Constructors

- [constructor](Node.md#constructor)

### Properties

- [children](Node.md#children)
- [name](Node.md#name)
- [parent](Node.md#parent)
- [type](Node.md#type)

### Accessors

- [depth](Node.md#depth)
- [isHistory](Node.md#ishistory)
- [isLeaf](Node.md#isleaf)
- [isRoot](Node.md#isroot)
- [lineage](Node.md#lineage)
- [path](Node.md#path)
- [root](Node.md#root)

### Methods

- [C](Node.md#c)
- [H](Node.md#h)
- [\_enter](Node.md#_enter)
- [\_exit](Node.md#_exit)
- [concurrent](Node.md#concurrent)
- [enter](Node.md#enter)
- [exit](Node.md#exit)
- [inspect](Node.md#inspect)
- [matches](Node.md#matches)
- [on](Node.md#on)
- [pivot](Node.md#pivot)
- [pivotEnter](Node.md#pivotenter)
- [pivotExit](Node.md#pivotexit)
- [resolve](Node.md#resolve)
- [send](Node.md#send)
- [state](Node.md#state)
- [toString](Node.md#tostring)

## Constructors

### constructor

• **new Node**<`C`, `E`\>(`name`, `body?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `C` |
| `E` | extends [`Event`](../interfaces/Event.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `body?` | [`NodeBody`](../README.md#nodebody)<`C`, `E`\> |

#### Defined in

[Node.ts:31](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L31)

## Properties

### children

• **children**: `Map`<`string`, [`Node`](Node.md)<`C`, `E`\>\>

#### Defined in

[Node.ts:17](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L17)

___

### name

• **name**: `string`

#### Defined in

[Node.ts:14](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L14)

___

### parent

• `Optional` **parent**: [`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:16](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L16)

___

### type

• **type**: ``"cluster"`` \| ``"concurrent"``

#### Defined in

[Node.ts:15](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L15)

## Accessors

### depth

• `get` **depth**(): `number`

#### Returns

`number`

#### Defined in

[Node.ts:129](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L129)

___

### isHistory

• `get` **isHistory**(): `boolean`

#### Returns

`boolean`

#### Defined in

[Node.ts:137](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L137)

___

### isLeaf

• `get` **isLeaf**(): `boolean`

#### Returns

`boolean`

#### Defined in

[Node.ts:121](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L121)

___

### isRoot

• `get` **isRoot**(): `boolean`

#### Returns

`boolean`

#### Defined in

[Node.ts:117](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L117)

___

### lineage

• `get` **lineage**(): [`Node`](Node.md)<`C`, `E`\>[]

#### Returns

[`Node`](Node.md)<`C`, `E`\>[]

#### Defined in

[Node.ts:125](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L125)

___

### path

• `get` **path**(): `string`

#### Returns

`string`

#### Defined in

[Node.ts:133](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L133)

___

### root

• `get` **root**(): [`Node`](Node.md)<`C`, `E`\>

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:113](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L113)

## Methods

### C

▸ **C**(`f`): [`Node`](Node.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | [`ConditionFn`](../README.md#conditionfn)<`C`, `E`\> |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:108](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L108)

___

### H

▸ **H**(`star?`): [`Node`](Node.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `star?` | ``"*"`` |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:51](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L51)

___

### \_enter

▸ **_enter**(`state`, `evt`, `to`): [`State`](State.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |
| `evt` | `E` \| [`InternalEvent`](../README.md#internalevent) |
| `to` | [`Node`](Node.md)<`C`, `E`\>[] |

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Node.ts:308](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L308)

___

### \_exit

▸ **_exit**(`state`, `evt`): [`State`](State.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |
| `evt` | `E` \| [`InternalEvent`](../README.md#internalevent) |

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Node.ts:268](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L268)

___

### concurrent

▸ **concurrent**(): [`Node`](Node.md)<`C`, `E`\>

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:46](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L46)

___

### enter

▸ **enter**(`handler`, `__namedParameters?`): [`Node`](Node.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | [`EnterHandler`](../README.md#enterhandler)<`C`, `E`\> |
| `__namedParameters` | `Object` |
| `__namedParameters.type?` | ``"pre"`` \| ``"post"`` |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:66](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L66)

___

### exit

▸ **exit**(`handler`, `__namedParameters?`): [`Node`](Node.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | [`ExitHandler`](../README.md#exithandler)<`C`, `E`\> |
| `__namedParameters` | `Object` |
| `__namedParameters.type?` | ``"pre"`` \| ``"post"`` |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:83](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L83)

___

### inspect

▸ **inspect**(`__namedParameters?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.prefix?` | `string` |
| `__namedParameters.state?` | [`State`](State.md)<`C`, `E`\> |

#### Returns

`string`

#### Defined in

[Node.ts:163](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L163)

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

[Node.ts:147](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L147)

___

### on

▸ **on**<`T`\>(`type`, `handler`): [`Node`](Node.md)<`C`, `E`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `T` |
| `handler` | `string` \| `string`[] \| [`EventHandler`](../README.md#eventhandler)<`C`, `E`, `T`\> |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:97](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L97)

___

### pivot

▸ **pivot**(`other`): `undefined` \| [`Node`](Node.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `other` | [`Node`](Node.md)<`C`, `E`\> |

#### Returns

`undefined` \| [`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:219](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L219)

___

### pivotEnter

▸ **pivotEnter**(`state`, `evt`, `to`): [`State`](State.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |
| `evt` | `E` \| [`InternalEvent`](../README.md#internalevent) |
| `to` | [`Node`](Node.md)<`C`, `E`\>[] |

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Node.ts:252](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L252)

___

### pivotExit

▸ **pivotExit**(`state`, `evt`): [`State`](State.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |
| `evt` | `E` \| [`InternalEvent`](../README.md#internalevent) |

#### Returns

[`State`](State.md)<`C`, `E`\>

#### Defined in

[Node.ts:239](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L239)

___

### resolve

▸ **resolve**(`path`): `undefined` \| [`Node`](Node.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` \| `string`[] |

#### Returns

`undefined` \| [`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:346](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L346)

___

### send

▸ **send**(`state`, `evt`): `undefined` \| { `goto`: [`Node`](Node.md)<`C`, `E`\>[] ; `state`: [`State`](State.md)<`C`, `E`\>  }

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](State.md)<`C`, `E`\> |
| `evt` | `E` \| [`InternalEvent`](../README.md#internalevent) |

#### Returns

`undefined` \| { `goto`: [`Node`](Node.md)<`C`, `E`\>[] ; `state`: [`State`](State.md)<`C`, `E`\>  }

#### Defined in

[Node.ts:190](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L190)

___

### state

▸ **state**(`name`, `body?`): [`Node`](Node.md)<`C`, `E`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `body?` | [`NodeBody`](../README.md#nodebody)<`C`, `E`\> |

#### Returns

[`Node`](Node.md)<`C`, `E`\>

#### Defined in

[Node.ts:56](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L56)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[Node.ts:159](https://github.com/burrows/statechart/blob/a7b3e7e/src/Node.ts#L159)
