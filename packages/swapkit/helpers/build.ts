import { buildPackage } from "../../../tools/builder";
import { dependencies, devDependencies } from "./package.json";

buildPackage({ dependencies: { ...dependencies, ...devDependencies } });
