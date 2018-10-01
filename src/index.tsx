import * as React from "react";

type Dissoc<O, D extends string> = Pick<O, Exclude<keyof O, D>>;
type OuterProps<InjectedProps, P> = Dissoc<P, keyof InjectedProps>;

// Inline polyfill for Object.assign so we can target ES5.
let objectAssign: <T, U>(target: T, source: U) => T & U = function() {
  objectAssign = (Object as any).assign || function objectAssign(t: any) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return objectAssign.apply(this, arguments);
};

/**
 * Inject the value of a single React context into a component's property at runtime,
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
 * // Import the InjectSingle function.
 * import { InjectSingle } from "react-injectable";
 * 
 * // The React v16 context (can be imported from elsewhere).
 * export const MyContext = React.createContext<SomeType>(...);
 * 
 * // The component properties (include injected properties here).
 * interface ExampleProps {
 *   someProp: string;
 *   injectedProp: SomeType;
 * }
 * 
 * // The component declaration.
 * export const Example = InjectSingle(
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
 *     <Example 
 *       someProp="hello"
 *     />
 *   );
 * }
 */
export function InjectSingle<K extends string, ContextType, ComponentProps extends { [KK in K]: ContextType }>(
  Context: React.Context<ContextType>,
  PropName: K,
  Component: React.ComponentType<ComponentProps & React.ClassAttributes<React.Component<ComponentProps>>>
): React.ComponentType<OuterProps<{ [KK in K]: ContextType }, ComponentProps> & React.ClassAttributes<React.Component<OuterProps<{ [KK in K]: ContextType }, ComponentProps>>>> {
  type ResultProps = OuterProps<{ [KK in K]: ContextType }, ComponentProps>;

  return React.forwardRef<React.ComponentType<ResultProps>, ResultProps>((props: ResultProps, ref?: React.RefObject<React.ComponentType<ResultProps>>) => {
    return (
      <Context.Consumer>
        {(value: ContextType): React.ReactNode => {
          const injectedProps = objectAssign(
            {
              [PropName]: value
            },
            props
          ) as ComponentProps;
          return (
            <Component ref={ref} {...injectedProps} />
          )
        }}
      </Context.Consumer>
    )
  });
}

/**
 * Inject the value of a single React context into a component's property at runtime,
 * where that value might be undefined, while ensuring that users of the component can
 * not override or even see the property being injected into.
 * 
 * This allows components to automatically map properties to context values,
 * while ensuring consumers of the component don't see properties that they
 * don't need to provide a value for.
 * 
 * If the context value is undefined, the component is not instantiated at all. The
 * component prop being injected into should NOT accept undefined as a value.
 * 
 * @param Context The React v16 context object to pull the value from.
 * @param PropName The name of the property to inject the value into.
 * @param WrappedComponent The component that is being wrapped.
 * @returns The component that should be used by consumers or exported.
 * 
 * @example
 * // Import the InjectSingle function.
 * import { InjectSingle } from "react-injectable";
 * 
 * // The React v16 context (can be imported from elsewhere). In this case the
 * // context is initialised with undefined (no argument) so the context type
 * // is actually React.Context<string | undefined>.
 * export const MyContext = React.createContext<string>();
 * 
 * // The component properties (include injected properties here).
 * interface ExampleProps {
 *   someProp: string;
 *   requiredInjectedProp: string;
 * }
 * 
 * // The component declaration.
 * export const Example = InjectSingleGuarded(
 *   MyContext, 
 *   "requiredInjectedProp", 
 *   class Example extends React.Component<ExampleProps, {}> {
 *     constructor(props: ExampleProps) {
 *       super(props);
 *     }
 *   });
 *
 * // Using the component in code.
 * function usageExample() {
 *   return (
 *     <Example 
 *       someProp="hello"
 *     />
 *   );
 * }
 */
export function InjectSingleGuarded<K extends string, ContextType, ComponentProps extends { [KK in K]: ContextType }>(
  Context: React.Context<ContextType | undefined>,
  PropName: K,
  Component: React.ComponentType<ComponentProps & React.ClassAttributes<React.Component<ComponentProps>>>
): React.ComponentType<OuterProps<{ [KK in K]: ContextType }, ComponentProps> & React.ClassAttributes<React.Component<OuterProps<{ [KK in K]: ContextType }, ComponentProps>>>> {
  type ResultProps = OuterProps<{ [KK in K]: ContextType }, ComponentProps>;

  return React.forwardRef<React.ComponentType<ResultProps>, ResultProps>((props: ResultProps, ref?: React.RefObject<React.ComponentType<ResultProps>>) => {
    return (
      <Context.Consumer>
        {(value: ContextType | undefined): React.ReactNode => {
          if (value === undefined) {
            // Value is null, do not render wrapped component.
            return null;
          }
          const injectedProps = objectAssign(
            {
              [PropName]: value
            },
            props
          ) as ComponentProps;
          return (
            <Component ref={ref} {...injectedProps} />
          )
        }}
      </Context.Consumer>
    )
  });
}

