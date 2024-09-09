export interface Coin {
  readonly denom: string;
  readonly amount: string;
}

export interface EncodeObject {
  readonly typeUrl: string;
  readonly value: any;
}

export interface AminoMsg {
  readonly type: string;
  readonly value: any;
}

export interface AminoMsgSend extends AminoMsg {
  readonly type: "cosmos-sdk/MsgSend";
  readonly value: {
    /** Bech32 account address */
    readonly from_address: string;
    /** Bech32 account address */
    readonly to_address: string;
    readonly amount: readonly Coin[];
  };
}

export interface AminoConverter {
  readonly aminoType: string;
  readonly toAmino: (value: any) => any;
  readonly fromAmino: (value: any) => any;
}

/** A map from protobuf type URL to the AminoConverter implementation if supported on chain */
export type AminoConverters = Record<string, AminoConverter | "not_supported_by_chain">;

function isAminoConverter(
  converter: [string, AminoConverter | "not_supported_by_chain"],
): converter is [string, AminoConverter] {
  return typeof converter[1] !== "string";
}

/**
 * A map from Stargate message types as used in the messages's `Any` type
 * to Amino types.
 */
export class AminoTypes {
  // The map type here ensures uniqueness of the protobuf type URL in the key.
  // There is no uniqueness guarantee of the Amino type identifier in the type
  // system or constructor. Instead it's the user's responsibility to ensure
  // there is no overlap when fromAmino is called.
  private readonly register: Record<string, AminoConverter | "not_supported_by_chain">;

  public constructor(types: AminoConverters) {
    this.register = types;
  }

  public toAmino({ typeUrl, value }: EncodeObject): AminoMsg {
    const converter = this.register[typeUrl];
    if (converter === "not_supported_by_chain") {
      throw new Error(
        `The message type '${typeUrl}' cannot be signed using the Amino JSON sign mode because this is not supported by chain.`,
      );
    }
    if (!converter) {
      throw new Error(`Type URL '${typeUrl}' does not exist in the Amino message type register. `);
    }
    return {
      type: converter.aminoType,
      value: converter.toAmino(value),
    };
  }

  public fromAmino({ type, value }: AminoMsg): EncodeObject {
    const matches = Object.entries(this.register)
      .filter(isAminoConverter)
      .filter(([_typeUrl, { aminoType }]) => aminoType === type);

    if (matches.length === 0) {
      throw new Error(
        `Amino type identifier '${type}' does not exist in the Amino message type register.`,
      );
    }

    if (matches.length > 1) {
      throw new Error(
        `Multiple types are registered with Amino type identifier '${type}': '${matches
          .map(([key, _value]) => key)
          .sort()
          .join("', '")}'. Thus fromAmino cannot be performed.`,
      );
    }

    const [typeUrl, converter] = matches[0] as [string, AminoConverter];

    return { typeUrl, value: converter.fromAmino(value) };
  }
}
