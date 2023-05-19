export enum PackageType {
  Wallet = 'Wallet',
  Toolbox = 'Toolbox',
  SwapKit = 'SwapKit',
}

export type CliOptions = {
  packageType: PackageType;
  packageName: string;
};
