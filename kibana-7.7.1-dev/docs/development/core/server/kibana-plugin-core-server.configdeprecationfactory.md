<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-core-server](./kibana-plugin-core-server.md) &gt; [ConfigDeprecationFactory](./kibana-plugin-core-server.configdeprecationfactory.md)

## ConfigDeprecationFactory interface

Provides helpers to generates the most commonly used [ConfigDeprecation](./kibana-plugin-core-server.configdeprecation.md) when invoking a [ConfigDeprecationProvider](./kibana-plugin-core-server.configdeprecationprovider.md)<!-- -->.

See methods documentation for more detailed examples.

<b>Signature:</b>

```typescript
export interface ConfigDeprecationFactory 
```

## Example


```typescript
const provider: ConfigDeprecationProvider = ({ rename, unused }) => [
  rename('oldKey', 'newKey'),
  unused('deprecatedKey'),
]

```

## Methods

|  Method | Description |
|  --- | --- |
|  [rename(oldKey, newKey)](./kibana-plugin-core-server.configdeprecationfactory.rename.md) | Rename a configuration property from inside a plugin's configuration path. Will log a deprecation warning if the oldKey was found and deprecation applied. |
|  [renameFromRoot(oldKey, newKey, silent)](./kibana-plugin-core-server.configdeprecationfactory.renamefromroot.md) | Rename a configuration property from the root configuration. Will log a deprecation warning if the oldKey was found and deprecation applied.<!-- -->This should be only used when renaming properties from different configuration's path. To rename properties from inside a plugin's configuration, use 'rename' instead. |
|  [unused(unusedKey)](./kibana-plugin-core-server.configdeprecationfactory.unused.md) | Remove a configuration property from inside a plugin's configuration path. Will log a deprecation warning if the unused key was found and deprecation applied. |
|  [unusedFromRoot(unusedKey)](./kibana-plugin-core-server.configdeprecationfactory.unusedfromroot.md) | Remove a configuration property from the root configuration. Will log a deprecation warning if the unused key was found and deprecation applied.<!-- -->This should be only used when removing properties from outside of a plugin's configuration. To remove properties from inside a plugin's configuration, use 'unused' instead. |
