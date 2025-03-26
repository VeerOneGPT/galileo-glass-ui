/**
 * Type definitions for React Testing Library
 *
 * This file provides basic type definitions for React Testing Library functions
 * to support TypeScript typechecking in test files.
 */

declare module '@testing-library/react' {
  import { ReactElement } from 'react';

  // Basic render result interface
  export interface RenderResult {
    container: HTMLElement;
    baseElement: HTMLElement;
    debug: (baseElement?: HTMLElement | DocumentFragment) => void;
    rerender: (ui: ReactElement) => void;
    unmount: () => boolean;
    asFragment: () => DocumentFragment;
    findByText: (text: string | RegExp) => Promise<HTMLElement>;
    findAllByText: (text: string | RegExp) => Promise<HTMLElement[]>;
    findByRole: (role: string) => Promise<HTMLElement>;
    findAllByRole: (role: string) => Promise<HTMLElement[]>;
    findByLabelText: (text: string | RegExp) => Promise<HTMLElement>;
    findAllByLabelText: (text: string | RegExp) => Promise<HTMLElement[]>;
    findByPlaceholderText: (text: string | RegExp) => Promise<HTMLElement>;
    findAllByPlaceholderText: (text: string | RegExp) => Promise<HTMLElement[]>;
    findByDisplayValue: (value: string | RegExp) => Promise<HTMLElement>;
    findAllByDisplayValue: (value: string | RegExp) => Promise<HTMLElement[]>;
    findByAltText: (text: string | RegExp) => Promise<HTMLElement>;
    findAllByAltText: (text: string | RegExp) => Promise<HTMLElement[]>;
    findByTitle: (text: string | RegExp) => Promise<HTMLElement>;
    findAllByTitle: (text: string | RegExp) => Promise<HTMLElement[]>;
    findByTestId: (id: string | RegExp) => Promise<HTMLElement>;
    findAllByTestId: (id: string | RegExp) => Promise<HTMLElement[]>;

    getByText: (text: string | RegExp) => HTMLElement;
    getAllByText: (text: string | RegExp) => HTMLElement[];
    getByRole: (role: string) => HTMLElement;
    getAllByRole: (role: string) => HTMLElement[];
    getByLabelText: (text: string | RegExp) => HTMLElement;
    getAllByLabelText: (text: string | RegExp) => HTMLElement[];
    getByPlaceholderText: (text: string | RegExp) => HTMLElement;
    getAllByPlaceholderText: (text: string | RegExp) => HTMLElement[];
    getByDisplayValue: (value: string | RegExp) => HTMLElement;
    getAllByDisplayValue: (value: string | RegExp) => HTMLElement[];
    getByAltText: (text: string | RegExp) => HTMLElement;
    getAllByAltText: (text: string | RegExp) => HTMLElement[];
    getByTitle: (text: string | RegExp) => HTMLElement;
    getAllByTitle: (text: string | RegExp) => HTMLElement[];
    getByTestId: (id: string | RegExp) => HTMLElement;
    getAllByTestId: (id: string | RegExp) => HTMLElement[];

    queryByText: (text: string | RegExp) => HTMLElement | null;
    queryAllByText: (text: string | RegExp) => HTMLElement[];
    queryByRole: (role: string) => HTMLElement | null;
    queryAllByRole: (role: string) => HTMLElement[];
    queryByLabelText: (text: string | RegExp) => HTMLElement | null;
    queryAllByLabelText: (text: string | RegExp) => HTMLElement[];
    queryByPlaceholderText: (text: string | RegExp) => HTMLElement | null;
    queryAllByPlaceholderText: (text: string | RegExp) => HTMLElement[];
    queryByDisplayValue: (value: string | RegExp) => HTMLElement | null;
    queryAllByDisplayValue: (value: string | RegExp) => HTMLElement[];
    queryByAltText: (text: string | RegExp) => HTMLElement | null;
    queryAllByAltText: (text: string | RegExp) => HTMLElement[];
    queryByTitle: (text: string | RegExp) => HTMLElement | null;
    queryAllByTitle: (text: string | RegExp) => HTMLElement[];
    queryByTestId: (id: string | RegExp) => HTMLElement | null;
    queryAllByTestId: (id: string | RegExp) => HTMLElement[];
  }

  export interface RenderOptions {
    container?: HTMLElement;
    baseElement?: HTMLElement;
    hydrate?: boolean;
    wrapper?: React.ComponentType;
  }

  export function render(ui: ReactElement, options?: RenderOptions): RenderResult;

  export function cleanup(): void;

