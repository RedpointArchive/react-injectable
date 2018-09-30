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

## Example

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

  // Doesn't work! You can't set injected properties.
  const doesNotWork1 = <Example someProp="hello" injectedProp={...} anotherInjectedProp="world" />;

  // Doesn't work! You must provide required properties.
  const doesNotWork2 = <Example />;

  // Works! To use the actual component type in createRef, you should hoist the "class Example" definition out of the Inject call into the outer scope and rename it (see below).
  const ref = React.createRef<any /* See below for typed createRef example */>();
  const works = <Example ref={ref} someProp="hello" />;
}

// An example of declaring a component class for use with createRef. You can optionally export ExampleInjected to use createRef in other files with it.
class ExampleInjected extends React.Component<ExampleProps, {}> {
  constructor(props: ExampleProps) {
    super(props);
  }
}
export class Example = Inject(
  {
    injectedProp: MyContext1,
    anotherInjectedProp: MyContext2,
  },
  ExampleInjected);
function refUsageExample() {
  const ref = React.createRef<ExampleInjected>();
  const works = <Example ref={ref} someProp="hello" />;
}
```

## License

This software is MIT licensed.