/**
 * Inject the value of multiple React contexts into a set of component properties at runtime,
 * while ensuring that users of the component can not override or even see the
 * properties being injected into.
 * 
 * This allows components to automatically map properties to context values,
 * while ensuring consumers of the component don't see properties that they
 * don't need to provide a value for.
 * 
 * @param ContextMap A map of properties to React v16 context objects.
 * @param Component The component to inject properties into.
 * @returns The component that should be used by consumers or exported.
 * 
 * @example
 * // Import the Inject function.
 * import { Inject } from "react-injectable";
 * 
 * // The React v16 contexts (can be imported from elsewhere).
 * export const MyContext1 = React.createContext<SomeType>(...);
 * export const MyContext2 = React.createContext<string>("hello");
 * 
 * // The component properties (include injected properties here).
 * interface ExampleProps {
 *   someProp: string;
 *   injectedProp: SomeType;
 *   anotherInjectedProp: string;
 * }
 * 
 * // The component declaration.
 * export const Example = Inject(
 *   {
 *     injectedProp: MyContext1,
 *     anotherInjectedProp: MyContext2,
 *   },
 *   class Example extends React.Component<ExampleProps, {}> {
 *     constructor(props: ExampleProps) {
 *       super(props);
 *     }
 *   });
 *
 * // Using the component in code.
 * function usageExample() {
 *   return (
 *     <Example 
 *       someProp="hello"
 *     />
 *   );
 * }
 */
export function Inject<CV extends { [KX in keyof P]?: React.Context<P[KX]> }, P extends { [KK in keyof CV]: P[keyof CV] }>(
  ContextMap: CV,
  WrappedComponent: React.ComponentType<P & React.ClassAttributes<React.Component<P>>>
): React.ComponentType<OuterProps<CV, P> & React.ClassAttributes<React.Component<OuterProps<CV, P>>>> {
  // TODO: I don't think there's anyway to avoid the use of "any" here, since we can't
  // re-assign to "current" as we strip out each property iteratively.
  let current: React.ComponentType<any> = WrappedComponent;
  for (let cv in ContextMap) {
    current = InjectSingle(ContextMap[cv], cv, current);
  }
  return current;
}

/**
 * Inject the value of multiple React contexts into a set of component properties at runtime,
 * where the context values might be undefined, while ensuring that users of the component can 
 * not override or even see the properties being injected into.
 * 
 * This allows components to automatically map properties to context values,
 * while ensuring consumers of the component don't see properties that they
 * don't need to provide a value for.
 * 
 * If any of the context values are undefined, the component is not instantiated at all.
 * The component props being injected into should NOT accept undefined values.
 * 
 * @param ContextMap A map of properties to React v16 context objects.
 * @param Component The component to inject properties into.
 * @returns The component that should be used by consumers or exported.
 * 
 * @example
 * // Import the Inject function.
 * import { Inject } from "react-injectable";
 * 
 * // The React v16 contexts (can be imported from elsewhere). Because createContext
 * // is used with no arguments here, the resulting types are React.Context<SomeType | undefined>
 * // and React.Context<string | undefined> respectively.
 * export const MyContext1 = React.createContext<SomeType>();
 * export const MyContext2 = React.createContext<string>();
 * 
 * // The component properties (include injected properties here).
 * interface ExampleProps {
 *   someProp: string;
 *   injectedProp: SomeType;
 *   anotherInjectedProp: string;
 * }
 * 
 * // The component declaration.
 * export const Example = InjectGuarded(
 *   {
 *     injectedProp: MyContext1,
 *     anotherInjectedProp: MyContext2,
 *   },
 *   class Example extends React.Component<ExampleProps, {}> {
 *     constructor(props: ExampleProps) {
 *       super(props);
 *     }
 *   });
 *
 * // Using the component in code.
 * function usageExample() {
 *   return (
 *     <Example 
 *       someProp="hello"
 *     />
 *   );
 * }
 */
export function InjectGuarded<CV extends { [KX in keyof P]?: React.Context<P[KX] | undefined> }, P extends { [KK in keyof CV]: P[keyof CV] }>(
  ContextMap: CV,
  WrappedComponent: React.ComponentType<P & React.ClassAttributes<React.Component<P>>>
): React.ComponentType<OuterProps<CV, P> & React.ClassAttributes<React.Component<OuterProps<CV, P>>>> {
  // TODO: I don't think there's anyway to avoid the use of "any" here, since we can't
  // re-assign to "current" as we strip out each property iteratively.
  let current: React.ComponentType<any> = WrappedComponent;
  for (let cv in ContextMap) {
    current = InjectSingleGuarded(ContextMap[cv], cv, current);
  }
  return current;
}