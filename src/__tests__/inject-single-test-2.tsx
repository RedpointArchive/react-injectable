import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { InjectSingle } from '../index';

const FooContext = React.createContext<string>("foo");
const BarContext = React.createContext<string>("bar");

interface ComponentProps {
  foo: string;
  bar: string;
  baz: string;
  moo: string;
}

const Component = InjectSingle(
  FooContext,
  "foo",
  InjectSingle(
    BarContext,
    "bar",
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
  )
);

it('multiple InjectSingle calls inject correctly', () => {
  const renderer = TestRenderer.create(
    <FooContext.Provider value="foo2">
      <BarContext.Provider value="bar2">
        <Component baz="baz" moo="moo" />
      </BarContext.Provider>
    </FooContext.Provider>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});
