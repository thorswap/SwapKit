import { base64ToBech32, bech32ToBase64 } from './addressFormat.ts';

export const createDefaultRegistry = async () => {
  const types = await import('../thorchainUtils/types/proto/MsgCompiled.ts');
  const { Registry } = await import('@cosmjs/proto-signing');
  const { defaultRegistryTypes } = await import('@cosmjs/stargate');

  return new Registry([
    ...defaultRegistryTypes,
    ['/types.MsgSend', { ...types.default.types.MsgSend }],
    ['/types.MsgDeposit', { ...types.default.types.MsgDeposit }],
  ]);
};

export const createDefaultAminoTypes = async () => {
  const { AminoTypes } = await import('@cosmjs/stargate');

  return new AminoTypes({
    '/types.MsgSend': {
      aminoType: 'thorchain/MsgSend',
      toAmino: (params: any) => ({
        from_address: base64ToBech32(params.fromAddress),
        to_address: base64ToBech32(params.toAddress),
        amount: [...params.amount],
      }),
      fromAmino: (params: any) => ({
        fromAddress: bech32ToBase64(params.from_address),
        toAddress: bech32ToBase64(params.to_address),
        amount: [...params.amount],
      }),
    },
    '/types.MsgDeposit': {
      aminoType: 'thorchain/MsgDeposit',
      toAmino: (params: any) => ({
        signer: base64ToBech32(params.signer),
        memo: params.memo,
        coins: [...params.coins],
      }),
      fromAmino: (params: any) => ({
        signer: bech32ToBase64(params.signer),
        memo: params.memo,
        coins: [...params.coins],
      }),
    },
  });
};
