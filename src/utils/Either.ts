type EitherValue<Error, Data> = { type: "error"; error: Error } | { type: "success"; data: Data };

type MatchObject<Error, Data, Res> = {
    success: (data: Data) => Res;
    error: (error: Error) => Res;
};

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

    getFailure(): Error | undefined {
        return this.value.type === "error" ? this.value.error : undefined;
    }

    isFailure() {
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

    flatMap<Res>(fn: (data: Data) => Either<Error, Res>): Either<Error, Res> {
        return this.match({
            success: data => fn(data),
            error: () => this as Either<Error, any>,
        });
    }

    static map2<Data1, Data2, Error, Res>(
        eithers: [Either<Error, Data1>, Either<Error, Data2>],
        fn: (data1: Data1, data2: Data2) => Res
    ): Either<Error, Res> {
        const [either1, either2] = eithers;
        return either1.flatMap<Res>(data1 => {
            return either2.map<Res>(data2 => fn(data1, data2));
        });
    }

    static error<Error>(error: Error) {
        return new Either<Error, never>({ type: "error", error });
    }

    static success<Error, Data>(data: Data) {
        return new Either<Error, Data>({ type: "success", data });
    }
}

export type StringEither<T> = Either<string, T>;
