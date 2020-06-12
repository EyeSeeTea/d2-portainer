import { Either } from "./Either";

export type Res<T> = Either<string, T>;

export type PromiseRes<T> = Promise<Res<T>>;
// https://github.com/microsoft/TypeScript/issues/12776#issuecomment-265885846
export const PromiseRes = Promise;
