export enum PackageType {
  Wallet = 'Wallets',
  Toolbox = 'Toolboxes',
  SwapKit = 'SwapKit',
}

export type CliOptions = {
  packageType: PackageType;
  packageName: string;
};
