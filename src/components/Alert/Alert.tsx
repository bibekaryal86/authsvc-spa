import { INVALID_SESSION } from '@constants'
import MuiAlert, { type AlertProps } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import { useAlertStore } from '@stores'
import React, { forwardRef } from 'react'

const Alerts = forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />
})

export const Alert: React.FC = () => {
  const { isOpen, messageType, messageText, hideAlert, resetAlertState } = useAlertStore()

  const close = () => {
    hideAlert()
    setTimeout(() => resetAlertState(), 300)
  }

  const autoHideDuration = messageText === INVALID_SESSION ? 1000000 : 10000

  return isOpen && messageType && messageText ? (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar
        open={isOpen}
        autoHideDuration={autoHideDuration}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alerts onClose={close} severity={messageType} sx={{ width: '100%' }}>
          {messageText}
        </Alerts>
      </Snackbar>
    </Stack>
  ) : null
}
