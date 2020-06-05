/*
export abstract class Either<Error, Data> {
    constructor(readonly value: Error | Data) {
        this.value = value;
    }

    isFailure(): boolean {
        return this instanceof Failure;
    }
    isSuccess(): boolean {
        return this instanceof Success;
    }

    map<T>(fn: (r: Data) => T): Either<Error, T> {
        return this.flatMap(r => new Success<T>(fn(r)));
    }

    flatMap<T>(fn: (right: Data) => Either<Error, T>): Either<Error, T> {
        return this.isFailure() ? new Failure<Error>(this.value as Error) : fn(this.value as Data);
    }

    fold<T>(leftFn: (left: Error) => T, rightFn: (right: Data) => T): T {
        return this.isFailure() ? leftFn(this.value as Error) : rightFn(this.value as Data);
    }

    static failure<Error>(left: Error) {
        return new Failure<Error>(left);
    }

    static success<Data>(right: Data) {
        return new Success<Data>(right);
    }
}

export class Failure<Error> extends Either<Error, never> {}

export class Success<Data> extends Either<never, Data> {}

export type StringEither<T> = Either<string, T>;
*/

type EitherValue<Error, Data> = { type: "error"; error: Error } | { type: "success"; data: Data };
type MatchObject<Error, Data, Res> = { success: (data: Data) => Res; error: (error: Error) => Res };

export class Either<Error, Data> {
    constructor(private value: EitherValue<Error, Data>) {}

    match<Res>(matchObj: MatchObject<Error, Data, Res>): Res {
        switch (this.value.type) {
            case "success":
                return matchObj.success(this.value.data);
            case "error":
                return matchObj.error(this.value.error);
        }
    }

    isFailure(): boolean {
        return this.value.type === "error";
    }

    isSuccess(): boolean {
        return this.value.type === "success";
    }

    map<Res>(fn: (data: Data) => Res): Either<Error, Res> {
        return this.match({
            success: data => new Either({ type: "success", data: fn(data) }),
            error: () => this as Either<Error, any>,
        });
    }

    /*
    map<T>(fn: (r: Data) => T): Either<Error, T> {
        return this.flatMap(r => new Success<T>(fn(r)));
    }

    flatMap<T>(fn: (right: Data) => Either<Error, T>): Either<Error, T> {
        return this.isFailure() ? new Failure<Error>(this.value as Error) : fn(this.value as Data);
    }

    fold<T>(leftFn: (left: Error) => T, rightFn: (right: Data) => T): T {
        return this.isFailure() ? leftFn(this.value as Error) : rightFn(this.value as Data);
    }
    */

    static error<Error>(error: Error) {
        return new Either<Error, never>({ type: "error", error });
    }

    static success<Data>(data: Data) {
        return new Either<never, Data>({ type: "success", data });
    }
}

export type StringEither<T> = Either<string, T>;
