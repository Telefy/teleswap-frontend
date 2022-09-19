/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import BigNumber from 'bignumber.js'
import { Dispatch, useMemo, memo, SetStateAction, useCallback } from 'react'
import Icon from '../../../assets/svg/teleicon.svg'
import { BIG_TEN } from 'utils/bigNumber'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { useUserEnoughTeleValidator } from 'hooks/useUserEnoughTeleValidator'
import { formatNumberDecimals } from 'functions'
import NumericalInput from 'components/NumericalInput'
import RangeSlider from 'react-bootstrap-range-slider'
import Button from 'farm-components/Button'

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

const BalanceField: React.FC<PropsType> = ({
  stakingAddress,
  stakingSymbol,
  stakingDecimals,
  lockedAmount,
  stakingMax,
  setLockedAmount,
  usedValueStaked,
  stakingTokenBalance,
}) => {
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
          <div className="box-content-item title">Tele to Lock</div>
          <div className="box-content-item">
            <img src={Icon} alt="teleicon" width={20} /> TELE
          </div>
        </div>
        <div className="apy-block">
          <div className="box-content-top">
            <div className="box-content-top-item">
              <div className="tele-input">
                <NumericalInput
                  className="token-amount-input w100"
                  value={formatNumberDecimals(lockedAmount, 5)}
                  onUserInput={handleStakeInputChange}
                />
              </div>
            </div>
            <div className="box-content-top-item">
              <div className="text-under">{`~${usedValueStaked || 0} USD`}</div>
            </div>
          </div>
        </div>
        {userNotEnoughTele && <div>{notEnoughErrorMessage}</div>}
        <div className="balance">Balance - {getFullDisplayBalance(stakingMax, stakingDecimals)}</div>
      </div>
      <div className="stake-slider">
        <RangeSlider
          value={percent}
          min={0}
          max={100}
          tooltipPlacement="top"
          tooltip="on"
          onChange={(changeEvent) => handleChangePercent(Number(changeEvent.target.value))}
        />
        <div className="slider-placeholder">
          <div>0</div>
          <div>100</div>
        </div>
      </div>
      <div className="button-group-flex mt-1">
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
    </>
  )
}

export default memo(BalanceField)
