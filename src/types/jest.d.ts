/**
 * Type definitions for Jest
 * 
 * This file provides basic type definitions for Jest testing functions
 * to support TypeScript typechecking in test files.
 */

// For testing environment
declare global {
  // Jest global functions
  function describe(name: string, fn: () => void): void;
  function test(name: string, fn: (done?: () => void) => any): void;
  function it(name: string, fn: (done?: () => void) => any): void;
  function expect(actual: any): any;
  function beforeEach(fn: () => any): void;
  function afterEach(fn: () => any): void;
  function beforeAll(fn: () => any): void;
  function afterAll(fn: () => any): void;
  
  // Jest Mock Functions
  const jest: {
    fn: <T extends (...args: any[]) => any>(implementation?: T) => jest.Mock<ReturnType<T>, Parameters<T>>;
    mock: (moduleName: string, factory?: any, options?: any) => any;
    spyOn: (object: any, methodName: string) => any;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
    restoreAllMocks: () => void;
  };
  
  namespace jest {
    interface Mock<T = any, Y extends any[] = any[]> {
      (...args: Y): T;
      mockImplementation: (fn: (...args: Y) => T) => Mock<T, Y>;
      mockReturnValue: (value: T) => Mock<T, Y>;
      mockReturnValueOnce: (value: T) => Mock<T, Y>;
      mockResolvedValue: (value: Awaited<T>) => Mock<Promise<Awaited<T>>, Y>;
      mockResolvedValueOnce: (value: Awaited<T>) => Mock<Promise<Awaited<T>>, Y>;
      mockRejectedValue: (value: any) => Mock<Promise<any>, Y>;
      mockRejectedValueOnce: (value: any) => Mock<Promise<any>, Y>;
      mockClear: () => Mock<T, Y>;
      mockReset: () => Mock<T, Y>;
      mockRestore: () => Mock<T, Y>;
      mockReturnThis: () => Mock<T, Y>;
      getMockName: () => string;
      mock: {
        calls: Y[];
        instances: any[];
        invocationCallOrder: number[];
        results: Array<{ type: 'return' | 'throw'; value: any }>;
      };
      mockName: (name: string) => Mock<T, Y>;
    }
  }
}