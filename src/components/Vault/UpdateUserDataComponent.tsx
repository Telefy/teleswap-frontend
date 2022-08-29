/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { FC } from 'react'
import { useUpdateCakeVaultUserData } from 'state/pools/hooks'

export const UpdateUserDataComponent: FC = () => {
  useUpdateCakeVaultUserData()
  return <></>
}
