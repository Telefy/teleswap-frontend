/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { useMemo, memo } from 'react'
import { getVaultPosition, VaultPosition } from 'utils/telePool'
import { useVaultApy } from 'hooks/useVaultApy'
import { useUSDCTeleAmount } from 'hooks/useUSDCPrice'
import isUndefinedOrNull from 'utils/isUndefinedOrNull'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import useUserDataInVaultPresenter from 'hooks/useUserDataInVaultPresenter'
import { LockedStakingApyPropsType } from 'constants/types'
import LockedActions from './LockedModal/LockedActions'
import BurningCountDown from './LockedModal/BurningCountDown'

const LockedApyComponent: React.FC<LockedStakingApyPropsType> = ({ stakingToken, stakingTokenBalance, userData }) => {
  const position = useMemo(
    () =>
      getVaultPosition({
        userShares: userData?.userShares,
        locked: userData?.locked,
        lockEndTime: userData?.lockEndTime,
      }),
    [userData]
  )

  const currentLockedAmountAsBigNumber = useMemo(() => {
    return userData?.balance?.cakeAsBigNumber
  }, [userData?.balance?.cakeAsBigNumber])

  const currentLockedAmount = getBalanceNumber(currentLockedAmountAsBigNumber)

  const usdValueStaked = useUSDCTeleAmount(currentLockedAmount)

  const { weekDuration, lockEndDate, secondDuration, remainingTime } = useUserDataInVaultPresenter({
    lockStartTime: userData?.lockStartTime,
    lockEndTime: userData?.lockEndTime,
  })

  const { lockedApy, boostFactor } = useVaultApy({ duration: secondDuration })

  // earningTokenBalance includes overdue fee if any
  const earningTokenBalance = useMemo(() => {
    return getBalanceNumber(currentLockedAmountAsBigNumber.minus(userData?.teleAtLastUserAction))
  }, [currentLockedAmountAsBigNumber, userData?.teleAtLastUserAction])
  return (
    <>
      <div className="tele-lock-unlock-block">
        <div className="tele-lock-unlock-block-item">
          <div className="inner-title">TELE Locked</div>
          <div className="locked-value">{currentLockedAmount}</div>
          <div className="bottom-value">~{usdValueStaked} USD</div>
        </div>
        <div className="tele-lock-unlock-block-item">
          <div className="inner-title">Unlocks In</div>
          <div className="locked-value">{position >= VaultPosition.LockedEnd ? 'Unlocked' : remainingTime}</div>
          <div className="bottom-value">{`On ${lockEndDate}`}</div>
        </div>
      </div>
      <LockedActions
        userShares={userData?.userShares}
        locked={userData?.locked}
        lockEndTime={userData?.lockEndTime}
        lockStartTime={userData?.lockStartTime}
        stakingToken={stakingToken}
        stakingTokenBalance={stakingTokenBalance}
        lockedAmount={currentLockedAmountAsBigNumber}
      />

      <div className="apy-block2">
        <div className="box-content-top">
          {![VaultPosition.LockedEnd, VaultPosition.AfterBurning].includes(position) && (
            <div className="box-content-top-item">
              <div>APY :</div> <div className="bold">{parseFloat(lockedApy).toFixed(2)}%</div>
            </div>
          )}
          <div className="box-content-top-item">
            <div>Lock Duration : </div> <div className="bold">{weekDuration}</div>
          </div>
          {![VaultPosition.LockedEnd, VaultPosition.AfterBurning].includes(position) && (
            <div className="box-content-top-item">
              <div>Yield Boost : </div> <div className="bold">{parseFloat(boostFactor.toString()).toFixed(2)}x</div>
            </div>
          )}
          <div className="box-content-top-item">
            <div>Recent TELE Profit : </div> <div className="bold">{earningTokenBalance.toFixed(5)}</div>
          </div>
          {position === VaultPosition.LockedEnd && (
            <div className="box-content-top-item">
              <div>After Burning In : </div>{' '}
              <div className="bold">
                <BurningCountDown lockEndTime={userData?.lockEndTime} />
              </div>
            </div>
          )}
          {position === VaultPosition.AfterBurning && (
            <div className="box-content-top-item">
              <div>After burning : </div>{' '}
              <div className="bold">
                {isUndefinedOrNull(userData?.currentOverdueFee)
                  ? '-'
                  : `${getFullDisplayBalance(userData?.currentOverdueFee, 18, 5)} Burned`}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default memo(LockedApyComponent)
