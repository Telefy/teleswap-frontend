/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import BigNumber from 'bignumber.js'
import NumericalInput from 'components/NumericalInput'
import { Dispatch, useMemo, memo, SetStateAction, useCallback } from 'react'
import styled from 'styled-components'
import { BIG_TEN } from 'utils/bigNumber'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { useUserEnoughTeleValidator } from 'hooks/useUserEnoughTeleValidator'
import Icon from '../../assets/svg/teleicon.svg'
import RangeSlider from 'react-bootstrap-range-slider'
import Button from 'farm-components/Button'
import { useIsDarkMode } from 'state/user/hooks'

interface PropsType {
  stakingAddress: string
  stakingSymbol: string
  stakingDecimals: number
  lockedAmount: string
  stakingMax: BigNumber
  setLockedAmount: Dispatch<SetStateAction<string>>
  usedValueStaked: number | undefined
  stakingTokenBalance: BigNumber
}

const LockedBalanceInputComponent: React.FC<PropsType> = ({
  stakingAddress,
  stakingSymbol,
  stakingDecimals,
  lockedAmount,
  stakingMax,
  setLockedAmount,
  usedValueStaked,
  stakingTokenBalance,
}) => {
  const darkMode = useIsDarkMode()
  const { userNotEnoughTele, notEnoughErrorMessage } = useUserEnoughTeleValidator(lockedAmount, stakingTokenBalance)

  const percent = useMemo(() => {
    const amount = new BigNumber(lockedAmount)
    if (amount.gt(0)) {
      const convertedInput = amount.multipliedBy(BIG_TEN.pow(stakingDecimals))
      const percentage = Math.floor(convertedInput.dividedBy(stakingMax).multipliedBy(100).toNumber())
      return percentage > 100 ? 100 : percentage
    }
    return 0
  }, [lockedAmount, stakingDecimals, stakingMax])

  const handleStakeInputChange = useCallback(
    (input: string) => {
      setLockedAmount(input)
    },
    [setLockedAmount]
  )

  const handleChangePercent = useCallback(
    (sliderPercent: number) => {
      if (sliderPercent > 0) {
        const percentageOfStakingMax = stakingMax.dividedBy(100).multipliedBy(sliderPercent)
        const amountToStake = getFullDisplayBalance(percentageOfStakingMax, stakingDecimals, stakingDecimals)

        setLockedAmount(amountToStake)
      } else {
        setLockedAmount('')
      }
    },
    [stakingMax, setLockedAmount, stakingDecimals]
  )

  return (
    <>
      <div className="flexiblecard-content">
        <div className="box-content">
          <div className="box-content-item">Add {stakingSymbol} to Lock</div>
          {/* <div className="box-content-item">
          <img src={Icon} alt="teleicon" width={20} /> TELE
        </div> */}
        </div>
        <div className="apy-block">
          <div className="locked-content-top">
            <div className="locked-content-top-item">
              <img src={Icon} alt="teleicon" width={20} /> {stakingSymbol}
            </div>
            <div className="locked-content-right-item">
              <NumericalInput
                className="token-amount-input w100"
                value={lockedAmount}
                onUserInput={handleStakeInputChange}
              />
              <div>
                <div className="text-under">{`~${usedValueStaked || 0} USD`}</div>
                {userNotEnoughTele && <div className="text-under bold">{notEnoughErrorMessage}</div>}
              </div>
            </div>
          </div>
        </div>
        {/* <div className="balance">Balance - 197595.066</div> */}
      </div>
      <div className="stake-slider2">
        <RangeSlider
          value={percent}
          min={0}
          max={100}
          tooltipPlacement="top"
          tooltip="on"
          onChange={(changeEvent) => handleChangePercent(Number(changeEvent.target.value))}
        />
        <div className="slider-placeholder mb-1">
          <div>0</div>
          <div>100</div>
        </div>
        <div className={darkMode ? 'divider-dark' : 'divider-light'}></div>
        <div className="button-group-flex2">
          <div>
            <Button className={percent === 25 ? 'bg-purple' : ''} onClick={() => handleChangePercent(25)}>
              25%
            </Button>
          </div>
          <div>
            <Button className={percent === 50 ? 'bg-purple' : ''} onClick={() => handleChangePercent(50)}>
              50%
            </Button>
          </div>
          <div>
            <Button className={percent === 75 ? 'bg-purple' : ''} onClick={() => handleChangePercent(75)}>
              75%
            </Button>
          </div>
          <div>
            <Button className={percent === 100 ? 'bg-purple' : ''} onClick={() => handleChangePercent(100)}>
              MAX
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(LockedBalanceInputComponent)
