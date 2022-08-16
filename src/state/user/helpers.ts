/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Token } from '@telefy/teleswap-core-sdk'
import { SerializedToken } from 'constants/types'
import { WrappedTokenInfo } from 'state/types'

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
    projectLink: '',
    logoURI: token instanceof WrappedTokenInfo ? token.logoURI : undefined,
  }
}

export function deserializeToken(serializedToken: SerializedToken): Token {
  if (serializedToken?.logoURI) {
    return new WrappedTokenInfo(
      {
        chainId: serializedToken.chainId,
        address: serializedToken.address,
        decimals: serializedToken.decimals,
        symbol: serializedToken.symbol!,
        name: serializedToken.name!,
        logoURI: serializedToken.logoURI,
      },
      []
    )
  }
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}
