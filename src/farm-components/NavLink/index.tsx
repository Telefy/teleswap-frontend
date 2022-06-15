/* eslint-disable react/prop-types */
import React, { Children } from 'react'

// @ts-ignore TYPE NEEDS FIXING
const NavLink = ({ children, exact = false, activeClassName = 'text-high-emphesis', ...props }) => {
  const child = Children.only(children)
  const childClassName = child.props.className || ''

  // pages/index.js will be matched via props.href
  // pages/about.js will be matched via props.href
  // pages/[slug].js will be matched via props.as

  const isActive = true

  const className = isActive ? `${childClassName} ${activeClassName}`.trim() : childClassName

  return (
    <a href={props.href} {...props}>
      {React.cloneElement(child, {
        className: className || null,
      })}
    </a>
  )
}

export default NavLink
