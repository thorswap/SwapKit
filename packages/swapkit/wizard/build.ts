import { buildPackage } from "../../../tools/builder";

buildPackage({ entrypoints: ["./cli.ts"], dependencies: {}, target: "node" });
