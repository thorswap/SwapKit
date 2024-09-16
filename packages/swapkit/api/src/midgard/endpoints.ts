import { AssetValue, BaseDecimal, Chain, RequestClient, SwapKitNumber } from "@swapkit/helpers";
import type {
  BorrowerDetails,
  MemberDetailsMayachain,
  MemberDetailsThorchain,
  SaverDetails,
  THORNameDetails,
} from "./types";

const thorchainMidgardBaseUrl = "https://midgard.ninerealms.com";
const mayachainMidgardBaseUrl = "https://midgard.mayachain.info";

function getNameServiceBaseUrl(isMayachain = false) {
  return isMayachain
    ? `${mayachainMidgardBaseUrl}/v2/mayaname`
    : `${thorchainMidgardBaseUrl}/v2/thorname`;
}

export function getBorrowerDetailRaw(address: string, isMayachain = false) {
  return RequestClient.get<BorrowerDetails>(
    `${isMayachain ? mayachainMidgardBaseUrl : thorchainMidgardBaseUrl}/v2/borrower/${address}`,
  );
}

export function getSaverDetailRaw(address: string, isMayachain = false) {
  return RequestClient.get<SaverDetails>(
    `${isMayachain ? mayachainMidgardBaseUrl : thorchainMidgardBaseUrl}/v2/saver/${address}`,
  );
}

export function getLiquidityPositionRaw<T extends boolean = false>(
  address: string,
  isMayachain?: T,
) {
  return RequestClient.get<T extends true ? MemberDetailsMayachain : MemberDetailsThorchain>(
    `${isMayachain ? mayachainMidgardBaseUrl : thorchainMidgardBaseUrl}/v2/member/${address}`,
  );
}

export function getNameDetails(name: string, isMayachain = false) {
  return RequestClient.get<THORNameDetails>(`${getNameServiceBaseUrl(isMayachain)}/lookup/${name}`);
}

export function getNamesByAddress(address: string, isMayachain = false) {
  return RequestClient.get<THORNameDetails>(
    `${getNameServiceBaseUrl(isMayachain)}/rlookup/${address}`,
  );
}

export function getNamesByOwner(address: string, isMayachain = false) {
  return RequestClient.get<THORNameDetails>(
    `${getNameServiceBaseUrl(isMayachain)}/owner/${address}`,
  );
}

export async function getBorrowerDetail(address: string, isMayachain = false) {
  const rawBorrowerDetail = await getBorrowerDetailRaw(address, isMayachain);

  return rawBorrowerDetail.pools.map((rawPosition) => ({
    collateral_deposited: AssetValue.from({
      asset: rawPosition.collateral_asset,
      value: rawPosition.collateral_deposited,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    collateral_withdrawn: AssetValue.from({
      asset: rawPosition.collateral_asset,
      value: rawPosition.collateral_withdrawn,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    debt_issued_tor: SwapKitNumber.fromBigInt(
      BigInt(rawPosition.debt_issued_tor),
      BaseDecimal.THOR,
    ),
    debt_repaid_tor: SwapKitNumber.fromBigInt(
      BigInt(rawPosition.debt_repaid_tor),
      BaseDecimal.THOR,
    ),
    last_open_loan_timestamp: rawPosition.last_open_loan_timestamp,
    last_repay_loan_timestamp: rawPosition.last_repay_loan_timestamp,
    target_assets: rawPosition.target_assets.map((asset) => AssetValue.from({ asset })),
  }));
}

export async function getSaverDetail(address: string, isMayachain = false) {
  const rawSaverPositions = await getSaverDetailRaw(address, isMayachain);

  return rawSaverPositions.pools.map((rawPosition) => ({
    assetRegisteredAddress: rawPosition.assetAddress,
    assetAdded: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetAdded,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    assetDeposit: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetDeposit,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    assetRedeem: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetRedeem,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    assetWithdrawn: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetWithdrawn,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    dateLastAdded: rawPosition.dateLastAdded,
    dateFirstAdded: rawPosition.dateFirstAdded,
  }));
}

export async function getLiquidityPosition(address: string, isMayachain = false) {
  const rawLiquidityPositions = await getLiquidityPositionRaw(address, isMayachain);

  return rawLiquidityPositions.pools.map((rawPosition) => ({
    assetRegisteredAddress: rawPosition.assetAddress,
    asset: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetAdded,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    assetPending: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetPending,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    assetWithdrawn: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetWithdrawn,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    [`${isMayachain ? "cacao" : "rune"}RegisteredAddress`]: rawPosition.runeAddress,
    [`${isMayachain ? "cacao" : "rune"}`]: AssetValue.from({
      asset: "THOR.RUNE",
      value: rawPosition.runeAdded,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    [`${isMayachain ? "cacao" : "rune"}Pending`]: AssetValue.from({
      asset: "THOR.RUNE",
      value: rawPosition.runePending,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    [`${isMayachain ? "cacao" : "rune"}Withdrawn`]: AssetValue.from({
      asset: "THOR.RUNE",
      value: rawPosition.runeWithdrawn,
      fromBaseDecimal: BaseDecimal.THOR,
    }),
    poolShare: new SwapKitNumber(rawPosition.liquidityUnits).div(rawPosition.pool),
    dateLastAdded: rawPosition.dateLastAdded,
    dateFirstAdded: rawPosition.dateFirstAdded,
  }));
}

const getMidgardMethodsForProtocol = (chain: Chain.THORChain | Chain.Maya) => ({
  getBorrowerDetail: (address: string) => getBorrowerDetail(address, chain === Chain.Maya),
  getBorrowerDetailRaw: (address: string) => getBorrowerDetailRaw(address, chain === Chain.Maya),
  getSaversDetail: (address: string) => getSaverDetail(address, chain === Chain.Maya),
  getSaverDetailRaw: (address: string) => getSaverDetailRaw(address, chain === Chain.Maya),
  getLiquidityPosition: (address: string) => getLiquidityPosition(address, chain === Chain.Maya),
  getLiquidityPositionRaw: (address: string) =>
    getLiquidityPositionRaw(address, chain === Chain.Maya),
  getNameDetails: (name: string) => getNameDetails(name, chain === Chain.Maya),
  getNamesByAddress: (address: string) => getNamesByAddress(address, chain === Chain.Maya),
  getNamesByOwner: (address: string) => getNamesByOwner(address, chain === Chain.Maya),
});

export const thorchainMidgard = getMidgardMethodsForProtocol(Chain.THORChain);
export const mayachainMidgard = getMidgardMethodsForProtocol(Chain.Maya);
