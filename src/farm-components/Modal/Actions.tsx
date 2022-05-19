/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-empty-interface */
import React, { FC } from 'react'

export interface ModalActionsProps {}

const ModalActions: FC<ModalActionsProps> = ({ children }) => {
  return <div className="flex justify-end gap-4 items-center">{children}</div>
}

export default ModalActions
