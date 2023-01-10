export enum PackageType {
  Common = 'common',
}

export type CliOptions = {
  packageType: PackageType;
  packageName: string;
};
