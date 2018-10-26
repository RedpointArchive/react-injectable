# react-injectable :star2:

Inject React v16 context consumer values as properties into components, with correct TypeScript declarations!

[![npm](https://img.shields.io/npm/v/react-injectable.svg?style=flat-square)](https://www.npmjs.com/package/react-injectable)
[![MIT License](https://img.shields.io/npm/l/react-injectable.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![AppVeyor](https://img.shields.io/appveyor/ci/hach-que/react-injectable.svg?style=flat-square)](https://ci.appveyor.com/project/hach-que/react-injectable)

## What is it?

You want to use values from React v16 context objects (provider/consumer), but you don't want to manually wrap your
components in the `<Context.Consumer>{(value) => { ... }}</Context.Consumer>` pattern?

This library provides a higher-order component that allows you to easily inject properties into your components from 
React v16 context objects, in a way that emits correct declarations for TypeScript. Just call `Inject` with a map of
property names to context objects, and it's all handled for you!

## Install

To install react-injectable, just use `yarn` or `npm`. There's no need for `@types/react-injectable` as this package
includes TypeScript type definitions.

```sh
yarn add react-injectable
```

## Available APIs

react-injectable provides the following library methods:

- `Inject(ContextMap, Component)` - Inject a set of context values into the specified properties of the component, returning a new component with those properties removed (in TypeScript).
- `InjectGuarded(ContextMap, Component)` - Inject a set of optional context values into the specified properties of the component, returning a new component with those properties removed (in TypeScript). If any of the injected context values are `undefined` at runtime, the component will not be rendered.
- `InjectSingle(Context, PropName, Component)` - Injects a single context value into a single property of the component, returning a new component with that property removed (in TypeScript). This is used internally by `Inject`.
- `InjectSingleGuarded(Context, PropName, Component)` - Injects a single optional context value into a single property of the component, returning a new component with that property removed (in TypeScript). If the injected context value is `undefined` at runtime, the component will not be rendered. This is used internally by `Inject`.

Refer to the examples below on how to use the `Inject` and `InjectGuarded` methods. You shouldn't really need to use `InjectSingle` or `InjectSingleGuarded` in your application code.

## Examples

The following examples show how to use react-injectable in your application or library.

### Injecting values into a class component

When you want to inject values into a class component, and the contexts always guarantee the presence of a value, you can simply use `Inject` with a map of properties to contexts.

```typescript
import { Inject } from 'react-injectable';

// The React v16 contexts (can be imported from elsewhere).
export const MyContext1 = React.createContext<SomeType>(...);
export const MyContext2 = React.createContext<string>("hello");

// The component properties (include injected properties here).
interface ExampleProps {
  someProp: string;
  injectedProp: SomeType;
  anotherInjectedProp: string;
}

// The component declaration.
export const Example = Inject(
  {
    injectedProp: MyContext1,
    anotherInjectedProp: MyContext2,
  },
  class Example extends React.Component<ExampleProps, {}> {
    constructor(props: ExampleProps) {
      super(props);
    }
  });

// Using the component in code.
function usageExample() {
  // Works! You don't need to pass injected properties.
  const works = <Example someProp="hello" />;

  // Compile error! You can't set injected properties.
  const doesNotWork1 = <Example 
    someProp="hello" 
    injectedProp={...} 
    anotherInjectedProp="world" 
  />;

  // Compile error! You must provide required properties.
  const doesNotWork2 = <Example />;
}
```

### Injecting values into a functional component

When you want to inject values into a functional component, and the contexts always guarantee the presence of a value, you can simply use `Inject` with a map of properties to contexts.

```typescript
import { Inject } from 'react-injectable';

// The React v16 contexts (can be imported from elsewhere).
export const MyContext1 = React.createContext<SomeType>(...);
export const MyContext2 = React.createContext<string>("hello");

// The component properties (include injected properties here).
interface ExampleProps {
  someProp: string;
  injectedProp: SomeType;
  anotherInjectedProp: string;
}

// The component declaration.
export const Example = Inject(
  {
    injectedProp: MyContext1,
    anotherInjectedProp: MyContext2,
  },
  (props: ExampleProps) => {
    return null;
  });

// Using the component in code.
function usageExample() {
  // Works! You don't need to pass injected properties.
  const works = <Example someProp="hello" />;

  // Compile error! You can't set injected properties.
  const doesNotWork1 = <Example 
    someProp="hello" 
    injectedProp={...} 
    anotherInjectedProp="world" 
  />;

  // Compile error! You must provide required properties.
  const doesNotWork2 = <Example />;
}
```

### Injecting values into a class component, and using ref to get a reference to the class instance

When you want to inject values into a class component and you want to use `ref` to get a reference to the class instance, you need to export both the original class to use with `createRef` and the wrapped component.

```typescript
import { Inject } from 'react-injectable';

// The React v16 contexts (can be imported from elsewhere).
export const MyContext1 = React.createContext<SomeType>(...);
export const MyContext2 = React.createContext<string>("hello");

// The component properties (include injected properties here).
interface ExampleProps {
  someProp: string;
  injectedProp: SomeType;
  anotherInjectedProp: string;
}

// An example of declaring a component class for use with createRef. You can 
// optionally export ExampleInjected to use createRef in other files with it.
class ExampleInjected extends React.Component<ExampleProps, {}> {
  constructor(props: ExampleProps) {
    super(props);
  }
}

// Wrap ExampleInjected with Inject to create the automatically injected
// version that's used to instantiate the component.
export class Example = Inject(
  {
    injectedProp: MyContext1,
    anotherInjectedProp: MyContext2,
  },
  ExampleInjected);

function usageExample() {
  // Works! To use the actual component type in createRef, you should hoist the 
  // "class Example" definition out of the Inject call into the outer scope and 
  // rename it (see below).
  const ref = React.createRef<ExampleInjected>();
  const works = <Example ref={ref} someProp="hello" />;
}
```

### Injecting optional values into a component, and preventing it from rendering if the values are not present

When you want to inject optional values into a class or functional component, and prevent that component from rendering if the context does not currently have a value, use `InjectGuarded`.

```typescript
import { InjectGuarded } from 'react-injectable';

// The React v16 contexts (can be imported from elsewhere).
// In this case, because we didn't provide an argument to createContext,
// the resulting type of MyContext is React.ReactContext<string | undefined>.
export const MyContext = React.createContext<string>();

// The component properties (include injected properties here). Notice in this
// case injectedProp is a required string.
interface ExampleProps {
  injectedProp: string;
}

// The component declaration.
export const Example = InjectGuarded(
  {
    injectedProp: MyContext,
  },
  (props: ExampleProps) => {
    return (
      <p>{props.injectedProp}</p>
    );
  });

// Using the component in code.
function usageExample() {
  // This would not render because there's no MyContext.Provider in
  // the hierarchy above Example, and thus the default current value is
  // undefined.
  const wouldNotRender = (
    <Example />
  );

  // This would also not render because the context's value is explictly
  // undefined.
  const wouldAlsoNotRender = (
    <MyContext.Provider value={undefined}>
      <Example />
    </MyContext.Provider>
  );

  // This would render a paragraph with the text "Hello", because the value
  // from the context is present.
  const wouldRender = (
    <MyContext.Provider value="Hello">
      <Example />
    </MyContext.Provider>
  );
}
```

## License

```
MIT License

Copyright (c) 2018 Redpoint Games

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```