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

class ComponentTest extends React.Component<ComponentProps, {}> {
  public someInternalProperty = "testValue";

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

const Component = Inject(
  {
    foo: FooContext,
    bar: BarContext,
  },
  ComponentTest
);

interface DocumentProps {
  foo: string;
  bar: string;
}

class Document extends React.Component<DocumentProps, {}> {
  public ref = React.createRef<ComponentTest>();

  public render() {
    return (
      <FooContext.Provider value={this.props.foo}>
        <BarContext.Provider value={this.props.bar}>
          <Component ref={this.ref} baz="baz" moo="moo" />
        </BarContext.Provider>
      </FooContext.Provider>
    );
  }
}

it('ref gets assigned to the nested component', () => {
  const renderer = TestRenderer.create(<Document foo="foo1" bar="bar1" />);
  const testInstance = renderer.getInstance() as any as Document;

  expect(testInstance).toBeInstanceOf(Document);
  expect(testInstance.ref).not.toBeNull();
  expect(testInstance.ref.current).not.toBeNull();
  expect(testInstance.ref.current.someInternalProperty).toEqual("testValue");
});
