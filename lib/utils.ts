export type IfdField = {
  type: number;
  length: number;
  value: string;
};

export const repeatString = (ch: string, num: number): string => {
  let str = ''
  for (let i = 0; i < num; i++) {
    str += ch
  }
  return str
}

export const atob = (input: string) => Buffer.from(input, 'base64').toString()

export const btoa = (input: string): string => Buffer.from(input).toString('base64')

export class None {
  // map(_f: (a: never) => unknown): None {
  //   return new None()
  // }
}

export class Some<T> {
  readonly value: T
  constructor(value: T) {
    this.value = value
  }

  // map<S>(f: (a: T) => S): Some<S> {
  //   return new Some(f(this.value))
  // }

}

export type Option<T> = None | Some<T>
