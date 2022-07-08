/* eslint-disable react/prop-types */
import Background, { BackgroundVariant } from 'farm-components/Background'
import Container, { MaxWidth } from 'farm-components/Container'
import Header from 'components/Header'
import Main from 'farm-components/Main'
import Popups from 'farm-components/Popups'
import { classNames } from 'functions'
import React, { FC } from 'react'

interface TridentHeaderProps {
  className?: string
  pattern?: BackgroundVariant
  maxWidth?: MaxWidth
  condensed?: boolean
}

export const TridentHeader: FC<TridentHeaderProps> = ({
  children,
  className,
  pattern,
  maxWidth = '7xl',
  condensed,
}) => {
  return (
    <header className="relative w-full flex flex-col justify-center items-center">
      <Background variant={pattern} />
      <Container
        maxWidth={maxWidth}
        className={classNames('flex flex-col gap-5 z-[1] p-1 lg:py-2', condensed && 'py-3', className)}
      >
        {children}
      </Container>
    </header>
  )
}

interface TridentBodyProps {
  className?: string
  maxWidth?: MaxWidth
}

export const TridentBody: FC<TridentBodyProps> = ({ children, className, maxWidth = '7xl' }) => {
  return (
    <Main>
      <Container maxWidth={maxWidth} className={classNames('flex flex-col gap-10 z-[1] p-6 lg:py-8', className)}>
        {children}
      </Container>
    </Main>
  )
}

const TridentLayout: FC = ({ children = [] }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col items-center w-full flex flex-grow">
        <div className="w-full flex-grow flex flex-col">{children}</div>
        <Popups />
      </div>
      {/* <Footer /> */}
    </div>
  )
}

export default TridentLayout