  export function act(callback: () => void): void;
  export function act<T>(callback: () => Promise<T>): Promise<T>;

  // Screen object exports all queries bound to document.body
  // Hook testing functionality
  export interface RenderHookResult<TResult, TProps> {
    result: {
      current: TResult;
      error?: Error;
    };
    rerender: (props?: TProps) => void;
    unmount: () => void;
  }

  export function renderHook<TResult, TProps>(
    callback: (props: TProps) => TResult,
    options?: {
      initialProps?: TProps;
      wrapper?: React.ComponentType<any>;
    }
  ): RenderHookResult<TResult, TProps>;

  export const screen: {
    getByText: (text: string | RegExp, options?: any) => HTMLElement;
    getAllByText: (text: string | RegExp, options?: any) => HTMLElement[];
    queryByText: (text: string | RegExp, options?: any) => HTMLElement | null;
    queryAllByText: (text: string | RegExp, options?: any) => HTMLElement[];
    findByText: (text: string | RegExp, options?: any) => Promise<HTMLElement>;
    findAllByText: (text: string | RegExp, options?: any) => Promise<HTMLElement[]>;

    getByRole: (role: string, options?: any) => HTMLElement;
    getAllByRole: (role: string, options?: any) => HTMLElement[];
    queryByRole: (role: string, options?: any) => HTMLElement | null;
    queryAllByRole: (role: string, options?: any) => HTMLElement[];
    findByRole: (role: string, options?: any) => Promise<HTMLElement>;
    findAllByRole: (role: string, options?: any) => Promise<HTMLElement[]>;

    getByLabelText: (text: string | RegExp, options?: any) => HTMLElement;
    getAllByLabelText: (text: string | RegExp, options?: any) => HTMLElement[];
    queryByLabelText: (text: string | RegExp, options?: any) => HTMLElement | null;
    queryAllByLabelText: (text: string | RegExp, options?: any) => HTMLElement[];
    findByLabelText: (text: string | RegExp, options?: any) => Promise<HTMLElement>;
    findAllByLabelText: (text: string | RegExp, options?: any) => Promise<HTMLElement[]>;

    getByPlaceholderText: (text: string | RegExp, options?: any) => HTMLElement;
    getAllByPlaceholderText: (text: string | RegExp, options?: any) => HTMLElement[];
    queryByPlaceholderText: (text: string | RegExp, options?: any) => HTMLElement | null;
    queryAllByPlaceholderText: (text: string | RegExp, options?: any) => HTMLElement[];
    findByPlaceholderText: (text: string | RegExp, options?: any) => Promise<HTMLElement>;
    findAllByPlaceholderText: (text: string | RegExp, options?: any) => Promise<HTMLElement[]>;

    getByTestId: (testId: string | RegExp, options?: any) => HTMLElement;
    getAllByTestId: (testId: string | RegExp, options?: any) => HTMLElement[];
    queryByTestId: (testId: string | RegExp, options?: any) => HTMLElement | null;
    queryAllByTestId: (testId: string | RegExp, options?: any) => HTMLElement[];
    findByTestId: (testId: string | RegExp, options?: any) => Promise<HTMLElement>;
    findAllByTestId: (testId: string | RegExp, options?: any) => Promise<HTMLElement[]>;

    debug: (baseElement?: HTMLElement | DocumentFragment) => void;
  };

  export function waitFor<T>(
    callback: () => T | Promise<T>,
    options?: {
      container?: HTMLElement;
      timeout?: number;
      interval?: number;
      onTimeout?: (error: Error) => Error;
      mutationObserverOptions?: MutationObserverInit;
    }
  ): Promise<T>;

  export function fireEvent(element: Document | Element | Window, event: Event): boolean;

  export namespace fireEvent {
    export function click(element: Element): boolean;
    export function dblClick(element: Element): boolean;
    export function keyDown(element: Element, options?: any): boolean;
    export function keyPress(element: Element, options?: any): boolean;
    export function keyUp(element: Element, options?: any): boolean;
    export function focus(element: Element): boolean;
    export function blur(element: Element): boolean;
    export function change(element: Element, options?: any): boolean;
    export function submit(element: Element): boolean;
    export function mouseDown(element: Element): boolean;
    export function mouseEnter(element: Element): boolean;
    export function mouseLeave(element: Element): boolean;
    export function mouseMove(element: Element): boolean;
    export function mouseOut(element: Element): boolean;
    export function mouseOver(element: Element): boolean;
    export function mouseUp(element: Element): boolean;
  }
}
