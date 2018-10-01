import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { InjectGuarded } from '../index';

const FooContext = React.createContext<string | undefined>(undefined);
const BarContext = React.createContext<string | undefined>(undefined);

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

interface DocumentProps {
  foo: string | undefined;
  bar: string | undefined;
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

it('nested InjectGuarded component updates correctly', () => {
  const renderer = TestRenderer.create(<Document foo="foo1" bar="bar1" />);

  expect(renderer.toJSON()).toMatchSnapshot();

  renderer.update(<Document foo={undefined} bar="bar1" />);

  expect(renderer.toJSON()).toMatchSnapshot();

  renderer.update(<Document foo={undefined} bar={undefined} />);

  expect(renderer.toJSON()).toMatchSnapshot();

  renderer.update(<Document foo="foo1" bar={undefined} />);

  expect(renderer.toJSON()).toMatchSnapshot();

  renderer.update(<Document foo={undefined} bar="bar1" />);

  expect(renderer.toJSON()).toMatchSnapshot();

  renderer.update(<Document foo="foo2" bar="bar1" />);

  expect(renderer.toJSON()).toMatchSnapshot();
});
