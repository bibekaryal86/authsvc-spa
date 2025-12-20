import { THEME_MODES, Z_INDEX, ANIMATION, COLORS } from '@constants'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import { useSpinnerStore } from '@stores'
import React from 'react'

export const Spinner: React.FC = () => {
  const { isLoading } = useSpinnerStore()

  return (
    <div>
      <Backdrop sx={{ color: COLORS.BACKGROUND.LIGHT, zIndex: Z_INDEX.SPINNER }} open={isLoading}>
        <CircularProgress
          sx={{
            color: (theme) => (theme.palette.mode === THEME_MODES.LIGHT ? COLORS.PRIMARY.LIGHT : COLORS.PRIMARY.DARK),
            animationDuration: ANIMATION.DURATION.LONG,
            position: 'absolute',
          }}
          size={100}
          thickness={5}
        />
      </Backdrop>
    </div>
  )
}
