import { getTokenLogoURL } from './../components/CurrencyLogo/index'
import { Currency, Token } from '@telefy/teleswap-core-sdk'
import { useCallback, useState } from 'react'
import { useActiveWeb3React } from 'hooks/web3'

export default function useAddTokenToMetamask(currencyToAdd: Currency | undefined): {
  addToken: () => void
  success: boolean | undefined
} {
  const { library } = useActiveWeb3React()

  const token: Token | undefined = currencyToAdd?.wrapped

  const [success, setSuccess] = useState<boolean | undefined>()

  const addToken = useCallback(() => {
    if (library && library.provider.isMetaMask && library.provider.request && token) {
      library.provider
        .request({
          method: 'wallet_watchAsset',
          params: {
            //@ts-ignore // need this for incorrect ethers provider type
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
              image:
                token.address.toLowerCase() == '0xf1e345ea7c33fd6c05f5512a780eb5839ee31674'
                  ? 'https://telefy.finance/assets/Images/telecoin.svg'
                  : getTokenLogoURL(token.address),
            },
          },
        })
        .then((success) => {
          setSuccess(success)
        })
        .catch(() => setSuccess(false))
    } else {
      setSuccess(false)
    }
  }, [library, token])

  return { addToken, success }
}
