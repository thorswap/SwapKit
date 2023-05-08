import { baseAmount } from '@thorswap-lib/helpers';
import {
  AmountWithBaseDenom,
  Chain,
  FeeOption,
  FeeRate,
  FeeRates,
  Fees,
  FeeType,
  UTXO,
} from '@thorswap-lib/types';
import * as bip39 from 'bip39';
import { networks, opcodes, script } from 'bitcoinjs-lib';
import coininfo from 'coininfo';

/**
 * Minimum transaction fee
 * 1000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/bitcoin/bitcoin/blob/db88db47278d2e7208c50d16ab10cb355067d071/src/validation.h#L56
 */
const MIN_TX_FEE = 1000;
const TX_EMPTY_SIZE = 4 + 1 + 1 + 4; //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4; // 41
const TX_INPUT_PUBKEYHASH = 107;
const TX_OUTPUT_BASE = 8 + 1; //9
const TX_OUTPUT_PUBKEYHASH = 25;

export const compileMemo = (memo: string) => {
  const data = Buffer.from(memo, 'utf8'); // converts MEMO to buffer
  return script.compile([opcodes.OP_RETURN, data]); // Compile OP_RETURN script
};

export const inputBytes = (input: UTXO) => {
  return (
    TX_INPUT_BASE +
    (input.witnessUtxo?.script ? input.witnessUtxo.script.length : TX_INPUT_PUBKEYHASH)
  );
};

export const getFee = (inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number => {
  let sum =
    TX_EMPTY_SIZE +
    inputs.reduce((a, x) => a + inputBytes(x), 0) +
    inputs.length + // +1 byte for each input signature
    TX_OUTPUT_BASE +
    TX_OUTPUT_PUBKEYHASH +
    TX_OUTPUT_BASE +
    TX_OUTPUT_PUBKEYHASH;

  if (data) {
    sum += TX_OUTPUT_BASE + data.length;
  }
  const fee = sum * feeRate;
  return fee > MIN_TX_FEE ? fee : MIN_TX_FEE;
};

export const calcFees = <T, U extends unknown[]>(
  feeRates: Record<FeeOption, T>,
  calcFee: (feeRate: T, ...args: U) => AmountWithBaseDenom,
  ...args: U
): Fees => {
  return (Object.entries(feeRates) as [FeeOption, T][])
    .map(([k, v]) => [k, calcFee(v, ...args)] as const)
    .reduce<Partial<Fees>>((a, [k, v]) => ((a[k] = v), a), { type: FeeType.PerByte }) as Fees;
};

export const calcFeesAsync = <T, U extends unknown[]>(
  feeRates: Record<FeeOption, T>,
  calcFee: (feeRate: T, ...args: U) => AmountWithBaseDenom,
  ...args: U
) =>
  (Object.entries(feeRates) as [FeeOption, T][])
    .map(([k, v]) => [k, calcFee(v, ...args)] as const)
    .reduce<Partial<Fees>>((a, [k, v]) => ((a[k] = v), a), { type: FeeType.PerByte }) as Fees;

export const calcFee = (feeRate: number, memo?: string): AmountWithBaseDenom => {
  const compiledMemo = memo ? compileMemo(memo) : null;
  const fee = getFee([], feeRate, compiledMemo);
  return baseAmount(fee);
};

export const getDefaultFeesWithRates = () => {
  const rates = { ...standardFeeRates(20), [FeeOption.Fastest]: 50 };

  return {
    fees: calcFees(rates, calcFee),
    rates,
  };
};

export const getDefaultFees = (): Fees => {
  const { fees } = getDefaultFeesWithRates();
  return fees;
};

export const getNetwork = (chain: Chain) => {
  switch (chain) {
    case Chain.Bitcoin:
      return networks.bitcoin;
    case Chain.BitcoinCash:
      return coininfo.bitcoincash.main.toBitcoinJS();
    case Chain.Doge:
      // eslint-disable-next-line no-case-declarations
      const bip32 = {
        private: 0x04358394,
        public: 0x043587cf,
      };
      // eslint-disable-next-line no-case-declarations
      const test = coininfo.dogecoin.test;
      test.versions.bip32 = bip32;
      return coininfo.dogecoin.main.toBitcoinJS();
    case Chain.Litecoin:
      return coininfo.litecoin.main.toBitcoinJS();
    default:
      throw new Error('Invalid chain');
  }
};

export const singleFeeRate = (rate: FeeRate) =>
  Object.values(FeeOption).reduce<Partial<FeeRates>>((a, x) => ((a[x] = rate), a), {}) as FeeRates;

export const standardFeeRates = (rate: FeeRate): FeeRates => ({
  ...singleFeeRate(rate),
  [FeeOption.Average]: rate * 0.8,
  [FeeOption.Fastest]: rate * 2.0,
});

export const validatePhrase = (phrase: string) => bip39.validateMnemonic(phrase);
export const getSeed = (phrase: string) => {
  if (!validatePhrase(phrase)) {
    throw new Error('Invalid BIP39 phrase');
  }

  return bip39.mnemonicToSeedSync(phrase);
};
