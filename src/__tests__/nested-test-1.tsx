import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Inject } from '../index';

const FooContext = React.createContext<string>("foo");
const BarContext = React.createContext<string>("bar");

interface ComponentProps {
  foo: string;
  bar: string;
  baz: string;
  moo: string;
}

const Component = Inject(
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

interface DocumentProps {
  foo: string;
  bar: string;
}

class Document extends React.Component<DocumentProps, {}> {
  public render() {
    return (
      <FooContext.Provider value={this.props.foo}>
        <BarContext.Provider value={this.props.bar}>
          <Component baz="baz" moo="moo" />
        </BarContext.Provider>
      </FooContext.Provider>
    );
  }
}

it('nested injected component renders correctly', () => {
  const renderer = TestRenderer.create(<Document foo="foo2" bar="bar2" />);

  expect(renderer.toJSON()).toMatchSnapshot();
});
