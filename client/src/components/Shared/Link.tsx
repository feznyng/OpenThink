import { TypographyProps } from '@material-ui/core'
import React from 'react'
import { Link as LinkBase, LinkProps as LinkBaseProps, useLocation } from 'react-router-dom'
import { primaryColor } from '../../theme'
import Typography from './Typography'
    
interface LinkProps extends Partial<Omit<LinkBaseProps, 'to'>> {
  to: string | null,
  defaultStyle?: boolean
  typographyProps?: Partial<TypographyProps>
}

export default function Link({children, to, defaultStyle, typographyProps, style, ...props}: LinkProps) {
  const location = useLocation()
  return (
    <Typography
      {...typographyProps}
    >
      <LinkBase
          {...props}
          to={to ? to : location.pathname}
          style={defaultStyle ? {color: primaryColor, ...style} : {color: 'inherit', ...style}}
      >
          {children}
      </LinkBase>
    </Typography>
  )
}
