
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Clinic
 * 
 */
export type Clinic = $Result.DefaultSelection<Prisma.$ClinicPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Provider
 * 
 */
export type Provider = $Result.DefaultSelection<Prisma.$ProviderPayload>
/**
 * Model MetricDefinition
 * 
 */
export type MetricDefinition = $Result.DefaultSelection<Prisma.$MetricDefinitionPayload>
/**
 * Model DataSource
 * 
 */
export type DataSource = $Result.DefaultSelection<Prisma.$DataSourcePayload>
/**
 * Model ColumnMapping
 * 
 */
export type ColumnMapping = $Result.DefaultSelection<Prisma.$ColumnMappingPayload>
/**
 * Model MetricValue
 * 
 */
export type MetricValue = $Result.DefaultSelection<Prisma.$MetricValuePayload>
/**
 * Model Goal
 * 
 */
export type Goal = $Result.DefaultSelection<Prisma.$GoalPayload>
/**
 * Model Dashboard
 * 
 */
export type Dashboard = $Result.DefaultSelection<Prisma.$DashboardPayload>
/**
 * Model Widget
 * 
 */
export type Widget = $Result.DefaultSelection<Prisma.$WidgetPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Clinics
 * const clinics = await prisma.clinic.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Clinics
   * const clinics = await prisma.clinic.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.clinic`: Exposes CRUD operations for the **Clinic** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Clinics
    * const clinics = await prisma.clinic.findMany()
    * ```
    */
  get clinic(): Prisma.ClinicDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.provider`: Exposes CRUD operations for the **Provider** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Providers
    * const providers = await prisma.provider.findMany()
    * ```
    */
  get provider(): Prisma.ProviderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.metricDefinition`: Exposes CRUD operations for the **MetricDefinition** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MetricDefinitions
    * const metricDefinitions = await prisma.metricDefinition.findMany()
    * ```
    */
  get metricDefinition(): Prisma.MetricDefinitionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dataSource`: Exposes CRUD operations for the **DataSource** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DataSources
    * const dataSources = await prisma.dataSource.findMany()
    * ```
    */
  get dataSource(): Prisma.DataSourceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.columnMapping`: Exposes CRUD operations for the **ColumnMapping** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ColumnMappings
    * const columnMappings = await prisma.columnMapping.findMany()
    * ```
    */
  get columnMapping(): Prisma.ColumnMappingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.metricValue`: Exposes CRUD operations for the **MetricValue** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MetricValues
    * const metricValues = await prisma.metricValue.findMany()
    * ```
    */
  get metricValue(): Prisma.MetricValueDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.goal`: Exposes CRUD operations for the **Goal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Goals
    * const goals = await prisma.goal.findMany()
    * ```
    */
  get goal(): Prisma.GoalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dashboard`: Exposes CRUD operations for the **Dashboard** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Dashboards
    * const dashboards = await prisma.dashboard.findMany()
    * ```
    */
  get dashboard(): Prisma.DashboardDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.widget`: Exposes CRUD operations for the **Widget** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Widgets
    * const widgets = await prisma.widget.findMany()
    * ```
    */
  get widget(): Prisma.WidgetDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Clinic: 'Clinic',
    User: 'User',
    Provider: 'Provider',
    MetricDefinition: 'MetricDefinition',
    DataSource: 'DataSource',
    ColumnMapping: 'ColumnMapping',
    MetricValue: 'MetricValue',
    Goal: 'Goal',
    Dashboard: 'Dashboard',
    Widget: 'Widget'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "clinic" | "user" | "provider" | "metricDefinition" | "dataSource" | "columnMapping" | "metricValue" | "goal" | "dashboard" | "widget"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Clinic: {
        payload: Prisma.$ClinicPayload<ExtArgs>
        fields: Prisma.ClinicFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClinicFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClinicFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload>
          }
          findFirst: {
            args: Prisma.ClinicFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClinicFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload>
          }
          findMany: {
            args: Prisma.ClinicFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload>[]
          }
          create: {
            args: Prisma.ClinicCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload>
          }
          createMany: {
            args: Prisma.ClinicCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClinicCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload>[]
          }
          delete: {
            args: Prisma.ClinicDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload>
          }
          update: {
            args: Prisma.ClinicUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload>
          }
          deleteMany: {
            args: Prisma.ClinicDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClinicUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClinicUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload>[]
          }
          upsert: {
            args: Prisma.ClinicUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicPayload>
          }
          aggregate: {
            args: Prisma.ClinicAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClinic>
          }
          groupBy: {
            args: Prisma.ClinicGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClinicGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClinicCountArgs<ExtArgs>
            result: $Utils.Optional<ClinicCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Provider: {
        payload: Prisma.$ProviderPayload<ExtArgs>
        fields: Prisma.ProviderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProviderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProviderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload>
          }
          findFirst: {
            args: Prisma.ProviderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProviderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload>
          }
          findMany: {
            args: Prisma.ProviderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload>[]
          }
          create: {
            args: Prisma.ProviderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload>
          }
          createMany: {
            args: Prisma.ProviderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProviderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload>[]
          }
          delete: {
            args: Prisma.ProviderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload>
          }
          update: {
            args: Prisma.ProviderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload>
          }
          deleteMany: {
            args: Prisma.ProviderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProviderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProviderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload>[]
          }
          upsert: {
            args: Prisma.ProviderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProviderPayload>
          }
          aggregate: {
            args: Prisma.ProviderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProvider>
          }
          groupBy: {
            args: Prisma.ProviderGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProviderGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProviderCountArgs<ExtArgs>
            result: $Utils.Optional<ProviderCountAggregateOutputType> | number
          }
        }
      }
      MetricDefinition: {
        payload: Prisma.$MetricDefinitionPayload<ExtArgs>
        fields: Prisma.MetricDefinitionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MetricDefinitionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MetricDefinitionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>
          }
          findFirst: {
            args: Prisma.MetricDefinitionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MetricDefinitionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>
          }
          findMany: {
            args: Prisma.MetricDefinitionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>[]
          }
          create: {
            args: Prisma.MetricDefinitionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>
          }
          createMany: {
            args: Prisma.MetricDefinitionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MetricDefinitionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>[]
          }
          delete: {
            args: Prisma.MetricDefinitionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>
          }
          update: {
            args: Prisma.MetricDefinitionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>
          }
          deleteMany: {
            args: Prisma.MetricDefinitionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MetricDefinitionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MetricDefinitionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>[]
          }
          upsert: {
            args: Prisma.MetricDefinitionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricDefinitionPayload>
          }
          aggregate: {
            args: Prisma.MetricDefinitionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMetricDefinition>
          }
          groupBy: {
            args: Prisma.MetricDefinitionGroupByArgs<ExtArgs>
            result: $Utils.Optional<MetricDefinitionGroupByOutputType>[]
          }
          count: {
            args: Prisma.MetricDefinitionCountArgs<ExtArgs>
            result: $Utils.Optional<MetricDefinitionCountAggregateOutputType> | number
          }
        }
      }
      DataSource: {
        payload: Prisma.$DataSourcePayload<ExtArgs>
        fields: Prisma.DataSourceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DataSourceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DataSourceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload>
          }
          findFirst: {
            args: Prisma.DataSourceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DataSourceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload>
          }
          findMany: {
            args: Prisma.DataSourceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload>[]
          }
          create: {
            args: Prisma.DataSourceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload>
          }
          createMany: {
            args: Prisma.DataSourceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DataSourceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload>[]
          }
          delete: {
            args: Prisma.DataSourceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload>
          }
          update: {
            args: Prisma.DataSourceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload>
          }
          deleteMany: {
            args: Prisma.DataSourceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DataSourceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DataSourceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload>[]
          }
          upsert: {
            args: Prisma.DataSourceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataSourcePayload>
          }
          aggregate: {
            args: Prisma.DataSourceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDataSource>
          }
          groupBy: {
            args: Prisma.DataSourceGroupByArgs<ExtArgs>
            result: $Utils.Optional<DataSourceGroupByOutputType>[]
          }
          count: {
            args: Prisma.DataSourceCountArgs<ExtArgs>
            result: $Utils.Optional<DataSourceCountAggregateOutputType> | number
          }
        }
      }
      ColumnMapping: {
        payload: Prisma.$ColumnMappingPayload<ExtArgs>
        fields: Prisma.ColumnMappingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ColumnMappingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ColumnMappingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload>
          }
          findFirst: {
            args: Prisma.ColumnMappingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ColumnMappingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload>
          }
          findMany: {
            args: Prisma.ColumnMappingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload>[]
          }
          create: {
            args: Prisma.ColumnMappingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload>
          }
          createMany: {
            args: Prisma.ColumnMappingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ColumnMappingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload>[]
          }
          delete: {
            args: Prisma.ColumnMappingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload>
          }
          update: {
            args: Prisma.ColumnMappingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload>
          }
          deleteMany: {
            args: Prisma.ColumnMappingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ColumnMappingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ColumnMappingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload>[]
          }
          upsert: {
            args: Prisma.ColumnMappingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnMappingPayload>
          }
          aggregate: {
            args: Prisma.ColumnMappingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateColumnMapping>
          }
          groupBy: {
            args: Prisma.ColumnMappingGroupByArgs<ExtArgs>
            result: $Utils.Optional<ColumnMappingGroupByOutputType>[]
          }
          count: {
            args: Prisma.ColumnMappingCountArgs<ExtArgs>
            result: $Utils.Optional<ColumnMappingCountAggregateOutputType> | number
          }
        }
      }
      MetricValue: {
        payload: Prisma.$MetricValuePayload<ExtArgs>
        fields: Prisma.MetricValueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MetricValueFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MetricValueFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload>
          }
          findFirst: {
            args: Prisma.MetricValueFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MetricValueFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload>
          }
          findMany: {
            args: Prisma.MetricValueFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload>[]
          }
          create: {
            args: Prisma.MetricValueCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload>
          }
          createMany: {
            args: Prisma.MetricValueCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MetricValueCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload>[]
          }
          delete: {
            args: Prisma.MetricValueDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload>
          }
          update: {
            args: Prisma.MetricValueUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload>
          }
          deleteMany: {
            args: Prisma.MetricValueDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MetricValueUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MetricValueUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload>[]
          }
          upsert: {
            args: Prisma.MetricValueUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MetricValuePayload>
          }
          aggregate: {
            args: Prisma.MetricValueAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMetricValue>
          }
          groupBy: {
            args: Prisma.MetricValueGroupByArgs<ExtArgs>
            result: $Utils.Optional<MetricValueGroupByOutputType>[]
          }
          count: {
            args: Prisma.MetricValueCountArgs<ExtArgs>
            result: $Utils.Optional<MetricValueCountAggregateOutputType> | number
          }
        }
      }
      Goal: {
        payload: Prisma.$GoalPayload<ExtArgs>
        fields: Prisma.GoalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GoalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GoalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          findFirst: {
            args: Prisma.GoalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GoalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          findMany: {
            args: Prisma.GoalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>[]
          }
          create: {
            args: Prisma.GoalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          createMany: {
            args: Prisma.GoalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GoalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>[]
          }
          delete: {
            args: Prisma.GoalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          update: {
            args: Prisma.GoalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          deleteMany: {
            args: Prisma.GoalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GoalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GoalUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>[]
          }
          upsert: {
            args: Prisma.GoalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          aggregate: {
            args: Prisma.GoalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGoal>
          }
          groupBy: {
            args: Prisma.GoalGroupByArgs<ExtArgs>
            result: $Utils.Optional<GoalGroupByOutputType>[]
          }
          count: {
            args: Prisma.GoalCountArgs<ExtArgs>
            result: $Utils.Optional<GoalCountAggregateOutputType> | number
          }
        }
      }
      Dashboard: {
        payload: Prisma.$DashboardPayload<ExtArgs>
        fields: Prisma.DashboardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DashboardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DashboardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload>
          }
          findFirst: {
            args: Prisma.DashboardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DashboardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload>
          }
          findMany: {
            args: Prisma.DashboardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload>[]
          }
          create: {
            args: Prisma.DashboardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload>
          }
          createMany: {
            args: Prisma.DashboardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DashboardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload>[]
          }
          delete: {
            args: Prisma.DashboardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload>
          }
          update: {
            args: Prisma.DashboardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload>
          }
          deleteMany: {
            args: Prisma.DashboardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DashboardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DashboardUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload>[]
          }
          upsert: {
            args: Prisma.DashboardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardPayload>
          }
          aggregate: {
            args: Prisma.DashboardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDashboard>
          }
          groupBy: {
            args: Prisma.DashboardGroupByArgs<ExtArgs>
            result: $Utils.Optional<DashboardGroupByOutputType>[]
          }
          count: {
            args: Prisma.DashboardCountArgs<ExtArgs>
            result: $Utils.Optional<DashboardCountAggregateOutputType> | number
          }
        }
      }
      Widget: {
        payload: Prisma.$WidgetPayload<ExtArgs>
        fields: Prisma.WidgetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WidgetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WidgetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload>
          }
          findFirst: {
            args: Prisma.WidgetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WidgetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload>
          }
          findMany: {
            args: Prisma.WidgetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload>[]
          }
          create: {
            args: Prisma.WidgetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload>
          }
          createMany: {
            args: Prisma.WidgetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WidgetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload>[]
          }
          delete: {
            args: Prisma.WidgetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload>
          }
          update: {
            args: Prisma.WidgetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload>
          }
          deleteMany: {
            args: Prisma.WidgetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WidgetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WidgetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload>[]
          }
          upsert: {
            args: Prisma.WidgetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WidgetPayload>
          }
          aggregate: {
            args: Prisma.WidgetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWidget>
          }
          groupBy: {
            args: Prisma.WidgetGroupByArgs<ExtArgs>
            result: $Utils.Optional<WidgetGroupByOutputType>[]
          }
          count: {
            args: Prisma.WidgetCountArgs<ExtArgs>
            result: $Utils.Optional<WidgetCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    clinic?: ClinicOmit
    user?: UserOmit
    provider?: ProviderOmit
    metricDefinition?: MetricDefinitionOmit
    dataSource?: DataSourceOmit
    columnMapping?: ColumnMappingOmit
    metricValue?: MetricValueOmit
    goal?: GoalOmit
    dashboard?: DashboardOmit
    widget?: WidgetOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ClinicCountOutputType
   */

  export type ClinicCountOutputType = {
    users: number
    providers: number
    metrics: number
    goals: number
  }

  export type ClinicCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | ClinicCountOutputTypeCountUsersArgs
    providers?: boolean | ClinicCountOutputTypeCountProvidersArgs
    metrics?: boolean | ClinicCountOutputTypeCountMetricsArgs
    goals?: boolean | ClinicCountOutputTypeCountGoalsArgs
  }

  // Custom InputTypes
  /**
   * ClinicCountOutputType without action
   */
  export type ClinicCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicCountOutputType
     */
    select?: ClinicCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClinicCountOutputType without action
   */
  export type ClinicCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * ClinicCountOutputType without action
   */
  export type ClinicCountOutputTypeCountProvidersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProviderWhereInput
  }

  /**
   * ClinicCountOutputType without action
   */
  export type ClinicCountOutputTypeCountMetricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MetricValueWhereInput
  }

  /**
   * ClinicCountOutputType without action
   */
  export type ClinicCountOutputTypeCountGoalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GoalWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    dashboards: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dashboards?: boolean | UserCountOutputTypeCountDashboardsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDashboardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DashboardWhereInput
  }


  /**
   * Count Type ProviderCountOutputType
   */

  export type ProviderCountOutputType = {
    metrics: number
    goals: number
  }

  export type ProviderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metrics?: boolean | ProviderCountOutputTypeCountMetricsArgs
    goals?: boolean | ProviderCountOutputTypeCountGoalsArgs
  }

  // Custom InputTypes
  /**
   * ProviderCountOutputType without action
   */
  export type ProviderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProviderCountOutputType
     */
    select?: ProviderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProviderCountOutputType without action
   */
  export type ProviderCountOutputTypeCountMetricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MetricValueWhereInput
  }

  /**
   * ProviderCountOutputType without action
   */
  export type ProviderCountOutputTypeCountGoalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GoalWhereInput
  }


  /**
   * Count Type MetricDefinitionCountOutputType
   */

  export type MetricDefinitionCountOutputType = {
    metrics: number
    columnMappings: number
    goals: number
    widgets: number
  }

  export type MetricDefinitionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metrics?: boolean | MetricDefinitionCountOutputTypeCountMetricsArgs
    columnMappings?: boolean | MetricDefinitionCountOutputTypeCountColumnMappingsArgs
    goals?: boolean | MetricDefinitionCountOutputTypeCountGoalsArgs
    widgets?: boolean | MetricDefinitionCountOutputTypeCountWidgetsArgs
  }

  // Custom InputTypes
  /**
   * MetricDefinitionCountOutputType without action
   */
  export type MetricDefinitionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinitionCountOutputType
     */
    select?: MetricDefinitionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MetricDefinitionCountOutputType without action
   */
  export type MetricDefinitionCountOutputTypeCountMetricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MetricValueWhereInput
  }

  /**
   * MetricDefinitionCountOutputType without action
   */
  export type MetricDefinitionCountOutputTypeCountColumnMappingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ColumnMappingWhereInput
  }

  /**
   * MetricDefinitionCountOutputType without action
   */
  export type MetricDefinitionCountOutputTypeCountGoalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GoalWhereInput
  }

  /**
   * MetricDefinitionCountOutputType without action
   */
  export type MetricDefinitionCountOutputTypeCountWidgetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WidgetWhereInput
  }


  /**
   * Count Type DataSourceCountOutputType
   */

  export type DataSourceCountOutputType = {
    columnMappings: number
    metrics: number
  }

  export type DataSourceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    columnMappings?: boolean | DataSourceCountOutputTypeCountColumnMappingsArgs
    metrics?: boolean | DataSourceCountOutputTypeCountMetricsArgs
  }

  // Custom InputTypes
  /**
   * DataSourceCountOutputType without action
   */
  export type DataSourceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSourceCountOutputType
     */
    select?: DataSourceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DataSourceCountOutputType without action
   */
  export type DataSourceCountOutputTypeCountColumnMappingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ColumnMappingWhereInput
  }

  /**
   * DataSourceCountOutputType without action
   */
  export type DataSourceCountOutputTypeCountMetricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MetricValueWhereInput
  }


  /**
   * Count Type DashboardCountOutputType
   */

  export type DashboardCountOutputType = {
    widgets: number
  }

  export type DashboardCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    widgets?: boolean | DashboardCountOutputTypeCountWidgetsArgs
  }

  // Custom InputTypes
  /**
   * DashboardCountOutputType without action
   */
  export type DashboardCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardCountOutputType
     */
    select?: DashboardCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DashboardCountOutputType without action
   */
  export type DashboardCountOutputTypeCountWidgetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WidgetWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Clinic
   */

  export type AggregateClinic = {
    _count: ClinicCountAggregateOutputType | null
    _min: ClinicMinAggregateOutputType | null
    _max: ClinicMaxAggregateOutputType | null
  }

  export type ClinicMinAggregateOutputType = {
    id: string | null
    name: string | null
    location: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClinicMaxAggregateOutputType = {
    id: string | null
    name: string | null
    location: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClinicCountAggregateOutputType = {
    id: number
    name: number
    location: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ClinicMinAggregateInputType = {
    id?: true
    name?: true
    location?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClinicMaxAggregateInputType = {
    id?: true
    name?: true
    location?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClinicCountAggregateInputType = {
    id?: true
    name?: true
    location?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ClinicAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Clinic to aggregate.
     */
    where?: ClinicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clinics to fetch.
     */
    orderBy?: ClinicOrderByWithRelationInput | ClinicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClinicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clinics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clinics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Clinics
    **/
    _count?: true | ClinicCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClinicMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClinicMaxAggregateInputType
  }

  export type GetClinicAggregateType<T extends ClinicAggregateArgs> = {
        [P in keyof T & keyof AggregateClinic]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClinic[P]>
      : GetScalarType<T[P], AggregateClinic[P]>
  }




  export type ClinicGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClinicWhereInput
    orderBy?: ClinicOrderByWithAggregationInput | ClinicOrderByWithAggregationInput[]
    by: ClinicScalarFieldEnum[] | ClinicScalarFieldEnum
    having?: ClinicScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClinicCountAggregateInputType | true
    _min?: ClinicMinAggregateInputType
    _max?: ClinicMaxAggregateInputType
  }

  export type ClinicGroupByOutputType = {
    id: string
    name: string
    location: string
    status: string
    createdAt: Date
    updatedAt: Date
    _count: ClinicCountAggregateOutputType | null
    _min: ClinicMinAggregateOutputType | null
    _max: ClinicMaxAggregateOutputType | null
  }

  type GetClinicGroupByPayload<T extends ClinicGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClinicGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClinicGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClinicGroupByOutputType[P]>
            : GetScalarType<T[P], ClinicGroupByOutputType[P]>
        }
      >
    >


  export type ClinicSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | Clinic$usersArgs<ExtArgs>
    providers?: boolean | Clinic$providersArgs<ExtArgs>
    metrics?: boolean | Clinic$metricsArgs<ExtArgs>
    goals?: boolean | Clinic$goalsArgs<ExtArgs>
    _count?: boolean | ClinicCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clinic"]>

  export type ClinicSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["clinic"]>

  export type ClinicSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["clinic"]>

  export type ClinicSelectScalar = {
    id?: boolean
    name?: boolean
    location?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ClinicOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "location" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["clinic"]>
  export type ClinicInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Clinic$usersArgs<ExtArgs>
    providers?: boolean | Clinic$providersArgs<ExtArgs>
    metrics?: boolean | Clinic$metricsArgs<ExtArgs>
    goals?: boolean | Clinic$goalsArgs<ExtArgs>
    _count?: boolean | ClinicCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClinicIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ClinicIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ClinicPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Clinic"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
      providers: Prisma.$ProviderPayload<ExtArgs>[]
      metrics: Prisma.$MetricValuePayload<ExtArgs>[]
      goals: Prisma.$GoalPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      location: string
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["clinic"]>
    composites: {}
  }

  type ClinicGetPayload<S extends boolean | null | undefined | ClinicDefaultArgs> = $Result.GetResult<Prisma.$ClinicPayload, S>

  type ClinicCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClinicFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClinicCountAggregateInputType | true
    }

  export interface ClinicDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Clinic'], meta: { name: 'Clinic' } }
    /**
     * Find zero or one Clinic that matches the filter.
     * @param {ClinicFindUniqueArgs} args - Arguments to find a Clinic
     * @example
     * // Get one Clinic
     * const clinic = await prisma.clinic.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClinicFindUniqueArgs>(args: SelectSubset<T, ClinicFindUniqueArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Clinic that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClinicFindUniqueOrThrowArgs} args - Arguments to find a Clinic
     * @example
     * // Get one Clinic
     * const clinic = await prisma.clinic.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClinicFindUniqueOrThrowArgs>(args: SelectSubset<T, ClinicFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Clinic that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicFindFirstArgs} args - Arguments to find a Clinic
     * @example
     * // Get one Clinic
     * const clinic = await prisma.clinic.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClinicFindFirstArgs>(args?: SelectSubset<T, ClinicFindFirstArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Clinic that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicFindFirstOrThrowArgs} args - Arguments to find a Clinic
     * @example
     * // Get one Clinic
     * const clinic = await prisma.clinic.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClinicFindFirstOrThrowArgs>(args?: SelectSubset<T, ClinicFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Clinics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Clinics
     * const clinics = await prisma.clinic.findMany()
     * 
     * // Get first 10 Clinics
     * const clinics = await prisma.clinic.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clinicWithIdOnly = await prisma.clinic.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClinicFindManyArgs>(args?: SelectSubset<T, ClinicFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Clinic.
     * @param {ClinicCreateArgs} args - Arguments to create a Clinic.
     * @example
     * // Create one Clinic
     * const Clinic = await prisma.clinic.create({
     *   data: {
     *     // ... data to create a Clinic
     *   }
     * })
     * 
     */
    create<T extends ClinicCreateArgs>(args: SelectSubset<T, ClinicCreateArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Clinics.
     * @param {ClinicCreateManyArgs} args - Arguments to create many Clinics.
     * @example
     * // Create many Clinics
     * const clinic = await prisma.clinic.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClinicCreateManyArgs>(args?: SelectSubset<T, ClinicCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Clinics and returns the data saved in the database.
     * @param {ClinicCreateManyAndReturnArgs} args - Arguments to create many Clinics.
     * @example
     * // Create many Clinics
     * const clinic = await prisma.clinic.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Clinics and only return the `id`
     * const clinicWithIdOnly = await prisma.clinic.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClinicCreateManyAndReturnArgs>(args?: SelectSubset<T, ClinicCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Clinic.
     * @param {ClinicDeleteArgs} args - Arguments to delete one Clinic.
     * @example
     * // Delete one Clinic
     * const Clinic = await prisma.clinic.delete({
     *   where: {
     *     // ... filter to delete one Clinic
     *   }
     * })
     * 
     */
    delete<T extends ClinicDeleteArgs>(args: SelectSubset<T, ClinicDeleteArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Clinic.
     * @param {ClinicUpdateArgs} args - Arguments to update one Clinic.
     * @example
     * // Update one Clinic
     * const clinic = await prisma.clinic.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClinicUpdateArgs>(args: SelectSubset<T, ClinicUpdateArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Clinics.
     * @param {ClinicDeleteManyArgs} args - Arguments to filter Clinics to delete.
     * @example
     * // Delete a few Clinics
     * const { count } = await prisma.clinic.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClinicDeleteManyArgs>(args?: SelectSubset<T, ClinicDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clinics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Clinics
     * const clinic = await prisma.clinic.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClinicUpdateManyArgs>(args: SelectSubset<T, ClinicUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clinics and returns the data updated in the database.
     * @param {ClinicUpdateManyAndReturnArgs} args - Arguments to update many Clinics.
     * @example
     * // Update many Clinics
     * const clinic = await prisma.clinic.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Clinics and only return the `id`
     * const clinicWithIdOnly = await prisma.clinic.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClinicUpdateManyAndReturnArgs>(args: SelectSubset<T, ClinicUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Clinic.
     * @param {ClinicUpsertArgs} args - Arguments to update or create a Clinic.
     * @example
     * // Update or create a Clinic
     * const clinic = await prisma.clinic.upsert({
     *   create: {
     *     // ... data to create a Clinic
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Clinic we want to update
     *   }
     * })
     */
    upsert<T extends ClinicUpsertArgs>(args: SelectSubset<T, ClinicUpsertArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Clinics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicCountArgs} args - Arguments to filter Clinics to count.
     * @example
     * // Count the number of Clinics
     * const count = await prisma.clinic.count({
     *   where: {
     *     // ... the filter for the Clinics we want to count
     *   }
     * })
    **/
    count<T extends ClinicCountArgs>(
      args?: Subset<T, ClinicCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClinicCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Clinic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClinicAggregateArgs>(args: Subset<T, ClinicAggregateArgs>): Prisma.PrismaPromise<GetClinicAggregateType<T>>

    /**
     * Group by Clinic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClinicGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClinicGroupByArgs['orderBy'] }
        : { orderBy?: ClinicGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClinicGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClinicGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Clinic model
   */
  readonly fields: ClinicFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Clinic.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClinicClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Clinic$usersArgs<ExtArgs> = {}>(args?: Subset<T, Clinic$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    providers<T extends Clinic$providersArgs<ExtArgs> = {}>(args?: Subset<T, Clinic$providersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    metrics<T extends Clinic$metricsArgs<ExtArgs> = {}>(args?: Subset<T, Clinic$metricsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    goals<T extends Clinic$goalsArgs<ExtArgs> = {}>(args?: Subset<T, Clinic$goalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Clinic model
   */
  interface ClinicFieldRefs {
    readonly id: FieldRef<"Clinic", 'String'>
    readonly name: FieldRef<"Clinic", 'String'>
    readonly location: FieldRef<"Clinic", 'String'>
    readonly status: FieldRef<"Clinic", 'String'>
    readonly createdAt: FieldRef<"Clinic", 'DateTime'>
    readonly updatedAt: FieldRef<"Clinic", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Clinic findUnique
   */
  export type ClinicFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    /**
     * Filter, which Clinic to fetch.
     */
    where: ClinicWhereUniqueInput
  }

  /**
   * Clinic findUniqueOrThrow
   */
  export type ClinicFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    /**
     * Filter, which Clinic to fetch.
     */
    where: ClinicWhereUniqueInput
  }

  /**
   * Clinic findFirst
   */
  export type ClinicFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    /**
     * Filter, which Clinic to fetch.
     */
    where?: ClinicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clinics to fetch.
     */
    orderBy?: ClinicOrderByWithRelationInput | ClinicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clinics.
     */
    cursor?: ClinicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clinics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clinics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clinics.
     */
    distinct?: ClinicScalarFieldEnum | ClinicScalarFieldEnum[]
  }

  /**
   * Clinic findFirstOrThrow
   */
  export type ClinicFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    /**
     * Filter, which Clinic to fetch.
     */
    where?: ClinicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clinics to fetch.
     */
    orderBy?: ClinicOrderByWithRelationInput | ClinicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clinics.
     */
    cursor?: ClinicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clinics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clinics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clinics.
     */
    distinct?: ClinicScalarFieldEnum | ClinicScalarFieldEnum[]
  }

  /**
   * Clinic findMany
   */
  export type ClinicFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    /**
     * Filter, which Clinics to fetch.
     */
    where?: ClinicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clinics to fetch.
     */
    orderBy?: ClinicOrderByWithRelationInput | ClinicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Clinics.
     */
    cursor?: ClinicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clinics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clinics.
     */
    skip?: number
    distinct?: ClinicScalarFieldEnum | ClinicScalarFieldEnum[]
  }

  /**
   * Clinic create
   */
  export type ClinicCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    /**
     * The data needed to create a Clinic.
     */
    data: XOR<ClinicCreateInput, ClinicUncheckedCreateInput>
  }

  /**
   * Clinic createMany
   */
  export type ClinicCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Clinics.
     */
    data: ClinicCreateManyInput | ClinicCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Clinic createManyAndReturn
   */
  export type ClinicCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * The data used to create many Clinics.
     */
    data: ClinicCreateManyInput | ClinicCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Clinic update
   */
  export type ClinicUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    /**
     * The data needed to update a Clinic.
     */
    data: XOR<ClinicUpdateInput, ClinicUncheckedUpdateInput>
    /**
     * Choose, which Clinic to update.
     */
    where: ClinicWhereUniqueInput
  }

  /**
   * Clinic updateMany
   */
  export type ClinicUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Clinics.
     */
    data: XOR<ClinicUpdateManyMutationInput, ClinicUncheckedUpdateManyInput>
    /**
     * Filter which Clinics to update
     */
    where?: ClinicWhereInput
    /**
     * Limit how many Clinics to update.
     */
    limit?: number
  }

  /**
   * Clinic updateManyAndReturn
   */
  export type ClinicUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * The data used to update Clinics.
     */
    data: XOR<ClinicUpdateManyMutationInput, ClinicUncheckedUpdateManyInput>
    /**
     * Filter which Clinics to update
     */
    where?: ClinicWhereInput
    /**
     * Limit how many Clinics to update.
     */
    limit?: number
  }

  /**
   * Clinic upsert
   */
  export type ClinicUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    /**
     * The filter to search for the Clinic to update in case it exists.
     */
    where: ClinicWhereUniqueInput
    /**
     * In case the Clinic found by the `where` argument doesn't exist, create a new Clinic with this data.
     */
    create: XOR<ClinicCreateInput, ClinicUncheckedCreateInput>
    /**
     * In case the Clinic was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClinicUpdateInput, ClinicUncheckedUpdateInput>
  }

  /**
   * Clinic delete
   */
  export type ClinicDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    /**
     * Filter which Clinic to delete.
     */
    where: ClinicWhereUniqueInput
  }

  /**
   * Clinic deleteMany
   */
  export type ClinicDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Clinics to delete
     */
    where?: ClinicWhereInput
    /**
     * Limit how many Clinics to delete.
     */
    limit?: number
  }

  /**
   * Clinic.users
   */
  export type Clinic$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Clinic.providers
   */
  export type Clinic$providersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    where?: ProviderWhereInput
    orderBy?: ProviderOrderByWithRelationInput | ProviderOrderByWithRelationInput[]
    cursor?: ProviderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProviderScalarFieldEnum | ProviderScalarFieldEnum[]
  }

  /**
   * Clinic.metrics
   */
  export type Clinic$metricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    where?: MetricValueWhereInput
    orderBy?: MetricValueOrderByWithRelationInput | MetricValueOrderByWithRelationInput[]
    cursor?: MetricValueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MetricValueScalarFieldEnum | MetricValueScalarFieldEnum[]
  }

  /**
   * Clinic.goals
   */
  export type Clinic$goalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    where?: GoalWhereInput
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    cursor?: GoalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * Clinic without action
   */
  export type ClinicDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    role: string | null
    lastLogin: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    clinicId: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    role: string | null
    lastLogin: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    clinicId: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    role: number
    lastLogin: number
    createdAt: number
    updatedAt: number
    clinicId: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    role?: true
    lastLogin?: true
    createdAt?: true
    updatedAt?: true
    clinicId?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    role?: true
    lastLogin?: true
    createdAt?: true
    updatedAt?: true
    clinicId?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    role?: true
    lastLogin?: true
    createdAt?: true
    updatedAt?: true
    clinicId?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string
    role: string
    lastLogin: Date | null
    createdAt: Date
    updatedAt: Date
    clinicId: string
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinicId?: boolean
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
    dashboards?: boolean | User$dashboardsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinicId?: boolean
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinicId?: boolean
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinicId?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "role" | "lastLogin" | "createdAt" | "updatedAt" | "clinicId", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
    dashboards?: boolean | User$dashboardsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      clinic: Prisma.$ClinicPayload<ExtArgs>
      dashboards: Prisma.$DashboardPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string
      role: string
      lastLogin: Date | null
      createdAt: Date
      updatedAt: Date
      clinicId: string
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    clinic<T extends ClinicDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClinicDefaultArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    dashboards<T extends User$dashboardsArgs<ExtArgs> = {}>(args?: Subset<T, User$dashboardsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly lastLogin: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly clinicId: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.dashboards
   */
  export type User$dashboardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    where?: DashboardWhereInput
    orderBy?: DashboardOrderByWithRelationInput | DashboardOrderByWithRelationInput[]
    cursor?: DashboardWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DashboardScalarFieldEnum | DashboardScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Provider
   */

  export type AggregateProvider = {
    _count: ProviderCountAggregateOutputType | null
    _min: ProviderMinAggregateOutputType | null
    _max: ProviderMaxAggregateOutputType | null
  }

  export type ProviderMinAggregateOutputType = {
    id: string | null
    name: string | null
    providerType: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clinicId: string | null
  }

  export type ProviderMaxAggregateOutputType = {
    id: string | null
    name: string | null
    providerType: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clinicId: string | null
  }

  export type ProviderCountAggregateOutputType = {
    id: number
    name: number
    providerType: number
    status: number
    createdAt: number
    updatedAt: number
    clinicId: number
    _all: number
  }


  export type ProviderMinAggregateInputType = {
    id?: true
    name?: true
    providerType?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    clinicId?: true
  }

  export type ProviderMaxAggregateInputType = {
    id?: true
    name?: true
    providerType?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    clinicId?: true
  }

  export type ProviderCountAggregateInputType = {
    id?: true
    name?: true
    providerType?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    clinicId?: true
    _all?: true
  }

  export type ProviderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Provider to aggregate.
     */
    where?: ProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Providers to fetch.
     */
    orderBy?: ProviderOrderByWithRelationInput | ProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Providers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Providers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Providers
    **/
    _count?: true | ProviderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProviderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProviderMaxAggregateInputType
  }

  export type GetProviderAggregateType<T extends ProviderAggregateArgs> = {
        [P in keyof T & keyof AggregateProvider]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProvider[P]>
      : GetScalarType<T[P], AggregateProvider[P]>
  }




  export type ProviderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProviderWhereInput
    orderBy?: ProviderOrderByWithAggregationInput | ProviderOrderByWithAggregationInput[]
    by: ProviderScalarFieldEnum[] | ProviderScalarFieldEnum
    having?: ProviderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProviderCountAggregateInputType | true
    _min?: ProviderMinAggregateInputType
    _max?: ProviderMaxAggregateInputType
  }

  export type ProviderGroupByOutputType = {
    id: string
    name: string
    providerType: string
    status: string
    createdAt: Date
    updatedAt: Date
    clinicId: string
    _count: ProviderCountAggregateOutputType | null
    _min: ProviderMinAggregateOutputType | null
    _max: ProviderMaxAggregateOutputType | null
  }

  type GetProviderGroupByPayload<T extends ProviderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProviderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProviderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProviderGroupByOutputType[P]>
            : GetScalarType<T[P], ProviderGroupByOutputType[P]>
        }
      >
    >


  export type ProviderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    providerType?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinicId?: boolean
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
    metrics?: boolean | Provider$metricsArgs<ExtArgs>
    goals?: boolean | Provider$goalsArgs<ExtArgs>
    _count?: boolean | ProviderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["provider"]>

  export type ProviderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    providerType?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinicId?: boolean
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["provider"]>

  export type ProviderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    providerType?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinicId?: boolean
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["provider"]>

  export type ProviderSelectScalar = {
    id?: boolean
    name?: boolean
    providerType?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinicId?: boolean
  }

  export type ProviderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "providerType" | "status" | "createdAt" | "updatedAt" | "clinicId", ExtArgs["result"]["provider"]>
  export type ProviderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
    metrics?: boolean | Provider$metricsArgs<ExtArgs>
    goals?: boolean | Provider$goalsArgs<ExtArgs>
    _count?: boolean | ProviderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProviderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
  }
  export type ProviderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinic?: boolean | ClinicDefaultArgs<ExtArgs>
  }

  export type $ProviderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Provider"
    objects: {
      clinic: Prisma.$ClinicPayload<ExtArgs>
      metrics: Prisma.$MetricValuePayload<ExtArgs>[]
      goals: Prisma.$GoalPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      providerType: string
      status: string
      createdAt: Date
      updatedAt: Date
      clinicId: string
    }, ExtArgs["result"]["provider"]>
    composites: {}
  }

  type ProviderGetPayload<S extends boolean | null | undefined | ProviderDefaultArgs> = $Result.GetResult<Prisma.$ProviderPayload, S>

  type ProviderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProviderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProviderCountAggregateInputType | true
    }

  export interface ProviderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Provider'], meta: { name: 'Provider' } }
    /**
     * Find zero or one Provider that matches the filter.
     * @param {ProviderFindUniqueArgs} args - Arguments to find a Provider
     * @example
     * // Get one Provider
     * const provider = await prisma.provider.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProviderFindUniqueArgs>(args: SelectSubset<T, ProviderFindUniqueArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Provider that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProviderFindUniqueOrThrowArgs} args - Arguments to find a Provider
     * @example
     * // Get one Provider
     * const provider = await prisma.provider.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProviderFindUniqueOrThrowArgs>(args: SelectSubset<T, ProviderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Provider that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProviderFindFirstArgs} args - Arguments to find a Provider
     * @example
     * // Get one Provider
     * const provider = await prisma.provider.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProviderFindFirstArgs>(args?: SelectSubset<T, ProviderFindFirstArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Provider that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProviderFindFirstOrThrowArgs} args - Arguments to find a Provider
     * @example
     * // Get one Provider
     * const provider = await prisma.provider.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProviderFindFirstOrThrowArgs>(args?: SelectSubset<T, ProviderFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Providers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProviderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Providers
     * const providers = await prisma.provider.findMany()
     * 
     * // Get first 10 Providers
     * const providers = await prisma.provider.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const providerWithIdOnly = await prisma.provider.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProviderFindManyArgs>(args?: SelectSubset<T, ProviderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Provider.
     * @param {ProviderCreateArgs} args - Arguments to create a Provider.
     * @example
     * // Create one Provider
     * const Provider = await prisma.provider.create({
     *   data: {
     *     // ... data to create a Provider
     *   }
     * })
     * 
     */
    create<T extends ProviderCreateArgs>(args: SelectSubset<T, ProviderCreateArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Providers.
     * @param {ProviderCreateManyArgs} args - Arguments to create many Providers.
     * @example
     * // Create many Providers
     * const provider = await prisma.provider.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProviderCreateManyArgs>(args?: SelectSubset<T, ProviderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Providers and returns the data saved in the database.
     * @param {ProviderCreateManyAndReturnArgs} args - Arguments to create many Providers.
     * @example
     * // Create many Providers
     * const provider = await prisma.provider.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Providers and only return the `id`
     * const providerWithIdOnly = await prisma.provider.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProviderCreateManyAndReturnArgs>(args?: SelectSubset<T, ProviderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Provider.
     * @param {ProviderDeleteArgs} args - Arguments to delete one Provider.
     * @example
     * // Delete one Provider
     * const Provider = await prisma.provider.delete({
     *   where: {
     *     // ... filter to delete one Provider
     *   }
     * })
     * 
     */
    delete<T extends ProviderDeleteArgs>(args: SelectSubset<T, ProviderDeleteArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Provider.
     * @param {ProviderUpdateArgs} args - Arguments to update one Provider.
     * @example
     * // Update one Provider
     * const provider = await prisma.provider.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProviderUpdateArgs>(args: SelectSubset<T, ProviderUpdateArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Providers.
     * @param {ProviderDeleteManyArgs} args - Arguments to filter Providers to delete.
     * @example
     * // Delete a few Providers
     * const { count } = await prisma.provider.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProviderDeleteManyArgs>(args?: SelectSubset<T, ProviderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Providers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProviderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Providers
     * const provider = await prisma.provider.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProviderUpdateManyArgs>(args: SelectSubset<T, ProviderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Providers and returns the data updated in the database.
     * @param {ProviderUpdateManyAndReturnArgs} args - Arguments to update many Providers.
     * @example
     * // Update many Providers
     * const provider = await prisma.provider.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Providers and only return the `id`
     * const providerWithIdOnly = await prisma.provider.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProviderUpdateManyAndReturnArgs>(args: SelectSubset<T, ProviderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Provider.
     * @param {ProviderUpsertArgs} args - Arguments to update or create a Provider.
     * @example
     * // Update or create a Provider
     * const provider = await prisma.provider.upsert({
     *   create: {
     *     // ... data to create a Provider
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Provider we want to update
     *   }
     * })
     */
    upsert<T extends ProviderUpsertArgs>(args: SelectSubset<T, ProviderUpsertArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Providers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProviderCountArgs} args - Arguments to filter Providers to count.
     * @example
     * // Count the number of Providers
     * const count = await prisma.provider.count({
     *   where: {
     *     // ... the filter for the Providers we want to count
     *   }
     * })
    **/
    count<T extends ProviderCountArgs>(
      args?: Subset<T, ProviderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProviderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Provider.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProviderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProviderAggregateArgs>(args: Subset<T, ProviderAggregateArgs>): Prisma.PrismaPromise<GetProviderAggregateType<T>>

    /**
     * Group by Provider.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProviderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProviderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProviderGroupByArgs['orderBy'] }
        : { orderBy?: ProviderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProviderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProviderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Provider model
   */
  readonly fields: ProviderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Provider.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProviderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    clinic<T extends ClinicDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClinicDefaultArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    metrics<T extends Provider$metricsArgs<ExtArgs> = {}>(args?: Subset<T, Provider$metricsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    goals<T extends Provider$goalsArgs<ExtArgs> = {}>(args?: Subset<T, Provider$goalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Provider model
   */
  interface ProviderFieldRefs {
    readonly id: FieldRef<"Provider", 'String'>
    readonly name: FieldRef<"Provider", 'String'>
    readonly providerType: FieldRef<"Provider", 'String'>
    readonly status: FieldRef<"Provider", 'String'>
    readonly createdAt: FieldRef<"Provider", 'DateTime'>
    readonly updatedAt: FieldRef<"Provider", 'DateTime'>
    readonly clinicId: FieldRef<"Provider", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Provider findUnique
   */
  export type ProviderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    /**
     * Filter, which Provider to fetch.
     */
    where: ProviderWhereUniqueInput
  }

  /**
   * Provider findUniqueOrThrow
   */
  export type ProviderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    /**
     * Filter, which Provider to fetch.
     */
    where: ProviderWhereUniqueInput
  }

  /**
   * Provider findFirst
   */
  export type ProviderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    /**
     * Filter, which Provider to fetch.
     */
    where?: ProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Providers to fetch.
     */
    orderBy?: ProviderOrderByWithRelationInput | ProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Providers.
     */
    cursor?: ProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Providers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Providers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Providers.
     */
    distinct?: ProviderScalarFieldEnum | ProviderScalarFieldEnum[]
  }

  /**
   * Provider findFirstOrThrow
   */
  export type ProviderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    /**
     * Filter, which Provider to fetch.
     */
    where?: ProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Providers to fetch.
     */
    orderBy?: ProviderOrderByWithRelationInput | ProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Providers.
     */
    cursor?: ProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Providers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Providers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Providers.
     */
    distinct?: ProviderScalarFieldEnum | ProviderScalarFieldEnum[]
  }

  /**
   * Provider findMany
   */
  export type ProviderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    /**
     * Filter, which Providers to fetch.
     */
    where?: ProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Providers to fetch.
     */
    orderBy?: ProviderOrderByWithRelationInput | ProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Providers.
     */
    cursor?: ProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Providers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Providers.
     */
    skip?: number
    distinct?: ProviderScalarFieldEnum | ProviderScalarFieldEnum[]
  }

  /**
   * Provider create
   */
  export type ProviderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    /**
     * The data needed to create a Provider.
     */
    data: XOR<ProviderCreateInput, ProviderUncheckedCreateInput>
  }

  /**
   * Provider createMany
   */
  export type ProviderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Providers.
     */
    data: ProviderCreateManyInput | ProviderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Provider createManyAndReturn
   */
  export type ProviderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * The data used to create many Providers.
     */
    data: ProviderCreateManyInput | ProviderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Provider update
   */
  export type ProviderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    /**
     * The data needed to update a Provider.
     */
    data: XOR<ProviderUpdateInput, ProviderUncheckedUpdateInput>
    /**
     * Choose, which Provider to update.
     */
    where: ProviderWhereUniqueInput
  }

  /**
   * Provider updateMany
   */
  export type ProviderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Providers.
     */
    data: XOR<ProviderUpdateManyMutationInput, ProviderUncheckedUpdateManyInput>
    /**
     * Filter which Providers to update
     */
    where?: ProviderWhereInput
    /**
     * Limit how many Providers to update.
     */
    limit?: number
  }

  /**
   * Provider updateManyAndReturn
   */
  export type ProviderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * The data used to update Providers.
     */
    data: XOR<ProviderUpdateManyMutationInput, ProviderUncheckedUpdateManyInput>
    /**
     * Filter which Providers to update
     */
    where?: ProviderWhereInput
    /**
     * Limit how many Providers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Provider upsert
   */
  export type ProviderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    /**
     * The filter to search for the Provider to update in case it exists.
     */
    where: ProviderWhereUniqueInput
    /**
     * In case the Provider found by the `where` argument doesn't exist, create a new Provider with this data.
     */
    create: XOR<ProviderCreateInput, ProviderUncheckedCreateInput>
    /**
     * In case the Provider was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProviderUpdateInput, ProviderUncheckedUpdateInput>
  }

  /**
   * Provider delete
   */
  export type ProviderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    /**
     * Filter which Provider to delete.
     */
    where: ProviderWhereUniqueInput
  }

  /**
   * Provider deleteMany
   */
  export type ProviderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Providers to delete
     */
    where?: ProviderWhereInput
    /**
     * Limit how many Providers to delete.
     */
    limit?: number
  }

  /**
   * Provider.metrics
   */
  export type Provider$metricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    where?: MetricValueWhereInput
    orderBy?: MetricValueOrderByWithRelationInput | MetricValueOrderByWithRelationInput[]
    cursor?: MetricValueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MetricValueScalarFieldEnum | MetricValueScalarFieldEnum[]
  }

  /**
   * Provider.goals
   */
  export type Provider$goalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    where?: GoalWhereInput
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    cursor?: GoalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * Provider without action
   */
  export type ProviderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
  }


  /**
   * Model MetricDefinition
   */

  export type AggregateMetricDefinition = {
    _count: MetricDefinitionCountAggregateOutputType | null
    _min: MetricDefinitionMinAggregateOutputType | null
    _max: MetricDefinitionMaxAggregateOutputType | null
  }

  export type MetricDefinitionMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    dataType: string | null
    calculationFormula: string | null
    category: string | null
    isComposite: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MetricDefinitionMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    dataType: string | null
    calculationFormula: string | null
    category: string | null
    isComposite: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MetricDefinitionCountAggregateOutputType = {
    id: number
    name: number
    description: number
    dataType: number
    calculationFormula: number
    category: number
    isComposite: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MetricDefinitionMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    dataType?: true
    calculationFormula?: true
    category?: true
    isComposite?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MetricDefinitionMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    dataType?: true
    calculationFormula?: true
    category?: true
    isComposite?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MetricDefinitionCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    dataType?: true
    calculationFormula?: true
    category?: true
    isComposite?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MetricDefinitionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MetricDefinition to aggregate.
     */
    where?: MetricDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricDefinitions to fetch.
     */
    orderBy?: MetricDefinitionOrderByWithRelationInput | MetricDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MetricDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricDefinitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MetricDefinitions
    **/
    _count?: true | MetricDefinitionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MetricDefinitionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MetricDefinitionMaxAggregateInputType
  }

  export type GetMetricDefinitionAggregateType<T extends MetricDefinitionAggregateArgs> = {
        [P in keyof T & keyof AggregateMetricDefinition]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMetricDefinition[P]>
      : GetScalarType<T[P], AggregateMetricDefinition[P]>
  }




  export type MetricDefinitionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MetricDefinitionWhereInput
    orderBy?: MetricDefinitionOrderByWithAggregationInput | MetricDefinitionOrderByWithAggregationInput[]
    by: MetricDefinitionScalarFieldEnum[] | MetricDefinitionScalarFieldEnum
    having?: MetricDefinitionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MetricDefinitionCountAggregateInputType | true
    _min?: MetricDefinitionMinAggregateInputType
    _max?: MetricDefinitionMaxAggregateInputType
  }

  export type MetricDefinitionGroupByOutputType = {
    id: string
    name: string
    description: string
    dataType: string
    calculationFormula: string | null
    category: string
    isComposite: boolean
    createdAt: Date
    updatedAt: Date
    _count: MetricDefinitionCountAggregateOutputType | null
    _min: MetricDefinitionMinAggregateOutputType | null
    _max: MetricDefinitionMaxAggregateOutputType | null
  }

  type GetMetricDefinitionGroupByPayload<T extends MetricDefinitionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MetricDefinitionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MetricDefinitionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MetricDefinitionGroupByOutputType[P]>
            : GetScalarType<T[P], MetricDefinitionGroupByOutputType[P]>
        }
      >
    >


  export type MetricDefinitionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    dataType?: boolean
    calculationFormula?: boolean
    category?: boolean
    isComposite?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    metrics?: boolean | MetricDefinition$metricsArgs<ExtArgs>
    columnMappings?: boolean | MetricDefinition$columnMappingsArgs<ExtArgs>
    goals?: boolean | MetricDefinition$goalsArgs<ExtArgs>
    widgets?: boolean | MetricDefinition$widgetsArgs<ExtArgs>
    _count?: boolean | MetricDefinitionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["metricDefinition"]>

  export type MetricDefinitionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    dataType?: boolean
    calculationFormula?: boolean
    category?: boolean
    isComposite?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["metricDefinition"]>

  export type MetricDefinitionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    dataType?: boolean
    calculationFormula?: boolean
    category?: boolean
    isComposite?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["metricDefinition"]>

  export type MetricDefinitionSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    dataType?: boolean
    calculationFormula?: boolean
    category?: boolean
    isComposite?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MetricDefinitionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "dataType" | "calculationFormula" | "category" | "isComposite" | "createdAt" | "updatedAt", ExtArgs["result"]["metricDefinition"]>
  export type MetricDefinitionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metrics?: boolean | MetricDefinition$metricsArgs<ExtArgs>
    columnMappings?: boolean | MetricDefinition$columnMappingsArgs<ExtArgs>
    goals?: boolean | MetricDefinition$goalsArgs<ExtArgs>
    widgets?: boolean | MetricDefinition$widgetsArgs<ExtArgs>
    _count?: boolean | MetricDefinitionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MetricDefinitionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type MetricDefinitionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MetricDefinitionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MetricDefinition"
    objects: {
      metrics: Prisma.$MetricValuePayload<ExtArgs>[]
      columnMappings: Prisma.$ColumnMappingPayload<ExtArgs>[]
      goals: Prisma.$GoalPayload<ExtArgs>[]
      widgets: Prisma.$WidgetPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string
      dataType: string
      calculationFormula: string | null
      category: string
      isComposite: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["metricDefinition"]>
    composites: {}
  }

  type MetricDefinitionGetPayload<S extends boolean | null | undefined | MetricDefinitionDefaultArgs> = $Result.GetResult<Prisma.$MetricDefinitionPayload, S>

  type MetricDefinitionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MetricDefinitionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MetricDefinitionCountAggregateInputType | true
    }

  export interface MetricDefinitionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MetricDefinition'], meta: { name: 'MetricDefinition' } }
    /**
     * Find zero or one MetricDefinition that matches the filter.
     * @param {MetricDefinitionFindUniqueArgs} args - Arguments to find a MetricDefinition
     * @example
     * // Get one MetricDefinition
     * const metricDefinition = await prisma.metricDefinition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MetricDefinitionFindUniqueArgs>(args: SelectSubset<T, MetricDefinitionFindUniqueArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MetricDefinition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MetricDefinitionFindUniqueOrThrowArgs} args - Arguments to find a MetricDefinition
     * @example
     * // Get one MetricDefinition
     * const metricDefinition = await prisma.metricDefinition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MetricDefinitionFindUniqueOrThrowArgs>(args: SelectSubset<T, MetricDefinitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MetricDefinition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricDefinitionFindFirstArgs} args - Arguments to find a MetricDefinition
     * @example
     * // Get one MetricDefinition
     * const metricDefinition = await prisma.metricDefinition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MetricDefinitionFindFirstArgs>(args?: SelectSubset<T, MetricDefinitionFindFirstArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MetricDefinition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricDefinitionFindFirstOrThrowArgs} args - Arguments to find a MetricDefinition
     * @example
     * // Get one MetricDefinition
     * const metricDefinition = await prisma.metricDefinition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MetricDefinitionFindFirstOrThrowArgs>(args?: SelectSubset<T, MetricDefinitionFindFirstOrThrowArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MetricDefinitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricDefinitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MetricDefinitions
     * const metricDefinitions = await prisma.metricDefinition.findMany()
     * 
     * // Get first 10 MetricDefinitions
     * const metricDefinitions = await prisma.metricDefinition.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const metricDefinitionWithIdOnly = await prisma.metricDefinition.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MetricDefinitionFindManyArgs>(args?: SelectSubset<T, MetricDefinitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MetricDefinition.
     * @param {MetricDefinitionCreateArgs} args - Arguments to create a MetricDefinition.
     * @example
     * // Create one MetricDefinition
     * const MetricDefinition = await prisma.metricDefinition.create({
     *   data: {
     *     // ... data to create a MetricDefinition
     *   }
     * })
     * 
     */
    create<T extends MetricDefinitionCreateArgs>(args: SelectSubset<T, MetricDefinitionCreateArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MetricDefinitions.
     * @param {MetricDefinitionCreateManyArgs} args - Arguments to create many MetricDefinitions.
     * @example
     * // Create many MetricDefinitions
     * const metricDefinition = await prisma.metricDefinition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MetricDefinitionCreateManyArgs>(args?: SelectSubset<T, MetricDefinitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MetricDefinitions and returns the data saved in the database.
     * @param {MetricDefinitionCreateManyAndReturnArgs} args - Arguments to create many MetricDefinitions.
     * @example
     * // Create many MetricDefinitions
     * const metricDefinition = await prisma.metricDefinition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MetricDefinitions and only return the `id`
     * const metricDefinitionWithIdOnly = await prisma.metricDefinition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MetricDefinitionCreateManyAndReturnArgs>(args?: SelectSubset<T, MetricDefinitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MetricDefinition.
     * @param {MetricDefinitionDeleteArgs} args - Arguments to delete one MetricDefinition.
     * @example
     * // Delete one MetricDefinition
     * const MetricDefinition = await prisma.metricDefinition.delete({
     *   where: {
     *     // ... filter to delete one MetricDefinition
     *   }
     * })
     * 
     */
    delete<T extends MetricDefinitionDeleteArgs>(args: SelectSubset<T, MetricDefinitionDeleteArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MetricDefinition.
     * @param {MetricDefinitionUpdateArgs} args - Arguments to update one MetricDefinition.
     * @example
     * // Update one MetricDefinition
     * const metricDefinition = await prisma.metricDefinition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MetricDefinitionUpdateArgs>(args: SelectSubset<T, MetricDefinitionUpdateArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MetricDefinitions.
     * @param {MetricDefinitionDeleteManyArgs} args - Arguments to filter MetricDefinitions to delete.
     * @example
     * // Delete a few MetricDefinitions
     * const { count } = await prisma.metricDefinition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MetricDefinitionDeleteManyArgs>(args?: SelectSubset<T, MetricDefinitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MetricDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricDefinitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MetricDefinitions
     * const metricDefinition = await prisma.metricDefinition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MetricDefinitionUpdateManyArgs>(args: SelectSubset<T, MetricDefinitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MetricDefinitions and returns the data updated in the database.
     * @param {MetricDefinitionUpdateManyAndReturnArgs} args - Arguments to update many MetricDefinitions.
     * @example
     * // Update many MetricDefinitions
     * const metricDefinition = await prisma.metricDefinition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MetricDefinitions and only return the `id`
     * const metricDefinitionWithIdOnly = await prisma.metricDefinition.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MetricDefinitionUpdateManyAndReturnArgs>(args: SelectSubset<T, MetricDefinitionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MetricDefinition.
     * @param {MetricDefinitionUpsertArgs} args - Arguments to update or create a MetricDefinition.
     * @example
     * // Update or create a MetricDefinition
     * const metricDefinition = await prisma.metricDefinition.upsert({
     *   create: {
     *     // ... data to create a MetricDefinition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MetricDefinition we want to update
     *   }
     * })
     */
    upsert<T extends MetricDefinitionUpsertArgs>(args: SelectSubset<T, MetricDefinitionUpsertArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MetricDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricDefinitionCountArgs} args - Arguments to filter MetricDefinitions to count.
     * @example
     * // Count the number of MetricDefinitions
     * const count = await prisma.metricDefinition.count({
     *   where: {
     *     // ... the filter for the MetricDefinitions we want to count
     *   }
     * })
    **/
    count<T extends MetricDefinitionCountArgs>(
      args?: Subset<T, MetricDefinitionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MetricDefinitionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MetricDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricDefinitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MetricDefinitionAggregateArgs>(args: Subset<T, MetricDefinitionAggregateArgs>): Prisma.PrismaPromise<GetMetricDefinitionAggregateType<T>>

    /**
     * Group by MetricDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricDefinitionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MetricDefinitionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MetricDefinitionGroupByArgs['orderBy'] }
        : { orderBy?: MetricDefinitionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MetricDefinitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMetricDefinitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MetricDefinition model
   */
  readonly fields: MetricDefinitionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MetricDefinition.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MetricDefinitionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    metrics<T extends MetricDefinition$metricsArgs<ExtArgs> = {}>(args?: Subset<T, MetricDefinition$metricsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    columnMappings<T extends MetricDefinition$columnMappingsArgs<ExtArgs> = {}>(args?: Subset<T, MetricDefinition$columnMappingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    goals<T extends MetricDefinition$goalsArgs<ExtArgs> = {}>(args?: Subset<T, MetricDefinition$goalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    widgets<T extends MetricDefinition$widgetsArgs<ExtArgs> = {}>(args?: Subset<T, MetricDefinition$widgetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MetricDefinition model
   */
  interface MetricDefinitionFieldRefs {
    readonly id: FieldRef<"MetricDefinition", 'String'>
    readonly name: FieldRef<"MetricDefinition", 'String'>
    readonly description: FieldRef<"MetricDefinition", 'String'>
    readonly dataType: FieldRef<"MetricDefinition", 'String'>
    readonly calculationFormula: FieldRef<"MetricDefinition", 'String'>
    readonly category: FieldRef<"MetricDefinition", 'String'>
    readonly isComposite: FieldRef<"MetricDefinition", 'Boolean'>
    readonly createdAt: FieldRef<"MetricDefinition", 'DateTime'>
    readonly updatedAt: FieldRef<"MetricDefinition", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MetricDefinition findUnique
   */
  export type MetricDefinitionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MetricDefinition to fetch.
     */
    where: MetricDefinitionWhereUniqueInput
  }

  /**
   * MetricDefinition findUniqueOrThrow
   */
  export type MetricDefinitionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MetricDefinition to fetch.
     */
    where: MetricDefinitionWhereUniqueInput
  }

  /**
   * MetricDefinition findFirst
   */
  export type MetricDefinitionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MetricDefinition to fetch.
     */
    where?: MetricDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricDefinitions to fetch.
     */
    orderBy?: MetricDefinitionOrderByWithRelationInput | MetricDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MetricDefinitions.
     */
    cursor?: MetricDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricDefinitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MetricDefinitions.
     */
    distinct?: MetricDefinitionScalarFieldEnum | MetricDefinitionScalarFieldEnum[]
  }

  /**
   * MetricDefinition findFirstOrThrow
   */
  export type MetricDefinitionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MetricDefinition to fetch.
     */
    where?: MetricDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricDefinitions to fetch.
     */
    orderBy?: MetricDefinitionOrderByWithRelationInput | MetricDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MetricDefinitions.
     */
    cursor?: MetricDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricDefinitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MetricDefinitions.
     */
    distinct?: MetricDefinitionScalarFieldEnum | MetricDefinitionScalarFieldEnum[]
  }

  /**
   * MetricDefinition findMany
   */
  export type MetricDefinitionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MetricDefinitions to fetch.
     */
    where?: MetricDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricDefinitions to fetch.
     */
    orderBy?: MetricDefinitionOrderByWithRelationInput | MetricDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MetricDefinitions.
     */
    cursor?: MetricDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricDefinitions.
     */
    skip?: number
    distinct?: MetricDefinitionScalarFieldEnum | MetricDefinitionScalarFieldEnum[]
  }

  /**
   * MetricDefinition create
   */
  export type MetricDefinitionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    /**
     * The data needed to create a MetricDefinition.
     */
    data: XOR<MetricDefinitionCreateInput, MetricDefinitionUncheckedCreateInput>
  }

  /**
   * MetricDefinition createMany
   */
  export type MetricDefinitionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MetricDefinitions.
     */
    data: MetricDefinitionCreateManyInput | MetricDefinitionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MetricDefinition createManyAndReturn
   */
  export type MetricDefinitionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * The data used to create many MetricDefinitions.
     */
    data: MetricDefinitionCreateManyInput | MetricDefinitionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MetricDefinition update
   */
  export type MetricDefinitionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    /**
     * The data needed to update a MetricDefinition.
     */
    data: XOR<MetricDefinitionUpdateInput, MetricDefinitionUncheckedUpdateInput>
    /**
     * Choose, which MetricDefinition to update.
     */
    where: MetricDefinitionWhereUniqueInput
  }

  /**
   * MetricDefinition updateMany
   */
  export type MetricDefinitionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MetricDefinitions.
     */
    data: XOR<MetricDefinitionUpdateManyMutationInput, MetricDefinitionUncheckedUpdateManyInput>
    /**
     * Filter which MetricDefinitions to update
     */
    where?: MetricDefinitionWhereInput
    /**
     * Limit how many MetricDefinitions to update.
     */
    limit?: number
  }

  /**
   * MetricDefinition updateManyAndReturn
   */
  export type MetricDefinitionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * The data used to update MetricDefinitions.
     */
    data: XOR<MetricDefinitionUpdateManyMutationInput, MetricDefinitionUncheckedUpdateManyInput>
    /**
     * Filter which MetricDefinitions to update
     */
    where?: MetricDefinitionWhereInput
    /**
     * Limit how many MetricDefinitions to update.
     */
    limit?: number
  }

  /**
   * MetricDefinition upsert
   */
  export type MetricDefinitionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    /**
     * The filter to search for the MetricDefinition to update in case it exists.
     */
    where: MetricDefinitionWhereUniqueInput
    /**
     * In case the MetricDefinition found by the `where` argument doesn't exist, create a new MetricDefinition with this data.
     */
    create: XOR<MetricDefinitionCreateInput, MetricDefinitionUncheckedCreateInput>
    /**
     * In case the MetricDefinition was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MetricDefinitionUpdateInput, MetricDefinitionUncheckedUpdateInput>
  }

  /**
   * MetricDefinition delete
   */
  export type MetricDefinitionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    /**
     * Filter which MetricDefinition to delete.
     */
    where: MetricDefinitionWhereUniqueInput
  }

  /**
   * MetricDefinition deleteMany
   */
  export type MetricDefinitionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MetricDefinitions to delete
     */
    where?: MetricDefinitionWhereInput
    /**
     * Limit how many MetricDefinitions to delete.
     */
    limit?: number
  }

  /**
   * MetricDefinition.metrics
   */
  export type MetricDefinition$metricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    where?: MetricValueWhereInput
    orderBy?: MetricValueOrderByWithRelationInput | MetricValueOrderByWithRelationInput[]
    cursor?: MetricValueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MetricValueScalarFieldEnum | MetricValueScalarFieldEnum[]
  }

  /**
   * MetricDefinition.columnMappings
   */
  export type MetricDefinition$columnMappingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    where?: ColumnMappingWhereInput
    orderBy?: ColumnMappingOrderByWithRelationInput | ColumnMappingOrderByWithRelationInput[]
    cursor?: ColumnMappingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ColumnMappingScalarFieldEnum | ColumnMappingScalarFieldEnum[]
  }

  /**
   * MetricDefinition.goals
   */
  export type MetricDefinition$goalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    where?: GoalWhereInput
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    cursor?: GoalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * MetricDefinition.widgets
   */
  export type MetricDefinition$widgetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    where?: WidgetWhereInput
    orderBy?: WidgetOrderByWithRelationInput | WidgetOrderByWithRelationInput[]
    cursor?: WidgetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WidgetScalarFieldEnum | WidgetScalarFieldEnum[]
  }

  /**
   * MetricDefinition without action
   */
  export type MetricDefinitionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
  }


  /**
   * Model DataSource
   */

  export type AggregateDataSource = {
    _count: DataSourceCountAggregateOutputType | null
    _min: DataSourceMinAggregateOutputType | null
    _max: DataSourceMaxAggregateOutputType | null
  }

  export type DataSourceMinAggregateOutputType = {
    id: string | null
    name: string | null
    spreadsheetId: string | null
    sheetName: string | null
    lastSyncedAt: Date | null
    syncFrequency: string | null
    connectionStatus: string | null
    appScriptId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DataSourceMaxAggregateOutputType = {
    id: string | null
    name: string | null
    spreadsheetId: string | null
    sheetName: string | null
    lastSyncedAt: Date | null
    syncFrequency: string | null
    connectionStatus: string | null
    appScriptId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DataSourceCountAggregateOutputType = {
    id: number
    name: number
    spreadsheetId: number
    sheetName: number
    lastSyncedAt: number
    syncFrequency: number
    connectionStatus: number
    appScriptId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DataSourceMinAggregateInputType = {
    id?: true
    name?: true
    spreadsheetId?: true
    sheetName?: true
    lastSyncedAt?: true
    syncFrequency?: true
    connectionStatus?: true
    appScriptId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DataSourceMaxAggregateInputType = {
    id?: true
    name?: true
    spreadsheetId?: true
    sheetName?: true
    lastSyncedAt?: true
    syncFrequency?: true
    connectionStatus?: true
    appScriptId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DataSourceCountAggregateInputType = {
    id?: true
    name?: true
    spreadsheetId?: true
    sheetName?: true
    lastSyncedAt?: true
    syncFrequency?: true
    connectionStatus?: true
    appScriptId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DataSourceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataSource to aggregate.
     */
    where?: DataSourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataSources to fetch.
     */
    orderBy?: DataSourceOrderByWithRelationInput | DataSourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DataSourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataSources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataSources.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DataSources
    **/
    _count?: true | DataSourceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DataSourceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DataSourceMaxAggregateInputType
  }

  export type GetDataSourceAggregateType<T extends DataSourceAggregateArgs> = {
        [P in keyof T & keyof AggregateDataSource]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDataSource[P]>
      : GetScalarType<T[P], AggregateDataSource[P]>
  }




  export type DataSourceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DataSourceWhereInput
    orderBy?: DataSourceOrderByWithAggregationInput | DataSourceOrderByWithAggregationInput[]
    by: DataSourceScalarFieldEnum[] | DataSourceScalarFieldEnum
    having?: DataSourceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DataSourceCountAggregateInputType | true
    _min?: DataSourceMinAggregateInputType
    _max?: DataSourceMaxAggregateInputType
  }

  export type DataSourceGroupByOutputType = {
    id: string
    name: string
    spreadsheetId: string
    sheetName: string
    lastSyncedAt: Date | null
    syncFrequency: string
    connectionStatus: string
    appScriptId: string | null
    createdAt: Date
    updatedAt: Date
    _count: DataSourceCountAggregateOutputType | null
    _min: DataSourceMinAggregateOutputType | null
    _max: DataSourceMaxAggregateOutputType | null
  }

  type GetDataSourceGroupByPayload<T extends DataSourceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DataSourceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DataSourceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DataSourceGroupByOutputType[P]>
            : GetScalarType<T[P], DataSourceGroupByOutputType[P]>
        }
      >
    >


  export type DataSourceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    spreadsheetId?: boolean
    sheetName?: boolean
    lastSyncedAt?: boolean
    syncFrequency?: boolean
    connectionStatus?: boolean
    appScriptId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    columnMappings?: boolean | DataSource$columnMappingsArgs<ExtArgs>
    metrics?: boolean | DataSource$metricsArgs<ExtArgs>
    _count?: boolean | DataSourceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dataSource"]>

  export type DataSourceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    spreadsheetId?: boolean
    sheetName?: boolean
    lastSyncedAt?: boolean
    syncFrequency?: boolean
    connectionStatus?: boolean
    appScriptId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dataSource"]>

  export type DataSourceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    spreadsheetId?: boolean
    sheetName?: boolean
    lastSyncedAt?: boolean
    syncFrequency?: boolean
    connectionStatus?: boolean
    appScriptId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dataSource"]>

  export type DataSourceSelectScalar = {
    id?: boolean
    name?: boolean
    spreadsheetId?: boolean
    sheetName?: boolean
    lastSyncedAt?: boolean
    syncFrequency?: boolean
    connectionStatus?: boolean
    appScriptId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DataSourceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "spreadsheetId" | "sheetName" | "lastSyncedAt" | "syncFrequency" | "connectionStatus" | "appScriptId" | "createdAt" | "updatedAt", ExtArgs["result"]["dataSource"]>
  export type DataSourceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    columnMappings?: boolean | DataSource$columnMappingsArgs<ExtArgs>
    metrics?: boolean | DataSource$metricsArgs<ExtArgs>
    _count?: boolean | DataSourceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DataSourceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type DataSourceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DataSourcePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DataSource"
    objects: {
      columnMappings: Prisma.$ColumnMappingPayload<ExtArgs>[]
      metrics: Prisma.$MetricValuePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      spreadsheetId: string
      sheetName: string
      lastSyncedAt: Date | null
      syncFrequency: string
      connectionStatus: string
      appScriptId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["dataSource"]>
    composites: {}
  }

  type DataSourceGetPayload<S extends boolean | null | undefined | DataSourceDefaultArgs> = $Result.GetResult<Prisma.$DataSourcePayload, S>

  type DataSourceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DataSourceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DataSourceCountAggregateInputType | true
    }

  export interface DataSourceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DataSource'], meta: { name: 'DataSource' } }
    /**
     * Find zero or one DataSource that matches the filter.
     * @param {DataSourceFindUniqueArgs} args - Arguments to find a DataSource
     * @example
     * // Get one DataSource
     * const dataSource = await prisma.dataSource.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DataSourceFindUniqueArgs>(args: SelectSubset<T, DataSourceFindUniqueArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DataSource that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DataSourceFindUniqueOrThrowArgs} args - Arguments to find a DataSource
     * @example
     * // Get one DataSource
     * const dataSource = await prisma.dataSource.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DataSourceFindUniqueOrThrowArgs>(args: SelectSubset<T, DataSourceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataSource that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataSourceFindFirstArgs} args - Arguments to find a DataSource
     * @example
     * // Get one DataSource
     * const dataSource = await prisma.dataSource.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DataSourceFindFirstArgs>(args?: SelectSubset<T, DataSourceFindFirstArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataSource that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataSourceFindFirstOrThrowArgs} args - Arguments to find a DataSource
     * @example
     * // Get one DataSource
     * const dataSource = await prisma.dataSource.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DataSourceFindFirstOrThrowArgs>(args?: SelectSubset<T, DataSourceFindFirstOrThrowArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DataSources that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataSourceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DataSources
     * const dataSources = await prisma.dataSource.findMany()
     * 
     * // Get first 10 DataSources
     * const dataSources = await prisma.dataSource.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dataSourceWithIdOnly = await prisma.dataSource.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DataSourceFindManyArgs>(args?: SelectSubset<T, DataSourceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DataSource.
     * @param {DataSourceCreateArgs} args - Arguments to create a DataSource.
     * @example
     * // Create one DataSource
     * const DataSource = await prisma.dataSource.create({
     *   data: {
     *     // ... data to create a DataSource
     *   }
     * })
     * 
     */
    create<T extends DataSourceCreateArgs>(args: SelectSubset<T, DataSourceCreateArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DataSources.
     * @param {DataSourceCreateManyArgs} args - Arguments to create many DataSources.
     * @example
     * // Create many DataSources
     * const dataSource = await prisma.dataSource.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DataSourceCreateManyArgs>(args?: SelectSubset<T, DataSourceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DataSources and returns the data saved in the database.
     * @param {DataSourceCreateManyAndReturnArgs} args - Arguments to create many DataSources.
     * @example
     * // Create many DataSources
     * const dataSource = await prisma.dataSource.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DataSources and only return the `id`
     * const dataSourceWithIdOnly = await prisma.dataSource.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DataSourceCreateManyAndReturnArgs>(args?: SelectSubset<T, DataSourceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DataSource.
     * @param {DataSourceDeleteArgs} args - Arguments to delete one DataSource.
     * @example
     * // Delete one DataSource
     * const DataSource = await prisma.dataSource.delete({
     *   where: {
     *     // ... filter to delete one DataSource
     *   }
     * })
     * 
     */
    delete<T extends DataSourceDeleteArgs>(args: SelectSubset<T, DataSourceDeleteArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DataSource.
     * @param {DataSourceUpdateArgs} args - Arguments to update one DataSource.
     * @example
     * // Update one DataSource
     * const dataSource = await prisma.dataSource.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DataSourceUpdateArgs>(args: SelectSubset<T, DataSourceUpdateArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DataSources.
     * @param {DataSourceDeleteManyArgs} args - Arguments to filter DataSources to delete.
     * @example
     * // Delete a few DataSources
     * const { count } = await prisma.dataSource.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DataSourceDeleteManyArgs>(args?: SelectSubset<T, DataSourceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataSources.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataSourceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DataSources
     * const dataSource = await prisma.dataSource.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DataSourceUpdateManyArgs>(args: SelectSubset<T, DataSourceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataSources and returns the data updated in the database.
     * @param {DataSourceUpdateManyAndReturnArgs} args - Arguments to update many DataSources.
     * @example
     * // Update many DataSources
     * const dataSource = await prisma.dataSource.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DataSources and only return the `id`
     * const dataSourceWithIdOnly = await prisma.dataSource.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DataSourceUpdateManyAndReturnArgs>(args: SelectSubset<T, DataSourceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DataSource.
     * @param {DataSourceUpsertArgs} args - Arguments to update or create a DataSource.
     * @example
     * // Update or create a DataSource
     * const dataSource = await prisma.dataSource.upsert({
     *   create: {
     *     // ... data to create a DataSource
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DataSource we want to update
     *   }
     * })
     */
    upsert<T extends DataSourceUpsertArgs>(args: SelectSubset<T, DataSourceUpsertArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DataSources.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataSourceCountArgs} args - Arguments to filter DataSources to count.
     * @example
     * // Count the number of DataSources
     * const count = await prisma.dataSource.count({
     *   where: {
     *     // ... the filter for the DataSources we want to count
     *   }
     * })
    **/
    count<T extends DataSourceCountArgs>(
      args?: Subset<T, DataSourceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DataSourceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DataSource.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataSourceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DataSourceAggregateArgs>(args: Subset<T, DataSourceAggregateArgs>): Prisma.PrismaPromise<GetDataSourceAggregateType<T>>

    /**
     * Group by DataSource.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataSourceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DataSourceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DataSourceGroupByArgs['orderBy'] }
        : { orderBy?: DataSourceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DataSourceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDataSourceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DataSource model
   */
  readonly fields: DataSourceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DataSource.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DataSourceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    columnMappings<T extends DataSource$columnMappingsArgs<ExtArgs> = {}>(args?: Subset<T, DataSource$columnMappingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    metrics<T extends DataSource$metricsArgs<ExtArgs> = {}>(args?: Subset<T, DataSource$metricsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DataSource model
   */
  interface DataSourceFieldRefs {
    readonly id: FieldRef<"DataSource", 'String'>
    readonly name: FieldRef<"DataSource", 'String'>
    readonly spreadsheetId: FieldRef<"DataSource", 'String'>
    readonly sheetName: FieldRef<"DataSource", 'String'>
    readonly lastSyncedAt: FieldRef<"DataSource", 'DateTime'>
    readonly syncFrequency: FieldRef<"DataSource", 'String'>
    readonly connectionStatus: FieldRef<"DataSource", 'String'>
    readonly appScriptId: FieldRef<"DataSource", 'String'>
    readonly createdAt: FieldRef<"DataSource", 'DateTime'>
    readonly updatedAt: FieldRef<"DataSource", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DataSource findUnique
   */
  export type DataSourceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    /**
     * Filter, which DataSource to fetch.
     */
    where: DataSourceWhereUniqueInput
  }

  /**
   * DataSource findUniqueOrThrow
   */
  export type DataSourceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    /**
     * Filter, which DataSource to fetch.
     */
    where: DataSourceWhereUniqueInput
  }

  /**
   * DataSource findFirst
   */
  export type DataSourceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    /**
     * Filter, which DataSource to fetch.
     */
    where?: DataSourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataSources to fetch.
     */
    orderBy?: DataSourceOrderByWithRelationInput | DataSourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataSources.
     */
    cursor?: DataSourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataSources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataSources.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataSources.
     */
    distinct?: DataSourceScalarFieldEnum | DataSourceScalarFieldEnum[]
  }

  /**
   * DataSource findFirstOrThrow
   */
  export type DataSourceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    /**
     * Filter, which DataSource to fetch.
     */
    where?: DataSourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataSources to fetch.
     */
    orderBy?: DataSourceOrderByWithRelationInput | DataSourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataSources.
     */
    cursor?: DataSourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataSources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataSources.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataSources.
     */
    distinct?: DataSourceScalarFieldEnum | DataSourceScalarFieldEnum[]
  }

  /**
   * DataSource findMany
   */
  export type DataSourceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    /**
     * Filter, which DataSources to fetch.
     */
    where?: DataSourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataSources to fetch.
     */
    orderBy?: DataSourceOrderByWithRelationInput | DataSourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DataSources.
     */
    cursor?: DataSourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataSources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataSources.
     */
    skip?: number
    distinct?: DataSourceScalarFieldEnum | DataSourceScalarFieldEnum[]
  }

  /**
   * DataSource create
   */
  export type DataSourceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    /**
     * The data needed to create a DataSource.
     */
    data: XOR<DataSourceCreateInput, DataSourceUncheckedCreateInput>
  }

  /**
   * DataSource createMany
   */
  export type DataSourceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DataSources.
     */
    data: DataSourceCreateManyInput | DataSourceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DataSource createManyAndReturn
   */
  export type DataSourceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * The data used to create many DataSources.
     */
    data: DataSourceCreateManyInput | DataSourceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DataSource update
   */
  export type DataSourceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    /**
     * The data needed to update a DataSource.
     */
    data: XOR<DataSourceUpdateInput, DataSourceUncheckedUpdateInput>
    /**
     * Choose, which DataSource to update.
     */
    where: DataSourceWhereUniqueInput
  }

  /**
   * DataSource updateMany
   */
  export type DataSourceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DataSources.
     */
    data: XOR<DataSourceUpdateManyMutationInput, DataSourceUncheckedUpdateManyInput>
    /**
     * Filter which DataSources to update
     */
    where?: DataSourceWhereInput
    /**
     * Limit how many DataSources to update.
     */
    limit?: number
  }

  /**
   * DataSource updateManyAndReturn
   */
  export type DataSourceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * The data used to update DataSources.
     */
    data: XOR<DataSourceUpdateManyMutationInput, DataSourceUncheckedUpdateManyInput>
    /**
     * Filter which DataSources to update
     */
    where?: DataSourceWhereInput
    /**
     * Limit how many DataSources to update.
     */
    limit?: number
  }

  /**
   * DataSource upsert
   */
  export type DataSourceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    /**
     * The filter to search for the DataSource to update in case it exists.
     */
    where: DataSourceWhereUniqueInput
    /**
     * In case the DataSource found by the `where` argument doesn't exist, create a new DataSource with this data.
     */
    create: XOR<DataSourceCreateInput, DataSourceUncheckedCreateInput>
    /**
     * In case the DataSource was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DataSourceUpdateInput, DataSourceUncheckedUpdateInput>
  }

  /**
   * DataSource delete
   */
  export type DataSourceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    /**
     * Filter which DataSource to delete.
     */
    where: DataSourceWhereUniqueInput
  }

  /**
   * DataSource deleteMany
   */
  export type DataSourceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataSources to delete
     */
    where?: DataSourceWhereInput
    /**
     * Limit how many DataSources to delete.
     */
    limit?: number
  }

  /**
   * DataSource.columnMappings
   */
  export type DataSource$columnMappingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    where?: ColumnMappingWhereInput
    orderBy?: ColumnMappingOrderByWithRelationInput | ColumnMappingOrderByWithRelationInput[]
    cursor?: ColumnMappingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ColumnMappingScalarFieldEnum | ColumnMappingScalarFieldEnum[]
  }

  /**
   * DataSource.metrics
   */
  export type DataSource$metricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    where?: MetricValueWhereInput
    orderBy?: MetricValueOrderByWithRelationInput | MetricValueOrderByWithRelationInput[]
    cursor?: MetricValueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MetricValueScalarFieldEnum | MetricValueScalarFieldEnum[]
  }

  /**
   * DataSource without action
   */
  export type DataSourceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
  }


  /**
   * Model ColumnMapping
   */

  export type AggregateColumnMapping = {
    _count: ColumnMappingCountAggregateOutputType | null
    _min: ColumnMappingMinAggregateOutputType | null
    _max: ColumnMappingMaxAggregateOutputType | null
  }

  export type ColumnMappingMinAggregateOutputType = {
    id: string | null
    columnName: string | null
    transformationRule: string | null
    createdAt: Date | null
    updatedAt: Date | null
    dataSourceId: string | null
    metricDefinitionId: string | null
  }

  export type ColumnMappingMaxAggregateOutputType = {
    id: string | null
    columnName: string | null
    transformationRule: string | null
    createdAt: Date | null
    updatedAt: Date | null
    dataSourceId: string | null
    metricDefinitionId: string | null
  }

  export type ColumnMappingCountAggregateOutputType = {
    id: number
    columnName: number
    transformationRule: number
    createdAt: number
    updatedAt: number
    dataSourceId: number
    metricDefinitionId: number
    _all: number
  }


  export type ColumnMappingMinAggregateInputType = {
    id?: true
    columnName?: true
    transformationRule?: true
    createdAt?: true
    updatedAt?: true
    dataSourceId?: true
    metricDefinitionId?: true
  }

  export type ColumnMappingMaxAggregateInputType = {
    id?: true
    columnName?: true
    transformationRule?: true
    createdAt?: true
    updatedAt?: true
    dataSourceId?: true
    metricDefinitionId?: true
  }

  export type ColumnMappingCountAggregateInputType = {
    id?: true
    columnName?: true
    transformationRule?: true
    createdAt?: true
    updatedAt?: true
    dataSourceId?: true
    metricDefinitionId?: true
    _all?: true
  }

  export type ColumnMappingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ColumnMapping to aggregate.
     */
    where?: ColumnMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ColumnMappings to fetch.
     */
    orderBy?: ColumnMappingOrderByWithRelationInput | ColumnMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ColumnMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ColumnMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ColumnMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ColumnMappings
    **/
    _count?: true | ColumnMappingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ColumnMappingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ColumnMappingMaxAggregateInputType
  }

  export type GetColumnMappingAggregateType<T extends ColumnMappingAggregateArgs> = {
        [P in keyof T & keyof AggregateColumnMapping]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateColumnMapping[P]>
      : GetScalarType<T[P], AggregateColumnMapping[P]>
  }




  export type ColumnMappingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ColumnMappingWhereInput
    orderBy?: ColumnMappingOrderByWithAggregationInput | ColumnMappingOrderByWithAggregationInput[]
    by: ColumnMappingScalarFieldEnum[] | ColumnMappingScalarFieldEnum
    having?: ColumnMappingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ColumnMappingCountAggregateInputType | true
    _min?: ColumnMappingMinAggregateInputType
    _max?: ColumnMappingMaxAggregateInputType
  }

  export type ColumnMappingGroupByOutputType = {
    id: string
    columnName: string
    transformationRule: string | null
    createdAt: Date
    updatedAt: Date
    dataSourceId: string
    metricDefinitionId: string
    _count: ColumnMappingCountAggregateOutputType | null
    _min: ColumnMappingMinAggregateOutputType | null
    _max: ColumnMappingMaxAggregateOutputType | null
  }

  type GetColumnMappingGroupByPayload<T extends ColumnMappingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ColumnMappingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ColumnMappingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ColumnMappingGroupByOutputType[P]>
            : GetScalarType<T[P], ColumnMappingGroupByOutputType[P]>
        }
      >
    >


  export type ColumnMappingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    columnName?: boolean
    transformationRule?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dataSourceId?: boolean
    metricDefinitionId?: boolean
    dataSource?: boolean | DataSourceDefaultArgs<ExtArgs>
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["columnMapping"]>

  export type ColumnMappingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    columnName?: boolean
    transformationRule?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dataSourceId?: boolean
    metricDefinitionId?: boolean
    dataSource?: boolean | DataSourceDefaultArgs<ExtArgs>
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["columnMapping"]>

  export type ColumnMappingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    columnName?: boolean
    transformationRule?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dataSourceId?: boolean
    metricDefinitionId?: boolean
    dataSource?: boolean | DataSourceDefaultArgs<ExtArgs>
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["columnMapping"]>

  export type ColumnMappingSelectScalar = {
    id?: boolean
    columnName?: boolean
    transformationRule?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dataSourceId?: boolean
    metricDefinitionId?: boolean
  }

  export type ColumnMappingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "columnName" | "transformationRule" | "createdAt" | "updatedAt" | "dataSourceId" | "metricDefinitionId", ExtArgs["result"]["columnMapping"]>
  export type ColumnMappingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dataSource?: boolean | DataSourceDefaultArgs<ExtArgs>
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
  }
  export type ColumnMappingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dataSource?: boolean | DataSourceDefaultArgs<ExtArgs>
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
  }
  export type ColumnMappingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dataSource?: boolean | DataSourceDefaultArgs<ExtArgs>
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
  }

  export type $ColumnMappingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ColumnMapping"
    objects: {
      dataSource: Prisma.$DataSourcePayload<ExtArgs>
      metricDefinition: Prisma.$MetricDefinitionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      columnName: string
      transformationRule: string | null
      createdAt: Date
      updatedAt: Date
      dataSourceId: string
      metricDefinitionId: string
    }, ExtArgs["result"]["columnMapping"]>
    composites: {}
  }

  type ColumnMappingGetPayload<S extends boolean | null | undefined | ColumnMappingDefaultArgs> = $Result.GetResult<Prisma.$ColumnMappingPayload, S>

  type ColumnMappingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ColumnMappingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ColumnMappingCountAggregateInputType | true
    }

  export interface ColumnMappingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ColumnMapping'], meta: { name: 'ColumnMapping' } }
    /**
     * Find zero or one ColumnMapping that matches the filter.
     * @param {ColumnMappingFindUniqueArgs} args - Arguments to find a ColumnMapping
     * @example
     * // Get one ColumnMapping
     * const columnMapping = await prisma.columnMapping.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ColumnMappingFindUniqueArgs>(args: SelectSubset<T, ColumnMappingFindUniqueArgs<ExtArgs>>): Prisma__ColumnMappingClient<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ColumnMapping that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ColumnMappingFindUniqueOrThrowArgs} args - Arguments to find a ColumnMapping
     * @example
     * // Get one ColumnMapping
     * const columnMapping = await prisma.columnMapping.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ColumnMappingFindUniqueOrThrowArgs>(args: SelectSubset<T, ColumnMappingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ColumnMappingClient<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ColumnMapping that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnMappingFindFirstArgs} args - Arguments to find a ColumnMapping
     * @example
     * // Get one ColumnMapping
     * const columnMapping = await prisma.columnMapping.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ColumnMappingFindFirstArgs>(args?: SelectSubset<T, ColumnMappingFindFirstArgs<ExtArgs>>): Prisma__ColumnMappingClient<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ColumnMapping that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnMappingFindFirstOrThrowArgs} args - Arguments to find a ColumnMapping
     * @example
     * // Get one ColumnMapping
     * const columnMapping = await prisma.columnMapping.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ColumnMappingFindFirstOrThrowArgs>(args?: SelectSubset<T, ColumnMappingFindFirstOrThrowArgs<ExtArgs>>): Prisma__ColumnMappingClient<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ColumnMappings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnMappingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ColumnMappings
     * const columnMappings = await prisma.columnMapping.findMany()
     * 
     * // Get first 10 ColumnMappings
     * const columnMappings = await prisma.columnMapping.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const columnMappingWithIdOnly = await prisma.columnMapping.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ColumnMappingFindManyArgs>(args?: SelectSubset<T, ColumnMappingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ColumnMapping.
     * @param {ColumnMappingCreateArgs} args - Arguments to create a ColumnMapping.
     * @example
     * // Create one ColumnMapping
     * const ColumnMapping = await prisma.columnMapping.create({
     *   data: {
     *     // ... data to create a ColumnMapping
     *   }
     * })
     * 
     */
    create<T extends ColumnMappingCreateArgs>(args: SelectSubset<T, ColumnMappingCreateArgs<ExtArgs>>): Prisma__ColumnMappingClient<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ColumnMappings.
     * @param {ColumnMappingCreateManyArgs} args - Arguments to create many ColumnMappings.
     * @example
     * // Create many ColumnMappings
     * const columnMapping = await prisma.columnMapping.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ColumnMappingCreateManyArgs>(args?: SelectSubset<T, ColumnMappingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ColumnMappings and returns the data saved in the database.
     * @param {ColumnMappingCreateManyAndReturnArgs} args - Arguments to create many ColumnMappings.
     * @example
     * // Create many ColumnMappings
     * const columnMapping = await prisma.columnMapping.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ColumnMappings and only return the `id`
     * const columnMappingWithIdOnly = await prisma.columnMapping.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ColumnMappingCreateManyAndReturnArgs>(args?: SelectSubset<T, ColumnMappingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ColumnMapping.
     * @param {ColumnMappingDeleteArgs} args - Arguments to delete one ColumnMapping.
     * @example
     * // Delete one ColumnMapping
     * const ColumnMapping = await prisma.columnMapping.delete({
     *   where: {
     *     // ... filter to delete one ColumnMapping
     *   }
     * })
     * 
     */
    delete<T extends ColumnMappingDeleteArgs>(args: SelectSubset<T, ColumnMappingDeleteArgs<ExtArgs>>): Prisma__ColumnMappingClient<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ColumnMapping.
     * @param {ColumnMappingUpdateArgs} args - Arguments to update one ColumnMapping.
     * @example
     * // Update one ColumnMapping
     * const columnMapping = await prisma.columnMapping.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ColumnMappingUpdateArgs>(args: SelectSubset<T, ColumnMappingUpdateArgs<ExtArgs>>): Prisma__ColumnMappingClient<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ColumnMappings.
     * @param {ColumnMappingDeleteManyArgs} args - Arguments to filter ColumnMappings to delete.
     * @example
     * // Delete a few ColumnMappings
     * const { count } = await prisma.columnMapping.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ColumnMappingDeleteManyArgs>(args?: SelectSubset<T, ColumnMappingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ColumnMappings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnMappingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ColumnMappings
     * const columnMapping = await prisma.columnMapping.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ColumnMappingUpdateManyArgs>(args: SelectSubset<T, ColumnMappingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ColumnMappings and returns the data updated in the database.
     * @param {ColumnMappingUpdateManyAndReturnArgs} args - Arguments to update many ColumnMappings.
     * @example
     * // Update many ColumnMappings
     * const columnMapping = await prisma.columnMapping.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ColumnMappings and only return the `id`
     * const columnMappingWithIdOnly = await prisma.columnMapping.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ColumnMappingUpdateManyAndReturnArgs>(args: SelectSubset<T, ColumnMappingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ColumnMapping.
     * @param {ColumnMappingUpsertArgs} args - Arguments to update or create a ColumnMapping.
     * @example
     * // Update or create a ColumnMapping
     * const columnMapping = await prisma.columnMapping.upsert({
     *   create: {
     *     // ... data to create a ColumnMapping
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ColumnMapping we want to update
     *   }
     * })
     */
    upsert<T extends ColumnMappingUpsertArgs>(args: SelectSubset<T, ColumnMappingUpsertArgs<ExtArgs>>): Prisma__ColumnMappingClient<$Result.GetResult<Prisma.$ColumnMappingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ColumnMappings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnMappingCountArgs} args - Arguments to filter ColumnMappings to count.
     * @example
     * // Count the number of ColumnMappings
     * const count = await prisma.columnMapping.count({
     *   where: {
     *     // ... the filter for the ColumnMappings we want to count
     *   }
     * })
    **/
    count<T extends ColumnMappingCountArgs>(
      args?: Subset<T, ColumnMappingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ColumnMappingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ColumnMapping.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnMappingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ColumnMappingAggregateArgs>(args: Subset<T, ColumnMappingAggregateArgs>): Prisma.PrismaPromise<GetColumnMappingAggregateType<T>>

    /**
     * Group by ColumnMapping.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnMappingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ColumnMappingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ColumnMappingGroupByArgs['orderBy'] }
        : { orderBy?: ColumnMappingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ColumnMappingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetColumnMappingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ColumnMapping model
   */
  readonly fields: ColumnMappingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ColumnMapping.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ColumnMappingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    dataSource<T extends DataSourceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DataSourceDefaultArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    metricDefinition<T extends MetricDefinitionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MetricDefinitionDefaultArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ColumnMapping model
   */
  interface ColumnMappingFieldRefs {
    readonly id: FieldRef<"ColumnMapping", 'String'>
    readonly columnName: FieldRef<"ColumnMapping", 'String'>
    readonly transformationRule: FieldRef<"ColumnMapping", 'String'>
    readonly createdAt: FieldRef<"ColumnMapping", 'DateTime'>
    readonly updatedAt: FieldRef<"ColumnMapping", 'DateTime'>
    readonly dataSourceId: FieldRef<"ColumnMapping", 'String'>
    readonly metricDefinitionId: FieldRef<"ColumnMapping", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ColumnMapping findUnique
   */
  export type ColumnMappingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    /**
     * Filter, which ColumnMapping to fetch.
     */
    where: ColumnMappingWhereUniqueInput
  }

  /**
   * ColumnMapping findUniqueOrThrow
   */
  export type ColumnMappingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    /**
     * Filter, which ColumnMapping to fetch.
     */
    where: ColumnMappingWhereUniqueInput
  }

  /**
   * ColumnMapping findFirst
   */
  export type ColumnMappingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    /**
     * Filter, which ColumnMapping to fetch.
     */
    where?: ColumnMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ColumnMappings to fetch.
     */
    orderBy?: ColumnMappingOrderByWithRelationInput | ColumnMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ColumnMappings.
     */
    cursor?: ColumnMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ColumnMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ColumnMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ColumnMappings.
     */
    distinct?: ColumnMappingScalarFieldEnum | ColumnMappingScalarFieldEnum[]
  }

  /**
   * ColumnMapping findFirstOrThrow
   */
  export type ColumnMappingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    /**
     * Filter, which ColumnMapping to fetch.
     */
    where?: ColumnMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ColumnMappings to fetch.
     */
    orderBy?: ColumnMappingOrderByWithRelationInput | ColumnMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ColumnMappings.
     */
    cursor?: ColumnMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ColumnMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ColumnMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ColumnMappings.
     */
    distinct?: ColumnMappingScalarFieldEnum | ColumnMappingScalarFieldEnum[]
  }

  /**
   * ColumnMapping findMany
   */
  export type ColumnMappingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    /**
     * Filter, which ColumnMappings to fetch.
     */
    where?: ColumnMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ColumnMappings to fetch.
     */
    orderBy?: ColumnMappingOrderByWithRelationInput | ColumnMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ColumnMappings.
     */
    cursor?: ColumnMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ColumnMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ColumnMappings.
     */
    skip?: number
    distinct?: ColumnMappingScalarFieldEnum | ColumnMappingScalarFieldEnum[]
  }

  /**
   * ColumnMapping create
   */
  export type ColumnMappingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    /**
     * The data needed to create a ColumnMapping.
     */
    data: XOR<ColumnMappingCreateInput, ColumnMappingUncheckedCreateInput>
  }

  /**
   * ColumnMapping createMany
   */
  export type ColumnMappingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ColumnMappings.
     */
    data: ColumnMappingCreateManyInput | ColumnMappingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ColumnMapping createManyAndReturn
   */
  export type ColumnMappingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * The data used to create many ColumnMappings.
     */
    data: ColumnMappingCreateManyInput | ColumnMappingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ColumnMapping update
   */
  export type ColumnMappingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    /**
     * The data needed to update a ColumnMapping.
     */
    data: XOR<ColumnMappingUpdateInput, ColumnMappingUncheckedUpdateInput>
    /**
     * Choose, which ColumnMapping to update.
     */
    where: ColumnMappingWhereUniqueInput
  }

  /**
   * ColumnMapping updateMany
   */
  export type ColumnMappingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ColumnMappings.
     */
    data: XOR<ColumnMappingUpdateManyMutationInput, ColumnMappingUncheckedUpdateManyInput>
    /**
     * Filter which ColumnMappings to update
     */
    where?: ColumnMappingWhereInput
    /**
     * Limit how many ColumnMappings to update.
     */
    limit?: number
  }

  /**
   * ColumnMapping updateManyAndReturn
   */
  export type ColumnMappingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * The data used to update ColumnMappings.
     */
    data: XOR<ColumnMappingUpdateManyMutationInput, ColumnMappingUncheckedUpdateManyInput>
    /**
     * Filter which ColumnMappings to update
     */
    where?: ColumnMappingWhereInput
    /**
     * Limit how many ColumnMappings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ColumnMapping upsert
   */
  export type ColumnMappingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    /**
     * The filter to search for the ColumnMapping to update in case it exists.
     */
    where: ColumnMappingWhereUniqueInput
    /**
     * In case the ColumnMapping found by the `where` argument doesn't exist, create a new ColumnMapping with this data.
     */
    create: XOR<ColumnMappingCreateInput, ColumnMappingUncheckedCreateInput>
    /**
     * In case the ColumnMapping was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ColumnMappingUpdateInput, ColumnMappingUncheckedUpdateInput>
  }

  /**
   * ColumnMapping delete
   */
  export type ColumnMappingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
    /**
     * Filter which ColumnMapping to delete.
     */
    where: ColumnMappingWhereUniqueInput
  }

  /**
   * ColumnMapping deleteMany
   */
  export type ColumnMappingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ColumnMappings to delete
     */
    where?: ColumnMappingWhereInput
    /**
     * Limit how many ColumnMappings to delete.
     */
    limit?: number
  }

  /**
   * ColumnMapping without action
   */
  export type ColumnMappingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnMapping
     */
    select?: ColumnMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColumnMapping
     */
    omit?: ColumnMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnMappingInclude<ExtArgs> | null
  }


  /**
   * Model MetricValue
   */

  export type AggregateMetricValue = {
    _count: MetricValueCountAggregateOutputType | null
    _min: MetricValueMinAggregateOutputType | null
    _max: MetricValueMaxAggregateOutputType | null
  }

  export type MetricValueMinAggregateOutputType = {
    id: string | null
    date: Date | null
    value: string | null
    sourceType: string | null
    sourceSheet: string | null
    externalId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    metricDefinitionId: string | null
    clinicId: string | null
    providerId: string | null
    dataSourceId: string | null
  }

  export type MetricValueMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    value: string | null
    sourceType: string | null
    sourceSheet: string | null
    externalId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    metricDefinitionId: string | null
    clinicId: string | null
    providerId: string | null
    dataSourceId: string | null
  }

  export type MetricValueCountAggregateOutputType = {
    id: number
    date: number
    value: number
    sourceType: number
    sourceSheet: number
    externalId: number
    createdAt: number
    updatedAt: number
    metricDefinitionId: number
    clinicId: number
    providerId: number
    dataSourceId: number
    _all: number
  }


  export type MetricValueMinAggregateInputType = {
    id?: true
    date?: true
    value?: true
    sourceType?: true
    sourceSheet?: true
    externalId?: true
    createdAt?: true
    updatedAt?: true
    metricDefinitionId?: true
    clinicId?: true
    providerId?: true
    dataSourceId?: true
  }

  export type MetricValueMaxAggregateInputType = {
    id?: true
    date?: true
    value?: true
    sourceType?: true
    sourceSheet?: true
    externalId?: true
    createdAt?: true
    updatedAt?: true
    metricDefinitionId?: true
    clinicId?: true
    providerId?: true
    dataSourceId?: true
  }

  export type MetricValueCountAggregateInputType = {
    id?: true
    date?: true
    value?: true
    sourceType?: true
    sourceSheet?: true
    externalId?: true
    createdAt?: true
    updatedAt?: true
    metricDefinitionId?: true
    clinicId?: true
    providerId?: true
    dataSourceId?: true
    _all?: true
  }

  export type MetricValueAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MetricValue to aggregate.
     */
    where?: MetricValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricValues to fetch.
     */
    orderBy?: MetricValueOrderByWithRelationInput | MetricValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MetricValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricValues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MetricValues
    **/
    _count?: true | MetricValueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MetricValueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MetricValueMaxAggregateInputType
  }

  export type GetMetricValueAggregateType<T extends MetricValueAggregateArgs> = {
        [P in keyof T & keyof AggregateMetricValue]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMetricValue[P]>
      : GetScalarType<T[P], AggregateMetricValue[P]>
  }




  export type MetricValueGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MetricValueWhereInput
    orderBy?: MetricValueOrderByWithAggregationInput | MetricValueOrderByWithAggregationInput[]
    by: MetricValueScalarFieldEnum[] | MetricValueScalarFieldEnum
    having?: MetricValueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MetricValueCountAggregateInputType | true
    _min?: MetricValueMinAggregateInputType
    _max?: MetricValueMaxAggregateInputType
  }

  export type MetricValueGroupByOutputType = {
    id: string
    date: Date
    value: string
    sourceType: string
    sourceSheet: string | null
    externalId: string | null
    createdAt: Date
    updatedAt: Date
    metricDefinitionId: string
    clinicId: string | null
    providerId: string | null
    dataSourceId: string | null
    _count: MetricValueCountAggregateOutputType | null
    _min: MetricValueMinAggregateOutputType | null
    _max: MetricValueMaxAggregateOutputType | null
  }

  type GetMetricValueGroupByPayload<T extends MetricValueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MetricValueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MetricValueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MetricValueGroupByOutputType[P]>
            : GetScalarType<T[P], MetricValueGroupByOutputType[P]>
        }
      >
    >


  export type MetricValueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    value?: boolean
    sourceType?: boolean
    sourceSheet?: boolean
    externalId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    metricDefinitionId?: boolean
    clinicId?: boolean
    providerId?: boolean
    dataSourceId?: boolean
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | MetricValue$clinicArgs<ExtArgs>
    provider?: boolean | MetricValue$providerArgs<ExtArgs>
    dataSource?: boolean | MetricValue$dataSourceArgs<ExtArgs>
  }, ExtArgs["result"]["metricValue"]>

  export type MetricValueSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    value?: boolean
    sourceType?: boolean
    sourceSheet?: boolean
    externalId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    metricDefinitionId?: boolean
    clinicId?: boolean
    providerId?: boolean
    dataSourceId?: boolean
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | MetricValue$clinicArgs<ExtArgs>
    provider?: boolean | MetricValue$providerArgs<ExtArgs>
    dataSource?: boolean | MetricValue$dataSourceArgs<ExtArgs>
  }, ExtArgs["result"]["metricValue"]>

  export type MetricValueSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    value?: boolean
    sourceType?: boolean
    sourceSheet?: boolean
    externalId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    metricDefinitionId?: boolean
    clinicId?: boolean
    providerId?: boolean
    dataSourceId?: boolean
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | MetricValue$clinicArgs<ExtArgs>
    provider?: boolean | MetricValue$providerArgs<ExtArgs>
    dataSource?: boolean | MetricValue$dataSourceArgs<ExtArgs>
  }, ExtArgs["result"]["metricValue"]>

  export type MetricValueSelectScalar = {
    id?: boolean
    date?: boolean
    value?: boolean
    sourceType?: boolean
    sourceSheet?: boolean
    externalId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    metricDefinitionId?: boolean
    clinicId?: boolean
    providerId?: boolean
    dataSourceId?: boolean
  }

  export type MetricValueOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "date" | "value" | "sourceType" | "sourceSheet" | "externalId" | "createdAt" | "updatedAt" | "metricDefinitionId" | "clinicId" | "providerId" | "dataSourceId", ExtArgs["result"]["metricValue"]>
  export type MetricValueInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | MetricValue$clinicArgs<ExtArgs>
    provider?: boolean | MetricValue$providerArgs<ExtArgs>
    dataSource?: boolean | MetricValue$dataSourceArgs<ExtArgs>
  }
  export type MetricValueIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | MetricValue$clinicArgs<ExtArgs>
    provider?: boolean | MetricValue$providerArgs<ExtArgs>
    dataSource?: boolean | MetricValue$dataSourceArgs<ExtArgs>
  }
  export type MetricValueIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | MetricValue$clinicArgs<ExtArgs>
    provider?: boolean | MetricValue$providerArgs<ExtArgs>
    dataSource?: boolean | MetricValue$dataSourceArgs<ExtArgs>
  }

  export type $MetricValuePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MetricValue"
    objects: {
      metricDefinition: Prisma.$MetricDefinitionPayload<ExtArgs>
      clinic: Prisma.$ClinicPayload<ExtArgs> | null
      provider: Prisma.$ProviderPayload<ExtArgs> | null
      dataSource: Prisma.$DataSourcePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      value: string
      sourceType: string
      sourceSheet: string | null
      externalId: string | null
      createdAt: Date
      updatedAt: Date
      metricDefinitionId: string
      clinicId: string | null
      providerId: string | null
      dataSourceId: string | null
    }, ExtArgs["result"]["metricValue"]>
    composites: {}
  }

  type MetricValueGetPayload<S extends boolean | null | undefined | MetricValueDefaultArgs> = $Result.GetResult<Prisma.$MetricValuePayload, S>

  type MetricValueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MetricValueFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MetricValueCountAggregateInputType | true
    }

  export interface MetricValueDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MetricValue'], meta: { name: 'MetricValue' } }
    /**
     * Find zero or one MetricValue that matches the filter.
     * @param {MetricValueFindUniqueArgs} args - Arguments to find a MetricValue
     * @example
     * // Get one MetricValue
     * const metricValue = await prisma.metricValue.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MetricValueFindUniqueArgs>(args: SelectSubset<T, MetricValueFindUniqueArgs<ExtArgs>>): Prisma__MetricValueClient<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MetricValue that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MetricValueFindUniqueOrThrowArgs} args - Arguments to find a MetricValue
     * @example
     * // Get one MetricValue
     * const metricValue = await prisma.metricValue.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MetricValueFindUniqueOrThrowArgs>(args: SelectSubset<T, MetricValueFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MetricValueClient<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MetricValue that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricValueFindFirstArgs} args - Arguments to find a MetricValue
     * @example
     * // Get one MetricValue
     * const metricValue = await prisma.metricValue.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MetricValueFindFirstArgs>(args?: SelectSubset<T, MetricValueFindFirstArgs<ExtArgs>>): Prisma__MetricValueClient<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MetricValue that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricValueFindFirstOrThrowArgs} args - Arguments to find a MetricValue
     * @example
     * // Get one MetricValue
     * const metricValue = await prisma.metricValue.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MetricValueFindFirstOrThrowArgs>(args?: SelectSubset<T, MetricValueFindFirstOrThrowArgs<ExtArgs>>): Prisma__MetricValueClient<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MetricValues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricValueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MetricValues
     * const metricValues = await prisma.metricValue.findMany()
     * 
     * // Get first 10 MetricValues
     * const metricValues = await prisma.metricValue.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const metricValueWithIdOnly = await prisma.metricValue.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MetricValueFindManyArgs>(args?: SelectSubset<T, MetricValueFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MetricValue.
     * @param {MetricValueCreateArgs} args - Arguments to create a MetricValue.
     * @example
     * // Create one MetricValue
     * const MetricValue = await prisma.metricValue.create({
     *   data: {
     *     // ... data to create a MetricValue
     *   }
     * })
     * 
     */
    create<T extends MetricValueCreateArgs>(args: SelectSubset<T, MetricValueCreateArgs<ExtArgs>>): Prisma__MetricValueClient<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MetricValues.
     * @param {MetricValueCreateManyArgs} args - Arguments to create many MetricValues.
     * @example
     * // Create many MetricValues
     * const metricValue = await prisma.metricValue.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MetricValueCreateManyArgs>(args?: SelectSubset<T, MetricValueCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MetricValues and returns the data saved in the database.
     * @param {MetricValueCreateManyAndReturnArgs} args - Arguments to create many MetricValues.
     * @example
     * // Create many MetricValues
     * const metricValue = await prisma.metricValue.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MetricValues and only return the `id`
     * const metricValueWithIdOnly = await prisma.metricValue.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MetricValueCreateManyAndReturnArgs>(args?: SelectSubset<T, MetricValueCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MetricValue.
     * @param {MetricValueDeleteArgs} args - Arguments to delete one MetricValue.
     * @example
     * // Delete one MetricValue
     * const MetricValue = await prisma.metricValue.delete({
     *   where: {
     *     // ... filter to delete one MetricValue
     *   }
     * })
     * 
     */
    delete<T extends MetricValueDeleteArgs>(args: SelectSubset<T, MetricValueDeleteArgs<ExtArgs>>): Prisma__MetricValueClient<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MetricValue.
     * @param {MetricValueUpdateArgs} args - Arguments to update one MetricValue.
     * @example
     * // Update one MetricValue
     * const metricValue = await prisma.metricValue.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MetricValueUpdateArgs>(args: SelectSubset<T, MetricValueUpdateArgs<ExtArgs>>): Prisma__MetricValueClient<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MetricValues.
     * @param {MetricValueDeleteManyArgs} args - Arguments to filter MetricValues to delete.
     * @example
     * // Delete a few MetricValues
     * const { count } = await prisma.metricValue.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MetricValueDeleteManyArgs>(args?: SelectSubset<T, MetricValueDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MetricValues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricValueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MetricValues
     * const metricValue = await prisma.metricValue.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MetricValueUpdateManyArgs>(args: SelectSubset<T, MetricValueUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MetricValues and returns the data updated in the database.
     * @param {MetricValueUpdateManyAndReturnArgs} args - Arguments to update many MetricValues.
     * @example
     * // Update many MetricValues
     * const metricValue = await prisma.metricValue.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MetricValues and only return the `id`
     * const metricValueWithIdOnly = await prisma.metricValue.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MetricValueUpdateManyAndReturnArgs>(args: SelectSubset<T, MetricValueUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MetricValue.
     * @param {MetricValueUpsertArgs} args - Arguments to update or create a MetricValue.
     * @example
     * // Update or create a MetricValue
     * const metricValue = await prisma.metricValue.upsert({
     *   create: {
     *     // ... data to create a MetricValue
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MetricValue we want to update
     *   }
     * })
     */
    upsert<T extends MetricValueUpsertArgs>(args: SelectSubset<T, MetricValueUpsertArgs<ExtArgs>>): Prisma__MetricValueClient<$Result.GetResult<Prisma.$MetricValuePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MetricValues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricValueCountArgs} args - Arguments to filter MetricValues to count.
     * @example
     * // Count the number of MetricValues
     * const count = await prisma.metricValue.count({
     *   where: {
     *     // ... the filter for the MetricValues we want to count
     *   }
     * })
    **/
    count<T extends MetricValueCountArgs>(
      args?: Subset<T, MetricValueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MetricValueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MetricValue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricValueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MetricValueAggregateArgs>(args: Subset<T, MetricValueAggregateArgs>): Prisma.PrismaPromise<GetMetricValueAggregateType<T>>

    /**
     * Group by MetricValue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MetricValueGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MetricValueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MetricValueGroupByArgs['orderBy'] }
        : { orderBy?: MetricValueGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MetricValueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMetricValueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MetricValue model
   */
  readonly fields: MetricValueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MetricValue.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MetricValueClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    metricDefinition<T extends MetricDefinitionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MetricDefinitionDefaultArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    clinic<T extends MetricValue$clinicArgs<ExtArgs> = {}>(args?: Subset<T, MetricValue$clinicArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    provider<T extends MetricValue$providerArgs<ExtArgs> = {}>(args?: Subset<T, MetricValue$providerArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    dataSource<T extends MetricValue$dataSourceArgs<ExtArgs> = {}>(args?: Subset<T, MetricValue$dataSourceArgs<ExtArgs>>): Prisma__DataSourceClient<$Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MetricValue model
   */
  interface MetricValueFieldRefs {
    readonly id: FieldRef<"MetricValue", 'String'>
    readonly date: FieldRef<"MetricValue", 'DateTime'>
    readonly value: FieldRef<"MetricValue", 'String'>
    readonly sourceType: FieldRef<"MetricValue", 'String'>
    readonly sourceSheet: FieldRef<"MetricValue", 'String'>
    readonly externalId: FieldRef<"MetricValue", 'String'>
    readonly createdAt: FieldRef<"MetricValue", 'DateTime'>
    readonly updatedAt: FieldRef<"MetricValue", 'DateTime'>
    readonly metricDefinitionId: FieldRef<"MetricValue", 'String'>
    readonly clinicId: FieldRef<"MetricValue", 'String'>
    readonly providerId: FieldRef<"MetricValue", 'String'>
    readonly dataSourceId: FieldRef<"MetricValue", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MetricValue findUnique
   */
  export type MetricValueFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    /**
     * Filter, which MetricValue to fetch.
     */
    where: MetricValueWhereUniqueInput
  }

  /**
   * MetricValue findUniqueOrThrow
   */
  export type MetricValueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    /**
     * Filter, which MetricValue to fetch.
     */
    where: MetricValueWhereUniqueInput
  }

  /**
   * MetricValue findFirst
   */
  export type MetricValueFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    /**
     * Filter, which MetricValue to fetch.
     */
    where?: MetricValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricValues to fetch.
     */
    orderBy?: MetricValueOrderByWithRelationInput | MetricValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MetricValues.
     */
    cursor?: MetricValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricValues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MetricValues.
     */
    distinct?: MetricValueScalarFieldEnum | MetricValueScalarFieldEnum[]
  }

  /**
   * MetricValue findFirstOrThrow
   */
  export type MetricValueFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    /**
     * Filter, which MetricValue to fetch.
     */
    where?: MetricValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricValues to fetch.
     */
    orderBy?: MetricValueOrderByWithRelationInput | MetricValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MetricValues.
     */
    cursor?: MetricValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricValues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MetricValues.
     */
    distinct?: MetricValueScalarFieldEnum | MetricValueScalarFieldEnum[]
  }

  /**
   * MetricValue findMany
   */
  export type MetricValueFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    /**
     * Filter, which MetricValues to fetch.
     */
    where?: MetricValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MetricValues to fetch.
     */
    orderBy?: MetricValueOrderByWithRelationInput | MetricValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MetricValues.
     */
    cursor?: MetricValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MetricValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MetricValues.
     */
    skip?: number
    distinct?: MetricValueScalarFieldEnum | MetricValueScalarFieldEnum[]
  }

  /**
   * MetricValue create
   */
  export type MetricValueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    /**
     * The data needed to create a MetricValue.
     */
    data: XOR<MetricValueCreateInput, MetricValueUncheckedCreateInput>
  }

  /**
   * MetricValue createMany
   */
  export type MetricValueCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MetricValues.
     */
    data: MetricValueCreateManyInput | MetricValueCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MetricValue createManyAndReturn
   */
  export type MetricValueCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * The data used to create many MetricValues.
     */
    data: MetricValueCreateManyInput | MetricValueCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MetricValue update
   */
  export type MetricValueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    /**
     * The data needed to update a MetricValue.
     */
    data: XOR<MetricValueUpdateInput, MetricValueUncheckedUpdateInput>
    /**
     * Choose, which MetricValue to update.
     */
    where: MetricValueWhereUniqueInput
  }

  /**
   * MetricValue updateMany
   */
  export type MetricValueUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MetricValues.
     */
    data: XOR<MetricValueUpdateManyMutationInput, MetricValueUncheckedUpdateManyInput>
    /**
     * Filter which MetricValues to update
     */
    where?: MetricValueWhereInput
    /**
     * Limit how many MetricValues to update.
     */
    limit?: number
  }

  /**
   * MetricValue updateManyAndReturn
   */
  export type MetricValueUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * The data used to update MetricValues.
     */
    data: XOR<MetricValueUpdateManyMutationInput, MetricValueUncheckedUpdateManyInput>
    /**
     * Filter which MetricValues to update
     */
    where?: MetricValueWhereInput
    /**
     * Limit how many MetricValues to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MetricValue upsert
   */
  export type MetricValueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    /**
     * The filter to search for the MetricValue to update in case it exists.
     */
    where: MetricValueWhereUniqueInput
    /**
     * In case the MetricValue found by the `where` argument doesn't exist, create a new MetricValue with this data.
     */
    create: XOR<MetricValueCreateInput, MetricValueUncheckedCreateInput>
    /**
     * In case the MetricValue was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MetricValueUpdateInput, MetricValueUncheckedUpdateInput>
  }

  /**
   * MetricValue delete
   */
  export type MetricValueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
    /**
     * Filter which MetricValue to delete.
     */
    where: MetricValueWhereUniqueInput
  }

  /**
   * MetricValue deleteMany
   */
  export type MetricValueDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MetricValues to delete
     */
    where?: MetricValueWhereInput
    /**
     * Limit how many MetricValues to delete.
     */
    limit?: number
  }

  /**
   * MetricValue.clinic
   */
  export type MetricValue$clinicArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    where?: ClinicWhereInput
  }

  /**
   * MetricValue.provider
   */
  export type MetricValue$providerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    where?: ProviderWhereInput
  }

  /**
   * MetricValue.dataSource
   */
  export type MetricValue$dataSourceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataSource
     */
    select?: DataSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataSource
     */
    omit?: DataSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataSourceInclude<ExtArgs> | null
    where?: DataSourceWhereInput
  }

  /**
   * MetricValue without action
   */
  export type MetricValueDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricValue
     */
    select?: MetricValueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricValue
     */
    omit?: MetricValueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricValueInclude<ExtArgs> | null
  }


  /**
   * Model Goal
   */

  export type AggregateGoal = {
    _count: GoalCountAggregateOutputType | null
    _min: GoalMinAggregateOutputType | null
    _max: GoalMaxAggregateOutputType | null
  }

  export type GoalMinAggregateOutputType = {
    id: string | null
    timePeriod: string | null
    startDate: Date | null
    endDate: Date | null
    targetValue: string | null
    createdAt: Date | null
    updatedAt: Date | null
    metricDefinitionId: string | null
    clinicId: string | null
    providerId: string | null
  }

  export type GoalMaxAggregateOutputType = {
    id: string | null
    timePeriod: string | null
    startDate: Date | null
    endDate: Date | null
    targetValue: string | null
    createdAt: Date | null
    updatedAt: Date | null
    metricDefinitionId: string | null
    clinicId: string | null
    providerId: string | null
  }

  export type GoalCountAggregateOutputType = {
    id: number
    timePeriod: number
    startDate: number
    endDate: number
    targetValue: number
    createdAt: number
    updatedAt: number
    metricDefinitionId: number
    clinicId: number
    providerId: number
    _all: number
  }


  export type GoalMinAggregateInputType = {
    id?: true
    timePeriod?: true
    startDate?: true
    endDate?: true
    targetValue?: true
    createdAt?: true
    updatedAt?: true
    metricDefinitionId?: true
    clinicId?: true
    providerId?: true
  }

  export type GoalMaxAggregateInputType = {
    id?: true
    timePeriod?: true
    startDate?: true
    endDate?: true
    targetValue?: true
    createdAt?: true
    updatedAt?: true
    metricDefinitionId?: true
    clinicId?: true
    providerId?: true
  }

  export type GoalCountAggregateInputType = {
    id?: true
    timePeriod?: true
    startDate?: true
    endDate?: true
    targetValue?: true
    createdAt?: true
    updatedAt?: true
    metricDefinitionId?: true
    clinicId?: true
    providerId?: true
    _all?: true
  }

  export type GoalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Goal to aggregate.
     */
    where?: GoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Goals to fetch.
     */
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Goals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Goals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Goals
    **/
    _count?: true | GoalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GoalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GoalMaxAggregateInputType
  }

  export type GetGoalAggregateType<T extends GoalAggregateArgs> = {
        [P in keyof T & keyof AggregateGoal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGoal[P]>
      : GetScalarType<T[P], AggregateGoal[P]>
  }




  export type GoalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GoalWhereInput
    orderBy?: GoalOrderByWithAggregationInput | GoalOrderByWithAggregationInput[]
    by: GoalScalarFieldEnum[] | GoalScalarFieldEnum
    having?: GoalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GoalCountAggregateInputType | true
    _min?: GoalMinAggregateInputType
    _max?: GoalMaxAggregateInputType
  }

  export type GoalGroupByOutputType = {
    id: string
    timePeriod: string
    startDate: Date
    endDate: Date
    targetValue: string
    createdAt: Date
    updatedAt: Date
    metricDefinitionId: string
    clinicId: string | null
    providerId: string | null
    _count: GoalCountAggregateOutputType | null
    _min: GoalMinAggregateOutputType | null
    _max: GoalMaxAggregateOutputType | null
  }

  type GetGoalGroupByPayload<T extends GoalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GoalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GoalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GoalGroupByOutputType[P]>
            : GetScalarType<T[P], GoalGroupByOutputType[P]>
        }
      >
    >


  export type GoalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    timePeriod?: boolean
    startDate?: boolean
    endDate?: boolean
    targetValue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    metricDefinitionId?: boolean
    clinicId?: boolean
    providerId?: boolean
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | Goal$clinicArgs<ExtArgs>
    provider?: boolean | Goal$providerArgs<ExtArgs>
  }, ExtArgs["result"]["goal"]>

  export type GoalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    timePeriod?: boolean
    startDate?: boolean
    endDate?: boolean
    targetValue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    metricDefinitionId?: boolean
    clinicId?: boolean
    providerId?: boolean
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | Goal$clinicArgs<ExtArgs>
    provider?: boolean | Goal$providerArgs<ExtArgs>
  }, ExtArgs["result"]["goal"]>

  export type GoalSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    timePeriod?: boolean
    startDate?: boolean
    endDate?: boolean
    targetValue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    metricDefinitionId?: boolean
    clinicId?: boolean
    providerId?: boolean
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | Goal$clinicArgs<ExtArgs>
    provider?: boolean | Goal$providerArgs<ExtArgs>
  }, ExtArgs["result"]["goal"]>

  export type GoalSelectScalar = {
    id?: boolean
    timePeriod?: boolean
    startDate?: boolean
    endDate?: boolean
    targetValue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    metricDefinitionId?: boolean
    clinicId?: boolean
    providerId?: boolean
  }

  export type GoalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "timePeriod" | "startDate" | "endDate" | "targetValue" | "createdAt" | "updatedAt" | "metricDefinitionId" | "clinicId" | "providerId", ExtArgs["result"]["goal"]>
  export type GoalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | Goal$clinicArgs<ExtArgs>
    provider?: boolean | Goal$providerArgs<ExtArgs>
  }
  export type GoalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | Goal$clinicArgs<ExtArgs>
    provider?: boolean | Goal$providerArgs<ExtArgs>
  }
  export type GoalIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metricDefinition?: boolean | MetricDefinitionDefaultArgs<ExtArgs>
    clinic?: boolean | Goal$clinicArgs<ExtArgs>
    provider?: boolean | Goal$providerArgs<ExtArgs>
  }

  export type $GoalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Goal"
    objects: {
      metricDefinition: Prisma.$MetricDefinitionPayload<ExtArgs>
      clinic: Prisma.$ClinicPayload<ExtArgs> | null
      provider: Prisma.$ProviderPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      timePeriod: string
      startDate: Date
      endDate: Date
      targetValue: string
      createdAt: Date
      updatedAt: Date
      metricDefinitionId: string
      clinicId: string | null
      providerId: string | null
    }, ExtArgs["result"]["goal"]>
    composites: {}
  }

  type GoalGetPayload<S extends boolean | null | undefined | GoalDefaultArgs> = $Result.GetResult<Prisma.$GoalPayload, S>

  type GoalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GoalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GoalCountAggregateInputType | true
    }

  export interface GoalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Goal'], meta: { name: 'Goal' } }
    /**
     * Find zero or one Goal that matches the filter.
     * @param {GoalFindUniqueArgs} args - Arguments to find a Goal
     * @example
     * // Get one Goal
     * const goal = await prisma.goal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GoalFindUniqueArgs>(args: SelectSubset<T, GoalFindUniqueArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Goal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GoalFindUniqueOrThrowArgs} args - Arguments to find a Goal
     * @example
     * // Get one Goal
     * const goal = await prisma.goal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GoalFindUniqueOrThrowArgs>(args: SelectSubset<T, GoalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Goal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalFindFirstArgs} args - Arguments to find a Goal
     * @example
     * // Get one Goal
     * const goal = await prisma.goal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GoalFindFirstArgs>(args?: SelectSubset<T, GoalFindFirstArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Goal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalFindFirstOrThrowArgs} args - Arguments to find a Goal
     * @example
     * // Get one Goal
     * const goal = await prisma.goal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GoalFindFirstOrThrowArgs>(args?: SelectSubset<T, GoalFindFirstOrThrowArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Goals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Goals
     * const goals = await prisma.goal.findMany()
     * 
     * // Get first 10 Goals
     * const goals = await prisma.goal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const goalWithIdOnly = await prisma.goal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GoalFindManyArgs>(args?: SelectSubset<T, GoalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Goal.
     * @param {GoalCreateArgs} args - Arguments to create a Goal.
     * @example
     * // Create one Goal
     * const Goal = await prisma.goal.create({
     *   data: {
     *     // ... data to create a Goal
     *   }
     * })
     * 
     */
    create<T extends GoalCreateArgs>(args: SelectSubset<T, GoalCreateArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Goals.
     * @param {GoalCreateManyArgs} args - Arguments to create many Goals.
     * @example
     * // Create many Goals
     * const goal = await prisma.goal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GoalCreateManyArgs>(args?: SelectSubset<T, GoalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Goals and returns the data saved in the database.
     * @param {GoalCreateManyAndReturnArgs} args - Arguments to create many Goals.
     * @example
     * // Create many Goals
     * const goal = await prisma.goal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Goals and only return the `id`
     * const goalWithIdOnly = await prisma.goal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GoalCreateManyAndReturnArgs>(args?: SelectSubset<T, GoalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Goal.
     * @param {GoalDeleteArgs} args - Arguments to delete one Goal.
     * @example
     * // Delete one Goal
     * const Goal = await prisma.goal.delete({
     *   where: {
     *     // ... filter to delete one Goal
     *   }
     * })
     * 
     */
    delete<T extends GoalDeleteArgs>(args: SelectSubset<T, GoalDeleteArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Goal.
     * @param {GoalUpdateArgs} args - Arguments to update one Goal.
     * @example
     * // Update one Goal
     * const goal = await prisma.goal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GoalUpdateArgs>(args: SelectSubset<T, GoalUpdateArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Goals.
     * @param {GoalDeleteManyArgs} args - Arguments to filter Goals to delete.
     * @example
     * // Delete a few Goals
     * const { count } = await prisma.goal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GoalDeleteManyArgs>(args?: SelectSubset<T, GoalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Goals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Goals
     * const goal = await prisma.goal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GoalUpdateManyArgs>(args: SelectSubset<T, GoalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Goals and returns the data updated in the database.
     * @param {GoalUpdateManyAndReturnArgs} args - Arguments to update many Goals.
     * @example
     * // Update many Goals
     * const goal = await prisma.goal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Goals and only return the `id`
     * const goalWithIdOnly = await prisma.goal.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GoalUpdateManyAndReturnArgs>(args: SelectSubset<T, GoalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Goal.
     * @param {GoalUpsertArgs} args - Arguments to update or create a Goal.
     * @example
     * // Update or create a Goal
     * const goal = await prisma.goal.upsert({
     *   create: {
     *     // ... data to create a Goal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Goal we want to update
     *   }
     * })
     */
    upsert<T extends GoalUpsertArgs>(args: SelectSubset<T, GoalUpsertArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Goals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalCountArgs} args - Arguments to filter Goals to count.
     * @example
     * // Count the number of Goals
     * const count = await prisma.goal.count({
     *   where: {
     *     // ... the filter for the Goals we want to count
     *   }
     * })
    **/
    count<T extends GoalCountArgs>(
      args?: Subset<T, GoalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GoalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Goal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GoalAggregateArgs>(args: Subset<T, GoalAggregateArgs>): Prisma.PrismaPromise<GetGoalAggregateType<T>>

    /**
     * Group by Goal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GoalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GoalGroupByArgs['orderBy'] }
        : { orderBy?: GoalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GoalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGoalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Goal model
   */
  readonly fields: GoalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Goal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GoalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    metricDefinition<T extends MetricDefinitionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MetricDefinitionDefaultArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    clinic<T extends Goal$clinicArgs<ExtArgs> = {}>(args?: Subset<T, Goal$clinicArgs<ExtArgs>>): Prisma__ClinicClient<$Result.GetResult<Prisma.$ClinicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    provider<T extends Goal$providerArgs<ExtArgs> = {}>(args?: Subset<T, Goal$providerArgs<ExtArgs>>): Prisma__ProviderClient<$Result.GetResult<Prisma.$ProviderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Goal model
   */
  interface GoalFieldRefs {
    readonly id: FieldRef<"Goal", 'String'>
    readonly timePeriod: FieldRef<"Goal", 'String'>
    readonly startDate: FieldRef<"Goal", 'DateTime'>
    readonly endDate: FieldRef<"Goal", 'DateTime'>
    readonly targetValue: FieldRef<"Goal", 'String'>
    readonly createdAt: FieldRef<"Goal", 'DateTime'>
    readonly updatedAt: FieldRef<"Goal", 'DateTime'>
    readonly metricDefinitionId: FieldRef<"Goal", 'String'>
    readonly clinicId: FieldRef<"Goal", 'String'>
    readonly providerId: FieldRef<"Goal", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Goal findUnique
   */
  export type GoalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goal to fetch.
     */
    where: GoalWhereUniqueInput
  }

  /**
   * Goal findUniqueOrThrow
   */
  export type GoalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goal to fetch.
     */
    where: GoalWhereUniqueInput
  }

  /**
   * Goal findFirst
   */
  export type GoalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goal to fetch.
     */
    where?: GoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Goals to fetch.
     */
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Goals.
     */
    cursor?: GoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Goals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Goals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Goals.
     */
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * Goal findFirstOrThrow
   */
  export type GoalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goal to fetch.
     */
    where?: GoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Goals to fetch.
     */
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Goals.
     */
    cursor?: GoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Goals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Goals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Goals.
     */
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * Goal findMany
   */
  export type GoalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goals to fetch.
     */
    where?: GoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Goals to fetch.
     */
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Goals.
     */
    cursor?: GoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Goals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Goals.
     */
    skip?: number
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * Goal create
   */
  export type GoalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * The data needed to create a Goal.
     */
    data: XOR<GoalCreateInput, GoalUncheckedCreateInput>
  }

  /**
   * Goal createMany
   */
  export type GoalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Goals.
     */
    data: GoalCreateManyInput | GoalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Goal createManyAndReturn
   */
  export type GoalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * The data used to create many Goals.
     */
    data: GoalCreateManyInput | GoalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Goal update
   */
  export type GoalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * The data needed to update a Goal.
     */
    data: XOR<GoalUpdateInput, GoalUncheckedUpdateInput>
    /**
     * Choose, which Goal to update.
     */
    where: GoalWhereUniqueInput
  }

  /**
   * Goal updateMany
   */
  export type GoalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Goals.
     */
    data: XOR<GoalUpdateManyMutationInput, GoalUncheckedUpdateManyInput>
    /**
     * Filter which Goals to update
     */
    where?: GoalWhereInput
    /**
     * Limit how many Goals to update.
     */
    limit?: number
  }

  /**
   * Goal updateManyAndReturn
   */
  export type GoalUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * The data used to update Goals.
     */
    data: XOR<GoalUpdateManyMutationInput, GoalUncheckedUpdateManyInput>
    /**
     * Filter which Goals to update
     */
    where?: GoalWhereInput
    /**
     * Limit how many Goals to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Goal upsert
   */
  export type GoalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * The filter to search for the Goal to update in case it exists.
     */
    where: GoalWhereUniqueInput
    /**
     * In case the Goal found by the `where` argument doesn't exist, create a new Goal with this data.
     */
    create: XOR<GoalCreateInput, GoalUncheckedCreateInput>
    /**
     * In case the Goal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GoalUpdateInput, GoalUncheckedUpdateInput>
  }

  /**
   * Goal delete
   */
  export type GoalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter which Goal to delete.
     */
    where: GoalWhereUniqueInput
  }

  /**
   * Goal deleteMany
   */
  export type GoalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Goals to delete
     */
    where?: GoalWhereInput
    /**
     * Limit how many Goals to delete.
     */
    limit?: number
  }

  /**
   * Goal.clinic
   */
  export type Goal$clinicArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Clinic
     */
    select?: ClinicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Clinic
     */
    omit?: ClinicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicInclude<ExtArgs> | null
    where?: ClinicWhereInput
  }

  /**
   * Goal.provider
   */
  export type Goal$providerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Provider
     */
    select?: ProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Provider
     */
    omit?: ProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProviderInclude<ExtArgs> | null
    where?: ProviderWhereInput
  }

  /**
   * Goal without action
   */
  export type GoalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
  }


  /**
   * Model Dashboard
   */

  export type AggregateDashboard = {
    _count: DashboardCountAggregateOutputType | null
    _min: DashboardMinAggregateOutputType | null
    _max: DashboardMaxAggregateOutputType | null
  }

  export type DashboardMinAggregateOutputType = {
    id: string | null
    name: string | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type DashboardMaxAggregateOutputType = {
    id: string | null
    name: string | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type DashboardCountAggregateOutputType = {
    id: number
    name: number
    isDefault: number
    layoutConfig: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type DashboardMinAggregateInputType = {
    id?: true
    name?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type DashboardMaxAggregateInputType = {
    id?: true
    name?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type DashboardCountAggregateInputType = {
    id?: true
    name?: true
    isDefault?: true
    layoutConfig?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type DashboardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dashboard to aggregate.
     */
    where?: DashboardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dashboards to fetch.
     */
    orderBy?: DashboardOrderByWithRelationInput | DashboardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DashboardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dashboards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dashboards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Dashboards
    **/
    _count?: true | DashboardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DashboardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DashboardMaxAggregateInputType
  }

  export type GetDashboardAggregateType<T extends DashboardAggregateArgs> = {
        [P in keyof T & keyof AggregateDashboard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDashboard[P]>
      : GetScalarType<T[P], AggregateDashboard[P]>
  }




  export type DashboardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DashboardWhereInput
    orderBy?: DashboardOrderByWithAggregationInput | DashboardOrderByWithAggregationInput[]
    by: DashboardScalarFieldEnum[] | DashboardScalarFieldEnum
    having?: DashboardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DashboardCountAggregateInputType | true
    _min?: DashboardMinAggregateInputType
    _max?: DashboardMaxAggregateInputType
  }

  export type DashboardGroupByOutputType = {
    id: string
    name: string
    isDefault: boolean
    layoutConfig: JsonValue | null
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: DashboardCountAggregateOutputType | null
    _min: DashboardMinAggregateOutputType | null
    _max: DashboardMaxAggregateOutputType | null
  }

  type GetDashboardGroupByPayload<T extends DashboardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DashboardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DashboardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DashboardGroupByOutputType[P]>
            : GetScalarType<T[P], DashboardGroupByOutputType[P]>
        }
      >
    >


  export type DashboardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    isDefault?: boolean
    layoutConfig?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    widgets?: boolean | Dashboard$widgetsArgs<ExtArgs>
    _count?: boolean | DashboardCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dashboard"]>

  export type DashboardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    isDefault?: boolean
    layoutConfig?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dashboard"]>

  export type DashboardSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    isDefault?: boolean
    layoutConfig?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dashboard"]>

  export type DashboardSelectScalar = {
    id?: boolean
    name?: boolean
    isDefault?: boolean
    layoutConfig?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type DashboardOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "isDefault" | "layoutConfig" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["dashboard"]>
  export type DashboardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    widgets?: boolean | Dashboard$widgetsArgs<ExtArgs>
    _count?: boolean | DashboardCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DashboardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DashboardIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DashboardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Dashboard"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      widgets: Prisma.$WidgetPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      isDefault: boolean
      layoutConfig: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["dashboard"]>
    composites: {}
  }

  type DashboardGetPayload<S extends boolean | null | undefined | DashboardDefaultArgs> = $Result.GetResult<Prisma.$DashboardPayload, S>

  type DashboardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DashboardFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DashboardCountAggregateInputType | true
    }

  export interface DashboardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Dashboard'], meta: { name: 'Dashboard' } }
    /**
     * Find zero or one Dashboard that matches the filter.
     * @param {DashboardFindUniqueArgs} args - Arguments to find a Dashboard
     * @example
     * // Get one Dashboard
     * const dashboard = await prisma.dashboard.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DashboardFindUniqueArgs>(args: SelectSubset<T, DashboardFindUniqueArgs<ExtArgs>>): Prisma__DashboardClient<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Dashboard that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DashboardFindUniqueOrThrowArgs} args - Arguments to find a Dashboard
     * @example
     * // Get one Dashboard
     * const dashboard = await prisma.dashboard.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DashboardFindUniqueOrThrowArgs>(args: SelectSubset<T, DashboardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DashboardClient<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Dashboard that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardFindFirstArgs} args - Arguments to find a Dashboard
     * @example
     * // Get one Dashboard
     * const dashboard = await prisma.dashboard.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DashboardFindFirstArgs>(args?: SelectSubset<T, DashboardFindFirstArgs<ExtArgs>>): Prisma__DashboardClient<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Dashboard that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardFindFirstOrThrowArgs} args - Arguments to find a Dashboard
     * @example
     * // Get one Dashboard
     * const dashboard = await prisma.dashboard.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DashboardFindFirstOrThrowArgs>(args?: SelectSubset<T, DashboardFindFirstOrThrowArgs<ExtArgs>>): Prisma__DashboardClient<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Dashboards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Dashboards
     * const dashboards = await prisma.dashboard.findMany()
     * 
     * // Get first 10 Dashboards
     * const dashboards = await prisma.dashboard.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dashboardWithIdOnly = await prisma.dashboard.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DashboardFindManyArgs>(args?: SelectSubset<T, DashboardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Dashboard.
     * @param {DashboardCreateArgs} args - Arguments to create a Dashboard.
     * @example
     * // Create one Dashboard
     * const Dashboard = await prisma.dashboard.create({
     *   data: {
     *     // ... data to create a Dashboard
     *   }
     * })
     * 
     */
    create<T extends DashboardCreateArgs>(args: SelectSubset<T, DashboardCreateArgs<ExtArgs>>): Prisma__DashboardClient<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Dashboards.
     * @param {DashboardCreateManyArgs} args - Arguments to create many Dashboards.
     * @example
     * // Create many Dashboards
     * const dashboard = await prisma.dashboard.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DashboardCreateManyArgs>(args?: SelectSubset<T, DashboardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Dashboards and returns the data saved in the database.
     * @param {DashboardCreateManyAndReturnArgs} args - Arguments to create many Dashboards.
     * @example
     * // Create many Dashboards
     * const dashboard = await prisma.dashboard.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Dashboards and only return the `id`
     * const dashboardWithIdOnly = await prisma.dashboard.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DashboardCreateManyAndReturnArgs>(args?: SelectSubset<T, DashboardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Dashboard.
     * @param {DashboardDeleteArgs} args - Arguments to delete one Dashboard.
     * @example
     * // Delete one Dashboard
     * const Dashboard = await prisma.dashboard.delete({
     *   where: {
     *     // ... filter to delete one Dashboard
     *   }
     * })
     * 
     */
    delete<T extends DashboardDeleteArgs>(args: SelectSubset<T, DashboardDeleteArgs<ExtArgs>>): Prisma__DashboardClient<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Dashboard.
     * @param {DashboardUpdateArgs} args - Arguments to update one Dashboard.
     * @example
     * // Update one Dashboard
     * const dashboard = await prisma.dashboard.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DashboardUpdateArgs>(args: SelectSubset<T, DashboardUpdateArgs<ExtArgs>>): Prisma__DashboardClient<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Dashboards.
     * @param {DashboardDeleteManyArgs} args - Arguments to filter Dashboards to delete.
     * @example
     * // Delete a few Dashboards
     * const { count } = await prisma.dashboard.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DashboardDeleteManyArgs>(args?: SelectSubset<T, DashboardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Dashboards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Dashboards
     * const dashboard = await prisma.dashboard.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DashboardUpdateManyArgs>(args: SelectSubset<T, DashboardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Dashboards and returns the data updated in the database.
     * @param {DashboardUpdateManyAndReturnArgs} args - Arguments to update many Dashboards.
     * @example
     * // Update many Dashboards
     * const dashboard = await prisma.dashboard.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Dashboards and only return the `id`
     * const dashboardWithIdOnly = await prisma.dashboard.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DashboardUpdateManyAndReturnArgs>(args: SelectSubset<T, DashboardUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Dashboard.
     * @param {DashboardUpsertArgs} args - Arguments to update or create a Dashboard.
     * @example
     * // Update or create a Dashboard
     * const dashboard = await prisma.dashboard.upsert({
     *   create: {
     *     // ... data to create a Dashboard
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Dashboard we want to update
     *   }
     * })
     */
    upsert<T extends DashboardUpsertArgs>(args: SelectSubset<T, DashboardUpsertArgs<ExtArgs>>): Prisma__DashboardClient<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Dashboards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardCountArgs} args - Arguments to filter Dashboards to count.
     * @example
     * // Count the number of Dashboards
     * const count = await prisma.dashboard.count({
     *   where: {
     *     // ... the filter for the Dashboards we want to count
     *   }
     * })
    **/
    count<T extends DashboardCountArgs>(
      args?: Subset<T, DashboardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DashboardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Dashboard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DashboardAggregateArgs>(args: Subset<T, DashboardAggregateArgs>): Prisma.PrismaPromise<GetDashboardAggregateType<T>>

    /**
     * Group by Dashboard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DashboardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DashboardGroupByArgs['orderBy'] }
        : { orderBy?: DashboardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DashboardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDashboardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Dashboard model
   */
  readonly fields: DashboardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Dashboard.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DashboardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    widgets<T extends Dashboard$widgetsArgs<ExtArgs> = {}>(args?: Subset<T, Dashboard$widgetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Dashboard model
   */
  interface DashboardFieldRefs {
    readonly id: FieldRef<"Dashboard", 'String'>
    readonly name: FieldRef<"Dashboard", 'String'>
    readonly isDefault: FieldRef<"Dashboard", 'Boolean'>
    readonly layoutConfig: FieldRef<"Dashboard", 'Json'>
    readonly createdAt: FieldRef<"Dashboard", 'DateTime'>
    readonly updatedAt: FieldRef<"Dashboard", 'DateTime'>
    readonly userId: FieldRef<"Dashboard", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Dashboard findUnique
   */
  export type DashboardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    /**
     * Filter, which Dashboard to fetch.
     */
    where: DashboardWhereUniqueInput
  }

  /**
   * Dashboard findUniqueOrThrow
   */
  export type DashboardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    /**
     * Filter, which Dashboard to fetch.
     */
    where: DashboardWhereUniqueInput
  }

  /**
   * Dashboard findFirst
   */
  export type DashboardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    /**
     * Filter, which Dashboard to fetch.
     */
    where?: DashboardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dashboards to fetch.
     */
    orderBy?: DashboardOrderByWithRelationInput | DashboardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dashboards.
     */
    cursor?: DashboardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dashboards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dashboards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dashboards.
     */
    distinct?: DashboardScalarFieldEnum | DashboardScalarFieldEnum[]
  }

  /**
   * Dashboard findFirstOrThrow
   */
  export type DashboardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    /**
     * Filter, which Dashboard to fetch.
     */
    where?: DashboardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dashboards to fetch.
     */
    orderBy?: DashboardOrderByWithRelationInput | DashboardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dashboards.
     */
    cursor?: DashboardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dashboards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dashboards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dashboards.
     */
    distinct?: DashboardScalarFieldEnum | DashboardScalarFieldEnum[]
  }

  /**
   * Dashboard findMany
   */
  export type DashboardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    /**
     * Filter, which Dashboards to fetch.
     */
    where?: DashboardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dashboards to fetch.
     */
    orderBy?: DashboardOrderByWithRelationInput | DashboardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Dashboards.
     */
    cursor?: DashboardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dashboards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dashboards.
     */
    skip?: number
    distinct?: DashboardScalarFieldEnum | DashboardScalarFieldEnum[]
  }

  /**
   * Dashboard create
   */
  export type DashboardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    /**
     * The data needed to create a Dashboard.
     */
    data: XOR<DashboardCreateInput, DashboardUncheckedCreateInput>
  }

  /**
   * Dashboard createMany
   */
  export type DashboardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Dashboards.
     */
    data: DashboardCreateManyInput | DashboardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Dashboard createManyAndReturn
   */
  export type DashboardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * The data used to create many Dashboards.
     */
    data: DashboardCreateManyInput | DashboardCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Dashboard update
   */
  export type DashboardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    /**
     * The data needed to update a Dashboard.
     */
    data: XOR<DashboardUpdateInput, DashboardUncheckedUpdateInput>
    /**
     * Choose, which Dashboard to update.
     */
    where: DashboardWhereUniqueInput
  }

  /**
   * Dashboard updateMany
   */
  export type DashboardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Dashboards.
     */
    data: XOR<DashboardUpdateManyMutationInput, DashboardUncheckedUpdateManyInput>
    /**
     * Filter which Dashboards to update
     */
    where?: DashboardWhereInput
    /**
     * Limit how many Dashboards to update.
     */
    limit?: number
  }

  /**
   * Dashboard updateManyAndReturn
   */
  export type DashboardUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * The data used to update Dashboards.
     */
    data: XOR<DashboardUpdateManyMutationInput, DashboardUncheckedUpdateManyInput>
    /**
     * Filter which Dashboards to update
     */
    where?: DashboardWhereInput
    /**
     * Limit how many Dashboards to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Dashboard upsert
   */
  export type DashboardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    /**
     * The filter to search for the Dashboard to update in case it exists.
     */
    where: DashboardWhereUniqueInput
    /**
     * In case the Dashboard found by the `where` argument doesn't exist, create a new Dashboard with this data.
     */
    create: XOR<DashboardCreateInput, DashboardUncheckedCreateInput>
    /**
     * In case the Dashboard was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DashboardUpdateInput, DashboardUncheckedUpdateInput>
  }

  /**
   * Dashboard delete
   */
  export type DashboardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
    /**
     * Filter which Dashboard to delete.
     */
    where: DashboardWhereUniqueInput
  }

  /**
   * Dashboard deleteMany
   */
  export type DashboardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dashboards to delete
     */
    where?: DashboardWhereInput
    /**
     * Limit how many Dashboards to delete.
     */
    limit?: number
  }

  /**
   * Dashboard.widgets
   */
  export type Dashboard$widgetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    where?: WidgetWhereInput
    orderBy?: WidgetOrderByWithRelationInput | WidgetOrderByWithRelationInput[]
    cursor?: WidgetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WidgetScalarFieldEnum | WidgetScalarFieldEnum[]
  }

  /**
   * Dashboard without action
   */
  export type DashboardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dashboard
     */
    select?: DashboardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dashboard
     */
    omit?: DashboardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DashboardInclude<ExtArgs> | null
  }


  /**
   * Model Widget
   */

  export type AggregateWidget = {
    _count: WidgetCountAggregateOutputType | null
    _avg: WidgetAvgAggregateOutputType | null
    _sum: WidgetSumAggregateOutputType | null
    _min: WidgetMinAggregateOutputType | null
    _max: WidgetMaxAggregateOutputType | null
  }

  export type WidgetAvgAggregateOutputType = {
    positionX: number | null
    positionY: number | null
    width: number | null
    height: number | null
  }

  export type WidgetSumAggregateOutputType = {
    positionX: number | null
    positionY: number | null
    width: number | null
    height: number | null
  }

  export type WidgetMinAggregateOutputType = {
    id: string | null
    widgetType: string | null
    chartType: string | null
    positionX: number | null
    positionY: number | null
    width: number | null
    height: number | null
    createdAt: Date | null
    updatedAt: Date | null
    dashboardId: string | null
    metricDefinitionId: string | null
  }

  export type WidgetMaxAggregateOutputType = {
    id: string | null
    widgetType: string | null
    chartType: string | null
    positionX: number | null
    positionY: number | null
    width: number | null
    height: number | null
    createdAt: Date | null
    updatedAt: Date | null
    dashboardId: string | null
    metricDefinitionId: string | null
  }

  export type WidgetCountAggregateOutputType = {
    id: number
    widgetType: number
    chartType: number
    positionX: number
    positionY: number
    width: number
    height: number
    config: number
    createdAt: number
    updatedAt: number
    dashboardId: number
    metricDefinitionId: number
    _all: number
  }


  export type WidgetAvgAggregateInputType = {
    positionX?: true
    positionY?: true
    width?: true
    height?: true
  }

  export type WidgetSumAggregateInputType = {
    positionX?: true
    positionY?: true
    width?: true
    height?: true
  }

  export type WidgetMinAggregateInputType = {
    id?: true
    widgetType?: true
    chartType?: true
    positionX?: true
    positionY?: true
    width?: true
    height?: true
    createdAt?: true
    updatedAt?: true
    dashboardId?: true
    metricDefinitionId?: true
  }

  export type WidgetMaxAggregateInputType = {
    id?: true
    widgetType?: true
    chartType?: true
    positionX?: true
    positionY?: true
    width?: true
    height?: true
    createdAt?: true
    updatedAt?: true
    dashboardId?: true
    metricDefinitionId?: true
  }

  export type WidgetCountAggregateInputType = {
    id?: true
    widgetType?: true
    chartType?: true
    positionX?: true
    positionY?: true
    width?: true
    height?: true
    config?: true
    createdAt?: true
    updatedAt?: true
    dashboardId?: true
    metricDefinitionId?: true
    _all?: true
  }

  export type WidgetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Widget to aggregate.
     */
    where?: WidgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Widgets to fetch.
     */
    orderBy?: WidgetOrderByWithRelationInput | WidgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WidgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Widgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Widgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Widgets
    **/
    _count?: true | WidgetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WidgetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WidgetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WidgetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WidgetMaxAggregateInputType
  }

  export type GetWidgetAggregateType<T extends WidgetAggregateArgs> = {
        [P in keyof T & keyof AggregateWidget]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWidget[P]>
      : GetScalarType<T[P], AggregateWidget[P]>
  }




  export type WidgetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WidgetWhereInput
    orderBy?: WidgetOrderByWithAggregationInput | WidgetOrderByWithAggregationInput[]
    by: WidgetScalarFieldEnum[] | WidgetScalarFieldEnum
    having?: WidgetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WidgetCountAggregateInputType | true
    _avg?: WidgetAvgAggregateInputType
    _sum?: WidgetSumAggregateInputType
    _min?: WidgetMinAggregateInputType
    _max?: WidgetMaxAggregateInputType
  }

  export type WidgetGroupByOutputType = {
    id: string
    widgetType: string
    chartType: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config: JsonValue | null
    createdAt: Date
    updatedAt: Date
    dashboardId: string
    metricDefinitionId: string | null
    _count: WidgetCountAggregateOutputType | null
    _avg: WidgetAvgAggregateOutputType | null
    _sum: WidgetSumAggregateOutputType | null
    _min: WidgetMinAggregateOutputType | null
    _max: WidgetMaxAggregateOutputType | null
  }

  type GetWidgetGroupByPayload<T extends WidgetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WidgetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WidgetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WidgetGroupByOutputType[P]>
            : GetScalarType<T[P], WidgetGroupByOutputType[P]>
        }
      >
    >


  export type WidgetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    widgetType?: boolean
    chartType?: boolean
    positionX?: boolean
    positionY?: boolean
    width?: boolean
    height?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dashboardId?: boolean
    metricDefinitionId?: boolean
    dashboard?: boolean | DashboardDefaultArgs<ExtArgs>
    metricDefinition?: boolean | Widget$metricDefinitionArgs<ExtArgs>
  }, ExtArgs["result"]["widget"]>

  export type WidgetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    widgetType?: boolean
    chartType?: boolean
    positionX?: boolean
    positionY?: boolean
    width?: boolean
    height?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dashboardId?: boolean
    metricDefinitionId?: boolean
    dashboard?: boolean | DashboardDefaultArgs<ExtArgs>
    metricDefinition?: boolean | Widget$metricDefinitionArgs<ExtArgs>
  }, ExtArgs["result"]["widget"]>

  export type WidgetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    widgetType?: boolean
    chartType?: boolean
    positionX?: boolean
    positionY?: boolean
    width?: boolean
    height?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dashboardId?: boolean
    metricDefinitionId?: boolean
    dashboard?: boolean | DashboardDefaultArgs<ExtArgs>
    metricDefinition?: boolean | Widget$metricDefinitionArgs<ExtArgs>
  }, ExtArgs["result"]["widget"]>

  export type WidgetSelectScalar = {
    id?: boolean
    widgetType?: boolean
    chartType?: boolean
    positionX?: boolean
    positionY?: boolean
    width?: boolean
    height?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dashboardId?: boolean
    metricDefinitionId?: boolean
  }

  export type WidgetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "widgetType" | "chartType" | "positionX" | "positionY" | "width" | "height" | "config" | "createdAt" | "updatedAt" | "dashboardId" | "metricDefinitionId", ExtArgs["result"]["widget"]>
  export type WidgetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dashboard?: boolean | DashboardDefaultArgs<ExtArgs>
    metricDefinition?: boolean | Widget$metricDefinitionArgs<ExtArgs>
  }
  export type WidgetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dashboard?: boolean | DashboardDefaultArgs<ExtArgs>
    metricDefinition?: boolean | Widget$metricDefinitionArgs<ExtArgs>
  }
  export type WidgetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dashboard?: boolean | DashboardDefaultArgs<ExtArgs>
    metricDefinition?: boolean | Widget$metricDefinitionArgs<ExtArgs>
  }

  export type $WidgetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Widget"
    objects: {
      dashboard: Prisma.$DashboardPayload<ExtArgs>
      metricDefinition: Prisma.$MetricDefinitionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      widgetType: string
      chartType: string | null
      positionX: number
      positionY: number
      width: number
      height: number
      config: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
      dashboardId: string
      metricDefinitionId: string | null
    }, ExtArgs["result"]["widget"]>
    composites: {}
  }

  type WidgetGetPayload<S extends boolean | null | undefined | WidgetDefaultArgs> = $Result.GetResult<Prisma.$WidgetPayload, S>

  type WidgetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WidgetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WidgetCountAggregateInputType | true
    }

  export interface WidgetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Widget'], meta: { name: 'Widget' } }
    /**
     * Find zero or one Widget that matches the filter.
     * @param {WidgetFindUniqueArgs} args - Arguments to find a Widget
     * @example
     * // Get one Widget
     * const widget = await prisma.widget.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WidgetFindUniqueArgs>(args: SelectSubset<T, WidgetFindUniqueArgs<ExtArgs>>): Prisma__WidgetClient<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Widget that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WidgetFindUniqueOrThrowArgs} args - Arguments to find a Widget
     * @example
     * // Get one Widget
     * const widget = await prisma.widget.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WidgetFindUniqueOrThrowArgs>(args: SelectSubset<T, WidgetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WidgetClient<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Widget that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WidgetFindFirstArgs} args - Arguments to find a Widget
     * @example
     * // Get one Widget
     * const widget = await prisma.widget.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WidgetFindFirstArgs>(args?: SelectSubset<T, WidgetFindFirstArgs<ExtArgs>>): Prisma__WidgetClient<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Widget that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WidgetFindFirstOrThrowArgs} args - Arguments to find a Widget
     * @example
     * // Get one Widget
     * const widget = await prisma.widget.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WidgetFindFirstOrThrowArgs>(args?: SelectSubset<T, WidgetFindFirstOrThrowArgs<ExtArgs>>): Prisma__WidgetClient<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Widgets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WidgetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Widgets
     * const widgets = await prisma.widget.findMany()
     * 
     * // Get first 10 Widgets
     * const widgets = await prisma.widget.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const widgetWithIdOnly = await prisma.widget.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WidgetFindManyArgs>(args?: SelectSubset<T, WidgetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Widget.
     * @param {WidgetCreateArgs} args - Arguments to create a Widget.
     * @example
     * // Create one Widget
     * const Widget = await prisma.widget.create({
     *   data: {
     *     // ... data to create a Widget
     *   }
     * })
     * 
     */
    create<T extends WidgetCreateArgs>(args: SelectSubset<T, WidgetCreateArgs<ExtArgs>>): Prisma__WidgetClient<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Widgets.
     * @param {WidgetCreateManyArgs} args - Arguments to create many Widgets.
     * @example
     * // Create many Widgets
     * const widget = await prisma.widget.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WidgetCreateManyArgs>(args?: SelectSubset<T, WidgetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Widgets and returns the data saved in the database.
     * @param {WidgetCreateManyAndReturnArgs} args - Arguments to create many Widgets.
     * @example
     * // Create many Widgets
     * const widget = await prisma.widget.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Widgets and only return the `id`
     * const widgetWithIdOnly = await prisma.widget.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WidgetCreateManyAndReturnArgs>(args?: SelectSubset<T, WidgetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Widget.
     * @param {WidgetDeleteArgs} args - Arguments to delete one Widget.
     * @example
     * // Delete one Widget
     * const Widget = await prisma.widget.delete({
     *   where: {
     *     // ... filter to delete one Widget
     *   }
     * })
     * 
     */
    delete<T extends WidgetDeleteArgs>(args: SelectSubset<T, WidgetDeleteArgs<ExtArgs>>): Prisma__WidgetClient<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Widget.
     * @param {WidgetUpdateArgs} args - Arguments to update one Widget.
     * @example
     * // Update one Widget
     * const widget = await prisma.widget.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WidgetUpdateArgs>(args: SelectSubset<T, WidgetUpdateArgs<ExtArgs>>): Prisma__WidgetClient<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Widgets.
     * @param {WidgetDeleteManyArgs} args - Arguments to filter Widgets to delete.
     * @example
     * // Delete a few Widgets
     * const { count } = await prisma.widget.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WidgetDeleteManyArgs>(args?: SelectSubset<T, WidgetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Widgets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WidgetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Widgets
     * const widget = await prisma.widget.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WidgetUpdateManyArgs>(args: SelectSubset<T, WidgetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Widgets and returns the data updated in the database.
     * @param {WidgetUpdateManyAndReturnArgs} args - Arguments to update many Widgets.
     * @example
     * // Update many Widgets
     * const widget = await prisma.widget.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Widgets and only return the `id`
     * const widgetWithIdOnly = await prisma.widget.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WidgetUpdateManyAndReturnArgs>(args: SelectSubset<T, WidgetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Widget.
     * @param {WidgetUpsertArgs} args - Arguments to update or create a Widget.
     * @example
     * // Update or create a Widget
     * const widget = await prisma.widget.upsert({
     *   create: {
     *     // ... data to create a Widget
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Widget we want to update
     *   }
     * })
     */
    upsert<T extends WidgetUpsertArgs>(args: SelectSubset<T, WidgetUpsertArgs<ExtArgs>>): Prisma__WidgetClient<$Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Widgets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WidgetCountArgs} args - Arguments to filter Widgets to count.
     * @example
     * // Count the number of Widgets
     * const count = await prisma.widget.count({
     *   where: {
     *     // ... the filter for the Widgets we want to count
     *   }
     * })
    **/
    count<T extends WidgetCountArgs>(
      args?: Subset<T, WidgetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WidgetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Widget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WidgetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WidgetAggregateArgs>(args: Subset<T, WidgetAggregateArgs>): Prisma.PrismaPromise<GetWidgetAggregateType<T>>

    /**
     * Group by Widget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WidgetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WidgetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WidgetGroupByArgs['orderBy'] }
        : { orderBy?: WidgetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WidgetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWidgetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Widget model
   */
  readonly fields: WidgetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Widget.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WidgetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    dashboard<T extends DashboardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DashboardDefaultArgs<ExtArgs>>): Prisma__DashboardClient<$Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    metricDefinition<T extends Widget$metricDefinitionArgs<ExtArgs> = {}>(args?: Subset<T, Widget$metricDefinitionArgs<ExtArgs>>): Prisma__MetricDefinitionClient<$Result.GetResult<Prisma.$MetricDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Widget model
   */
  interface WidgetFieldRefs {
    readonly id: FieldRef<"Widget", 'String'>
    readonly widgetType: FieldRef<"Widget", 'String'>
    readonly chartType: FieldRef<"Widget", 'String'>
    readonly positionX: FieldRef<"Widget", 'Int'>
    readonly positionY: FieldRef<"Widget", 'Int'>
    readonly width: FieldRef<"Widget", 'Int'>
    readonly height: FieldRef<"Widget", 'Int'>
    readonly config: FieldRef<"Widget", 'Json'>
    readonly createdAt: FieldRef<"Widget", 'DateTime'>
    readonly updatedAt: FieldRef<"Widget", 'DateTime'>
    readonly dashboardId: FieldRef<"Widget", 'String'>
    readonly metricDefinitionId: FieldRef<"Widget", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Widget findUnique
   */
  export type WidgetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    /**
     * Filter, which Widget to fetch.
     */
    where: WidgetWhereUniqueInput
  }

  /**
   * Widget findUniqueOrThrow
   */
  export type WidgetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    /**
     * Filter, which Widget to fetch.
     */
    where: WidgetWhereUniqueInput
  }

  /**
   * Widget findFirst
   */
  export type WidgetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    /**
     * Filter, which Widget to fetch.
     */
    where?: WidgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Widgets to fetch.
     */
    orderBy?: WidgetOrderByWithRelationInput | WidgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Widgets.
     */
    cursor?: WidgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Widgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Widgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Widgets.
     */
    distinct?: WidgetScalarFieldEnum | WidgetScalarFieldEnum[]
  }

  /**
   * Widget findFirstOrThrow
   */
  export type WidgetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    /**
     * Filter, which Widget to fetch.
     */
    where?: WidgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Widgets to fetch.
     */
    orderBy?: WidgetOrderByWithRelationInput | WidgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Widgets.
     */
    cursor?: WidgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Widgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Widgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Widgets.
     */
    distinct?: WidgetScalarFieldEnum | WidgetScalarFieldEnum[]
  }

  /**
   * Widget findMany
   */
  export type WidgetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    /**
     * Filter, which Widgets to fetch.
     */
    where?: WidgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Widgets to fetch.
     */
    orderBy?: WidgetOrderByWithRelationInput | WidgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Widgets.
     */
    cursor?: WidgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Widgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Widgets.
     */
    skip?: number
    distinct?: WidgetScalarFieldEnum | WidgetScalarFieldEnum[]
  }

  /**
   * Widget create
   */
  export type WidgetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    /**
     * The data needed to create a Widget.
     */
    data: XOR<WidgetCreateInput, WidgetUncheckedCreateInput>
  }

  /**
   * Widget createMany
   */
  export type WidgetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Widgets.
     */
    data: WidgetCreateManyInput | WidgetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Widget createManyAndReturn
   */
  export type WidgetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * The data used to create many Widgets.
     */
    data: WidgetCreateManyInput | WidgetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Widget update
   */
  export type WidgetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    /**
     * The data needed to update a Widget.
     */
    data: XOR<WidgetUpdateInput, WidgetUncheckedUpdateInput>
    /**
     * Choose, which Widget to update.
     */
    where: WidgetWhereUniqueInput
  }

  /**
   * Widget updateMany
   */
  export type WidgetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Widgets.
     */
    data: XOR<WidgetUpdateManyMutationInput, WidgetUncheckedUpdateManyInput>
    /**
     * Filter which Widgets to update
     */
    where?: WidgetWhereInput
    /**
     * Limit how many Widgets to update.
     */
    limit?: number
  }

  /**
   * Widget updateManyAndReturn
   */
  export type WidgetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * The data used to update Widgets.
     */
    data: XOR<WidgetUpdateManyMutationInput, WidgetUncheckedUpdateManyInput>
    /**
     * Filter which Widgets to update
     */
    where?: WidgetWhereInput
    /**
     * Limit how many Widgets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Widget upsert
   */
  export type WidgetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    /**
     * The filter to search for the Widget to update in case it exists.
     */
    where: WidgetWhereUniqueInput
    /**
     * In case the Widget found by the `where` argument doesn't exist, create a new Widget with this data.
     */
    create: XOR<WidgetCreateInput, WidgetUncheckedCreateInput>
    /**
     * In case the Widget was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WidgetUpdateInput, WidgetUncheckedUpdateInput>
  }

  /**
   * Widget delete
   */
  export type WidgetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
    /**
     * Filter which Widget to delete.
     */
    where: WidgetWhereUniqueInput
  }

  /**
   * Widget deleteMany
   */
  export type WidgetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Widgets to delete
     */
    where?: WidgetWhereInput
    /**
     * Limit how many Widgets to delete.
     */
    limit?: number
  }

  /**
   * Widget.metricDefinition
   */
  export type Widget$metricDefinitionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MetricDefinition
     */
    select?: MetricDefinitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MetricDefinition
     */
    omit?: MetricDefinitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MetricDefinitionInclude<ExtArgs> | null
    where?: MetricDefinitionWhereInput
  }

  /**
   * Widget without action
   */
  export type WidgetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Widget
     */
    select?: WidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Widget
     */
    omit?: WidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WidgetInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ClinicScalarFieldEnum: {
    id: 'id',
    name: 'name',
    location: 'location',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ClinicScalarFieldEnum = (typeof ClinicScalarFieldEnum)[keyof typeof ClinicScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    role: 'role',
    lastLogin: 'lastLogin',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    clinicId: 'clinicId'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ProviderScalarFieldEnum: {
    id: 'id',
    name: 'name',
    providerType: 'providerType',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    clinicId: 'clinicId'
  };

  export type ProviderScalarFieldEnum = (typeof ProviderScalarFieldEnum)[keyof typeof ProviderScalarFieldEnum]


  export const MetricDefinitionScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    dataType: 'dataType',
    calculationFormula: 'calculationFormula',
    category: 'category',
    isComposite: 'isComposite',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MetricDefinitionScalarFieldEnum = (typeof MetricDefinitionScalarFieldEnum)[keyof typeof MetricDefinitionScalarFieldEnum]


  export const DataSourceScalarFieldEnum: {
    id: 'id',
    name: 'name',
    spreadsheetId: 'spreadsheetId',
    sheetName: 'sheetName',
    lastSyncedAt: 'lastSyncedAt',
    syncFrequency: 'syncFrequency',
    connectionStatus: 'connectionStatus',
    appScriptId: 'appScriptId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DataSourceScalarFieldEnum = (typeof DataSourceScalarFieldEnum)[keyof typeof DataSourceScalarFieldEnum]


  export const ColumnMappingScalarFieldEnum: {
    id: 'id',
    columnName: 'columnName',
    transformationRule: 'transformationRule',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    dataSourceId: 'dataSourceId',
    metricDefinitionId: 'metricDefinitionId'
  };

  export type ColumnMappingScalarFieldEnum = (typeof ColumnMappingScalarFieldEnum)[keyof typeof ColumnMappingScalarFieldEnum]


  export const MetricValueScalarFieldEnum: {
    id: 'id',
    date: 'date',
    value: 'value',
    sourceType: 'sourceType',
    sourceSheet: 'sourceSheet',
    externalId: 'externalId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    metricDefinitionId: 'metricDefinitionId',
    clinicId: 'clinicId',
    providerId: 'providerId',
    dataSourceId: 'dataSourceId'
  };

  export type MetricValueScalarFieldEnum = (typeof MetricValueScalarFieldEnum)[keyof typeof MetricValueScalarFieldEnum]


  export const GoalScalarFieldEnum: {
    id: 'id',
    timePeriod: 'timePeriod',
    startDate: 'startDate',
    endDate: 'endDate',
    targetValue: 'targetValue',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    metricDefinitionId: 'metricDefinitionId',
    clinicId: 'clinicId',
    providerId: 'providerId'
  };

  export type GoalScalarFieldEnum = (typeof GoalScalarFieldEnum)[keyof typeof GoalScalarFieldEnum]


  export const DashboardScalarFieldEnum: {
    id: 'id',
    name: 'name',
    isDefault: 'isDefault',
    layoutConfig: 'layoutConfig',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type DashboardScalarFieldEnum = (typeof DashboardScalarFieldEnum)[keyof typeof DashboardScalarFieldEnum]


  export const WidgetScalarFieldEnum: {
    id: 'id',
    widgetType: 'widgetType',
    chartType: 'chartType',
    positionX: 'positionX',
    positionY: 'positionY',
    width: 'width',
    height: 'height',
    config: 'config',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    dashboardId: 'dashboardId',
    metricDefinitionId: 'metricDefinitionId'
  };

  export type WidgetScalarFieldEnum = (typeof WidgetScalarFieldEnum)[keyof typeof WidgetScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ClinicWhereInput = {
    AND?: ClinicWhereInput | ClinicWhereInput[]
    OR?: ClinicWhereInput[]
    NOT?: ClinicWhereInput | ClinicWhereInput[]
    id?: StringFilter<"Clinic"> | string
    name?: StringFilter<"Clinic"> | string
    location?: StringFilter<"Clinic"> | string
    status?: StringFilter<"Clinic"> | string
    createdAt?: DateTimeFilter<"Clinic"> | Date | string
    updatedAt?: DateTimeFilter<"Clinic"> | Date | string
    users?: UserListRelationFilter
    providers?: ProviderListRelationFilter
    metrics?: MetricValueListRelationFilter
    goals?: GoalListRelationFilter
  }

  export type ClinicOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    users?: UserOrderByRelationAggregateInput
    providers?: ProviderOrderByRelationAggregateInput
    metrics?: MetricValueOrderByRelationAggregateInput
    goals?: GoalOrderByRelationAggregateInput
  }

  export type ClinicWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ClinicWhereInput | ClinicWhereInput[]
    OR?: ClinicWhereInput[]
    NOT?: ClinicWhereInput | ClinicWhereInput[]
    name?: StringFilter<"Clinic"> | string
    location?: StringFilter<"Clinic"> | string
    status?: StringFilter<"Clinic"> | string
    createdAt?: DateTimeFilter<"Clinic"> | Date | string
    updatedAt?: DateTimeFilter<"Clinic"> | Date | string
    users?: UserListRelationFilter
    providers?: ProviderListRelationFilter
    metrics?: MetricValueListRelationFilter
    goals?: GoalListRelationFilter
  }, "id">

  export type ClinicOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ClinicCountOrderByAggregateInput
    _max?: ClinicMaxOrderByAggregateInput
    _min?: ClinicMinOrderByAggregateInput
  }

  export type ClinicScalarWhereWithAggregatesInput = {
    AND?: ClinicScalarWhereWithAggregatesInput | ClinicScalarWhereWithAggregatesInput[]
    OR?: ClinicScalarWhereWithAggregatesInput[]
    NOT?: ClinicScalarWhereWithAggregatesInput | ClinicScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Clinic"> | string
    name?: StringWithAggregatesFilter<"Clinic"> | string
    location?: StringWithAggregatesFilter<"Clinic"> | string
    status?: StringWithAggregatesFilter<"Clinic"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Clinic"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Clinic"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    lastLogin?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    clinicId?: StringFilter<"User"> | string
    clinic?: XOR<ClinicScalarRelationFilter, ClinicWhereInput>
    dashboards?: DashboardListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    lastLogin?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
    clinic?: ClinicOrderByWithRelationInput
    dashboards?: DashboardOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    lastLogin?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    clinicId?: StringFilter<"User"> | string
    clinic?: XOR<ClinicScalarRelationFilter, ClinicWhereInput>
    dashboards?: DashboardListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    lastLogin?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    role?: StringWithAggregatesFilter<"User"> | string
    lastLogin?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    clinicId?: StringWithAggregatesFilter<"User"> | string
  }

  export type ProviderWhereInput = {
    AND?: ProviderWhereInput | ProviderWhereInput[]
    OR?: ProviderWhereInput[]
    NOT?: ProviderWhereInput | ProviderWhereInput[]
    id?: StringFilter<"Provider"> | string
    name?: StringFilter<"Provider"> | string
    providerType?: StringFilter<"Provider"> | string
    status?: StringFilter<"Provider"> | string
    createdAt?: DateTimeFilter<"Provider"> | Date | string
    updatedAt?: DateTimeFilter<"Provider"> | Date | string
    clinicId?: StringFilter<"Provider"> | string
    clinic?: XOR<ClinicScalarRelationFilter, ClinicWhereInput>
    metrics?: MetricValueListRelationFilter
    goals?: GoalListRelationFilter
  }

  export type ProviderOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    providerType?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
    clinic?: ClinicOrderByWithRelationInput
    metrics?: MetricValueOrderByRelationAggregateInput
    goals?: GoalOrderByRelationAggregateInput
  }

  export type ProviderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProviderWhereInput | ProviderWhereInput[]
    OR?: ProviderWhereInput[]
    NOT?: ProviderWhereInput | ProviderWhereInput[]
    name?: StringFilter<"Provider"> | string
    providerType?: StringFilter<"Provider"> | string
    status?: StringFilter<"Provider"> | string
    createdAt?: DateTimeFilter<"Provider"> | Date | string
    updatedAt?: DateTimeFilter<"Provider"> | Date | string
    clinicId?: StringFilter<"Provider"> | string
    clinic?: XOR<ClinicScalarRelationFilter, ClinicWhereInput>
    metrics?: MetricValueListRelationFilter
    goals?: GoalListRelationFilter
  }, "id">

  export type ProviderOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    providerType?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
    _count?: ProviderCountOrderByAggregateInput
    _max?: ProviderMaxOrderByAggregateInput
    _min?: ProviderMinOrderByAggregateInput
  }

  export type ProviderScalarWhereWithAggregatesInput = {
    AND?: ProviderScalarWhereWithAggregatesInput | ProviderScalarWhereWithAggregatesInput[]
    OR?: ProviderScalarWhereWithAggregatesInput[]
    NOT?: ProviderScalarWhereWithAggregatesInput | ProviderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Provider"> | string
    name?: StringWithAggregatesFilter<"Provider"> | string
    providerType?: StringWithAggregatesFilter<"Provider"> | string
    status?: StringWithAggregatesFilter<"Provider"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Provider"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Provider"> | Date | string
    clinicId?: StringWithAggregatesFilter<"Provider"> | string
  }

  export type MetricDefinitionWhereInput = {
    AND?: MetricDefinitionWhereInput | MetricDefinitionWhereInput[]
    OR?: MetricDefinitionWhereInput[]
    NOT?: MetricDefinitionWhereInput | MetricDefinitionWhereInput[]
    id?: StringFilter<"MetricDefinition"> | string
    name?: StringFilter<"MetricDefinition"> | string
    description?: StringFilter<"MetricDefinition"> | string
    dataType?: StringFilter<"MetricDefinition"> | string
    calculationFormula?: StringNullableFilter<"MetricDefinition"> | string | null
    category?: StringFilter<"MetricDefinition"> | string
    isComposite?: BoolFilter<"MetricDefinition"> | boolean
    createdAt?: DateTimeFilter<"MetricDefinition"> | Date | string
    updatedAt?: DateTimeFilter<"MetricDefinition"> | Date | string
    metrics?: MetricValueListRelationFilter
    columnMappings?: ColumnMappingListRelationFilter
    goals?: GoalListRelationFilter
    widgets?: WidgetListRelationFilter
  }

  export type MetricDefinitionOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    dataType?: SortOrder
    calculationFormula?: SortOrderInput | SortOrder
    category?: SortOrder
    isComposite?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metrics?: MetricValueOrderByRelationAggregateInput
    columnMappings?: ColumnMappingOrderByRelationAggregateInput
    goals?: GoalOrderByRelationAggregateInput
    widgets?: WidgetOrderByRelationAggregateInput
  }

  export type MetricDefinitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MetricDefinitionWhereInput | MetricDefinitionWhereInput[]
    OR?: MetricDefinitionWhereInput[]
    NOT?: MetricDefinitionWhereInput | MetricDefinitionWhereInput[]
    name?: StringFilter<"MetricDefinition"> | string
    description?: StringFilter<"MetricDefinition"> | string
    dataType?: StringFilter<"MetricDefinition"> | string
    calculationFormula?: StringNullableFilter<"MetricDefinition"> | string | null
    category?: StringFilter<"MetricDefinition"> | string
    isComposite?: BoolFilter<"MetricDefinition"> | boolean
    createdAt?: DateTimeFilter<"MetricDefinition"> | Date | string
    updatedAt?: DateTimeFilter<"MetricDefinition"> | Date | string
    metrics?: MetricValueListRelationFilter
    columnMappings?: ColumnMappingListRelationFilter
    goals?: GoalListRelationFilter
    widgets?: WidgetListRelationFilter
  }, "id">

  export type MetricDefinitionOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    dataType?: SortOrder
    calculationFormula?: SortOrderInput | SortOrder
    category?: SortOrder
    isComposite?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MetricDefinitionCountOrderByAggregateInput
    _max?: MetricDefinitionMaxOrderByAggregateInput
    _min?: MetricDefinitionMinOrderByAggregateInput
  }

  export type MetricDefinitionScalarWhereWithAggregatesInput = {
    AND?: MetricDefinitionScalarWhereWithAggregatesInput | MetricDefinitionScalarWhereWithAggregatesInput[]
    OR?: MetricDefinitionScalarWhereWithAggregatesInput[]
    NOT?: MetricDefinitionScalarWhereWithAggregatesInput | MetricDefinitionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MetricDefinition"> | string
    name?: StringWithAggregatesFilter<"MetricDefinition"> | string
    description?: StringWithAggregatesFilter<"MetricDefinition"> | string
    dataType?: StringWithAggregatesFilter<"MetricDefinition"> | string
    calculationFormula?: StringNullableWithAggregatesFilter<"MetricDefinition"> | string | null
    category?: StringWithAggregatesFilter<"MetricDefinition"> | string
    isComposite?: BoolWithAggregatesFilter<"MetricDefinition"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"MetricDefinition"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MetricDefinition"> | Date | string
  }

  export type DataSourceWhereInput = {
    AND?: DataSourceWhereInput | DataSourceWhereInput[]
    OR?: DataSourceWhereInput[]
    NOT?: DataSourceWhereInput | DataSourceWhereInput[]
    id?: StringFilter<"DataSource"> | string
    name?: StringFilter<"DataSource"> | string
    spreadsheetId?: StringFilter<"DataSource"> | string
    sheetName?: StringFilter<"DataSource"> | string
    lastSyncedAt?: DateTimeNullableFilter<"DataSource"> | Date | string | null
    syncFrequency?: StringFilter<"DataSource"> | string
    connectionStatus?: StringFilter<"DataSource"> | string
    appScriptId?: StringNullableFilter<"DataSource"> | string | null
    createdAt?: DateTimeFilter<"DataSource"> | Date | string
    updatedAt?: DateTimeFilter<"DataSource"> | Date | string
    columnMappings?: ColumnMappingListRelationFilter
    metrics?: MetricValueListRelationFilter
  }

  export type DataSourceOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    spreadsheetId?: SortOrder
    sheetName?: SortOrder
    lastSyncedAt?: SortOrderInput | SortOrder
    syncFrequency?: SortOrder
    connectionStatus?: SortOrder
    appScriptId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    columnMappings?: ColumnMappingOrderByRelationAggregateInput
    metrics?: MetricValueOrderByRelationAggregateInput
  }

  export type DataSourceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DataSourceWhereInput | DataSourceWhereInput[]
    OR?: DataSourceWhereInput[]
    NOT?: DataSourceWhereInput | DataSourceWhereInput[]
    name?: StringFilter<"DataSource"> | string
    spreadsheetId?: StringFilter<"DataSource"> | string
    sheetName?: StringFilter<"DataSource"> | string
    lastSyncedAt?: DateTimeNullableFilter<"DataSource"> | Date | string | null
    syncFrequency?: StringFilter<"DataSource"> | string
    connectionStatus?: StringFilter<"DataSource"> | string
    appScriptId?: StringNullableFilter<"DataSource"> | string | null
    createdAt?: DateTimeFilter<"DataSource"> | Date | string
    updatedAt?: DateTimeFilter<"DataSource"> | Date | string
    columnMappings?: ColumnMappingListRelationFilter
    metrics?: MetricValueListRelationFilter
  }, "id">

  export type DataSourceOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    spreadsheetId?: SortOrder
    sheetName?: SortOrder
    lastSyncedAt?: SortOrderInput | SortOrder
    syncFrequency?: SortOrder
    connectionStatus?: SortOrder
    appScriptId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DataSourceCountOrderByAggregateInput
    _max?: DataSourceMaxOrderByAggregateInput
    _min?: DataSourceMinOrderByAggregateInput
  }

  export type DataSourceScalarWhereWithAggregatesInput = {
    AND?: DataSourceScalarWhereWithAggregatesInput | DataSourceScalarWhereWithAggregatesInput[]
    OR?: DataSourceScalarWhereWithAggregatesInput[]
    NOT?: DataSourceScalarWhereWithAggregatesInput | DataSourceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DataSource"> | string
    name?: StringWithAggregatesFilter<"DataSource"> | string
    spreadsheetId?: StringWithAggregatesFilter<"DataSource"> | string
    sheetName?: StringWithAggregatesFilter<"DataSource"> | string
    lastSyncedAt?: DateTimeNullableWithAggregatesFilter<"DataSource"> | Date | string | null
    syncFrequency?: StringWithAggregatesFilter<"DataSource"> | string
    connectionStatus?: StringWithAggregatesFilter<"DataSource"> | string
    appScriptId?: StringNullableWithAggregatesFilter<"DataSource"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DataSource"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DataSource"> | Date | string
  }

  export type ColumnMappingWhereInput = {
    AND?: ColumnMappingWhereInput | ColumnMappingWhereInput[]
    OR?: ColumnMappingWhereInput[]
    NOT?: ColumnMappingWhereInput | ColumnMappingWhereInput[]
    id?: StringFilter<"ColumnMapping"> | string
    columnName?: StringFilter<"ColumnMapping"> | string
    transformationRule?: StringNullableFilter<"ColumnMapping"> | string | null
    createdAt?: DateTimeFilter<"ColumnMapping"> | Date | string
    updatedAt?: DateTimeFilter<"ColumnMapping"> | Date | string
    dataSourceId?: StringFilter<"ColumnMapping"> | string
    metricDefinitionId?: StringFilter<"ColumnMapping"> | string
    dataSource?: XOR<DataSourceScalarRelationFilter, DataSourceWhereInput>
    metricDefinition?: XOR<MetricDefinitionScalarRelationFilter, MetricDefinitionWhereInput>
  }

  export type ColumnMappingOrderByWithRelationInput = {
    id?: SortOrder
    columnName?: SortOrder
    transformationRule?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataSourceId?: SortOrder
    metricDefinitionId?: SortOrder
    dataSource?: DataSourceOrderByWithRelationInput
    metricDefinition?: MetricDefinitionOrderByWithRelationInput
  }

  export type ColumnMappingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ColumnMappingWhereInput | ColumnMappingWhereInput[]
    OR?: ColumnMappingWhereInput[]
    NOT?: ColumnMappingWhereInput | ColumnMappingWhereInput[]
    columnName?: StringFilter<"ColumnMapping"> | string
    transformationRule?: StringNullableFilter<"ColumnMapping"> | string | null
    createdAt?: DateTimeFilter<"ColumnMapping"> | Date | string
    updatedAt?: DateTimeFilter<"ColumnMapping"> | Date | string
    dataSourceId?: StringFilter<"ColumnMapping"> | string
    metricDefinitionId?: StringFilter<"ColumnMapping"> | string
    dataSource?: XOR<DataSourceScalarRelationFilter, DataSourceWhereInput>
    metricDefinition?: XOR<MetricDefinitionScalarRelationFilter, MetricDefinitionWhereInput>
  }, "id">

  export type ColumnMappingOrderByWithAggregationInput = {
    id?: SortOrder
    columnName?: SortOrder
    transformationRule?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataSourceId?: SortOrder
    metricDefinitionId?: SortOrder
    _count?: ColumnMappingCountOrderByAggregateInput
    _max?: ColumnMappingMaxOrderByAggregateInput
    _min?: ColumnMappingMinOrderByAggregateInput
  }

  export type ColumnMappingScalarWhereWithAggregatesInput = {
    AND?: ColumnMappingScalarWhereWithAggregatesInput | ColumnMappingScalarWhereWithAggregatesInput[]
    OR?: ColumnMappingScalarWhereWithAggregatesInput[]
    NOT?: ColumnMappingScalarWhereWithAggregatesInput | ColumnMappingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ColumnMapping"> | string
    columnName?: StringWithAggregatesFilter<"ColumnMapping"> | string
    transformationRule?: StringNullableWithAggregatesFilter<"ColumnMapping"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ColumnMapping"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ColumnMapping"> | Date | string
    dataSourceId?: StringWithAggregatesFilter<"ColumnMapping"> | string
    metricDefinitionId?: StringWithAggregatesFilter<"ColumnMapping"> | string
  }

  export type MetricValueWhereInput = {
    AND?: MetricValueWhereInput | MetricValueWhereInput[]
    OR?: MetricValueWhereInput[]
    NOT?: MetricValueWhereInput | MetricValueWhereInput[]
    id?: StringFilter<"MetricValue"> | string
    date?: DateTimeFilter<"MetricValue"> | Date | string
    value?: StringFilter<"MetricValue"> | string
    sourceType?: StringFilter<"MetricValue"> | string
    sourceSheet?: StringNullableFilter<"MetricValue"> | string | null
    externalId?: StringNullableFilter<"MetricValue"> | string | null
    createdAt?: DateTimeFilter<"MetricValue"> | Date | string
    updatedAt?: DateTimeFilter<"MetricValue"> | Date | string
    metricDefinitionId?: StringFilter<"MetricValue"> | string
    clinicId?: StringNullableFilter<"MetricValue"> | string | null
    providerId?: StringNullableFilter<"MetricValue"> | string | null
    dataSourceId?: StringNullableFilter<"MetricValue"> | string | null
    metricDefinition?: XOR<MetricDefinitionScalarRelationFilter, MetricDefinitionWhereInput>
    clinic?: XOR<ClinicNullableScalarRelationFilter, ClinicWhereInput> | null
    provider?: XOR<ProviderNullableScalarRelationFilter, ProviderWhereInput> | null
    dataSource?: XOR<DataSourceNullableScalarRelationFilter, DataSourceWhereInput> | null
  }

  export type MetricValueOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    value?: SortOrder
    sourceType?: SortOrder
    sourceSheet?: SortOrderInput | SortOrder
    externalId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrderInput | SortOrder
    providerId?: SortOrderInput | SortOrder
    dataSourceId?: SortOrderInput | SortOrder
    metricDefinition?: MetricDefinitionOrderByWithRelationInput
    clinic?: ClinicOrderByWithRelationInput
    provider?: ProviderOrderByWithRelationInput
    dataSource?: DataSourceOrderByWithRelationInput
  }

  export type MetricValueWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MetricValueWhereInput | MetricValueWhereInput[]
    OR?: MetricValueWhereInput[]
    NOT?: MetricValueWhereInput | MetricValueWhereInput[]
    date?: DateTimeFilter<"MetricValue"> | Date | string
    value?: StringFilter<"MetricValue"> | string
    sourceType?: StringFilter<"MetricValue"> | string
    sourceSheet?: StringNullableFilter<"MetricValue"> | string | null
    externalId?: StringNullableFilter<"MetricValue"> | string | null
    createdAt?: DateTimeFilter<"MetricValue"> | Date | string
    updatedAt?: DateTimeFilter<"MetricValue"> | Date | string
    metricDefinitionId?: StringFilter<"MetricValue"> | string
    clinicId?: StringNullableFilter<"MetricValue"> | string | null
    providerId?: StringNullableFilter<"MetricValue"> | string | null
    dataSourceId?: StringNullableFilter<"MetricValue"> | string | null
    metricDefinition?: XOR<MetricDefinitionScalarRelationFilter, MetricDefinitionWhereInput>
    clinic?: XOR<ClinicNullableScalarRelationFilter, ClinicWhereInput> | null
    provider?: XOR<ProviderNullableScalarRelationFilter, ProviderWhereInput> | null
    dataSource?: XOR<DataSourceNullableScalarRelationFilter, DataSourceWhereInput> | null
  }, "id">

  export type MetricValueOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    value?: SortOrder
    sourceType?: SortOrder
    sourceSheet?: SortOrderInput | SortOrder
    externalId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrderInput | SortOrder
    providerId?: SortOrderInput | SortOrder
    dataSourceId?: SortOrderInput | SortOrder
    _count?: MetricValueCountOrderByAggregateInput
    _max?: MetricValueMaxOrderByAggregateInput
    _min?: MetricValueMinOrderByAggregateInput
  }

  export type MetricValueScalarWhereWithAggregatesInput = {
    AND?: MetricValueScalarWhereWithAggregatesInput | MetricValueScalarWhereWithAggregatesInput[]
    OR?: MetricValueScalarWhereWithAggregatesInput[]
    NOT?: MetricValueScalarWhereWithAggregatesInput | MetricValueScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MetricValue"> | string
    date?: DateTimeWithAggregatesFilter<"MetricValue"> | Date | string
    value?: StringWithAggregatesFilter<"MetricValue"> | string
    sourceType?: StringWithAggregatesFilter<"MetricValue"> | string
    sourceSheet?: StringNullableWithAggregatesFilter<"MetricValue"> | string | null
    externalId?: StringNullableWithAggregatesFilter<"MetricValue"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MetricValue"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MetricValue"> | Date | string
    metricDefinitionId?: StringWithAggregatesFilter<"MetricValue"> | string
    clinicId?: StringNullableWithAggregatesFilter<"MetricValue"> | string | null
    providerId?: StringNullableWithAggregatesFilter<"MetricValue"> | string | null
    dataSourceId?: StringNullableWithAggregatesFilter<"MetricValue"> | string | null
  }

  export type GoalWhereInput = {
    AND?: GoalWhereInput | GoalWhereInput[]
    OR?: GoalWhereInput[]
    NOT?: GoalWhereInput | GoalWhereInput[]
    id?: StringFilter<"Goal"> | string
    timePeriod?: StringFilter<"Goal"> | string
    startDate?: DateTimeFilter<"Goal"> | Date | string
    endDate?: DateTimeFilter<"Goal"> | Date | string
    targetValue?: StringFilter<"Goal"> | string
    createdAt?: DateTimeFilter<"Goal"> | Date | string
    updatedAt?: DateTimeFilter<"Goal"> | Date | string
    metricDefinitionId?: StringFilter<"Goal"> | string
    clinicId?: StringNullableFilter<"Goal"> | string | null
    providerId?: StringNullableFilter<"Goal"> | string | null
    metricDefinition?: XOR<MetricDefinitionScalarRelationFilter, MetricDefinitionWhereInput>
    clinic?: XOR<ClinicNullableScalarRelationFilter, ClinicWhereInput> | null
    provider?: XOR<ProviderNullableScalarRelationFilter, ProviderWhereInput> | null
  }

  export type GoalOrderByWithRelationInput = {
    id?: SortOrder
    timePeriod?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    targetValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrderInput | SortOrder
    providerId?: SortOrderInput | SortOrder
    metricDefinition?: MetricDefinitionOrderByWithRelationInput
    clinic?: ClinicOrderByWithRelationInput
    provider?: ProviderOrderByWithRelationInput
  }

  export type GoalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GoalWhereInput | GoalWhereInput[]
    OR?: GoalWhereInput[]
    NOT?: GoalWhereInput | GoalWhereInput[]
    timePeriod?: StringFilter<"Goal"> | string
    startDate?: DateTimeFilter<"Goal"> | Date | string
    endDate?: DateTimeFilter<"Goal"> | Date | string
    targetValue?: StringFilter<"Goal"> | string
    createdAt?: DateTimeFilter<"Goal"> | Date | string
    updatedAt?: DateTimeFilter<"Goal"> | Date | string
    metricDefinitionId?: StringFilter<"Goal"> | string
    clinicId?: StringNullableFilter<"Goal"> | string | null
    providerId?: StringNullableFilter<"Goal"> | string | null
    metricDefinition?: XOR<MetricDefinitionScalarRelationFilter, MetricDefinitionWhereInput>
    clinic?: XOR<ClinicNullableScalarRelationFilter, ClinicWhereInput> | null
    provider?: XOR<ProviderNullableScalarRelationFilter, ProviderWhereInput> | null
  }, "id">

  export type GoalOrderByWithAggregationInput = {
    id?: SortOrder
    timePeriod?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    targetValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrderInput | SortOrder
    providerId?: SortOrderInput | SortOrder
    _count?: GoalCountOrderByAggregateInput
    _max?: GoalMaxOrderByAggregateInput
    _min?: GoalMinOrderByAggregateInput
  }

  export type GoalScalarWhereWithAggregatesInput = {
    AND?: GoalScalarWhereWithAggregatesInput | GoalScalarWhereWithAggregatesInput[]
    OR?: GoalScalarWhereWithAggregatesInput[]
    NOT?: GoalScalarWhereWithAggregatesInput | GoalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Goal"> | string
    timePeriod?: StringWithAggregatesFilter<"Goal"> | string
    startDate?: DateTimeWithAggregatesFilter<"Goal"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"Goal"> | Date | string
    targetValue?: StringWithAggregatesFilter<"Goal"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Goal"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Goal"> | Date | string
    metricDefinitionId?: StringWithAggregatesFilter<"Goal"> | string
    clinicId?: StringNullableWithAggregatesFilter<"Goal"> | string | null
    providerId?: StringNullableWithAggregatesFilter<"Goal"> | string | null
  }

  export type DashboardWhereInput = {
    AND?: DashboardWhereInput | DashboardWhereInput[]
    OR?: DashboardWhereInput[]
    NOT?: DashboardWhereInput | DashboardWhereInput[]
    id?: StringFilter<"Dashboard"> | string
    name?: StringFilter<"Dashboard"> | string
    isDefault?: BoolFilter<"Dashboard"> | boolean
    layoutConfig?: JsonNullableFilter<"Dashboard">
    createdAt?: DateTimeFilter<"Dashboard"> | Date | string
    updatedAt?: DateTimeFilter<"Dashboard"> | Date | string
    userId?: StringFilter<"Dashboard"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    widgets?: WidgetListRelationFilter
  }

  export type DashboardOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    isDefault?: SortOrder
    layoutConfig?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    widgets?: WidgetOrderByRelationAggregateInput
  }

  export type DashboardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DashboardWhereInput | DashboardWhereInput[]
    OR?: DashboardWhereInput[]
    NOT?: DashboardWhereInput | DashboardWhereInput[]
    name?: StringFilter<"Dashboard"> | string
    isDefault?: BoolFilter<"Dashboard"> | boolean
    layoutConfig?: JsonNullableFilter<"Dashboard">
    createdAt?: DateTimeFilter<"Dashboard"> | Date | string
    updatedAt?: DateTimeFilter<"Dashboard"> | Date | string
    userId?: StringFilter<"Dashboard"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    widgets?: WidgetListRelationFilter
  }, "id">

  export type DashboardOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    isDefault?: SortOrder
    layoutConfig?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: DashboardCountOrderByAggregateInput
    _max?: DashboardMaxOrderByAggregateInput
    _min?: DashboardMinOrderByAggregateInput
  }

  export type DashboardScalarWhereWithAggregatesInput = {
    AND?: DashboardScalarWhereWithAggregatesInput | DashboardScalarWhereWithAggregatesInput[]
    OR?: DashboardScalarWhereWithAggregatesInput[]
    NOT?: DashboardScalarWhereWithAggregatesInput | DashboardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Dashboard"> | string
    name?: StringWithAggregatesFilter<"Dashboard"> | string
    isDefault?: BoolWithAggregatesFilter<"Dashboard"> | boolean
    layoutConfig?: JsonNullableWithAggregatesFilter<"Dashboard">
    createdAt?: DateTimeWithAggregatesFilter<"Dashboard"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Dashboard"> | Date | string
    userId?: StringWithAggregatesFilter<"Dashboard"> | string
  }

  export type WidgetWhereInput = {
    AND?: WidgetWhereInput | WidgetWhereInput[]
    OR?: WidgetWhereInput[]
    NOT?: WidgetWhereInput | WidgetWhereInput[]
    id?: StringFilter<"Widget"> | string
    widgetType?: StringFilter<"Widget"> | string
    chartType?: StringNullableFilter<"Widget"> | string | null
    positionX?: IntFilter<"Widget"> | number
    positionY?: IntFilter<"Widget"> | number
    width?: IntFilter<"Widget"> | number
    height?: IntFilter<"Widget"> | number
    config?: JsonNullableFilter<"Widget">
    createdAt?: DateTimeFilter<"Widget"> | Date | string
    updatedAt?: DateTimeFilter<"Widget"> | Date | string
    dashboardId?: StringFilter<"Widget"> | string
    metricDefinitionId?: StringNullableFilter<"Widget"> | string | null
    dashboard?: XOR<DashboardScalarRelationFilter, DashboardWhereInput>
    metricDefinition?: XOR<MetricDefinitionNullableScalarRelationFilter, MetricDefinitionWhereInput> | null
  }

  export type WidgetOrderByWithRelationInput = {
    id?: SortOrder
    widgetType?: SortOrder
    chartType?: SortOrderInput | SortOrder
    positionX?: SortOrder
    positionY?: SortOrder
    width?: SortOrder
    height?: SortOrder
    config?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dashboardId?: SortOrder
    metricDefinitionId?: SortOrderInput | SortOrder
    dashboard?: DashboardOrderByWithRelationInput
    metricDefinition?: MetricDefinitionOrderByWithRelationInput
  }

  export type WidgetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WidgetWhereInput | WidgetWhereInput[]
    OR?: WidgetWhereInput[]
    NOT?: WidgetWhereInput | WidgetWhereInput[]
    widgetType?: StringFilter<"Widget"> | string
    chartType?: StringNullableFilter<"Widget"> | string | null
    positionX?: IntFilter<"Widget"> | number
    positionY?: IntFilter<"Widget"> | number
    width?: IntFilter<"Widget"> | number
    height?: IntFilter<"Widget"> | number
    config?: JsonNullableFilter<"Widget">
    createdAt?: DateTimeFilter<"Widget"> | Date | string
    updatedAt?: DateTimeFilter<"Widget"> | Date | string
    dashboardId?: StringFilter<"Widget"> | string
    metricDefinitionId?: StringNullableFilter<"Widget"> | string | null
    dashboard?: XOR<DashboardScalarRelationFilter, DashboardWhereInput>
    metricDefinition?: XOR<MetricDefinitionNullableScalarRelationFilter, MetricDefinitionWhereInput> | null
  }, "id">

  export type WidgetOrderByWithAggregationInput = {
    id?: SortOrder
    widgetType?: SortOrder
    chartType?: SortOrderInput | SortOrder
    positionX?: SortOrder
    positionY?: SortOrder
    width?: SortOrder
    height?: SortOrder
    config?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dashboardId?: SortOrder
    metricDefinitionId?: SortOrderInput | SortOrder
    _count?: WidgetCountOrderByAggregateInput
    _avg?: WidgetAvgOrderByAggregateInput
    _max?: WidgetMaxOrderByAggregateInput
    _min?: WidgetMinOrderByAggregateInput
    _sum?: WidgetSumOrderByAggregateInput
  }

  export type WidgetScalarWhereWithAggregatesInput = {
    AND?: WidgetScalarWhereWithAggregatesInput | WidgetScalarWhereWithAggregatesInput[]
    OR?: WidgetScalarWhereWithAggregatesInput[]
    NOT?: WidgetScalarWhereWithAggregatesInput | WidgetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Widget"> | string
    widgetType?: StringWithAggregatesFilter<"Widget"> | string
    chartType?: StringNullableWithAggregatesFilter<"Widget"> | string | null
    positionX?: IntWithAggregatesFilter<"Widget"> | number
    positionY?: IntWithAggregatesFilter<"Widget"> | number
    width?: IntWithAggregatesFilter<"Widget"> | number
    height?: IntWithAggregatesFilter<"Widget"> | number
    config?: JsonNullableWithAggregatesFilter<"Widget">
    createdAt?: DateTimeWithAggregatesFilter<"Widget"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Widget"> | Date | string
    dashboardId?: StringWithAggregatesFilter<"Widget"> | string
    metricDefinitionId?: StringNullableWithAggregatesFilter<"Widget"> | string | null
  }

  export type ClinicCreateInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutClinicInput
    providers?: ProviderCreateNestedManyWithoutClinicInput
    metrics?: MetricValueCreateNestedManyWithoutClinicInput
    goals?: GoalCreateNestedManyWithoutClinicInput
  }

  export type ClinicUncheckedCreateInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutClinicInput
    providers?: ProviderUncheckedCreateNestedManyWithoutClinicInput
    metrics?: MetricValueUncheckedCreateNestedManyWithoutClinicInput
    goals?: GoalUncheckedCreateNestedManyWithoutClinicInput
  }

  export type ClinicUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutClinicNestedInput
    providers?: ProviderUpdateManyWithoutClinicNestedInput
    metrics?: MetricValueUpdateManyWithoutClinicNestedInput
    goals?: GoalUpdateManyWithoutClinicNestedInput
  }

  export type ClinicUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutClinicNestedInput
    providers?: ProviderUncheckedUpdateManyWithoutClinicNestedInput
    metrics?: MetricValueUncheckedUpdateManyWithoutClinicNestedInput
    goals?: GoalUncheckedUpdateManyWithoutClinicNestedInput
  }

  export type ClinicCreateManyInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClinicUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClinicUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name: string
    role: string
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clinic: ClinicCreateNestedOneWithoutUsersInput
    dashboards?: DashboardCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name: string
    role: string
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId: string
    dashboards?: DashboardUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinic?: ClinicUpdateOneRequiredWithoutUsersNestedInput
    dashboards?: DashboardUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: StringFieldUpdateOperationsInput | string
    dashboards?: DashboardUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name: string
    role: string
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId: string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: StringFieldUpdateOperationsInput | string
  }

  export type ProviderCreateInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinic: ClinicCreateNestedOneWithoutProvidersInput
    metrics?: MetricValueCreateNestedManyWithoutProviderInput
    goals?: GoalCreateNestedManyWithoutProviderInput
  }

  export type ProviderUncheckedCreateInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId: string
    metrics?: MetricValueUncheckedCreateNestedManyWithoutProviderInput
    goals?: GoalUncheckedCreateNestedManyWithoutProviderInput
  }

  export type ProviderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinic?: ClinicUpdateOneRequiredWithoutProvidersNestedInput
    metrics?: MetricValueUpdateManyWithoutProviderNestedInput
    goals?: GoalUpdateManyWithoutProviderNestedInput
  }

  export type ProviderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: StringFieldUpdateOperationsInput | string
    metrics?: MetricValueUncheckedUpdateManyWithoutProviderNestedInput
    goals?: GoalUncheckedUpdateManyWithoutProviderNestedInput
  }

  export type ProviderCreateManyInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId: string
  }

  export type ProviderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProviderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: StringFieldUpdateOperationsInput | string
  }

  export type MetricDefinitionCreateInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueCreateNestedManyWithoutMetricDefinitionInput
    columnMappings?: ColumnMappingCreateNestedManyWithoutMetricDefinitionInput
    goals?: GoalCreateNestedManyWithoutMetricDefinitionInput
    widgets?: WidgetCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionUncheckedCreateInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueUncheckedCreateNestedManyWithoutMetricDefinitionInput
    columnMappings?: ColumnMappingUncheckedCreateNestedManyWithoutMetricDefinitionInput
    goals?: GoalUncheckedCreateNestedManyWithoutMetricDefinitionInput
    widgets?: WidgetUncheckedCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUpdateManyWithoutMetricDefinitionNestedInput
    columnMappings?: ColumnMappingUpdateManyWithoutMetricDefinitionNestedInput
    goals?: GoalUpdateManyWithoutMetricDefinitionNestedInput
    widgets?: WidgetUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type MetricDefinitionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    columnMappings?: ColumnMappingUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    goals?: GoalUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    widgets?: WidgetUncheckedUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type MetricDefinitionCreateManyInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MetricDefinitionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MetricDefinitionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataSourceCreateInput = {
    id?: string
    name: string
    spreadsheetId: string
    sheetName: string
    lastSyncedAt?: Date | string | null
    syncFrequency: string
    connectionStatus: string
    appScriptId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    columnMappings?: ColumnMappingCreateNestedManyWithoutDataSourceInput
    metrics?: MetricValueCreateNestedManyWithoutDataSourceInput
  }

  export type DataSourceUncheckedCreateInput = {
    id?: string
    name: string
    spreadsheetId: string
    sheetName: string
    lastSyncedAt?: Date | string | null
    syncFrequency: string
    connectionStatus: string
    appScriptId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    columnMappings?: ColumnMappingUncheckedCreateNestedManyWithoutDataSourceInput
    metrics?: MetricValueUncheckedCreateNestedManyWithoutDataSourceInput
  }

  export type DataSourceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    spreadsheetId?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    lastSyncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncFrequency?: StringFieldUpdateOperationsInput | string
    connectionStatus?: StringFieldUpdateOperationsInput | string
    appScriptId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columnMappings?: ColumnMappingUpdateManyWithoutDataSourceNestedInput
    metrics?: MetricValueUpdateManyWithoutDataSourceNestedInput
  }

  export type DataSourceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    spreadsheetId?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    lastSyncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncFrequency?: StringFieldUpdateOperationsInput | string
    connectionStatus?: StringFieldUpdateOperationsInput | string
    appScriptId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columnMappings?: ColumnMappingUncheckedUpdateManyWithoutDataSourceNestedInput
    metrics?: MetricValueUncheckedUpdateManyWithoutDataSourceNestedInput
  }

  export type DataSourceCreateManyInput = {
    id?: string
    name: string
    spreadsheetId: string
    sheetName: string
    lastSyncedAt?: Date | string | null
    syncFrequency: string
    connectionStatus: string
    appScriptId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DataSourceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    spreadsheetId?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    lastSyncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncFrequency?: StringFieldUpdateOperationsInput | string
    connectionStatus?: StringFieldUpdateOperationsInput | string
    appScriptId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataSourceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    spreadsheetId?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    lastSyncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncFrequency?: StringFieldUpdateOperationsInput | string
    connectionStatus?: StringFieldUpdateOperationsInput | string
    appScriptId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColumnMappingCreateInput = {
    id?: string
    columnName: string
    transformationRule?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataSource: DataSourceCreateNestedOneWithoutColumnMappingsInput
    metricDefinition: MetricDefinitionCreateNestedOneWithoutColumnMappingsInput
  }

  export type ColumnMappingUncheckedCreateInput = {
    id?: string
    columnName: string
    transformationRule?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataSourceId: string
    metricDefinitionId: string
  }

  export type ColumnMappingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataSource?: DataSourceUpdateOneRequiredWithoutColumnMappingsNestedInput
    metricDefinition?: MetricDefinitionUpdateOneRequiredWithoutColumnMappingsNestedInput
  }

  export type ColumnMappingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataSourceId?: StringFieldUpdateOperationsInput | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
  }

  export type ColumnMappingCreateManyInput = {
    id?: string
    columnName: string
    transformationRule?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataSourceId: string
    metricDefinitionId: string
  }

  export type ColumnMappingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColumnMappingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataSourceId?: StringFieldUpdateOperationsInput | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
  }

  export type MetricValueCreateInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinition: MetricDefinitionCreateNestedOneWithoutMetricsInput
    clinic?: ClinicCreateNestedOneWithoutMetricsInput
    provider?: ProviderCreateNestedOneWithoutMetricsInput
    dataSource?: DataSourceCreateNestedOneWithoutMetricsInput
  }

  export type MetricValueUncheckedCreateInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
    providerId?: string | null
    dataSourceId?: string | null
  }

  export type MetricValueUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinition?: MetricDefinitionUpdateOneRequiredWithoutMetricsNestedInput
    clinic?: ClinicUpdateOneWithoutMetricsNestedInput
    provider?: ProviderUpdateOneWithoutMetricsNestedInput
    dataSource?: DataSourceUpdateOneWithoutMetricsNestedInput
  }

  export type MetricValueUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MetricValueCreateManyInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
    providerId?: string | null
    dataSourceId?: string | null
  }

  export type MetricValueUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MetricValueUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GoalCreateInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinition: MetricDefinitionCreateNestedOneWithoutGoalsInput
    clinic?: ClinicCreateNestedOneWithoutGoalsInput
    provider?: ProviderCreateNestedOneWithoutGoalsInput
  }

  export type GoalUncheckedCreateInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
    providerId?: string | null
  }

  export type GoalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinition?: MetricDefinitionUpdateOneRequiredWithoutGoalsNestedInput
    clinic?: ClinicUpdateOneWithoutGoalsNestedInput
    provider?: ProviderUpdateOneWithoutGoalsNestedInput
  }

  export type GoalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GoalCreateManyInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
    providerId?: string | null
  }

  export type GoalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GoalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DashboardCreateInput = {
    id?: string
    name: string
    isDefault?: boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDashboardsInput
    widgets?: WidgetCreateNestedManyWithoutDashboardInput
  }

  export type DashboardUncheckedCreateInput = {
    id?: string
    name: string
    isDefault?: boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    widgets?: WidgetUncheckedCreateNestedManyWithoutDashboardInput
  }

  export type DashboardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDashboardsNestedInput
    widgets?: WidgetUpdateManyWithoutDashboardNestedInput
  }

  export type DashboardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    widgets?: WidgetUncheckedUpdateManyWithoutDashboardNestedInput
  }

  export type DashboardCreateManyInput = {
    id?: string
    name: string
    isDefault?: boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type DashboardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DashboardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type WidgetCreateInput = {
    id?: string
    widgetType: string
    chartType?: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    dashboard: DashboardCreateNestedOneWithoutWidgetsInput
    metricDefinition?: MetricDefinitionCreateNestedOneWithoutWidgetsInput
  }

  export type WidgetUncheckedCreateInput = {
    id?: string
    widgetType: string
    chartType?: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    dashboardId: string
    metricDefinitionId?: string | null
  }

  export type WidgetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dashboard?: DashboardUpdateOneRequiredWithoutWidgetsNestedInput
    metricDefinition?: MetricDefinitionUpdateOneWithoutWidgetsNestedInput
  }

  export type WidgetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dashboardId?: StringFieldUpdateOperationsInput | string
    metricDefinitionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WidgetCreateManyInput = {
    id?: string
    widgetType: string
    chartType?: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    dashboardId: string
    metricDefinitionId?: string | null
  }

  export type WidgetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WidgetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dashboardId?: StringFieldUpdateOperationsInput | string
    metricDefinitionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type ProviderListRelationFilter = {
    every?: ProviderWhereInput
    some?: ProviderWhereInput
    none?: ProviderWhereInput
  }

  export type MetricValueListRelationFilter = {
    every?: MetricValueWhereInput
    some?: MetricValueWhereInput
    none?: MetricValueWhereInput
  }

  export type GoalListRelationFilter = {
    every?: GoalWhereInput
    some?: GoalWhereInput
    none?: GoalWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProviderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MetricValueOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GoalOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClinicCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClinicMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClinicMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ClinicScalarRelationFilter = {
    is?: ClinicWhereInput
    isNot?: ClinicWhereInput
  }

  export type DashboardListRelationFilter = {
    every?: DashboardWhereInput
    some?: DashboardWhereInput
    none?: DashboardWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DashboardOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    lastLogin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    lastLogin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    lastLogin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ProviderCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    providerType?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
  }

  export type ProviderMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    providerType?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
  }

  export type ProviderMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    providerType?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinicId?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ColumnMappingListRelationFilter = {
    every?: ColumnMappingWhereInput
    some?: ColumnMappingWhereInput
    none?: ColumnMappingWhereInput
  }

  export type WidgetListRelationFilter = {
    every?: WidgetWhereInput
    some?: WidgetWhereInput
    none?: WidgetWhereInput
  }

  export type ColumnMappingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WidgetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MetricDefinitionCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    dataType?: SortOrder
    calculationFormula?: SortOrder
    category?: SortOrder
    isComposite?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MetricDefinitionMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    dataType?: SortOrder
    calculationFormula?: SortOrder
    category?: SortOrder
    isComposite?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MetricDefinitionMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    dataType?: SortOrder
    calculationFormula?: SortOrder
    category?: SortOrder
    isComposite?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DataSourceCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    spreadsheetId?: SortOrder
    sheetName?: SortOrder
    lastSyncedAt?: SortOrder
    syncFrequency?: SortOrder
    connectionStatus?: SortOrder
    appScriptId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataSourceMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    spreadsheetId?: SortOrder
    sheetName?: SortOrder
    lastSyncedAt?: SortOrder
    syncFrequency?: SortOrder
    connectionStatus?: SortOrder
    appScriptId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataSourceMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    spreadsheetId?: SortOrder
    sheetName?: SortOrder
    lastSyncedAt?: SortOrder
    syncFrequency?: SortOrder
    connectionStatus?: SortOrder
    appScriptId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataSourceScalarRelationFilter = {
    is?: DataSourceWhereInput
    isNot?: DataSourceWhereInput
  }

  export type MetricDefinitionScalarRelationFilter = {
    is?: MetricDefinitionWhereInput
    isNot?: MetricDefinitionWhereInput
  }

  export type ColumnMappingCountOrderByAggregateInput = {
    id?: SortOrder
    columnName?: SortOrder
    transformationRule?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataSourceId?: SortOrder
    metricDefinitionId?: SortOrder
  }

  export type ColumnMappingMaxOrderByAggregateInput = {
    id?: SortOrder
    columnName?: SortOrder
    transformationRule?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataSourceId?: SortOrder
    metricDefinitionId?: SortOrder
  }

  export type ColumnMappingMinOrderByAggregateInput = {
    id?: SortOrder
    columnName?: SortOrder
    transformationRule?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataSourceId?: SortOrder
    metricDefinitionId?: SortOrder
  }

  export type ClinicNullableScalarRelationFilter = {
    is?: ClinicWhereInput | null
    isNot?: ClinicWhereInput | null
  }

  export type ProviderNullableScalarRelationFilter = {
    is?: ProviderWhereInput | null
    isNot?: ProviderWhereInput | null
  }

  export type DataSourceNullableScalarRelationFilter = {
    is?: DataSourceWhereInput | null
    isNot?: DataSourceWhereInput | null
  }

  export type MetricValueCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    value?: SortOrder
    sourceType?: SortOrder
    sourceSheet?: SortOrder
    externalId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrder
    providerId?: SortOrder
    dataSourceId?: SortOrder
  }

  export type MetricValueMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    value?: SortOrder
    sourceType?: SortOrder
    sourceSheet?: SortOrder
    externalId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrder
    providerId?: SortOrder
    dataSourceId?: SortOrder
  }

  export type MetricValueMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    value?: SortOrder
    sourceType?: SortOrder
    sourceSheet?: SortOrder
    externalId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrder
    providerId?: SortOrder
    dataSourceId?: SortOrder
  }

  export type GoalCountOrderByAggregateInput = {
    id?: SortOrder
    timePeriod?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    targetValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrder
    providerId?: SortOrder
  }

  export type GoalMaxOrderByAggregateInput = {
    id?: SortOrder
    timePeriod?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    targetValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrder
    providerId?: SortOrder
  }

  export type GoalMinOrderByAggregateInput = {
    id?: SortOrder
    timePeriod?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    targetValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    metricDefinitionId?: SortOrder
    clinicId?: SortOrder
    providerId?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type DashboardCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    isDefault?: SortOrder
    layoutConfig?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type DashboardMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type DashboardMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DashboardScalarRelationFilter = {
    is?: DashboardWhereInput
    isNot?: DashboardWhereInput
  }

  export type MetricDefinitionNullableScalarRelationFilter = {
    is?: MetricDefinitionWhereInput | null
    isNot?: MetricDefinitionWhereInput | null
  }

  export type WidgetCountOrderByAggregateInput = {
    id?: SortOrder
    widgetType?: SortOrder
    chartType?: SortOrder
    positionX?: SortOrder
    positionY?: SortOrder
    width?: SortOrder
    height?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dashboardId?: SortOrder
    metricDefinitionId?: SortOrder
  }

  export type WidgetAvgOrderByAggregateInput = {
    positionX?: SortOrder
    positionY?: SortOrder
    width?: SortOrder
    height?: SortOrder
  }

  export type WidgetMaxOrderByAggregateInput = {
    id?: SortOrder
    widgetType?: SortOrder
    chartType?: SortOrder
    positionX?: SortOrder
    positionY?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dashboardId?: SortOrder
    metricDefinitionId?: SortOrder
  }

  export type WidgetMinOrderByAggregateInput = {
    id?: SortOrder
    widgetType?: SortOrder
    chartType?: SortOrder
    positionX?: SortOrder
    positionY?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dashboardId?: SortOrder
    metricDefinitionId?: SortOrder
  }

  export type WidgetSumOrderByAggregateInput = {
    positionX?: SortOrder
    positionY?: SortOrder
    width?: SortOrder
    height?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type UserCreateNestedManyWithoutClinicInput = {
    create?: XOR<UserCreateWithoutClinicInput, UserUncheckedCreateWithoutClinicInput> | UserCreateWithoutClinicInput[] | UserUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: UserCreateOrConnectWithoutClinicInput | UserCreateOrConnectWithoutClinicInput[]
    createMany?: UserCreateManyClinicInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type ProviderCreateNestedManyWithoutClinicInput = {
    create?: XOR<ProviderCreateWithoutClinicInput, ProviderUncheckedCreateWithoutClinicInput> | ProviderCreateWithoutClinicInput[] | ProviderUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: ProviderCreateOrConnectWithoutClinicInput | ProviderCreateOrConnectWithoutClinicInput[]
    createMany?: ProviderCreateManyClinicInputEnvelope
    connect?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
  }

  export type MetricValueCreateNestedManyWithoutClinicInput = {
    create?: XOR<MetricValueCreateWithoutClinicInput, MetricValueUncheckedCreateWithoutClinicInput> | MetricValueCreateWithoutClinicInput[] | MetricValueUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutClinicInput | MetricValueCreateOrConnectWithoutClinicInput[]
    createMany?: MetricValueCreateManyClinicInputEnvelope
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
  }

  export type GoalCreateNestedManyWithoutClinicInput = {
    create?: XOR<GoalCreateWithoutClinicInput, GoalUncheckedCreateWithoutClinicInput> | GoalCreateWithoutClinicInput[] | GoalUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutClinicInput | GoalCreateOrConnectWithoutClinicInput[]
    createMany?: GoalCreateManyClinicInputEnvelope
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutClinicInput = {
    create?: XOR<UserCreateWithoutClinicInput, UserUncheckedCreateWithoutClinicInput> | UserCreateWithoutClinicInput[] | UserUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: UserCreateOrConnectWithoutClinicInput | UserCreateOrConnectWithoutClinicInput[]
    createMany?: UserCreateManyClinicInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type ProviderUncheckedCreateNestedManyWithoutClinicInput = {
    create?: XOR<ProviderCreateWithoutClinicInput, ProviderUncheckedCreateWithoutClinicInput> | ProviderCreateWithoutClinicInput[] | ProviderUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: ProviderCreateOrConnectWithoutClinicInput | ProviderCreateOrConnectWithoutClinicInput[]
    createMany?: ProviderCreateManyClinicInputEnvelope
    connect?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
  }

  export type MetricValueUncheckedCreateNestedManyWithoutClinicInput = {
    create?: XOR<MetricValueCreateWithoutClinicInput, MetricValueUncheckedCreateWithoutClinicInput> | MetricValueCreateWithoutClinicInput[] | MetricValueUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutClinicInput | MetricValueCreateOrConnectWithoutClinicInput[]
    createMany?: MetricValueCreateManyClinicInputEnvelope
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
  }

  export type GoalUncheckedCreateNestedManyWithoutClinicInput = {
    create?: XOR<GoalCreateWithoutClinicInput, GoalUncheckedCreateWithoutClinicInput> | GoalCreateWithoutClinicInput[] | GoalUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutClinicInput | GoalCreateOrConnectWithoutClinicInput[]
    createMany?: GoalCreateManyClinicInputEnvelope
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateManyWithoutClinicNestedInput = {
    create?: XOR<UserCreateWithoutClinicInput, UserUncheckedCreateWithoutClinicInput> | UserCreateWithoutClinicInput[] | UserUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: UserCreateOrConnectWithoutClinicInput | UserCreateOrConnectWithoutClinicInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutClinicInput | UserUpsertWithWhereUniqueWithoutClinicInput[]
    createMany?: UserCreateManyClinicInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutClinicInput | UserUpdateWithWhereUniqueWithoutClinicInput[]
    updateMany?: UserUpdateManyWithWhereWithoutClinicInput | UserUpdateManyWithWhereWithoutClinicInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ProviderUpdateManyWithoutClinicNestedInput = {
    create?: XOR<ProviderCreateWithoutClinicInput, ProviderUncheckedCreateWithoutClinicInput> | ProviderCreateWithoutClinicInput[] | ProviderUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: ProviderCreateOrConnectWithoutClinicInput | ProviderCreateOrConnectWithoutClinicInput[]
    upsert?: ProviderUpsertWithWhereUniqueWithoutClinicInput | ProviderUpsertWithWhereUniqueWithoutClinicInput[]
    createMany?: ProviderCreateManyClinicInputEnvelope
    set?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
    disconnect?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
    delete?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
    connect?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
    update?: ProviderUpdateWithWhereUniqueWithoutClinicInput | ProviderUpdateWithWhereUniqueWithoutClinicInput[]
    updateMany?: ProviderUpdateManyWithWhereWithoutClinicInput | ProviderUpdateManyWithWhereWithoutClinicInput[]
    deleteMany?: ProviderScalarWhereInput | ProviderScalarWhereInput[]
  }

  export type MetricValueUpdateManyWithoutClinicNestedInput = {
    create?: XOR<MetricValueCreateWithoutClinicInput, MetricValueUncheckedCreateWithoutClinicInput> | MetricValueCreateWithoutClinicInput[] | MetricValueUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutClinicInput | MetricValueCreateOrConnectWithoutClinicInput[]
    upsert?: MetricValueUpsertWithWhereUniqueWithoutClinicInput | MetricValueUpsertWithWhereUniqueWithoutClinicInput[]
    createMany?: MetricValueCreateManyClinicInputEnvelope
    set?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    disconnect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    delete?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    update?: MetricValueUpdateWithWhereUniqueWithoutClinicInput | MetricValueUpdateWithWhereUniqueWithoutClinicInput[]
    updateMany?: MetricValueUpdateManyWithWhereWithoutClinicInput | MetricValueUpdateManyWithWhereWithoutClinicInput[]
    deleteMany?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
  }

  export type GoalUpdateManyWithoutClinicNestedInput = {
    create?: XOR<GoalCreateWithoutClinicInput, GoalUncheckedCreateWithoutClinicInput> | GoalCreateWithoutClinicInput[] | GoalUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutClinicInput | GoalCreateOrConnectWithoutClinicInput[]
    upsert?: GoalUpsertWithWhereUniqueWithoutClinicInput | GoalUpsertWithWhereUniqueWithoutClinicInput[]
    createMany?: GoalCreateManyClinicInputEnvelope
    set?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    disconnect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    delete?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    update?: GoalUpdateWithWhereUniqueWithoutClinicInput | GoalUpdateWithWhereUniqueWithoutClinicInput[]
    updateMany?: GoalUpdateManyWithWhereWithoutClinicInput | GoalUpdateManyWithWhereWithoutClinicInput[]
    deleteMany?: GoalScalarWhereInput | GoalScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutClinicNestedInput = {
    create?: XOR<UserCreateWithoutClinicInput, UserUncheckedCreateWithoutClinicInput> | UserCreateWithoutClinicInput[] | UserUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: UserCreateOrConnectWithoutClinicInput | UserCreateOrConnectWithoutClinicInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutClinicInput | UserUpsertWithWhereUniqueWithoutClinicInput[]
    createMany?: UserCreateManyClinicInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutClinicInput | UserUpdateWithWhereUniqueWithoutClinicInput[]
    updateMany?: UserUpdateManyWithWhereWithoutClinicInput | UserUpdateManyWithWhereWithoutClinicInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ProviderUncheckedUpdateManyWithoutClinicNestedInput = {
    create?: XOR<ProviderCreateWithoutClinicInput, ProviderUncheckedCreateWithoutClinicInput> | ProviderCreateWithoutClinicInput[] | ProviderUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: ProviderCreateOrConnectWithoutClinicInput | ProviderCreateOrConnectWithoutClinicInput[]
    upsert?: ProviderUpsertWithWhereUniqueWithoutClinicInput | ProviderUpsertWithWhereUniqueWithoutClinicInput[]
    createMany?: ProviderCreateManyClinicInputEnvelope
    set?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
    disconnect?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
    delete?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
    connect?: ProviderWhereUniqueInput | ProviderWhereUniqueInput[]
    update?: ProviderUpdateWithWhereUniqueWithoutClinicInput | ProviderUpdateWithWhereUniqueWithoutClinicInput[]
    updateMany?: ProviderUpdateManyWithWhereWithoutClinicInput | ProviderUpdateManyWithWhereWithoutClinicInput[]
    deleteMany?: ProviderScalarWhereInput | ProviderScalarWhereInput[]
  }

  export type MetricValueUncheckedUpdateManyWithoutClinicNestedInput = {
    create?: XOR<MetricValueCreateWithoutClinicInput, MetricValueUncheckedCreateWithoutClinicInput> | MetricValueCreateWithoutClinicInput[] | MetricValueUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutClinicInput | MetricValueCreateOrConnectWithoutClinicInput[]
    upsert?: MetricValueUpsertWithWhereUniqueWithoutClinicInput | MetricValueUpsertWithWhereUniqueWithoutClinicInput[]
    createMany?: MetricValueCreateManyClinicInputEnvelope
    set?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    disconnect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    delete?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    update?: MetricValueUpdateWithWhereUniqueWithoutClinicInput | MetricValueUpdateWithWhereUniqueWithoutClinicInput[]
    updateMany?: MetricValueUpdateManyWithWhereWithoutClinicInput | MetricValueUpdateManyWithWhereWithoutClinicInput[]
    deleteMany?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
  }

  export type GoalUncheckedUpdateManyWithoutClinicNestedInput = {
    create?: XOR<GoalCreateWithoutClinicInput, GoalUncheckedCreateWithoutClinicInput> | GoalCreateWithoutClinicInput[] | GoalUncheckedCreateWithoutClinicInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutClinicInput | GoalCreateOrConnectWithoutClinicInput[]
    upsert?: GoalUpsertWithWhereUniqueWithoutClinicInput | GoalUpsertWithWhereUniqueWithoutClinicInput[]
    createMany?: GoalCreateManyClinicInputEnvelope
    set?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    disconnect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    delete?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    update?: GoalUpdateWithWhereUniqueWithoutClinicInput | GoalUpdateWithWhereUniqueWithoutClinicInput[]
    updateMany?: GoalUpdateManyWithWhereWithoutClinicInput | GoalUpdateManyWithWhereWithoutClinicInput[]
    deleteMany?: GoalScalarWhereInput | GoalScalarWhereInput[]
  }

  export type ClinicCreateNestedOneWithoutUsersInput = {
    create?: XOR<ClinicCreateWithoutUsersInput, ClinicUncheckedCreateWithoutUsersInput>
    connectOrCreate?: ClinicCreateOrConnectWithoutUsersInput
    connect?: ClinicWhereUniqueInput
  }

  export type DashboardCreateNestedManyWithoutUserInput = {
    create?: XOR<DashboardCreateWithoutUserInput, DashboardUncheckedCreateWithoutUserInput> | DashboardCreateWithoutUserInput[] | DashboardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DashboardCreateOrConnectWithoutUserInput | DashboardCreateOrConnectWithoutUserInput[]
    createMany?: DashboardCreateManyUserInputEnvelope
    connect?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
  }

  export type DashboardUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<DashboardCreateWithoutUserInput, DashboardUncheckedCreateWithoutUserInput> | DashboardCreateWithoutUserInput[] | DashboardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DashboardCreateOrConnectWithoutUserInput | DashboardCreateOrConnectWithoutUserInput[]
    createMany?: DashboardCreateManyUserInputEnvelope
    connect?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ClinicUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<ClinicCreateWithoutUsersInput, ClinicUncheckedCreateWithoutUsersInput>
    connectOrCreate?: ClinicCreateOrConnectWithoutUsersInput
    upsert?: ClinicUpsertWithoutUsersInput
    connect?: ClinicWhereUniqueInput
    update?: XOR<XOR<ClinicUpdateToOneWithWhereWithoutUsersInput, ClinicUpdateWithoutUsersInput>, ClinicUncheckedUpdateWithoutUsersInput>
  }

  export type DashboardUpdateManyWithoutUserNestedInput = {
    create?: XOR<DashboardCreateWithoutUserInput, DashboardUncheckedCreateWithoutUserInput> | DashboardCreateWithoutUserInput[] | DashboardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DashboardCreateOrConnectWithoutUserInput | DashboardCreateOrConnectWithoutUserInput[]
    upsert?: DashboardUpsertWithWhereUniqueWithoutUserInput | DashboardUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DashboardCreateManyUserInputEnvelope
    set?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
    disconnect?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
    delete?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
    connect?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
    update?: DashboardUpdateWithWhereUniqueWithoutUserInput | DashboardUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DashboardUpdateManyWithWhereWithoutUserInput | DashboardUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DashboardScalarWhereInput | DashboardScalarWhereInput[]
  }

  export type DashboardUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<DashboardCreateWithoutUserInput, DashboardUncheckedCreateWithoutUserInput> | DashboardCreateWithoutUserInput[] | DashboardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DashboardCreateOrConnectWithoutUserInput | DashboardCreateOrConnectWithoutUserInput[]
    upsert?: DashboardUpsertWithWhereUniqueWithoutUserInput | DashboardUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DashboardCreateManyUserInputEnvelope
    set?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
    disconnect?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
    delete?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
    connect?: DashboardWhereUniqueInput | DashboardWhereUniqueInput[]
    update?: DashboardUpdateWithWhereUniqueWithoutUserInput | DashboardUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DashboardUpdateManyWithWhereWithoutUserInput | DashboardUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DashboardScalarWhereInput | DashboardScalarWhereInput[]
  }

  export type ClinicCreateNestedOneWithoutProvidersInput = {
    create?: XOR<ClinicCreateWithoutProvidersInput, ClinicUncheckedCreateWithoutProvidersInput>
    connectOrCreate?: ClinicCreateOrConnectWithoutProvidersInput
    connect?: ClinicWhereUniqueInput
  }

  export type MetricValueCreateNestedManyWithoutProviderInput = {
    create?: XOR<MetricValueCreateWithoutProviderInput, MetricValueUncheckedCreateWithoutProviderInput> | MetricValueCreateWithoutProviderInput[] | MetricValueUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutProviderInput | MetricValueCreateOrConnectWithoutProviderInput[]
    createMany?: MetricValueCreateManyProviderInputEnvelope
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
  }

  export type GoalCreateNestedManyWithoutProviderInput = {
    create?: XOR<GoalCreateWithoutProviderInput, GoalUncheckedCreateWithoutProviderInput> | GoalCreateWithoutProviderInput[] | GoalUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutProviderInput | GoalCreateOrConnectWithoutProviderInput[]
    createMany?: GoalCreateManyProviderInputEnvelope
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
  }

  export type MetricValueUncheckedCreateNestedManyWithoutProviderInput = {
    create?: XOR<MetricValueCreateWithoutProviderInput, MetricValueUncheckedCreateWithoutProviderInput> | MetricValueCreateWithoutProviderInput[] | MetricValueUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutProviderInput | MetricValueCreateOrConnectWithoutProviderInput[]
    createMany?: MetricValueCreateManyProviderInputEnvelope
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
  }

  export type GoalUncheckedCreateNestedManyWithoutProviderInput = {
    create?: XOR<GoalCreateWithoutProviderInput, GoalUncheckedCreateWithoutProviderInput> | GoalCreateWithoutProviderInput[] | GoalUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutProviderInput | GoalCreateOrConnectWithoutProviderInput[]
    createMany?: GoalCreateManyProviderInputEnvelope
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
  }

  export type ClinicUpdateOneRequiredWithoutProvidersNestedInput = {
    create?: XOR<ClinicCreateWithoutProvidersInput, ClinicUncheckedCreateWithoutProvidersInput>
    connectOrCreate?: ClinicCreateOrConnectWithoutProvidersInput
    upsert?: ClinicUpsertWithoutProvidersInput
    connect?: ClinicWhereUniqueInput
    update?: XOR<XOR<ClinicUpdateToOneWithWhereWithoutProvidersInput, ClinicUpdateWithoutProvidersInput>, ClinicUncheckedUpdateWithoutProvidersInput>
  }

  export type MetricValueUpdateManyWithoutProviderNestedInput = {
    create?: XOR<MetricValueCreateWithoutProviderInput, MetricValueUncheckedCreateWithoutProviderInput> | MetricValueCreateWithoutProviderInput[] | MetricValueUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutProviderInput | MetricValueCreateOrConnectWithoutProviderInput[]
    upsert?: MetricValueUpsertWithWhereUniqueWithoutProviderInput | MetricValueUpsertWithWhereUniqueWithoutProviderInput[]
    createMany?: MetricValueCreateManyProviderInputEnvelope
    set?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    disconnect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    delete?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    update?: MetricValueUpdateWithWhereUniqueWithoutProviderInput | MetricValueUpdateWithWhereUniqueWithoutProviderInput[]
    updateMany?: MetricValueUpdateManyWithWhereWithoutProviderInput | MetricValueUpdateManyWithWhereWithoutProviderInput[]
    deleteMany?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
  }

  export type GoalUpdateManyWithoutProviderNestedInput = {
    create?: XOR<GoalCreateWithoutProviderInput, GoalUncheckedCreateWithoutProviderInput> | GoalCreateWithoutProviderInput[] | GoalUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutProviderInput | GoalCreateOrConnectWithoutProviderInput[]
    upsert?: GoalUpsertWithWhereUniqueWithoutProviderInput | GoalUpsertWithWhereUniqueWithoutProviderInput[]
    createMany?: GoalCreateManyProviderInputEnvelope
    set?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    disconnect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    delete?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    update?: GoalUpdateWithWhereUniqueWithoutProviderInput | GoalUpdateWithWhereUniqueWithoutProviderInput[]
    updateMany?: GoalUpdateManyWithWhereWithoutProviderInput | GoalUpdateManyWithWhereWithoutProviderInput[]
    deleteMany?: GoalScalarWhereInput | GoalScalarWhereInput[]
  }

  export type MetricValueUncheckedUpdateManyWithoutProviderNestedInput = {
    create?: XOR<MetricValueCreateWithoutProviderInput, MetricValueUncheckedCreateWithoutProviderInput> | MetricValueCreateWithoutProviderInput[] | MetricValueUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutProviderInput | MetricValueCreateOrConnectWithoutProviderInput[]
    upsert?: MetricValueUpsertWithWhereUniqueWithoutProviderInput | MetricValueUpsertWithWhereUniqueWithoutProviderInput[]
    createMany?: MetricValueCreateManyProviderInputEnvelope
    set?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    disconnect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    delete?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    update?: MetricValueUpdateWithWhereUniqueWithoutProviderInput | MetricValueUpdateWithWhereUniqueWithoutProviderInput[]
    updateMany?: MetricValueUpdateManyWithWhereWithoutProviderInput | MetricValueUpdateManyWithWhereWithoutProviderInput[]
    deleteMany?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
  }

  export type GoalUncheckedUpdateManyWithoutProviderNestedInput = {
    create?: XOR<GoalCreateWithoutProviderInput, GoalUncheckedCreateWithoutProviderInput> | GoalCreateWithoutProviderInput[] | GoalUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutProviderInput | GoalCreateOrConnectWithoutProviderInput[]
    upsert?: GoalUpsertWithWhereUniqueWithoutProviderInput | GoalUpsertWithWhereUniqueWithoutProviderInput[]
    createMany?: GoalCreateManyProviderInputEnvelope
    set?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    disconnect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    delete?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    update?: GoalUpdateWithWhereUniqueWithoutProviderInput | GoalUpdateWithWhereUniqueWithoutProviderInput[]
    updateMany?: GoalUpdateManyWithWhereWithoutProviderInput | GoalUpdateManyWithWhereWithoutProviderInput[]
    deleteMany?: GoalScalarWhereInput | GoalScalarWhereInput[]
  }

  export type MetricValueCreateNestedManyWithoutMetricDefinitionInput = {
    create?: XOR<MetricValueCreateWithoutMetricDefinitionInput, MetricValueUncheckedCreateWithoutMetricDefinitionInput> | MetricValueCreateWithoutMetricDefinitionInput[] | MetricValueUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutMetricDefinitionInput | MetricValueCreateOrConnectWithoutMetricDefinitionInput[]
    createMany?: MetricValueCreateManyMetricDefinitionInputEnvelope
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
  }

  export type ColumnMappingCreateNestedManyWithoutMetricDefinitionInput = {
    create?: XOR<ColumnMappingCreateWithoutMetricDefinitionInput, ColumnMappingUncheckedCreateWithoutMetricDefinitionInput> | ColumnMappingCreateWithoutMetricDefinitionInput[] | ColumnMappingUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: ColumnMappingCreateOrConnectWithoutMetricDefinitionInput | ColumnMappingCreateOrConnectWithoutMetricDefinitionInput[]
    createMany?: ColumnMappingCreateManyMetricDefinitionInputEnvelope
    connect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
  }

  export type GoalCreateNestedManyWithoutMetricDefinitionInput = {
    create?: XOR<GoalCreateWithoutMetricDefinitionInput, GoalUncheckedCreateWithoutMetricDefinitionInput> | GoalCreateWithoutMetricDefinitionInput[] | GoalUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutMetricDefinitionInput | GoalCreateOrConnectWithoutMetricDefinitionInput[]
    createMany?: GoalCreateManyMetricDefinitionInputEnvelope
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
  }

  export type WidgetCreateNestedManyWithoutMetricDefinitionInput = {
    create?: XOR<WidgetCreateWithoutMetricDefinitionInput, WidgetUncheckedCreateWithoutMetricDefinitionInput> | WidgetCreateWithoutMetricDefinitionInput[] | WidgetUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: WidgetCreateOrConnectWithoutMetricDefinitionInput | WidgetCreateOrConnectWithoutMetricDefinitionInput[]
    createMany?: WidgetCreateManyMetricDefinitionInputEnvelope
    connect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
  }

  export type MetricValueUncheckedCreateNestedManyWithoutMetricDefinitionInput = {
    create?: XOR<MetricValueCreateWithoutMetricDefinitionInput, MetricValueUncheckedCreateWithoutMetricDefinitionInput> | MetricValueCreateWithoutMetricDefinitionInput[] | MetricValueUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutMetricDefinitionInput | MetricValueCreateOrConnectWithoutMetricDefinitionInput[]
    createMany?: MetricValueCreateManyMetricDefinitionInputEnvelope
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
  }

  export type ColumnMappingUncheckedCreateNestedManyWithoutMetricDefinitionInput = {
    create?: XOR<ColumnMappingCreateWithoutMetricDefinitionInput, ColumnMappingUncheckedCreateWithoutMetricDefinitionInput> | ColumnMappingCreateWithoutMetricDefinitionInput[] | ColumnMappingUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: ColumnMappingCreateOrConnectWithoutMetricDefinitionInput | ColumnMappingCreateOrConnectWithoutMetricDefinitionInput[]
    createMany?: ColumnMappingCreateManyMetricDefinitionInputEnvelope
    connect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
  }

  export type GoalUncheckedCreateNestedManyWithoutMetricDefinitionInput = {
    create?: XOR<GoalCreateWithoutMetricDefinitionInput, GoalUncheckedCreateWithoutMetricDefinitionInput> | GoalCreateWithoutMetricDefinitionInput[] | GoalUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutMetricDefinitionInput | GoalCreateOrConnectWithoutMetricDefinitionInput[]
    createMany?: GoalCreateManyMetricDefinitionInputEnvelope
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
  }

  export type WidgetUncheckedCreateNestedManyWithoutMetricDefinitionInput = {
    create?: XOR<WidgetCreateWithoutMetricDefinitionInput, WidgetUncheckedCreateWithoutMetricDefinitionInput> | WidgetCreateWithoutMetricDefinitionInput[] | WidgetUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: WidgetCreateOrConnectWithoutMetricDefinitionInput | WidgetCreateOrConnectWithoutMetricDefinitionInput[]
    createMany?: WidgetCreateManyMetricDefinitionInputEnvelope
    connect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type MetricValueUpdateManyWithoutMetricDefinitionNestedInput = {
    create?: XOR<MetricValueCreateWithoutMetricDefinitionInput, MetricValueUncheckedCreateWithoutMetricDefinitionInput> | MetricValueCreateWithoutMetricDefinitionInput[] | MetricValueUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutMetricDefinitionInput | MetricValueCreateOrConnectWithoutMetricDefinitionInput[]
    upsert?: MetricValueUpsertWithWhereUniqueWithoutMetricDefinitionInput | MetricValueUpsertWithWhereUniqueWithoutMetricDefinitionInput[]
    createMany?: MetricValueCreateManyMetricDefinitionInputEnvelope
    set?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    disconnect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    delete?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    update?: MetricValueUpdateWithWhereUniqueWithoutMetricDefinitionInput | MetricValueUpdateWithWhereUniqueWithoutMetricDefinitionInput[]
    updateMany?: MetricValueUpdateManyWithWhereWithoutMetricDefinitionInput | MetricValueUpdateManyWithWhereWithoutMetricDefinitionInput[]
    deleteMany?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
  }

  export type ColumnMappingUpdateManyWithoutMetricDefinitionNestedInput = {
    create?: XOR<ColumnMappingCreateWithoutMetricDefinitionInput, ColumnMappingUncheckedCreateWithoutMetricDefinitionInput> | ColumnMappingCreateWithoutMetricDefinitionInput[] | ColumnMappingUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: ColumnMappingCreateOrConnectWithoutMetricDefinitionInput | ColumnMappingCreateOrConnectWithoutMetricDefinitionInput[]
    upsert?: ColumnMappingUpsertWithWhereUniqueWithoutMetricDefinitionInput | ColumnMappingUpsertWithWhereUniqueWithoutMetricDefinitionInput[]
    createMany?: ColumnMappingCreateManyMetricDefinitionInputEnvelope
    set?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    disconnect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    delete?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    connect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    update?: ColumnMappingUpdateWithWhereUniqueWithoutMetricDefinitionInput | ColumnMappingUpdateWithWhereUniqueWithoutMetricDefinitionInput[]
    updateMany?: ColumnMappingUpdateManyWithWhereWithoutMetricDefinitionInput | ColumnMappingUpdateManyWithWhereWithoutMetricDefinitionInput[]
    deleteMany?: ColumnMappingScalarWhereInput | ColumnMappingScalarWhereInput[]
  }

  export type GoalUpdateManyWithoutMetricDefinitionNestedInput = {
    create?: XOR<GoalCreateWithoutMetricDefinitionInput, GoalUncheckedCreateWithoutMetricDefinitionInput> | GoalCreateWithoutMetricDefinitionInput[] | GoalUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutMetricDefinitionInput | GoalCreateOrConnectWithoutMetricDefinitionInput[]
    upsert?: GoalUpsertWithWhereUniqueWithoutMetricDefinitionInput | GoalUpsertWithWhereUniqueWithoutMetricDefinitionInput[]
    createMany?: GoalCreateManyMetricDefinitionInputEnvelope
    set?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    disconnect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    delete?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    update?: GoalUpdateWithWhereUniqueWithoutMetricDefinitionInput | GoalUpdateWithWhereUniqueWithoutMetricDefinitionInput[]
    updateMany?: GoalUpdateManyWithWhereWithoutMetricDefinitionInput | GoalUpdateManyWithWhereWithoutMetricDefinitionInput[]
    deleteMany?: GoalScalarWhereInput | GoalScalarWhereInput[]
  }

  export type WidgetUpdateManyWithoutMetricDefinitionNestedInput = {
    create?: XOR<WidgetCreateWithoutMetricDefinitionInput, WidgetUncheckedCreateWithoutMetricDefinitionInput> | WidgetCreateWithoutMetricDefinitionInput[] | WidgetUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: WidgetCreateOrConnectWithoutMetricDefinitionInput | WidgetCreateOrConnectWithoutMetricDefinitionInput[]
    upsert?: WidgetUpsertWithWhereUniqueWithoutMetricDefinitionInput | WidgetUpsertWithWhereUniqueWithoutMetricDefinitionInput[]
    createMany?: WidgetCreateManyMetricDefinitionInputEnvelope
    set?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    disconnect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    delete?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    connect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    update?: WidgetUpdateWithWhereUniqueWithoutMetricDefinitionInput | WidgetUpdateWithWhereUniqueWithoutMetricDefinitionInput[]
    updateMany?: WidgetUpdateManyWithWhereWithoutMetricDefinitionInput | WidgetUpdateManyWithWhereWithoutMetricDefinitionInput[]
    deleteMany?: WidgetScalarWhereInput | WidgetScalarWhereInput[]
  }

  export type MetricValueUncheckedUpdateManyWithoutMetricDefinitionNestedInput = {
    create?: XOR<MetricValueCreateWithoutMetricDefinitionInput, MetricValueUncheckedCreateWithoutMetricDefinitionInput> | MetricValueCreateWithoutMetricDefinitionInput[] | MetricValueUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutMetricDefinitionInput | MetricValueCreateOrConnectWithoutMetricDefinitionInput[]
    upsert?: MetricValueUpsertWithWhereUniqueWithoutMetricDefinitionInput | MetricValueUpsertWithWhereUniqueWithoutMetricDefinitionInput[]
    createMany?: MetricValueCreateManyMetricDefinitionInputEnvelope
    set?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    disconnect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    delete?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    update?: MetricValueUpdateWithWhereUniqueWithoutMetricDefinitionInput | MetricValueUpdateWithWhereUniqueWithoutMetricDefinitionInput[]
    updateMany?: MetricValueUpdateManyWithWhereWithoutMetricDefinitionInput | MetricValueUpdateManyWithWhereWithoutMetricDefinitionInput[]
    deleteMany?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
  }

  export type ColumnMappingUncheckedUpdateManyWithoutMetricDefinitionNestedInput = {
    create?: XOR<ColumnMappingCreateWithoutMetricDefinitionInput, ColumnMappingUncheckedCreateWithoutMetricDefinitionInput> | ColumnMappingCreateWithoutMetricDefinitionInput[] | ColumnMappingUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: ColumnMappingCreateOrConnectWithoutMetricDefinitionInput | ColumnMappingCreateOrConnectWithoutMetricDefinitionInput[]
    upsert?: ColumnMappingUpsertWithWhereUniqueWithoutMetricDefinitionInput | ColumnMappingUpsertWithWhereUniqueWithoutMetricDefinitionInput[]
    createMany?: ColumnMappingCreateManyMetricDefinitionInputEnvelope
    set?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    disconnect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    delete?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    connect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    update?: ColumnMappingUpdateWithWhereUniqueWithoutMetricDefinitionInput | ColumnMappingUpdateWithWhereUniqueWithoutMetricDefinitionInput[]
    updateMany?: ColumnMappingUpdateManyWithWhereWithoutMetricDefinitionInput | ColumnMappingUpdateManyWithWhereWithoutMetricDefinitionInput[]
    deleteMany?: ColumnMappingScalarWhereInput | ColumnMappingScalarWhereInput[]
  }

  export type GoalUncheckedUpdateManyWithoutMetricDefinitionNestedInput = {
    create?: XOR<GoalCreateWithoutMetricDefinitionInput, GoalUncheckedCreateWithoutMetricDefinitionInput> | GoalCreateWithoutMetricDefinitionInput[] | GoalUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutMetricDefinitionInput | GoalCreateOrConnectWithoutMetricDefinitionInput[]
    upsert?: GoalUpsertWithWhereUniqueWithoutMetricDefinitionInput | GoalUpsertWithWhereUniqueWithoutMetricDefinitionInput[]
    createMany?: GoalCreateManyMetricDefinitionInputEnvelope
    set?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    disconnect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    delete?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    update?: GoalUpdateWithWhereUniqueWithoutMetricDefinitionInput | GoalUpdateWithWhereUniqueWithoutMetricDefinitionInput[]
    updateMany?: GoalUpdateManyWithWhereWithoutMetricDefinitionInput | GoalUpdateManyWithWhereWithoutMetricDefinitionInput[]
    deleteMany?: GoalScalarWhereInput | GoalScalarWhereInput[]
  }

  export type WidgetUncheckedUpdateManyWithoutMetricDefinitionNestedInput = {
    create?: XOR<WidgetCreateWithoutMetricDefinitionInput, WidgetUncheckedCreateWithoutMetricDefinitionInput> | WidgetCreateWithoutMetricDefinitionInput[] | WidgetUncheckedCreateWithoutMetricDefinitionInput[]
    connectOrCreate?: WidgetCreateOrConnectWithoutMetricDefinitionInput | WidgetCreateOrConnectWithoutMetricDefinitionInput[]
    upsert?: WidgetUpsertWithWhereUniqueWithoutMetricDefinitionInput | WidgetUpsertWithWhereUniqueWithoutMetricDefinitionInput[]
    createMany?: WidgetCreateManyMetricDefinitionInputEnvelope
    set?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    disconnect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    delete?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    connect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    update?: WidgetUpdateWithWhereUniqueWithoutMetricDefinitionInput | WidgetUpdateWithWhereUniqueWithoutMetricDefinitionInput[]
    updateMany?: WidgetUpdateManyWithWhereWithoutMetricDefinitionInput | WidgetUpdateManyWithWhereWithoutMetricDefinitionInput[]
    deleteMany?: WidgetScalarWhereInput | WidgetScalarWhereInput[]
  }

  export type ColumnMappingCreateNestedManyWithoutDataSourceInput = {
    create?: XOR<ColumnMappingCreateWithoutDataSourceInput, ColumnMappingUncheckedCreateWithoutDataSourceInput> | ColumnMappingCreateWithoutDataSourceInput[] | ColumnMappingUncheckedCreateWithoutDataSourceInput[]
    connectOrCreate?: ColumnMappingCreateOrConnectWithoutDataSourceInput | ColumnMappingCreateOrConnectWithoutDataSourceInput[]
    createMany?: ColumnMappingCreateManyDataSourceInputEnvelope
    connect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
  }

  export type MetricValueCreateNestedManyWithoutDataSourceInput = {
    create?: XOR<MetricValueCreateWithoutDataSourceInput, MetricValueUncheckedCreateWithoutDataSourceInput> | MetricValueCreateWithoutDataSourceInput[] | MetricValueUncheckedCreateWithoutDataSourceInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutDataSourceInput | MetricValueCreateOrConnectWithoutDataSourceInput[]
    createMany?: MetricValueCreateManyDataSourceInputEnvelope
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
  }

  export type ColumnMappingUncheckedCreateNestedManyWithoutDataSourceInput = {
    create?: XOR<ColumnMappingCreateWithoutDataSourceInput, ColumnMappingUncheckedCreateWithoutDataSourceInput> | ColumnMappingCreateWithoutDataSourceInput[] | ColumnMappingUncheckedCreateWithoutDataSourceInput[]
    connectOrCreate?: ColumnMappingCreateOrConnectWithoutDataSourceInput | ColumnMappingCreateOrConnectWithoutDataSourceInput[]
    createMany?: ColumnMappingCreateManyDataSourceInputEnvelope
    connect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
  }

  export type MetricValueUncheckedCreateNestedManyWithoutDataSourceInput = {
    create?: XOR<MetricValueCreateWithoutDataSourceInput, MetricValueUncheckedCreateWithoutDataSourceInput> | MetricValueCreateWithoutDataSourceInput[] | MetricValueUncheckedCreateWithoutDataSourceInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutDataSourceInput | MetricValueCreateOrConnectWithoutDataSourceInput[]
    createMany?: MetricValueCreateManyDataSourceInputEnvelope
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
  }

  export type ColumnMappingUpdateManyWithoutDataSourceNestedInput = {
    create?: XOR<ColumnMappingCreateWithoutDataSourceInput, ColumnMappingUncheckedCreateWithoutDataSourceInput> | ColumnMappingCreateWithoutDataSourceInput[] | ColumnMappingUncheckedCreateWithoutDataSourceInput[]
    connectOrCreate?: ColumnMappingCreateOrConnectWithoutDataSourceInput | ColumnMappingCreateOrConnectWithoutDataSourceInput[]
    upsert?: ColumnMappingUpsertWithWhereUniqueWithoutDataSourceInput | ColumnMappingUpsertWithWhereUniqueWithoutDataSourceInput[]
    createMany?: ColumnMappingCreateManyDataSourceInputEnvelope
    set?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    disconnect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    delete?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    connect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    update?: ColumnMappingUpdateWithWhereUniqueWithoutDataSourceInput | ColumnMappingUpdateWithWhereUniqueWithoutDataSourceInput[]
    updateMany?: ColumnMappingUpdateManyWithWhereWithoutDataSourceInput | ColumnMappingUpdateManyWithWhereWithoutDataSourceInput[]
    deleteMany?: ColumnMappingScalarWhereInput | ColumnMappingScalarWhereInput[]
  }

  export type MetricValueUpdateManyWithoutDataSourceNestedInput = {
    create?: XOR<MetricValueCreateWithoutDataSourceInput, MetricValueUncheckedCreateWithoutDataSourceInput> | MetricValueCreateWithoutDataSourceInput[] | MetricValueUncheckedCreateWithoutDataSourceInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutDataSourceInput | MetricValueCreateOrConnectWithoutDataSourceInput[]
    upsert?: MetricValueUpsertWithWhereUniqueWithoutDataSourceInput | MetricValueUpsertWithWhereUniqueWithoutDataSourceInput[]
    createMany?: MetricValueCreateManyDataSourceInputEnvelope
    set?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    disconnect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    delete?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    update?: MetricValueUpdateWithWhereUniqueWithoutDataSourceInput | MetricValueUpdateWithWhereUniqueWithoutDataSourceInput[]
    updateMany?: MetricValueUpdateManyWithWhereWithoutDataSourceInput | MetricValueUpdateManyWithWhereWithoutDataSourceInput[]
    deleteMany?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
  }

  export type ColumnMappingUncheckedUpdateManyWithoutDataSourceNestedInput = {
    create?: XOR<ColumnMappingCreateWithoutDataSourceInput, ColumnMappingUncheckedCreateWithoutDataSourceInput> | ColumnMappingCreateWithoutDataSourceInput[] | ColumnMappingUncheckedCreateWithoutDataSourceInput[]
    connectOrCreate?: ColumnMappingCreateOrConnectWithoutDataSourceInput | ColumnMappingCreateOrConnectWithoutDataSourceInput[]
    upsert?: ColumnMappingUpsertWithWhereUniqueWithoutDataSourceInput | ColumnMappingUpsertWithWhereUniqueWithoutDataSourceInput[]
    createMany?: ColumnMappingCreateManyDataSourceInputEnvelope
    set?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    disconnect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    delete?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    connect?: ColumnMappingWhereUniqueInput | ColumnMappingWhereUniqueInput[]
    update?: ColumnMappingUpdateWithWhereUniqueWithoutDataSourceInput | ColumnMappingUpdateWithWhereUniqueWithoutDataSourceInput[]
    updateMany?: ColumnMappingUpdateManyWithWhereWithoutDataSourceInput | ColumnMappingUpdateManyWithWhereWithoutDataSourceInput[]
    deleteMany?: ColumnMappingScalarWhereInput | ColumnMappingScalarWhereInput[]
  }

  export type MetricValueUncheckedUpdateManyWithoutDataSourceNestedInput = {
    create?: XOR<MetricValueCreateWithoutDataSourceInput, MetricValueUncheckedCreateWithoutDataSourceInput> | MetricValueCreateWithoutDataSourceInput[] | MetricValueUncheckedCreateWithoutDataSourceInput[]
    connectOrCreate?: MetricValueCreateOrConnectWithoutDataSourceInput | MetricValueCreateOrConnectWithoutDataSourceInput[]
    upsert?: MetricValueUpsertWithWhereUniqueWithoutDataSourceInput | MetricValueUpsertWithWhereUniqueWithoutDataSourceInput[]
    createMany?: MetricValueCreateManyDataSourceInputEnvelope
    set?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    disconnect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    delete?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    connect?: MetricValueWhereUniqueInput | MetricValueWhereUniqueInput[]
    update?: MetricValueUpdateWithWhereUniqueWithoutDataSourceInput | MetricValueUpdateWithWhereUniqueWithoutDataSourceInput[]
    updateMany?: MetricValueUpdateManyWithWhereWithoutDataSourceInput | MetricValueUpdateManyWithWhereWithoutDataSourceInput[]
    deleteMany?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
  }

  export type DataSourceCreateNestedOneWithoutColumnMappingsInput = {
    create?: XOR<DataSourceCreateWithoutColumnMappingsInput, DataSourceUncheckedCreateWithoutColumnMappingsInput>
    connectOrCreate?: DataSourceCreateOrConnectWithoutColumnMappingsInput
    connect?: DataSourceWhereUniqueInput
  }

  export type MetricDefinitionCreateNestedOneWithoutColumnMappingsInput = {
    create?: XOR<MetricDefinitionCreateWithoutColumnMappingsInput, MetricDefinitionUncheckedCreateWithoutColumnMappingsInput>
    connectOrCreate?: MetricDefinitionCreateOrConnectWithoutColumnMappingsInput
    connect?: MetricDefinitionWhereUniqueInput
  }

  export type DataSourceUpdateOneRequiredWithoutColumnMappingsNestedInput = {
    create?: XOR<DataSourceCreateWithoutColumnMappingsInput, DataSourceUncheckedCreateWithoutColumnMappingsInput>
    connectOrCreate?: DataSourceCreateOrConnectWithoutColumnMappingsInput
    upsert?: DataSourceUpsertWithoutColumnMappingsInput
    connect?: DataSourceWhereUniqueInput
    update?: XOR<XOR<DataSourceUpdateToOneWithWhereWithoutColumnMappingsInput, DataSourceUpdateWithoutColumnMappingsInput>, DataSourceUncheckedUpdateWithoutColumnMappingsInput>
  }

  export type MetricDefinitionUpdateOneRequiredWithoutColumnMappingsNestedInput = {
    create?: XOR<MetricDefinitionCreateWithoutColumnMappingsInput, MetricDefinitionUncheckedCreateWithoutColumnMappingsInput>
    connectOrCreate?: MetricDefinitionCreateOrConnectWithoutColumnMappingsInput
    upsert?: MetricDefinitionUpsertWithoutColumnMappingsInput
    connect?: MetricDefinitionWhereUniqueInput
    update?: XOR<XOR<MetricDefinitionUpdateToOneWithWhereWithoutColumnMappingsInput, MetricDefinitionUpdateWithoutColumnMappingsInput>, MetricDefinitionUncheckedUpdateWithoutColumnMappingsInput>
  }

  export type MetricDefinitionCreateNestedOneWithoutMetricsInput = {
    create?: XOR<MetricDefinitionCreateWithoutMetricsInput, MetricDefinitionUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: MetricDefinitionCreateOrConnectWithoutMetricsInput
    connect?: MetricDefinitionWhereUniqueInput
  }

  export type ClinicCreateNestedOneWithoutMetricsInput = {
    create?: XOR<ClinicCreateWithoutMetricsInput, ClinicUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: ClinicCreateOrConnectWithoutMetricsInput
    connect?: ClinicWhereUniqueInput
  }

  export type ProviderCreateNestedOneWithoutMetricsInput = {
    create?: XOR<ProviderCreateWithoutMetricsInput, ProviderUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: ProviderCreateOrConnectWithoutMetricsInput
    connect?: ProviderWhereUniqueInput
  }

  export type DataSourceCreateNestedOneWithoutMetricsInput = {
    create?: XOR<DataSourceCreateWithoutMetricsInput, DataSourceUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: DataSourceCreateOrConnectWithoutMetricsInput
    connect?: DataSourceWhereUniqueInput
  }

  export type MetricDefinitionUpdateOneRequiredWithoutMetricsNestedInput = {
    create?: XOR<MetricDefinitionCreateWithoutMetricsInput, MetricDefinitionUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: MetricDefinitionCreateOrConnectWithoutMetricsInput
    upsert?: MetricDefinitionUpsertWithoutMetricsInput
    connect?: MetricDefinitionWhereUniqueInput
    update?: XOR<XOR<MetricDefinitionUpdateToOneWithWhereWithoutMetricsInput, MetricDefinitionUpdateWithoutMetricsInput>, MetricDefinitionUncheckedUpdateWithoutMetricsInput>
  }

  export type ClinicUpdateOneWithoutMetricsNestedInput = {
    create?: XOR<ClinicCreateWithoutMetricsInput, ClinicUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: ClinicCreateOrConnectWithoutMetricsInput
    upsert?: ClinicUpsertWithoutMetricsInput
    disconnect?: ClinicWhereInput | boolean
    delete?: ClinicWhereInput | boolean
    connect?: ClinicWhereUniqueInput
    update?: XOR<XOR<ClinicUpdateToOneWithWhereWithoutMetricsInput, ClinicUpdateWithoutMetricsInput>, ClinicUncheckedUpdateWithoutMetricsInput>
  }

  export type ProviderUpdateOneWithoutMetricsNestedInput = {
    create?: XOR<ProviderCreateWithoutMetricsInput, ProviderUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: ProviderCreateOrConnectWithoutMetricsInput
    upsert?: ProviderUpsertWithoutMetricsInput
    disconnect?: ProviderWhereInput | boolean
    delete?: ProviderWhereInput | boolean
    connect?: ProviderWhereUniqueInput
    update?: XOR<XOR<ProviderUpdateToOneWithWhereWithoutMetricsInput, ProviderUpdateWithoutMetricsInput>, ProviderUncheckedUpdateWithoutMetricsInput>
  }

  export type DataSourceUpdateOneWithoutMetricsNestedInput = {
    create?: XOR<DataSourceCreateWithoutMetricsInput, DataSourceUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: DataSourceCreateOrConnectWithoutMetricsInput
    upsert?: DataSourceUpsertWithoutMetricsInput
    disconnect?: DataSourceWhereInput | boolean
    delete?: DataSourceWhereInput | boolean
    connect?: DataSourceWhereUniqueInput
    update?: XOR<XOR<DataSourceUpdateToOneWithWhereWithoutMetricsInput, DataSourceUpdateWithoutMetricsInput>, DataSourceUncheckedUpdateWithoutMetricsInput>
  }

  export type MetricDefinitionCreateNestedOneWithoutGoalsInput = {
    create?: XOR<MetricDefinitionCreateWithoutGoalsInput, MetricDefinitionUncheckedCreateWithoutGoalsInput>
    connectOrCreate?: MetricDefinitionCreateOrConnectWithoutGoalsInput
    connect?: MetricDefinitionWhereUniqueInput
  }

  export type ClinicCreateNestedOneWithoutGoalsInput = {
    create?: XOR<ClinicCreateWithoutGoalsInput, ClinicUncheckedCreateWithoutGoalsInput>
    connectOrCreate?: ClinicCreateOrConnectWithoutGoalsInput
    connect?: ClinicWhereUniqueInput
  }

  export type ProviderCreateNestedOneWithoutGoalsInput = {
    create?: XOR<ProviderCreateWithoutGoalsInput, ProviderUncheckedCreateWithoutGoalsInput>
    connectOrCreate?: ProviderCreateOrConnectWithoutGoalsInput
    connect?: ProviderWhereUniqueInput
  }

  export type MetricDefinitionUpdateOneRequiredWithoutGoalsNestedInput = {
    create?: XOR<MetricDefinitionCreateWithoutGoalsInput, MetricDefinitionUncheckedCreateWithoutGoalsInput>
    connectOrCreate?: MetricDefinitionCreateOrConnectWithoutGoalsInput
    upsert?: MetricDefinitionUpsertWithoutGoalsInput
    connect?: MetricDefinitionWhereUniqueInput
    update?: XOR<XOR<MetricDefinitionUpdateToOneWithWhereWithoutGoalsInput, MetricDefinitionUpdateWithoutGoalsInput>, MetricDefinitionUncheckedUpdateWithoutGoalsInput>
  }

  export type ClinicUpdateOneWithoutGoalsNestedInput = {
    create?: XOR<ClinicCreateWithoutGoalsInput, ClinicUncheckedCreateWithoutGoalsInput>
    connectOrCreate?: ClinicCreateOrConnectWithoutGoalsInput
    upsert?: ClinicUpsertWithoutGoalsInput
    disconnect?: ClinicWhereInput | boolean
    delete?: ClinicWhereInput | boolean
    connect?: ClinicWhereUniqueInput
    update?: XOR<XOR<ClinicUpdateToOneWithWhereWithoutGoalsInput, ClinicUpdateWithoutGoalsInput>, ClinicUncheckedUpdateWithoutGoalsInput>
  }

  export type ProviderUpdateOneWithoutGoalsNestedInput = {
    create?: XOR<ProviderCreateWithoutGoalsInput, ProviderUncheckedCreateWithoutGoalsInput>
    connectOrCreate?: ProviderCreateOrConnectWithoutGoalsInput
    upsert?: ProviderUpsertWithoutGoalsInput
    disconnect?: ProviderWhereInput | boolean
    delete?: ProviderWhereInput | boolean
    connect?: ProviderWhereUniqueInput
    update?: XOR<XOR<ProviderUpdateToOneWithWhereWithoutGoalsInput, ProviderUpdateWithoutGoalsInput>, ProviderUncheckedUpdateWithoutGoalsInput>
  }

  export type UserCreateNestedOneWithoutDashboardsInput = {
    create?: XOR<UserCreateWithoutDashboardsInput, UserUncheckedCreateWithoutDashboardsInput>
    connectOrCreate?: UserCreateOrConnectWithoutDashboardsInput
    connect?: UserWhereUniqueInput
  }

  export type WidgetCreateNestedManyWithoutDashboardInput = {
    create?: XOR<WidgetCreateWithoutDashboardInput, WidgetUncheckedCreateWithoutDashboardInput> | WidgetCreateWithoutDashboardInput[] | WidgetUncheckedCreateWithoutDashboardInput[]
    connectOrCreate?: WidgetCreateOrConnectWithoutDashboardInput | WidgetCreateOrConnectWithoutDashboardInput[]
    createMany?: WidgetCreateManyDashboardInputEnvelope
    connect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
  }

  export type WidgetUncheckedCreateNestedManyWithoutDashboardInput = {
    create?: XOR<WidgetCreateWithoutDashboardInput, WidgetUncheckedCreateWithoutDashboardInput> | WidgetCreateWithoutDashboardInput[] | WidgetUncheckedCreateWithoutDashboardInput[]
    connectOrCreate?: WidgetCreateOrConnectWithoutDashboardInput | WidgetCreateOrConnectWithoutDashboardInput[]
    createMany?: WidgetCreateManyDashboardInputEnvelope
    connect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutDashboardsNestedInput = {
    create?: XOR<UserCreateWithoutDashboardsInput, UserUncheckedCreateWithoutDashboardsInput>
    connectOrCreate?: UserCreateOrConnectWithoutDashboardsInput
    upsert?: UserUpsertWithoutDashboardsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDashboardsInput, UserUpdateWithoutDashboardsInput>, UserUncheckedUpdateWithoutDashboardsInput>
  }

  export type WidgetUpdateManyWithoutDashboardNestedInput = {
    create?: XOR<WidgetCreateWithoutDashboardInput, WidgetUncheckedCreateWithoutDashboardInput> | WidgetCreateWithoutDashboardInput[] | WidgetUncheckedCreateWithoutDashboardInput[]
    connectOrCreate?: WidgetCreateOrConnectWithoutDashboardInput | WidgetCreateOrConnectWithoutDashboardInput[]
    upsert?: WidgetUpsertWithWhereUniqueWithoutDashboardInput | WidgetUpsertWithWhereUniqueWithoutDashboardInput[]
    createMany?: WidgetCreateManyDashboardInputEnvelope
    set?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    disconnect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    delete?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    connect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    update?: WidgetUpdateWithWhereUniqueWithoutDashboardInput | WidgetUpdateWithWhereUniqueWithoutDashboardInput[]
    updateMany?: WidgetUpdateManyWithWhereWithoutDashboardInput | WidgetUpdateManyWithWhereWithoutDashboardInput[]
    deleteMany?: WidgetScalarWhereInput | WidgetScalarWhereInput[]
  }

  export type WidgetUncheckedUpdateManyWithoutDashboardNestedInput = {
    create?: XOR<WidgetCreateWithoutDashboardInput, WidgetUncheckedCreateWithoutDashboardInput> | WidgetCreateWithoutDashboardInput[] | WidgetUncheckedCreateWithoutDashboardInput[]
    connectOrCreate?: WidgetCreateOrConnectWithoutDashboardInput | WidgetCreateOrConnectWithoutDashboardInput[]
    upsert?: WidgetUpsertWithWhereUniqueWithoutDashboardInput | WidgetUpsertWithWhereUniqueWithoutDashboardInput[]
    createMany?: WidgetCreateManyDashboardInputEnvelope
    set?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    disconnect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    delete?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    connect?: WidgetWhereUniqueInput | WidgetWhereUniqueInput[]
    update?: WidgetUpdateWithWhereUniqueWithoutDashboardInput | WidgetUpdateWithWhereUniqueWithoutDashboardInput[]
    updateMany?: WidgetUpdateManyWithWhereWithoutDashboardInput | WidgetUpdateManyWithWhereWithoutDashboardInput[]
    deleteMany?: WidgetScalarWhereInput | WidgetScalarWhereInput[]
  }

  export type DashboardCreateNestedOneWithoutWidgetsInput = {
    create?: XOR<DashboardCreateWithoutWidgetsInput, DashboardUncheckedCreateWithoutWidgetsInput>
    connectOrCreate?: DashboardCreateOrConnectWithoutWidgetsInput
    connect?: DashboardWhereUniqueInput
  }

  export type MetricDefinitionCreateNestedOneWithoutWidgetsInput = {
    create?: XOR<MetricDefinitionCreateWithoutWidgetsInput, MetricDefinitionUncheckedCreateWithoutWidgetsInput>
    connectOrCreate?: MetricDefinitionCreateOrConnectWithoutWidgetsInput
    connect?: MetricDefinitionWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DashboardUpdateOneRequiredWithoutWidgetsNestedInput = {
    create?: XOR<DashboardCreateWithoutWidgetsInput, DashboardUncheckedCreateWithoutWidgetsInput>
    connectOrCreate?: DashboardCreateOrConnectWithoutWidgetsInput
    upsert?: DashboardUpsertWithoutWidgetsInput
    connect?: DashboardWhereUniqueInput
    update?: XOR<XOR<DashboardUpdateToOneWithWhereWithoutWidgetsInput, DashboardUpdateWithoutWidgetsInput>, DashboardUncheckedUpdateWithoutWidgetsInput>
  }

  export type MetricDefinitionUpdateOneWithoutWidgetsNestedInput = {
    create?: XOR<MetricDefinitionCreateWithoutWidgetsInput, MetricDefinitionUncheckedCreateWithoutWidgetsInput>
    connectOrCreate?: MetricDefinitionCreateOrConnectWithoutWidgetsInput
    upsert?: MetricDefinitionUpsertWithoutWidgetsInput
    disconnect?: MetricDefinitionWhereInput | boolean
    delete?: MetricDefinitionWhereInput | boolean
    connect?: MetricDefinitionWhereUniqueInput
    update?: XOR<XOR<MetricDefinitionUpdateToOneWithWhereWithoutWidgetsInput, MetricDefinitionUpdateWithoutWidgetsInput>, MetricDefinitionUncheckedUpdateWithoutWidgetsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type UserCreateWithoutClinicInput = {
    id?: string
    email: string
    name: string
    role: string
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dashboards?: DashboardCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutClinicInput = {
    id?: string
    email: string
    name: string
    role: string
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dashboards?: DashboardUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutClinicInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutClinicInput, UserUncheckedCreateWithoutClinicInput>
  }

  export type UserCreateManyClinicInputEnvelope = {
    data: UserCreateManyClinicInput | UserCreateManyClinicInput[]
    skipDuplicates?: boolean
  }

  export type ProviderCreateWithoutClinicInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueCreateNestedManyWithoutProviderInput
    goals?: GoalCreateNestedManyWithoutProviderInput
  }

  export type ProviderUncheckedCreateWithoutClinicInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueUncheckedCreateNestedManyWithoutProviderInput
    goals?: GoalUncheckedCreateNestedManyWithoutProviderInput
  }

  export type ProviderCreateOrConnectWithoutClinicInput = {
    where: ProviderWhereUniqueInput
    create: XOR<ProviderCreateWithoutClinicInput, ProviderUncheckedCreateWithoutClinicInput>
  }

  export type ProviderCreateManyClinicInputEnvelope = {
    data: ProviderCreateManyClinicInput | ProviderCreateManyClinicInput[]
    skipDuplicates?: boolean
  }

  export type MetricValueCreateWithoutClinicInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinition: MetricDefinitionCreateNestedOneWithoutMetricsInput
    provider?: ProviderCreateNestedOneWithoutMetricsInput
    dataSource?: DataSourceCreateNestedOneWithoutMetricsInput
  }

  export type MetricValueUncheckedCreateWithoutClinicInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    providerId?: string | null
    dataSourceId?: string | null
  }

  export type MetricValueCreateOrConnectWithoutClinicInput = {
    where: MetricValueWhereUniqueInput
    create: XOR<MetricValueCreateWithoutClinicInput, MetricValueUncheckedCreateWithoutClinicInput>
  }

  export type MetricValueCreateManyClinicInputEnvelope = {
    data: MetricValueCreateManyClinicInput | MetricValueCreateManyClinicInput[]
    skipDuplicates?: boolean
  }

  export type GoalCreateWithoutClinicInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinition: MetricDefinitionCreateNestedOneWithoutGoalsInput
    provider?: ProviderCreateNestedOneWithoutGoalsInput
  }

  export type GoalUncheckedCreateWithoutClinicInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    providerId?: string | null
  }

  export type GoalCreateOrConnectWithoutClinicInput = {
    where: GoalWhereUniqueInput
    create: XOR<GoalCreateWithoutClinicInput, GoalUncheckedCreateWithoutClinicInput>
  }

  export type GoalCreateManyClinicInputEnvelope = {
    data: GoalCreateManyClinicInput | GoalCreateManyClinicInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutClinicInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutClinicInput, UserUncheckedUpdateWithoutClinicInput>
    create: XOR<UserCreateWithoutClinicInput, UserUncheckedCreateWithoutClinicInput>
  }

  export type UserUpdateWithWhereUniqueWithoutClinicInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutClinicInput, UserUncheckedUpdateWithoutClinicInput>
  }

  export type UserUpdateManyWithWhereWithoutClinicInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutClinicInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    lastLogin?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    clinicId?: StringFilter<"User"> | string
  }

  export type ProviderUpsertWithWhereUniqueWithoutClinicInput = {
    where: ProviderWhereUniqueInput
    update: XOR<ProviderUpdateWithoutClinicInput, ProviderUncheckedUpdateWithoutClinicInput>
    create: XOR<ProviderCreateWithoutClinicInput, ProviderUncheckedCreateWithoutClinicInput>
  }

  export type ProviderUpdateWithWhereUniqueWithoutClinicInput = {
    where: ProviderWhereUniqueInput
    data: XOR<ProviderUpdateWithoutClinicInput, ProviderUncheckedUpdateWithoutClinicInput>
  }

  export type ProviderUpdateManyWithWhereWithoutClinicInput = {
    where: ProviderScalarWhereInput
    data: XOR<ProviderUpdateManyMutationInput, ProviderUncheckedUpdateManyWithoutClinicInput>
  }

  export type ProviderScalarWhereInput = {
    AND?: ProviderScalarWhereInput | ProviderScalarWhereInput[]
    OR?: ProviderScalarWhereInput[]
    NOT?: ProviderScalarWhereInput | ProviderScalarWhereInput[]
    id?: StringFilter<"Provider"> | string
    name?: StringFilter<"Provider"> | string
    providerType?: StringFilter<"Provider"> | string
    status?: StringFilter<"Provider"> | string
    createdAt?: DateTimeFilter<"Provider"> | Date | string
    updatedAt?: DateTimeFilter<"Provider"> | Date | string
    clinicId?: StringFilter<"Provider"> | string
  }

  export type MetricValueUpsertWithWhereUniqueWithoutClinicInput = {
    where: MetricValueWhereUniqueInput
    update: XOR<MetricValueUpdateWithoutClinicInput, MetricValueUncheckedUpdateWithoutClinicInput>
    create: XOR<MetricValueCreateWithoutClinicInput, MetricValueUncheckedCreateWithoutClinicInput>
  }

  export type MetricValueUpdateWithWhereUniqueWithoutClinicInput = {
    where: MetricValueWhereUniqueInput
    data: XOR<MetricValueUpdateWithoutClinicInput, MetricValueUncheckedUpdateWithoutClinicInput>
  }

  export type MetricValueUpdateManyWithWhereWithoutClinicInput = {
    where: MetricValueScalarWhereInput
    data: XOR<MetricValueUpdateManyMutationInput, MetricValueUncheckedUpdateManyWithoutClinicInput>
  }

  export type MetricValueScalarWhereInput = {
    AND?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
    OR?: MetricValueScalarWhereInput[]
    NOT?: MetricValueScalarWhereInput | MetricValueScalarWhereInput[]
    id?: StringFilter<"MetricValue"> | string
    date?: DateTimeFilter<"MetricValue"> | Date | string
    value?: StringFilter<"MetricValue"> | string
    sourceType?: StringFilter<"MetricValue"> | string
    sourceSheet?: StringNullableFilter<"MetricValue"> | string | null
    externalId?: StringNullableFilter<"MetricValue"> | string | null
    createdAt?: DateTimeFilter<"MetricValue"> | Date | string
    updatedAt?: DateTimeFilter<"MetricValue"> | Date | string
    metricDefinitionId?: StringFilter<"MetricValue"> | string
    clinicId?: StringNullableFilter<"MetricValue"> | string | null
    providerId?: StringNullableFilter<"MetricValue"> | string | null
    dataSourceId?: StringNullableFilter<"MetricValue"> | string | null
  }

  export type GoalUpsertWithWhereUniqueWithoutClinicInput = {
    where: GoalWhereUniqueInput
    update: XOR<GoalUpdateWithoutClinicInput, GoalUncheckedUpdateWithoutClinicInput>
    create: XOR<GoalCreateWithoutClinicInput, GoalUncheckedCreateWithoutClinicInput>
  }

  export type GoalUpdateWithWhereUniqueWithoutClinicInput = {
    where: GoalWhereUniqueInput
    data: XOR<GoalUpdateWithoutClinicInput, GoalUncheckedUpdateWithoutClinicInput>
  }

  export type GoalUpdateManyWithWhereWithoutClinicInput = {
    where: GoalScalarWhereInput
    data: XOR<GoalUpdateManyMutationInput, GoalUncheckedUpdateManyWithoutClinicInput>
  }

  export type GoalScalarWhereInput = {
    AND?: GoalScalarWhereInput | GoalScalarWhereInput[]
    OR?: GoalScalarWhereInput[]
    NOT?: GoalScalarWhereInput | GoalScalarWhereInput[]
    id?: StringFilter<"Goal"> | string
    timePeriod?: StringFilter<"Goal"> | string
    startDate?: DateTimeFilter<"Goal"> | Date | string
    endDate?: DateTimeFilter<"Goal"> | Date | string
    targetValue?: StringFilter<"Goal"> | string
    createdAt?: DateTimeFilter<"Goal"> | Date | string
    updatedAt?: DateTimeFilter<"Goal"> | Date | string
    metricDefinitionId?: StringFilter<"Goal"> | string
    clinicId?: StringNullableFilter<"Goal"> | string | null
    providerId?: StringNullableFilter<"Goal"> | string | null
  }

  export type ClinicCreateWithoutUsersInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    providers?: ProviderCreateNestedManyWithoutClinicInput
    metrics?: MetricValueCreateNestedManyWithoutClinicInput
    goals?: GoalCreateNestedManyWithoutClinicInput
  }

  export type ClinicUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    providers?: ProviderUncheckedCreateNestedManyWithoutClinicInput
    metrics?: MetricValueUncheckedCreateNestedManyWithoutClinicInput
    goals?: GoalUncheckedCreateNestedManyWithoutClinicInput
  }

  export type ClinicCreateOrConnectWithoutUsersInput = {
    where: ClinicWhereUniqueInput
    create: XOR<ClinicCreateWithoutUsersInput, ClinicUncheckedCreateWithoutUsersInput>
  }

  export type DashboardCreateWithoutUserInput = {
    id?: string
    name: string
    isDefault?: boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    widgets?: WidgetCreateNestedManyWithoutDashboardInput
  }

  export type DashboardUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    isDefault?: boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    widgets?: WidgetUncheckedCreateNestedManyWithoutDashboardInput
  }

  export type DashboardCreateOrConnectWithoutUserInput = {
    where: DashboardWhereUniqueInput
    create: XOR<DashboardCreateWithoutUserInput, DashboardUncheckedCreateWithoutUserInput>
  }

  export type DashboardCreateManyUserInputEnvelope = {
    data: DashboardCreateManyUserInput | DashboardCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ClinicUpsertWithoutUsersInput = {
    update: XOR<ClinicUpdateWithoutUsersInput, ClinicUncheckedUpdateWithoutUsersInput>
    create: XOR<ClinicCreateWithoutUsersInput, ClinicUncheckedCreateWithoutUsersInput>
    where?: ClinicWhereInput
  }

  export type ClinicUpdateToOneWithWhereWithoutUsersInput = {
    where?: ClinicWhereInput
    data: XOR<ClinicUpdateWithoutUsersInput, ClinicUncheckedUpdateWithoutUsersInput>
  }

  export type ClinicUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    providers?: ProviderUpdateManyWithoutClinicNestedInput
    metrics?: MetricValueUpdateManyWithoutClinicNestedInput
    goals?: GoalUpdateManyWithoutClinicNestedInput
  }

  export type ClinicUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    providers?: ProviderUncheckedUpdateManyWithoutClinicNestedInput
    metrics?: MetricValueUncheckedUpdateManyWithoutClinicNestedInput
    goals?: GoalUncheckedUpdateManyWithoutClinicNestedInput
  }

  export type DashboardUpsertWithWhereUniqueWithoutUserInput = {
    where: DashboardWhereUniqueInput
    update: XOR<DashboardUpdateWithoutUserInput, DashboardUncheckedUpdateWithoutUserInput>
    create: XOR<DashboardCreateWithoutUserInput, DashboardUncheckedCreateWithoutUserInput>
  }

  export type DashboardUpdateWithWhereUniqueWithoutUserInput = {
    where: DashboardWhereUniqueInput
    data: XOR<DashboardUpdateWithoutUserInput, DashboardUncheckedUpdateWithoutUserInput>
  }

  export type DashboardUpdateManyWithWhereWithoutUserInput = {
    where: DashboardScalarWhereInput
    data: XOR<DashboardUpdateManyMutationInput, DashboardUncheckedUpdateManyWithoutUserInput>
  }

  export type DashboardScalarWhereInput = {
    AND?: DashboardScalarWhereInput | DashboardScalarWhereInput[]
    OR?: DashboardScalarWhereInput[]
    NOT?: DashboardScalarWhereInput | DashboardScalarWhereInput[]
    id?: StringFilter<"Dashboard"> | string
    name?: StringFilter<"Dashboard"> | string
    isDefault?: BoolFilter<"Dashboard"> | boolean
    layoutConfig?: JsonNullableFilter<"Dashboard">
    createdAt?: DateTimeFilter<"Dashboard"> | Date | string
    updatedAt?: DateTimeFilter<"Dashboard"> | Date | string
    userId?: StringFilter<"Dashboard"> | string
  }

  export type ClinicCreateWithoutProvidersInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutClinicInput
    metrics?: MetricValueCreateNestedManyWithoutClinicInput
    goals?: GoalCreateNestedManyWithoutClinicInput
  }

  export type ClinicUncheckedCreateWithoutProvidersInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutClinicInput
    metrics?: MetricValueUncheckedCreateNestedManyWithoutClinicInput
    goals?: GoalUncheckedCreateNestedManyWithoutClinicInput
  }

  export type ClinicCreateOrConnectWithoutProvidersInput = {
    where: ClinicWhereUniqueInput
    create: XOR<ClinicCreateWithoutProvidersInput, ClinicUncheckedCreateWithoutProvidersInput>
  }

  export type MetricValueCreateWithoutProviderInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinition: MetricDefinitionCreateNestedOneWithoutMetricsInput
    clinic?: ClinicCreateNestedOneWithoutMetricsInput
    dataSource?: DataSourceCreateNestedOneWithoutMetricsInput
  }

  export type MetricValueUncheckedCreateWithoutProviderInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
    dataSourceId?: string | null
  }

  export type MetricValueCreateOrConnectWithoutProviderInput = {
    where: MetricValueWhereUniqueInput
    create: XOR<MetricValueCreateWithoutProviderInput, MetricValueUncheckedCreateWithoutProviderInput>
  }

  export type MetricValueCreateManyProviderInputEnvelope = {
    data: MetricValueCreateManyProviderInput | MetricValueCreateManyProviderInput[]
    skipDuplicates?: boolean
  }

  export type GoalCreateWithoutProviderInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinition: MetricDefinitionCreateNestedOneWithoutGoalsInput
    clinic?: ClinicCreateNestedOneWithoutGoalsInput
  }

  export type GoalUncheckedCreateWithoutProviderInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
  }

  export type GoalCreateOrConnectWithoutProviderInput = {
    where: GoalWhereUniqueInput
    create: XOR<GoalCreateWithoutProviderInput, GoalUncheckedCreateWithoutProviderInput>
  }

  export type GoalCreateManyProviderInputEnvelope = {
    data: GoalCreateManyProviderInput | GoalCreateManyProviderInput[]
    skipDuplicates?: boolean
  }

  export type ClinicUpsertWithoutProvidersInput = {
    update: XOR<ClinicUpdateWithoutProvidersInput, ClinicUncheckedUpdateWithoutProvidersInput>
    create: XOR<ClinicCreateWithoutProvidersInput, ClinicUncheckedCreateWithoutProvidersInput>
    where?: ClinicWhereInput
  }

  export type ClinicUpdateToOneWithWhereWithoutProvidersInput = {
    where?: ClinicWhereInput
    data: XOR<ClinicUpdateWithoutProvidersInput, ClinicUncheckedUpdateWithoutProvidersInput>
  }

  export type ClinicUpdateWithoutProvidersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutClinicNestedInput
    metrics?: MetricValueUpdateManyWithoutClinicNestedInput
    goals?: GoalUpdateManyWithoutClinicNestedInput
  }

  export type ClinicUncheckedUpdateWithoutProvidersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutClinicNestedInput
    metrics?: MetricValueUncheckedUpdateManyWithoutClinicNestedInput
    goals?: GoalUncheckedUpdateManyWithoutClinicNestedInput
  }

  export type MetricValueUpsertWithWhereUniqueWithoutProviderInput = {
    where: MetricValueWhereUniqueInput
    update: XOR<MetricValueUpdateWithoutProviderInput, MetricValueUncheckedUpdateWithoutProviderInput>
    create: XOR<MetricValueCreateWithoutProviderInput, MetricValueUncheckedCreateWithoutProviderInput>
  }

  export type MetricValueUpdateWithWhereUniqueWithoutProviderInput = {
    where: MetricValueWhereUniqueInput
    data: XOR<MetricValueUpdateWithoutProviderInput, MetricValueUncheckedUpdateWithoutProviderInput>
  }

  export type MetricValueUpdateManyWithWhereWithoutProviderInput = {
    where: MetricValueScalarWhereInput
    data: XOR<MetricValueUpdateManyMutationInput, MetricValueUncheckedUpdateManyWithoutProviderInput>
  }

  export type GoalUpsertWithWhereUniqueWithoutProviderInput = {
    where: GoalWhereUniqueInput
    update: XOR<GoalUpdateWithoutProviderInput, GoalUncheckedUpdateWithoutProviderInput>
    create: XOR<GoalCreateWithoutProviderInput, GoalUncheckedCreateWithoutProviderInput>
  }

  export type GoalUpdateWithWhereUniqueWithoutProviderInput = {
    where: GoalWhereUniqueInput
    data: XOR<GoalUpdateWithoutProviderInput, GoalUncheckedUpdateWithoutProviderInput>
  }

  export type GoalUpdateManyWithWhereWithoutProviderInput = {
    where: GoalScalarWhereInput
    data: XOR<GoalUpdateManyMutationInput, GoalUncheckedUpdateManyWithoutProviderInput>
  }

  export type MetricValueCreateWithoutMetricDefinitionInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clinic?: ClinicCreateNestedOneWithoutMetricsInput
    provider?: ProviderCreateNestedOneWithoutMetricsInput
    dataSource?: DataSourceCreateNestedOneWithoutMetricsInput
  }

  export type MetricValueUncheckedCreateWithoutMetricDefinitionInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId?: string | null
    providerId?: string | null
    dataSourceId?: string | null
  }

  export type MetricValueCreateOrConnectWithoutMetricDefinitionInput = {
    where: MetricValueWhereUniqueInput
    create: XOR<MetricValueCreateWithoutMetricDefinitionInput, MetricValueUncheckedCreateWithoutMetricDefinitionInput>
  }

  export type MetricValueCreateManyMetricDefinitionInputEnvelope = {
    data: MetricValueCreateManyMetricDefinitionInput | MetricValueCreateManyMetricDefinitionInput[]
    skipDuplicates?: boolean
  }

  export type ColumnMappingCreateWithoutMetricDefinitionInput = {
    id?: string
    columnName: string
    transformationRule?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataSource: DataSourceCreateNestedOneWithoutColumnMappingsInput
  }

  export type ColumnMappingUncheckedCreateWithoutMetricDefinitionInput = {
    id?: string
    columnName: string
    transformationRule?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataSourceId: string
  }

  export type ColumnMappingCreateOrConnectWithoutMetricDefinitionInput = {
    where: ColumnMappingWhereUniqueInput
    create: XOR<ColumnMappingCreateWithoutMetricDefinitionInput, ColumnMappingUncheckedCreateWithoutMetricDefinitionInput>
  }

  export type ColumnMappingCreateManyMetricDefinitionInputEnvelope = {
    data: ColumnMappingCreateManyMetricDefinitionInput | ColumnMappingCreateManyMetricDefinitionInput[]
    skipDuplicates?: boolean
  }

  export type GoalCreateWithoutMetricDefinitionInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinic?: ClinicCreateNestedOneWithoutGoalsInput
    provider?: ProviderCreateNestedOneWithoutGoalsInput
  }

  export type GoalUncheckedCreateWithoutMetricDefinitionInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId?: string | null
    providerId?: string | null
  }

  export type GoalCreateOrConnectWithoutMetricDefinitionInput = {
    where: GoalWhereUniqueInput
    create: XOR<GoalCreateWithoutMetricDefinitionInput, GoalUncheckedCreateWithoutMetricDefinitionInput>
  }

  export type GoalCreateManyMetricDefinitionInputEnvelope = {
    data: GoalCreateManyMetricDefinitionInput | GoalCreateManyMetricDefinitionInput[]
    skipDuplicates?: boolean
  }

  export type WidgetCreateWithoutMetricDefinitionInput = {
    id?: string
    widgetType: string
    chartType?: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    dashboard: DashboardCreateNestedOneWithoutWidgetsInput
  }

  export type WidgetUncheckedCreateWithoutMetricDefinitionInput = {
    id?: string
    widgetType: string
    chartType?: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    dashboardId: string
  }

  export type WidgetCreateOrConnectWithoutMetricDefinitionInput = {
    where: WidgetWhereUniqueInput
    create: XOR<WidgetCreateWithoutMetricDefinitionInput, WidgetUncheckedCreateWithoutMetricDefinitionInput>
  }

  export type WidgetCreateManyMetricDefinitionInputEnvelope = {
    data: WidgetCreateManyMetricDefinitionInput | WidgetCreateManyMetricDefinitionInput[]
    skipDuplicates?: boolean
  }

  export type MetricValueUpsertWithWhereUniqueWithoutMetricDefinitionInput = {
    where: MetricValueWhereUniqueInput
    update: XOR<MetricValueUpdateWithoutMetricDefinitionInput, MetricValueUncheckedUpdateWithoutMetricDefinitionInput>
    create: XOR<MetricValueCreateWithoutMetricDefinitionInput, MetricValueUncheckedCreateWithoutMetricDefinitionInput>
  }

  export type MetricValueUpdateWithWhereUniqueWithoutMetricDefinitionInput = {
    where: MetricValueWhereUniqueInput
    data: XOR<MetricValueUpdateWithoutMetricDefinitionInput, MetricValueUncheckedUpdateWithoutMetricDefinitionInput>
  }

  export type MetricValueUpdateManyWithWhereWithoutMetricDefinitionInput = {
    where: MetricValueScalarWhereInput
    data: XOR<MetricValueUpdateManyMutationInput, MetricValueUncheckedUpdateManyWithoutMetricDefinitionInput>
  }

  export type ColumnMappingUpsertWithWhereUniqueWithoutMetricDefinitionInput = {
    where: ColumnMappingWhereUniqueInput
    update: XOR<ColumnMappingUpdateWithoutMetricDefinitionInput, ColumnMappingUncheckedUpdateWithoutMetricDefinitionInput>
    create: XOR<ColumnMappingCreateWithoutMetricDefinitionInput, ColumnMappingUncheckedCreateWithoutMetricDefinitionInput>
  }

  export type ColumnMappingUpdateWithWhereUniqueWithoutMetricDefinitionInput = {
    where: ColumnMappingWhereUniqueInput
    data: XOR<ColumnMappingUpdateWithoutMetricDefinitionInput, ColumnMappingUncheckedUpdateWithoutMetricDefinitionInput>
  }

  export type ColumnMappingUpdateManyWithWhereWithoutMetricDefinitionInput = {
    where: ColumnMappingScalarWhereInput
    data: XOR<ColumnMappingUpdateManyMutationInput, ColumnMappingUncheckedUpdateManyWithoutMetricDefinitionInput>
  }

  export type ColumnMappingScalarWhereInput = {
    AND?: ColumnMappingScalarWhereInput | ColumnMappingScalarWhereInput[]
    OR?: ColumnMappingScalarWhereInput[]
    NOT?: ColumnMappingScalarWhereInput | ColumnMappingScalarWhereInput[]
    id?: StringFilter<"ColumnMapping"> | string
    columnName?: StringFilter<"ColumnMapping"> | string
    transformationRule?: StringNullableFilter<"ColumnMapping"> | string | null
    createdAt?: DateTimeFilter<"ColumnMapping"> | Date | string
    updatedAt?: DateTimeFilter<"ColumnMapping"> | Date | string
    dataSourceId?: StringFilter<"ColumnMapping"> | string
    metricDefinitionId?: StringFilter<"ColumnMapping"> | string
  }

  export type GoalUpsertWithWhereUniqueWithoutMetricDefinitionInput = {
    where: GoalWhereUniqueInput
    update: XOR<GoalUpdateWithoutMetricDefinitionInput, GoalUncheckedUpdateWithoutMetricDefinitionInput>
    create: XOR<GoalCreateWithoutMetricDefinitionInput, GoalUncheckedCreateWithoutMetricDefinitionInput>
  }

  export type GoalUpdateWithWhereUniqueWithoutMetricDefinitionInput = {
    where: GoalWhereUniqueInput
    data: XOR<GoalUpdateWithoutMetricDefinitionInput, GoalUncheckedUpdateWithoutMetricDefinitionInput>
  }

  export type GoalUpdateManyWithWhereWithoutMetricDefinitionInput = {
    where: GoalScalarWhereInput
    data: XOR<GoalUpdateManyMutationInput, GoalUncheckedUpdateManyWithoutMetricDefinitionInput>
  }

  export type WidgetUpsertWithWhereUniqueWithoutMetricDefinitionInput = {
    where: WidgetWhereUniqueInput
    update: XOR<WidgetUpdateWithoutMetricDefinitionInput, WidgetUncheckedUpdateWithoutMetricDefinitionInput>
    create: XOR<WidgetCreateWithoutMetricDefinitionInput, WidgetUncheckedCreateWithoutMetricDefinitionInput>
  }

  export type WidgetUpdateWithWhereUniqueWithoutMetricDefinitionInput = {
    where: WidgetWhereUniqueInput
    data: XOR<WidgetUpdateWithoutMetricDefinitionInput, WidgetUncheckedUpdateWithoutMetricDefinitionInput>
  }

  export type WidgetUpdateManyWithWhereWithoutMetricDefinitionInput = {
    where: WidgetScalarWhereInput
    data: XOR<WidgetUpdateManyMutationInput, WidgetUncheckedUpdateManyWithoutMetricDefinitionInput>
  }

  export type WidgetScalarWhereInput = {
    AND?: WidgetScalarWhereInput | WidgetScalarWhereInput[]
    OR?: WidgetScalarWhereInput[]
    NOT?: WidgetScalarWhereInput | WidgetScalarWhereInput[]
    id?: StringFilter<"Widget"> | string
    widgetType?: StringFilter<"Widget"> | string
    chartType?: StringNullableFilter<"Widget"> | string | null
    positionX?: IntFilter<"Widget"> | number
    positionY?: IntFilter<"Widget"> | number
    width?: IntFilter<"Widget"> | number
    height?: IntFilter<"Widget"> | number
    config?: JsonNullableFilter<"Widget">
    createdAt?: DateTimeFilter<"Widget"> | Date | string
    updatedAt?: DateTimeFilter<"Widget"> | Date | string
    dashboardId?: StringFilter<"Widget"> | string
    metricDefinitionId?: StringNullableFilter<"Widget"> | string | null
  }

  export type ColumnMappingCreateWithoutDataSourceInput = {
    id?: string
    columnName: string
    transformationRule?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinition: MetricDefinitionCreateNestedOneWithoutColumnMappingsInput
  }

  export type ColumnMappingUncheckedCreateWithoutDataSourceInput = {
    id?: string
    columnName: string
    transformationRule?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
  }

  export type ColumnMappingCreateOrConnectWithoutDataSourceInput = {
    where: ColumnMappingWhereUniqueInput
    create: XOR<ColumnMappingCreateWithoutDataSourceInput, ColumnMappingUncheckedCreateWithoutDataSourceInput>
  }

  export type ColumnMappingCreateManyDataSourceInputEnvelope = {
    data: ColumnMappingCreateManyDataSourceInput | ColumnMappingCreateManyDataSourceInput[]
    skipDuplicates?: boolean
  }

  export type MetricValueCreateWithoutDataSourceInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinition: MetricDefinitionCreateNestedOneWithoutMetricsInput
    clinic?: ClinicCreateNestedOneWithoutMetricsInput
    provider?: ProviderCreateNestedOneWithoutMetricsInput
  }

  export type MetricValueUncheckedCreateWithoutDataSourceInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
    providerId?: string | null
  }

  export type MetricValueCreateOrConnectWithoutDataSourceInput = {
    where: MetricValueWhereUniqueInput
    create: XOR<MetricValueCreateWithoutDataSourceInput, MetricValueUncheckedCreateWithoutDataSourceInput>
  }

  export type MetricValueCreateManyDataSourceInputEnvelope = {
    data: MetricValueCreateManyDataSourceInput | MetricValueCreateManyDataSourceInput[]
    skipDuplicates?: boolean
  }

  export type ColumnMappingUpsertWithWhereUniqueWithoutDataSourceInput = {
    where: ColumnMappingWhereUniqueInput
    update: XOR<ColumnMappingUpdateWithoutDataSourceInput, ColumnMappingUncheckedUpdateWithoutDataSourceInput>
    create: XOR<ColumnMappingCreateWithoutDataSourceInput, ColumnMappingUncheckedCreateWithoutDataSourceInput>
  }

  export type ColumnMappingUpdateWithWhereUniqueWithoutDataSourceInput = {
    where: ColumnMappingWhereUniqueInput
    data: XOR<ColumnMappingUpdateWithoutDataSourceInput, ColumnMappingUncheckedUpdateWithoutDataSourceInput>
  }

  export type ColumnMappingUpdateManyWithWhereWithoutDataSourceInput = {
    where: ColumnMappingScalarWhereInput
    data: XOR<ColumnMappingUpdateManyMutationInput, ColumnMappingUncheckedUpdateManyWithoutDataSourceInput>
  }

  export type MetricValueUpsertWithWhereUniqueWithoutDataSourceInput = {
    where: MetricValueWhereUniqueInput
    update: XOR<MetricValueUpdateWithoutDataSourceInput, MetricValueUncheckedUpdateWithoutDataSourceInput>
    create: XOR<MetricValueCreateWithoutDataSourceInput, MetricValueUncheckedCreateWithoutDataSourceInput>
  }

  export type MetricValueUpdateWithWhereUniqueWithoutDataSourceInput = {
    where: MetricValueWhereUniqueInput
    data: XOR<MetricValueUpdateWithoutDataSourceInput, MetricValueUncheckedUpdateWithoutDataSourceInput>
  }

  export type MetricValueUpdateManyWithWhereWithoutDataSourceInput = {
    where: MetricValueScalarWhereInput
    data: XOR<MetricValueUpdateManyMutationInput, MetricValueUncheckedUpdateManyWithoutDataSourceInput>
  }

  export type DataSourceCreateWithoutColumnMappingsInput = {
    id?: string
    name: string
    spreadsheetId: string
    sheetName: string
    lastSyncedAt?: Date | string | null
    syncFrequency: string
    connectionStatus: string
    appScriptId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueCreateNestedManyWithoutDataSourceInput
  }

  export type DataSourceUncheckedCreateWithoutColumnMappingsInput = {
    id?: string
    name: string
    spreadsheetId: string
    sheetName: string
    lastSyncedAt?: Date | string | null
    syncFrequency: string
    connectionStatus: string
    appScriptId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueUncheckedCreateNestedManyWithoutDataSourceInput
  }

  export type DataSourceCreateOrConnectWithoutColumnMappingsInput = {
    where: DataSourceWhereUniqueInput
    create: XOR<DataSourceCreateWithoutColumnMappingsInput, DataSourceUncheckedCreateWithoutColumnMappingsInput>
  }

  export type MetricDefinitionCreateWithoutColumnMappingsInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueCreateNestedManyWithoutMetricDefinitionInput
    goals?: GoalCreateNestedManyWithoutMetricDefinitionInput
    widgets?: WidgetCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionUncheckedCreateWithoutColumnMappingsInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueUncheckedCreateNestedManyWithoutMetricDefinitionInput
    goals?: GoalUncheckedCreateNestedManyWithoutMetricDefinitionInput
    widgets?: WidgetUncheckedCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionCreateOrConnectWithoutColumnMappingsInput = {
    where: MetricDefinitionWhereUniqueInput
    create: XOR<MetricDefinitionCreateWithoutColumnMappingsInput, MetricDefinitionUncheckedCreateWithoutColumnMappingsInput>
  }

  export type DataSourceUpsertWithoutColumnMappingsInput = {
    update: XOR<DataSourceUpdateWithoutColumnMappingsInput, DataSourceUncheckedUpdateWithoutColumnMappingsInput>
    create: XOR<DataSourceCreateWithoutColumnMappingsInput, DataSourceUncheckedCreateWithoutColumnMappingsInput>
    where?: DataSourceWhereInput
  }

  export type DataSourceUpdateToOneWithWhereWithoutColumnMappingsInput = {
    where?: DataSourceWhereInput
    data: XOR<DataSourceUpdateWithoutColumnMappingsInput, DataSourceUncheckedUpdateWithoutColumnMappingsInput>
  }

  export type DataSourceUpdateWithoutColumnMappingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    spreadsheetId?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    lastSyncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncFrequency?: StringFieldUpdateOperationsInput | string
    connectionStatus?: StringFieldUpdateOperationsInput | string
    appScriptId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUpdateManyWithoutDataSourceNestedInput
  }

  export type DataSourceUncheckedUpdateWithoutColumnMappingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    spreadsheetId?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    lastSyncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncFrequency?: StringFieldUpdateOperationsInput | string
    connectionStatus?: StringFieldUpdateOperationsInput | string
    appScriptId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUncheckedUpdateManyWithoutDataSourceNestedInput
  }

  export type MetricDefinitionUpsertWithoutColumnMappingsInput = {
    update: XOR<MetricDefinitionUpdateWithoutColumnMappingsInput, MetricDefinitionUncheckedUpdateWithoutColumnMappingsInput>
    create: XOR<MetricDefinitionCreateWithoutColumnMappingsInput, MetricDefinitionUncheckedCreateWithoutColumnMappingsInput>
    where?: MetricDefinitionWhereInput
  }

  export type MetricDefinitionUpdateToOneWithWhereWithoutColumnMappingsInput = {
    where?: MetricDefinitionWhereInput
    data: XOR<MetricDefinitionUpdateWithoutColumnMappingsInput, MetricDefinitionUncheckedUpdateWithoutColumnMappingsInput>
  }

  export type MetricDefinitionUpdateWithoutColumnMappingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUpdateManyWithoutMetricDefinitionNestedInput
    goals?: GoalUpdateManyWithoutMetricDefinitionNestedInput
    widgets?: WidgetUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type MetricDefinitionUncheckedUpdateWithoutColumnMappingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    goals?: GoalUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    widgets?: WidgetUncheckedUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type MetricDefinitionCreateWithoutMetricsInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columnMappings?: ColumnMappingCreateNestedManyWithoutMetricDefinitionInput
    goals?: GoalCreateNestedManyWithoutMetricDefinitionInput
    widgets?: WidgetCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionUncheckedCreateWithoutMetricsInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columnMappings?: ColumnMappingUncheckedCreateNestedManyWithoutMetricDefinitionInput
    goals?: GoalUncheckedCreateNestedManyWithoutMetricDefinitionInput
    widgets?: WidgetUncheckedCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionCreateOrConnectWithoutMetricsInput = {
    where: MetricDefinitionWhereUniqueInput
    create: XOR<MetricDefinitionCreateWithoutMetricsInput, MetricDefinitionUncheckedCreateWithoutMetricsInput>
  }

  export type ClinicCreateWithoutMetricsInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutClinicInput
    providers?: ProviderCreateNestedManyWithoutClinicInput
    goals?: GoalCreateNestedManyWithoutClinicInput
  }

  export type ClinicUncheckedCreateWithoutMetricsInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutClinicInput
    providers?: ProviderUncheckedCreateNestedManyWithoutClinicInput
    goals?: GoalUncheckedCreateNestedManyWithoutClinicInput
  }

  export type ClinicCreateOrConnectWithoutMetricsInput = {
    where: ClinicWhereUniqueInput
    create: XOR<ClinicCreateWithoutMetricsInput, ClinicUncheckedCreateWithoutMetricsInput>
  }

  export type ProviderCreateWithoutMetricsInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinic: ClinicCreateNestedOneWithoutProvidersInput
    goals?: GoalCreateNestedManyWithoutProviderInput
  }

  export type ProviderUncheckedCreateWithoutMetricsInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId: string
    goals?: GoalUncheckedCreateNestedManyWithoutProviderInput
  }

  export type ProviderCreateOrConnectWithoutMetricsInput = {
    where: ProviderWhereUniqueInput
    create: XOR<ProviderCreateWithoutMetricsInput, ProviderUncheckedCreateWithoutMetricsInput>
  }

  export type DataSourceCreateWithoutMetricsInput = {
    id?: string
    name: string
    spreadsheetId: string
    sheetName: string
    lastSyncedAt?: Date | string | null
    syncFrequency: string
    connectionStatus: string
    appScriptId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    columnMappings?: ColumnMappingCreateNestedManyWithoutDataSourceInput
  }

  export type DataSourceUncheckedCreateWithoutMetricsInput = {
    id?: string
    name: string
    spreadsheetId: string
    sheetName: string
    lastSyncedAt?: Date | string | null
    syncFrequency: string
    connectionStatus: string
    appScriptId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    columnMappings?: ColumnMappingUncheckedCreateNestedManyWithoutDataSourceInput
  }

  export type DataSourceCreateOrConnectWithoutMetricsInput = {
    where: DataSourceWhereUniqueInput
    create: XOR<DataSourceCreateWithoutMetricsInput, DataSourceUncheckedCreateWithoutMetricsInput>
  }

  export type MetricDefinitionUpsertWithoutMetricsInput = {
    update: XOR<MetricDefinitionUpdateWithoutMetricsInput, MetricDefinitionUncheckedUpdateWithoutMetricsInput>
    create: XOR<MetricDefinitionCreateWithoutMetricsInput, MetricDefinitionUncheckedCreateWithoutMetricsInput>
    where?: MetricDefinitionWhereInput
  }

  export type MetricDefinitionUpdateToOneWithWhereWithoutMetricsInput = {
    where?: MetricDefinitionWhereInput
    data: XOR<MetricDefinitionUpdateWithoutMetricsInput, MetricDefinitionUncheckedUpdateWithoutMetricsInput>
  }

  export type MetricDefinitionUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columnMappings?: ColumnMappingUpdateManyWithoutMetricDefinitionNestedInput
    goals?: GoalUpdateManyWithoutMetricDefinitionNestedInput
    widgets?: WidgetUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type MetricDefinitionUncheckedUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columnMappings?: ColumnMappingUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    goals?: GoalUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    widgets?: WidgetUncheckedUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type ClinicUpsertWithoutMetricsInput = {
    update: XOR<ClinicUpdateWithoutMetricsInput, ClinicUncheckedUpdateWithoutMetricsInput>
    create: XOR<ClinicCreateWithoutMetricsInput, ClinicUncheckedCreateWithoutMetricsInput>
    where?: ClinicWhereInput
  }

  export type ClinicUpdateToOneWithWhereWithoutMetricsInput = {
    where?: ClinicWhereInput
    data: XOR<ClinicUpdateWithoutMetricsInput, ClinicUncheckedUpdateWithoutMetricsInput>
  }

  export type ClinicUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutClinicNestedInput
    providers?: ProviderUpdateManyWithoutClinicNestedInput
    goals?: GoalUpdateManyWithoutClinicNestedInput
  }

  export type ClinicUncheckedUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutClinicNestedInput
    providers?: ProviderUncheckedUpdateManyWithoutClinicNestedInput
    goals?: GoalUncheckedUpdateManyWithoutClinicNestedInput
  }

  export type ProviderUpsertWithoutMetricsInput = {
    update: XOR<ProviderUpdateWithoutMetricsInput, ProviderUncheckedUpdateWithoutMetricsInput>
    create: XOR<ProviderCreateWithoutMetricsInput, ProviderUncheckedCreateWithoutMetricsInput>
    where?: ProviderWhereInput
  }

  export type ProviderUpdateToOneWithWhereWithoutMetricsInput = {
    where?: ProviderWhereInput
    data: XOR<ProviderUpdateWithoutMetricsInput, ProviderUncheckedUpdateWithoutMetricsInput>
  }

  export type ProviderUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinic?: ClinicUpdateOneRequiredWithoutProvidersNestedInput
    goals?: GoalUpdateManyWithoutProviderNestedInput
  }

  export type ProviderUncheckedUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: StringFieldUpdateOperationsInput | string
    goals?: GoalUncheckedUpdateManyWithoutProviderNestedInput
  }

  export type DataSourceUpsertWithoutMetricsInput = {
    update: XOR<DataSourceUpdateWithoutMetricsInput, DataSourceUncheckedUpdateWithoutMetricsInput>
    create: XOR<DataSourceCreateWithoutMetricsInput, DataSourceUncheckedCreateWithoutMetricsInput>
    where?: DataSourceWhereInput
  }

  export type DataSourceUpdateToOneWithWhereWithoutMetricsInput = {
    where?: DataSourceWhereInput
    data: XOR<DataSourceUpdateWithoutMetricsInput, DataSourceUncheckedUpdateWithoutMetricsInput>
  }

  export type DataSourceUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    spreadsheetId?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    lastSyncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncFrequency?: StringFieldUpdateOperationsInput | string
    connectionStatus?: StringFieldUpdateOperationsInput | string
    appScriptId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columnMappings?: ColumnMappingUpdateManyWithoutDataSourceNestedInput
  }

  export type DataSourceUncheckedUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    spreadsheetId?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    lastSyncedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncFrequency?: StringFieldUpdateOperationsInput | string
    connectionStatus?: StringFieldUpdateOperationsInput | string
    appScriptId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columnMappings?: ColumnMappingUncheckedUpdateManyWithoutDataSourceNestedInput
  }

  export type MetricDefinitionCreateWithoutGoalsInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueCreateNestedManyWithoutMetricDefinitionInput
    columnMappings?: ColumnMappingCreateNestedManyWithoutMetricDefinitionInput
    widgets?: WidgetCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionUncheckedCreateWithoutGoalsInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueUncheckedCreateNestedManyWithoutMetricDefinitionInput
    columnMappings?: ColumnMappingUncheckedCreateNestedManyWithoutMetricDefinitionInput
    widgets?: WidgetUncheckedCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionCreateOrConnectWithoutGoalsInput = {
    where: MetricDefinitionWhereUniqueInput
    create: XOR<MetricDefinitionCreateWithoutGoalsInput, MetricDefinitionUncheckedCreateWithoutGoalsInput>
  }

  export type ClinicCreateWithoutGoalsInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutClinicInput
    providers?: ProviderCreateNestedManyWithoutClinicInput
    metrics?: MetricValueCreateNestedManyWithoutClinicInput
  }

  export type ClinicUncheckedCreateWithoutGoalsInput = {
    id?: string
    name: string
    location: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutClinicInput
    providers?: ProviderUncheckedCreateNestedManyWithoutClinicInput
    metrics?: MetricValueUncheckedCreateNestedManyWithoutClinicInput
  }

  export type ClinicCreateOrConnectWithoutGoalsInput = {
    where: ClinicWhereUniqueInput
    create: XOR<ClinicCreateWithoutGoalsInput, ClinicUncheckedCreateWithoutGoalsInput>
  }

  export type ProviderCreateWithoutGoalsInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinic: ClinicCreateNestedOneWithoutProvidersInput
    metrics?: MetricValueCreateNestedManyWithoutProviderInput
  }

  export type ProviderUncheckedCreateWithoutGoalsInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId: string
    metrics?: MetricValueUncheckedCreateNestedManyWithoutProviderInput
  }

  export type ProviderCreateOrConnectWithoutGoalsInput = {
    where: ProviderWhereUniqueInput
    create: XOR<ProviderCreateWithoutGoalsInput, ProviderUncheckedCreateWithoutGoalsInput>
  }

  export type MetricDefinitionUpsertWithoutGoalsInput = {
    update: XOR<MetricDefinitionUpdateWithoutGoalsInput, MetricDefinitionUncheckedUpdateWithoutGoalsInput>
    create: XOR<MetricDefinitionCreateWithoutGoalsInput, MetricDefinitionUncheckedCreateWithoutGoalsInput>
    where?: MetricDefinitionWhereInput
  }

  export type MetricDefinitionUpdateToOneWithWhereWithoutGoalsInput = {
    where?: MetricDefinitionWhereInput
    data: XOR<MetricDefinitionUpdateWithoutGoalsInput, MetricDefinitionUncheckedUpdateWithoutGoalsInput>
  }

  export type MetricDefinitionUpdateWithoutGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUpdateManyWithoutMetricDefinitionNestedInput
    columnMappings?: ColumnMappingUpdateManyWithoutMetricDefinitionNestedInput
    widgets?: WidgetUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type MetricDefinitionUncheckedUpdateWithoutGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    columnMappings?: ColumnMappingUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    widgets?: WidgetUncheckedUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type ClinicUpsertWithoutGoalsInput = {
    update: XOR<ClinicUpdateWithoutGoalsInput, ClinicUncheckedUpdateWithoutGoalsInput>
    create: XOR<ClinicCreateWithoutGoalsInput, ClinicUncheckedCreateWithoutGoalsInput>
    where?: ClinicWhereInput
  }

  export type ClinicUpdateToOneWithWhereWithoutGoalsInput = {
    where?: ClinicWhereInput
    data: XOR<ClinicUpdateWithoutGoalsInput, ClinicUncheckedUpdateWithoutGoalsInput>
  }

  export type ClinicUpdateWithoutGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutClinicNestedInput
    providers?: ProviderUpdateManyWithoutClinicNestedInput
    metrics?: MetricValueUpdateManyWithoutClinicNestedInput
  }

  export type ClinicUncheckedUpdateWithoutGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutClinicNestedInput
    providers?: ProviderUncheckedUpdateManyWithoutClinicNestedInput
    metrics?: MetricValueUncheckedUpdateManyWithoutClinicNestedInput
  }

  export type ProviderUpsertWithoutGoalsInput = {
    update: XOR<ProviderUpdateWithoutGoalsInput, ProviderUncheckedUpdateWithoutGoalsInput>
    create: XOR<ProviderCreateWithoutGoalsInput, ProviderUncheckedCreateWithoutGoalsInput>
    where?: ProviderWhereInput
  }

  export type ProviderUpdateToOneWithWhereWithoutGoalsInput = {
    where?: ProviderWhereInput
    data: XOR<ProviderUpdateWithoutGoalsInput, ProviderUncheckedUpdateWithoutGoalsInput>
  }

  export type ProviderUpdateWithoutGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinic?: ClinicUpdateOneRequiredWithoutProvidersNestedInput
    metrics?: MetricValueUpdateManyWithoutProviderNestedInput
  }

  export type ProviderUncheckedUpdateWithoutGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: StringFieldUpdateOperationsInput | string
    metrics?: MetricValueUncheckedUpdateManyWithoutProviderNestedInput
  }

  export type UserCreateWithoutDashboardsInput = {
    id?: string
    email: string
    name: string
    role: string
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clinic: ClinicCreateNestedOneWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutDashboardsInput = {
    id?: string
    email: string
    name: string
    role: string
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId: string
  }

  export type UserCreateOrConnectWithoutDashboardsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDashboardsInput, UserUncheckedCreateWithoutDashboardsInput>
  }

  export type WidgetCreateWithoutDashboardInput = {
    id?: string
    widgetType: string
    chartType?: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinition?: MetricDefinitionCreateNestedOneWithoutWidgetsInput
  }

  export type WidgetUncheckedCreateWithoutDashboardInput = {
    id?: string
    widgetType: string
    chartType?: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId?: string | null
  }

  export type WidgetCreateOrConnectWithoutDashboardInput = {
    where: WidgetWhereUniqueInput
    create: XOR<WidgetCreateWithoutDashboardInput, WidgetUncheckedCreateWithoutDashboardInput>
  }

  export type WidgetCreateManyDashboardInputEnvelope = {
    data: WidgetCreateManyDashboardInput | WidgetCreateManyDashboardInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutDashboardsInput = {
    update: XOR<UserUpdateWithoutDashboardsInput, UserUncheckedUpdateWithoutDashboardsInput>
    create: XOR<UserCreateWithoutDashboardsInput, UserUncheckedCreateWithoutDashboardsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDashboardsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDashboardsInput, UserUncheckedUpdateWithoutDashboardsInput>
  }

  export type UserUpdateWithoutDashboardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinic?: ClinicUpdateOneRequiredWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutDashboardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: StringFieldUpdateOperationsInput | string
  }

  export type WidgetUpsertWithWhereUniqueWithoutDashboardInput = {
    where: WidgetWhereUniqueInput
    update: XOR<WidgetUpdateWithoutDashboardInput, WidgetUncheckedUpdateWithoutDashboardInput>
    create: XOR<WidgetCreateWithoutDashboardInput, WidgetUncheckedCreateWithoutDashboardInput>
  }

  export type WidgetUpdateWithWhereUniqueWithoutDashboardInput = {
    where: WidgetWhereUniqueInput
    data: XOR<WidgetUpdateWithoutDashboardInput, WidgetUncheckedUpdateWithoutDashboardInput>
  }

  export type WidgetUpdateManyWithWhereWithoutDashboardInput = {
    where: WidgetScalarWhereInput
    data: XOR<WidgetUpdateManyMutationInput, WidgetUncheckedUpdateManyWithoutDashboardInput>
  }

  export type DashboardCreateWithoutWidgetsInput = {
    id?: string
    name: string
    isDefault?: boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDashboardsInput
  }

  export type DashboardUncheckedCreateWithoutWidgetsInput = {
    id?: string
    name: string
    isDefault?: boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type DashboardCreateOrConnectWithoutWidgetsInput = {
    where: DashboardWhereUniqueInput
    create: XOR<DashboardCreateWithoutWidgetsInput, DashboardUncheckedCreateWithoutWidgetsInput>
  }

  export type MetricDefinitionCreateWithoutWidgetsInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueCreateNestedManyWithoutMetricDefinitionInput
    columnMappings?: ColumnMappingCreateNestedManyWithoutMetricDefinitionInput
    goals?: GoalCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionUncheckedCreateWithoutWidgetsInput = {
    id?: string
    name: string
    description: string
    dataType: string
    calculationFormula?: string | null
    category: string
    isComposite: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    metrics?: MetricValueUncheckedCreateNestedManyWithoutMetricDefinitionInput
    columnMappings?: ColumnMappingUncheckedCreateNestedManyWithoutMetricDefinitionInput
    goals?: GoalUncheckedCreateNestedManyWithoutMetricDefinitionInput
  }

  export type MetricDefinitionCreateOrConnectWithoutWidgetsInput = {
    where: MetricDefinitionWhereUniqueInput
    create: XOR<MetricDefinitionCreateWithoutWidgetsInput, MetricDefinitionUncheckedCreateWithoutWidgetsInput>
  }

  export type DashboardUpsertWithoutWidgetsInput = {
    update: XOR<DashboardUpdateWithoutWidgetsInput, DashboardUncheckedUpdateWithoutWidgetsInput>
    create: XOR<DashboardCreateWithoutWidgetsInput, DashboardUncheckedCreateWithoutWidgetsInput>
    where?: DashboardWhereInput
  }

  export type DashboardUpdateToOneWithWhereWithoutWidgetsInput = {
    where?: DashboardWhereInput
    data: XOR<DashboardUpdateWithoutWidgetsInput, DashboardUncheckedUpdateWithoutWidgetsInput>
  }

  export type DashboardUpdateWithoutWidgetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDashboardsNestedInput
  }

  export type DashboardUncheckedUpdateWithoutWidgetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type MetricDefinitionUpsertWithoutWidgetsInput = {
    update: XOR<MetricDefinitionUpdateWithoutWidgetsInput, MetricDefinitionUncheckedUpdateWithoutWidgetsInput>
    create: XOR<MetricDefinitionCreateWithoutWidgetsInput, MetricDefinitionUncheckedCreateWithoutWidgetsInput>
    where?: MetricDefinitionWhereInput
  }

  export type MetricDefinitionUpdateToOneWithWhereWithoutWidgetsInput = {
    where?: MetricDefinitionWhereInput
    data: XOR<MetricDefinitionUpdateWithoutWidgetsInput, MetricDefinitionUncheckedUpdateWithoutWidgetsInput>
  }

  export type MetricDefinitionUpdateWithoutWidgetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUpdateManyWithoutMetricDefinitionNestedInput
    columnMappings?: ColumnMappingUpdateManyWithoutMetricDefinitionNestedInput
    goals?: GoalUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type MetricDefinitionUncheckedUpdateWithoutWidgetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    dataType?: StringFieldUpdateOperationsInput | string
    calculationFormula?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isComposite?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    columnMappings?: ColumnMappingUncheckedUpdateManyWithoutMetricDefinitionNestedInput
    goals?: GoalUncheckedUpdateManyWithoutMetricDefinitionNestedInput
  }

  export type UserCreateManyClinicInput = {
    id?: string
    email: string
    name: string
    role: string
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProviderCreateManyClinicInput = {
    id?: string
    name: string
    providerType: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MetricValueCreateManyClinicInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    providerId?: string | null
    dataSourceId?: string | null
  }

  export type GoalCreateManyClinicInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    providerId?: string | null
  }

  export type UserUpdateWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dashboards?: DashboardUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dashboards?: DashboardUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProviderUpdateWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUpdateManyWithoutProviderNestedInput
    goals?: GoalUpdateManyWithoutProviderNestedInput
  }

  export type ProviderUncheckedUpdateWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metrics?: MetricValueUncheckedUpdateManyWithoutProviderNestedInput
    goals?: GoalUncheckedUpdateManyWithoutProviderNestedInput
  }

  export type ProviderUncheckedUpdateManyWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    providerType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MetricValueUpdateWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinition?: MetricDefinitionUpdateOneRequiredWithoutMetricsNestedInput
    provider?: ProviderUpdateOneWithoutMetricsNestedInput
    dataSource?: DataSourceUpdateOneWithoutMetricsNestedInput
  }

  export type MetricValueUncheckedUpdateWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MetricValueUncheckedUpdateManyWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GoalUpdateWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinition?: MetricDefinitionUpdateOneRequiredWithoutGoalsNestedInput
    provider?: ProviderUpdateOneWithoutGoalsNestedInput
  }

  export type GoalUncheckedUpdateWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GoalUncheckedUpdateManyWithoutClinicInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DashboardCreateManyUserInput = {
    id?: string
    name: string
    isDefault?: boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DashboardUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    widgets?: WidgetUpdateManyWithoutDashboardNestedInput
  }

  export type DashboardUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    widgets?: WidgetUncheckedUpdateManyWithoutDashboardNestedInput
  }

  export type DashboardUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    layoutConfig?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MetricValueCreateManyProviderInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
    dataSourceId?: string | null
  }

  export type GoalCreateManyProviderInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
  }

  export type MetricValueUpdateWithoutProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinition?: MetricDefinitionUpdateOneRequiredWithoutMetricsNestedInput
    clinic?: ClinicUpdateOneWithoutMetricsNestedInput
    dataSource?: DataSourceUpdateOneWithoutMetricsNestedInput
  }

  export type MetricValueUncheckedUpdateWithoutProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MetricValueUncheckedUpdateManyWithoutProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GoalUpdateWithoutProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinition?: MetricDefinitionUpdateOneRequiredWithoutGoalsNestedInput
    clinic?: ClinicUpdateOneWithoutGoalsNestedInput
  }

  export type GoalUncheckedUpdateWithoutProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GoalUncheckedUpdateManyWithoutProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MetricValueCreateManyMetricDefinitionInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId?: string | null
    providerId?: string | null
    dataSourceId?: string | null
  }

  export type ColumnMappingCreateManyMetricDefinitionInput = {
    id?: string
    columnName: string
    transformationRule?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataSourceId: string
  }

  export type GoalCreateManyMetricDefinitionInput = {
    id?: string
    timePeriod: string
    startDate: Date | string
    endDate: Date | string
    targetValue: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinicId?: string | null
    providerId?: string | null
  }

  export type WidgetCreateManyMetricDefinitionInput = {
    id?: string
    widgetType: string
    chartType?: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    dashboardId: string
  }

  export type MetricValueUpdateWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinic?: ClinicUpdateOneWithoutMetricsNestedInput
    provider?: ProviderUpdateOneWithoutMetricsNestedInput
    dataSource?: DataSourceUpdateOneWithoutMetricsNestedInput
  }

  export type MetricValueUncheckedUpdateWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MetricValueUncheckedUpdateManyWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ColumnMappingUpdateWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataSource?: DataSourceUpdateOneRequiredWithoutColumnMappingsNestedInput
  }

  export type ColumnMappingUncheckedUpdateWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataSourceId?: StringFieldUpdateOperationsInput | string
  }

  export type ColumnMappingUncheckedUpdateManyWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataSourceId?: StringFieldUpdateOperationsInput | string
  }

  export type GoalUpdateWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinic?: ClinicUpdateOneWithoutGoalsNestedInput
    provider?: ProviderUpdateOneWithoutGoalsNestedInput
  }

  export type GoalUncheckedUpdateWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GoalUncheckedUpdateManyWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    timePeriod?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetValue?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WidgetUpdateWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dashboard?: DashboardUpdateOneRequiredWithoutWidgetsNestedInput
  }

  export type WidgetUncheckedUpdateWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dashboardId?: StringFieldUpdateOperationsInput | string
  }

  export type WidgetUncheckedUpdateManyWithoutMetricDefinitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dashboardId?: StringFieldUpdateOperationsInput | string
  }

  export type ColumnMappingCreateManyDataSourceInput = {
    id?: string
    columnName: string
    transformationRule?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
  }

  export type MetricValueCreateManyDataSourceInput = {
    id?: string
    date: Date | string
    value: string
    sourceType: string
    sourceSheet?: string | null
    externalId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId: string
    clinicId?: string | null
    providerId?: string | null
  }

  export type ColumnMappingUpdateWithoutDataSourceInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinition?: MetricDefinitionUpdateOneRequiredWithoutColumnMappingsNestedInput
  }

  export type ColumnMappingUncheckedUpdateWithoutDataSourceInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
  }

  export type ColumnMappingUncheckedUpdateManyWithoutDataSourceInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnName?: StringFieldUpdateOperationsInput | string
    transformationRule?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
  }

  export type MetricValueUpdateWithoutDataSourceInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinition?: MetricDefinitionUpdateOneRequiredWithoutMetricsNestedInput
    clinic?: ClinicUpdateOneWithoutMetricsNestedInput
    provider?: ProviderUpdateOneWithoutMetricsNestedInput
  }

  export type MetricValueUncheckedUpdateWithoutDataSourceInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MetricValueUncheckedUpdateManyWithoutDataSourceInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    value?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceSheet?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: StringFieldUpdateOperationsInput | string
    clinicId?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WidgetCreateManyDashboardInput = {
    id?: string
    widgetType: string
    chartType?: string | null
    positionX: number
    positionY: number
    width: number
    height: number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    metricDefinitionId?: string | null
  }

  export type WidgetUpdateWithoutDashboardInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinition?: MetricDefinitionUpdateOneWithoutWidgetsNestedInput
  }

  export type WidgetUncheckedUpdateWithoutDashboardInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WidgetUncheckedUpdateManyWithoutDashboardInput = {
    id?: StringFieldUpdateOperationsInput | string
    widgetType?: StringFieldUpdateOperationsInput | string
    chartType?: NullableStringFieldUpdateOperationsInput | string | null
    positionX?: IntFieldUpdateOperationsInput | number
    positionY?: IntFieldUpdateOperationsInput | number
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    metricDefinitionId?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}