import type { Item } from '@inkkit/ink-quicksearch-input';
import QuickSearch from '@inkkit/ink-quicksearch-input';
import { PancakeswapETHList } from '@coinmasters/tokens';
import React from 'react';
import terminalSize from 'terminal-size';

import type { SwapSelectItem } from './Swap.js';

type SelectTokenProps = {
  setNav: (nav: SwapSelectItem['value'] | 'swapmenu') => void;
} & (
  | {
      type: 'from';
      setFrom: (from: string) => void;
      setTo: (to: string) => void;
    }
  | {
      type: 'to';
      selectedFrom: string;
      setTo: (to: string) => void;
    }
);

const SelectToken = (props: SelectTokenProps) => {
  const { type, setNav } = props;
  const tokenLists = [PancakeswapETHList];

  const tokenList: Set<Item> = new Set();

  if (type === 'from') {
    for (const token in tokenLists) {
      tokenLists[token]!.tokens.forEach((item) => {
        tokenList.add({ label: item.identifier.split('-')[0]!, value: item.identifier });
      });
    }
  } else {
    for (const token in tokenLists) {
      tokenLists[token]!.tokens.forEach((item) => {
        if (item.identifier !== props.selectedFrom) {
          tokenList.add({ label: item.identifier.split('-')[0]!, value: item.identifier });
        }
      });
    }
  }

  return (
    <>
      <QuickSearch
        items={[...tokenList]}
        limit={terminalSize().rows - 8}
        onSelect={(item) => {
          if (type === 'to') props.setTo(item.value!.toString());
          else {
            props.setFrom(item.value!.toString());
            props.setTo('');
          }
          setNav('swapmenu');
        }}
      />
    </>
  );
};

export default SelectToken;
