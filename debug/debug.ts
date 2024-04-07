import { injectable, replaceable, resolver, replacement } from "../src";

const TvInterface = replaceable<
  {
    tv: string;
  },
  {
    prefix: string;
  }
>({
  name: "TvInterface",
  options: {
    prefix: "TV",
  },
});

const TvImpl = replacement({
  name: "TvImpl",
  implemented: TvInterface,
  factory: ({ options }) => {
    return {
      tv: `${options.prefix} anything`,
    };
  },
});

const vars = injectable({
  name: "vars",
  factory() {
    return {
      name: "Vars",
    } as const;
  },
});

const empty = injectable({
  name: "empty",
});

const serviceA = injectable({
  name: "serviceA",
  factory: ({ options }) => {
    return {
      printHello() {
        console.log(`Hello <${options.name}>!`);
      },
    };
  },
  options: {
    name: "Injected 1",
  },
});

const serviceAForked = serviceA.clone({
  name: "serviceAForked",
  options: {
    name: "Injected 2",
  },
});

const replacedServiceAForker = replacement({
  name: "replacedServiceAForker",
  implemented: serviceAForked,
  dependencies: {
    vars,
  },
  async factory(props) {
    return {
      printHello() {
        console.log(
          `${props.dependencies.vars.name} :: Hello <${props.options.name}>!`
        );
      },
    };
  },
});

const serviceAAlias = injectable({
  name: "serviceAAlias",
  dependencies: {
    serviceA,
    serviceAForked,
    empty,
  },
});

const sdfsdf = injectable({
  name: "sdfsdf",
  dependencies: { services: serviceAAlias, tv: TvInterface },
  factory({ dependencies }) {
    return {
      ...dependencies.services,
      ...dependencies.tv,
    };
  },
});

const replacedServices = replacement({
  name: "replacedServices",
  implemented: sdfsdf,
  async factory() {
    return {
      empty: {},
      serviceA: {
        printHello() {
          console.log(`Hello <unknown>! (serviceA)`);
        },
      },
      serviceAForked: {
        printHello() {
          console.log(`Hello <unknown>! (serviceAForked)`);
        },
      },
      tv: "Replaced TV",
    };
  },
});

async function test() {
  const {
    root: app,
    find,
    debug,
  } = await resolver({
    dependency: sdfsdf,
    replacements: [TvImpl],
  });

  console.log(debug.order);
  console.log(find(TvInterface));

  app.serviceA.printHello();
  app.serviceAForked.printHello();

  console.log(app.tv);
}

test();
