type EitherValue<Error, Data> = { type: "error"; error: Error } | { type: "success"; data: Data };

export class Either<Error, Data> {
    private constructor(private readonly value: EitherValue<Error, Data>) {}

    static error<Error, Data>(error: Error) {
        return new Either<Error, Data>({ type: "error", error });
    }

    static success<Error, Data>(data: Data) {
        return new Either<Error, Data>({ type: "success", data });
    }

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

    map<DataRes>(fn: (data: Data) => DataRes): Either<Error, DataRes> {
        return this.flatMap(data => Either.success(fn(data)));
    }

    flatMap<DataRes>(fn: (data: Data) => Either<Error, DataRes>): Either<Error, DataRes> {
        return this.match({
            success: data => fn(data),
            error: error => Either.error(error),
        });
    }

    static map2<Error, DataRes, Data1, Data2>(
        [either1, either2]: [Either<Error, Data1>, Either<Error, Data2>],
        fn: (data1: Data1, data2: Data2) => DataRes
    ): Either<Error, DataRes> {
        return Either.flatMap2([either1, either2], (data1, data2) => {
            return Either.success(fn(data1, data2));
        });
    }

    static flatMap2<Error, DataRes, Data1, Data2>(
        [either1, either2]: [Either<Error, Data1>, Either<Error, Data2>],
        fn: (data1: Data1, data2: Data2) => Either<Error, DataRes>
    ): Either<Error, DataRes> {
        return either1.flatMap(data1 => {
            return either2.flatMap(data2 => fn(data1, data2));
        });
    }
}

interface MatchObject<Error, Data, Res> {
    success: (data: Data) => Res;
    error: (error: Error) => Res;
}
