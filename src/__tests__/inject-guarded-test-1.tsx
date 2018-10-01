import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { InjectGuarded } from '../index';

const FooContext = React.createContext<string | undefined>("foo");
const BarContext = React.createContext<string>(undefined);

interface ComponentProps {
  foo: string;
  bar: string;
  baz: string;
  moo: string;
}

const Component = InjectGuarded(
  {
    foo: FooContext,
    bar: BarContext,
  },
  class Component extends React.Component<ComponentProps, {}> {
    public render() {
      return (
        <>
          {this.props.foo}
          {this.props.bar}
          {this.props.baz}
          {this.props.moo}
        </>
      );
    }
  }
);

it('InjectGuarded with multiple contexts injects correctly', () => {
  const renderer = TestRenderer.create(
    <FooContext.Provider value="foo2">
      <BarContext.Provider value={undefined}>
        <Component baz="baz" moo="moo" />
      </BarContext.Provider>
    </FooContext.Provider>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});
