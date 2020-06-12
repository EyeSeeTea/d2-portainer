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

    isError() {
        return this.value.type === "error";
    }

    isSuccess(): boolean {
        return this.value.type === "success";
    }

    map<Res>(fn: (data: Data) => Res): Either<Error, Res> {
        return this.match({
            success: data => new Either<Error, Res>({ type: "success", data: fn(data) }),
            error: () => this as Either<Error, any>,
        });
    }

    flatMap<Res>(fn: (data: Data) => Either<Error, Res>): Either<Error, Res> {
        return this.match({
            success: data => fn(data),
            error: () => this as Either<Error, any>,
        });
    }

    static error<Error>(error: Error) {
        return new Either<Error, never>({ type: "error", error });
    }

    static success<Error, Data>(data: Data) {
        return new Either<Error, Data>({ type: "success", data });
    }

    static map2<Error, Res, Data1, Data2>(
        [either1, either2]: [Either<Error, Data1>, Either<Error, Data2>],
        fn: (data1: Data1, data2: Data2) => Res
    ): Either<Error, Res> {
        return either1.flatMap<Res>(data1 => {
            return either2.map<Res>(data2 => fn(data1, data2));
        });
    }
}
