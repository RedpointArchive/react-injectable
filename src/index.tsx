import * as React from "react";

type Dissoc<O, D extends string> = Pick<O, Exclude<keyof O, D>>;
type OuterProps<InjectedProps, P> = Dissoc<P, keyof InjectedProps>;

interface ForwardedProps<O> {
  _forwardedRef: React.Ref<React.ComponentClass<O>> | null | undefined;
}
interface InternalProps<C, O> extends ForwardedProps<O> {
  _forwardedValue: C | null;
}

/**
 * Inject the value of a React context into a component's property at runtime,
 * while ensuring that users of the component can not override or even see the
 * property being injected into.
 * 
 * This allows components to automatically map properties to context values,
 * while ensuring consumers of the component don't see properties that they
 * don't need to provide a value for.
 * 
 * @param Context The React v16 context object to pull the value from.
 * @param PropName The name of the property to inject the value into.
 * @param WrappedComponent The component that is being wrapped.
 * @returns The component that should be used by consumers or exported.
 * 
 * @example
 * // Import the Inject function.
 * import { Inject } from "react-injectable";
 * 
 * // The React v16 context (can be imported from elsewhere).
 * export const MyContext = React.createContext<SomeType>("hello");
 * 
 * // The component properties (include injected properties here).
 * interface ExampleProps {
 *   someProp: string;
 *   injectedProp: SomeType;
 * }
 * 
 * // The component declaration.
 * export const Example = Inject(
 *   MyContext, 
 *   "injectedProp", 
 *   class Example extends React.Component<ExampleProps, {}> {
 *     constructor(props: ExampleProps) {
 *       super(props);
 *     }
 *   });
 *
 * // Using the component in code.
 * function usageExample() {
 *   return (
 *     <NavigationListener 
 *       someProp="hello"
 *     />
 *   );
 * }
 */
export function Inject<K extends string, C, P extends { [KK in K]: C }>(
  Context: React.Context<C>,
  PropName: K,
  WrappedComponent: React.ComponentClass<P>
): React.ComponentType<OuterProps<{ [KK in K]: C }, P>> {
  type InjectedProps = { [KK in K]: C };
  type O = OuterProps<InjectedProps, P>;
  type F = ForwardedProps<O> & O;
  type I = InternalProps<C, O> & O;

  class WithValue extends React.Component<I> {
    public render(): React.ReactNode {
      const { _forwardedRef, _forwardedValue } = this.props;
      const injectedProps = {
        [PropName]: _forwardedValue
      };
      return (
        <WrappedComponent
          ref={(ref: React.Component<P> | null) => {
            if (_forwardedRef !== undefined && _forwardedRef !== null && typeof _forwardedRef !== 'string') {
              // TODO: Make this safer.
              const r: any = _forwardedRef;
              r(ref as any);
            }
          }}
          {...injectedProps}
          {...this.props as any} />
      );
    }
  }
  
  class ComponentWrapper extends React.Component<F> {
    public render(): React.ReactNode {
      const { _forwardedRef } = this.props;

      return (
        <Context.Consumer>
          {(value: C | null): React.ReactNode => {
            return (
              <WithValue
                _forwardedValue={value}
                _forwardedRef={_forwardedRef}
                {...this.props as any} />
            );
          }}
        </Context.Consumer>
      )
    }
  }

  return React.forwardRef<React.ComponentType<O>, O>((props: O & { children?: React.ReactNode }, ref?: React.Ref<React.ComponentType<O>>) => {
    return <ComponentWrapper {...props as any} _forwardedRef={ref} />;
  });
}